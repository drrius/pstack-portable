# Working in ronin

Read `.codex/ronin/goal.md` and `.codex/ronin/plan.md` when they are present. Keep the plan current after material findings or failed verification.

Treat the installed Cursor pstack cache as immutable source material. Never edit, install over, remove, or relink the Cursor plugin.

Keep `skills/` canonical and host-neutral. Put concrete host mechanics in `adapters/`, preserve Lauren Tan's MIT notice, do not redistribute Cursor built-ins without a clear license, and do not add the excluded automation pack.

Run `bun run check` before claiming completion. Installation behavior must also pass in an isolated temporary home, and uninstall must remove only manifest-owned artifacts.
