"use client";

import { useActionState, useState } from "react";
import { employeeLogin } from "@/actions/time-tracking";

type Option = { id: string; name: string };

export function PinLogin({
  employees,
  redirectTo,
}: {
  employees: Option[];
  redirectTo: string;
}) {
  const [state, action, pending] = useActionState(employeeLogin, undefined);
  const [employeeId, setEmployeeId] = useState("");

  if (employees.length === 0) {
    return (
      <p className="font-sans text-base font-light text-grey">
        No employee accounts are set up yet. Please contact the office.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="employeeId" value={employeeId} />

      <div>
        <p className="mb-3 font-sans text-[11px] uppercase tracking-[3px] text-grey">
          Who are you
        </p>
        <div className="space-y-2">
          {employees.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setEmployeeId(e.id)}
              aria-pressed={employeeId === e.id}
              className={`flex min-h-14 w-full items-center rounded-lg border px-4 text-left font-sans text-lg font-light transition-colors ${
                employeeId === e.id
                  ? "border-gold bg-gold/15 text-black"
                  : "border-black/10 bg-white text-black"
              }`}
            >
              {e.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="pin"
          className="mb-3 block font-sans text-[11px] uppercase tracking-[3px] text-grey"
        >
          PIN
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          autoComplete="current-password"
          required
          className="h-14 w-full rounded-lg border border-black/15 bg-white px-4 text-center font-sans text-2xl tracking-[10px] focus:border-gold focus:outline-none"
        />
      </div>

      {state?.error && <p className="font-sans text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || !employeeId}
        className="h-16 w-full rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold font-sans text-sm uppercase tracking-[3px] text-black disabled:opacity-40"
      >
        {pending ? "Signing in" : "Sign in"}
      </button>
      <p className="text-center font-sans text-xs font-light text-grey">
        You stay signed in on this phone for 90 days.
      </p>
    </form>
  );
}
