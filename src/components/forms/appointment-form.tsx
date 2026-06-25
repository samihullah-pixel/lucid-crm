"use client";

import { useState } from "react";
import Link from "next/link";
import { createAppointment, updateAppointment } from "@/actions/appointments";

type Property = { id: string; name: string; customer: { companyName: string } };
type Employee = { id: string; firstName: string; lastName: string };
type Partner = { id: string; name: string };

type AppointmentInitialValues = {
  id: string;
  propertyId: string;
  employeeId: string | null;
  title: string;
  intervalType: string;
  weekdays: number[];
  date: Date | null;
  startDate: Date | null;
  startTime: string | null;
  endTime: string | null;
  standardHours: unknown;
};

const intervalOptions = [
  "EINMALIG",
  "TAEGLICH",
  "WOECHENTLICH",
  "ZWEIWOECHENTLICH",
  "MONATLICH",
  "NACH_BEDARF",
];

const weekdays = [
  { value: 1, label: "Montag" },
  { value: 2, label: "Dienstag" },
  { value: 3, label: "Mittwoch" },
  { value: 4, label: "Donnerstag" },
  { value: 5, label: "Freitag" },
  { value: 6, label: "Samstag" },
  { value: 7, label: "Sonntag" },
];

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function AppointmentForm({
  properties,
  employees,
  partners = [],
  initialValues,
}: {
  properties: Property[];
  employees: Employee[];
  partners?: Partner[];
  initialValues?: AppointmentInitialValues;
}) {
  const action = initialValues
    ? updateAppointment.bind(null, initialValues.id)
    : createAppointment;
  const [externalService, setExternalService] = useState(false);

  return (
    <form action={action} className="border border-gold/20 bg-white p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Objekt</label>
          <select
            name="propertyId"
            required
            defaultValue={initialValues?.propertyId}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          >
            <option value="">Bitte waehlen</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.customer.companyName})
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Titel</label>
          <input
            name="title"
            required
            defaultValue={initialValues?.title}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Mitarbeiter</label>
          <select
            name="employeeId"
            defaultValue={initialValues?.employeeId ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          >
            <option value="">Nicht zugewiesen</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Rhythmus</label>
          <select
            name="intervalType"
            defaultValue={initialValues?.intervalType}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          >
            {intervalOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block font-sans text-[11px] uppercase tracking-wide text-grey">
            Wiederkehrende Wochentage
          </label>
          <div className="flex gap-2">
            {weekdays.map((w) => (
              <label key={w.value} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="weekdays"
                  value={w.value}
                  defaultChecked={initialValues?.weekdays?.includes(w.value)}
                  className="peer sr-only"
                />
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 font-sans text-xs text-grey transition-colors peer-checked:border-gold peer-checked:bg-gold peer-checked:text-black">
                  {w.label.slice(0, 2)}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">
            Beginn (Anker fuer Rhythmus)
          </label>
          <input
            name="startDate"
            type="date"
            defaultValue={toDateInputValue(initialValues?.startDate ?? null)}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">
            Datum (nur bei einmalig)
          </label>
          <input
            name="date"
            type="date"
            defaultValue={toDateInputValue(initialValues?.date ?? null)}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Startzeit</label>
          <input
            name="startTime"
            placeholder="09:00"
            defaultValue={initialValues?.startTime ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Endzeit</label>
          <input
            name="endTime"
            placeholder="11:00"
            defaultValue={initialValues?.endTime ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Geplante Stunden</label>
          <input
            name="standardHours"
            type="number"
            step="0.25"
            defaultValue={initialValues?.standardHours as any}
            className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
          />
        </div>
      </div>
      {!initialValues && (
        <div className="mt-6 border-t border-gold/20 pt-6">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="externalService"
              checked={externalService}
              onChange={(e) => setExternalService(e.target.checked)}
            />
            <span className="font-sans text-sm font-medium text-black">
              Diese Leistung wird extern ausgeführt (Subunternehmer)
            </span>
          </label>

          {externalService && (
            <div className="mt-4 grid grid-cols-1 gap-4 rounded border border-gold/30 bg-light/40 p-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Partner</label>
                {partners.length === 0 ? (
                  <p className="font-sans text-sm font-light text-grey">
                    Noch kein Partner angelegt.{" "}
                    <Link href="/partners/new" className="text-gold-dark underline hover:text-gold">
                      Neuen Partner anlegen
                    </Link>
                  </p>
                ) : (
                  <div className="flex items-center gap-3">
                    <select
                      name="partnerId"
                      required={externalService}
                      className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
                    >
                      <option value="">Bitte wählen</option>
                      {partners.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <Link href="/partners/new" className="whitespace-nowrap font-sans text-[11px] uppercase tracking-wide text-gold-dark hover:text-gold">
                      + Neu
                    </Link>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Leistungsbeschreibung (für Partner)</label>
                <input
                  name="serviceDescription"
                  placeholder="z.B. Glasreinigung Fassade, 2. OG"
                  className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Partnerpreis (EUR, fest)</label>
                <input
                  name="partnerPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  required={externalService}
                  className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-sans text-[11px] uppercase tracking-wide text-grey">Kundenpreis (EUR, optional)</label>
                <input
                  name="customerPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
                />
              </div>
              <p className="md:col-span-2 font-sans text-xs font-light text-grey">
                Der Partnerpreis ist fest und intern — er wird dem Kunden <strong>nie</strong> angezeigt.
                Beim Speichern geht automatisch eine Terminanfrage an den Partner.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-2 text-[11px] font-sans uppercase tracking-[3px] text-black transition-shadow hover:shadow-[0_6px_24px_rgba(201,169,110,0.35)]"
        >
          Termin speichern
        </button>
      </div>
    </form>
  );
}
