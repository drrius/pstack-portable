# Host adapters

Adapters translate `HOST_CONTRACT.md` into host-specific discovery and runtime mechanics. They do not contain divergent copies of canonical skills.

- `agents/` defines the default Agent Skills installation.
- `codex/` documents Codex delegation, goals, questions, and discovery behavior.
- `claude/` defines Claude skill links and generated persona wrappers.

The generic Agent Skills distribution is the source of truth. A host adapter may add metadata or symlinks, but it must not weaken the canonical safety, verification, or ownership rules.
