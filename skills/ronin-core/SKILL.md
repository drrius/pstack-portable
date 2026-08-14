---
name: ronin-core
description: "Shared foundation for every ronin skill: the host capability contract and the Poteto Agent and Comment Sicko personas. Other ronin skills read this skill's files as a sibling directory; install it alongside any of them. Not a workflow itself."
user-invocable: false
---

# ronin-core

This skill carries the files every other ronin skill depends on. It does nothing on its own.

- `HOST_CONTRACT.md` — the host capability contract. Workflow skills read it before delegating, persisting, selecting models, reading transcripts, or controlling a real surface.
- `task-profiles.json` — the machine-readable contract for `explore`, `implement`, `judge`, `explain`, `verify`, and review provenance.
- `personas/poteto-agent.md` — the Poteto Agent worker persona.
- `personas/comment-sicko.md` — the Comment Sicko review persona.

Skills locate these files as a sibling skill directory: from any installed ronin skill, the contract is at `../ronin-core/HOST_CONTRACT.md`, the task profiles are at `../ronin-core/task-profiles.json`, and the personas are under `../ronin-core/personas/`. This holds wherever skills are installed together — copied or symlinked, global or project-local.

If another ronin skill reports this skill missing, install it from the same source as the rest of ronin, for example:

```sh
npx skills add drrius/ronin --skill ronin-core
```
