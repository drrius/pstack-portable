# Upstream provenance

This port tracks pstack 0.14.1 from the `pstack` subtree of `cursor/plugins` at commit `2a8044425c7bddf429c3bdedf3ab61e791d34d65`.

The initial import copied the upstream `skills/`, `docs/`, `agents/`, and `LICENSE` contents through an explicit allowlist. Agent definitions became canonical personas. The import excluded the plugin cache marker, vendored `node_modules`, Cursor packaging metadata, and the entire optional automation subtree.

The unmodified imported allowlist had 44 skills, two personas, 23 Poteto Mode playbooks, 34 skill reference files, 17 guide files, and digest `9e3347061e86a60d73138e839c6a4cd419fbefa50932bba50a0964e477d83251` using sorted per-file SHA-256 aggregation over `skills`, `docs`, `personas`, and `LICENSE`.

Cursor's local cloud-plugin manifest still named the older `6dbbdd5` revision while the installed cache directory and its 0.14.1 contents matched public commit `2a80444`. The repository pins the public content commit rather than the stale local manifest entry.

Portable edits are made directly in the canonical tree and reviewed as normal source changes. `upstream.json` is the machine-readable contract used by provenance and exclusion tests.
