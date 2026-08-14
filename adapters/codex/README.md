# Codex adapter

Codex discovers the canonical tree through `~/.agents/skills`. It does not need a second skill copy.

Delegated leaf lanes use Codex subagents. Each brief names one task profile, objective, ownership boundary, permissions, isolation, verifier, stop condition, and returned evidence. Enable workers first.

```sh
codex features enable multi_agent
```

Without the flag, no separate worker context exists. Run the lanes in the coordinator and report that concurrency and fresh context were not exercised.

Durable runs use Codex goals and workspace-backed goal and plan files. User questions use Codex's input mechanism when the answer cannot be discovered safely.

Codex receives personas in the subagent brief. It does not need Claude-style agent definition files.

Task profiles are canonical. Model and reasoning routes are advisory unless the active Codex runtime exposes an authorized override.
