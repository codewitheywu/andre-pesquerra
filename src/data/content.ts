// Static site content. Projects, experience and education are loaded from
// Supabase (see src/lib/queries.ts); the fallback lists below are shown when
// the database is unavailable or its tables are empty.

import type {
  EducationItem,
  ExperienceItem,
  NavigationItem,
  Project,
  StackGroup,
} from "@/types/content";

export const siteContent = {
  name: "Andre V. Pesquerra",
  shortName: "Andre Pesquerra",
  location: "Bataan, Philippines",
  role: "Full-stack web developer",
  availability: "Open to selected opportunities",
  description:
    "Full-stack web developer in Bataan, Philippines, building database-driven web apps and persistent browser games.",

  email: "andrevpesquerra@gmail.com",
  github: "https://github.com/codewitheywu",
  linkedin: "https://www.linkedin.com/in/andre-pesquerra/",

  resume: "/files/resume.pdf",
  ogImage: "/images/og/og-cover.jpg",
} as const;

export const navigationItems: NavigationItem[] = [
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Education", href: "#education" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
];

export const stackGroups: StackGroup[] = [
  { label: "languages", items: ["PHP", "JavaScript", "HTML", "CSS", "C"] },
  { label: "data", items: ["MySQL", "MariaDB", "PDO"] },
  { label: "frameworks", items: ["Next.js", "React", "Three.js", "Tailwind CSS"] },
  { label: "design & tools", items: ["Figma", "Webflow", "Git", "AI-assisted coding"] },
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

export const fallbackEducation: EducationItem[] = [
  {
    id: "bs-computer-science",
    qualification: "Bachelor of Science in Computer Science",
    institution: "Undergraduate studies",
    period: "Education",
    details: "",
  },
  {
    id: "tesda-nc3-vgd",
    qualification: "TESDA NC III — Visual Graphic Design",
    institution: "Technical Education and Skills Development Authority",
    period: "Certification",
    details: "",
  },
];
