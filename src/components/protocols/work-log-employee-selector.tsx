"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Employee = { id: string; firstName: string; lastName: string };

const EmployeeContext = createContext<string>("");

export function useSelectedEmployee() {
  return useContext(EmployeeContext);
}

export function WorkLogEmployeeSelector({ employees }: { employees: Employee[] }) {
  return (
    <div>
      <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
        Ich bin
      </label>
      <select
        id="work-log-employee"
        className="w-full border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none sm:w-auto"
        defaultValue=""
      >
        <option value="">Mitarbeiter waehlen...</option>
        {employees.map((e) => (
          <option key={e.id} value={e.id}>
            {e.firstName} {e.lastName}
          </option>
        ))}
      </select>
    </div>
  );
}
