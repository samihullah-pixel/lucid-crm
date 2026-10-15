"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { sendCustomerReport } from "@/actions/customer-report";

export function SendReportButton({ entryId, email }: { entryId: string; email: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Bericht jetzt an ${email} senden?`)) return;
        start(async () => {
          const result = await sendCustomerReport(entryId);
          if (result.ok) toast.success("Bericht an Kunden gesendet");
          else toast.error(result.error);
        });
      }}
      className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black disabled:opacity-50"
    >
      {pending ? "Sende" : "An Kunden senden"}
    </button>
  );
}
