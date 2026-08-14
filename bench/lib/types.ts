export type Host = 'cursor' | 'codex' | 'claude';
export type PstackMode = 'none' | 'native' | 'portable';

export interface Condition {
  id: string;
  host: Host;
  pstack: PstackMode;
}

export interface NativeCursorPin {
  name: string;
  version: string;
  commit: string;
  allowlistDigest: string;
}

export interface Suite {
  schemaVersion: number;
  suiteId: string;
  defaultRepetitions: number;
  nativeCursor: NativeCursorPin;
  conditions: Condition[];
  cases: string[];
}

export interface RunPlan {
  runId: string;
  suiteId: string;
  condition: Condition;
  caseId: string;
  repetition: number;
  command: string[];
  environment: Record<string, string>;
  workspace: string;
  tracePath: string;
}

export interface NormalizedEvent {
  kind: 'assistant' | 'tool' | 'result' | 'error' | 'unknown';
  text?: string;
  tool?: string;
  rawType?: string;
  model?: string;
}

export interface ScoreRecord {
  runId: string;
  conditionId: string;
  caseId: string;
  repetition: number;
  passed: boolean;
  verifierExitCode: number;
  durationMs: number;
  toolCalls: number;
  failedTools: number;
  changedFiles: number;
  treatmentObserved?: boolean;
  baselineContaminated?: boolean;
  validComparison?: boolean;
  requestedModel?: string;
  actualModel?: string;
  error?: string;
}
