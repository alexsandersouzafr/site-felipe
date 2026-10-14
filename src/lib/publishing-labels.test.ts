import { describe, expect, it } from "vitest";

import { publishingButtonLabels } from "./publishing-labels";

describe("publishingButtonLabels", () => {
  it("offers to publish something new", () => {
    expect(
      publishingButtonLabels({
        mode: "create",
        currentStatus: "draft",
        scheduleEnabled: false,
      }),
    ).toEqual({ draft: "Salvar rascunho", primary: "Publicar" });
  });

  // A plain "Salvar" used to publish a draft without saying so.
  it("says that saving a draft publishes it", () => {
    expect(
      publishingButtonLabels({
        mode: "edit",
        currentStatus: "draft",
        scheduleEnabled: false,
      }),
    ).toEqual({ draft: "Salvar rascunho", primary: "Publicar" });
  });

  // "Salvar rascunho" on a live item used to take it off the site quietly.
  it("warns that the draft button takes a live item off the site", () => {
    expect(
      publishingButtonLabels({
        mode: "edit",
        currentStatus: "published",
        scheduleEnabled: false,
      }),
    ).toEqual({
      draft: "Tirar do ar (rascunho)",
      primary: "Salvar alterações",
    });
  });

  it("names the schedule when one is set", () => {
    expect(
      publishingButtonLabels({
        mode: "edit",
        currentStatus: "scheduled",
        scheduleEnabled: true,
      }).primary,
    ).toBe("Agendar publicação");
  });
});
