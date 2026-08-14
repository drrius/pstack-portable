# Releasing

A release candidate is ready only when a clean checkout proves the claim.

1. **Confirm provenance.** Check out the commit pinned by `upstream.json` from the public `cursor/plugins` repository and run `bun scripts/audit-upstream.mjs --source /path/to/checkout/pstack`. The version, inventory, Lauren Tan license notice, and import digest must match.
2. **Verify the runtime.** Record `bun --version` and `bun --revision`. Run `bun run install:tools`, then require a green `bun run check`.
3. **Exercise a clean checkout.** Clone the candidate without ignored files. Run the complete gate and build twice. Both builds must match.
4. **Inspect the artifact.** It contains only `skills`, `docs`, and the required notices. Cached dependencies, private paths, host adapters, and installer state do not belong there.
5. **Test installation through the skills CLI.** Install the full set into a disposable project. Confirm `ronin`, one sibling skill, and `ronin-core` resolve together. Remove the test install with the same CLI.
6. **Record the candidate.** Put the exact commands, versions, digests, capability fallbacks, and commit in the release notes.

Creating a public repository, pushing a remote, publishing a package or release, and announcing the project are separate user-controlled actions. Passing this checklist does not authorize them.
