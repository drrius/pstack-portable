---
name: deslop
description: Clean a code diff of narrating comments, unsupported guards, dead compatibility paths, type-bypass casts, and unrelated edits. Use before commit, for /deslop, or when a diff looks padded.
disable-model-invocation: true
---

# Deslop

Clean the current code change. This is the code-diff counterpart of **unslop**, which edits prose. For an adversarial comment review, use **no-comments**.

## Scope

Diff the working tree against the repository default branch, usually `main`. Include staged and unstaged edits. Stay inside that diff.

## What to remove or reshape

- Narrating or restating comments that the next line already says
- Unsupported guards and abnormal try/catch on trusted internal paths
- Dead compatibility branches no remaining caller needs
- Unrelated edits that landed in the same change
- `any` casts that only silence the type checker
- Nesting that an early return would flatten
- Style that disagrees with the surrounding file

## Guardrails

Keep behavior unchanged unless the diff contains a clear bug. Make the smallest focused edits. After the pass, write a concise 1-3 sentence summary of what changed and what you left alone.

## When nothing remains

If the diff is already tight, say so and stop. Do not invent cleanup.
