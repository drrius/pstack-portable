export function nextOffset(offset: number, pageSize: number, returned: number): number | null {
  if (returned < pageSize) return null;
  return offset + returned;
}
