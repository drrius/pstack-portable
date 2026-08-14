# Release-candidate result

pstack-portable is a verified Bun-native local release candidate derived from Lauren Tan's MIT-licensed pstack 0.14.1. The exact candidate commit and publication decision are recorded in the handoff.

## Provenance

- Public source: `cursor/plugins`, `pstack/` subtree, commit `2a8044425c7bddf429c3bdedf3ab61e791d34d65`.
- Original complete cache digest: `5459c768cf630db9a37372240169d2d8cf15aa55b48611cad85c774904f677b7` before and after the port.
- Explicit imported allowlist digest: `9e3347061e86a60d73138e839c6a4cd419fbefa50932bba50a0964e477d83251`, reproduced from a fresh public checkout.
- Deterministic distribution digest: `790825ff21c254e282c9b0a987206332941da7426037b378a4a22dfdf45c2d3b`.
- Inventory: 46 skills (44 upstream, MIT-imported `deslop`, first-party `pstack-core`), two personas, 23 Poteto Mode playbooks, 34 skill references, and 17 documentation files.

## Verification evidence

| Command | Result |
| --- | --- |
| `bun run install:tools` | Reproduced the pinned `bun.lock` dependency graph |
| `bun test` | 52 native tests passed under Bun 1.3.14, revision `1.3.14+0d9b296af` |
| `bun run verify` | Passed metadata, provenance, exclusions, links, routing and capability fixtures, deterministic build, collision refusal, isolated install, Bun tool bootstrap, reinstall, file-integrity/readback, and exact uninstall |
| `bun run typecheck:tools` | Strict TypeScript check passed across bootstrap, orchestration, and PR-watcher sources and tests |
| `bun run audit:tools` | Zero vulnerabilities |
| `bun scripts/audit-upstream.mjs --source ...` | Public 0.14.1 inventory and allowlist digest matched |
| `bun run install:global -- --dry-run` | No real-home collisions |
| `bun run install:global` and `bun run verify:installed` | Installed and read back 45 skills and two personas |
| `skills list -g` | Discovered representative pstack skills through the canonical global Agent Skills tree |

The same Bun-only dependency installation, native test suite, strict typecheck, audit, lifecycle verification, installed command bootstrap, and public-source audit passed from a clean local clone with no ignored working-tree dependencies.

## Intentional differences

Cursor-specific task schemas, model identifiers, transcript paths, cloud lifecycle syntax, built-in skill dependencies, and agent packaging are represented through `HOST_CONTRACT.md` and thin adapters. Stable model roles replace provider identifiers, and the two agent definitions live as canonical personas with Claude aliases.

The distribution omits Cursor packaging and cache artifacts, vendored dependencies, and the optional automation pack. It does not modify or relink the installed Cursor plugin.

## Capability limits

A host without delegation executes worker lanes serially. A host without model selection inherits the current model; without persistence it writes a resume packet and stops; without transcript access it reports the gap; without real-surface control it returns an exact manual verification handoff. Host and user authorization continues to govern external communication, publication, merges, deployments, destructive operations, access changes, and paid actions.

## Remaining gate

Creating a public repository, pushing a remote, publishing a release or package, and announcing the project require explicit user approval. No public publishing action has been taken.
