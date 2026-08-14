# Host adapters

The canonical skills live in `skills/`. Adapters make them discoverable on a host. They do not fork the workflow.

- `agents/` describes the default Agent Skills install.
- `codex/` describes Codex workers, goals, questions, and discovery.
- `claude/` describes Claude links and persona wrappers.

The generic Agent Skills tree is the source of truth. An adapter may add host metadata or symlinks. It must keep the canonical safety, verification, and ownership rules intact.
