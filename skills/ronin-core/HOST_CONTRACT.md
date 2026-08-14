# Host capability contract

Canonical skills describe outcomes and capability requirements. Use the host's native tools. The host's safety and permission policy always wins.

## Planning and questions

A requested checklist means the host's plan or durable state mechanism. A requested question means the host's user-input mechanism, used only when the answer cannot be discovered safely and would materially change the result.

## Delegation

A worker request defines an objective, ownership boundary, permissions, isolation, verifier, stop condition, and returned evidence. Use the host's native subagent facility when authorized. Every subagent inherits the active model. Ronin does not select or configure models.

Run independent lanes concurrently when the host supports it. Otherwise run them serially in fresh worker contexts. If no separate worker context is available, execute in the coordinator and disclose that fresh-context review was not exercised. Lost concurrency and lost review separation are different limitations. Report them separately.

Named ronin workers are prompt files, not host registrations. A Poteto Agent worker reads the ronin-core skill's `personas/poteto-agent.md`, this contract, and `skills/ronin/SKILL.md` before work. A Comment Sicko worker reads the ronin-core skill's `personas/comment-sicko.md`, this contract, and `skills/ronin-no-comments/SKILL.md` before review.

## Task profiles

Every delegated leaf task lane has one primary behavioral profile. A profile defines the job. It does not change the inherited model. Operational coordinators and control-plane roles that only frame work, route briefs, drain queues, wait, or maintain durable state sit outside the profile system. If one of those roles also executes a leaf task, assign that leaf work its own profile.

- `explore`: investigate read-only, map the relevant surface, and return evidence plus uncertainties.
- `implement`: own one bounded write scope, produce the change, and run the checks available inside that scope.
- `judge`: compare or challenge artifacts against an explicit rubric without writing to the target.
- `explain`: translate grounded evidence for the intended audience without changing the source.
- `verify`: independently exercise acceptance criteria on the required surface and return pass, fail, or blocked with receipts.

The machine-readable definitions live in `task-profiles.json` beside this contract. `targetWrites: false` forbids modifying the source, candidate, or implementation under examination; it does not prevent a worker from returning or writing its explicitly assigned local report, scorecard, explanation, or verification artifact. External writes remain approval-gated under the Safety section; a task profile never authorizes them. A worker request still supplies the concrete objective, boundaries, verifier, and evidence for the lane; naming a profile is not a substitute for the brief.

## Review separation

A review is either `self-review` or `fresh-context-review`. Fresh context requires a separate subagent or session that did not author the work. Repeating a pass inside the author's context remains self-review.

Report which one happened. Reviewer count and agreement are supporting context, not proof. Confidence comes from reproducible evidence and verified acceptance criteria.

## Persistence

A durable or autonomous run requires an observable finish condition, recorded state, and a host wait/wake mechanism. Hosts with goals or monitors map those primitives directly. A host without persistence writes a resume packet and stops honestly; it must not pretend to continue in the background.

## Transcript access

Transcript-dependent workflows use the host's native transcript access or an explicit user-provided path constrained to the current workspace or task. If the host exposes no readable transcript, report the capability gap instead of searching private home-directory state.

## Real-surface control

Browser, desktop, CLI, and TUI verification use the host's available real-surface tools. Static inspection is supporting evidence, not a substitute when behavior depends on interaction. If the required surface is inaccessible, return the exact manual handoff and evidence required.

## Source forge

Pull request work — creating, reading, merging, retargeting, and judging merge readiness — goes through the repository's forge, detected per repository from `git remote get-url origin`: a `github.com` remote means GitHub through `gh`; a `dev.azure.com` or `*.visualstudio.com` remote means Azure DevOps through `az repos`. Never mix one forge's commands with another's repository. When the remote matches no supported forge, or the forge CLI is unavailable, return the exact PR operations needed as a manual handoff instead of improvising raw API calls.

Forge equivalences the workflows rely on: GitHub PR state OPEN/MERGED/CLOSED corresponds to Azure DevOps active/completed/abandoned, and GitHub auto-merge corresponds to Azure DevOps auto-complete — including the rule that neither may ever be armed on a stacked pull request, because a child targeting its unprotected parent merges immediately and collapses the stack.

## Skills and paths

ronin skills install wherever the host or the user's skill manager puts them: the Agent Skills root `~/.agents/skills`, an agent-specific directory such as `~/.claude/skills`, or a project-local `.agents/skills`. Installs may be copies or symlinks. The one requirement is that the ronin skills land side by side in the same parent directory.

This contract and the personas live inside the `ronin-core` skill. From any installed ronin skill directory, this contract is at `../ronin-core/HOST_CONTRACT.md` and the personas are under `../ronin-core/personas/`; resolve the skill directory's realpath first if a relative path does not resolve directly. If `ronin-core` is absent, report it as a missing prerequisite skill rather than searching elsewhere.

## Safety

Proceed autonomously with safe, reversible, in-scope local work. External communication, publication, merges, deployments, access changes, destructive operations, purchases, and other consequential actions require the authorization demanded by the active host and user. A workflow cannot expand its own authority.
