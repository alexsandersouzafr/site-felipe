import { describe, expect, it } from "vitest";

import { adminNavItems } from "./admin-nav";

describe("adminNavItems", () => {
  it("exposes every content area for the panel shell", () => {
    expect(adminNavItems.map((item) => item.href)).toEqual([
      "/admin",
      "/admin/agenda",
      "/admin/blog",
      "/admin/bio",
      "/admin/destaques",
      "/admin/home-fotos",
      "/admin/capas",
      "/admin/fotos",
      "/admin/videos",
      "/admin/contato",
      "/admin/mensagens",
    ]);
  });
});
