# ronin

A native [Agent Skills](https://agentskills.io/) project for Claude Code and Codex, derived from [pstack](https://github.com/cursor/plugins/tree/main/pstack), the rigorous engineering workflow created by Lauren Tan. Unofficial and unaffiliated.

The repository keeps one canonical skill tree in `skills/`. Workflows request capabilities — delegation, persistence, model selection, transcript access, real-surface control, the source forge — through `skills/ronin-core/HOST_CONTRACT.md`, and each skill states an honest fallback when the active host lacks one. The original Cursor plugin remains the best native Cursor experience and is not modified by this project.

The corpus derives from pstack 0.14.1 and diverges deliberately where these hosts differ from Cursor; `PORTING.md` is the divergence ledger. Upstream is watched and cherry-picked, not tracked. The tree holds 46 skills (44 derived from upstream, MIT-imported `deslop` from Cursor Team Kit, and the first-party `ronin-core` foundation), both agent personas, the 23 Ronin Mode playbooks, guides, and first-party tooling. Upstream's optional automation subtree is intentionally outside this project's scope.

Three entry points carry their own names so this project and native pstack stay distinguishable when both are installed: `ronin-mode` (upstream `poteto-mode`), `setup-ronin` (upstream `setup-pstack`), and `ronin-review` (upstream `show-me-your-work`). The Poteto Agent and Comment Sicko personas keep their upstream names.

## Status

The corpus is discoverable on Agent Skills-compatible hosts: Claude Code, Codex, and other hosts that read skill directories. Skills fall back honestly when a host cannot delegate, persist, select models, read transcripts, or control a real surface. Bun 1.3.14 or newer is the runtime for building, testing, installing, and running the bundled command-line tooling.

## Install

Install with the [skills CLI](https://github.com/vercel-labs/skills) into any supported agent:

```sh
npx skills add drrius/ronin --all
```

Or pick agents and skills explicitly. Every ronin skill expects the `ronin-core` skill beside it — it carries the host contract and personas — so partial installs must include it. Skills report it as a missing prerequisite if it is absent. Remove with `npx skills remove`.

### Coexisting with native Cursor pstack

The renamed entry points (`ronin-mode`, `setup-ronin`, `ronin-review`) never collide with native pstack, but most other visible skills keep their upstream names, and Cursor and Codex both read the shared global directory `~/.agents/skills`. On a machine that runs Cursor with native pstack installed, a global shared-directory install still produces same-named duplicates in Cursor's skill picker. Keep this project out of Cursor's view instead:

```sh
npx skills add drrius/ronin --all -g -a claude-code
```

Claude Code reads `~/.claude/skills`, which Cursor does not. For Codex, install per project so only the repositories you choose see it:

```sh
cd your-project && npx skills add drrius/ronin --skill '*' -a codex -y
```

That lands in the project's `.agents/skills`; note Cursor also reads project `.agents/skills`, so a repo you open in both hosts will show both copies there. The native Cursor plugin remains the intended experience inside Cursor.

### After install

The skills CLI delivers only the skill tree. Three optional host steps unlock full capability; every skill degrades honestly without them:

- **Model roles.** Run `/setup-ronin` (or invoke the `setup-ronin` skill) to write `~/.config/ronin/models.yaml` — per-host role maps with optional reasoning efforts. Without it, every role inherits the current model and review panels disclose that they shared one model.
- **Codex fan-out.** Subagent delegation on Codex requires its feature flag: `codex features enable multi_agent`. Codex's newer `multi_agent_v2` coexists with it and can be enabled alongside. Without the flag, fan-out skills (`how`, `arena`, `interrogate`, `swarm`) execute serially and disclose the lost concurrency.
- **Claude personas.** The persona files ship inside `skills/ronin-core/personas/`. To register them as Claude agent definitions, link them into `~/.claude/agents/` (the maintainer installer below does this automatically):

  ```sh
  ln -s ~/.claude/skills/ronin-core/personas/poteto-agent.md ~/.claude/agents/poteto-agent.md
  ln -s ~/.claude/skills/ronin-core/personas/comment-sicko.md ~/.claude/agents/comment-sicko.md
  ```

### Maintainer install

The repository also ships a manifest-owned installer used for development and release verification:

```sh
bun run build
bun run install:global -- --dry-run
bun run install:global
bun run verify:installed
```

It places the owned distribution at `~/.agents/ronin`, links all skills into `~/.agents/skills`, and creates Claude aliases in `~/.claude/skills` plus persona definitions in `~/.claude/agents`. It refuses unrelated files or links instead of overwriting them. `bun run uninstall:global` removes only manifest-owned artifacts, and `--home /explicit/home` targets another home directory.

## Use

Invoke a skill by name through your host, such as `ronin-mode`, `architect`, `why`, or `ronin-review`. Hosts with persona support can spawn `poteto-agent` or `comment-sicko`; other hosts pass the matching file under `skills/ronin-core/personas/` in a delegated worker brief.

The workflows request capabilities through `HOST_CONTRACT.md`. If a host cannot delegate, persist a run, read transcripts, select a model role, or control the real UI, the skill uses its documented fallback and reports the lost capability rather than pretending it was exercised.

## Verify

```sh
bun run install:tools
bun test
bun run verify
bun run typecheck:tools
bun run audit:tools
```

`bun test` runs the 52 native unit tests. `bun run verify` checks metadata, links, exclusions, provenance, routing fixtures, deterministic builds, collision refusal, isolated-home install and reinstall, installed file integrity and workflow readback, and exact uninstall. `bun run check` runs the complete test, verifier, typecheck, and audit gate. See `CONTRIBUTING.md` for upstream auditing and `RELEASING.md` for the release gate.

## Design

- `skills/` is the canonical host-neutral Agent Skills tree.
- `skills/ronin-core/` carries the host contract and the portable source prompts for Poteto Agent and Comment Sicko.
- `adapters/` documents the thin Codex, Claude, and generic-agent mappings.
- `docs/` contains the adapted pstack guide.
- `scripts/` builds, installs, uninstalls, and verifies generated distributions.
- `tests/` holds clean-home and capability-contract fixtures.
- `UPSTREAM.md` and `upstream.json` record the exact source and intentional exclusions.

See `PORTING.md` for the divergence ledger: every deliberate difference from Cursor-native pstack and why it exists.

## Licensing

The adapted pstack material remains under Lauren Tan's MIT license in `LICENSE`. Imported `deslop` remains under Cursor's MIT license in `LICENSE-cursor-team-kit`. This community port is not affiliated with or endorsed by Lauren Tan or Cursor. See `NOTICE.md` for provenance and adaptation details.
