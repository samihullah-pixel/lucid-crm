"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { upload } from "@vercel/blob/client";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Save,
  Copy,
  ExternalLink,
  AlertTriangle,
  Lightbulb,
  QrCode,
  ImagePlus,
  Loader2,
  Languages,
  X,
} from "lucide-react";
import type { StepMediaType } from "@prisma/client";
import {
  saveProcedure,
  updateProcedureMeta,
  createEquipmentItem,
  assignProcedureToSite,
  removeSiteAssignment,
} from "@/actions/procedures";

let keySeq = 0;
const nextKey = () => `k${keySeq++}`;

type Lang = "en" | "es";
const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "Englisch (EN)" },
  { code: "es", label: "Spanisch (ES)" },
];
type Translations = { en?: Record<string, string>; es?: Record<string, string> };

type Step = {
  key: string;
  id?: string;
  section: string;
  title: string;
  body: string;
  tip: string;
  warning: string;
  requiresCheck: boolean;
  mediaUrl: string;
  mediaType: StepMediaType;
  translations: Translations;
};
type Equip = {
  key: string;
  id?: string;
  equipmentId: string;
  name: string;
  locationNote: string;
  translations: Translations;
};
type LibItem = { id: string; name: string; defaultLocation: string | null };
type Site = { id: string; name: string };
type Assignment = {
  id: string;
  siteId: string;
  siteName: string;
  qrToken: string;
  welcomeText: string;
  waterLocation: string;
  accessNote: string;
  emergencyNote: string;
  translations: Translations;
};

// Felder der Standort-Texte (für DE-Eingabe und EN/ES-Übersetzung)
const SITE_FIELDS = [
  { key: "welcomeText", label: "Willkommenstext" },
  { key: "waterLocation", label: "Wo gibt es Wasser?" },
  { key: "accessNote", label: "Zugang / Schlüssel" },
  { key: "emergencyNote", label: "Notfall-Hinweis" },
];

// Leere Strings entfernen; gibt null zurück, wenn nichts übersetzt ist.
function cleanTr(tr: Translations): Record<string, Record<string, string>> | null {
  const out: Record<string, Record<string, string>> = {};
  (["en", "es"] as const).forEach((lang) => {
    const obj = tr[lang];
    if (!obj) return;
    const cleaned: Record<string, string> = {};
    Object.entries(obj).forEach(([k, v]) => {
      const t = (v ?? "").trim();
      if (t) cleaned[k] = t;
    });
    if (Object.keys(cleaned).length) out[lang] = cleaned;
  });
  return Object.keys(out).length ? out : null;
}

function setTr(tr: Translations, lang: Lang, field: string, value: string): Translations {
  return { ...tr, [lang]: { ...(tr[lang] ?? {}), [field]: value } };
}

export function ProcedureBuilder({
  procedure,
  initialSteps,
  initialEquipment,
  equipmentLibrary,
  sites,
  assignments,
}: {
  procedure: { id: string; name: string; description: string | null; translations: Translations };
  initialSteps: Omit<Step, "key">[];
  initialEquipment: Omit<Equip, "key">[];
  equipmentLibrary: LibItem[];
  sites: Site[];
  assignments: Assignment[];
}) {
  const [name, setName] = useState(procedure.name);
  const [description, setDescription] = useState(procedure.description ?? "");
  const [procTr, setProcTr] = useState<Translations>(procedure.translations ?? {});
  const [steps, setSteps] = useState<Step[]>(
    initialSteps.map((s) => ({ ...s, key: nextKey() }))
  );
  const [equipment, setEquipment] = useState<Equip[]>(
    initialEquipment.map((e) => ({ ...e, key: nextKey() }))
  );
  const [library, setLibrary] = useState<LibItem[]>(equipmentLibrary);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const uploadMedia = async (key: string, file: File) => {
    const isVideo = file.type.startsWith("video");
    setUploadingKey(key);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/sop/upload",
      });
      updateStep(key, { mediaUrl: blob.url, mediaType: isVideo ? "VIDEO" : "PHOTO" });
      toast.success(isVideo ? "Video hochgeladen" : "Foto hochgeladen");
    } catch (e) {
      toast.error(
        "Upload fehlgeschlagen – Blob-Store verbunden? (" + (e as Error).message + ")"
      );
    } finally {
      setUploadingKey(null);
    }
  };

  // ── Steps ──
  const addStep = () =>
    setSteps((s) => [
      ...s,
      { key: nextKey(), section: "", title: "", body: "", tip: "", warning: "", requiresCheck: false, mediaUrl: "", mediaType: "NONE", translations: {} },
    ]);
  const updateStep = (key: string, patch: Partial<Step>) =>
    setSteps((s) => s.map((st) => (st.key === key ? { ...st, ...patch } : st)));
  const updateStepTr = (key: string, lang: Lang, field: string, value: string) =>
    setSteps((s) => s.map((st) => (st.key === key ? { ...st, translations: setTr(st.translations, lang, field, value) } : st)));
  const removeStep = (key: string) => setSteps((s) => s.filter((st) => st.key !== key));
  const moveStep = (i: number, dir: -1 | 1) =>
    setSteps((s) => {
      const j = i + dir;
      if (j < 0 || j >= s.length) return s;
      const copy = [...s];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  // ── Equipment ──
  const addEquipFromLib = (id: string) => {
    if (!id) return;
    const lib = library.find((l) => l.id === id);
    if (!lib) return;
    if (equipment.some((e) => e.equipmentId === id)) {
      toast.error("Bereits hinzugefügt");
      return;
    }
    setEquipment((e) => [
      ...e,
      { key: nextKey(), equipmentId: id, name: lib.name, locationNote: lib.defaultLocation ?? "", translations: {} },
    ]);
  };
  const removeEquip = (key: string) => setEquipment((e) => e.filter((x) => x.key !== key));
  const updateEquip = (key: string, patch: Partial<Equip>) =>
    setEquipment((e) => e.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const updateEquipTr = (key: string, lang: Lang, value: string) =>
    setEquipment((e) => e.map((x) => (x.key === key ? { ...x, translations: setTr(x.translations, lang, "name", value) } : x)));

  const [newEqName, setNewEqName] = useState("");
  const [newEqLoc, setNewEqLoc] = useState("");
  const addNewEquipment = () => {
    const n = newEqName.trim();
    if (!n) return;
    startTransition(async () => {
      const item = await createEquipmentItem(n, newEqLoc.trim() || null);
      setLibrary((l) => [...l, item]);
      setEquipment((e) => [
        ...e,
        { key: nextKey(), equipmentId: item.id, name: item.name, locationNote: item.defaultLocation ?? "", translations: {} },
      ]);
      setNewEqName("");
      setNewEqLoc("");
      toast.success("Equipment hinzugefügt");
    });
  };

  // ── Save ──
  const save = () => {
    if (steps.some((s) => !s.title.trim())) {
      toast.error("Jeder Schritt braucht einen Titel");
      return;
    }
    startTransition(async () => {
      const metaFd = toFD({ name, description });
      metaFd.append("translations", JSON.stringify(cleanTr(procTr)));
      await updateProcedureMeta(procedure.id, metaFd);
      await saveProcedure(
        procedure.id,
        steps.map((s, i) => ({
          id: s.id,
          section: s.section.trim() || null,
          title: s.title.trim(),
          body: s.body.trim() || null,
          tip: s.tip.trim() || null,
          warning: s.warning.trim() || null,
          requiresCheck: s.requiresCheck,
          mediaUrl: s.mediaUrl.trim() || null,
          mediaType: s.mediaType,
          order: i,
          translations: cleanTr(s.translations),
        })),
        equipment.map((e, i) => ({
          id: e.id,
          equipmentId: e.equipmentId,
          locationNote: e.locationNote.trim() || null,
          order: i,
          translations: cleanTr(e.translations),
        }))
      );
      toast.success("Anleitung gespeichert");
    });
  };

  return (
    <div className="max-w-3xl space-y-8 pb-24">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Link href="/sop-procedures" className="font-sans text-[11px] uppercase tracking-[2px] text-grey hover:text-gold-dark">
            ← Anleitungen
          </Link>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full bg-transparent font-serif text-3xl font-light text-black focus:outline-none"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kurzbeschreibung…"
            className="mt-1 w-full bg-transparent font-sans text-sm font-light text-grey focus:outline-none"
          />
          <TrPanel
            tr={procTr}
            onChange={(lang, field, value) => setProcTr((t) => setTr(t, lang, field, value))}
            fields={[
              { key: "name", label: "Name" },
              { key: "description", label: "Kurzbeschreibung" },
            ]}
          />
        </div>
      </div>

      {/* STEPS */}
      <section className="space-y-3">
        <h2 className="font-sans text-[11px] uppercase tracking-[3px] text-grey">Schritte</h2>
        {steps.map((s, i) => (
          <div key={s.key} className="rounded-lg border border-gold/20 bg-white p-4">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-grey/50" />
              <span className="font-serif text-lg text-gold-dark">{i + 1}</span>
              <input
                value={s.section}
                onChange={(e) => updateStep(s.key, { section: e.target.value })}
                placeholder="Abschnitt (z.B. Eingangsbereich)"
                className="ml-2 flex-1 rounded border border-black/10 px-2 py-1 font-sans text-xs text-grey focus:border-gold focus:outline-none"
              />
              <button onClick={() => moveStep(i, -1)} aria-label="Hoch" className="text-grey hover:text-black"><ChevronUp className="h-4 w-4" /></button>
              <button onClick={() => moveStep(i, 1)} aria-label="Runter" className="text-grey hover:text-black"><ChevronDown className="h-4 w-4" /></button>
              <button onClick={() => removeStep(s.key)} aria-label="Löschen" className="text-grey hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
            <StepMedia
              step={s}
              uploading={uploadingKey === s.key}
              onUpload={(file) => uploadMedia(s.key, file)}
              onRemove={() => updateStep(s.key, { mediaUrl: "", mediaType: "NONE" })}
            />
            <input
              value={s.title}
              onChange={(e) => updateStep(s.key, { title: e.target.value })}
              placeholder="Titel des Schritts *"
              className="mt-3 w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
            />
            <textarea
              value={s.body}
              onChange={(e) => updateStep(s.key, { body: e.target.value })}
              placeholder="Beschreibung / Anleitung…"
              rows={2}
              className="mt-2 w-full rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
            />
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="flex items-start gap-2 rounded bg-gold/5 px-2 py-1.5">
                <Lightbulb className="mt-1.5 h-3.5 w-3.5 flex-shrink-0 text-gold-dark" />
                <input
                  value={s.tip}
                  onChange={(e) => updateStep(s.key, { tip: e.target.value })}
                  placeholder="Tipp (optional)"
                  className="w-full bg-transparent py-1 font-sans text-xs text-gold-dark focus:outline-none"
                />
              </div>
              <div className="flex items-start gap-2 rounded bg-[#f6e7e3] px-2 py-1.5">
                <AlertTriangle className="mt-1.5 h-3.5 w-3.5 flex-shrink-0 text-[#b3402f]" />
                <input
                  value={s.warning}
                  onChange={(e) => updateStep(s.key, { warning: e.target.value })}
                  placeholder="Warnung (optional)"
                  className="w-full bg-transparent py-1 font-sans text-xs text-[#b3402f] focus:outline-none"
                />
              </div>
            </div>
            <TrPanel
              tr={s.translations}
              onChange={(lang, field, value) => updateStepTr(s.key, lang, field, value)}
              fields={[
                { key: "section", label: "Abschnitt" },
                { key: "title", label: "Titel" },
                { key: "body", label: "Beschreibung", multiline: true },
                { key: "tip", label: "Tipp" },
                { key: "warning", label: "Warnung" },
              ]}
            />
          </div>
        ))}
        <button
          onClick={addStep}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gold/40 py-3 font-sans text-[11px] uppercase tracking-[2px] text-gold-dark hover:bg-gold/5"
        >
          <Plus className="h-4 w-4" /> Schritt hinzufügen
        </button>
      </section>

      {/* EQUIPMENT */}
      <section className="space-y-3">
        <h2 className="font-sans text-[11px] uppercase tracking-[3px] text-grey">Equipment & Material</h2>
        {equipment.map((e) => (
          <div key={e.key} className="rounded-lg border border-gold/20 bg-white p-3">
            <div className="flex items-center gap-3">
              <span className="font-sans text-sm text-black">{e.name}</span>
              <input
                value={e.locationNote}
                onChange={(ev) => updateEquip(e.key, { locationNote: ev.target.value })}
                placeholder="Fundort (z.B. Lager, Wand links)"
                className="ml-auto w-1/2 rounded border border-black/10 px-2 py-1 font-sans text-xs text-grey focus:border-gold focus:outline-none"
              />
              <button onClick={() => removeEquip(e.key)} aria-label="Entfernen" className="text-grey hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
            <TrPanel
              tr={e.translations}
              onChange={(lang, _field, value) => updateEquipTr(e.key, lang, value)}
              fields={[{ key: "name", label: "Name" }]}
              note="Übersetzung gilt für dieses Material überall."
            />
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-black/10 bg-light p-3">
          <select
            onChange={(ev) => { addEquipFromLib(ev.target.value); ev.target.value = ""; }}
            defaultValue=""
            className="rounded border border-black/15 bg-white px-2 py-1.5 font-sans text-xs focus:outline-none"
          >
            <option value="" disabled>Aus Bibliothek wählen…</option>
            {library.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <span className="font-sans text-[11px] text-grey">oder neu:</span>
          <input
            value={newEqName}
            onChange={(e) => setNewEqName(e.target.value)}
            placeholder="Name"
            className="w-32 rounded border border-black/15 px-2 py-1.5 font-sans text-xs focus:border-gold focus:outline-none"
          />
          <input
            value={newEqLoc}
            onChange={(e) => setNewEqLoc(e.target.value)}
            placeholder="Fundort"
            className="w-36 rounded border border-black/15 px-2 py-1.5 font-sans text-xs focus:border-gold focus:outline-none"
          />
          <button onClick={addNewEquipment} className="rounded-full bg-black px-3 py-1.5 font-sans text-[10px] uppercase tracking-[2px] text-gold">
            + Anlegen
          </button>
        </div>
      </section>

      {/* SITES / QR */}
      <SiteAssignments procedureId={procedure.id} sites={sites} assignments={assignments} pending={pending} startTransition={startTransition} />

      {/* SAVE BAR */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white/95 backdrop-blur md:left-64">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <span className="font-sans text-xs text-grey">{steps.length} Schritte · {equipment.length} Equipment</span>
          <div className="flex items-center gap-2">
<button
              onClick={save}
              disabled={pending}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-dark via-gold-light to-gold px-6 py-2.5 font-sans text-[11px] uppercase tracking-[3px] text-black disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {pending ? "Speichert…" : "Speichern"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Aufklappbares EN/ES-Übersetzungsfeld. Deutsch bleibt das Original oben.
function TrPanel({
  tr,
  onChange,
  fields,
  note,
}: {
  tr: Translations;
  onChange: (lang: Lang, field: string, value: string) => void;
  fields: { key: string; label: string; multiline?: boolean }[];
  note?: string;
}) {
  const [open, setOpen] = useState(false);
  const count = (["en", "es"] as const).reduce(
    (n, l) => n + Object.values(tr[l] ?? {}).filter((v) => (v ?? "").trim()).length,
    0
  );
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-[2px] text-grey hover:text-gold-dark"
      >
        <Languages className="h-3.5 w-3.5" />
        Übersetzung EN · ES{count > 0 ? ` (${count})` : ""}
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="mt-2 grid gap-3 rounded-lg bg-light p-3 sm:grid-cols-2">
          {LANGS.map(({ code, label }) => (
            <div key={code} className="space-y-2">
              <p className="font-sans text-[10px] uppercase tracking-[2px] text-gold-dark">{label}</p>
              {fields.map((f) =>
                f.multiline ? (
                  <textarea
                    key={f.key}
                    value={tr[code]?.[f.key] ?? ""}
                    onChange={(e) => onChange(code, f.key, e.target.value)}
                    placeholder={f.label}
                    rows={2}
                    className="w-full rounded border border-black/15 bg-white px-2 py-1.5 font-sans text-xs focus:border-gold focus:outline-none"
                  />
                ) : (
                  <input
                    key={f.key}
                    value={tr[code]?.[f.key] ?? ""}
                    onChange={(e) => onChange(code, f.key, e.target.value)}
                    placeholder={f.label}
                    className="w-full rounded border border-black/15 bg-white px-2 py-1.5 font-sans text-xs focus:border-gold focus:outline-none"
                  />
                )
              )}
            </div>
          ))}
          {note && <p className="font-sans text-[10px] text-grey sm:col-span-2">{note}</p>}
        </div>
      )}
    </div>
  );
}

function SiteAssignments({
  procedureId,
  sites,
  assignments,
  pending,
  startTransition,
}: {
  procedureId: string;
  sites: Site[];
  assignments: Assignment[];
  pending: boolean;
  startTransition: React.TransitionStartFunction;
}) {
  const [siteId, setSiteId] = useState("");
  const [welcomeText, setWelcomeText] = useState("");
  const [waterLocation, setWaterLocation] = useState("");
  const [accessNote, setAccessNote] = useState("");
  const [emergencyNote, setEmergencyNote] = useState("");
  const [tr, setSiteTr] = useState<Translations>({});

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const assign = () => {
    if (!siteId) { toast.error("Standort wählen"); return; }
    startTransition(async () => {
      await assignProcedureToSite(procedureId, siteId, {
        welcomeText: welcomeText.trim() || null,
        waterLocation: waterLocation.trim() || null,
        accessNote: accessNote.trim() || null,
        emergencyNote: emergencyNote.trim() || null,
        translations: cleanTr(tr),
      });
      toast.success("Standort zugewiesen");
      setSiteId(""); setWelcomeText(""); setWaterLocation(""); setAccessNote(""); setEmergencyNote(""); setSiteTr({});
    });
  };

  return (
    <section className="space-y-3">
      <h2 className="font-sans text-[11px] uppercase tracking-[3px] text-grey">Standorte & QR-Links</h2>

      {assignments.map((a) => (
        <AssignmentRow key={a.id} a={a} procedureId={procedureId} origin={origin} pending={pending} startTransition={startTransition} />
      ))}

      <div className="space-y-2 rounded-lg border border-dashed border-gold/40 p-4">
        <select
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
          className="w-full rounded border border-black/15 bg-white px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none"
        >
          <option value="">Standort wählen…</option>
          {sites.filter((s) => !assignments.some((a) => a.siteId === s.id)).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <div className="grid gap-2 sm:grid-cols-2">
          <input value={welcomeText} onChange={(e) => setWelcomeText(e.target.value)} placeholder="Willkommenstext (optional)" className="rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
          <input value={waterLocation} onChange={(e) => setWaterLocation(e.target.value)} placeholder="Wo gibt es Wasser?" className="rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
          <input value={accessNote} onChange={(e) => setAccessNote(e.target.value)} placeholder="Zugang / Schlüssel" className="rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
          <input value={emergencyNote} onChange={(e) => setEmergencyNote(e.target.value)} placeholder="Notfall-Hinweis" className="rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
        </div>
        <TrPanel
          tr={tr}
          onChange={(lang, field, value) => setSiteTr((t) => setTr(t, lang, field, value))}
          fields={SITE_FIELDS}
        />
        <button onClick={assign} disabled={pending} className="rounded-full bg-black px-4 py-2 font-sans text-[10px] uppercase tracking-[2px] text-gold disabled:opacity-50">
          + Standort zuweisen
        </button>
      </div>
    </section>
  );
}

// Bestehende Standort-Zuweisung: QR-Link + bearbeitbare Texte inkl. EN/ES.
function AssignmentRow({
  a,
  procedureId,
  origin,
  pending,
  startTransition,
}: {
  a: Assignment;
  procedureId: string;
  origin: string;
  pending: boolean;
  startTransition: React.TransitionStartFunction;
}) {
  const url = `${origin}/sop/${a.qrToken}`;
  const [open, setOpen] = useState(false);
  const [welcomeText, setWelcomeText] = useState(a.welcomeText);
  const [waterLocation, setWaterLocation] = useState(a.waterLocation);
  const [accessNote, setAccessNote] = useState(a.accessNote);
  const [emergencyNote, setEmergencyNote] = useState(a.emergencyNote);
  const [tr, setRowTr] = useState<Translations>(a.translations ?? {});

  const copy = () => {
    navigator.clipboard?.writeText(url);
    toast.success("Link kopiert");
  };

  const saveTexts = () => {
    startTransition(async () => {
      await assignProcedureToSite(procedureId, a.siteId, {
        welcomeText: welcomeText.trim() || null,
        waterLocation: waterLocation.trim() || null,
        accessNote: accessNote.trim() || null,
        emergencyNote: emergencyNote.trim() || null,
        translations: cleanTr(tr),
      });
      toast.success("Texte gespeichert");
    });
  };

  return (
    <div className="rounded-lg border border-gold/20 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm text-black">{a.siteName}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="mr-1 flex items-center gap-1 font-sans text-[10px] uppercase tracking-[2px] text-grey hover:text-gold-dark"
          >
            Texte {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <Link href={`/sop-procedures/qr/${a.qrToken}`} className="rounded border border-black/10 p-1.5 text-grey hover:text-gold-dark" aria-label="QR drucken"><QrCode className="h-4 w-4" /></Link>
          <button onClick={copy} className="rounded border border-black/10 p-1.5 text-grey hover:text-gold-dark" aria-label="Kopieren"><Copy className="h-4 w-4" /></button>
          <a href={url} target="_blank" rel="noreferrer" className="rounded border border-black/10 p-1.5 text-grey hover:text-gold-dark" aria-label="Öffnen"><ExternalLink className="h-4 w-4" /></a>
          <button
            onClick={() => startTransition(async () => { await removeSiteAssignment(a.id, procedureId); toast.success("Entfernt"); })}
            className="p-1.5 text-grey hover:text-red-600"
            aria-label="Zuweisung entfernen"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <code className="flex-1 truncate rounded bg-light px-2 py-1.5 font-mono text-xs text-grey">{url}</code>
      </div>
      {open && (
        <div className="mt-3 space-y-2 border-t border-black/5 pt-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={welcomeText} onChange={(e) => setWelcomeText(e.target.value)} placeholder="Willkommenstext (optional)" className="rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
            <input value={waterLocation} onChange={(e) => setWaterLocation(e.target.value)} placeholder="Wo gibt es Wasser?" className="rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
            <input value={accessNote} onChange={(e) => setAccessNote(e.target.value)} placeholder="Zugang / Schlüssel" className="rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
            <input value={emergencyNote} onChange={(e) => setEmergencyNote(e.target.value)} placeholder="Notfall-Hinweis" className="rounded border border-black/15 px-3 py-2 font-sans text-sm focus:border-gold focus:outline-none" />
          </div>
          <TrPanel
            tr={tr}
            onChange={(lang, field, value) => setRowTr((t) => setTr(t, lang, field, value))}
            fields={SITE_FIELDS}
          />
          <button onClick={saveTexts} disabled={pending} className="rounded-full bg-black px-4 py-2 font-sans text-[10px] uppercase tracking-[2px] text-gold disabled:opacity-50">
            Texte speichern
          </button>
        </div>
      )}
    </div>
  );
}

function StepMedia({
  step,
  uploading,
  onUpload,
  onRemove,
}: {
  step: Step;
  uploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (step.mediaUrl) {
    return (
      <div className="relative mt-3 overflow-hidden rounded-lg border border-black/10">
        {step.mediaType === "VIDEO" ? (
          <video src={step.mediaUrl} controls className="h-40 w-full bg-black object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={step.mediaUrl} alt="" className="h-40 w-full object-cover" />
        )}
        <button
          onClick={onRemove}
          aria-label="Medium entfernen"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = "";
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-black/15 py-4 font-sans text-[11px] uppercase tracking-[2px] text-grey hover:border-gold hover:text-gold-dark disabled:opacity-60"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Lädt hoch…
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4" /> Foto / Video hinzufügen
          </>
        )}
      </button>
    </div>
  );
}

function toFD(obj: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(obj)) fd.append(k, v);
  return fd;
}
