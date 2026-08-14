# Benchmarking pstack-portable

The benchmark measures pstack uplift inside each host, rather than treating different agent products as interchangeable model wrappers. Its primary outcome is whether a hidden deterministic verifier passes after the agent edits an isolated fixture repository.

## Matrix

The default suite contains six cases, six conditions, and three repetitions, for 108 live runs:

- Cursor bare and Cursor with the pinned native pstack plugin
- Codex bare and Codex with project-local pstack-portable skills
- Claude Code bare and Claude Code with project-local pstack-portable skills

The cases cover a localized bug, a cross-module policy repair, a small feature, a behavior-preserving refactor, review precision, and comment cleanup. Every case keeps its task prompt separate from its hidden verifier, and the verifier must pass a gold artifact and fail a plausible bad artifact before the suite is runnable.

## Readiness checks

Run these before spending model capacity:

```sh
bun run bench:verify
bun run bench:preflight
bun run bench:smoke -- --dry-run
```

`bench:verify` runs the benchmark tests, checks all three CLIs, verifies the immutable Cursor plugin against the pinned upstream digest, constructs all 36 one-repetition plans, exercises every hidden verifier in both directions, and generates a sanitized readiness sample under the ignored `bench/reports/generated/` directory. It does not call a model.

Cursor keeps its subscription login when `CURSOR_DATA_DIR` and `CURSOR_CONFIG_DIR` point at fresh per-run directories, so the bare arm cannot see the installed plugin registry or Cursor rules and the native arm receives only the pinned `--plugin-dir`. `HOME` remains shared unless `CURSOR_API_KEY` is supplied, so the pilot must still reject a bare trace that activates globally installed Agent Skills. Codex retains authentication through `CODEX_HOME` while using an isolated `HOME`. This Claude Code version has no non-consuming authentication-status command, so its authentication is checked by the first approved pilot.

## Live pilot and full run

Start with one case, one repetition, and all six conditions:

```sh
bun run bench:compare -- --confirm-live --repetitions 1 --cases counter-clamp
```

Run the full 108-run default only after inspecting the pilot's traces, treatment activation, verifier results, and expected cost:

```sh
bun run bench:compare -- --confirm-live
```

Use `--conditions`, `--cases`, `--repetitions`, and `--timeout-ms` to select a controlled slice. `--model` applies one shared identifier only when every selected host accepts it; use `--cursor-model`, `--codex-model`, and `--claude-model` for host-specific controlled pairings. Raw workspaces, traces, scores, and generated reports live under ignored benchmark directories because they can contain local paths and model output.

## Reading results

Task success is the primary metric. Duration, tool calls, failed tools, and changed-file count are diagnostic evidence, not substitutes for passing the hidden verifier. A bare run with pstack evidence or an assisted run without pstack evidence is treatment-invalid and excluded from outcome rates. Compare assisted minus bare success rate within Cursor, Codex, and Claude Code separately; that difference is the pstack uplift. A cross-host model ranking requires a separate controlled model track with matched model revisions, budgets, and settings.

Do not change a fixture or hidden verifier after live collection begins. Make a new suite version instead, because changing the scoring surface invalidates comparisons with earlier runs.
