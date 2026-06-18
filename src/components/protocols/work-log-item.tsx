"use client";

import { toggleWorkLogEntry } from "@/actions/work-logs";
import { useRef } from "react";

type Entry = {
  id: string;
  itemLabel: string;
  checked: boolean;
  checkedAt: Date | null;
  employee: { firstName: string; lastName: string } | null;
};

export function WorkLogItem({
  entry,
  disabled,
}: {
  entry: Entry;
  disabled: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    const selector = document.getElementById("work-log-employee") as HTMLSelectElement | null;
    if (selector?.value) {
      formData.set("employeeId", selector.value);
    }
    return toggleWorkLogEntry(formData);
  }

  return (
    <div
      className={`px-3 py-3 transition-colors sm:px-4 ${
        entry.checked ? "bg-emerald-50/60" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <form ref={formRef} action={handleSubmit} className="flex-shrink-0">
          <input type="hidden" name="entryId" value={entry.id} />
          <input type="hidden" name="checked" value={entry.checked ? "false" : "true"} />
          <button
            type="submit"
            disabled={disabled}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 transition-colors sm:h-7 sm:w-7 ${
              entry.checked
                ? "border-emerald-400 bg-emerald-500 text-white"
                : "border-black/15 bg-white hover:border-gold active:bg-gold/10"
            } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            {entry.checked && (
              <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </form>

        <p
          className={`min-w-0 flex-1 font-sans text-[15px] leading-snug sm:text-sm ${
            entry.checked ? "text-grey line-through" : "text-black"
          }`}
        >
          {entry.itemLabel}
        </p>

        <div className="flex flex-shrink-0 items-center gap-2">
          {entry.checked && entry.employee && (
            <span className="font-sans text-[11px] text-grey/60">
              {entry.employee.firstName} {entry.employee.lastName[0]}.
            </span>
          )}
          {entry.checked && entry.checkedAt && (
            <span className="font-sans text-[11px] text-grey/60">
              {new Date(entry.checkedAt).toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
