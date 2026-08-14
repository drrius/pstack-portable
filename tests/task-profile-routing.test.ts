import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dir, '..');
const contract = JSON.parse(readFileSync(join(root, 'skills/ronin-core/task-profiles.json'), 'utf8'));
const hostContract = readFileSync(join(root, 'skills/ronin-core/HOST_CONTRACT.md'), 'utf8');
const routing = JSON.parse(readFileSync(join(root, 'tests/fixtures/profile-routing.json'), 'utf8'));
const profileIds = ['explore', 'implement', 'judge', 'explain', 'verify'];
const reviewSeparationIds = ['self-review', 'fresh-context-review'];
const workerFields = ['objective', 'ownershipBoundary', 'permissions', 'isolation', 'verifier', 'stopCondition', 'returnedEvidence'];

function markdownSection(text: string, heading: string): string {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => /^(#{1,6})\s+/.test(line) && line.replace(/^#{1,6}\s+/, '') === heading);
  if (start < 0) throw new Error(`Missing heading: ${heading}`);
  const level = lines[start].match(/^(#{1,6})/)![1].length;
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s+/);
    if (match && match[1].length <= level) {
      end = index;
      break;
    }
  }
  return lines.slice(start + 1, end).join('\n');
}

describe('task profile contract', () => {
  test('defines exactly the five behavioral profiles', () => {
    expect(Object.keys(contract.profiles).sort()).toEqual([...profileIds].sort());
  });

  test('inherits the active model without routing controls', () => {
    expect(contract.delegation.model).toBe('inherit-active');
    const serialized = JSON.stringify(contract);
    expect(serialized).not.toContain('modelRouting');
    expect(serialized).not.toContain('requiresDistinctModel');
    expect(serialized).not.toContain('provider');
  });

  test('gives every profile a complete worker contract', () => {
    for (const [id, profile] of Object.entries(contract.profiles) as [string, Record<string, unknown>][]) {
      for (const field of workerFields) expect(profile[field], `${id}.${field}`).toBeTruthy();
    }
  });

  test('allows target writes only for implement', () => {
    for (const id of profileIds) expect(contract.profiles[id].targetWrites).toBe(id === 'implement');
    expect(contract.profiles.implement.ownershipBoundary).toContain('exclusive');
    for (const id of ['explore', 'judge', 'explain', 'verify']) {
      const boundary = `${contract.profiles[id].ownershipBoundary} ${contract.profiles[id].permissions}`;
      expect(boundary, `${id} output boundary`).toContain('artifact');
    }
  });

  test('keeps judge rubric-based and verify acceptance-based', () => {
    expect(contract.profiles.judge.objective).toContain('rubric');
    expect(contract.profiles.verify.objective).toContain('acceptance criteria');
    expect(contract.profiles.verify.isolation).toContain('did not author');
  });

  test('binds every machine-readable profile to the host contract prose', () => {
    const section = markdownSection(hostContract, 'Task profiles');
    for (const id of profileIds) expect(section, id).toContain(`- \`${id}\`:`);
    expect(section).toContain('task-profiles.json');
  });
});

describe('review separation', () => {
  test('defines only self-review and fresh-context review', () => {
    const tiers = Object.fromEntries(contract.reviewSeparation.map((entry: { id: string }) => [entry.id, entry]));
    expect(Object.keys(tiers)).toEqual(reviewSeparationIds);
    expect(tiers['self-review'].freshContext).toBe(false);
    expect(tiers['fresh-context-review'].freshContext).toBe(true);
  });

  test('binds both review paths to prose', () => {
    const section = markdownSection(hostContract, 'Review separation');
    for (const id of reviewSeparationIds) expect(section, id).toContain(`\`${id}\``);
    expect(section).toMatch(/separate subagent or session/i);
  });
});

describe('workflow routing', () => {
  for (const route of routing.routes as { file: string; heading: string; profiles: string[] }[]) {
    test(`${route.file} ${route.heading}`, () => {
      const section = markdownSection(readFileSync(join(root, route.file), 'utf8'), route.heading);
      for (const profile of route.profiles) expect(section).toContain(`\`${profile}\``);
    });
  }

  test('routing fixtures retain the complete profile union', () => {
    const routedProfiles = new Set<string>(routing.routes.flatMap((route: { profiles: string[] }) => route.profiles));
    expect([...routedProfiles].sort()).toEqual([...profileIds].sort());
  });
});

describe('user-facing review separation', () => {
  for (const doc of routing.reviewSeparationDocs as { file: string; needles: string[] }[]) {
    test(`${doc.file} names both review paths`, () => {
      const text = readFileSync(join(root, doc.file), 'utf8');
      for (const needle of doc.needles) expect(text).toContain(needle);
    });
  }
});
