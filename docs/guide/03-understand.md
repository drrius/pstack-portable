# Understand the code before changing it

Editing code you don't understand is how subtle regressions ship. `/ronin-how` explains what the code does now. `/ronin-why` finds why it was built that way. `/ronin-teach` joins both. `/ronin-recall` rebuilds your recent context.

![A detective studies a machine blueprint while robots fetch evidence.](./images/understanding.jpg)

## Trace behavior with `/ronin-how`

```text
/ronin-how do we dedupe notifications? is there an n+1 when we look up subscribers?
```

Ask the question you have. [`/ronin-how`](../../skills/ronin-how/SKILL.md) traces the runtime flow, key types, and non-obvious behavior. A large subsystem gets read-only explorers. A narrow question gets a direct explanation.

`/ronin-how` can also challenge the design. Ask for Critique mode when the structure looks wrong:

```text
/ronin-how explain the sync service, then critique its ownership boundaries
```

The explanation comes first, so the critique stays grounded in how the thing really works.

## Dig up history with `/ronin-why`

```text
/ronin-why was the retry limit set to five? does the reason still hold?
```

[`/ronin-why`](../../skills/ronin-why/SKILL.md) starts from source control, then queries the evidence sources the host exposes. The report cites evidence, separates facts from inference, and records empty searches. "Nobody wrote down why" is still an answer.

The two compose naturally. `do ronin-why first, then ronin-how` works when history may explain the mess.

## Actually understand it with `/ronin-teach`

```text
/ronin-teach me how this PR changes retries. convince me it fixes the cause and not the symptom.
```

[`/ronin-teach`](../../skills/ronin-teach/SKILL.md) runs `/ronin-how` and `/ronin-why`, then builds one plain explanation. "Convince me" turns the answer into an argument you can test.

## Rebuild your own context with `/ronin-recall`

```text
/ronin-recall catch me up on the export work from last week
```

[`/ronin-recall`](../../skills/ronin-recall/SKILL.md) searches recent chats and the shared record, then returns the current state and next move. Use Session pickup below for one specific prior run.

## Take over prior work with Session pickup

When another agent (or you, last week) left a branch mid-flight:

```text
/ronin-mode take over this branch. read the decision log, figure out what's done, and continue from there. don't redo finished work.
```

The [Session pickup playbook](../../skills/ronin-mode/playbooks/session-pickup.md) treats the prior trail as authoritative. It reconstructs the branch state and decisions, names the resume point, and verifies inherited claims against the original goal instead of re-deriving everything from scratch.

**Pitfall:** an agent that starts editing without tracing behavior tends to fix the first plausible symptom. `/ronin-how` is cheaper than the second bug.

Next: [Design the change](./04-design.md).
