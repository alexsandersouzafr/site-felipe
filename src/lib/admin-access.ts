const AUTH_ROUTES = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/update-password",
]);

export type AdminAccessInput = {
  pathname: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

export type AdminAccessResult =
  | { action: "allow" }
  | { action: "redirect"; to: string };

export function resolveAdminAccess({
  pathname,
  isAuthenticated,
  isAdmin,
}: AdminAccessInput): AdminAccessResult {
  if (!pathname.startsWith("/admin")) {
    return { action: "allow" };
  }

  const isAuthRoute = AUTH_ROUTES.has(pathname);

  if (isAuthRoute) {
    if (isAuthenticated && isAdmin) {
      return { action: "redirect", to: "/admin" };
    }

    return { action: "allow" };
  }

  if (!isAuthenticated) {
    return { action: "redirect", to: "/admin/login" };
  }

  if (!isAdmin) {
    return { action: "redirect", to: "/admin/login?error=unauthorized" };
  }

  return { action: "allow" };
}
