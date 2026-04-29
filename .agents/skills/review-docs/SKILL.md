---
name: review-docs
description: Verify library/framework syntax, API usage, deprecated APIs, and version freshness using Context7 docs. Use for files, folders, diffs, or dependency-related reviews.
---

This skill verifies whether the inspected code uses libraries and frameworks according to current documentation.

Use this skill when the user asks to:
- verify syntax against official/current docs,
- check whether APIs, hooks, components, or configuration are deprecated,
- review dependency usage in a file, folder, or diff,
- compare implementation with Context7 documentation,
- identify outdated library usage.

Do not modify files unless the user explicitly asks for fixes.

## Core Rule

Do not claim that documentation was checked unless Context7 was actually used.

If Context7 is unavailable, blocked, or does not contain the requested library, say so clearly and continue with a limited local review based only on repository files.

## Procedure

### 1. Identify inspected scope

Read the user-specified file, folder, or diff.

Identify:
- imported external libraries,
- frameworks,
- UI/component libraries,
- SDKs,
- build/config/test libraries if relevant,
- local imports separately.

Ignore purely local imports when checking external documentation.

Examples:
- external: `react`, `next`, `zod`, `@tanstack/react-query`, `lucide-react`
- local: `@/components/Button`, `../lib/utils`

### 2. Resolve versions from project files

Read dependency versions from available project files:

- `package.json`
- lockfile if available: `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, or `bun.lockb`
- framework config files when relevant, for example `next.config.ts`, `tailwind.config.ts`, `vitest.config.ts`

For each dependency, record:

- package name,
- declared version from `package.json`,
- resolved version from lockfile if available,
- whether the version is exact, ranged, workspace-based, or unknown.

If no version can be determined, mark it as `version-unknown`.

### 3. Verify syntax with Context7

For each detected external library or framework that is relevant to the inspected code:

1. Use Context7 `resolve-library-id` to find the matching library ID.
2. Use Context7 `query-docs` to retrieve relevant current documentation.
3. Compare the code against the documentation:
   - imports,
   - hooks,
   - components,
   - function signatures,
   - configuration shape,
   - recommended usage patterns,
   - deprecated APIs,
   - migration notes if available.

Prefer targeted Context7 queries over broad documentation dumps.

Good queries:
- `useForm validation resolver current API`
- `Next.js App Router route handler syntax`
- `TanStack Query useQuery options object v5`
- `Zod object validation parse safeParse`
- `shadcn/ui Button component usage`

### 4. Check version freshness

Check whether the installed or declared version appears outdated compared with the current documented stable version.

Important:
- Only report `outdated` when the newer stable version is confirmed from Context7 documentation, official docs metadata, release notes, or package metadata available through the tools.
- If the latest stable version cannot be confirmed, do not guess.
- Use `version-check-unconfirmed` when documentation was checked but version freshness could not be reliably determined.

### 5. Classify findings

Use these levels:

- `syntax-error` — code uses an API, import, configuration, or signature that does not match current docs.
- `deprecated` — code uses an API marked as deprecated or replaced.
- `outdated` — package version is confirmed to be behind the current stable version.
- `version-check-unconfirmed` — version could not be reliably compared.
- `docs-unavailable` — Context7 could not provide usable docs for the library.
- `ok` — usage matches the checked documentation.

## Output Format

Return the review in this structure:

### Summary

Briefly state whether the inspected code is:
- aligned with current docs,
- partially outdated,
- using deprecated APIs,
- using incorrect syntax,
- or could not be fully verified.

### Checked libraries

For each library, include:

- **Library:** package name
- **Detected version:** version from `package.json` or lockfile
- **Context7 library ID:** resolved ID, or `not found`
- **Docs status:** checked / unavailable / partial
- **Result:** ok / outdated / deprecated / syntax-error / version-check-unconfirmed / docs-unavailable

### Findings

For each problem, use this format:

- **Level:** outdated / deprecated / syntax-error / version-check-unconfirmed / docs-unavailable
- **File and line:** file path and line number if available
- **Library:** package or framework name
- **Current code:** current syntax or usage
- **Expected usage:** correct syntax according to checked docs
- **Reason:** why this matters
- **Docs source:** Context7 library ID and relevant docs section or URL if available
- **Suggested fix:** concrete correction or migration step

### OK items

List libraries or APIs that were checked and confirmed as correct.

Use this format:

- **Level:** ok
- **Library:** package or framework name
- **File and line:** location if relevant
- **Verified usage:** what was checked
- **Docs source:** Context7 library ID and relevant section if available

### Version update candidates

List libraries that may require version updates.

For each one:

- **Library:** package name
- **Current version:** detected version
- **Latest confirmed stable version:** version if confirmed
- **Status:** outdated / version-check-unconfirmed
- **Migration risk:** low / medium / high
- **Notes:** breaking changes or migration notes if found

### Final counts

Provide:

- number of inspected files,
- number of checked libraries,
- number of libraries with docs found,
- number of libraries with docs unavailable,
- number of `ok` results,
- number of `syntax-error` findings,
- number of `deprecated` findings,
- number of `outdated` findings,
- number of `version-check-unconfirmed` findings.

If everything is current and correct, say this explicitly.

## Review Discipline

- Do not invent documentation details.
- Do not infer latest versions without a reliable source.
- Separate confirmed findings from unconfirmed risks.
- Prefer official/current docs from Context7 over model memory.
- If the repository uses an older major version intentionally, do not recommend migration unless the user asked for upgrade advice.
- Do not request broad dependency upgrades without checking migration risk.
- Do not modify `package.json`, lockfiles, or source files unless the user explicitly asks.