"use client";

import { useState } from "react";
import {
  Boxes,
  ClipboardCheck,
  AlertTriangle,
  ChevronRight,
  X,
  ChevronLeft,
  Droplet,
  KeyRound,
  Lightbulb,
  Phone,
  MapPin,
} from "lucide-react";
import type { Guide } from "@/lib/sop";

type View = "hub" | "steps" | "equipment" | "emergency";

export function SopGuide({ guide }: { guide: Guide }) {
  const [view, setView] = useState<View>("hub");
  const [step, setStep] = useState(0);

  const { site, procedure } = guide;
  const steps = procedure.steps;

  if (view === "steps" && steps.length > 0) {
    const s = steps[step];
    const pct = ((step + 1) / steps.length) * 100;
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-light">
        <div className="flex items-center gap-3 bg-white px-4 py-3">
          <button onClick={() => setView("hub")} aria-label="Schließen" className="text-grey">
            <X className="h-5 w-5" />
          </button>
          <div className="flex flex-1 gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i <= step ? "bg-gold" : "bg-black/10"}`}
              />
            ))}
          </div>
        </div>

        <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-500 text-xs uppercase tracking-widest text-white/70">
          {s.mediaUrl ? (
            s.mediaType === "VIDEO" ? (
              <video src={s.mediaUrl} controls className="h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.mediaUrl} alt={s.title} className="h-full w-full object-cover" />
            )
          ) : (
            <span>Foto / Clip folgt</span>
          )}
        </div>

        <div className="flex-1 px-6 py-6">
          <p className="font-sans text-[11px] uppercase tracking-[3px] text-gold-dark">
            Schritt {step + 1} von {steps.length}
            {s.section ? ` · ${s.section}` : ""}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-light leading-tight text-black">
            {s.title}
          </h1>
          {s.body && (
            <p className="mt-4 font-sans text-base font-light leading-relaxed text-black/70">
              {s.body}
            </p>
          )}
          {s.warning && (
            <div className="mt-5 flex gap-3 rounded-lg bg-[#f6e7e3] px-4 py-3 text-sm leading-snug text-[#b3402f]">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.6} />
              {s.warning}
            </div>
          )}
          {s.tip && (
            <div className="mt-3 flex gap-3 rounded-lg bg-gold/10 px-4 py-3 text-sm leading-snug text-gold-dark">
              <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.6} />
              {s.tip}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-4 pb-6 pt-2">
          <button
            onClick={() => (step === 0 ? setView("hub") : setStep(step - 1))}
            className="flex items-center justify-center gap-1 rounded-full border border-black/10 bg-white px-5 py-4 font-sans text-[11px] uppercase tracking-[2px] text-grey"
          >
            <ChevronLeft className="h-4 w-4" /> Zurück
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex flex-1 items-center justify-center gap-1 rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-4 font-sans text-[11px] uppercase tracking-[3px] text-black"
            >
              Weiter <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setView("hub")}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-5 py-4 font-sans text-[11px] uppercase tracking-[3px] text-gold"
            >
              <ClipboardCheck className="h-4 w-4" /> Fertig
            </button>
          )}
        </div>
      </div>
    );
  }

  if (view === "equipment") {
    return (
      <SubPage title="Equipment & Material" onBack={() => setView("hub")}>
        <div className="grid grid-cols-2 gap-3">
          {procedure.equipment.map((pe) => (
            <div key={pe.id} className="rounded-xl border border-black/5 bg-white p-4 text-center">
              <div className="mb-3 flex h-16 items-center justify-center rounded-lg bg-light">
                {pe.equipment.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pe.equipment.imageUrl} alt={pe.equipment.name} className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <Boxes className="h-7 w-7 text-gold-dark" strokeWidth={1.3} />
                )}
              </div>
              <p className="font-sans text-sm text-black">{pe.equipment.name}</p>
              <p className="mt-1 font-sans text-[11px] text-grey">
                {pe.locationNote ?? pe.equipment.defaultLocation ?? ""}
              </p>
            </div>
          ))}
          {procedure.equipment.length === 0 && (
            <p className="col-span-2 py-8 text-center font-sans text-sm text-grey">
              Noch kein Equipment hinterlegt.
            </p>
          )}
        </div>
        {guide.waterLocation && (
          <div className="mt-6">
            <p className="mb-2 font-sans text-[11px] uppercase tracking-[3px] text-grey">Wasser</p>
            <div className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-4">
              <Droplet className="h-6 w-6 flex-shrink-0 text-gold-dark" strokeWidth={1.4} />
              <p className="font-sans text-sm text-black">{guide.waterLocation}</p>
            </div>
          </div>
        )}
        {guide.accessNote && (
          <div className="mt-4">
            <p className="mb-2 font-sans text-[11px] uppercase tracking-[3px] text-grey">Zugang</p>
            <div className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-4">
              <KeyRound className="h-6 w-6 flex-shrink-0 text-gold-dark" strokeWidth={1.4} />
              <p className="font-sans text-sm text-black">{guide.accessNote}</p>
            </div>
          </div>
        )}
      </SubPage>
    );
  }

  if (view === "emergency") {
    return (
      <SubPage title="Notfall" onBack={() => setView("hub")}>
        <div className="rounded-xl bg-[#f6e7e3] p-5 text-[#b3402f]">
          <AlertTriangle className="h-8 w-8" strokeWidth={1.5} />
          <p className="mt-3 font-sans text-base font-light leading-relaxed">
            {guide.emergencyNote ??
              "Person im Bus (eingeschlafen / zurückgeblieben)? Nicht selbst wecken — sofort die Leitstelle anrufen."}
          </p>
          <a
            href="tel:"
            className="mt-5 flex items-center justify-center gap-2 rounded-full bg-[#b3402f] px-5 py-4 font-sans text-[12px] uppercase tracking-[3px] text-white"
          >
            <Phone className="h-4 w-4" /> Hochbahn anrufen
          </a>
        </div>
      </SubPage>
    );
  }

  // HUB
  return (
    <div className="mx-auto min-h-screen max-w-md bg-light">
      <div className="bg-black px-6 pb-8 pt-7 text-light">
        <div className="font-serif text-2xl tracking-wide">
          Lucid<span className="text-gold">*</span>
        </div>
        <p className="mt-5 font-sans text-[11px] uppercase tracking-[3px] text-gold">
          {procedure.name}
        </p>
        <h1 className="mt-1.5 font-serif text-3xl font-light leading-tight">
          {guide.welcomeText ?? `Willkommen · ${site.name}`}
        </h1>
        {procedure.description && (
          <p className="mt-2 font-sans text-sm font-light text-white/60">
            {procedure.description}
          </p>
        )}
      </div>

      <div className="grid gap-3 p-4">
        <Card
          icon={<Boxes className="h-6 w-6" strokeWidth={1.5} />}
          title="Equipment & Material"
          desc="Was du brauchst & wo du es findest"
          onClick={() => setView("equipment")}
        />
        {guide.waterLocation || guide.accessNote ? null : null}
        <Card
          icon={<ClipboardCheck className="h-6 w-6" strokeWidth={1.5} />}
          title="Reinigung Schritt für Schritt"
          desc="Fahrerkabine, Innenraum, Kontrolle"
          badge={`${steps.length} Schritte`}
          onClick={() => {
            setStep(0);
            setView("steps");
          }}
        />
        <Card
          icon={<MapPin className="h-6 w-6" strokeWidth={1.5} />}
          title="Wasser & Zugang"
          desc="Wo es Wasser gibt · Schlüssel & Türen"
          onClick={() => setView("equipment")}
        />
        <Card
          icon={<AlertTriangle className="h-6 w-6" strokeWidth={1.5} />}
          title="Notfall"
          desc="Person im Bus? → Leitstelle anrufen"
          emergency
          onClick={() => setView("emergency")}
        />
      </div>
    </div>
  );
}

function Card({
  icon,
  title,
  desc,
  badge,
  emergency,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
  emergency?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
        emergency
          ? "border-[#e3c4bc] bg-[#f6e7e3]"
          : "border-black/5 bg-white hover:border-gold"
      }`}
    >
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
          emergency ? "bg-white text-[#b3402f]" : "bg-light text-gold-dark"
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`font-sans text-base ${emergency ? "text-[#b3402f]" : "text-black"}`}>
          {title}
        </p>
        <p className={`mt-0.5 font-sans text-xs ${emergency ? "text-[#a86a5e]" : "text-grey"}`}>
          {desc}
        </p>
      </div>
      {badge ? (
        <span className="ml-auto flex-shrink-0 rounded-full bg-light px-3 py-1 font-sans text-[11px] tracking-wide text-gold-dark">
          {badge}
        </span>
      ) : (
        <ChevronRight className="ml-auto h-5 w-5 flex-shrink-0 text-grey" />
      )}
    </button>
  );
}

function SubPage({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-light">
      <div className="flex items-center gap-3 bg-white px-4 py-4">
        <button onClick={onBack} aria-label="Zurück" className="text-grey">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-sans text-[11px] uppercase tracking-[3px] text-grey">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
