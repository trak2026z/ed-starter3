#!/usr/bin/env python3
"""
Codex Stop hook: ordered final quality gate.

Flow:
1. Avoid infinite Stop-hook continuation loops.
2. Run existing .codex/hooks/ensure-spec-updated.py if present.
3. Run npm run typecheck.
4. If typecheck fails, return decision:block so Codex continues with a repair prompt.

Stop hooks must print JSON on stdout. Do not print debug logs to stdout.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

MAX_OUTPUT_CHARS = 6000


def emit(payload: dict[str, Any]) -> None:
    print(json.dumps(payload, ensure_ascii=False))


def tail(value: str, limit: int = MAX_OUTPUT_CHARS) -> str:
    return (value or "")[-limit:]


def repo_root_from(payload: dict[str, Any]) -> Path:
    cwd = Path(payload.get("cwd") or os.getcwd()).resolve()
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            cwd=str(cwd),
            text=True,
            capture_output=True,
            timeout=5,
        )
        if result.returncode == 0 and result.stdout.strip():
            return Path(result.stdout.strip()).resolve()
    except Exception:
        pass
    return cwd


def run_process(
    args: list[str],
    cwd: Path,
    stdin_payload: dict[str, Any] | None = None,
    timeout: int = 120,
) -> subprocess.CompletedProcess[str]:
    input_text = json.dumps(stdin_payload, ensure_ascii=False) if stdin_payload is not None else None
    return subprocess.run(
        args,
        cwd=str(cwd),
        input=input_text,
        text=True,
        capture_output=True,
        timeout=timeout,
        env={**os.environ, "CI": "1"},
    )


def run_existing_ensure_spec_hook(repo_root: Path, payload: dict[str, Any]) -> dict[str, Any] | None:
    script = repo_root / ".codex" / "hooks" / "ensure-spec-updated.py"
    if not script.exists():
        return None

    try:
        result = run_process(["python3", str(script)], repo_root, stdin_payload=payload, timeout=30)
    except subprocess.TimeoutExpired:
        return {
            "decision": "block",
            "reason": (
                "The existing ensure-spec-updated.py Stop hook timed out. "
                "Check whether ai/spec.md should be updated, then continue."
            ),
        }
    except Exception as exc:
        return {
            "continue": True,
            "systemMessage": f"ensure-spec-updated.py could not be executed: {exc}",
        }

    stdout = (result.stdout or "").strip()
    stderr = (result.stderr or "").strip()

    if result.returncode == 2:
        return {
            "decision": "block",
            "reason": stderr or "ensure-spec-updated.py requested continuation.",
        }

    if result.returncode != 0:
        return {
            "decision": "block",
            "reason": (
                "The existing ensure-spec-updated.py hook failed. Do not stop yet.\n\n"
                f"STDOUT:\n{tail(stdout)}\n\n"
                f"STDERR:\n{tail(stderr)}"
            ),
        }

    if not stdout:
        return None

    try:
        hook_response = json.loads(stdout)
    except json.JSONDecodeError:
        return {
            "continue": True,
            "systemMessage": (
                "ensure-spec-updated.py returned non-JSON stdout. "
                "Stop hooks require JSON stdout; ignoring its output."
            ),
        }

    if hook_response.get("decision") == "block" or hook_response.get("continue") is False:
        return hook_response

    return None


def run_typecheck(repo_root: Path) -> dict[str, Any]:
    if not (repo_root / "package.json").exists():
        return {
            "continue": True,
            "systemMessage": "No package.json found; skipping npm run typecheck.",
        }

    try:
        result = run_process(["npm", "run", "typecheck"], repo_root, timeout=120)
    except subprocess.TimeoutExpired:
        return {
            "decision": "block",
            "reason": (
                "npm run typecheck timed out. Do not stop yet. "
                "Inspect the typecheck command, fix the issue, and run it again."
            ),
        }
    except FileNotFoundError:
        return {
            "decision": "block",
            "reason": (
                "npm was not found, so the Stop quality gate could not run typecheck. "
                "Ask the user how to run the project quality gate in this environment."
            ),
        }
    except Exception as exc:
        return {
            "continue": True,
            "systemMessage": f"Stop typecheck hook failed internally: {exc}",
        }

    stdout = result.stdout or ""
    stderr = result.stderr or ""

    if result.returncode == 0:
        return {
            "continue": True,
            "systemMessage": "Stop quality gate passed: npm run typecheck succeeded.",
        }

    return {
        "decision": "block",
        "reason": (
            "npm run typecheck failed. Do not stop yet.\n\n"
            "Fix the TypeScript errors below. After fixing, run npm run typecheck again.\n\n"
            f"STDOUT:\n{tail(stdout)}\n\n"
            f"STDERR:\n{tail(stderr)}"
        ),
    }


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        emit({
            "continue": True,
            "systemMessage": "Stop hook received invalid JSON on stdin; skipping quality gate.",
        })
        return 0

    if payload.get("stop_hook_active"):
        emit({
            "continue": True,
            "systemMessage": (
                "Stop hook already continued this turn once; skipping blocking "
                "quality gate to avoid an infinite loop."
            ),
        })
        return 0

    repo_root = repo_root_from(payload)

    ensure_decision = run_existing_ensure_spec_hook(repo_root, payload)
    if ensure_decision is not None:
        emit(ensure_decision)
        return 0

    emit(run_typecheck(repo_root))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
