---
name: setup-ronin
description: Configure optional model and reasoning-effort routing for ronin task profiles. Use for /setup-ronin, "configure ronin models", or changing ronin's profile routing.
---

# Setup ronin

Configure optional routing from ronin's behavioral task profiles to models the user can run. Profiles define the job and remain the same on every host. Agents read `~/.config/ronin/models.yaml` only to choose a model or reasoning effort for that job. Without the file, every profile inherits the current model and ronin remains fully usable.

## Task profiles

The profiles are:

- `explore`: read-only investigation with evidence and uncertainties.
- `implement`: one bounded write scope plus local checks.
- `judge`: read-only comparison or challenge against a rubric.
- `explain`: grounded communication for an intended audience.
- `verify`: independent acceptance testing with pass, fail, or blocked evidence.

Do not recommend a weaker model merely to give profiles different identifiers. Route to a cheaper or faster model only when the user wants that tradeoff and the task fits it; route to a stronger model when the task needs it. One frontier model across all five profiles is a valid default.

## Steps

### 1. Inspect host capabilities

Inspect the host's model-routing capability, current profile mapping, and models available to this user. Treat that response as authoritative. Do not infer model access from documentation, model names seen in prose, or another host's configuration.

If the host cannot enumerate models but accepts a user-configured model identifier, ask the user for the identifiers they want to use and explain that availability can be verified only when a worker is launched. If the host cannot select models at all, explain that every profile inherits the current model. That is the supported default, not a degraded mode.

### 2. Load current state

Read `~/.config/ronin/models.yaml` when it exists. This host-neutral user configuration lives outside the replaceable installation tree. Never search another host's private configuration directories. Missing profiles inherit the current model.

### 3. Map and confirm

Show every task profile with its current mapping. Mark a concrete identifier as unverified when the host could not enumerate availability. Use the host's user-input mechanism to ask whether to keep the mapping or change specific profiles.

Fan-out count belongs to the calling workflow, not this model map. Several `judge` or `verify` workers may therefore share one configured route. Do not expand a panel or select a different model just to claim diversity. Review output reports the achieved provenance separately from the task profile.

### 4. Validate and write

Validate the complete mapping before writing it. Every concrete identifier must be in the host's enumerated set when enumeration is available. If enumeration is unavailable, preserve the user's identifiers as explicitly unverified rather than claiming they work.

Write `~/.config/ronin/models.yaml` atomically and preserve the other hosts' sections unchanged. Re-running this skill must produce the same state for the same choices. The file is keyed by host — each top-level key names a host (`claude`, `codex`, or another adapter name) and holds that host's profile routes, because model identifiers are host-specific and one user works across hosts. A host reads only its own section; a host with no section inherits the current model for every profile. The file has this shape:

```yaml
claude:
  explore: inherit-current
  implement: inherit-current
  judge: inherit-current
  explain: inherit-current
  verify: inherit-current
codex:
  implement: { model: example-identifier, effort: xhigh }
```

A profile route is a model identifier, `inherit-current`, or a mapping with `model` and optional `effort` when the host supports selecting reasoning effort per worker; a bare identifier uses the host's default effort. `inherit-current` is a ronin semantic value, not a model identifier. Apply it by omitting explicit model selection. A host may inject the same omission when it can. Validate any `effort` against the host's supported levels for that model when the host enumerates them.

### 5. Confirm

Tell the user which profiles inherit the current model, which identifiers remain unverified, and whether the host applies the change immediately or only to new sessions. State that task behavior comes from the profile contract, not from using distinct models. Do not claim model or provider diversity that the host did not establish.

### 6. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof, such as a `verify-*` skill or an existing harness. If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work?" On yes, invoke the bundled **create-verification-skill** skill through the host's skill mechanism, or read and execute its `SKILL.md` directly when invocation is unavailable. On no, move on without pushing.
