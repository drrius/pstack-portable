# Release-candidate result

pstack-portable is a verified local release candidate derived from Lauren Tan's MIT-licensed pstack 0.14.1. The implementation commit is `06786f64e745994520479da00d9a114d1d50814a`; the final evidence commit and publication decision are recorded in the handoff.

## Provenance

- Public source: `cursor/plugins`, `pstack/` subtree, commit `2a8044425c7bddf429c3bdedf3ab61e791d34d65`.
- Original complete cache digest: `5459c768cf630db9a37372240169d2d8cf15aa55b48611cad85c774904f677b7` before and after the port.
- Explicit imported allowlist digest: `9e3347061e86a60d73138e839c6a4cd419fbefa50932bba50a0964e477d83251`, reproduced from a fresh public checkout.
- Deterministic distribution digest: `410c4ed7f8ab10408466201db1d21d179bda15ff9874a11f48e2ca8b5d88d49e`.
- Inventory: 44 skills, two personas, 23 Poteto Mode playbooks, 34 skill references, and 17 documentation files.

## Verification evidence

| Command | Result |
| --- | --- |
| `npm test` | Passed metadata, provenance, exclusions, links, routing and capability fixtures, deterministic build, collision refusal, isolated install/reinstall, file-integrity/readback, and exact uninstall |
| `npm ci --prefix skills/poteto-mode/scripts` | Reproduced the pinned tooling dependency graph |
| `npm run audit:tools` | Zero vulnerabilities |
| `npm run test:tools` | 52 tests passed under Node.js 22.23.1 |
| `npm run typecheck:tools` | Strict TypeScript check passed |
| `bun run test` and `bun run typecheck` | 52 tests and strict typecheck passed under Bun 1.3.14, revision `1.3.14+0d9b296af` |
| `node scripts/audit-upstream.mjs --source ...` | Public 0.14.1 inventory and allowlist digest matched |
| `npm run install:global -- --dry-run` | No real-home collisions |
| `npm run install:global` and `npm run verify:installed` | Installed and read back 44 skills and two personas |
| `skills list -g` | Discovered representative pstack skills through the canonical global Agent Skills tree |

The same Node verification, dependency installation, 52-test suite, strict typecheck, and public-source audit passed from a clean local clone with no ignored working-tree dependencies.

## Intentional differences

Cursor-specific task schemas, model identifiers, transcript paths, cloud lifecycle syntax, built-in skill dependencies, and agent packaging are represented through `HOST_CONTRACT.md` and thin adapters. Stable model roles replace provider identifiers, and the two agent definitions live as canonical personas with Claude aliases.

The distribution omits Cursor packaging and cache artifacts, vendored dependencies, and the optional automation pack. It does not modify or relink the installed Cursor plugin.

## Capability limits

A host without delegation executes worker lanes serially. A host without model selection inherits the current model; without persistence it writes a resume packet and stops; without transcript access it reports the gap; without real-surface control it returns an exact manual verification handoff. Host and user authorization continues to govern external communication, publication, merges, deployments, destructive operations, access changes, and paid actions.

## Remaining gate

Creating a public repository, pushing a remote, publishing a release or package, and announcing the project require explicit user approval. No public publishing action has been taken.
