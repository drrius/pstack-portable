# Set up ronin

In this page you install ronin, learn its five task profiles, optionally tune model routing, and run your first task.

## Install ronin

From the repository, run the documented installer for your agent host. The installer exposes one canonical skill tree under `~/.agents/skills`; host adapters may add manifest-owned aliases such as `~/.claude/skills`.

Confirm that your host can discover `ronin-mode` before continuing. If discovery fails, stop and fix the adapter rather than copying another skill tree by hand.

## Keep the default, or tune routing

Run:

```text
/setup-ronin
```

[`/setup-ronin`](../../skills/setup-ronin/SKILL.md) shows the five behavioral profiles: `explore`, `implement`, `judge`, `explain`, and `verify`. They work immediately on the current model. When the host supports model selection, setup can write an optional `~/.config/ronin/models.yaml` route for capability, reasoning effort, latency, or cost.

You only override what you care about. A profile with no line inherits the current model. To restore that default later, delete the profile's line, or run `/setup-ronin` again.

Set a profile to `inherit-current` when its workers should keep the current model. That value is not a provider model. Fan-out count belongs to `/arena`, `/swarm`, or `/interrogate`, not the model map. Do not assign a weaker model merely to make routes look different; one frontier model across every profile is a complete setup.

## Accept the verification offer, or don't

At the end of setup, `/setup-ronin` looks for a way to prove app behavior in your project, either a `verify-*` skill or an existing harness. If it finds neither, it offers once to generate one with [`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md).

Say yes and it writes `.agents/skills/verify-<app>/`, a project-local skill that teaches agents to drive your app the way a user does. It proves the skill works once before handing it over. Say no and setup moves on. You can run `/create-verification-skill` yourself any time. [Verify and ship](./06-verify-and-ship.md#create-a-project-verification-skill) covers when it earns its place.

After changing routing, start a new chat when your host applies model choices only to new sessions.

## Run your first task

Pick something real but small, and describe it the way you'd describe it to a colleague:

```text
/ronin-mode add a --json flag to this command. text output stays byte-identical. verify both.
```

Watch the todo list. The first item is always "read the Principles section". The rest are the matched playbook's steps copied in, the Feature playbook for this prompt. If `/ronin-mode` skips a step, the step stays in the list with `skip: <reason>`, so you can see what it chose not to do.

From here you can type normal follow-ups. Re-invoke `/ronin-mode` (or use a host pin if one is available) when you start the next task. The mode does not stay on by itself.

Next: [Route work through `/ronin-mode`](./02-ronin-mode.md).
