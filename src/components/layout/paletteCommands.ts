import { navigationItems, siteContent } from "@/data/content";

export type Command = {
  id: string;
  label: string;
  group: "Jump to" | "Links" | "Actions";
  keywords: string;
  hint: string;
  /** Section id for "Jump to", URL for "Links". */
  target?: string;
};

export const COMMANDS: Command[] = [
  ...navigationItems.map((item) => ({
    id: `section-${item.href.slice(1)}`,
    label: item.label,
    group: "Jump to" as const,
    keywords: item.label.toLowerCase(),
    hint: "jump to",
    target: item.href.slice(1),
  })),
  {
    id: "copy-email",
    label: "Copy email address",
    group: "Actions",
    keywords: "email contact mail copy",
    hint: "⧉",
  },
  {
    id: "resume",
    label: "Open résumé",
    group: "Links",
    keywords: "resume cv pdf",
    hint: "↗",
    target: siteContent.resume,
  },
  {
    id: "github",
    label: "GitHub",
    group: "Links",
    keywords: "github code repos",
    hint: "↗",
    target: siteContent.github,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    group: "Links",
    keywords: "linkedin profile",
    hint: "↗",
    target: siteContent.linkedin,
  },
];

export function filterCommands(query: string): Command[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return COMMANDS;
  return COMMANDS.filter(
    (command) => command.label.toLowerCase().includes(needle) || command.keywords.includes(needle)
  );
}
