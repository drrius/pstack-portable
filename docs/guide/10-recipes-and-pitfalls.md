# Recipes and pitfalls

Prompts worth copying, then the mistakes everyone makes once. Swap in your own paths and finish conditions. The recipes are deliberately informal. That's how they get typed in practice, and the skills read intent fine.

![She tastes a finished dish while robots cook from a recipe box, with pinned cards reading ronin-how, ronin-tdd, and durable run above the counter.](./images/recipes.jpg)

## Understand an unfamiliar subsystem

```text
use /ronin-how first to understand how this initialization works. then use /ronin-why to find why it broke recently.
```

Mechanics first, history second. Each skill's report tells you which sources it searched, so you know what the answer is grounded in.

## Force real alternatives before a design

```text
/ronin-architect name three structurally different directions before choosing one. show me the tradeoffs.
```

The directions differ before exploration starts. That creates a real comparison without pretending repeated identical prompts are independent judgment.

## Check independent slices in parallel

```text
/ronin-swarm check every package under packages/ against its check.sh. one worker per package. one report.
```

Each worker owns one package. The parent waits for every slice and returns one `PASS`, `ISSUES`, or `BLOCKED` report instead of raw worker dumps.

## Review a branch skeptically

```text
/ronin-interrogate the whole branch, but skeptically. don't change anything yet. no nitpicks unless it's an actual bug or regression in behavior.
```

The qualifiers do real work. "don't change anything yet" keeps it read-only, and the nitpick rule pre-filters the noise so `Act on` findings are worth your time.

## Fix a bug through a failing test

```text
/ronin-mode repro the duplicate write first. if there's a cheap test path, /ronin-tdd it. then fix and rerun.
```

"if there's a cheap test path" matters. Forcing a test through brittle mocks proves less than running the real command, and the playbook is allowed to say so.

## Keep a run honest while you're away

```text
im going to bed, keep going autonomously until every fixture passes. do not stop. keep a decision log i can audit in the morning.
```

The full contract is on the [overnight page](./07-overnight.md). The short form works once the task and finish condition are already in the conversation.

## Redirect a drifting run

Steering prompts are one line:

```text
i said the goal is to repro. i did not ask for a fix yet.
```

```text
apply prove it works. show me the real output, not the build log.
```

```text
/ronin-unslop that. no em dashes.
```

You rarely need more words. You need the right name, and [the principles page](./08-principles.md) is the vocabulary.

## Get the reply in plain words

```text
/ronin-bro
```

That's the whole prompt. [`/ronin-bro`](../../skills/ronin-bro/SKILL.md) restates the last message in plain words.

## The pitfalls

- **Enumerating skills in the prompt.** "use /ronin-how then /ronin-architect" reorders steps the playbook already sequences. State the goal and constraints. Name a skill only to override a default.
- **A vague finish condition.** "make it better" gives a durable run nothing to check. Give a command or artifact that can pass or fail.
- **Parallel agents in one worktree.** They overwrite each other and the diff becomes archaeology. Say "own worktree per attempt" and the isolation is free.
- **Using `/ronin-swarm` for design synthesis.** Swarm partitions independent slices. `/ronin-architect` names structural directions, compares them, and chooses the boundary.
- **Accepting every review comment.** Bots and humans both file real catches and noise in one list. `/ronin-interrogate` sorts findings into act-on and dismissed buckets with reasons.
- **Treating worker count as proof.** Task lenses create coverage. Fresh contexts create review separation. Reproducible evidence creates confidence.
- **Reporting success off a green build.** A build proves it compiles. Ask for the real command, flow, stored value, or profile, and expect the evidence in the reply.
- **Writing a `SKILL.md` freehand.** Route it through the [Authoring or modifying a skill playbook](../../skills/ronin-mode/playbooks/authoring-a-skill.md) so validation and review happen.

That's the guide. If you skipped ahead, go back to [setup](./01-setup.md) and run one real task. The habits stick from use, not from reading.

Back to the [guide index](./README.md).
