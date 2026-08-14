# Claude adapter

Claude receives symlinks from `~/.claude/skills/<name>` to the canonical installation under `~/.agents/skills/<name>`. Persona aliases under `~/.claude/agents` resolve directly to the canonical persona files, which point workers back to the required skill and host contract.

The installer owns every link through its manifest, refuses unrelated collisions, and removes only those owned links during uninstall.
