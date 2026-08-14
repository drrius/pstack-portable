# Verify the result and open a PR

"It compiles" is not evidence. The [Prove It Works principle](../../skills/ronin-principle-prove-it-works/SKILL.md) makes the agent check the real artifact before reporting success.

![A prototype plane flies a real test course while she times it with a stopwatch and robots film and checklist the run; the terminal reads verify: pass, evidence: captured.](./images/verification.jpg)

## State the finish condition up front

Put what done means in the first prompt, in whatever words fit:

```text
/ronin-mode add json output to this command. text output stays byte-identical, the json parses, both run against the sample project. show me the evidence.
```

Now the agent has three checks it can run, not a mood to satisfy. When the reply comes back, it should carry the exact commands and outputs. If a check couldn't run, a good reply says "inconclusive", and you should treat a confident reply without evidence as a red flag.

Match the check to the change:

- A CLI change runs the real command.
- A UI change walks the changed flow in the running app.
- A parser or migration replays a saved input.
- A perf change compares before and after profiles.
- A storage change reads back the written value.

For a small diff you don't trust, [`/ronin-blast-radius`](../../skills/ronin-blast-radius/SKILL.md) finds what it could break elsewhere. It proves the safety claim by running code.

## Create a project verification skill

The UI bullet above hides a real requirement. The agent needs a scripted way to drive your app. If your project has one, great. If not, run:

```text
/ronin-create-verification-skill
```

[`/ronin-create-verification-skill`](../../skills/ronin-create-verification-skill/SKILL.md) interviews the repository, not you. It finds how the app launches, what can drive it, and what evidence proves behavior. It asks only what the code cannot answer.

It writes `.agents/skills/verify-<app>/` with Launch, Doctor, Drive, Evidence, and Cleanup instructions. Its [worked feature-map example](../../skills/ronin-create-verification-skill/references/feature-map-example/) shows how each feature names its proof. Before handoff, the generator launches the app, drives one feature, captures evidence, and cleans up.

From then on, "verify it in the app" is a step any agent can execute, in this repo, with no setup conversation.

Once the verify skill works, [`/ronin-swarm`](../../skills/ronin-swarm/SKILL.md) can split a full pass by feature-map entry.

## Keep the verification skill honest

Apps change and feature maps rot. When yours drifts, run:

```text
/ronin-maintain-verification-skill
```

[`/ronin-maintain-verification-skill`](../../skills/ronin-maintain-verification-skill/SKILL.md) compares the feature map with source, then drives every mapped feature. `clean` means nothing changed. `changed` means one PR confined to the verification skill. `blocked` names the missing proof. It never edits product code.

## Open the PR

```text
/ronin-mode open the pr. small ordered commits, evidence in the description.
```

The [Opening a PR playbook](../../skills/ronin-mode/playbooks/opening-a-pr.md) works from a worktree, rebases the work into small ordered commits, cleans the diff, unslops the prose, and returns the PR link. Five narrow PRs beat one fat one, and stacked follow-ups beat a growing branch.

## Drive the PR to merge-ready with Babysit

An open PR starts collecting blockers immediately. Checks fail, reviewers comment, trunk moves. Hand that churn to the [Babysit playbook](../../skills/ronin-mode/playbooks/babysit.md):

```text
/ronin-mode babysit this pr. get it green.
```

Babysit watches the PR with a bundled watcher and takes blockers in order: conflicts, then review threads, then CI. Every known fix batches into one push, so the checks restart once instead of after every fix. The comment triage is skeptical, because humans and bots file real catches and noise in the same list. A real finding gets a fix, and noise gets dismissed with the disproof posted on the thread. When all you want is status, ask smaller and Babysit answers without starting the loop:

```text
/ronin-mode check on pr 123. anything outstanding?
```

Babysit stops at merge-ready. It never merges, even with everything green, because merging is a different decision.

## Land the stack with Shipping

Green is not the same as safe. When you're ready to land, say so:

```text
/ronin-mode land the stack.
```

The [Shipping playbook](../../skills/ronin-mode/playbooks/shipping.md) verifies each PR independently before it merges anything. One fresh agent per PR proves the behavior live, and the agent that judges a change is never the one that wrote it. Then Shipping lands only the contiguous verified run from the bottom, merging and retargeting one PR at a time, and reports the first PR that breaks the chain. A verified PR sitting above an unverified one waits, because merging it would pull the gap in underneath.

Next: [Run work while you sleep](./07-overnight.md).
