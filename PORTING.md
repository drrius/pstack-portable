# What ronin changes

ronin is a curated Agent Skills project derived from pstack 0.14.1. Parity is not the goal.

## What stays

All 21 principles stay. They are the intellectual core.

Twenty-two working skills stay with them. That includes understanding, architecture, delegation, review, verification, cleanup, writing, and durable-run workflows. `deslop` remains as `ronin-deslop` under Cursor Team Kit's MIT license.

## What goes

Three upstream skills are excluded:

- `arena` depended on independent model perspectives to make repeated attempts worth the ceremony. `ronin-architect` gets design breadth by naming structurally different directions before workers explore them.
- `automate-me` was useful but peripheral. `ronin-reflect` still captures lessons from completed work.
- `setup-pstack` configured model roles. ronin has no model configuration.

The optional automation pack, Cursor plugin metadata, cache markers, vendored dependencies, proprietary loader behavior, cloud-agent syntax, and `/loop` command are also excluded.

## Names stay distinct

Every retained skill uses the ronin namespace. The front door is `/ronin`. Every other public command starts with `ronin-`.

Cursor can now show Lauren's pstack and ronin in the same picker without ambiguous commands. Cursor users should still prefer pstack. It is native there.

The 21 principle skills use `user-invocable: false`. The router can read them, but they do not flood the command picker.

## Delegation stays simple

ronin asks the host for native subagents. Every worker gets a job, scope, permissions, verification requirement, stop condition, and evidence contract.

Subagents inherit the active model. There is no model map, provider tier, reasoning-effort router, or host adapter layer. When subagents are unavailable, the coordinator runs the work itself and reports the lost concurrency or fresh context.

`ronin-review` reports one of two things. `self-review` means the coordinator judged its own work. `fresh-context review` means a separate worker judged it without the implementation context.

## Host capabilities are discovered

Skills ask for capabilities through [`skills/ronin-core/HOST_CONTRACT.md`](./skills/ronin-core/HOST_CONTRACT.md). The host decides how to provide them.

| Need | Preferred behavior | Fallback |
| --- | --- | --- |
| Parallel work | Native subagents with isolated scopes | Run serially and disclose lost concurrency |
| Fresh review | A new subagent context | Self-review and label it |
| Durable work | Host goals, waits, or monitors | Write a resume packet and stop |
| Transcript evidence | Workspace-scoped transcript access | Report it unavailable |
| Browser, CLI, or UI control | Drive the real surface | Return an exact manual verification handoff |
| Skill authoring | Host-provided authoring support | Write and validate the Agent Skill directly |

No host-specific code lives in an adapter directory. Capability checks belong to the skill that needs them.

## Other deliberate changes

- Graphite is gone. Stack workflows use plain `gh` or `az`, merge bottom-up, and retarget each successor by hand.
- PR workflows detect GitHub or Azure DevOps from the git remote. The bundled PR watcher remains GitHub-only and says so elsewhere.
- `npx skills add` is the installer. The repository has no custom global install or uninstall path.
- The installed Cursor plugin is evidence only. Build and verification never modify it.

## Safety

Host safety wins. Reversible local work can proceed within scope. Publication, merges, deployments, external messages, access changes, destructive actions, and paid operations still need the authorization required by the active host and user.
