import { describe, expect, it } from "vitest";

import {
  adminNavGroups,
  adminNavItems,
  isAdminNavItemActive,
} from "./admin-nav";

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
      "/admin/imprensa",
      "/admin/contato",
      "/admin/mensagens",
    ]);
  });

  it("puts every item but the home shortcut under a menu section, in order", () => {
    expect(adminNavGroups.map((group) => group.label)).toEqual([
      "Conteúdo",
      "Mídia",
      "Site",
    ]);
    expect(adminNavGroups.flatMap((group) => group.items)).toEqual(
      adminNavItems.filter((item) => item.href !== "/admin"),
    );
  });

  it("marks an item active for its own screens only", () => {
    expect(isAdminNavItemActive("/admin", "/admin")).toBe(true);
    expect(isAdminNavItemActive("/admin", "/admin/agenda")).toBe(false);
    expect(isAdminNavItemActive("/admin/agenda", "/admin/agenda/nova")).toBe(
      true,
    );
    expect(isAdminNavItemActive("/admin/fotos", "/admin/home-fotos")).toBe(
      false,
    );
  });
});
