import { describe, expect, it } from "vitest";

import { isAdminToastCode, withToast } from "./admin-toast";

describe("admin toast codes", () => {
  it("adds the code to a plain path", () => {
    expect(withToast("/admin/fotos", "saved")).toBe("/admin/fotos?toast=saved");
  });

  it("keeps a query string that is already there", () => {
    expect(withToast("/admin/imprensa?categoria=stage", "deleted")).toBe(
      "/admin/imprensa?categoria=stage&toast=deleted",
    );
  });

  it("only recognises codes it has a message for", () => {
    expect(isAdminToastCode("saved")).toBe(true);
    expect(isAdminToastCode("whatever")).toBe(false);
    // A crafted URL must not reach into the prototype chain.
    expect(isAdminToastCode("toString")).toBe(false);
  });
});
