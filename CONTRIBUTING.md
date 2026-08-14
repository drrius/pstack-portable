# Contributing

Keep `skills/`, `personas/`, and `docs/` host-neutral. Concrete host paths, tool schemas, and model identifiers belong in `adapters/`; a canonical workflow should ask for a capability through `HOST_CONTRACT.md` and state an honest fallback when the host lacks it.

## Development checks

Use Node.js 22 or newer for the portable baseline:

```sh
npm test
npm ci --prefix skills/poteto-mode/scripts
npm run audit:tools
npm run test:tools
npm run typecheck:tools
```

Bun is optional. If installed, run the tooling suite and typecheck with `bun run test` and `bun run typecheck` from `skills/poteto-mode/scripts` as a compatibility check.

## Updating from upstream

`upstream.json` pins the public repository, commit, version, allowlist, and original import digest. Fetch the exact public commit into a clean checkout, then verify it before reviewing any update:

```sh
node scripts/audit-upstream.mjs --source /path/to/cursor-plugins/pstack
```

For a new version, update one portability surface at a time: inventory the upstream diff, preserve the exact MIT notice, copy only the explicit allowlist, reapply semantic adaptations deliberately, and update the routing and capability fixtures. Never bulk-copy cache artifacts, generated dependencies, plugin packaging, or the excluded automation subtree.

The installed Cursor cache is evidence, not a build dependency. A clean contributor must be able to reproduce provenance from the pinned public commit without Cursor installed.

## Change discipline

Run `npm test` after each meaningful adaptation. Do not weaken a failing exclusion or capability test to make the suite green; either implement the portable behavior or document and test the capability gap. Changes to install ownership, collision handling, or uninstall require an isolated-home regression test because those paths touch global agent directories.
