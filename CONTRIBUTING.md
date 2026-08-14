# Contributing

Keep `skills/` (including `skills/ronin-core/`) and `docs/` host-neutral. Concrete host paths, tool schemas, and model identifiers belong in `adapters/`; a canonical workflow should ask for a capability through `HOST_CONTRACT.md` and state an honest fallback when the host lacks it.

## Development checks

Install Bun 1.3.14 or newer, then reproduce the pinned dependencies and run the complete gate:

```sh
bun run install:tools
bun run check
```

For focused work, `bun test` runs the native unit suite, `bun run verify` exercises the distribution lifecycle, and `bun run typecheck:tools` checks the complete TypeScript tooling tree.

## Updating from upstream

`upstream.json` pins the public repository, commit, version, allowlist, and original import digest. Fetch the exact public commit into a clean checkout, then verify it before reviewing any update:

```sh
bun scripts/audit-upstream.mjs --source /path/to/cursor-plugins/pstack
```

For a new version, update one portability surface at a time: inventory the upstream diff, preserve the exact MIT notice, copy only the explicit allowlist, reapply semantic adaptations deliberately, and update the routing and capability fixtures. Never bulk-copy cache artifacts, generated dependencies, plugin packaging, or the excluded automation subtree.

The installed Cursor cache is evidence, not a build dependency. A clean contributor must be able to reproduce provenance from the pinned public commit without Cursor installed.

## Change discipline

Run `bun run check` after each meaningful adaptation. Do not weaken a failing exclusion or capability test to make the suite green; either implement the portable behavior or document and test the capability gap. Changes to install ownership, collision handling, or uninstall require an isolated-home regression test because those paths touch global agent directories.
