import { describe, expect, it } from "vitest";

import {
  publishingStateFromFormData,
  statusFromIntent,
} from "./publishing-intent";

describe("publishing intent", () => {
  it("maps intents to content statuses", () => {
    expect(statusFromIntent("draft")).toBe("draft");
    expect(statusFromIntent("publish")).toBe("published");
    expect(statusFromIntent("schedule")).toBe("scheduled");
  });

  it("reads schedule intent with publish time", () => {
    const formData = new FormData();
    formData.set("intent", "schedule");
    formData.set("publishAt", "2026-08-20T20:00");

    const state = publishingStateFromFormData(formData);
    expect(state.status).toBe("scheduled");
    expect(state.publishAt).toBeTruthy();
  });

  it("clears publish time for publish and draft intents", () => {
    const formData = new FormData();
    formData.set("intent", "publish");
    formData.set("publishAt", "2026-08-20T20:00");

    expect(publishingStateFromFormData(formData)).toMatchObject({
      status: "published",
      publishAt: null,
    });
  });
});
