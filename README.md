# pstack-portable

An unofficial, cross-agent port of [pstack](https://github.com/cursor/plugins/tree/main/pstack), the rigorous engineering workflow created by Lauren Tan.

The repository keeps one canonical [Agent Skills](https://agentskills.io/) tree in `skills/`. Host adapters translate capabilities such as delegation, persistence, model selection, transcript access, and real-surface control without forking the underlying workflows. The original Cursor plugin remains the best native Cursor experience and is not modified by this project.

This port currently tracks pstack 0.14.1. It includes all 44 upstream skills, both agent personas, the 23 Poteto Mode playbooks, guides, and first-party tooling. The optional Benny automation pack is intentionally excluded.

## Status

The repository is under active portability verification. Installation commands will be documented after clean-home install, discovery, and exact-uninstall tests pass.

## Design

- `skills/` is the canonical host-neutral Agent Skills tree.
- `personas/` contains the portable source prompts for Poteto Agent and Comment Sicko.
- `adapters/` documents the thin Codex, Claude, and generic-agent mappings.
- `docs/` contains the adapted pstack guide.
- `scripts/` builds, installs, uninstalls, and verifies generated distributions.
- `tests/` holds clean-home and capability-contract fixtures.
- `UPSTREAM.md` and `upstream.json` record the exact source and intentional exclusions.

## Licensing

The adapted pstack material remains under Lauren Tan's MIT license in `LICENSE`. This community port is not affiliated with or endorsed by Lauren Tan or Cursor. See `NOTICE.md` for provenance and adaptation details.
