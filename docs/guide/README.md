# The ronin guide

ronin routes a goal through the right playbook and returns evidence. You say what you want and how you will know it is done. `/ronin` handles the sequence.

Skip the ceremony. The agent still needs a finish condition, and this guide does not make unsupported hosts behave like Cursor.

Start here:

1. [Set up ronin](./01-setup.md). Install it for one host and enable native workers.
2. [Route work through `/ronin`](./02-ronin.md). Give it a goal and let it choose the playbook.
3. [Understand the code](./03-understand.md). Read before editing.
4. [Design the change](./04-design.md). Set the shape before implementation.
5. [Build and clean the change](./05-build-and-clean.md). Build, test, and remove slop.
6. [Verify and ship](./06-verify-and-ship.md). Prove the behavior, then open a focused PR.
7. [Run work while you sleep](./07-overnight.md). Set a contract and leave an auditable decision log.
8. [Steer with principle names](./08-principles.md). Redirect a run without rewriting the prompt.
9. [Teach ronin what lasts](./09-make-it-yours.md). Capture lessons and build focused skills.
10. [Recipes and pitfalls](./10-recipes-and-pitfalls.md). Copy the useful prompts. Skip the traps.

Read the pages in order once. Each page stands alone after that.

## The one prompt that matters

Give the agent a goal and a check:

```text
/ronin the export writes duplicate rows when a retry lands mid-run. repro first, then fix and verify.
```

You do not need to name a playbook or list skills. “Repro first” and a checkable outcome are enough. `/ronin` matches the Bug fix playbook, copies its steps into the todo list, and calls the skills each step needs.

Next: [Set up ronin](./01-setup.md).
