---
name: swarm
description: "Fan out N parallel workers, drain them, and return one report. Use for /swarm, 'swarm this', or parallel coverage, races, gauntlets, and exploration."
disable-model-invocation: true
---

# Swarm

Before using this skill, locate and read `HOST_CONTRACT.md` from the ronin installation root. From this skill's installed directory, the contract is at `../ronin-core/HOST_CONTRACT.md` (the sibling ronin-core skill; resolve this skill's realpath first if the path does not resolve directly). Use its delegation, isolation, task-profile, and safety rules for every worker. If it is unavailable, stop and report that the ronin-core skill is not installed alongside this one.

Fan out N parallel workers. They may cover separate slices, race the same brief, or mix both. The parent waits, aggregates, and returns one report.

## Start

Open a todolist with one entry per phase before launching anything.

1. Frame
2. Fan out
3. Aggregate
4. Report

## Phase A: Frame

1. State the done predicate and the artifact or report the swarm must return.
2. Choose the shape. Partition into slices, race N workers on identical briefs, or mix both. For a race or mixed shape, declare `first pass`, `rank all`, or `best-of` before spawning.
3. Set N from the user or derive it from the shape. N is total workers, not the host's concurrency limit.
4. Pick the task profile from lane behavior. Use `explore` for read-only coverage, `implement` for a writable slice, `judge` for evaluation-only arms, and `verify` for independent acceptance-proof lanes. Every race arm uses the profile its job requires. Optional model routing may vary for capability, latency, or cost, but is not how the race creates distinct approaches.
5. Give each worker its own writable output when it writes. Use a worktree, branch, or `/tmp/swarm-<slug>/worker-<n>/`.

## Phase B: Fan out

Launch all N workers concurrently through the host's subagent capability. Every request names its primary task profile and defines the objective, ownership boundary, permissions, isolation, verifier, stop condition, and returned evidence. Tell the host adapter when a worker needs machine-local state or must start from a particular branch; the adapter supplies the concrete environment mechanics. If parallel execution is unavailable but separate worker contexts remain available, execute the lanes serially and disclose lost concurrency only. If no separate worker context is available, execute the lanes in the coordinator, disclose that fresh context was not exercised, and report concurrency separately.

Every brief stands alone. Include the goal, scope, exact slice or race arm, how to verify, and what to report. Coverage and evaluation lanes use `PASS`, `ISSUES`, or `BLOCKED` with evidence; `verify` lanes use the canonical `PASS`, `FAIL`, or `BLOCKED` verdict.

If a worker drops out, proceed with N-1 and note it.

## Phase C: Aggregate

Read the terminal results. For coverage, every required slice needs a result. For a race, apply the selection rule declared up front. Use first pass, rank all, or best-of. Do not paste raw worker dumps.

Keep a compact result table, one-line evidenced issues, and explicit gaps or dropouts.

## Phase D: Report

Return one consolidated in-chat report with the table, issue one-liners, gaps or dropouts, and the race rule when used.
