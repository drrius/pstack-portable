import type { Host, NormalizedEvent } from './types';

function textFromContent(content: unknown): string | undefined {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return undefined;
  const texts = content.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    if (typeof (item as { text?: unknown }).text === 'string') return [(item as { text: string }).text];
    if ((item as { type?: unknown }).type === 'tool_use') return [JSON.stringify(item)];
    return [];
  });
  return texts.length ? texts.join('\n') : undefined;
}

export function normalizeLine(host: Host, line: string): NormalizedEvent {
  let value: Record<string, any>;
  try {
    value = JSON.parse(line);
  } catch {
    return { kind: 'error', text: line, rawType: 'invalid-json' };
  }
  const rawType = typeof value.type === 'string' ? value.type : 'unknown';
  const model = typeof value.model === 'string' ? value.model : typeof value.message?.model === 'string' ? value.message.model : undefined;
  if (host === 'codex') {
    const item = value.item ?? {};
    if (rawType === 'item.completed' && item.type === 'agent_message') return { kind: 'assistant', text: item.text, rawType, model };
    if (rawType.startsWith('item.') && typeof item.type === 'string' && item.type.includes('command')) return { kind: 'tool', tool: item.type, text: item.command, rawType };
    if (rawType === 'turn.completed') return { kind: 'result', rawType };
    if (rawType.includes('error')) return { kind: 'error', text: value.message ?? value.error?.message, rawType };
  } else if (host === 'claude') {
    if (rawType === 'assistant') return { kind: 'assistant', text: textFromContent(value.message?.content), rawType, model };
    if (rawType === 'result') return { kind: value.is_error ? 'error' : 'result', text: value.result, rawType };
    if (rawType === 'tool_result' || rawType === 'tool_use') return { kind: 'tool', tool: value.name, rawType };
  } else {
    if (rawType === 'assistant' || rawType === 'assistant_message') return { kind: 'assistant', text: textFromContent(value.message?.content ?? value.content), rawType, model };
    if (rawType.includes('tool')) return { kind: 'tool', tool: value.name ?? value.tool_name, rawType };
    if (rawType.includes('skill')) return { kind: 'tool', tool: value.name ?? value.skill_name, text: JSON.stringify(value), rawType };
    if (rawType === 'result' || rawType === 'final') return { kind: 'result', text: value.result ?? value.text, rawType };
    if (rawType.includes('error')) return { kind: 'error', text: value.message, rawType };
  }
  return { kind: 'unknown', rawType, model };
}

export function normalizeTrace(host: Host, trace: string): NormalizedEvent[] {
  return trace.split(/\r?\n/).filter(Boolean).map((line) => normalizeLine(host, line));
}
