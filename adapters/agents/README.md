# Agent Skills adapter

Install each canonical directory from `skills/` under `~/.agents/skills/`. Agent Skills hosts read `name` and `description` from `SKILL.md`, then load the rest when a skill is activated.

Hosts without named-agent packaging can still spawn personas. Pass the canonical persona path and required skill paths in the worker brief.
