import { navigationItems, siteContent } from "@/data/content";
import { getSoundEnabled, setSoundEnabled } from "@/lib/sound";
import { setTheme } from "@/lib/theme";

export type Command = {
  id: string;
  label: string;
  group: "Jump to" | "Links" | "Actions";
  keywords: string;
  hint: string;
  /** Section id for "Jump to"; URL for "Links" (site pages open in place). */
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
    id: "theme-light",
    label: "Iced coffee (light theme)",
    group: "Actions",
    keywords: "theme light mode iced coffee appearance",
    hint: "theme",
  },
  {
    id: "theme-dark",
    label: "Hot coffee (dark theme)",
    group: "Actions",
    keywords: "theme dark mode hot coffee appearance",
    hint: "theme",
  },
  {
    id: "sound",
    label: "Turn sound effects on or off",
    group: "Actions",
    keywords: "sound effects audio mute volume",
    hint: "sound",
  },
  {
    id: "stack-page",
    label: "Stack: every tool I use",
    group: "Links",
    keywords: "stack tools skills technologies languages frameworks",
    hint: "→",
    target: "/stack",
  },
  {
    id: "blog-page",
    label: "Blog: my TikTok posts",
    group: "Links",
    keywords: "blog tiktok videos posts",
    hint: "→",
    target: "/blog",
  },
  {
    id: "behind-page",
    label: "Behind the Code: story, life and hobbies",
    group: "Links",
    keywords: "behind the code about me story life hobbies personal",
    hint: "→",
    target: "/behind-the-code",
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

/** A page of this site (opened in place), as opposed to a file or another site. */
export function isSitePage(target: string): boolean {
  return target.startsWith("/") && !target.startsWith("//") && !target.endsWith(".pdf");
}

/** Apply a theme or sound command; returns the confirmation, or null if `id` is another kind. */
export function runPreferenceCommand(id: string): string | null {
  if (id === "theme-light" || id === "theme-dark") {
    setTheme(id === "theme-light" ? "light" : "dark");
    return id === "theme-light" ? "Iced coffee it is ✓" : "Hot coffee it is ✓";
  }
  if (id === "sound") {
    const next = !getSoundEnabled();
    setSoundEnabled(next);
    return next ? "Sound effects on ✓" : "Sound effects off";
  }
  return null;
}

/** Where arrow, Home and End move the highlight in a list of `count`; null for other keys. */
export function moveHighlight(key: string, index: number, count: number): number | null {
  if (count === 0) return null;
  switch (key) {
    case "ArrowDown":
      return (index + 1) % count;
    case "ArrowUp":
      return (index - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

export function filterCommands(query: string): Command[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return COMMANDS;
  return COMMANDS.filter(
    (command) => command.label.toLowerCase().includes(needle) || command.keywords.includes(needle)
  );
}
