"use client";

import { assignEmployee, removeAssignment } from "@/actions/roster";
import { useState } from "react";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  color: string | null;
};

type Assignment = {
  id: string;
  employeeId: string;
  employee: Employee;
};

export function RosterCell({
  shiftId,
  date,
  assignments,
  requiredStaff,
  availableEmployees,
  isScheduledDay,
}: {
  shiftId: string;
  date: string;
  assignments: Assignment[];
  requiredStaff: number;
  availableEmployees: Employee[];
  isScheduledDay: boolean;
}) {
  const [showSelect, setShowSelect] = useState(false);
  const count = assignments.length;
  const isFull = count >= requiredStaff;

  if (!isScheduledDay) {
    return (
      <div className="flex h-full min-h-[60px] items-center justify-center bg-black/[0.02] md:min-h-[80px]">
        <span className="font-sans text-[10px] text-grey/40">—</span>
      </div>
    );
  }

  const assignedIds = new Set(assignments.map((a) => a.employeeId));
  const unassigned = availableEmployees.filter((e) => !assignedIds.has(e.id));

  let statusBg = "bg-red-50";
  if (isFull) {
    statusBg = "bg-emerald-50";
  } else if (count > 0) {
    statusBg = "bg-amber-50";
  }

  return (
    <div className={`min-h-[60px] ${statusBg} p-2 md:min-h-[80px] md:p-1.5`}>
      <div className="space-y-1.5 md:space-y-1">
        {assignments.map((a) => (
          <div
            key={a.id}
            className="group flex items-center gap-2 rounded bg-white/80 px-2 py-1.5 md:gap-1 md:px-1.5 md:py-0.5"
          >
            <span
              className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full md:h-2 md:w-2"
              style={{ backgroundColor: a.employee.color ?? "#999" }}
            />
            <span className="flex-1 truncate font-sans text-sm text-black md:text-[11px]">
              {a.employee.firstName} {a.employee.lastName[0]}.
            </span>
            <form action={removeAssignment}>
              <input type="hidden" name="id" value={a.id} />
              <button
                type="submit"
                className="px-1 font-sans text-sm text-grey hover:text-red-600 md:hidden md:text-[10px] md:group-hover:inline"
              >
                ✕
              </button>
            </form>
          </div>
        ))}
      </div>

      {!isFull && unassigned.length > 0 && (
        <div className="mt-1.5 md:mt-1">
          {!showSelect ? (
            <button
              type="button"
              onClick={() => setShowSelect(true)}
              className="w-full rounded border border-dashed border-black/10 py-1.5 font-sans text-xs text-grey hover:border-gold hover:text-gold-dark md:py-0.5 md:text-[10px]"
            >
              + Mitarbeiter
            </button>
          ) : (
            <form
              action={async (formData) => {
                await assignEmployee(formData);
                setShowSelect(false);
              }}
            >
              <input type="hidden" name="shiftId" value={shiftId} />
              <input type="hidden" name="date" value={date} />
              <select
                name="employeeId"
                autoFocus
                onChange={(e) => {
                  if (e.target.value) e.target.form?.requestSubmit();
                }}
                onBlur={() => setShowSelect(false)}
                className="w-full rounded border border-gold/30 bg-white px-2 py-1.5 font-sans text-sm focus:border-gold focus:outline-none md:px-1 md:py-0.5 md:text-[11px]"
              >
                <option value="">Waehlen...</option>
                {unassigned.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
