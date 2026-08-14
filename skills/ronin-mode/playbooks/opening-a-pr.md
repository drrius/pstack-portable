### Opening a PR

Invoked at the end of every other playbook.

**Worktree.** Work from a git worktree off main; each writing worker gets an exclusive worktree or branch. Never place multiple writers on the same checkout. Dirty branch with unrelated work: patch out, fresh worktree, apply. Snarled worktree: reset from main, redo minimally.

**Commits.** Commit liberally; rebase into small, ordered commits before opening PRs. Each commit is a future PR: landable, ordered to tell the story. Amend when the fix belongs in a just-made commit; new commit when separable.

**PRs.** Apply the **ronin-deslop** skill before commit; `/ronin-no-comments` the diff before review; apply the **ronin-unslop** skill to the PR description and commit bodies. Small PRs, 5 narrow over 1 fat; stack follow-ups, branch off main only for genuinely independent work. For stacked PRs, open each one against its parent branch through the repository's forge (GitHub: `gh pr create --base <parent>`; Azure DevOps: `az repos pr create --target-branch <parent>`) and retarget as the stack drains; the requirement is small, ordered slices with the stack visible to reviewers. Check the forge before referencing PR status (GitHub: `gh pr view <number>`; Azure DevOps: `az repos pr show --id <number>`). Rebase on `main` before substantial stack work. No `## Summary` / `## Test plan` boilerplate on small PRs; commit bodies don't restate the subject. After opening, run `playbooks/babysit.md` through the host's PR-monitoring capability; push back when feedback drifts from intent.

A write-capable subagent that owns this PR lifecycle uses the `implement` profile, runs `ronin-interrogate`, **ronin-deslop**, and **ronin-no-comments**, returns the URL, and does NOT babysit. Its brief limits writes to the assigned branch and PR, names the verifier and stop condition, and keeps every external action subject to the host contract's authorization gate. Return to the parent.
