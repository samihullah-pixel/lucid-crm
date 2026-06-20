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
  WifiOff,
} from "lucide-react";
import type { Guide } from "@/lib/sop";

type View = "hub" | "steps" | "equipment" | "emergency";
type Lang = "de" | "en" | "es";

const LANGS: Lang[] = ["de", "en", "es"];

const UI = {
  de: {
    equipment: "Equipment & Material",
    equipmentDesc: "Was du brauchst & wo du es findest",
    steps: "Reinigung Schritt für Schritt",
    stepsDesc: "Alle Aufgaben der Reihe nach",
    access: "Wasser & Zugang",
    accessDesc: "Wo es Wasser gibt · Schlüssel & Türen",
    emergency: "Notfall",
    emergencyDesc: "Was im Notfall zu tun ist",
    stepOf: (a: number, b: number) => `Schritt ${a} von ${b}`,
    stepsBadge: (n: number) => `${n} Schritte`,
    back: "Zurück",
    next: "Weiter",
    done: "Fertig",
    call: "Notfallnummer anrufen",
    noLogin: "Kein Login nötig",
    offlineReady: "Einmal geladen — funktioniert auch ohne Empfang",
    water: "Wasser",
    accessLabel: "Zugang",
    needToday: "Das brauchst du heute",
    photoSoon: "Foto / Clip folgt",
    emptyEquip: "Noch kein Equipment hinterlegt.",
    emergencyFallback:
      "Im Notfall nicht selbst handeln – sofort die hinterlegte Notfallnummer anrufen.",
    welcomeFallback: (s: string) => `Willkommen · ${s}`,
  },
  en: {
    equipment: "Equipment & supplies",
    equipmentDesc: "What you need & where to find it",
    steps: "Step-by-step cleaning",
    stepsDesc: "Every task in order",
    access: "Water & access",
    accessDesc: "Where to find water · keys & doors",
    emergency: "Emergency",
    emergencyDesc: "What to do in an emergency",
    stepOf: (a: number, b: number) => `Step ${a} of ${b}`,
    stepsBadge: (n: number) => `${n} steps`,
    back: "Back",
    next: "Next",
    done: "Done",
    call: "Call emergency contact",
    noLogin: "No login needed",
    offlineReady: "Loaded once — works even without signal",
    water: "Water",
    accessLabel: "Access",
    needToday: "What you need today",
    photoSoon: "Photo / clip coming",
    emptyEquip: "No equipment added yet.",
    emergencyFallback:
      "In an emergency, don't act alone – call the emergency contact immediately.",
    welcomeFallback: (s: string) => `Welcome · ${s}`,
  },
  es: {
    equipment: "Equipo y material",
    equipmentDesc: "Qué necesitas y dónde encontrarlo",
    steps: "Limpieza paso a paso",
    stepsDesc: "Todas las tareas en orden",
    access: "Agua y acceso",
    accessDesc: "Dónde hay agua · llaves y puertas",
    emergency: "Emergencia",
    emergencyDesc: "Qué hacer en una emergencia",
    stepOf: (a: number, b: number) => `Paso ${a} de ${b}`,
    stepsBadge: (n: number) => `${n} pasos`,
    back: "Atrás",
    next: "Siguiente",
    done: "Listo",
    call: "Llamar al contacto de emergencia",
    noLogin: "Sin inicio de sesión",
    offlineReady: "Cargado una vez — funciona sin cobertura",
    water: "Agua",
    accessLabel: "Acceso",
    needToday: "Lo que necesitas hoy",
    photoSoon: "Foto / clip próximamente",
    emptyEquip: "Aún no hay equipo añadido.",
    emergencyFallback:
      "En una emergencia, no actúes solo – llama de inmediato al contacto de emergencia.",
    welcomeFallback: (s: string) => `Bienvenido · ${s}`,
  },
} as const;

type Translatable = { translations?: unknown } | null | undefined;

function tf(record: Translatable, field: string, base: string | null | undefined, lang: Lang): string {
  if (lang === "de") return base ?? "";
  const tr = (record?.translations as Record<string, Record<string, string>> | undefined)?.[lang];
  return (tr && tr[field]) || base || "";
}

export function SopGuide({ guide }: { guide: Guide }) {
  const [view, setView] = useState<View>("hub");
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<Lang>("de");

  const t = UI[lang];
  const { site, procedure } = guide;
  const steps = procedure.steps;

  const LangSwitch = (
    <div className="flex gap-1.5">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-widest transition-colors ${
            l === lang ? "bg-gold text-black" : "text-grey hover:text-gold"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );

  if (view === "steps" && steps.length > 0) {
    const s = steps[step];
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-light">
        <div className="flex items-center gap-3 bg-white px-4 py-3">
          <button onClick={() => setView("hub")} aria-label="Schließen" className="text-grey">
            <X className="h-5 w-5" />
          </button>
          <div className="flex flex-1 gap-1">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-gold" : "bg-black/10"}`} />
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
            <span>{t.photoSoon}</span>
          )}
        </div>

        <div className="flex-1 px-6 py-6">
          <div className="flex items-center justify-between">
            <p className="font-sans text-[11px] uppercase tracking-[3px] text-gold-dark">
              {t.stepOf(step + 1, steps.length)}
              {tf(s, "section", s.section, lang) ? ` · ${tf(s, "section", s.section, lang)}` : ""}
            </p>
            {LangSwitch}
          </div>
          <h1 className="mt-2 font-serif text-3xl font-light leading-tight text-black">
            {tf(s, "title", s.title, lang)}
          </h1>
          {tf(s, "body", s.body, lang) && (
            <p className="mt-4 font-sans text-base font-light leading-relaxed text-black/70">
              {tf(s, "body", s.body, lang)}
            </p>
          )}
          {tf(s, "warning", s.warning, lang) && (
            <div className="mt-5 flex gap-3 rounded-lg bg-[#f6e7e3] px-4 py-3 text-sm leading-snug text-[#b3402f]">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.6} />
              {tf(s, "warning", s.warning, lang)}
            </div>
          )}
          {tf(s, "tip", s.tip, lang) && (
            <div className="mt-3 flex gap-3 rounded-lg bg-gold/10 px-4 py-3 text-sm leading-snug text-gold-dark">
              <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.6} />
              {tf(s, "tip", s.tip, lang)}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-4 pb-6 pt-2">
          <button
            onClick={() => (step === 0 ? setView("hub") : setStep(step - 1))}
            className="flex items-center justify-center gap-1 rounded-full border border-black/10 bg-white px-5 py-4 font-sans text-[11px] uppercase tracking-[2px] text-grey"
          >
            <ChevronLeft className="h-4 w-4" /> {t.back}
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex flex-1 items-center justify-center gap-1 rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-5 py-4 font-sans text-[11px] uppercase tracking-[3px] text-black"
            >
              {t.next} <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setView("hub")}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-5 py-4 font-sans text-[11px] uppercase tracking-[3px] text-gold"
            >
              <ClipboardCheck className="h-4 w-4" /> {t.done}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (view === "equipment") {
    return (
      <SubPage title={t.equipment} onBack={() => setView("hub")} langSwitch={LangSwitch}>
        <p className="mb-3 font-sans text-[11px] uppercase tracking-[3px] text-grey">{t.needToday}</p>
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
              <p className="font-sans text-sm text-black">{tf(pe.equipment, "name", pe.equipment.name, lang)}</p>
              <p className="mt-1 font-sans text-[11px] text-grey">
                {pe.locationNote ?? pe.equipment.defaultLocation ?? ""}
              </p>
            </div>
          ))}
          {procedure.equipment.length === 0 && (
            <p className="col-span-2 py-8 text-center font-sans text-sm text-grey">{t.emptyEquip}</p>
          )}
        </div>
        {tf(guide, "waterLocation", guide.waterLocation, lang) && (
          <div className="mt-6">
            <p className="mb-2 font-sans text-[11px] uppercase tracking-[3px] text-grey">{t.water}</p>
            <div className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-4">
              <Droplet className="h-6 w-6 flex-shrink-0 text-gold-dark" strokeWidth={1.4} />
              <p className="font-sans text-sm text-black">{tf(guide, "waterLocation", guide.waterLocation, lang)}</p>
            </div>
          </div>
        )}
        {tf(guide, "accessNote", guide.accessNote, lang) && (
          <div className="mt-4">
            <p className="mb-2 font-sans text-[11px] uppercase tracking-[3px] text-grey">{t.accessLabel}</p>
            <div className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-4">
              <KeyRound className="h-6 w-6 flex-shrink-0 text-gold-dark" strokeWidth={1.4} />
              <p className="font-sans text-sm text-black">{tf(guide, "accessNote", guide.accessNote, lang)}</p>
            </div>
          </div>
        )}
      </SubPage>
    );
  }

  if (view === "emergency") {
    return (
      <SubPage title={t.emergency} onBack={() => setView("hub")} langSwitch={LangSwitch}>
        <div className="rounded-xl bg-[#f6e7e3] p-5 text-[#b3402f]">
          <AlertTriangle className="h-8 w-8" strokeWidth={1.5} />
          <p className="mt-3 font-sans text-base font-light leading-relaxed">
            {tf(guide, "emergencyNote", guide.emergencyNote, lang) || t.emergencyFallback}
          </p>
          <a
            href="tel:"
            className="mt-5 flex items-center justify-center gap-2 rounded-full bg-[#b3402f] px-5 py-4 font-sans text-[12px] uppercase tracking-[3px] text-white"
          >
            <Phone className="h-4 w-4" /> {t.call}
          </a>
        </div>
      </SubPage>
    );
  }

  // HUB
  return (
    <div className="mx-auto min-h-screen max-w-md bg-light">
      <div className="bg-black px-6 pb-8 pt-7 text-light">
        <div className="flex items-center justify-between">
          <div className="font-serif text-2xl tracking-wide">
            Lucid<span className="text-gold">*</span>
          </div>
          {LangSwitch}
        </div>
        <p className="mt-5 font-sans text-[11px] uppercase tracking-[3px] text-gold">
          {tf(procedure, "name", procedure.name, lang)}
        </p>
        <h1 className="mt-1.5 font-serif text-3xl font-light leading-tight">
          {tf(guide, "welcomeText", guide.welcomeText, lang) || t.welcomeFallback(site.name)}
        </h1>
        {tf(procedure, "description", procedure.description, lang) && (
          <p className="mt-2 font-sans text-sm font-light text-white/60">
            {tf(procedure, "description", procedure.description, lang)}
          </p>
        )}
      </div>

      <div className="grid gap-3 p-4">
        <Card
          icon={<Boxes className="h-6 w-6" strokeWidth={1.5} />}
          title={t.equipment}
          desc={t.equipmentDesc}
          onClick={() => setView("equipment")}
        />
        <Card
          icon={<ClipboardCheck className="h-6 w-6" strokeWidth={1.5} />}
          title={t.steps}
          desc={t.stepsDesc}
          badge={t.stepsBadge(steps.length)}
          onClick={() => {
            setStep(0);
            setView("steps");
          }}
        />
        <Card
          icon={<MapPin className="h-6 w-6" strokeWidth={1.5} />}
          title={t.access}
          desc={t.accessDesc}
          onClick={() => setView("equipment")}
        />
        <Card
          icon={<AlertTriangle className="h-6 w-6" strokeWidth={1.5} />}
          title={t.emergency}
          desc={t.emergencyDesc}
          emergency
          onClick={() => setView("emergency")}
        />
      </div>

      <div className="flex items-center justify-center gap-2 px-6 pb-8 pt-2 text-center font-sans text-[11px] font-light text-black/40">
        <WifiOff className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
        {t.offlineReady}
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
        emergency ? "border-[#e3c4bc] bg-[#f6e7e3]" : "border-black/5 bg-white hover:border-gold"
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
        <p className={`font-sans text-base ${emergency ? "text-[#b3402f]" : "text-black"}`}>{title}</p>
        <p className={`mt-0.5 font-sans text-xs ${emergency ? "text-[#a86a5e]" : "text-grey"}`}>{desc}</p>
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
  langSwitch,
  children,
}: {
  title: string;
  onBack: () => void;
  langSwitch: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-light">
      <div className="flex items-center gap-3 bg-white px-4 py-4">
        <button onClick={onBack} aria-label="Zurück" className="text-grey">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-sans text-[11px] uppercase tracking-[3px] text-grey">{title}</span>
        <div className="ml-auto">{langSwitch}</div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
