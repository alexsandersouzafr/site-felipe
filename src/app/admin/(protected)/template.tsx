import type { ReactNode } from "react";

import { AdminPageTransition } from "@/components/admin/admin-page-transition";

export default function AdminProtectedTemplate({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminPageTransition>{children}</AdminPageTransition>;
}
