"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitInquiry } from "@/app/(site)/consulting/actions";
import { budgetOptions, INQUIRY_FIELDS, INQUIRY_LIMITS as L, serviceOptions } from "@/data/consulting";
import { siteContent } from "@/data/content";
import type { InquiryState, InquiryValues } from "@/lib/inquiry";
import FormField, { CONTROL_CLASS } from "./FormField";
import { InquiryFailed, InquiryRateLimited, InquirySent } from "./InquiryStatus";

const EMPTY: InquiryValues = {
  name: "",
  email: "",
  organization: "",
  service: "",
  budget: "",
  timeline: "",
  details: "",
};

export default function InquiryForm() {
  const [state, formAction, pending] = useActionState(submitInquiry, {
    status: "idle",
    values: EMPTY,
  } satisfies InquiryState as InquiryState);
  const formRef = useRef<HTMLFormElement>(null);

  // Send keyboard and screen reader users to the first field to fix.
  useEffect(() => {
    if (state.status !== "invalid") return;
    const first = INQUIRY_FIELDS.find((field) => state.errors[field]);
    formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }, [state]);

  if (state.status === "sent") return <InquirySent name={state.name} />;

  // After an action React resets the form to its default values, so the
  // defaults carry what was typed: a failed send never loses the text.
  const { values } = state;
  const errors = state.status === "invalid" ? state.errors : {};

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="border-b border-border p-5 sm:p-6">
        <p className="font-mono text-meta text-muted">consulting inquiry</p>
        <h3 className="mt-1 text-h3 font-semibold text-ink">Tell me about your project</h3>
        <p className="mt-2 max-w-136 text-body text-ink-2">
          Share the essentials and I&apos;ll reply with next steps. Fields marked{" "}
          <span className="text-accent">*</span> are required.
        </p>
      </div>

      {state.status === "rate_limited" && <InquiryRateLimited minutes={state.retryAfterMinutes} />}

      <form ref={formRef} action={formAction} className="relative grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <FormField name="name" label="Name" required error={errors.name}>
          {(control) => (
            <input {...control} type="text" required maxLength={L.name} autoComplete="name"
              defaultValue={values.name} placeholder="Your name" className={CONTROL_CLASS} />
          )}
        </FormField>
        <FormField name="email" label="Email" required error={errors.email}>
          {(control) => (
            <input {...control} type="email" required maxLength={L.email} autoComplete="email"
              defaultValue={values.email} placeholder="you@company.com" className={CONTROL_CLASS} />
          )}
        </FormField>
        <FormField name="organization" label="Company / school" error={errors.organization}>
          {(control) => (
            <input {...control} type="text" maxLength={L.organization} autoComplete="organization"
              defaultValue={values.organization} placeholder="Optional" className={CONTROL_CLASS} />
          )}
        </FormField>
        <FormField name="service" label="What can I help with?" required error={errors.service}>
          {(control) => (
            <select {...control} required defaultValue={values.service} className={CONTROL_CLASS}>
              <option value="" disabled>Choose a service</option>
              {serviceOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          )}
        </FormField>
        <FormField name="budget" label="Budget range" error={errors.budget}>
          {(control) => (
            <select {...control} defaultValue={values.budget} className={CONTROL_CLASS}>
              <option value="">Select one (optional)</option>
              {budgetOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          )}
        </FormField>
        <FormField name="timeline" label="Ideal timeline" error={errors.timeline}>
          {(control) => (
            <input {...control} type="text" maxLength={L.timeline} defaultValue={values.timeline}
              placeholder="e.g. next month" className={CONTROL_CLASS} />
          )}
        </FormField>
        <FormField name="details" label="Project details" required error={errors.details} className="sm:col-span-2">
          {(control) => (
            <textarea {...control} required minLength={L.detailsMin} maxLength={L.detailsMax} rows={6}
              defaultValue={values.details}
              placeholder="What are you working on, who is it for, and what would a good result look like?"
              className={`${CONTROL_CLASS} resize-y`} />
          )}
        </FormField>

        {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
        <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
          <label>
            Leave this empty
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <p className="text-meta text-muted sm:col-span-2">
          Please don&apos;t include passwords, API keys or other sensitive information.
        </p>
        {state.status === "error" && <InquiryFailed />}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 sm:col-span-2">
          <p className="text-meta text-ink-2">
            Prefer email?{" "}
            <a href={`mailto:${siteContent.email}`} className="link-draw font-mono text-ink">
              {siteContent.email}
            </a>
          </p>
          <button type="submit" disabled={pending}
            className="press inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-5 text-body text-bg transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
            {pending ? "Sending…" : "Send inquiry"}
            <span aria-hidden="true" className="nudge">→</span>
          </button>
        </div>
      </form>
    </div>
  );
}
