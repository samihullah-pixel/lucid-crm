"use client";

import { createShift, deleteShift } from "@/actions/shifts";
import { useRef } from "react";

type Shift = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  requiredStaff: number;
  weekdays: number[];
  validFrom: Date;
  validUntil: Date | null;
  sortOrder: number;
  isActive: boolean;
};

type SiteData = {
  id?: string;
  name?: string;
  shortName?: string;
  color?: string | null;
  address?: string | null;
  notes?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  shifts?: Shift[];
} | null;

const WEEKDAYS = [
  { value: 1, label: "Mo" },
  { value: 2, label: "Di" },
  { value: 3, label: "Mi" },
  { value: 4, label: "Do" },
  { value: 5, label: "Fr" },
  { value: 6, label: "Sa" },
  { value: 7, label: "So" },
];

export function SiteForm({
  action,
  site,
}: {
  action: (formData: FormData) => Promise<void>;
  site?: SiteData;
}) {
  const shiftFormRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-8">
      <form action={action} className="space-y-6 border border-gold/20 bg-white p-6">
        <h2 className="font-serif text-xl font-light text-black">
          {site?.id ? "Standort bearbeiten" : "Neuer Standort"}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
              Name *
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={site?.name ?? ""}
              className="w-full border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
              placeholder="z.B. Dieselhof"
            />
          </div>
          <div>
            <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
              Kuerzel *
            </label>
            <input
              type="text"
              name="shortName"
              required
              defaultValue={site?.shortName ?? ""}
              className="w-full border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
              placeholder="z.B. DH"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
              Farbe
            </label>
            <input
              type="color"
              name="color"
              defaultValue={site?.color ?? "#d4a853"}
              className="h-10 w-20 cursor-pointer border border-gold/20"
            />
          </div>
          <div>
            <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
              Sortierung
            </label>
            <input
              type="number"
              name="sortOrder"
              defaultValue={site?.sortOrder ?? 0}
              className="w-full border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
            Adresse
          </label>
          <input
            type="text"
            name="address"
            defaultValue={site?.address ?? ""}
            className="w-full border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
            Notizen
          </label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={site?.notes ?? ""}
            className="w-full border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={site?.isActive ?? true}
            className="accent-gold"
          />
          <span className="font-sans text-sm text-grey">Aktiv</span>
        </label>

        <button
          type="submit"
          className="border border-gold bg-gold/10 px-6 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-colors hover:bg-gold/20"
        >
          {site?.id ? "Speichern" : "Anlegen"}
        </button>
      </form>

      {site?.id && (
        <div className="space-y-4 border border-gold/20 bg-white p-6">
          <h2 className="font-serif text-xl font-light text-black">Schichten</h2>

          {site.shifts && site.shifts.length > 0 && (
            <div className="space-y-2">
              {site.shifts.map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center justify-between rounded bg-light px-4 py-3"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-sans text-sm font-medium">{shift.name}</span>
                    <span className="font-sans text-xs text-grey">
                      {shift.startTime} – {shift.endTime}
                    </span>
                    <span className="font-sans text-xs text-grey">
                      Soll: {shift.requiredStaff}
                    </span>
                    <span className="font-sans text-[10px] text-grey">
                      {shift.weekdays.map((d) => WEEKDAYS.find((w) => w.value === d)?.label).join(", ")}
                    </span>
                  </div>
                  <form action={deleteShift.bind(null, shift.id)}>
                    <button
                      type="submit"
                      className="font-sans text-[11px] text-grey hover:text-red-600"
                      onClick={(e) => {
                        if (!confirm(`Schicht "${shift.name}" loeschen?`)) e.preventDefault();
                      }}
                    >
                      Loeschen
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}

          <form
            ref={shiftFormRef}
            action={async (formData) => {
              await createShift(formData);
              shiftFormRef.current?.reset();
            }}
            className="space-y-4 border-t border-gold/10 pt-4"
          >
            <p className="font-sans text-[11px] uppercase tracking-[2px] text-grey">
              Neue Schicht hinzufuegen
            </p>
            <input type="hidden" name="siteId" value={site.id} />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
                  Bezeichnung *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
                  placeholder="z.B. Nachtschicht"
                />
              </div>
              <div>
                <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
                  Von *
                </label>
                <input
                  type="time"
                  name="startTime"
                  required
                  className="w-full border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
                  Bis *
                </label>
                <input
                  type="time"
                  name="endTime"
                  required
                  className="w-full border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
                  Soll-Besetzung *
                </label>
                <input
                  type="number"
                  name="requiredStaff"
                  required
                  min={1}
                  defaultValue={1}
                  className="w-full border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
                  Gueltig ab *
                </label>
                <input
                  type="date"
                  name="validFrom"
                  required
                  defaultValue="2025-07-01"
                  className="w-full border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
                  Gueltig bis
                </label>
                <input
                  type="date"
                  name="validUntil"
                  className="w-full border border-gold/20 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-sans text-[11px] uppercase tracking-[2px] text-grey">
                Wochentage
              </label>
              <div className="flex gap-3">
                {WEEKDAYS.map((day) => (
                  <label key={day.value} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      name="weekdays"
                      value={day.value}
                      defaultChecked={day.value <= 5}
                      className="accent-gold"
                    />
                    <span className="font-sans text-xs">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <input type="hidden" name="sortOrder" value="0" />

            <button
              type="submit"
              className="border border-gold bg-gold/10 px-6 py-2 font-sans text-[11px] uppercase tracking-[3px] text-black transition-colors hover:bg-gold/20"
            >
              Schicht hinzufuegen
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
