import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { casesRoot, runsRoot } from './paths';

export interface CaseDefinition {
  schemaVersion: number;
  id: string;
  title: string;
  prompt: string;
  input: string;
  verifier: string;
  gold: string;
  bad: string;
}

export function loadCase(caseId: string): CaseDefinition {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(caseId)) throw new Error(`Unsafe case ID: ${caseId}`);
  const root = join(casesRoot, caseId);
  const definition = JSON.parse(readFileSync(join(root, 'case.json'), 'utf8')) as CaseDefinition;
  if (definition.schemaVersion !== 1 || definition.id !== caseId) throw new Error(`Invalid case definition: ${caseId}`);
  for (const key of ['prompt', 'input', 'verifier', 'gold', 'bad'] as const) {
    const value = definition[key];
    if (!value || resolve(root, value).startsWith(`${resolve(root)}/`) === false || !existsSync(resolve(root, value))) throw new Error(`Invalid ${key} path for ${caseId}`);
  }
  return definition;
}

export function casePrompt(caseId: string): string {
  const definition = loadCase(caseId);
  const task = readFileSync(join(casesRoot, caseId, definition.prompt), 'utf8').trim();
  return `${task}\n\nIf a pstack workflow is available, use poteto-mode. Otherwise solve the task directly. Do not read outside this repository. Do not claim success until you have run relevant verification.`;
}

export function prepareWorkspace(caseId: string, destination: string, overlay?: 'gold' | 'bad'): void {
  const allowedRoot = resolve(runsRoot);
  const target = resolve(destination);
  if (!target.startsWith(`${allowedRoot}/`)) throw new Error(`Refusing to prepare workspace outside benchmark run root: ${target}`);
  if (existsSync(target)) rmSync(target, { recursive: true });
  const definition = loadCase(caseId);
  const caseRoot = join(casesRoot, caseId);
  mkdirSync(target, { recursive: true });
  cpSync(join(caseRoot, definition.input), target, { recursive: true });
  if (overlay) cpSync(join(caseRoot, definition[overlay]), target, { recursive: true, force: true });
  const init = spawnSync('git', ['init', '-q'], { cwd: target, encoding: 'utf8' });
  if (init.status !== 0) throw new Error(`Unable to initialize fixture repository: ${init.stderr}`);
  spawnSync('git', ['add', '.'], { cwd: target });
  spawnSync('git', ['-c', 'user.name=pstack-bench', '-c', 'user.email=bench@example.invalid', 'commit', '-qm', 'fixture baseline'], { cwd: target });
}

export function scoreWorkspace(caseId: string, workspace: string): { passed: boolean; exitCode: number; output: string } {
  const definition = loadCase(caseId);
  const hiddenPath = join(workspace, '.pstack-bench.hidden.test.ts');
  cpSync(join(casesRoot, caseId, definition.verifier), hiddenPath);
  try {
    const result = spawnSync(process.execPath, ['test', hiddenPath], { cwd: workspace, encoding: 'utf8' });
    return { passed: result.status === 0, exitCode: result.status ?? 1, output: `${result.stdout || ''}${result.stderr || ''}`.trim() };
  } finally {
    if (existsSync(hiddenPath)) rmSync(hiddenPath);
  }
}

export function writeBenchmarkGitignore(workspace: string): void {
  writeFileSync(join(workspace, '.git', 'info', 'exclude'), '.agents/\n.claude/\n.cursor/\n.pstack-bench*\n');
}
