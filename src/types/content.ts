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

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  /** Year earned, or a short label such as "certification". */
  period: string;
};

export type Recommendation = {
  id: string;
  name: string;
  /** "Role, Organization", either part optional. */
  credit: string;
  quote: string;
};

export type NavigationItem = {
  label: string;
  href: `#${string}`;
};
