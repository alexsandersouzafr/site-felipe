import { type ReactNode, Suspense } from "react";
import { AdminToastProvider } from "@/components/admin/toast";
import { ToastFromSearchParams } from "@/components/admin/toast-from-params";

/**
 * Wraps both admin groups so every screen — signed in or not — can give
 * feedback without each page wiring its own notifications.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminToastProvider>
      {children}
      {/* Reading the query string opts a route into client rendering; the
          boundary keeps the statically rendered admin pages static. */}
      <Suspense fallback={null}>
        <ToastFromSearchParams />
      </Suspense>
    </AdminToastProvider>
  );
}
