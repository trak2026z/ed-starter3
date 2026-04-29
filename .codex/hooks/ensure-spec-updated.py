#!/usr/bin/env python3

import json
import subprocess
import sys
from pathlib import Path


def run(cmd: list[str], cwd: Path) -> str:
    try:
        return subprocess.check_output(
            cmd,
            cwd=cwd,
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
    except Exception:
        return ""


def git_root() -> Path:
    root = run(["git", "rev-parse", "--show-toplevel"], Path.cwd())
    return Path(root) if root else Path.cwd()


try:
    payload = json.load(sys.stdin)
except Exception:
    payload = {}

# Ochrona przed pętlą: jeżeli Codex już kontynuuje przez Stop hook,
# nie wymuszamy kolejnej kontynuacji.
if payload.get("stop_hook_active"):
    print(json.dumps({"continue": True}))
    sys.exit(0)

root = git_root()
spec_path = root / "ai" / "spec.md"

status = run(["git", "status", "--porcelain"], root)

# Brak zmian w working tree — nie przeszkadzaj.
if not status:
    print(json.dumps({"continue": True}))
    sys.exit(0)

changed_files = []
for line in status.splitlines():
    path = line[3:].strip()
    if path:
        changed_files.append(path)

# Jeśli jedyna zmiana dotyczy samego spec.md albo hooka, nie wymuszaj niczego.
non_spec_changes = [
    path for path in changed_files
    if path not in {
        "ai/spec.md",
        ".codex/hooks/ensure-spec-updated.py",
        ".codex/config.toml",
    }
]

if not non_spec_changes:
    print(json.dumps({"continue": True}))
    sys.exit(0)

# Jeśli spec.md nie istnieje albo jest pusty, wymuś jego utworzenie.
if not spec_path.exists() or not spec_path.read_text(encoding="utf-8").strip():
    print(json.dumps({
        "decision": "block",
        "reason": (
            "Before ending this turn, create ai/spec.md as a concise project handoff. "
            "Include: current goal, decisions made, changed files, tests run or still needed, "
            "risks, and next step. Do not continue feature implementation until the spec is updated."
        )
    }))
    sys.exit(0)

# Jeżeli są zmiany w kodzie, a spec.md nie jest zmieniony w working tree,
# przypomnij Codexowi, żeby zaktualizował spec.
if "ai/spec.md" not in changed_files:
    print(json.dumps({
        "decision": "block",
        "reason": (
            "Before ending this turn, update ai/spec.md with the current state of work. "
            "There are code/config changes, but ai/spec.md was not updated. "
            "Include: current goal, decisions made, changed files, tests run or still needed, "
            "risks, and next step. Keep it concise."
        )
    }))
    sys.exit(0)

print(json.dumps({"continue": True}))
