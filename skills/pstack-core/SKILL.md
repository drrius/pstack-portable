---
name: pstack-core
description: "Shared foundation for every pstack skill: the host capability contract and the Poteto Agent and Comment Sicko personas. Other pstack skills read this skill's files as a sibling directory; install it alongside any of them. Not a workflow itself."
user-invocable: false
---

# pstack-core

This skill carries the files every other pstack skill depends on. It does nothing on its own.

- `HOST_CONTRACT.md` — the host capability contract. Workflow skills read it before delegating, persisting, selecting models, reading transcripts, or controlling a real surface.
- `personas/poteto-agent.md` — the Poteto Agent worker persona.
- `personas/comment-sicko.md` — the Comment Sicko review persona.

Skills locate these files as a sibling skill directory: from any installed pstack skill, the contract is at `../pstack-core/HOST_CONTRACT.md` and the personas are under `../pstack-core/personas/`. This holds wherever skills are installed together — copied or symlinked, global or project-local.

If another pstack skill reports this skill missing, install it from the same source as the rest of pstack, for example:

```sh
npx skills add drrius/pstack-portable --skill pstack-core
```
