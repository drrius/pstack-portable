# Releasing

A release candidate is ready only when it is reproducible from a clean checkout and leaves no unpublished evidence gap.

1. **Confirm provenance.** Check out the commit pinned by `upstream.json` from the public `cursor/plugins` repository and run `node scripts/audit-upstream.mjs --source /path/to/checkout/pstack`. The version, inventory, Lauren Tan license notice, and import digest must match.
2. **Verify both runtime paths.** Run `npm test`, install the tooling package with its lockfile, require a clean `npm run audit:tools`, then run its 52 tests and strict typecheck. If Bun support is claimed for the release, repeat the tooling test and typecheck with the recorded Bun version.
3. **Exercise a clean checkout.** Clone the local candidate without borrowing ignored files, run every verifier, build twice, and run the isolated-home lifecycle. The verifier must prove collision refusal, installed router/playbook/sibling/persona readback, idempotent reinstall, exact uninstall, and preservation of unrelated files.
4. **Inspect the artifact.** Confirm the generated manifest is deterministic and machine-neutral, cached dependencies and private paths are absent, and the distribution contains only the canonical source plus adapters and notices.
5. **Install deliberately.** Run the real-home dry run, inspect every collision, install only if it is clean, and run `npm run verify:installed`. Do not overwrite a pre-existing global skill or persona alias.
6. **Record the candidate.** Update `RESULT.md` with exact commands, versions, digests, intentional differences, capability fallbacks, and the Git commit being released.

Creating a public repository, pushing a remote, publishing a package or release, and announcing the project are separate user-controlled actions. Passing this checklist does not authorize them.
