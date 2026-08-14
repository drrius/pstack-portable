---
name: no-comments
description: "Spawn Comment Sicko, fix accepted findings, and offer encodings for claimed constraints."
disable-model-invocation: true
---

# No comments

Before using this skill, locate and read `HOST_CONTRACT.md` from the ronin installation root. From this skill's installed directory, the contract is at `../ronin-core/HOST_CONTRACT.md` (the sibling ronin-core skill; resolve this skill's realpath first if the path does not resolve directly). Use its delegation, persona, and safety rules. If it is unavailable, stop and report that the ronin-core skill is not installed alongside this one.

Spawn Comment Sicko. Act on accepted findings.

Authoring agents defend comments. Defer to Comment Sicko's fresh perspective.

## Scope

Use the caller's files or diff. Otherwise use the current diff against the base branch, default `main`, including the working tree.

## Steps

1. Launch a comment-only Comment Sicko worker through the host's subagent capability with the `implement` profile because it owns a bounded comment-editing scope. Its request points to `../ronin-core/personas/comment-sicko.md`, this skill, and `../ronin-core/HOST_CONTRACT.md`; pass the review scope, permissions to edit comments but not application code, isolated write boundary, verifier, stop condition, and required report without restating the persona. If parallel execution is unavailable but a separate worker context remains available, run the persona serially and disclose lost concurrency only. If no separate worker context is available, run the pass in the coordinator and disclose that fresh context was not exercised.
2. Inspect its report and diff. Reject application-code edits, scope escapes, exception-protected deletions, misstated `MUST KILL` reasons, and flags that treat kept intentional code as guilty. Reshape flags on our-code surprises stay actionable. Do not restore those comments. A keep survives only with proof it is about something we cannot change. Audit missed scoped lint and TypeScript suppressions. Correctness or safety suppressions stay actionable `MUST KILL`s. Restore deletions only with exact exceptions and scoped proof. Before accepting thin `IMPORTANT` or `do not remove` kills or keeps, run `/how` or `/why` on their symbol. If a kill is ambiguous, do not restore. If a keep is refuted or still ambiguous, delete it. Revert and rerun one rejected report with the failure named. Reject a second, report it open, and fail `/no-comments`.
3. Fix trivial accepted flags directly by deleting a dead path, dropping a parameter, or using the real API. If any fix needs a shape, run `/architect` once for the accepted set and surrounding code. Stop at the sketch. Architect shapes. Step 4 implements.
4. Implement the smallest root-cause fix in scope. Remove every named workaround. If the root cause is out of scope, land the smallest in-scope fix and report the rest open. The **principle-fix-root-causes** and **principle-redesign-from-first-principles** skills guide intent only: fix real causes, redesign as if requirements always existed, never bolt on symptom guards. Neither authorizes widening the fence nor fixing instances outside it.
5. Constraint comments say `do not remove`, `do not change wording`, or `talk to X before changing`. Leave keeps about things we cannot change. Offer the cheapest in-scope type, runtime, test, or CI lint. Wait for interactive approval. Unattended and eval require caller pre-approval. If approved, encode then delete. Otherwise delete, report the constraint open, and sketch out-of-scope work.
6. Report the deletion count, restored comments, reruns, architect sketch, fixes, encoding offers, encodings, unenforced constraints, and other open work.
