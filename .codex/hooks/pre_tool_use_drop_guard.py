#!/usr/bin/env python3
"""
Codex PreToolUse hook: block destructive database commands before Bash execution.
"""

from __future__ import annotations

import json
import re
import shlex
import sys
from typing import Any

SQL_DROP_RE = re.compile(
    r"""
    (?ix)
    \bDROP\s+
    (
        DATABASE
        |SCHEMA
        |TABLE
        |VIEW
        |MATERIALIZED\s+VIEW
        |INDEX
        |TYPE
        |FUNCTION
        |PROCEDURE
        |TRIGGER
        |EXTENSION
    )\b
    """
)

DESTRUCTIVE_DB_COMMAND_RE = re.compile(
    r"""
    (?ix)
    (
        (^|\s)dropdb(\s|$)
        |(^|\s)(rails|rake)\s+db:drop(\s|$)
        |(^|\s)prisma\s+migrate\s+reset(\s|$)
        |(^|\s)prisma\s+db\s+push\b[^\n;&|]*--force-reset\b
        |(^|\s)supabase\s+db\s+reset(\s|$)
    )
    """
)


def deny(reason: str) -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }, ensure_ascii=False))


def normalize_command(command: str) -> str:
    # Join shell line continuations: backslash + newline.
    command = command.replace(chr(92) + "\n", " ")

    # Remove SQL comments before pattern matching.
    command = re.sub(r"--[^\n]*", " ", command)
    command = re.sub(r"/\*.*?\*/", " ", command, flags=re.S)
    return command


def extract_command(payload: dict[str, Any]) -> str:
    tool_input = payload.get("tool_input") or {}
    if isinstance(tool_input, dict):
        command = tool_input.get("command")
        if isinstance(command, str):
            return command
    return ""


def looks_destructive(command: str) -> tuple[bool, str]:
    normalized = normalize_command(command)

    match = SQL_DROP_RE.search(normalized)
    if match:
        return True, (
            "Blocked destructive SQL DROP statement before execution. "
            f"Matched: {match.group(0).strip()!r}. "
            "If intentional, ask the user for explicit approval and use a safe migration/rollback plan."
        )

    match = DESTRUCTIVE_DB_COMMAND_RE.search(normalized)
    if match:
        return True, (
            "Blocked destructive database command before execution. "
            f"Matched: {match.group(0).strip()!r}. "
            "If intentional, ask the user for explicit approval and use a safe migration/rollback plan."
        )

    try:
        tokens = shlex.split(command)
    except Exception:
        tokens = []

    lowered = [token.lower() for token in tokens]
    db_clients = {"psql", "mysql", "mariadb", "sqlite3", "sqlcmd", "duckdb"}

    if "drop" in lowered and any(token in db_clients or token.endswith("/psql") for token in lowered):
        return True, (
            "Blocked a database client command containing a DROP token. "
            "Ask the user for explicit approval before destructive database changes."
        )

    return False, ""


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        deny("PreToolUse DROP guard received invalid JSON; blocking Bash command as a safety precaution.")
        return 0

    if payload.get("tool_name") != "Bash":
        return 0

    command = extract_command(payload)
    if not command:
        return 0

    blocked, reason = looks_destructive(command)
    if blocked:
        deny(reason)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
