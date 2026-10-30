import { describe, expect, it } from "vitest";
import { readInquiryForm, validateInquiry, type InquiryValues } from "@/lib/inquiry";

const valid: InquiryValues = {
  name: "  Maria Santos ",
  email: " maria@example.com ",
  organization: "",
  service: "web-development",
  budget: "",
  timeline: "",
  details: "We need a booking site for our clinic with an admin page.",
};

describe("inquiry validation", () => {
  it("accepts a complete inquiry, trimming text and turning blanks into null", () => {
    const result = validateInquiry(valid);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toMatchObject({
      name: "Maria Santos",
      email: "maria@example.com",
      organization: null,
      budget: null,
      timeline: null,
    });
  });

  it("explains each missing or malformed required field", () => {
    const result = validateInquiry({ ...valid, name: "   ", email: "maria", service: "", details: "help" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(Object.keys(result.errors).sort()).toEqual(["details", "email", "name", "service"]);
    expect(result.errors.email).toBe("Please enter a valid email address.");
  });

  it("rejects options that are not in the lists, even if the browser was bypassed", () => {
    const result = validateInquiry({ ...valid, service: "hacking", budget: "1-million" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.service).toBeDefined();
    expect(result.errors.budget).toBeDefined();
  });

  it("caps lengths to match the database", () => {
    const result = validateInquiry({ ...valid, name: "a".repeat(121), details: "x".repeat(5001) });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.name).toMatch(/under 120/);
    expect(result.errors.details).toMatch(/under 5000/);
  });

  it("reads only the expected fields from the form, as text", () => {
    const form = new FormData();
    form.set("name", "Ana");
    form.set("details", new Blob(["file"]));
    form.set("injected", "x");
    const values = readInquiryForm(form);
    expect(values.name).toBe("Ana");
    expect(values.details).toBe("");
    expect(values).not.toHaveProperty("injected");
  });
});
