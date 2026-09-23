"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAdminToast } from "@/components/admin/toast";
import { ADMIN_TOASTS, isAdminToastCode, TOAST_PARAM } from "@/lib/admin-toast";

/**
 * Shows the toast an action asked for through the URL, then takes the
 * parameter back out so a reload or a shared link does not repeat it.
 */
export function ToastFromSearchParams() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useAdminToast();
  const handled = useRef(false);

  useEffect(() => {
    const code = searchParams.get(TOAST_PARAM);

    if (!code || !isAdminToastCode(code)) {
      handled.current = false;
      return;
    }

    // The effect runs twice in development; the ref keeps one toast per code.
    if (handled.current) {
      return;
    }

    handled.current = true;
    toast(ADMIN_TOASTS[code]);

    const rest = new URLSearchParams(searchParams);
    rest.delete(TOAST_PARAM);
    const query = rest.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [searchParams, pathname, router, toast]);

  return null;
}
