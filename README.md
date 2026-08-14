<p align="center">
  <img src="docs/assets/ronin.png" alt="ronin" width="640">
</p>

# ronin

ronin is Lauren Tan's pstack workflow rebuilt for Claude Code, Codex, and other Agent Skills hosts. If you use Cursor, install [her plugin](https://github.com/cursor/plugins/tree/main/pstack). It is the better fit there.

This is an unofficial port. It is not endorsed by Lauren or Cursor.

## Why this exists

I work in Claude Code and Codex. pstack is built for Cursor.

The port had two real gaps to close. PRs need to work against Azure DevOps as well as GitHub. Parallel work needs explicit jobs instead of a promise that different models are available.

ronin reads the remote and uses `az repos` for Azure DevOps or `gh` for GitHub. Its task profiles are `explore`, `implement`, `judge`, `explain`, and `verify`. A host may route those profiles to other models, but the workflow does not depend on model variety. Missing capabilities are reported instead of hidden.

Stacks stay plain. Bases are retargeted by hand with `gh` or `az`. I do not use Graphite.

## Install

```sh
npx skills add drrius/ronin --all
```

Every skill expects `ronin-core` beside it. Partial installs must include it. `npx skills remove` removes the distribution.

The commands are named `ronin-mode`, `setup-ronin`, and `ronin-review`. Upstream calls the equivalents `poteto-mode`, `setup-pstack`, and `show-me-your-work`. Both names can coexist.

## After install

The skills CLI installs the tree. These steps add optional host behavior.

Route profiles only when you need another model or reasoning effort.

```text
/setup-ronin
```

Enable Codex workers when you want real fan-out.

```sh
codex features enable multi_agent
```

Without that flag, `how`, `arena`, `interrogate`, and `swarm` run their lanes serially. The result says that concurrency and fresh worker context were not exercised.

Claude personas need links.

```sh
ln -s ~/.claude/skills/ronin-core/personas/poteto-agent.md ~/.claude/agents/poteto-agent.md
ln -s ~/.claude/skills/ronin-core/personas/comment-sicko.md ~/.claude/agents/comment-sicko.md
```

## Get started

Give ronin a goal and a way to check it.

```text
/ronin-mode the export writes duplicate rows when a retry lands mid-run. repro first, then fix and verify.
```

`/ronin-mode` picks the workflow, turns it into a todo list, and calls sibling skills as needed. The [guide](./docs/guide/README.md) explains the habit.

<details>
<summary>The other skills</summary>

| Skills | Use them for |
| --- | --- |
| `/how` `/why` `/teach` `/recall` | Understand code before you change it |
| `/architect` `/arena` `/swarm` `/interrogate` | Design and stress-test the choice |
| `/tdd` `/deslop` `/unslop` `/no-comments` | Build and clean the result |
| `/blast-radius` `/ronin-review` | Check safety and leave evidence |
| `/figure-it-out` `/automate-me` | Handle large migrations and capture the work |
| `/bro` `/technical-writing` `/typescript-best-practices` | Write plainly and keep TypeScript sharp |

Twenty-one `principle-*` skills sit behind these. `/ronin-mode` names the ones it applies.

</details>

## What changed from pstack

| | pstack | ronin |
| --- | --- | --- |
| Hosts | Cursor | Claude Code, Codex, and Agent Skills hosts |
| Forge | GitHub | GitHub or Azure DevOps, selected from the remote |
| Stacks | Graphite | Plain `gh` and `az`, with bases retargeted by hand |
| Parallel work | Model-diverse Cursor agents | Task profiles, with optional model routing |
| Review provenance | Another provider's model | Fresh context, model, and provider identity reported separately |
| Missing capability | Assumed present | Named in the result |

[`PORTING.md`](./PORTING.md) records each intentional difference.

When identities are incomplete, review uses an unverified joint tier and reports every known axis.

ronin starts from pstack 0.14.1. I watch upstream and cherry-pick useful changes. I do not track it byte for byte.

## Verify

```sh
bun run check
```

Use Bun 1.3.14 or newer. The check runs tests, strict typechecks, a dependency audit, and the distribution verifier. The verifier builds twice, compares digests, installs into a throwaway home, refuses unrelated collisions, uninstalls its own artifacts, and checks that nothing else moved.

## How it is built

- `skills/` is the canonical, host-neutral tree.
- [`skills/ronin-core/HOST_CONTRACT.md`](./skills/ronin-core/HOST_CONTRACT.md) defines the host capability contract.
- [`skills/ronin-core/task-profiles.json`](./skills/ronin-core/task-profiles.json) defines task and review provenance rules.
- `adapters/` maps the contract onto hosts.
- `docs/` holds the guide.
- `scripts/` builds, installs, and verifies.
- `upstream.json` pins the imported commit.

Build from source when you are contributing.

```sh
bun run build
bun run install:global -- --dry-run
bun run install:global
```

The installer owns `~/.agents/ronin` and its links. It refuses unrelated files. `bun run uninstall:global` removes only its manifest-owned artifacts.

## Credit

pstack is Lauren Tan's work, MIT, preserved in [`LICENSE`](./LICENSE). `deslop` comes from Cursor's Team Kit, MIT, in [`LICENSE-cursor-team-kit`](./LICENSE-cursor-team-kit). [`NOTICE.md`](./NOTICE.md) records the provenance. Neither Lauren nor Cursor endorsed this port.
