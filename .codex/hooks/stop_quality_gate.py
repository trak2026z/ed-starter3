#!/usr/bin/env python3
"""
Codex Stop hook: ordered quality gate.

Flow:
1. Avoid infinite Stop-hook loops.
2. Run .codex/hooks/ensure-spec-updated.py if present.
3. Run npm run typecheck if package.json has "typecheck".
4. Run unit tests if package.json has one of:
   - test:unit
   - unit
   - test

Override test command with:
CODEX_UNIT_TEST_SCRIPT="npm run test:unit"
"""

from __future__ import annotations

import json
import os
import shlex
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
    timeout: int = 180,
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


def load_package_scripts(repo_root: Path) -> dict[str, str]:
    package_json = repo_root / "package.json"

    if not package_json.exists():
        return {}

    try:
        package = json.loads(package_json.read_text(encoding="utf-8"))
    except Exception:
        return {}

    scripts = package.get("scripts", {})
    if isinstance(scripts, dict):
        return {str(k): str(v) for k, v in scripts.items()}

    return {}


def run_existing_ensure_spec_hook(repo_root: Path, payload: dict[str, Any]) -> dict[str, Any] | None:
    script = repo_root / ".codex" / "hooks" / "ensure-spec-updated.py"

    if not script.exists():
        return None

    try:
        result = run_process(
            ["python3", str(script)],
            repo_root,
            stdin_payload=payload,
            timeout=30,
        )
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


def run_quality_command(
    label: str,
    args: list[str],
    repo_root: Path,
    timeout: int,
) -> dict[str, Any] | None:
    try:
        result = run_process(args, repo_root, timeout=timeout)
    except subprocess.TimeoutExpired:
        return {
            "decision": "block",
            "reason": (
                f"{label} timed out. Do not stop yet.\n\n"
                f"Command: {' '.join(args)}\n\n"
                "Inspect the command, fix the issue, and run it again."
            ),
        }
    except FileNotFoundError:
        return {
            "decision": "block",
            "reason": (
                f"{label} could not run because the command was not found.\n\n"
                f"Command: {' '.join(args)}\n\n"
                "Ask the user how to run this quality gate in this environment."
            ),
        }
    except Exception as exc:
        return {
            "continue": True,
            "systemMessage": f"{label} hook failed internally: {exc}",
        }

    stdout = result.stdout or ""
    stderr = result.stderr or ""

    if result.returncode == 0:
        return None

    return {
        "decision": "block",
        "reason": (
            f"{label} failed. Do not stop yet.\n\n"
            f"Command: {' '.join(args)}\n\n"
            "Fix the issue below, then run the command again.\n\n"
            f"STDOUT:\n{tail(stdout)}\n\n"
            f"STDERR:\n{tail(stderr)}"
        ),
    }


def pick_unit_test_command(scripts: dict[str, str]) -> list[str] | None:
    override = os.environ.get("CODEX_UNIT_TEST_SCRIPT", "").strip()

    if override:
        return shlex.split(override)

    for script_name in ["test:unit", "unit", "test"]:
        if script_name in scripts:
            if script_name == "test":
                return ["npm", "test"]
            return ["npm", "run", script_name]

    return None


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

    scripts = load_package_scripts(repo_root)

    if "typecheck" in scripts:
        typecheck_decision = run_quality_command(
            "Typecheck",
            ["npm", "run", "typecheck"],
            repo_root,
            timeout=120,
        )
        if typecheck_decision is not None:
            emit(typecheck_decision)
            return 0

    unit_test_command = pick_unit_test_command(scripts)

    if unit_test_command is None:
        emit({
            "continue": True,
            "systemMessage": (
                "Stop quality gate passed. Typecheck was handled if configured. "
                "No unit test script found in package.json: expected one of test:unit, unit, test."
            ),
        })
        return 0

    unit_test_decision = run_quality_command(
        "Unit tests",
        unit_test_command,
        repo_root,
        timeout=180,
    )
    if unit_test_decision is not None:
        emit(unit_test_decision)
        return 0

    emit({
        "continue": True,
        "systemMessage": (
            "Stop quality gate passed: configured typecheck and unit tests succeeded."
        ),
    })
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
