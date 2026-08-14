# pstack-portable

An unofficial, cross-agent port of [pstack](https://github.com/cursor/plugins/tree/main/pstack), the rigorous engineering workflow created by Lauren Tan.

The repository keeps one canonical [Agent Skills](https://agentskills.io/) tree in `skills/`. Host adapters translate capabilities such as delegation, persistence, model selection, transcript access, and real-surface control without forking the underlying workflows. The original Cursor plugin remains the best native Cursor experience and is not modified by this project.

This port currently tracks pstack 0.14.1. It includes the 44 upstream skills, MIT-imported `deslop` from Cursor Team Kit, and the first-party `pstack-core` foundation skill (46 total), both agent personas, the 23 Poteto Mode playbooks, guides, and first-party tooling. Upstream's optional automation subtree is intentionally outside this project's scope.

## Status

The local release candidate is discoverable on Agent Skills-compatible hosts, including Codex and other hosts that read `~/.agents/skills`, plus Claude skill and persona aliases. Discovery is not Cursor runtime parity. Skills fall back honestly when a host cannot delegate, persist, select models, read transcripts, or control a real surface. Bun 1.3.14 or newer is the runtime for building, testing, installing, and running the bundled command-line tooling.

## Install

Install with the [skills CLI](https://github.com/vercel-labs/skills) into any supported agent:

```sh
npx skills add drrius/pstack-portable --all
```

Or pick agents and skills explicitly. Every pstack skill expects the `pstack-core` skill beside it — it carries the host contract and personas — so partial installs must include it. Skills report it as a missing prerequisite if it is absent. Remove with `npx skills remove`.

### Coexisting with native Cursor pstack

Cursor and Codex both read the shared global directory `~/.agents/skills`, and skills there carry the same names as the native Cursor plugin's. On a machine that runs Cursor with native pstack installed, a global shared-directory install produces indistinguishable duplicates in Cursor's skill picker. Keep the port out of Cursor's view instead:

```sh
npx skills add drrius/pstack-portable --all -g -a claude-code
```

Claude Code reads `~/.claude/skills`, which Cursor does not. For Codex, install per project so only the repositories you choose see the port:

```sh
cd your-project && npx skills add drrius/pstack-portable --skill '*' -a codex -y
```

That lands in the project's `.agents/skills`; note Cursor also reads project `.agents/skills`, so a repo you open in both hosts will show both copies there. The native Cursor plugin remains the intended experience inside Cursor.

### Maintainer install

The repository also ships a manifest-owned installer used for development and release verification:

```sh
bun run build
bun run install:global -- --dry-run
bun run install:global
bun run verify:installed
```

It places the owned distribution at `~/.agents/pstack-portable`, links all skills into `~/.agents/skills`, and creates Claude aliases in `~/.claude/skills` plus persona definitions in `~/.claude/agents`. It refuses unrelated files or links instead of overwriting them. `bun run uninstall:global` removes only manifest-owned artifacts, and `--home /explicit/home` targets another home directory.

## Use

Invoke a skill by name through your host, such as `poteto-mode`, `architect`, `why`, or `show-me-your-work`. Hosts with persona support can spawn `poteto-agent` or `comment-sicko`; other hosts pass the matching file under `skills/pstack-core/personas/` in a delegated worker brief.

The workflows request capabilities through `HOST_CONTRACT.md`. If a host cannot delegate, persist a run, read transcripts, select a model role, or control the real UI, the skill uses its documented fallback and reports the lost capability rather than claiming Cursor runtime parity.

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
- `skills/pstack-core/` carries the host contract and the portable source prompts for Poteto Agent and Comment Sicko.
- `adapters/` documents the thin Codex, Claude, and generic-agent mappings.
- `docs/` contains the adapted pstack guide.
- `scripts/` builds, installs, uninstalls, and verifies generated distributions.
- `tests/` holds clean-home and capability-contract fixtures.
- `UPSTREAM.md` and `upstream.json` record the exact source and intentional exclusions.

See `PORTING.md` for the semantic adaptation map and deliberate differences from the Cursor-native plugin.

## Licensing

The adapted pstack material remains under Lauren Tan's MIT license in `LICENSE`. Imported `deslop` remains under Cursor's MIT license in `LICENSE-cursor-team-kit`. This community port is not affiliated with or endorsed by Lauren Tan or Cursor. See `NOTICE.md` for provenance and adaptation details.
