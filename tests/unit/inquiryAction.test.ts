import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InquiryState } from "@/lib/inquiry";

const rpc = vi.fn();
const admin = { client: { rpc }, secret: "test-secret-key-0123456789" };
let adminAvailable = true;

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }),
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => (adminAvailable ? admin : null),
}));

const { submitInquiry } = await import("@/app/(site)/consulting/actions");

const idle: InquiryState = {
  status: "idle",
  values: { name: "", email: "", organization: "", service: "", budget: "", timeline: "", details: "" },
};

function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const fields = {
    name: "Maria Santos",
    email: "maria@example.com",
    service: "iot",
    details: "A sensor that logs room temperature to a web dashboard.",
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("submitInquiry", () => {
  beforeEach(() => {
    rpc.mockReset();
    adminAvailable = true;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("stores a valid inquiry with a hashed visitor key, never the raw IP", async () => {
    rpc.mockResolvedValue({ data: [{ status: "sent", retry_after_seconds: 0 }], error: null });
    const state = await submitInquiry(idle, form());

    expect(state).toEqual({ status: "sent", name: "Maria Santos" });
    const [fn, args] = rpc.mock.calls[0]!;
    expect(fn).toBe("submit_inquiry");
    expect(args.p_ip_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(args)).not.toContain("203.0.113.7");
  });

  it("answers with the 429 state and minutes to wait when the database says so", async () => {
    rpc.mockResolvedValue({ data: [{ status: "rate_limited", retry_after_seconds: 1501 }], error: null });
    const state = await submitInquiry(idle, form());
    expect(state).toMatchObject({ status: "rate_limited", retryAfterMinutes: 26 });
    expect(state.status === "rate_limited" && state.values.details).toContain("sensor");
  });

  it("pretends success for honeypot hits and stores nothing", async () => {
    const state = await submitInquiry(idle, form({ website: "http://spam.example" }));
    expect(state.status).toBe("sent");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns field errors without touching the database", async () => {
    const state = await submitInquiry(idle, form({ email: "not-an-email" }));
    expect(state.status).toBe("invalid");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("fails softly, keeping the text, when the database errors or is not configured", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "boom" } });
    expect((await submitInquiry(idle, form())).status).toBe("error");

    adminAvailable = false;
    const offline = await submitInquiry(idle, form());
    expect(offline.status).toBe("error");
    expect(offline.status === "error" && offline.values.name).toBe("Maria Santos");
  });
});
