"use server";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { readInquiryForm, validateInquiry, type InquiryState } from "@/lib/inquiry";
import { createAdminClient } from "@/lib/supabase/admin";

const submitResult = z
  .array(
    z.object({
      status: z.enum(["sent", "rate_limited"]),
      retry_after_seconds: z.number().int().nonnegative(),
    })
  )
  .length(1);

/**
 * The visitor, as an HMAC of their IP keyed with the server secret: stable
 * enough to rate-limit, useless for recovering the address. Vercel sets
 * x-real-ip and x-forwarded-for itself, so clients cannot choose them.
 */
async function visitorKey(secret: string): Promise<string> {
  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  return createHmac("sha256", secret).update(ip).digest("hex");
}

export async function submitInquiry(_previous: InquiryState, formData: FormData): Promise<InquiryState> {
  const values = readInquiryForm(formData);

  // Honeypot: people never see this field, form-filling bots do. Look sent,
  // store nothing.
  if (formData.get("website")) return { status: "sent", name: values.name.trim() };

  const parsed = validateInquiry(values);
  if (!parsed.success) return { status: "invalid", values, errors: parsed.errors };

  const admin = createAdminClient();
  if (!admin) {
    console.error("[inquiry] SUPABASE_SECRET_KEY is not set; inquiries are offline");
    return { status: "error", values };
  }

  const inquiry = parsed.data;
  const { data, error } = await admin.client.rpc("submit_inquiry", {
    p_name: inquiry.name,
    p_email: inquiry.email,
    p_organization: inquiry.organization ?? "",
    p_service: inquiry.service,
    p_budget: inquiry.budget ?? "",
    p_timeline: inquiry.timeline ?? "",
    p_details: inquiry.details,
    p_ip_hash: await visitorKey(admin.secret),
  });

  const result = submitResult.safeParse(data);
  if (error || !result.success) {
    // Log the failure, never the visitor's message or address.
    console.error("[inquiry] submit failed:", error?.message ?? "unexpected response shape");
    return { status: "error", values };
  }

  const row = result.data[0];
  if (row?.status === "rate_limited") {
    return { status: "rate_limited", values, retryAfterMinutes: Math.ceil(row.retry_after_seconds / 60) };
  }
  return { status: "sent", name: inquiry.name };
}
