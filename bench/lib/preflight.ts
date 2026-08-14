import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repositoryRoot } from './paths';
import type { Suite } from './types';

export interface PreflightReport {
  schemaVersion: 1;
  suiteId: string;
  runtime: { bun: string };
  hosts: Record<string, { available: boolean; version?: string; auth: 'ready' | 'unknown' | 'missing'; note: string }>;
  nativeCursor: { available: boolean; version: string; commit: string; digest: string; source: string; note: string };
  conditions: Array<{ id: string; runnable: boolean; isolation: string }>;
}

function commandOutput(command: string, args: string[]): { ok: boolean; output: string } {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 15_000 });
  return { ok: result.status === 0, output: `${result.stdout || ''}${result.stderr || ''}`.trim() };
}

export function resolveNativePlugin(suite: Suite): string {
  const override = process.env.PSTACK_CURSOR_PLUGIN;
  const path = override ?? join(homedir(), '.cursor', 'plugins', 'cache', 'cursor-public', suite.nativeCursor.name, suite.nativeCursor.commit);
  return path;
}

export function runPreflight(suite: Suite): PreflightReport {
  const cursor = commandOutput('cursor-agent', ['--version']);
  const codex = commandOutput('codex', ['--version']);
  const claude = commandOutput('claude', ['--version']);
  const cursorAuth = cursor.ok ? commandOutput('cursor-agent', ['status']) : { ok: false, output: '' };
  const cursorIsolationRoot = mkdtempSync(join(tmpdir(), 'pstack-cursor-preflight-'));
  let cursorIsolatedAuth = false;
  try {
    const result = spawnSync('cursor-agent', ['status'], {
      encoding: 'utf8',
      timeout: 15_000,
      env: {
        ...process.env,
        CURSOR_DATA_DIR: join(cursorIsolationRoot, 'data'),
        CURSOR_CONFIG_DIR: join(cursorIsolationRoot, 'config')
      }
    });
    cursorIsolatedAuth = result.status === 0 && `${result.stdout || ''}${result.stderr || ''}`.includes('Logged in');
  } finally {
    rmSync(cursorIsolationRoot, { recursive: true });
  }
  const codexAuth = codex.ok ? commandOutput('codex', ['login', 'status']) : { ok: false, output: '' };
  const claudeConfig = claude.ok ? commandOutput('claude', ['config', 'get', 'hasCompletedOnboarding', '-g']) : { ok: false, output: '' };

  const pluginPath = resolveNativePlugin(suite);
  let nativeAvailable = false;
  let nativeNote = 'Pinned plugin cache is missing';
  if (existsSync(join(pluginPath, '.cursor-plugin', 'plugin.json'))) {
    const plugin = JSON.parse(readFileSync(join(pluginPath, '.cursor-plugin', 'plugin.json'), 'utf8'));
    const audit = spawnSync(process.execPath, [join(repositoryRoot, 'scripts', 'audit-upstream.mjs'), '--source', pluginPath], { cwd: repositoryRoot, encoding: 'utf8' });
    nativeAvailable = plugin.name === suite.nativeCursor.name && plugin.version === suite.nativeCursor.version && audit.status === 0 && audit.stdout.includes(suite.nativeCursor.allowlistDigest);
    nativeNote = nativeAvailable ? 'Version and imported allowlist digest match the immutable pin' : 'Plugin version or imported allowlist digest does not match the pin';
  }

  const hosts = {
    cursor: {
      available: cursor.ok,
      version: cursor.output.split(/\r?\n/)[0],
      auth: cursorAuth.output.includes('Logged in') ? 'ready' as const : 'missing' as const,
      note: cursorIsolatedAuth ? 'Subscription auth survives isolated Cursor data and config directories; HOME remains shared and baseline traces must show no global Agent Skills activation' : 'Cursor authentication did not survive isolated data/config state'
    },
    codex: {
      available: codex.ok,
      version: codex.output.split(/\r?\n/)[0],
      auth: codexAuth.output.includes('Logged in') ? 'ready' as const : 'missing' as const,
      note: 'CODEX_HOME retains auth while HOME and user configuration are isolated'
    },
    claude: {
      available: claude.ok,
      version: claude.output.split(/\r?\n/)[0],
      auth: 'unknown' as const,
      note: claudeConfig.ok ? 'CLI configuration exists; this version has no non-consuming auth-status command, so auth is verified by the first approved live pilot' : 'CLI configuration was not detected; verify auth in an approved live pilot'
    }
  };

  return {
    schemaVersion: 1,
    suiteId: suite.suiteId,
    runtime: { bun: Bun.version },
    hosts,
    nativeCursor: {
      available: nativeAvailable,
      version: suite.nativeCursor.version,
      commit: suite.nativeCursor.commit,
      digest: suite.nativeCursor.allowlistDigest,
      source: `<cursor-plugin-cache>/${suite.nativeCursor.commit}`,
      note: nativeNote
    },
    conditions: suite.conditions.map((condition) => ({
      id: condition.id,
      runnable: hosts[condition.host].available && (condition.host !== 'cursor' || cursorIsolatedAuth) && (condition.pstack !== 'native' || nativeAvailable),
      isolation: condition.host === 'cursor' && !process.env.CURSOR_API_KEY ? 'isolated Cursor data/config with shared HOME' : 'isolated-home'
    }))
  };
}
