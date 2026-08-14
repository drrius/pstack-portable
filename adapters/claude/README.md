# Claude adapter

Claude receives symlinks from `~/.claude/skills/<name>` to the canonical installation under `~/.agents/skills/<name>`. Persona aliases under `~/.claude/agents` resolve directly to the canonical persona files, which point workers back to the required skill and host contract.

The installer owns every link through its manifest, refuses unrelated collisions, and removes only those owned links during uninstall.

- Delegated lanes map to Claude subagents with an explicit task profile, scope, verifier, stop condition, and returned evidence. If the active runtime cannot run them concurrently, preserve fresh worker contexts serially and disclose only the lost concurrency; coordinator-only passes are `self-review`.
- Task profiles are canonical. Per-profile model and reasoning-effort routes apply only when the active Claude runtime exposes the corresponding selection; otherwise every profile inherits the current model.
- A model route is selected for capability, latency, cost, effort, or tool fit, never merely to manufacture diversity. Review reports keep fresh-context, model, and provider provenance separate and disclose unknown axes instead of guessing.
