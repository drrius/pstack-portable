# Host capability contract

Canonical skills describe outcomes and capability requirements. The active host adapter supplies concrete tools when available, and the host's safety and permission policy always wins.

## Planning and questions

A requested checklist means the host's plan or durable state mechanism. A requested question means the host's user-input mechanism, used only when the answer cannot be discovered safely and would materially change the result.

## Delegation

A worker request defines an objective, ownership boundary, permissions, isolation, verifier, stop condition, and returned evidence. Use the host's subagent facility when authorized. If unavailable, execute the lane serially and disclose that concurrency or model diversity was not exercised.

Named pstack workers are portable personas. A Poteto Agent worker reads the pstack-core skill's `personas/poteto-agent.md`, this contract, and `skills/poteto-mode/SKILL.md` before work. A Comment Sicko worker reads the pstack-core skill's `personas/comment-sicko.md`, this contract, and `skills/no-comments/SKILL.md` before review. Host-specific generated wrappers may point to those canonical files.

## Model roles

Canonical workflows select stable roles such as `fast-code`, `deep-code`, `judgment`, `prose`, and `independent-review`. `~/.config/pstack/models.yaml` is the user-authored role map. Workers and setup read it when choosing models. A host adapter may inject or enforce it when the host supports that. Otherwise the agent applies it by omitting selection for `inherit-current` and using configured identifiers when the host accepts them. If model selection is unavailable, inherit the current model and disclose the substitution when diversity was part of the verifier.

## Persistence

A durable or autonomous run requires an observable finish condition, recorded state, and a host wait/wake mechanism. Hosts with goals or monitors map those primitives directly. A host without persistence writes a resume packet and stops honestly; it must not pretend to continue in the background.

## Transcript access

Transcript-dependent workflows use only a host adapter or an explicit user-provided path constrained to the current workspace or task. If the host exposes no readable transcript, report the capability gap instead of searching private home-directory state.

## Real-surface control

Browser, desktop, CLI, and TUI verification use the host's available real-surface tools. Static inspection is supporting evidence, not a substitute when behavior depends on interaction. If the required surface is inaccessible, return the exact manual handoff and evidence required.

## Skills and paths

pstack skills install wherever the host or the user's skill manager puts them: the Agent Skills root `~/.agents/skills`, an agent-specific directory such as `~/.claude/skills`, or a project-local `.agents/skills`. Installs may be copies or symlinks. The one requirement is that the pstack skills land side by side in the same parent directory.

This contract and the personas live inside the `pstack-core` skill. From any installed pstack skill directory, this contract is at `../pstack-core/HOST_CONTRACT.md` and the personas are under `../pstack-core/personas/`; resolve the skill directory's realpath first if a relative path does not resolve directly. If `pstack-core` is absent, report it as a missing prerequisite skill rather than searching elsewhere.

## Safety

Proceed autonomously with safe, reversible, in-scope local work. External communication, publication, merges, deployments, access changes, destructive operations, purchases, and other consequential actions require the authorization demanded by the active host and user. A workflow cannot expand its own authority.
