# Codex adapter

Codex discovers the canonical tree through `~/.agents/skills`, so it does not need a second skill copy.

- Delegated leaf lanes map to Codex subagents. Every brief names one primary task profile plus its objective, ownership boundary, permissions, isolation, verifier, stop condition, and returned evidence. Subagents require Codex's `multi_agent` feature flag (`codex features enable multi_agent`). Without it, no separate worker context exists: execute the lanes in the coordinator and disclose both that concurrency and fresh context were not exercised.
- Durable runs map to Codex goals and their workspace-backed goal and plan files.
- User questions map to Codex's user-input mechanism when the answer cannot be discovered safely.
- Personas are supplied in a subagent brief because Codex does not require Claude-style agent definition files.
- Task profiles are canonical. Per-profile model and reasoning-effort routes are advisory unless the active Codex runtime exposes an authorized override.
