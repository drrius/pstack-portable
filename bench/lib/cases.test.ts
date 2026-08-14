import { afterAll, describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { prepareWorkspace, scoreWorkspace } from './cases';
import { runsRoot } from './paths';
import { loadSuite } from './suite';

const verificationRoot = join(runsRoot, 'fixture-verification');

afterAll(() => {
  if (existsSync(verificationRoot)) rmSync(verificationRoot, { recursive: true });
});

describe('frozen fixture scorers', () => {
  for (const caseId of loadSuite().cases) {
    test(`${caseId} passes gold and fails a plausible bad artifact`, () => {
      const gold = join(verificationRoot, `${caseId}-gold`);
      const bad = join(verificationRoot, `${caseId}-bad`);
      prepareWorkspace(caseId, gold, 'gold');
      prepareWorkspace(caseId, bad, 'bad');
      expect(scoreWorkspace(caseId, gold).passed).toBe(true);
      expect(scoreWorkspace(caseId, bad).passed).toBe(false);
    });
  }

  test('materialized workspaces cannot mutate the source fixture or each other', () => {
    const first = join(verificationRoot, 'isolation-one');
    const second = join(verificationRoot, 'isolation-two');
    prepareWorkspace('counter-clamp', first);
    prepareWorkspace('counter-clamp', second);
    Bun.write(join(first, 'src', 'counter.ts'), 'changed\n');
    expect(readFileSync(join(second, 'src', 'counter.ts'), 'utf8')).not.toBe('changed\n');
    expect(readFileSync(join(runsRoot, '..', 'cases', 'counter-clamp', 'input', 'src', 'counter.ts'), 'utf8')).not.toBe('changed\n');
  });
});
