# Set up ronin

ronin installs through the Agent Skills CLI. There is no second installer to understand.

## Install for one host

Claude Code:

```sh
npx skills add drrius/ronin --skill '*' -g -a claude-code -y
```

Codex, inside the project that needs it:

```sh
cd your-project
npx skills add drrius/ronin --skill '*' -a codex -y
```

Confirm that your host can discover `ronin`. Every other skill expects `ronin-core` beside it, so partial installs must include both.

Every command carries the `ronin-` prefix. Cursor can load ronin beside pstack without ambiguous picker entries. Use Lauren's pstack when you are working in Cursor.

## Enable workers when the host needs it

Codex needs multi-agent support for concurrent workers:

```sh
codex features enable multi_agent
```

Claude Code and other hosts use their native subagent capability.

All subagents inherit the active model. The work changes by profile, not by model. `explore`, `implement`, `judge`, `explain`, and `verify` define the scope, permissions, and evidence each worker owes back.

Without subagents, ronin runs the lane in the coordinator. It reports when concurrency or a fresh context was unavailable.

## Run a real task

Pick something small. Give it a finish condition.

```text
/ronin add a --json flag to this command. text output stays byte-identical. verify both.
```

Watch the todo list. The first item reads the principles. The rest come from the matched playbook. A skipped step stays visible with `skip: <reason>`.

Use normal follow-ups after that. Invoke `/ronin` again when you start a new task. The mode does not stay on by itself.

Next: [Route work through `/ronin`](./02-ronin.md).
