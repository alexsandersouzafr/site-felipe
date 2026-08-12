import { describe, expect, it } from "vitest";

import { resolveAdminAccess } from "./admin-access";

describe("resolveAdminAccess", () => {
  it("allows public routes without auth", () => {
    expect(
      resolveAdminAccess({
        pathname: "/pt",
        isAuthenticated: false,
        isAdmin: false,
      }),
    ).toEqual({ action: "allow" });
  });

  it("redirects unauthenticated users away from protected admin routes", () => {
    expect(
      resolveAdminAccess({
        pathname: "/admin",
        isAuthenticated: false,
        isAdmin: false,
      }),
    ).toEqual({ action: "redirect", to: "/admin/login" });
  });

  it("rejects authenticated non-admins from protected admin routes", () => {
    expect(
      resolveAdminAccess({
        pathname: "/admin/events",
        isAuthenticated: true,
        isAdmin: false,
      }),
    ).toEqual({
      action: "redirect",
      to: "/admin/login?error=unauthorized",
    });
  });

  it("allows admins into protected admin routes", () => {
    expect(
      resolveAdminAccess({
        pathname: "/admin",
        isAuthenticated: true,
        isAdmin: true,
      }),
    ).toEqual({ action: "allow" });
  });

  it("allows auth screens for guests and sends admins to the dashboard", () => {
    expect(
      resolveAdminAccess({
        pathname: "/admin/login",
        isAuthenticated: false,
        isAdmin: false,
      }),
    ).toEqual({ action: "allow" });

    expect(
      resolveAdminAccess({
        pathname: "/admin/login",
        isAuthenticated: true,
        isAdmin: true,
      }),
    ).toEqual({ action: "redirect", to: "/admin" });
  });
});
