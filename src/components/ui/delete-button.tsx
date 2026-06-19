"use client";

import { useTransition, type ReactNode } from "react";
import { toast } from "sonner";

export function DeleteButton({
  action,
  label = "Löschen",
  confirm: confirmMsg = "Wirklich löschen?",
  successMessage = "Erfolgreich gelöscht",
}: {
  action: () => Promise<void>;
  label?: ReactNode;
  confirm?: string;
  successMessage?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(confirmMsg)) return;
        startTransition(async () => {
          try {
            await action();
            toast.success(successMessage);
          } catch (err) {
            const digest =
              err && typeof err === "object" && "digest" in err
                ? String((err as { digest: unknown }).digest)
                : "";
            if (digest.startsWith("NEXT_REDIRECT")) {
              toast.success(successMessage);
              return;
            }
            toast.error("Löschen fehlgeschlagen");
          }
        });
      }}
      className="text-grey hover:text-red-500 disabled:opacity-40"
    >
      {isPending ? "…" : label}
    </button>
  );
}
