import { mkdirSync, readdirSync, symlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { casePrompt, writeBenchmarkGitignore } from './cases';
import { repositoryRoot } from './paths';
import type { Condition, RunPlan } from './types';

export interface AdapterContext {
  workspace: string;
  isolatedHome: string;
  tracePath: string;
  nativePluginPath?: string;
  model?: string;
}

function linkPortableSkills(condition: Condition, context: AdapterContext): void {
  if (condition.pstack !== 'portable') return;
  const base = condition.host === 'claude' ? join(context.workspace, '.claude', 'skills') : join(context.workspace, '.agents', 'skills');
  mkdirSync(base, { recursive: true });
  for (const name of readdirSync(join(repositoryRoot, 'skills'), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()) {
    symlinkSync(join(repositoryRoot, 'skills', name), join(base, name));
  }
  writeBenchmarkGitignore(context.workspace);
}

export function configureWorkspace(condition: Condition, context: AdapterContext): void {
  linkPortableSkills(condition, context);
}

export function buildHostCommand(condition: Condition, caseId: string, context: AdapterContext): { command: string[]; environment: Record<string, string> } {
  const prompt = casePrompt(caseId);
  const environment: Record<string, string> = {
    PSTACK_BENCH_CONDITION: condition.id,
    PSTACK_BENCH_TRACE: context.tracePath
  };

  if (condition.host === 'cursor') {
    const command = ['cursor-agent', '-p', '--force', '--output-format', 'stream-json', '--trust', '--sandbox', 'enabled', '--workspace', context.workspace];
    if (context.model) command.push('--model', context.model);
    if (condition.pstack === 'native') {
      if (!context.nativePluginPath) throw new Error('Cursor native condition requires a verified plugin path');
      command.push('--plugin-dir', context.nativePluginPath);
    }
    command.push(prompt);
    environment.CURSOR_DATA_DIR = join(context.isolatedHome, 'cursor-data');
    environment.CURSOR_CONFIG_DIR = join(context.isolatedHome, 'cursor-config');
    environment.PSTACK_BENCH_HOME_ISOLATION = process.env.CURSOR_API_KEY ? 'isolated-api-key-home' : 'isolated-cursor-state-shared-home';
    if (process.env.CURSOR_API_KEY) environment.HOME = context.isolatedHome;
    return { command, environment };
  }

  environment.HOME = context.isolatedHome;
  if (condition.host === 'codex') {
    environment.CODEX_HOME = process.env.CODEX_HOME ?? join(homedir(), '.codex');
    const command = ['codex', 'exec', '--json', '--ephemeral', '--ignore-user-config', '--ignore-rules', '-c', 'approval_policy="never"', '-C', context.workspace, '-s', 'workspace-write'];
    if (context.model) command.push('--model', context.model);
    command.push(prompt);
    return { command, environment };
  }

  const command = ['claude', '-p', prompt, '--output-format', 'stream-json', '--allowedTools', 'Read,Edit,Write,Bash,Glob,Grep'];
  if (context.model) command.push('--model', context.model);
  return { command, environment };
}

export function buildRunPlan(suiteId: string, condition: Condition, caseId: string, repetition: number, context: AdapterContext): RunPlan {
  const built = buildHostCommand(condition, caseId, context);
  return {
    runId: `${suiteId}--${condition.id}--${caseId}--r${repetition}`,
    suiteId,
    condition,
    caseId,
    repetition,
    command: built.command,
    environment: built.environment,
    workspace: context.workspace,
    tracePath: context.tracePath
  };
}
