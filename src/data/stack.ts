// Everything on the /stack page, grouped. Tools with a logo also appear in
// the experience section's logo row. Logos come from simple-icons (CC0);
// only Server Components import this file, so the SVG paths never reach
// the client bundle.

import {
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
    label: "Frontend",
    tools: [
      { name: "HTML", icon: siHtml5 },
      { name: "CSS", icon: siCss },
      { name: "JavaScript", icon: siJavascript },
      { name: "TypeScript", icon: siTypescript },
      { name: "React", icon: siReact },
      { name: "Next.js", icon: siNextdotjs },
      { name: "Tailwind CSS", icon: siTailwindcss },
      { name: "Three.js", icon: siThreedotjs },
    ],
  },
  {
    label: "Backend & databases",
    tools: [
      { name: "PHP", icon: siPhp },
      { name: "C", icon: siC },
      { name: "PDO" },
      { name: "MySQL", icon: siMysql },
      { name: "MariaDB", icon: siMariadb },
      { name: "Supabase", icon: siSupabase },
    ],
  },
  {
    label: "Deployment tools",
    tools: [
      { name: "Git", icon: siGit },
      { name: "GitHub", icon: siGithub },
      { name: "Vercel", icon: siVercel },
      { name: "Hostinger", icon: siHostinger },
      { name: "WampServer" },
    ],
  },
  {
    label: "Design & no-code",
    tools: [
      { name: "Figma", icon: siFigma },
      { name: "Webflow", icon: siWebflow },
    ],
  },
  {
    label: "AI-assisted tools",
    tools: [{ name: "Claude", icon: siClaude }, { name: "ChatGPT" }],
  },
];

/** The logo row: every tool that has a logo, in category order. */
export const logoTools = stackCategories
  .flatMap((category) => category.tools)
  .filter((tool): tool is Required<StackTool> => tool.icon !== undefined);
