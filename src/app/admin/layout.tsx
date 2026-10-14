import { type ReactNode, Suspense } from "react";
import { AdminToastProvider } from "@/components/admin/toast";
import { ToastFromSearchParams } from "@/components/admin/toast-from-params";

/**
 * No admin page may be prerendered. A static page goes out with
 * `s-maxage=31536000`, and the CDN in front of production keeps it for a year:
 * after the next deploy it would still hand out HTML pointing at the old
 * build's scripts and Server Action ids — a form that cannot be saved.
 */
export const dynamic = "force-dynamic";

/**
 * Wraps both admin groups so every screen — signed in or not — can give
 * feedback without each page wiring its own notifications.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminToastProvider>
      {children}
      {/* `useSearchParams` needs a Suspense boundary to render. */}
      <Suspense fallback={null}>
        <ToastFromSearchParams />
      </Suspense>
    </AdminToastProvider>
  );
}
