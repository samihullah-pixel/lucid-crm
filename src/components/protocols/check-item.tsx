"use client";

import { toggleCheck, updateCheckNote, updateCheckRating } from "@/actions/protocols";
import { useState, useRef } from "react";

type Check = {
  id: string;
  areaName: string;
  itemLabel: string;
  checked: boolean;
  rating: number | null;
  note: string | null;
  checkedAt: Date | null;
};

const RATINGS = [
  { value: 1, label: "Mangelhaft", color: "bg-red-500", ring: "ring-red-300" },
  { value: 2, label: "Ausreichend", color: "bg-amber-500", ring: "ring-amber-300" },
  { value: 3, label: "Gut", color: "bg-emerald-500", ring: "ring-emerald-300" },
];

export function CheckItem({
  check,
  disabled,
}: {
  check: Check;
  disabled: boolean;
}) {
  const [showNote, setShowNote] = useState(!!check.note);
  const noteRef = useRef<HTMLFormElement>(null);

  return (
    <div
      className={`rounded-lg px-3 py-3 transition-colors sm:px-4 ${
        check.checked ? "bg-emerald-50/60" : "bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <form action={toggleCheck} className="mt-0.5 flex-shrink-0">
          <input type="hidden" name="checkId" value={check.id} />
          <input type="hidden" name="checked" value={check.checked ? "false" : "true"} />
          <button
            type="submit"
            disabled={disabled}
            className={`flex h-7 w-7 items-center justify-center rounded-md border-2 transition-colors sm:h-6 sm:w-6 ${
              check.checked
                ? "border-emerald-400 bg-emerald-500 text-white"
                : "border-black/15 bg-white hover:border-gold"
            } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            {check.checked && (
              <svg className="h-4 w-4 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </form>

        <div className="min-w-0 flex-1">
          <p
            className={`font-sans text-[15px] leading-snug sm:text-sm ${
              check.checked ? "text-grey line-through" : "text-black"
            }`}
          >
            {check.itemLabel}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            {!disabled && (
              <form action={updateCheckRating} className="flex gap-2">
                <input type="hidden" name="checkId" value={check.id} />
                {RATINGS.map((r) => (
                  <button
                    key={r.value}
                    type="submit"
                    name="rating"
                    value={r.value}
                    title={r.label}
                    className={`h-6 w-6 rounded-full border-2 transition-all sm:h-5 sm:w-5 ${
                      check.rating === r.value
                        ? `${r.color} border-transparent ring-2 ring-offset-1 ${r.ring}`
                        : "border-black/10 bg-white"
                    }`}
                  />
                ))}
              </form>
            )}

            {check.rating && disabled && (
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-block h-4 w-4 rounded-full ${
                    RATINGS.find((r) => r.value === check.rating)?.color ?? ""
                  }`}
                />
                <span className="font-sans text-xs text-grey">
                  {RATINGS.find((r) => r.value === check.rating)?.label}
                </span>
              </div>
            )}

            {!disabled && !showNote && (
              <button
                type="button"
                onClick={() => setShowNote(true)}
                className="font-sans text-xs text-grey hover:text-gold-dark"
              >
                + Anmerkung
              </button>
            )}

            {check.checkedAt && (
              <span className="font-sans text-[11px] text-grey/60">
                {new Date(check.checkedAt).toLocaleTimeString("de-DE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          {showNote && (
            <form
              ref={noteRef}
              action={updateCheckNote}
              className="mt-2"
            >
              <input type="hidden" name="checkId" value={check.id} />
              <input
                type="text"
                name="note"
                defaultValue={check.note ?? ""}
                placeholder="Anmerkung..."
                disabled={disabled}
                className="w-full rounded-md border border-black/10 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none disabled:bg-light"
                onBlur={(e) => {
                  if (!disabled) e.target.form?.requestSubmit();
                }}
              />
            </form>
          )}

          {check.note && disabled && (
            <p className="mt-1.5 font-sans text-sm italic text-grey">{check.note}</p>
          )}
        </div>
      </div>
    </div>
  );
}
