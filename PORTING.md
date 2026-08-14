# Porting map

pstack-portable keeps the upstream engineering workflows while replacing Cursor runtime assumptions with the capability contract in `HOST_CONTRACT.md`.

| Upstream surface | Portable representation | Fallback when unavailable |
| --- | --- | --- |
| Task and subagent schemas | A complete worker request with objective, ownership, permissions, isolation, verifier, stop condition, and returned evidence | Execute serially and disclose lost concurrency or reviewer diversity |
| Provider-specific model identifiers | Stable roles: `fast-code`, `deep-code`, `judgment`, `prose`, and `independent-review` | Inherit the active model and disclose the substitution when diversity mattered |
| Sticky or long-running agent lifecycle | Host persistence, goals, waits, or monitors with an observable finish condition | Write a resume packet and stop honestly |
| Cursor transcript storage | A host transcript adapter or an explicit task-scoped path | Report transcript access as unavailable |
| Cursor-native browser, CLI, and UI tools | The host's real-surface control capability | Return a precise manual verification handoff |
| Cursor built-in skills | A host-provided capability or an original portable skill | Report the missing capability; no unlicensed built-in is redistributed |
| Cursor Team Kit `deslop` | MIT import at `skills/deslop` with `LICENSE-cursor-team-kit` | Inspect the diff for the same checklist if the skill is unavailable |
| Cursor agent definitions | Canonical files under `personas/` with thin host aliases | Pass the persona path in the worker brief |

The port intentionally omits Cursor plugin metadata, cache markers, vendored dependencies, the optional automation pack, the proprietary plugin loader, cloud-agent syntax, and the `/loop` command. `deslop` is redistributed under Cursor's MIT license from the public Team Kit. The original Cursor plugins remain unchanged and should be preferred when using pstack natively inside Cursor.

Host safety always wins. Reversible local edits can proceed within the user's scope, but publication, merges, deployments, external communication, access changes, destructive actions, and paid operations still require the authorization demanded by the active host and user.
