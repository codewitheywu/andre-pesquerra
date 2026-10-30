import { z } from "zod";
import { budgetOptions, INQUIRY_FIELDS, INQUIRY_LIMITS as L, serviceOptions } from "@/data/consulting";

// Server-side validation of the consulting inquiry form. Client Components
// import only the types from here, so zod stays out of the browser bundle.

export type InquiryField = (typeof INQUIRY_FIELDS)[number];
export type InquiryValues = Record<InquiryField, string>;
export type InquiryErrors = Partial<Record<InquiryField, string>>;

export type InquiryState =
  | { status: "idle"; values: InquiryValues }
  | { status: "invalid"; values: InquiryValues; errors: InquiryErrors }
  | { status: "rate_limited"; values: InquiryValues; retryAfterMinutes: number }
  | { status: "error"; values: InquiryValues }
  | { status: "sent"; name: string };

const serviceIds = serviceOptions.map((option) => option.id) as string[];
const budgetIds = budgetOptions.map((option) => option.id) as string[];

const tooLong = (max: number) => `Keep it under ${max} characters.`;
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, tooLong(max))
    .transform((value) => value || null);

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Please add your name.").max(L.name, tooLong(L.name)),
  email: z
    .string()
    .trim()
    .max(L.email, tooLong(L.email))
    .pipe(z.email("Please enter a valid email address.")),
  organization: optionalText(L.organization),
  service: z.string().refine((id) => serviceIds.includes(id), "Pick what you need help with."),
  budget: z
    .string()
    .refine((id) => id === "" || budgetIds.includes(id), "Pick a range from the list.")
    .transform((id) => id || null),
  timeline: optionalText(L.timeline),
  details: z
    .string()
    .trim()
    .min(L.detailsMin, "A few sentences helps: what it is, who it's for, and what done looks like.")
    .max(L.detailsMax, tooLong(L.detailsMax)),
});

export type Inquiry = z.output<typeof inquirySchema>;

/** The form's fields as strings; anything missing or not text becomes "". */
export function readInquiryForm(formData: FormData): InquiryValues {
  const values = {} as InquiryValues;
  for (const field of INQUIRY_FIELDS) {
    const value = formData.get(field);
    values[field] = typeof value === "string" ? value : "";
  }
  return values;
}

export function validateInquiry(
  values: InquiryValues
): { success: true; data: Inquiry } | { success: false; errors: InquiryErrors } {
  const result = inquirySchema.safeParse(values);
  if (result.success) return { success: true, data: result.data };

  const errors: InquiryErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as InquiryField;
    errors[field] ??= issue.message;
  }
  return { success: false, errors };
}
