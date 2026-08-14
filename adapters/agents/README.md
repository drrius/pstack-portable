# Agent Skills adapter

Install each canonical directory from `skills/` under `~/.agents/skills/`. Hosts that support the Agent Skills specification discover the `name` and `description` from each `SKILL.md` and load the full instructions on activation.

Hosts without named-agent packaging spawn personas by passing the canonical persona path and required skill paths in the worker brief.
