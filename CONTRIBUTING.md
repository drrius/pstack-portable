# Contributing

Keep `skills/` and `docs/` host-neutral. A skill asks for a capability through [`HOST_CONTRACT.md`](./skills/ronin-core/HOST_CONTRACT.md), then states what happens when the host cannot provide it.

Do not add host adapters, model configuration, provider tiers, or a custom global installer. Subagents inherit the active model. New public skills use the `ronin-*` namespace.

## Run the gate

Install Bun 1.3.14 or newer. Then run:

```sh
bun run install:tools
bun run check
```

`bun run check` is the completion gate. It validates the distribution, runs repository and tooling tests, typechecks both trees, and audits dependencies.

Focused commands:

```sh
bun run test:profiles
bun run test:tools
bun run verify
bun run typecheck:tests
bun run typecheck:tools
```

## Update from upstream

[`upstream.json`](./upstream.json) pins the public repository, commit, version, allowlist, and import digest. Audit an exact public checkout before reviewing an update:

```sh
bun scripts/audit-upstream.mjs --source /path/to/cursor-plugins/pstack
```

Import deliberately. Keep all 21 principles unless the project direction changes explicitly. Review each upstream skill against ronin's curated surface. Do not bulk-copy caches, generated dependencies, plugin packaging, or the excluded automation tree.

Preserve Lauren Tan's MIT notice. Keep the Cursor Team Kit notice with `ronin-deslop`.

The installed Cursor cache is read-only evidence. A clean contributor must reproduce the audit from the pinned public commit without Cursor installed.

## Keep changes honest

Run `bun run check` after each meaningful adaptation. Do not weaken a failing exclusion, link, or capability check to make the suite green. Fix the behavior or document the gap.

Changes to names or distribution shape need a deterministic build test. Every public link and command must resolve against the built tree.
