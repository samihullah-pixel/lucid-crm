"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function FlashToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const shown = useRef(false);

  useEffect(() => {
    const flash = params.get("flash");
    if (!flash || shown.current) return;
    shown.current = true;

    if (flash.startsWith("error:")) {
      toast.error(flash.slice(6));
    } else {
      toast.success(flash);
    }

    const next = new URLSearchParams(params.toString());
    next.delete("flash");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [params, router, pathname]);

  return null;
}
