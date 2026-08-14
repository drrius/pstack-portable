---
name: reflect
description: Run three independent reviews over the active transcript or session digest, surface learnings, and route each to a concrete skill improvement. Use when the user says reflect.
disable-model-invocation: true
---

# Reflect

Mine the current conversation for durable learnings, then route them into skill edits.

## When to invoke

- The user said "reflect" or "/reflect".
- A complex task (5+ tool calls) just landed cleanly and the recipe is worth keeping.
- The agent hit dead ends, found the working path, and the path generalizes.
- The user corrected the agent's approach mid-task.
- A non-trivial workflow emerged that isn't captured anywhere.

Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## Process

### 1. Obtain the active transcript

Ask the active host adapter for the current conversation transcript. An explicit user-provided path is also valid when it is constrained to the current workspace or task. Never infer a host's storage layout or search private home-directory state.

Confirm the candidate belongs to this conversation by matching its metadata or opening user request. If the host exposes no readable transcript, write a tight digest from the current context, state that transcript-level tool evidence is unavailable, and pass the digest instead. Reflection continues, but reviewers must not fabricate turn citations or claims about tools they cannot inspect.

### 2. Run three independent reviewers

Define three worker requests and launch them in parallel when the host's delegation facility is available and authorized. Each request owns one lens, may read the transcript or digest and query only connected sources it references, must not modify files or external state, stops after 3-5 durable findings, and returns the template's numbered evidence list. Grant read access to relevant connected services without granting write authority.

| Lens | Stable model role | Prompt template |
|---|---|---|
| Judgment | `judgment` | `references/judgment-reviewer.md` |
| Tooling | `deep-code` | `references/tooling-reviewer.md` |
| Divergent | `independent-review` | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the transcript path or digest where marked. If delegation is unavailable, run the three lenses serially and disclose that independence was procedural rather than agent-isolated. If the host offers no alternative model, inherit the current model and disclose that the lenses shared the author's model.

### 3. Synthesize

Run a separate synthesis worker with the `judgment` role when delegation is available. Its request permits read-only citation checks through connected services but forbids repository or external writes. Use `references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. If delegation is unavailable, synthesize serially and disclose the fallback. The result is a structured Accepted / Rejected / Backlog list.

### 4. Structural enforcement check

Sanity-check the synthesizer's Accepted list. For any item that would be enforced more reliably by a lint rule, script, metadata flag, or runtime check, move it from Accepted to Backlog. The synthesizer already applies this criterion; this is a final pass before edits land. See the **encode-lessons-in-structure** principle skill.

### 5. Apply

Before applying any Accepted edit, present the synthesizer's full Accepted/Rejected/Backlog output to the user and wait for explicit approval. The user picks which subset to apply and may redirect routings. Skill changes affect every future agent in the org; do not auto-apply.

File Backlog items to the team's tracker only when the user has authorized external submissions and the host permits them. Otherwise include ready-to-file items in the result. Only the approved subset of Accepted skill edits may be applied.

For each approved Accepted item, follow the Routing field exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): parent does directly.
- Substantive existing-skill edit (a new section, a new pattern table, more than ~10 lines): use the host-provided skill-authoring capability and run its draft / test / iterate loop. If unavailable, edit against the canonical Agent Skills format and validate the result with the repository's skill validator.
- `tune description: <skill path>` (the skill exists but didn't trigger when it should have): use the skill-authoring capability's description-optimization loop, or perform an equivalent fixture-based trigger check when that capability is unavailable.
- `new skill: <kebab-name>`: use the skill-authoring capability when available; otherwise draft it in the canonical Agent Skills format and validate it. Do not copy or assume a proprietary built-in.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done. Skip this step if it doesn't.

### 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.
