<p align="center">
  <img src="docs/assets/ronin.png" alt="ronin" width="640">
</p>

# ronin

pstack is Lauren Tan's engineering workflow. ronin is that workflow rebuilt to run in Claude Code and Codex. If you work in Cursor, install [her plugin](https://github.com/cursor/plugins/tree/main/pstack) instead. It's better there.

Unofficial and unaffiliated. A ronin serves no house, which is the point.

## Why

I'm a big fan of pstack. It's a Cursor plugin, and I work in Claude Code and Codex.

That gap is why this exists. Moving the skills across was the easy half. Two problems the original never had to solve turned out to matter more.

My work repos live in Azure DevOps. Every PR step in pstack speaks `gh`. ronin reads the git remote and speaks `az repos` when the remote is Azure, `gh` when it's GitHub. Same playbooks either way.

Then there's parallelism. Cursor can spread a panel across model providers. Claude Code and Codex are strongest at something more basic: isolated agents with different jobs. ronin names those jobs `explore`, `implement`, `judge`, `explain`, and `verify`, gives each one a real contract, and lets the host run them on its best available model. Another model is useful when it is actually available. It is not where the trust comes from.

The rest follows from those two. I don't use Graphite, so stacks are plain `gh` and `az` with bases retargeted by hand. Any skill that can't get what it needs says so instead of pretending it did.

## Install

```sh
npx skills add drrius/ronin --all
```

Every skill expects `ronin-core` next to it. That one carries the host contract and the two personas, so partial installs have to include it. `npx skills remove` takes it all back out.

Three commands carry their own names. `ronin-mode`, `setup-ronin`, `ronin-review`. Upstream calls them `poteto-mode`, `setup-pstack`, `show-me-your-work`, so both sets can sit side by side and you always know which one you invoked.

## After install

The skills CLI ships the skill tree and nothing else. Three steps unlock the rest. Skip them and everything still runs, just with less.

**Optional routing.** Every task profile inherits your current model by default. Run `/setup-ronin` only when you want a host to route a profile to another model or reasoning effort for capability, latency, or cost. It never picks a weaker model just to make the panel look diverse.

**Codex fan-out.** Run `codex features enable multi_agent`. Without it `how`, `arena`, `interrogate`, and `swarm` execute their lanes serially. The reply distinguishes lost concurrency from lost fresh-context review.

**Claude personas.** Link them so Claude Code can spawn them by name.

```sh
ln -s ~/.claude/skills/ronin-core/personas/poteto-agent.md ~/.claude/agents/poteto-agent.md
ln -s ~/.claude/skills/ronin-core/personas/comment-sicko.md ~/.claude/agents/comment-sicko.md
```

## Get started

Give it a goal and a way to check it.

```text
/ronin-mode the export writes duplicate rows when a retry lands mid-run. repro first, then fix and verify.
```

You don't name a playbook. `/ronin-mode` matches one, copies the steps into a todo list, and calls the other skills as the steps fire. The [guide](./docs/guide/README.md) teaches the habit in ten pages.

<details>
<summary>The other skills</summary>

| Skills | Use them for |
| --- | --- |
| `/how` `/why` `/teach` `/recall` | Understand code before you touch it |
| `/architect` `/arena` `/swarm` `/interrogate` | Design it, compete the options, stress test the result |
| `/tdd` `/deslop` `/unslop` `/no-comments` | Build it and clean it |
| `/blast-radius` `/ronin-review` | Prove it's safe, leave a trail someone can audit |
| `/figure-it-out` `/automate-me` | Large migrations, and capturing how you work |
| `/bro` `/technical-writing` `/typescript-best-practices` | Plain language, docs, TypeScript |

21 `principle-*` skills sit behind these. `/ronin-mode` reads them and names the ones it applied.

</details>

## What's different from pstack

| | pstack | ronin |
| --- | --- | --- |
| Hosts | Cursor | Claude Code, Codex, anything that reads Agent Skills |
| Forge | GitHub | GitHub or Azure DevOps, picked from the remote |
| Stacks | Graphite | Plain `gh` and `az`, bases retargeted by hand |
| Parallel work | Model-diverse Cursor agents | Task-profiled agents; optional model routing |
| Review provenance | Another provider's model | Self-review, same-model fresh-context, same-provider different-model, cross-provider, or an unverified joint tier with every known axis still reported |
| Missing capability | Assumed present | Named in the reply |

[`PORTING.md`](./PORTING.md) records every divergence and the reason for it.

ronin derives from pstack 0.14.1. I watch upstream and cherry-pick. I don't track it.

## Verify

```sh
bun run check
```

You need Bun 1.3.14 or newer. That runs the test suite, a strict typecheck, a dependency audit, and the distribution verifier. The verifier builds twice and compares digests, installs into a throwaway home, proves the installer refuses to touch anything it doesn't own, then uninstalls and checks nothing got left behind.

## How it's built

- `skills/` is the canonical tree, host-neutral.
- [`skills/ronin-core/HOST_CONTRACT.md`](./skills/ronin-core/HOST_CONTRACT.md) is the capability contract every skill reads first.
- [`skills/ronin-core/task-profiles.json`](./skills/ronin-core/task-profiles.json) is the machine-checkable profile and review-provenance contract.
- `adapters/` maps that contract onto Claude Code, Codex, and generic hosts.
- `docs/` is the guide.
- `scripts/` builds, installs, and verifies.
- `upstream.json` pins the imported commit.

Maintainers can install from source instead of the skills CLI.

```sh
bun run build
bun run install:global -- --dry-run
bun run install:global
```

That puts the owned tree in `~/.agents/ronin` and links it into place. It refuses unrelated files instead of overwriting them, and `bun run uninstall:global` removes only what it owns.

## Credit

pstack is Lauren Tan's work, MIT, preserved in [`LICENSE`](./LICENSE). `deslop` comes from Cursor's Team Kit, MIT, in [`LICENSE-cursor-team-kit`](./LICENSE-cursor-team-kit). Neither Lauren nor Cursor endorsed this. [`NOTICE.md`](./NOTICE.md) has the full provenance.
