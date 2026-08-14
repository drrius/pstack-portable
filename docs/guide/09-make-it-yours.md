# Teach ronin what lasts

Do not turn every preference into a mode. Capture the lessons that change a future decision, then encode the repeated ones in a skill, test, or script.

## Capture a session with `/ronin-reflect`

Run reflection while the hard parts are still visible:

```text
/ronin-reflect that took too long. capture what would change the next run.
```

[`/ronin-reflect`](../../skills/ronin-reflect/SKILL.md) gives the transcript to reviewers with different jobs. A synthesizer sorts proposals into `Accepted`, `Rejected`, and `Backlog`. Nothing changes until you approve it.

One odd session is an anecdote. Keep a proposal only when it names a repeated failure and a concrete future decision.

## Write a focused skill

When the workflow is real enough to reuse, name the behavior:

```text
/ronin-mode write a skill for verifying database migrations in this repo
```

The [Authoring or modifying a skill playbook](../../skills/ronin-mode/playbooks/authoring-a-skill.md) uses the host's skill-authoring capability when one exists. Otherwise it writes and validates the Agent Skill directly. It checks frontmatter, links, commands, and one real invocation before opening a PR.

Agent-facing prose has a higher bar than human prose. A loose sentence becomes an instruction some future agent follows.

A skill that drives your app has its own tools. Use [`/ronin-create-verification-skill`](../../skills/ronin-create-verification-skill/SKILL.md) to build it and [`/ronin-maintain-verification-skill`](../../skills/ronin-maintain-verification-skill/SKILL.md) to keep its feature map honest. [Verify and ship](./06-verify-and-ship.md#create-a-project-verification-skill) covers both.

## Write docs to a standard

```text
/ronin-technical-writing review the readme changes
```

[`/ronin-technical-writing`](../../skills/ronin-technical-writing/SKILL.md) picks the document's job first. Then it makes each sentence do one thing. Use it for guides, RFCs, readmes, PR descriptions, and commit messages.

Use `/ronin-unslop` for a final subtraction pass:

```text
/ronin-unslop the readme changes. no em dashes.
```

## Test a skill change blind

```text
/ronin-mode run the eval playbook on this skill change. same task for both variants. keep the candidates blind.
```

The [Eval playbook](../../skills/ronin-mode/playbooks/eval.md) hides the experiment from candidate workers. They receive an ordinary task in sanitized directories. One judge scores neutral outputs. Chain-following is measured from the files each candidate read, not from its claims.

Read every output before accepting the verdict. If the verdict feels wrong, inspect the rubric first.

Do not edit a skill inside unrelated feature work. Give the skill its own change and its own proof.

Next: [Recipes and pitfalls](./10-recipes-and-pitfalls.md).
