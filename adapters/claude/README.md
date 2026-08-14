# Claude adapter

Claude discovers skills through symlinks from `~/.claude/skills/<name>` to `~/.agents/skills/<name>`. Persona aliases under `~/.claude/agents` point to the canonical persona files. Those files point workers back to the required skill and host contract.

The installer records every link in its manifest. It refuses unrelated collisions. Uninstall removes only links it owns.

Delegated lanes use Claude subagents with a task profile, scope, verifier, stop condition, and returned evidence. If the runtime cannot run them concurrently, it keeps fresh worker contexts serial and reports the lost concurrency. Coordinator-only passes are `self-review`.

Task profiles are canonical. Model and reasoning routes apply only when Claude exposes the requested controls. Otherwise profiles inherit the current model.

Choose a model for capability, latency, cost, effort, or tool fit. Do not choose a weaker model to manufacture diversity. Reports keep fresh-context, model, and provider provenance separate. Unknown axes stay unknown.
