import { describe, expect, it } from "vitest";

import { publishingFieldsSchema } from "./publishing";

describe("publishingFieldsSchema", () => {
  it("accepts published content without publish_at", () => {
    const result = publishingFieldsSchema.safeParse({
      status: "published",
      publishAt: "",
    });

    expect(result.success).toBe(true);
  });

  it("requires publish_at when status is scheduled", () => {
    const result = publishingFieldsSchema.safeParse({
      status: "scheduled",
      publishAt: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts scheduled content with publish_at", () => {
    const result = publishingFieldsSchema.safeParse({
      status: "scheduled",
      publishAt: "2026-08-12T10:00",
    });

    expect(result.success).toBe(true);
  });
});
