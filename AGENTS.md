# Working in ronin

Read `.codex/ronin/goal.md` and `.codex/ronin/plan.md` when they are present. Keep the plan current after material findings or failed verification.

Treat the installed Cursor pstack cache as immutable source material. Never edit, install over, remove, or relink the Cursor plugin.

Keep `skills/` canonical and host-neutral. Ask for capabilities through `skills/ronin-core/HOST_CONTRACT.md`. Do not add host adapters or model-routing configuration. Preserve Lauren Tan's MIT notice, do not redistribute Cursor built-ins without a clear license, and do not add the excluded automation pack.

Run `bun run check` before claiming completion. The build must remain deterministic and free of cached dependencies.
