const ORDINAL_SUFFIXES: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' }

export function lapLabel(lap: number): string {
  return ORDINAL_SUFFIXES[lap] ?? `${lap}th`
}
