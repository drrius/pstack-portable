# Upstream provenance

This project derives from pstack 0.14.1, imported from the `pstack` subtree of `cursor/plugins` at commit `2a8044425c7bddf429c3bdedf3ab61e791d34d65` — the last upstream revision reviewed in full.

Upstream is a watched source, not a tracked spec. New upstream releases are diffed against the last-reviewed commit and useful changes are cherry-picked through the same adaptation pass as the original import; parity with Cursor-native pstack is a non-goal. After each review, update the pinned commit here and in `upstream.json`, and record any adopted or rejected changes in `PORTING.md`.

The initial import copied the upstream `skills/`, `docs/`, `agents/`, and `LICENSE` contents through an explicit allowlist. Agent definitions became canonical personas. The import excluded the plugin cache marker, vendored `node_modules`, Cursor packaging metadata, and the entire optional automation subtree.

The unmodified imported allowlist had 44 skills, two personas, 23 Poteto Mode playbooks, 34 skill reference files, 17 guide files, and digest `9e3347061e86a60d73138e839c6a4cd419fbefa50932bba50a0964e477d83251` using sorted per-file SHA-256 aggregation over `skills`, `docs`, `personas`, and `LICENSE`.

Cursor's local cloud-plugin manifest still named the older `6dbbdd5` revision while the installed cache directory and its 0.14.1 contents matched public commit `2a80444`. The repository pins the public content commit rather than the stale local manifest entry.

Edits are made directly in the canonical tree and reviewed as normal source changes; divergence from upstream is deliberate and recorded in `PORTING.md`. `upstream.json` is the machine-readable contract used by provenance and exclusion tests — it proves attribution, not parity.
