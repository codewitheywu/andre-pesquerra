// Everything on the /stack page, grouped. Tools with a logo also appear in
// the experience section's logo row. Logos come from simple-icons (CC0);
// only Server Components import this file, so the SVG paths never reach
// the client bundle.

import {
  siAndroid,
  siC,
  siClaude,
  siCss,
  siFigma,
  siGit,
  siGithub,
  siHostinger,
  siHtml5,
  siJavascript,
  siMariadb,
  siMysql,
  siNextdotjs,
  siPhp,
  siReact,
  siSupabase,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
  siVercel,
  siWebflow,
  type SimpleIcon,
} from "simple-icons";

export type StackTool = { name: string; icon?: SimpleIcon };
export type StackCategory = { label: string; tools: StackTool[] };

export const stackCategories: StackCategory[] = [
  {
    label: "languages",
    tools: [
      { name: "JavaScript", icon: siJavascript },
      { name: "TypeScript", icon: siTypescript },
      { name: "PHP", icon: siPhp },
      { name: "C", icon: siC },
      { name: "HTML", icon: siHtml5 },
      { name: "CSS", icon: siCss },
    ],
  },
  {
    label: "frameworks & libraries",
    tools: [
      { name: "React", icon: siReact },
      { name: "Next.js", icon: siNextdotjs },
      { name: "Tailwind CSS", icon: siTailwindcss },
      { name: "Three.js", icon: siThreedotjs },
    ],
  },
  {
    label: "databases",
    tools: [
      { name: "MySQL", icon: siMysql },
      { name: "MariaDB", icon: siMariadb },
      { name: "PDO" },
      { name: "Supabase", icon: siSupabase },
    ],
  },
  {
    label: "mobile",
    tools: [{ name: "Android", icon: siAndroid }],
  },
  {
    label: "design & no-code",
    tools: [
      { name: "Figma", icon: siFigma },
      { name: "Webflow", icon: siWebflow },
    ],
  },
  {
    label: "tools & hosting",
    tools: [
      { name: "Git", icon: siGit },
      { name: "GitHub", icon: siGithub },
      { name: "Vercel", icon: siVercel },
      { name: "Hostinger", icon: siHostinger },
      { name: "WampServer" },
    ],
  },
  {
    label: "ai-assisted development",
    tools: [{ name: "Claude", icon: siClaude }, { name: "ChatGPT" }],
  },
];

/** The logo row: every tool that has a logo, in category order. */
export const logoTools = stackCategories
  .flatMap((category) => category.tools)
  .filter((tool): tool is Required<StackTool> => tool.icon !== undefined);
