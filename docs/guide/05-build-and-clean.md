# Build the change and clean the diff

The build playbooks share one discipline. Say what you observed, let the playbook demand the evidence. This page shows what to put in the prompt for each common build task, then the cleanup habit that keeps diffs reviewable.

## Prompt each build playbook with what you know

A bug prompt states the symptom and asks for a reproduction first:

```text
/ronin this command emits two records after a retry. repro first, then fix and verify.
```

A feature prompt states the behavior and what must not change:

```text
/ronin add a --json flag. text output stays byte-identical. verify both forms.
```

A refactoring prompt pins behavior before structure moves:

```text
/ronin move parsing into one module, zero behavior change. record the current output first and prove it's unchanged after.
```

A perf prompt states the measurement, not a vibe:

```text
/ronin startup takes 1.8s on this fixture. trace it, fix the measured cause, show me before and after.
```

Each of these routes to its playbook ([Bug fix](../../skills/ronin/playbooks/bug-fix.md), [Feature](../../skills/ronin/playbooks/feature.md), [Refactoring](../../skills/ronin/playbooks/refactoring.md), [Perf issue](../../skills/ronin/playbooks/perf-issue.md)), and the playbook supplies the steps you didn't type: reproduce before fixing, name the data shape before implementing, pin behavior before restructuring, profile before optimizing.

For sustained improvement of one number, there's the [Hillclimb playbook](../../skills/ronin/playbooks/hillclimb.md). Give it the metric, a target, and a floor on attempts, and it loops one hypothesis at a time with a frozen measurement harness. It keeps wins and reverts everything else.

## Write the failing test first with `/ronin-tdd`

When a bug has a cheap local test path, the whole prompt can be two words:

```text
/ronin-tdd implement
```

In context, that's enough. [`/ronin-tdd`](../../skills/ronin-tdd/SKILL.md) writes the smallest test that fails for the intended reason, then the fix, then reruns the test. If the test needs a broad harness or brittle mocks, it uses the closest executable check instead.

## Let the TypeScript rules load themselves

[`ronin-typescript-best-practices`](../../skills/ronin-typescript-best-practices/SKILL.md) loads when the agent touches a `.ts` or `.tsx` file. It turns type-system principles into discriminated unions, `unknown` at boundaries, exhaustive variants, and schema-derived types.

## Clean before you commit

The [Opening a PR playbook](../../skills/ronin/playbooks/opening-a-pr.md) applies [`ronin-deslop`](../../skills/ronin-deslop/SKILL.md) before each commit and [`/ronin-unslop`](../../skills/ronin-unslop/SKILL.md) to the PR description and commit bodies.

For the code diff, `/ronin-deslop` walks the change against `main`:

```text
/ronin-deslop
```

For prose, `/ronin-unslop` takes a target and any extra rules you have:

```text
/ronin-unslop the readme changes. no em dashes.
```

You'll develop your own shorthand. The skill reads intent fine from terse prompts like `unslop that, tighten it`.

## Strip the comments with `/ronin-no-comments`

Comments need their own pass, and not from the agent that wrote them. An author defends its comments the way you'd defend yours. So before review, hand them to fresh eyes:

```text
/ronin-no-comments the diff
```

[`/ronin-no-comments`](../../skills/ronin-no-comments/SKILL.md) gives the diff to [Comment Sicko](../../skills/ronin-core/personas/comment-sicko.md). It keeps license headers, public API docs, essential links, and external constraints. Everything else goes or comes back as a refactor flag.

`/ronin-deslop` cleans code. `/ronin-unslop` cleans prose. `/ronin-no-comments` gives comments to a fresh reader.

**Pitfall:** cleanup is not optional polish. A diff with narrating comments and defensive dead weight reads as unfinished to reviewers, and the extra code is where the next bug hides. If the diff feels padded, say `deslop it` before you commit, not after review calls it out.

Next: [Verify and ship](./06-verify-and-ship.md).
