# pstack-portable

An unofficial, cross-agent port of [pstack](https://github.com/cursor/plugins/tree/main/pstack), the rigorous engineering workflow created by Lauren Tan.

The repository keeps one canonical [Agent Skills](https://agentskills.io/) tree in `skills/`. Host adapters translate capabilities such as delegation, persistence, model selection, transcript access, and real-surface control without forking the underlying workflows. The original Cursor plugin remains the best native Cursor experience and is not modified by this project.

This port currently tracks pstack 0.14.1. It includes all 44 upstream skills, both agent personas, the 23 Poteto Mode playbooks, guides, and first-party tooling. Upstream's optional automation subtree is intentionally outside this project's scope.

## Status

The local release candidate supports Agent Skills-compatible hosts, Codex, and Claude. Bun 1.3.14 or newer is the runtime for building, testing, installing, and running the bundled command-line tooling.

## Install

Clone the repository, then build and inspect the global installation before applying it:

```sh
bun run build
bun run install:global -- --dry-run
bun run install:global
bun run verify:installed
```

The installer places the owned distribution at `~/.agents/pstack-portable`, links all skills into `~/.agents/skills`, and creates Claude aliases in `~/.claude/skills` plus persona definitions in `~/.claude/agents`. It refuses unrelated files or links instead of overwriting them.

To remove only manifest-owned files and links:

```sh
bun run uninstall:global -- --dry-run
bun run uninstall:global
```

Pass `--home /explicit/home` to the install, uninstall, or installed-verification command to test another home directory.

## Use

Invoke a skill by name through your host, such as `poteto-mode`, `architect`, `why`, or `show-me-your-work`. Hosts with persona support can spawn `poteto-agent` or `comment-sicko`; other hosts pass the matching file under `personas/` in a delegated worker brief.

The workflows request capabilities through `HOST_CONTRACT.md`. If a host cannot delegate, persist a run, read transcripts, select a model role, or control the real UI, the skill uses its documented fallback and reports the lost capability rather than pretending parity.

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
- `personas/` contains the portable source prompts for Poteto Agent and Comment Sicko.
- `adapters/` documents the thin Codex, Claude, and generic-agent mappings.
- `docs/` contains the adapted pstack guide.
- `scripts/` builds, installs, uninstalls, and verifies generated distributions.
- `tests/` holds clean-home and capability-contract fixtures.
- `UPSTREAM.md` and `upstream.json` record the exact source and intentional exclusions.

See `PORTING.md` for the semantic adaptation map and deliberate differences from the Cursor-native plugin.

## Licensing

The adapted pstack material remains under Lauren Tan's MIT license in `LICENSE`. This community port is not affiliated with or endorsed by Lauren Tan or Cursor. See `NOTICE.md` for provenance and adaptation details.
