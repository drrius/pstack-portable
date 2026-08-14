# Codex adapter

Codex discovers the canonical tree through `~/.agents/skills`, so it does not need a second skill copy.

- Delegated lanes map to Codex subagents with explicit scope, verifier, stop condition, and returned evidence.
- Durable runs map to Codex goals and their workspace-backed goal and plan files.
- User questions map to Codex's user-input mechanism when the answer cannot be discovered safely.
- Personas are supplied in a subagent brief because Codex does not require Claude-style agent definition files.
- Model roles are advisory unless the active Codex runtime exposes an authorized model override.
