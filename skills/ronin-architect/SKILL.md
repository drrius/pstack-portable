---
name: ronin-architect
description: "Sketch types, signatures, and module structure before code, then stay in the loop while implementation fills in. Use for /ronin-architect, 'architect this', 'design this', or non-trivial work where jumping to code would lock in the wrong shape."
disable-model-invocation: true
---

# Architect

Before using this skill, locate and read `HOST_CONTRACT.md` from the ronin installation root. From this skill's installed directory, the contract is at `../ronin-core/HOST_CONTRACT.md` (the sibling ronin-core skill; resolve this skill's realpath first if the path does not resolve directly). Use its planning, delegation, task-profile, isolation, and safety rules throughout. If it is unavailable, stop and report that the ronin-core skill is not installed alongside this one.

Design before implementing. Sketch types, function signatures, class shapes, and module boundaries with `not implemented` bodies and pseudocode. Compare structurally distinct perspectives, then fill in code against the chosen sketch. If implementation proves the sketch wrong, throw it out and redesign.

## Start

Open a todolist with one entry per phase before starting. Autonomous mode without checkpoints needs the list to show phase position and keep phases from silently disappearing.

1. Ground
2. Sketch
3. Agree
4. Implement
5. Scrap

## Phase A: Ground the problem

Build a real mental model of every system the new code touches. Run the **ronin-how** skill over the relevant subsystems. Critique mode if existing structure is the constraint or the design must push back on it.

Naming a file isn't grounding. Produce the traced model `ronin-how` prescribes. If the design redefines ownership or layering, also run the **ronin-why** skill on the existing shape so the rationale becomes a constraint, not a guess.

Skip Phase A only when the work is genuinely greenfield with no surrounding system to integrate.

## Phase B: Sketch

Name at least two structurally different directions before delegating. One might extend the current boundary. Another might move ownership, replace the boundary, or delete an abstraction. Pick directions that make different load-bearing decisions for this problem. Do not ask several workers the same open-ended question and count their answers as design breadth.

Run one `explore` worker per direction. Give each worker the Phase A grounding artifacts, its assigned direction, and `references/runner-prompt.md`. Each worker produces a design package shaped per `references/rationale-template.md`: the caller's usage written first, then the type sketch, function signatures, module map, and prose rationale derived from it. If delegation is unavailable, produce the same directed sketches serially and disclose that fresh-context exploration was not exercised.

Design it twice. Require at least two whole-shape alternatives before synthesis, even when the first looks sufficient. This is the **ronin-principle-exhaust-the-design-space** principle skill made concrete. Point fixes inside one shape do not count.

Screen every candidate against [`references/design-red-flags.md`](references/design-red-flags.md) before synthesis. Reject or revise shallow modules, information leakage, temporal decomposition, and pass-through methods.

Hand the viable packages to one `judge` worker with sanitized labels. Ask it to compare interface depth, exposed complexity, invariant ownership, and fit with the Phase A constraints. Read every package and the judgment yourself. Prefer the design that hides more complexity behind a smaller, simpler public surface. A rich interface can keep call chains short by concentrating capability instead of scattering it across layers.

Choose one base. Adapt only the decisions that remain coherent with that base. Record the choice, adaptations, and rejections in the rationale's "Synthesis decision" section. Head count is not evidence. Verify any assumption shared by every direction before keeping it.

## Phase C: Agree (opt-in)

Default: proceed directly to implementation with the synthesized design. No human checkpoint.

Opt in to a checkpoint when the invoker explicitly asks: "/ronin-architect with checkpoint," "stop and show me before implementing," or similar. Then surface the synthesized design and pause for sign-off.

The synthesis can ship as its own commit either way. That's the "scaffold first" mode of the **ronin-principle-foundational-thinking** principle skill; subsequent commits read as filling in bodies against a stable contract. Planned and scoped breakage during fill-in is fine, per the **ronin-principle-outcome-oriented-execution** principle skill. For adversarial pressure on the design before implementing, run the **ronin-interrogate** skill on the synthesized sketch.

If the human pushes back on the shape (in a checkpoint or after the fact), treat that as Phase A evidence. Re-ground and re-run Phase B before writing more code.

## Phase D: Implement against the sketch

Replace `not implemented` bodies with code, pseudocode with logic. The synthesized sketch is the contract.

Deviations from the sketch are signal worth surfacing, not friction to absorb silently. If a function needs a parameter the sketch didn't anticipate, ask whether the sketch was wrong, the requirement was missed, or the implementation is overreaching. Surface it; don't bolt it on.

## Phase E: Scrap when the architecture is wrong

If implementation keeps producing friction the sketch can't absorb, throw the sketch out. Don't bolt fixes onto a wrong design, per the **ronin-principle-redesign-from-first-principles** and **ronin-principle-fix-root-causes** principle skills.

The signal is a *pattern*, not single instances. Tells:

- The same shape of workaround appearing repeatedly across unrelated code.
- Multiple unrelated edge cases that all need special-case branches.
- Types that need escape hatches (`any`, casts, optional fields always set in practice) to compile.
- The "we need a lock" reflex when the sketch said the state wasn't shared.
- Callers having to know the abstraction's internal rules to use it.
- Two or more independent Phase D deviations of the same shape across the implementation. Surfacing deviations is Phase D's job; a repeated pattern of them is Phase E's trigger.

Use judgment. A few edge cases don't condemn an architecture. Some problems are legitimately complex; complexity in the data is not complexity in the design. The rewrite signal is repeated friction of the same shape, not single hard cases.

When you scrap:

1. Re-run the **ronin-how** skill over what's been built. The implementation lessons enter the new design as inputs, not vibes.
2. Redesign as if the new constraints had been day-one assumptions, per ronin-principle-redesign-from-first-principles.
3. Subtract before adding, per the **ronin-principle-subtract-before-you-add** principle skill. The new sketch should be smaller than the old one before it grows.
4. Return to Phase B. Name new structural directions from the evidence and run the exploration again.

## Outputs

The caller's usage is written first and the type sketch derived from it. One file with new types and signatures for small changes; module map plus type definitions for larger work. The rationale ships alongside, shaped per `references/rationale-template.md`, including the usage sketch and the synthesis decision.
