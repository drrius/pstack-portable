---
name: ronin-interrogate
description: "Use for \"interrogate\", \"adversarial review\", \"challenge this\", \"stress test this code\", \"find blind spots\", or \"tear this apart\". Fresh-context reviewers challenge changes through distinct task lenses."
disable-model-invocation: true
---

# Interrogate

Before using this skill, locate and read `HOST_CONTRACT.md` from the ronin installation root. From this skill's installed directory, the contract is at `../ronin-core/HOST_CONTRACT.md` (the sibling ronin-core skill; resolve this skill's realpath first if the path does not resolve directly). Use its delegation, `judge` profile, review-separation, and safety rules for every reviewer. If it is unavailable, stop and report that the ronin-core skill is not installed alongside this one.

Launch several fresh-context `judge` workers to adversarially review code changes. They share the intent and rubric but receive distinct primary lenses. Every worker inherits the active model. Findings earn confidence through concrete, reproducible evidence, not reviewer count alone.

The deliverable is a synthesized verdict. Do NOT auto-apply changes.

## Step 1, Determine Scope

Identify what to review from context:

- If the user points at specific files or a diff, use that
- If on a feature branch, run `git diff main...HEAD` (or the appropriate base branch) for the full changeset
- If the user's message references recent work, gather the relevant files

Package the diff (or file contents) plus any surrounding context files the reviewers need to understand the code.

## Step 2, State the Intent

Before spawning reviewers, state the intent explicitly. What is this code trying to accomplish? Derive this from:

- The user's message
- Commit messages
- PR description if one exists
- The code itself

Write one clear paragraph. Reviewers challenge whether the work achieves the intent well, not whether the intent itself is correct. If you're unsure about the intent, ask the user before proceeding.

## Step 3, Spawn Reviewers

Launch four `judge` workers concurrently by default. Change the count only because scope warrants it.

| Reviewer | Primary task profile and lens |
|----------|--------------|
| Reviewer A | `judge`, correctness and data flow |
| Reviewer B | `judge`, security and failure boundaries |
| Reviewer C | `judge`, maintainability and architecture |
| Reviewer D | `judge`, simplicity and scope |

Every reviewer gets a fresh-context, non-writing request with the objective, review scope, primary lens, permissions, verifier, stop condition, and required findings. Run the workers serially if the host cannot run them concurrently but can preserve separate contexts; disclose lost concurrency only. If delegation is unavailable, perform distinct passes in the coordinator and report `self-review`.

Read `references/reviewer-prompt.md` and fill in the template with:
1. The stated intent
2. The diff or file contents
3. The review rubric from `references/rubric.md`
4. The code-quality lens from `references/code-quality-review.md`

The same filled template goes to all reviewers, with each reviewer's primary lens added, so coverage differs without changing the shared rubric.

Each reviewer produces structured findings as described in the prompt template.

## Step 4, Synthesize

As results come back, build a unified picture:

1. **Parse all findings** from the reviewers
2. **Reproduce the evidence**. A concrete execution path or failing check outranks agreement.
3. **Identify corroboration**. Several fresh-context passes citing the same evidence strengthen the case; head count without evidence does not.
4. **Deduplicate**. Different passes may describe the same issue differently. Merge them and retain each evidence pointer.
5. **Note disagreements**. Conflicting findings identify an assumption, evidence gap, or rubric edge the lead must resolve.

## Step 5, Lead Judgment

You are the lead reviewer, a pragmatic senior engineer, not a neutral aggregator.

Read `references/lead-judgment.md` for the full framework. Reviewers only see a slice of the codebase. You have the full context (the goal, the constraints, the timeline, which tradeoffs were already considered). Use that context aggressively.

Categorize every finding using these buckets:

- **Act on**. Real issues affecting correctness, security, or maintainability given the actual goals. These would block a real PR.
- **Consider**. Legitimate points, but you're not sure they outweigh the cost of addressing them right now. Worth the user's attention.
- **Noted**. Technically valid but not actionable. Context-dependent, premature optimization, or low-impact given the current stage.
- **Dismissed**. Wrong, nitpicky, or missing context. Brief explanation why.

For each finding, include:
- Which reviewer passes raised it and whether they had fresh context
- The category (act on / consider / noted / dismissed)
- A one-line rationale for the categorization

## Output Format

Present the verdict in this structure:

### Intent
> [The stated intent paragraph from Step 2]

### Reviewers
- Reviewer [label]: [fresh-context-review or self-review], [N findings] (one bullet per reviewer)

### Act On
[Findings that should be addressed. For each: description, evidence, which passes raised it, why it matters.]

### Consider
[Findings worth thinking about. For each: description, evidence, which passes raised it, tradeoff involved.]

### Noted
[Valid but low-priority. Brief list.]

### Dismissed
[Rejected findings with brief rationale. This shows the user what was filtered out and why, so they can override your judgment if they disagree.]

### Evidence Map
[Which findings were reproduced, which were only corroborated, where passes disagreed, and what evidence resolved the disagreement?]
