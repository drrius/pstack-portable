---
name: automate-me
description: "Use for \"automate me\", \"create/update/refresh my -mode skill\", \"turn/capture my preferences or working style into a skill\", or wanting agents to follow how the user works. Drafts or revises a personal -mode skill through the host's skill-authoring capability plus unslop, optionally pulling fresh evidence from recent transcripts."
disable-model-invocation: true
---

# Automate me

A guided flow for turning the user's working conventions into a skill agents will follow. The output is one `-mode` skill tailored to them (e.g. `jay-mode`, `priya-mode`).

This skill orchestrates an inline mining pass, the active host's skill-authoring capability, and the **unslop** skill. If the host provides no authoring capability, use the canonical Agent Skills format and the repository's validator instead; never copy or assume a proprietary built-in.

## Flow

### 0. Check for an existing skill

Look recursively for `.agents/skills/**/*-mode/SKILL.md` in the current project and `~/.agents/skills/**/*-mode/SKILL.md` globally, matching the user's handle. Host aliases are discovery surfaces, not separate sources to edit. Mode skills can live in a personal category directory (`.agents/skills/<handle>/`), not only at the top level. If one exists, confirm intent with the host's user-input mechanism unless the user already said "update my skill" or similar:

- Update the existing skill (default for repeat runs)
- Start fresh (rare; ask why before doing it)

Update mode changes the rest of the flow:
- Step 1 mines only history since the skill was last edited (`git log -1 --format=%cI <path>`).
- Step 2 asks what's changed or missing, not what to capture from zero.
- Step 4 edits the existing file in place. Preserve sections the user hasn't contradicted; revise ones with new evidence; add new sections only for genuinely new rules.

### 1. Mine their history

Ask the active host adapter for transcripts scoped to the current workspace or task, or use an explicit in-scope path supplied by the user. Never infer a storage layout or glob across private home-directory state. If no readable transcript is available, report the capability gap, skip mining, and rely on direct questions; do not imply that the resulting mode reflects historical evidence.

Survey recent agent conversations within that scope for recurring patterns. For a large corpus, define bounded worker requests across slices of history, using the `fast-code` role and read-only access. Each worker returns a short structured list with evidence pointers. If delegation is unavailable, process the slices serially; if model routing is unavailable, inherit the current model. Disclose either substitution. Default signals worth hunting:

- Response preferences (length, tone, format, "dumb it down" corrections)
- Delegation habits (subagents, models, specialized workflows, parallelism)
- Verification posture (what "done" means; unit tests vs live repro; reviewers)
- Code and prose discipline (style, principles cited, lint/format tools)
- Process conventions (worktrees, commits, PRs, review/merge tooling)
- Meta preferences (fixing skills mid-task, proposing new ones)

Cross-check across slices before elevating a signal. Patterns seen in 2+ slices are high-confidence; lone signals are weak and usually get dropped.

### 2. Ask the user directly

Mining misses intent that hasn't come up yet. Use the host's structured user-input mechanism when available rather than asking the user to type from scratch. If it is unavailable, ask the same compact questions in chat.

Shape: one or two questions with 4-6 options each, `allow_multiple: true` for category questions. Start broad ("Which areas matter most?"), then follow up on selected areas with specific options. After the structured rounds, one free-form chat question catches anything the options missed.

Don't dump 20 questions. Two structured rounds plus one open question is usually enough.

### 3. Cluster findings

Group the combined signals into sections. Common ones (use only what applies):

- **Response style**: length, tone, format.
- **Autonomy**: how much to do without asking; MCP tool use.
- **Understand first**: which skills to reach for when scoping or investigating a change.
- **Subagents**: default, parallelism, model-to-task, specialized workflows.
- **Prose / code discipline**: principles, lint tools, style guides.
- **Review and verify**: repro posture, verification skills, live-testing tools.
- **Process**: git worktrees, commits, PRs, review/merge tooling.
- **Skills**: skill-authoring habits, fix-the-skill-first, proposing new skills.

The **ronin-mode** skill shows the shape. Read it for granularity. Don't copy its content; the user's rules are not the same as ronin-mode's.

### 4. Draft the skill

Use the host-provided skill-authoring capability to author the skill. If unavailable, draft it directly using the canonical Agent Skills format and run the repository's validator. Placement:

- Path: preserve an existing mode skill's category. For a new mode, use `.agents/skills/<handle>/<handle>-mode/SKILL.md` when the repo has an established personal category for that handle; otherwise default to `.agents/skills/<handle>-mode/SKILL.md` in the project, or `~/.agents/skills/<handle>-mode/` if the user prefers a global skill.
- Handle: the user's first name or chosen identifier.
- Frontmatter `description`: trigger on their name + `/<handle>-mode` + "work in their style", not on generic keywords like "write code" or "review PR".
- Frontmatter formatting: follow the Agent Skills YAML rules. Keep `description` as one YAML scalar; quote it or use `description: >-` with indented continuation lines when punctuation or wrapping requires it.
- Frontmatter `disable-model-invocation: true` by default. Mode skills are heavy and opinionated; they should only apply when the user explicitly invokes them (by name or slash command), not auto-trigger on description matching. Opt out only if the user explicitly wants their mode to apply on every turn.

### 5. Iterate on prose

Apply the **unslop** skill and the available skill-authoring guidelines to every line. Both apply to any agent-read prose, not just skills.

Show the draft to the user and take feedback. Expect multiple iterations. Cut ruthlessly; a mode skill is not a manual.

### 6. Land it

Work in an isolated branch or worktree when the repository supports it. Commit or open a pull request only when the user has authorized those repository actions; otherwise leave a reviewable local diff and exact verification results. Don't push to the default branch directly.

## Guardrails

- **Don't overfit to one conversation.** A preference stated once and contradicted another time is noise. Require multiple instances before codifying it.
- **Don't be clever.** Restating other skills' contents, inventing metaphors, or writing "poetic" prose for an agent reader is cost without benefit. Keep it operational.
- **Reference, don't inline.** Other skills the user relies on should appear as path references, not pasted excerpts. Same for any principle docs they maintain elsewhere.
- **Keep sections minimal.** Only add a section if the user has a specific, non-default rule there. "Communicate clearly" is not a section. "Short paragraphs. Tables when comparing options. Bullets only when items are genuinely parallel." is.
- **Name conventions generic.** Use "the user" or "the human" in imperatives, not the author's first name. Others may read or adopt the skill.
- **Don't force symmetry.** If a user has no process rules worth writing down, skip the Process section entirely. Sparse is fine; bloated is not.

## Evaluation

A `-mode` skill is subjective output. A generic benchmark loop isn't useful here. Vibe-check with the user: does it read like them? Did it miss anything? Then ship.

Run a description-optimization loop only if the skill's trigger accuracy turns out to be a problem in practice.

## When not to use

- User wants a task-specific skill rather than working conventions: use the host's skill-authoring capability alone, with no mining required.
- User wants to capture one narrow workflow (e.g. "how I write commit messages"): that's a regular skill, not a mode skill.

## Reference files

- The **ronin-mode** skill: example of the output shape.
- The **unslop** skill: prose discipline for every line.
- The active host's skill-authoring capability, or the canonical Agent Skills format and repository validator when that capability is unavailable.
