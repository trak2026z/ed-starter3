---
name: test-unit
description: Generate Vitest unit and component tests for TypeScript/React code. Use for testing public functions, hooks, utilities, and components with happy paths and edge cases.
---

This skill generates unit or component tests using Vitest for the specified code, file, or diff.

Use this skill when the user asks to:
- generate unit tests,
- add tests for a file,
- test a function, hook, utility, or React component,
- improve test coverage,
- cover happy paths and edge cases.

Do not modify files unless the user explicitly asks for test implementation.

## Core Rules

Before writing tests:

1. Read the target file.
2. Identify public functions, exported hooks, exported components, and observable behavior.
3. Check existing test patterns in the repository.
4. Check available test scripts in `package.json`.
5. Check existing test setup files if present, for example:
   - `vitest.config.ts`
   - `vitest.setup.ts`
   - `setupTests.ts`
   - existing `*.test.ts` or `*.test.tsx` files.

Do not install new dependencies unless the user explicitly approves it.

Do not claim tests passed unless they were actually run.

## Test Framework Requirements

Use Vitest.

Import from `vitest`:

```ts
import { describe, it, expect, vi } from "vitest";