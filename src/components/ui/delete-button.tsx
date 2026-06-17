"use client";

import { useTransition, type ReactNode } from "react";

export function DeleteButton({
  action,
  label = "Löschen",
  confirm: confirmMsg = "Wirklich löschen?",
}: {
  action: () => Promise<void>;
  label?: ReactNode;
  confirm?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(confirmMsg)) return;
        startTransition(() => action());
      }}
      className="text-grey hover:text-red-500 disabled:opacity-40"
    >
      {isPending ? "…" : label}
    </button>
  );
}
