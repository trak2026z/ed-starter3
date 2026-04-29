---
name: review
description: Review code for business logic correctness, edge cases, security, input validation, readability, and TypeScript strict mode. Use for code review of files, diffs, or snippets.
---

This skill performs a detailed code review of the provided code, file, or diff.

Use this skill when the user asks to:
- review a file,
- review a code snippet,
- review a git diff,
- check a change before commit,
- identify risks, regressions, missing validation, or missing tests.

Do not modify files unless the user explicitly asks for fixes.

## Review Scope

Check the code for:

1. **Business logic correctness**
   - Does the implementation match the intended behavior?
   - Are assumptions explicit?
   - Are there hidden regressions or inconsistent states?

2. **Error handling and edge cases**
   - Are empty, null, undefined, invalid, duplicated, or boundary values handled?
   - Are async errors handled?
   - Are loading, empty and failure states covered where relevant?

3. **Security**
   - Validate all external or user-controlled input.
   - Check authorization and access control assumptions.
   - Watch for unsafe redirects, injection risks, leaking sensitive data, hardcoded secrets, overly broad permissions, and unsafe logging.

4. **Readability and naming**
   - Are names clear and domain-specific?
   - Is the code easy to follow?
   - Is complexity justified?
   - Are responsibilities separated?

5. **TypeScript strict mode**
   - Avoid `any` unless explicitly justified.
   - Check nullable and optional values.
   - Prefer precise types over broad types.
   - Ensure type narrowing is correct.
   - Avoid unsafe casts.

6. **Tests and verification**
   - Identify missing unit, integration, or component tests.
   - Mention what should be tested before merging.
   - Do not claim tests passed unless they were actually run.

## Output Format

Return the review in this structure:

### Summary

Briefly state whether the code is safe to proceed, needs changes, or has blockers.

### Findings

For each issue, use this format:

- **Severity:** blocker / warning / suggestion
- **Location:** file and line/function/component if available
- **Problem:** what is wrong and why it matters
- **Suggested fix:** concrete recommendation

### What is good

If the code is good, say it clearly. Point out what is done well, for example:
- clean separation of concerns,
- good type safety,
- simple implementation,
- clear naming,
- correct error handling,
- good test coverage.

### Recommended next steps

List the smallest practical steps needed before merge or deployment.

## Severity Rules

Use severity consistently:

- **blocker** — can cause broken functionality, security risk, data loss, failed build, failed typecheck, or serious regression.
- **warning** — should be fixed before merge, but does not immediately break the system.
- **suggestion** — improvement for readability, maintainability, tests, or long-term quality.

## Review Discipline

- Do not invent missing context.
- If intent is unclear, say what assumption you are making.
- Prefer concrete examples over generic advice.
- Separate confirmed problems from hypotheses.
- Do not over-review harmless style differences.
- Do not request large refactors unless they reduce real risk.