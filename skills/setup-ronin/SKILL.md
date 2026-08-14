---
name: setup-ronin
description: Configure pstack's stable model roles. Use for /setup-ronin, "configure pstack models", or changing pstack's model choices.
---

# Setup ronin

Configure the mapping from pstack's stable roles to models the user can run. Canonical workflows name roles, never provider-specific model IDs. Agents read `~/.config/pstack/models.yaml` when selecting models. A host adapter may inject or enforce that map when the host supports it. Otherwise the agent applies it by omitting selection for `inherit-current` and using configured identifiers when the host accepts them.

The roles are:

- `fast-code`: cheap, mechanical implementation and corpus search.
- `deep-code`: precisely specified, difficult implementation and debugging.
- `judgment`: ambiguous design, prioritization, and synthesis.
- `prose`: explanations and user-facing writing.
- `independent-review`: adversarial review and comparison; this may map to a list when the host supports model diversity.

## Steps

### 1. Inspect host capabilities

Inspect the host's model-routing capability, current role mapping, and models available to this user. Treat that response as authoritative. Do not infer model access from documentation, model names seen in prose, or another host's configuration.

If the host cannot enumerate models but accepts a user-configured model identifier, ask the user for the identifiers they want to use and explain that availability can be verified only when a worker is launched. If the host cannot select models at all, explain that every role will inherit the current model and that reviewer diversity is unavailable until the host offers a second model. This is a supported capability fallback, not an error.

### 2. Load current state

Read `~/.config/pstack/models.yaml` when it exists. This host-neutral user configuration lives outside the replaceable installation tree. Never search another host's private configuration directories. Missing roles inherit the current model.

### 3. Map and confirm

Show every stable role with its current mapping. Mark a concrete identifier as unverified when the host could not enumerate availability. Use the host's user-input mechanism to ask whether to keep the mapping or change specific roles.

For `independent-review`, preserve a configured list when the host supports selecting a model per worker; its length sets the default review-panel size. When the host supports only one model or no explicit selection, keep the workflow's fan-out but inherit the current model and disclose that the panel shared one model. Different models within one provider's family count as full diversity; a single-provider host is not a degraded host.

### 4. Validate and write

Validate the complete mapping before writing it. Every concrete identifier must be in the host's enumerated set when enumeration is available. If enumeration is unavailable, preserve the user's identifiers as explicitly unverified rather than claiming they work.

Write `~/.config/pstack/models.yaml` atomically and preserve the other hosts' sections unchanged. Re-running this skill must produce the same state for the same choices. The file is keyed by host — each top-level key names a host (`claude`, `codex`, or another adapter name) and holds that host's complete role map, because model identifiers are host-specific and one user works across hosts. A host reads only its own section; a host with no section inherits the current model for every role. The file has this shape:

```yaml
claude:
  fast-code: inherit-current
  deep-code: inherit-current
  judgment: inherit-current
  prose: inherit-current
  independent-review:
    - inherit-current
codex:
  deep-code: { model: example-identifier, effort: xhigh }
```

A role value is a model identifier, `inherit-current`, or a mapping with `model` and optional `effort` when the host supports selecting reasoning effort per worker; a bare identifier uses the host's default effort. `inherit-current` is a pstack semantic value, not a model identifier. Apply it by omitting explicit model selection. A host may inject the same omission when it can. Validate any `effort` against the host's supported levels for that model when the host enumerates them.

### 5. Confirm

Tell the user which roles inherit the current model, which identifiers remain unverified, and whether the host applies the change immediately or only to new sessions. Never claim reviewer diversity when every role inherited the same model.

### 6. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof, such as a `verify-*` skill or an existing harness. If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work?" On yes, invoke the bundled **create-verification-skill** skill through the host's skill mechanism, or read and execute its `SKILL.md` directly when invocation is unavailable. On no, move on without pushing.
