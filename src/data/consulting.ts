// The /consulting page: services offered and the inquiry form's options.
// Ids are stored with each inquiry; the database checks them
// (supabase/migrations/004_consulting_inquiries.sql), so keep the two in step.

export type Service = {
  id: "graphic-design" | "web-development" | "thesis" | "iot";
  title: string;
  /** Shown where a menu shows the price. */
  rate: string;
  summary: string;
  includes: string[];
};

// TODO: review the wording, and replace "by quote" with a starting rate
// (e.g. "from ₱5,000") wherever you have one.
export const services: Service[] = [
  {
    id: "graphic-design",
    title: "Graphic Design",
    rate: "by quote",
    summary:
      "Brand and marketing visuals for businesses and organizations, designed to print and to post.",
    includes: ["Logos and brand kits", "Social media and marketing graphics", "Print-ready layouts"],
  },
  {
    id: "web-development",
    title: "Web Development",
    rate: "by quote",
    summary:
      "Websites and web applications built end to end, from the database and server logic to the interface.",
    includes: ["Business websites and landing pages", "Database-driven web apps", "Webflow builds"],
  },
  {
    id: "thesis",
    title: "Thesis Requirements",
    rate: "by quote",
    summary:
      "Guidance and development support for capstone and thesis systems, so your team ends up with a working build it understands.",
    includes: ["System planning and database design", "Development and debugging", "Defense-ready walkthroughs"],
  },
  {
    id: "iot",
    title: "IoT Development",
    rate: "by quote",
    summary:
      "Connected-device projects: sensors and microcontrollers wired to a web dashboard that stores and shows their data.",
    includes: ["Sensor and microcontroller prototypes", "Web dashboards for device data", "Database integration"],
  },
];

export const serviceOptions = [
  ...services.map((service) => ({ id: service.id, label: service.title })),
  { id: "other", label: "Something else" },
] as const;

// TODO: adjust the ranges to your pricing.
export const budgetOptions = [
  { id: "under-5k", label: "Under ₱5,000" },
  { id: "5k-20k", label: "₱5,000 – ₱20,000" },
  { id: "20k-50k", label: "₱20,000 – ₱50,000" },
  { id: "50k-plus", label: "₱50,000 and up" },
  { id: "not-sure", label: "Not sure yet" },
] as const;

/** The inquiry form's fields, in order. */
export const INQUIRY_FIELDS = [
  "name",
  "email",
  "organization",
  "service",
  "budget",
  "timeline",
  "details",
] as const;

/** Field limits, shared by the form (maxLength) and the server check. */
export const INQUIRY_LIMITS = {
  name: 120,
  email: 254,
  organization: 120,
  timeline: 120,
  detailsMin: 20,
  detailsMax: 5000,
} as const;

/** Inquiries one visitor can send per hour (enforced in the database). */
export const INQUIRIES_PER_HOUR = 3;
