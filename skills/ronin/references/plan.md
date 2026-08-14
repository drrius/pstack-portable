# Plan

Produce a phased implementation plan grounded in the **Principles** section of the `ronin` skill. The plan is the deliverable. Do not implement.

Open a todolist with one item per step below.

## 0. Triage

Skip the plan when the change is one or two files with an obvious approach. Say so and stop.

Plan when the change spans three or more files, introduces architecture, has competing approaches or unclear scope, or the user asked for one.

## 1. Re-read principles

Read the **Principles** section of the `ronin` skill end to end, and the leaf `ronin-principle-*` skills it indexes. The principles govern every plan decision; cross-link them.

## 2. Scope and constraints

State your read of scope and constraints in one paragraph. Use the host's user-input mechanism only for genuinely ambiguous intent (the **ronin-principle-never-block-on-the-human** principle skill); give concrete options with each open question.

Resolve what is in scope vs explicitly out, technical or platform constraints, patterns to preserve, and the definition of done.

## 3. Explore in subagents

Delegate codebase exploration (the **ronin-principle-guard-the-context-window** principle skill).

- Prefer a ronin agent, which reads the ronin-core skill's `personas/ronin-agent.md` and `HOST_CONTRACT.md`, plus `skills/ronin/SKILL.md`, before work. A general worker is the fallback when the host cannot load named personas.
- Assign `explore` to source investigation and `judge` to architectural interpretation. Both inherit the active model.

Each explorer returns file pointers, conventions, dependencies, test infrastructure, and entry points. No inlined dumps.

## 4. Write the plan

The user specifies where the plan lives.

Single file `NN-slug.md` for small plans. For three or more phases, a directory with `overview.md` plus phase files:

```
NN-slug/
├── overview.md
├── phase-1-scaffold.md
├── phase-2-...md
└── testing.md
```

### Phase sizing

- One function or type plus tests, or one bug fix. Not "one file".
- Two to three files touched, max.
- Prefer eight to ten small phases over three to four large ones to preserve option value (the **ronin-principle-foundational-thinking** principle skill).
- Split if a phase has more than five test cases or three functions.

### Overview file

- **Context.** Problem and why now.
- **Scope.** Included; explicitly excluded.
- **Constraints.** Technical, platform, dependency, pattern.
- **Alternatives.** Two or three approaches sketched, choice and rationale (the **ronin-principle-exhaust-the-design-space** principle skill). Skip when constraints dictate one.
- **Applicable skills.** Domain skills the implementer should invoke, by name.
- **Phases.** Ordered standard-markdown links to phase files.
- **Verification.** Project-level commands.
- **Implementation guidance.** Per section 6.

### Phase files

- Back-link to overview.
- **Goal.** What the phase accomplishes.
- **Changes.** Files affected and the change at a high level. What and why, not how. No code snippets.
- **Data structures.** Name the key types or schemas. One-line sketch only (the **ronin-principle-foundational-thinking** principle skill).
- **Verification.** Per section 6.

Order phases so infrastructure and shared types land first (the **ronin-principle-foundational-thinking** principle skill). Each phase should be independently shippable.

For changes touching existing code, apply the **ronin-principle-redesign-from-first-principles** principle skill: if we'd built this with the new requirement on day one, what would it look like? Redesign holistically; deliver incrementally.

If a phase creates or edits a skill, the phase instructs the implementer to use the host's skill-authoring capability. If unavailable, follow repository `SKILL.md` conventions directly and disclose the missing authoring workflow.

## 5. Verification per phase

Each phase needs both:

**Static.** Type check, lint, project tests pass.

**Runtime.** Exercise the feature on the matching surface via the relevant control skill:

- Browser / Electron / Web UIs: the host's browser or desktop real-surface control capability.
- CLIs and TUIs: the host's PTY, terminal, or TUI control capability.
- Native mobile: whatever simulator-driving skill your team has.
- No control skill for the touched surface: flag it in the plan.

For bug fixes, the loop is reproduce on the surface, fix, verify on the same surface. Unit tests show a branch behaves a certain way; they do not prove the bug is gone (the **ronin-principle-prove-it-works** principle skill).

## 6. Implementation guidance

In the overview, name which ronin non-negotiables the implementer must apply, by name:

- the **ronin-how** skill over each unfamiliar subsystem before changing it.
- the **ronin-interrogate** skill for adversarial review on contested designs before shipping.
- the **ronin-deslop** skill over each diff before commit; the **ronin-unslop** skill over any prose surface.
- the **ronin-review** skill to keep a decision trail when the plan is large enough to need an auditable record.
- the ronin `playbooks/babysit.md` workflow after opening the PR, using the configured forge-monitoring capability.

## 7. Hand back

Summarize phases, scope boundaries, applicable skills, and verification. Stop. The user decides when implementation starts.
