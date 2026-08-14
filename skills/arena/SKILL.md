---
name: arena
description: "Spawn N parallel candidates at the same task, pick a base, graft the strongest parts of the losers into it. Use for /arena, 'arena this', 'throw it in the arena', or when one attempt at a non-trivial artifact would lock in the wrong shape."
disable-model-invocation: true
---

# Arena

Before using this skill, locate and read `HOST_CONTRACT.md` from the ronin installation root. From this skill's installed directory, the contract is at `../ronin-core/HOST_CONTRACT.md` (the sibling ronin-core skill; resolve this skill's realpath first if the path does not resolve directly). Use its delegation, task-profile, isolation, provenance, and safety rules for every candidate and judge. If it is unavailable, stop and report that the ronin-core skill is not installed alongside this one.

Fan out N parallel attempts at the same task. Read every candidate end to end. Pick the strongest as the base. Graft the best ideas from the others into it. Verify the synthesized result.

## Start

Open a todolist with one entry per phase before launching anything. The arena runs autonomously and the list keeps phases from silently disappearing.

1. Frame
2. Fan out
3. Cross-judge
4. Pick
5. Graft
6. Verify

## Phase A: Frame

The N candidates share one core task and grounding packet, so that common brief is the contract. Get it right before spawning anything.

1. State the artifact each candidate is producing.
2. Derive the rubric. State what success looks like for *this* task, then turn it into 3-6 concrete gradeable criteria. Concrete: `Adds a --dry-run flag that skips writes`. Vague: `code is correct`. The rubric is the picker's tool in Phase D; candidates only see the task.
3. Pick the runners. Default to four candidates. Assign `explore` when the artifact is a design or analysis and `implement` when the candidate writes code or another target artifact. By default, give every candidate a distinct approach, constraint, or hypothesis so breadth is intentional. A controlled evaluation may instead give candidates an identical brief when prompt variance would invalidate the comparison; label that mode and record why identical briefs are required. Optional model routing may tune a profile, but never substitute model IDs for different briefs. Outside a controlled evaluation, spawn more only when the arena covers more genuinely distinct directions.
4. Assign output paths. Each candidate writes only its own result artifact or isolated target (a git worktree where possible for `implement`, otherwise `/tmp/arena-<slug>/candidate-<n>/`). An `explore` candidate may write its assigned design or analysis artifact but may not modify the target source. N candidates writing to the same path is shared mutable state and fails the the **separate-before-serializing-shared-state** principle skill test.

## Phase B: Fan out

Launch all N candidates concurrently through the host's subagent capability. Every request explicitly names `explore` or `implement`, plus the objective, ownership boundary, permissions, isolated output path, verifier, stop condition, shared grounding path, required artifact, and rationale. Include either the candidate's distinct direction or the controlled-evaluation label and reason for an identical brief. If parallel execution is unavailable, run candidates as serial fresh-context workers in the same isolated locations and disclose lost concurrency only. If no separate worker context is available, run the passes in the coordinator, disclose that fresh context was not exercised, and report concurrency separately.

The rationale is mandatory. Without it, the parent cannot tell whether a candidate's structure is principled or accidental, which makes Phase E grafting unreliable. Each rationale names the alternatives the candidate considered and what it rejected.

If a candidate fails to produce output, proceed with N-1 and note the dropout in the synthesis record.

## Phase C: Cross-judge

After all Phase B candidates complete, launch one non-writing worker with the `judge` profile. The judge sees the rubric and candidates by blinded path label, scores each criterion, and recommends a base with rationale. It runs in a fresh context concurrently with the parent's reading in Phase D, never while candidates are still writing. Optional model routing may select a suitable judge, but a distinct model is not required. If parallel execution is unavailable, run the judge serially in a fresh context and disclose lost concurrency only. If no separate worker context is available, perform the judging pass in the coordinator and report `self-review` provenance.

## Phase D: Pick a base

Read every candidate end to end before picking. Skimming N candidates surfaces only the candidate whose surface looks most familiar.

Score each candidate against the rubric criterion by criterion, not on holistic feel. Compare against the cross-judge. Agreement is corroboration only when both decisions cite evidence that holds up. Disagreement means the evidence, candidate rationale, or rubric needs another look; inspect all three before deciding.

Pick the base on which candidate a future maintainer can extend most easily without breaking invariants. Prefer the cleaner boundary or smaller surface area when two feel tied, per the Laziness Protocol.

Record the pick and the reason in a short synthesis note alongside the base artifact, including the cross-judge's verdict.

## Phase E: Graft

Walk each losing candidate once more and identify what is worth porting into the base. The signal is usually one or two things per candidate, not most of it.

Fold each graft in by hand, per the **redesign-from-first-principles** principle skill. Don't paste mechanically. The result has to remain coherent under one mental model.

Record what was grafted, from which candidate, and what was rejected and why. The rejection notes are the highest-signal part of the record. Future readers learn from what you considered and dropped, not just what you kept.

When N candidates converge on the same shape, record the convergence but do not treat head count as proof. Verify the shared assumptions before keeping the shape. No graft is needed when the common result survives that check. Divergent approaches under the same shared goal, acceptance criteria, and constraints are useful arena evidence. Treat divergence as a Phase A framing failure only when candidates disagree about that shared goal, acceptance criteria, or constraints; then reframe and re-run rather than averaging incompatible tasks.

## Phase F: Verify

Hand the synthesized artifact to the `verify` profile on the real acceptance surface when a fresh verifier is proportionate. Otherwise run the exact verifier directly and record self-verification. The artifact has to hold up under the same scrutiny as any other output, per the **prove-it-works** principle skill. The arena does not earn you a pass.

If verification surfaces a problem the arena did not catch, either Phase A was wrong (re-frame and re-run) or one candidate caught it and you missed the graft (go back to Phase E). Don't paper over.

## Outputs

One synthesized artifact. One short synthesis note alongside, naming the base, the grafts (with source candidate), the rejections, the dropouts if any, and the verification result.
