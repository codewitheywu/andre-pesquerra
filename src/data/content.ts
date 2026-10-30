// Static site content. Projects and experience are loaded from
// Supabase (see src/lib/queries.ts); the fallback lists below are shown when
// the database is unavailable or its tables are empty.

import type {
  Certification,
  ExperienceItem,
  NavigationItem,
  Project,
} from "@/types/content";

const githubUser = "codewitheywu";

export const siteContent = {
  name: "Andre V. Pesquerra",
  shortName: "Andre Pesquerra",
  role: "Full-stack web developer",
  description:
    "Full-stack web developer building database-driven web apps and persistent browser games.",

  email: "andrevpesquerra@gmail.com",
  githubUser,
  github: `https://github.com/${githubUser}`,
  linkedin: "https://www.linkedin.com/in/andre-pesquerra/",

  resume: "/files/resume.pdf",
  ogImage: "/images/og/og-cover.jpg",
} as const;

export const navigationItems: NavigationItem[] = [
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "GitHub", href: "#github" },
  { label: "Certifications", href: "#certifications" },
  { label: "Contact", href: "#contact" },
];

export const fallbackProjects: Project[] = [
  {
    id: "gavina-noble-dental",
    title: "Gavina Noble Dental Clinic",
    summary:
      "Appointment management web application with a Three.js 3D dental chart and an Android companion app.",
    role: "Full-Stack Developer & Project Leader",
    stack: ["PHP", "PDO", "MySQL", "JavaScript", "Three.js", "Android"],
    year: "2025",
    liveUrl: null,
  },
  {
    id: "revolution",
    title: "Revolution",
    summary: "A persistent browser-based tribal strategy game.",
    role: "Solo PBBG Developer",
    stack: ["PHP", "MySQL", "JavaScript", "HTML", "CSS"],
    year: null,
    liveUrl: null,
  },
  {
    id: "mac-performance",
    title: "MAC Performance",
    summary: "A Next.js website for an automotive shop.",
    role: "Web Developer",
    stack: ["Next.js", "React", "JavaScript", "Tailwind CSS"],
    year: "2026",
    liveUrl: null,
  },
  {
    id: "bebold-recovery",
    title: "BeBold Recovery",
    summary: "A website built with Webflow.",
    role: "Webflow Developer",
    stack: ["Webflow"],
    year: null,
    liveUrl: null,
  },
];

export const fallbackExperience: ExperienceItem[] = [
  {
    id: "gavina-capstone",
    role: "Full-Stack Developer & Project Leader",
    org: "Gavina Noble Dental Clinic — Capstone Project",
    period: "2025",
    description:
      "Led development of a dental appointment management system, including its web application, 3D dental chart, and Android companion application.",
  },
  {
    id: "miso-sbma",
    role: "IT Support & Workflow Automation Intern",
    org: "MISO — Subic Bay Metropolitan Authority",
    period: "Internship",
    description:
      "Assisted with Google Forms and Autocrat report automation, PC network connectivity, and operational support during cruise ship arrivals.",
  },
  {
    id: "figma-webflow-teaching",
    role: "Figma & Webflow Subject Matter Expert",
    org: "Part-time teaching",
    period: "Teaching",
    description:
      "Part-time teaching focused on interface design and Webflow website development.",
  },
];

// TODO: add the year earned, and any newer certifications.
export const certifications: Certification[] = [
  {
    id: "tesda-nc3-vgd",
    name: "National Certificate III in Visual Graphic Design",
    issuer: "TESDA, Technical Education and Skills Development Authority",
    period: "Certification",
  },
];
