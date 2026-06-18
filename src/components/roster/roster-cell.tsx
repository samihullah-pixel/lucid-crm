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
      <div className="flex h-full min-h-[80px] items-center justify-center bg-black/[0.02]">
        <span className="font-sans text-[10px] text-grey/40">—</span>
      </div>
    );
  }

  const assignedIds = new Set(assignments.map((a) => a.employeeId));
  const unassigned = availableEmployees.filter((e) => !assignedIds.has(e.id));

  let statusBg = "bg-red-50 border-red-200";
  let statusText = "text-red-700";
  if (count === 0) {
    statusBg = "bg-red-50 border-red-200";
    statusText = "text-red-600";
  } else if (isFull) {
    statusBg = "bg-emerald-50 border-emerald-200";
    statusText = "text-emerald-700";
  } else {
    statusBg = "bg-amber-50 border-amber-200";
    statusText = "text-amber-700";
  }

  return (
    <div className={`min-h-[80px] border ${statusBg} p-1.5`}>
      <div className="space-y-1">
        {assignments.map((a) => (
          <div
            key={a.id}
            className="group flex items-center gap-1 rounded bg-white/80 px-1.5 py-0.5"
          >
            <span
              className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: a.employee.color ?? "#999" }}
            />
            <span className="flex-1 truncate font-sans text-[11px] text-black">
              {a.employee.firstName} {a.employee.lastName[0]}.
            </span>
            <form action={removeAssignment}>
              <input type="hidden" name="id" value={a.id} />
              <button
                type="submit"
                className="hidden font-sans text-[10px] text-grey hover:text-red-600 group-hover:inline"
              >
                ✕
              </button>
            </form>
          </div>
        ))}
      </div>

      {!isFull && unassigned.length > 0 && (
        <div className="mt-1">
          {!showSelect ? (
            <button
              type="button"
              onClick={() => setShowSelect(true)}
              className="w-full rounded border border-dashed border-black/10 py-0.5 font-sans text-[10px] text-grey hover:border-gold hover:text-gold-dark"
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
                className="w-full border border-gold/30 bg-white px-1 py-0.5 font-sans text-[11px] focus:border-gold focus:outline-none"
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

      <div className={`mt-1 text-center font-sans text-[10px] font-medium ${statusText}`}>
        {count}/{requiredStaff}
      </div>
    </div>
  );
}
