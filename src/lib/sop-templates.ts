import type { ServiceType } from "@prisma/client";

// Vorgefertigte Anleitungs-Vorlagen, sortiert nach Objekttyp (Gebäudeart).
// Admin wählt eine Vorlage → daraus wird eine echte, vorausgefüllte Anleitung
// erzeugt, die nur noch um Standort-Details und eigene Fotos ergänzt wird.

export type TemplateStep = {
  section?: string;
  title: string;
  body?: string;
  tip?: string;
  warning?: string;
  requiresCheck?: boolean;
};

export type TemplateEquipment = { name: string; defaultLocation?: string };

export type SopTemplate = {
  id: string;
  label: string; // Objekttyp, im Picker angezeigt
  icon: string; // Emoji zur schnellen Erkennung
  serviceType: ServiceType;
  name: string; // Default-Name der erzeugten Anleitung
  description: string;
  steps: TemplateStep[];
  equipment: TemplateEquipment[];
};

export const SOP_TEMPLATES: SopTemplate[] = [
  {
    id: "buero",
    label: "Büro",
    icon: "🏢",
    serviceType: "UNTERHALTSREINIGUNG",
    name: "Büroreinigung",
    description: "Unterhaltsreinigung Büroflächen · Arbeitsplätze, Sanitär, Küche",
    steps: [
      {
        section: "Vorbereitung",
        title: "Anmelden & Material bereitstellen",
        body: "Beim Objektverantwortlichen anmelden (falls vorgegeben). Reinigungswagen bestücken, Sicherheitsschilder bereithalten.",
        tip: "Fenster kurz lüften, bevor du beginnst.",
        requiresCheck: true,
      },
      {
        section: "Arbeitsplätze",
        title: "Papierkörbe leeren",
        body: "Alle Papierkörbe leeren, bei Bedarf neuen Beutel einsetzen. Müll nach Vorgabe trennen.",
      },
      {
        section: "Arbeitsplätze",
        title: "Oberflächen abwischen",
        body: "Schreibtische (freie Flächen), Ablagen, Fensterbänke und Sideboards nebelfeucht wischen.",
        warning: "Keine Unterlagen oder Tastaturen verrücken oder wegräumen.",
      },
      {
        section: "Arbeitsplätze",
        title: "Türgriffe & Lichtschalter desinfizieren",
        body: "Häufig berührte Kontaktflächen wischen: Griffe, Schalter, Aufzugtasten.",
      },
      {
        section: "Küche / Teeküche",
        title: "Küche reinigen",
        body: "Spüle, Armatur und Arbeitsflächen reinigen. Mikrowelle außen wischen. Müll entsorgen.",
        tip: "Kalkränder an der Armatur mit Entkalker entfernen.",
      },
      {
        section: "Sanitär",
        title: "WC & Waschbecken",
        body: "WC innen und außen reinigen, Waschbecken und Armaturen wischen, Spiegel streifenfrei putzen. Seife, Papier und Handtücher auffüllen.",
        requiresCheck: true,
      },
      {
        section: "Böden",
        title: "Böden saugen & wischen",
        body: "Hartböden kehren/saugen und feucht wischen, Teppichflächen saugen.",
        warning: "Nassschild aufstellen, solange der Boden feucht ist.",
      },
      {
        section: "Abschluss",
        title: "Kontrolle & abschließen",
        body: "Sichtkontrolle, Licht aus, Fenster schließen, Türen abschließen. Auffälligkeiten melden.",
        requiresCheck: true,
      },
    ],
    equipment: [
      { name: "Reinigungswagen" },
      { name: "Mikrofasertücher (farbcodiert)" },
      { name: "Allzweckreiniger" },
      { name: "Sanitärreiniger" },
      { name: "Glasreiniger" },
      { name: "Staubsauger" },
      { name: "Wischmopp & Eimer" },
      { name: "Müllbeutel & Nachfüllmaterial" },
    ],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    icon: "🍽️",
    serviceType: "UNTERHALTSREINIGUNG",
    name: "Restaurantreinigung",
    description: "Gastraum, Küche und Gäste-WC · nach Betriebsschluss",
    steps: [
      {
        section: "Gastraum",
        title: "Tische & Stühle reinigen",
        body: "Tischplatten und Stuhlflächen abwischen, Stühle hochstellen für die Bodenreinigung.",
      },
      {
        section: "Gastraum",
        title: "Theke & Kontaktflächen",
        body: "Theke, Tresen und häufig berührte Flächen reinigen und desinfizieren.",
      },
      {
        section: "Küche",
        title: "Arbeitsflächen & Edelstahl",
        body: "Edelstahlflächen fettlösend reinigen und nachpolieren. Schneidebereiche desinfizieren.",
        warning: "Lebensmittelkontaktflächen nur mit zugelassenem Desinfektionsmittel (HACCP).",
        requiresCheck: true,
      },
      {
        section: "Küche",
        title: "Böden in der Küche",
        body: "Küchenboden kehren, fettlösend schrubben und nachwischen. Bodenabläufe reinigen.",
        warning: "Rutschgefahr durch Fett — Nassschild aufstellen.",
      },
      {
        section: "Gäste-WC",
        title: "Sanitär reinigen & auffüllen",
        body: "WC, Urinale, Waschbecken und Spiegel reinigen. Seife, Papier und Handtücher auffüllen.",
        requiresCheck: true,
      },
      {
        section: "Abschluss",
        title: "Müll & Endkontrolle",
        body: "Restmüll und Wertstoffe entsorgen, Behälter reinigen. Sichtkontrolle, Licht aus, abschließen.",
        tip: "Fettabscheider-Bereich auf Auffälligkeiten prüfen und ggf. melden.",
        requiresCheck: true,
      },
    ],
    equipment: [
      { name: "Fettlöser / Grillreiniger" },
      { name: "Desinfektionsmittel (HACCP-konform)" },
      { name: "Edelstahlpflege" },
      { name: "Mikrofasertücher (farbcodiert)" },
      { name: "Schrubber & Bodenwischer" },
      { name: "Sanitärreiniger" },
      { name: "Müllbeutel & Nachfüllmaterial" },
    ],
  },
  {
    id: "hotelzimmer",
    label: "Hotelzimmer",
    icon: "🛏️",
    serviceType: "UNTERHALTSREINIGUNG",
    name: "Hotelzimmer-Reinigung",
    description: "Abreise- und Bleibe-Zimmer · Bad, Bett, Oberflächen",
    steps: [
      {
        section: "Vorbereitung",
        title: "Zimmer lüften & sichten",
        body: "Fenster öffnen, Gardinen aufziehen. Auf Fundsachen und Schäden prüfen und ggf. melden.",
        tip: "Fundsachen sofort an die Rezeption geben und notieren.",
      },
      {
        section: "Bett",
        title: "Betten abziehen & neu beziehen",
        body: "Bettwäsche wechseln, Bett straff und faltenfrei beziehen. Bei Bleibe-Zimmern nach Vorgabe.",
        requiresCheck: true,
      },
      {
        section: "Bad",
        title: "Bad komplett reinigen",
        body: "WC, Dusche/Wanne, Waschbecken, Armaturen und Spiegel reinigen und entkalken. Handtücher wechseln.",
        warning: "Sanitärbereich und Trinkglas-Bereich mit getrennten Tüchern (Farbcode).",
        requiresCheck: true,
      },
      {
        section: "Bad",
        title: "Verbrauchsartikel auffüllen",
        body: "Seife, Shampoo, Toilettenpapier, Kosmetiktücher und Handtücher nach Standard auffüllen.",
      },
      {
        section: "Zimmer",
        title: "Oberflächen & Staub",
        body: "Alle Oberflächen, Ablagen, TV, Telefon und Minibar abstauben/wischen. Gläser tauschen.",
      },
      {
        section: "Boden",
        title: "Boden saugen / wischen",
        body: "Teppich saugen oder Hartboden wischen, auch unter dem Bett.",
      },
      {
        section: "Abschluss",
        title: "Zimmer-Endkontrolle",
        body: "Heizung/Klima auf Standard, Licht aus, Tür verschließen. Zimmer als fertig melden.",
        requiresCheck: true,
      },
    ],
    equipment: [
      { name: "Frische Bettwäsche & Handtücher" },
      { name: "Sanitärreiniger & Entkalker" },
      { name: "Glasreiniger" },
      { name: "Mikrofasertücher (farbcodiert)" },
      { name: "Staubsauger" },
      { name: "Verbrauchsartikel (Amenities)" },
      { name: "Müllbeutel" },
    ],
  },
  {
    id: "arztpraxis",
    label: "Arztpraxis",
    icon: "🩺",
    serviceType: "DESINFEKTION",
    name: "Praxisreinigung (medizinisch)",
    description: "Wartezimmer, Behandlung, Sanitär · mit Flächendesinfektion",
    steps: [
      {
        section: "Hinweis",
        title: "Hygiene-Vorgaben beachten",
        body: "Handschuhe tragen, Hygieneplan der Praxis befolgen. Reinigung von rein nach unrein.",
        warning: "Behandlungsräume erst nach Freigabe durch das Personal betreten.",
        requiresCheck: true,
      },
      {
        section: "Wartezimmer / Empfang",
        title: "Kontaktflächen desinfizieren",
        body: "Stühle, Tische, Tresen, Türgriffe, Lichtschalter wischdesinfizieren. Zeitschriften/Spielzeug nach Vorgabe.",
      },
      {
        section: "Behandlungsräume",
        title: "Flächen wischdesinfizieren",
        body: "Liegen, Ablagen, Arbeitsflächen und Geräteoberflächen mit Flächendesinfektion wischen.",
        warning: "Keine medizinischen Geräte, Instrumente oder Materialien anfassen oder verrücken.",
        requiresCheck: true,
      },
      {
        section: "Sanitär",
        title: "Sanitär reinigen & desinfizieren",
        body: "WC, Waschbecken, Armaturen und Spender reinigen und desinfizieren. Seife, Desinfektion und Papier auffüllen.",
        requiresCheck: true,
      },
      {
        section: "Böden",
        title: "Böden desinfizierend wischen",
        body: "Böden saugen/kehren und mit Desinfektionsreiniger feucht wischen.",
        warning: "Nassschild aufstellen. Einwirkzeit des Mittels beachten.",
      },
      {
        section: "Abfall",
        title: "Abfall fachgerecht entsorgen",
        body: "Abfälle nach Praxisvorgabe trennen und entsorgen. Behälter reinigen und desinfizieren.",
        warning: "Spitze/medizinische Abfälle niemals von Hand sortieren — nur verschlossene Behälter wechseln.",
      },
    ],
    equipment: [
      { name: "Einmalhandschuhe" },
      { name: "Flächendesinfektionsmittel" },
      { name: "Desinfektions-Wischtücher" },
      { name: "Mikrofasertücher (farbcodiert)" },
      { name: "Wischmopp & Eimer" },
      { name: "Nachfüllmaterial (Seife/Papier)" },
    ],
  },
  {
    id: "treppenhaus",
    label: "Treppenhaus",
    icon: "🪜",
    serviceType: "TREPPENHAUSREINIGUNG",
    name: "Treppenhausreinigung",
    description: "Wohn-/Geschäftshaus · Treppen, Geländer, Eingang",
    steps: [
      {
        section: "Eingang",
        title: "Eingangsbereich & Matten",
        body: "Schmutzfangmatte aufnehmen und saugen, Eingangsbereich kehren. Glas/Türen bei Bedarf wischen.",
      },
      {
        section: "Treppen",
        title: "Treppen von oben nach unten",
        body: "Stufen und Podeste von oben beginnend kehren/saugen, dann feucht wischen.",
        tip: "Immer oben anfangen, damit du keine gereinigten Stufen wieder betrittst.",
        warning: "Nassschild aufstellen — Rutschgefahr auf feuchten Stufen.",
      },
      {
        section: "Treppen",
        title: "Geländer & Handläufe",
        body: "Handläufe und Geländer auf ganzer Länge feucht abwischen (Kontaktflächen).",
      },
      {
        section: "Flächen",
        title: "Briefkästen, Schalter, Fensterbänke",
        body: "Briefkastenanlage, Lichtschalter, Fensterbänke und Sockelleisten abwischen.",
      },
      {
        section: "Abschluss",
        title: "Kontrolle & Auffälligkeiten",
        body: "Sichtkontrolle. Defekte Leuchten, Schäden oder Sperrmüll im Treppenhaus melden.",
        requiresCheck: true,
      },
    ],
    equipment: [
      { name: "Besen & Kehrblech" },
      { name: "Staubsauger" },
      { name: "Wischmopp & Eimer" },
      { name: "Allzweckreiniger" },
      { name: "Mikrofasertücher" },
      { name: "Nassschild" },
    ],
  },
  {
    id: "sanitaer",
    label: "Sanitär / WC-Anlage",
    icon: "🚻",
    serviceType: "UNTERHALTSREINIGUNG",
    name: "Sanitärreinigung",
    description: "Öffentliche / betriebliche WC-Anlage · Toiletten, Waschbereich",
    steps: [
      {
        section: "Vorbereitung",
        title: "Absperren & lüften",
        body: "Bereich kurz absperren bzw. Schild aufstellen. Handschuhe anziehen, lüften.",
        requiresCheck: true,
      },
      {
        section: "Toiletten",
        title: "WC & Urinale reinigen",
        body: "WC-Becken innen mit Sanitärreiniger und Bürste, außen wischen. Urinale reinigen. Brillen desinfizieren.",
        warning: "Getrennte Tücher/Farbcode für WC und übrige Flächen verwenden.",
        requiresCheck: true,
      },
      {
        section: "Waschbereich",
        title: "Waschbecken, Armaturen & Spiegel",
        body: "Waschbecken und Armaturen reinigen und entkalken, Spiegel streifenfrei putzen.",
        tip: "Kalk mit saurem Sanitärreiniger lösen, danach klar nachwischen.",
      },
      {
        section: "Auffüllen",
        title: "Spender auffüllen",
        body: "Seife, Toilettenpapier, Papiertücher und ggf. Hygienebeutel auffüllen.",
        requiresCheck: true,
      },
      {
        section: "Böden",
        title: "Böden wischen",
        body: "Boden kehren und mit Sanitärreiniger feucht wischen, Bodenabläufe nicht vergessen.",
        warning: "Nassschild stehen lassen, bis der Boden trocken ist.",
      },
      {
        section: "Abschluss",
        title: "Kontrolle & Freigabe",
        body: "Sichtkontrolle, Geruchskontrolle. Bereich freigeben, Auffälligkeiten/Defekte melden.",
        requiresCheck: true,
      },
    ],
    equipment: [
      { name: "Einmalhandschuhe" },
      { name: "Sanitärreiniger (sauer)" },
      { name: "WC-Bürste" },
      { name: "Desinfektionsmittel" },
      { name: "Mikrofasertücher (farbcodiert)" },
      { name: "Wischmopp & Eimer" },
      { name: "Nachfüllmaterial (Seife/Papier)" },
      { name: "Nassschild" },
    ],
  },
];

export function getTemplate(id: string): SopTemplate | undefined {
  return SOP_TEMPLATES.find((t) => t.id === id);
}
