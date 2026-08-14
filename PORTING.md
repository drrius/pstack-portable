# Divergence ledger

pstack-portable derives from upstream pstack but is a native project for Agent Skills hosts, not a mirror. This file records every deliberate divergence from Cursor-native pstack and why it exists. Parity is a non-goal; honesty about capability differences is the goal.

## Capability adaptations

Upstream assumes the Cursor runtime. Canonical skills request the same outcomes through the capability contract in `skills/pstack-core/HOST_CONTRACT.md`:

| Upstream surface | Native representation | Fallback when unavailable |
| --- | --- | --- |
| Task and subagent schemas | A complete worker request with objective, ownership, permissions, isolation, verifier, stop condition, and returned evidence | Execute serially and disclose lost concurrency or reviewer diversity |
| Provider-specific model identifiers | Stable roles: `fast-code`, `deep-code`, `judgment`, `prose`, and `independent-review` | Inherit the active model and disclose the substitution when diversity mattered |
| Sticky or long-running agent lifecycle | Host persistence, goals, waits, or monitors with an observable finish condition | Write a resume packet and stop honestly |
| Cursor transcript storage | A host transcript adapter or an explicit task-scoped path | Report transcript access as unavailable |
| Cursor-native browser, CLI, and UI tools | The host's real-surface control capability | Return a precise manual verification handoff |
| Cursor built-in skills | A host-provided capability or an original portable skill | Report the missing capability; no unlicensed built-in is redistributed |
| Cursor Team Kit `deslop` | MIT import at `skills/deslop` with `LICENSE-cursor-team-kit` | Inspect the diff for the same checklist if the skill is unavailable |
| Cursor agent definitions | Canonical files under `skills/pstack-core/personas/` with thin host aliases | Pass the persona path in the worker brief |

## Workflow divergences

Deliberate changes to what the workflows do, not just how they name capabilities:

- **Graphite removed.** Upstream's Shipping, Autopilot, and orchestration tooling assume the `gt` CLI and Graphite's merge queue. This project uses plain `gh` stacks: a PR opens against its parent with `--base`, the operator merges bottom-up and retargets each successor onto trunk as the one below lands, and `orch frontier set` resolves the stack from the forge's own base refs, scoped to the checkout's stack branch. The warning against enabling GitHub auto-merge on a stack is kept and strengthened: without a merge queue, nothing else sequences the merges.
- **Cloud lifecycle removed.** Upstream's cloud-sleeper wake chains and cloud-agent syntax are replaced by the host's wait/wake mechanism, with a resume packet as the no-persistence fallback.
- **`pstack-core` foundation skill added.** First-party. Carries `HOST_CONTRACT.md` and the personas inside a skill directory so bare per-skill copies (the `npx skills` install mode) keep them; every dependent skill locates them as the sibling `../pstack-core/`.
- **Renamed entry points.** Cursor reads the same skill directories this project installs into, and two same-named skills are indistinguishable in its picker. The three commands whose portable behavior genuinely diverges carry their own names: `ronin-mode` (upstream `poteto-mode`), `setup-ronin` (upstream `setup-pstack`), and `ronin-review` (upstream `show-me-your-work`). Other leaves keep their upstream names — the hidden ones never reach a menu, and the visible ones are close enough to interchangeable. The personas keep their upstream names.
- **Principle leaves are model-invocable.** Upstream marks all skills `disable-model-invocation: true`, which Cursor's loader treats differently. On Agent Skills hosts that flag blocks the read path `ronin-mode` depends on, so the 21 `principle-*` leaves carry `user-invocable: false` instead: readable by the model, hidden from the user's command menu. Mode skills keep `disable-model-invocation: true`.
- **`ronin-review` degrades.** Upstream's `show-me-your-work` hard-requires a different-model review subagent. Here the cross-model review falls back — inherited model, then serial self-review — with the substitution disclosed in the Attention section rather than implied fresh eyes.
- **Forge-neutral workflows.** Upstream assumes GitHub. PR workflows go through the repository's forge, detected from the git remote; GitHub (`gh`) and Azure DevOps (`az repos`) are supported, and `orch frontier set` resolves stacks on either. The bundled PR watcher remains GitHub-only and reports the gap elsewhere.
- **Distribution via the skills CLI.** `npx skills add` is the primary install; the manifest-owned Bun installer remains the maintainer path.

## Exclusions

The project omits Cursor plugin metadata, cache markers, vendored dependencies, the optional automation pack, the proprietary plugin loader, cloud-agent syntax, and the `/loop` command. `deslop` is redistributed under Cursor's MIT license from the public Team Kit. The original Cursor plugins remain unchanged and should be preferred when using pstack natively inside Cursor.

## Safety

Host safety always wins. Reversible local edits can proceed within the user's scope, but publication, merges, deployments, external communication, access changes, destructive actions, and paid operations still require the authorization demanded by the active host and user.
