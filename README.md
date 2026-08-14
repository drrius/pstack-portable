<p align="center">
  <img src="docs/assets/ronin.png" alt="ronin" width="640">
</p>

# ronin

ronin is the best of Lauren Tan's pstack, adapted for Claude Code, Codex, and other Agent Skills hosts. If you use Cursor, use [her plugin](https://github.com/cursor/plugins/tree/main/pstack). It is better there.

This is an unofficial port. Lauren and Cursor did not endorse it.

ronin keeps all 21 pstack principles and 22 working skills. It drops three surfaces that do not earn their weight here: `arena`, `automate-me`, and `setup-pstack`.

The front door is `/ronin`. Every other command starts with `ronin-`. Cursor can load ronin beside pstack without duplicate command names in the picker.

## Install

Install the full set for the host that will run it.

Claude Code:

```sh
npx skills add drrius/ronin --skill '*' -g -a claude-code -y
```

Codex, inside the project that needs it:

```sh
cd your-project
npx skills add drrius/ronin --skill '*' -a codex -y
```

Every skill expects `ronin-core` beside it. Partial installs must include that skill. Use `npx skills remove` to uninstall what the skills CLI installed.

Codex needs multi-agent support for concurrent workers:

```sh
codex features enable multi_agent
```

Without subagents, ronin runs the same work in the coordinator and reports the lost isolation or concurrency. Subagents inherit the active model. There is no model setup file, provider matrix, or routing layer.

## Start here

Give ronin a goal and a check.

```text
/ronin the export writes duplicate rows when a retry lands mid-run. repro first, then fix and verify.
```

`/ronin` picks the playbook and calls the right skills. The [guide](./docs/guide/README.md) teaches the habit.

<details>
<summary>The public skills</summary>

| Skills | Use them for |
| --- | --- |
| `/ronin-how` `/ronin-why` `/ronin-teach` `/ronin-recall` | Understand code before changing it |
| `/ronin-architect` `/ronin-swarm` `/ronin-interrogate` | Design, divide, and stress-test work |
| `/ronin-tdd` `/ronin-deslop` `/ronin-unslop` `/ronin-no-comments` | Build and clean the result |
| `/ronin-blast-radius` `/ronin-review` | Prove safety and leave evidence |
| `/ronin-figure-it-out` `/ronin-reflect` | Structure unusual work and capture lessons |
| `/ronin-bro` `/ronin-technical-writing` `/ronin-typescript-best-practices` | Write plainly and keep TypeScript sharp |
| `/ronin-create-verification-skill` `/ronin-maintain-verification-skill` | Build and maintain real-surface proof |

Twenty-one hidden `ronin-principle-*` skills sit behind these. `/ronin` names the principles it applies.

</details>

## What changed from pstack

| | pstack | ronin |
| --- | --- | --- |
| Home | Cursor | Claude Code, Codex, and Agent Skills hosts |
| Scope | Full upstream plugin | 43 curated skills, including all 21 principles |
| Commands | Upstream names | Every retained skill uses `ronin-*` |
| Design breadth | Arena candidates | `/ronin-architect` names structural directions before exploring them |
| Parallel work | Cursor agents | Native subagents that inherit the active model |
| Review report | Model-oriented review | `self-review` or `fresh-context review` |
| Forge | GitHub | GitHub or Azure DevOps, chosen from the remote |
| Stacks | Graphite | Plain `gh` and `az`, with bases retargeted by hand |

[`PORTING.md`](./PORTING.md) records each intentional difference.

ronin starts from pstack 0.14.1. It is curated, not a byte-for-byte mirror.

## Verify

```sh
bun run check
```

Use Bun 1.3.14 or newer. The check validates the skills, tests the tooling, typechecks the code, audits dependencies, and proves the build is deterministic.

## Repository map

- `skills/` is the canonical Agent Skills tree.
- [`skills/ronin-core/HOST_CONTRACT.md`](./skills/ronin-core/HOST_CONTRACT.md) defines delegation and capability fallbacks.
- [`skills/ronin-core/task-profiles.json`](./skills/ronin-core/task-profiles.json) defines worker jobs and permissions.
- `docs/` holds the guide.
- `scripts/` builds and verifies the distribution.
- `upstream.json` pins the imported pstack commit.

Contributors can build the distribution with `bun run build`. Users should install through `npx skills` for the host they chose.

## Credit

pstack is Lauren Tan's work. Her MIT notice is preserved in [`LICENSE`](./LICENSE). `ronin-deslop` comes from Cursor's Team Kit under the MIT notice in [`LICENSE-cursor-team-kit`](./LICENSE-cursor-team-kit). [`NOTICE.md`](./NOTICE.md) records the provenance.
