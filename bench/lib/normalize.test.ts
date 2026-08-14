import { describe, expect, test } from 'bun:test';
import { normalizeLine, normalizeTrace } from './normalize';

describe('structured trace normalization', () => {
  test('normalizes Cursor assistant and tool events', () => {
    const events = normalizeTrace('cursor', [
      JSON.stringify({ type: 'assistant_message', content: [{ type: 'text', text: 'done' }] }),
      JSON.stringify({ type: 'tool_call', name: 'Shell' }),
      JSON.stringify({ type: 'result', result: 'ok' })
    ].join('\n'));
    expect(events.map((event) => event.kind)).toEqual(['assistant', 'tool', 'result']);
  });

  test('normalizes Codex JSONL events', () => {
    expect(normalizeLine('codex', JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'fixed' } }))).toMatchObject({ kind: 'assistant', text: 'fixed' });
    expect(normalizeLine('codex', JSON.stringify({ type: 'item.started', item: { type: 'command_execution', command: 'bun test' } }))).toMatchObject({ kind: 'tool', tool: 'command_execution' });
  });

  test('normalizes Claude stream events and exposes malformed JSON', () => {
    expect(normalizeLine('claude', JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'fixed' }] } }))).toMatchObject({ kind: 'assistant', text: 'fixed' });
    expect(normalizeLine('claude', 'not-json')).toMatchObject({ kind: 'error', rawType: 'invalid-json' });
  });
});
