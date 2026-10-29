// UI-facing shapes. Database rows are validated and mapped into these in
// src/lib/queries.ts; they are not a copy of the database schema.

export type Project = {
  id: string;
  title: string;
  summary: string;
  role: string;
  stack: string[];
  year: string | null;
  liveUrl: string | null;
};

export type ExperienceItem = {
  id: string;
  role: string;
  org: string;
  period: string;
  description: string;
};

export type EducationItem = {
  id: string;
  qualification: string;
  institution: string;
  period: string;
  details: string;
};

export type StackGroup = {
  label: string;
  items: string[];
};

export type NavigationItem = {
  label: string;
  href: `#${string}`;
};
