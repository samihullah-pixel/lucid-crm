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
  { value: 1, label: "Mangelhaft", color: "bg-red-500" },
  { value: 2, label: "Ausreichend", color: "bg-amber-500" },
  { value: 3, label: "Gut", color: "bg-emerald-500" },
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
      className={`flex items-start gap-3 rounded px-3 py-2 transition-colors ${
        check.checked ? "bg-emerald-50/50" : "bg-white"
      }`}
    >
      <form action={toggleCheck} className="mt-0.5 flex-shrink-0">
        <input type="hidden" name="checkId" value={check.id} />
        <input type="hidden" name="checked" value={check.checked ? "false" : "true"} />
        <button
          type="submit"
          disabled={disabled}
          className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
            check.checked
              ? "border-emerald-400 bg-emerald-500 text-white"
              : "border-black/20 bg-white hover:border-gold"
          } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        >
          {check.checked && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </form>

      <div className="min-w-0 flex-1">
        <span
          className={`font-sans text-sm ${
            check.checked ? "text-grey line-through" : "text-black"
          }`}
        >
          {check.itemLabel}
        </span>

        <div className="mt-1 flex items-center gap-2">
          {!disabled && (
            <form action={updateCheckRating} className="flex gap-1">
              <input type="hidden" name="checkId" value={check.id} />
              {RATINGS.map((r) => (
                <button
                  key={r.value}
                  type="submit"
                  name="rating"
                  value={r.value}
                  title={r.label}
                  className={`h-4 w-4 rounded-full border-2 transition-all ${
                    check.rating === r.value
                      ? `${r.color} border-transparent ring-2 ring-offset-1 ring-black/20`
                      : `border-black/10 bg-white hover:${r.color} hover:border-transparent`
                  }`}
                />
              ))}
            </form>
          )}

          {check.rating && disabled && (
            <span
              className={`inline-block h-3 w-3 rounded-full ${
                RATINGS.find((r) => r.value === check.rating)?.color ?? ""
              }`}
              title={RATINGS.find((r) => r.value === check.rating)?.label}
            />
          )}

          {!disabled && !showNote && (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              className="font-sans text-[10px] text-grey hover:text-gold-dark"
            >
              + Anmerkung
            </button>
          )}
        </div>

        {showNote && (
          <form
            ref={noteRef}
            action={updateCheckNote}
            className="mt-1"
          >
            <input type="hidden" name="checkId" value={check.id} />
            <div className="flex gap-2">
              <input
                type="text"
                name="note"
                defaultValue={check.note ?? ""}
                placeholder="Anmerkung..."
                disabled={disabled}
                className="min-w-0 flex-1 rounded border border-black/10 px-2 py-1 font-sans text-xs focus:border-gold focus:outline-none disabled:bg-light"
                onBlur={(e) => {
                  if (!disabled) e.target.form?.requestSubmit();
                }}
              />
            </div>
          </form>
        )}

        {check.note && disabled && (
          <p className="mt-1 font-sans text-xs italic text-grey">{check.note}</p>
        )}
      </div>

      {check.checkedAt && (
        <span className="flex-shrink-0 font-sans text-[10px] text-grey">
          {new Date(check.checkedAt).toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}
