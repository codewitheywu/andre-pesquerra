/**
 * The section being read: the last one whose top has passed the reading
 * line (a point down the viewport). At the very bottom of the page the last
 * section wins, since short closing sections may never reach the line.
 */
export function pickCurrentSection(
  sections: { id: string; top: number }[],
  readingLine: number,
  atBottom: boolean
): string | null {
  if (sections.length === 0) return null;
  if (atBottom) return sections[sections.length - 1]!.id;
  let current: string | null = null;
  for (const section of sections) {
    if (section.top <= readingLine) current = section.id;
  }
  return current;
}
