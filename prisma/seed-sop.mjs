import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const FIXED_TOKEN = "demo-elektrohof-bus";

async function main() {
  const site = await prisma.site.upsert({
    where: { id: "sop-demo-elektrohof" },
    update: {},
    create: {
      id: "sop-demo-elektrohof",
      name: "Elektrohof",
      shortName: "EHF",
      address: "Busdepot Elektrohof, Hamburg",
    },
  });

  // clean slate for the demo procedure
  await prisma.procedure.deleteMany({ where: { id: "sop-demo-bus" } });

  const equipmentDefs = [
    { name: "Besen", defaultLocation: "Lager, Wand links" },
    { name: "Wischmop", defaultLocation: "Lager, Wand links" },
    { name: "Microfasertücher (hell + dunkel)", defaultLocation: "Regal 2, Box „Bus\"" },
    { name: "Eimer", defaultLocation: "Waschraum" },
    { name: "Auffangbehälter Müll", defaultLocation: "Vor jeder Bustür" },
    { name: "Universalschlüssel", defaultLocation: "Schlüsselkasten Büro" },
    { name: "Glasreiniger", defaultLocation: "Regal 2, Box „Bus\"" },
  ];

  const equipment = [];
  for (const def of equipmentDefs) {
    const e = await prisma.equipmentItem.create({ data: def });
    equipment.push(e);
  }

  const steps = [
    { section: "Vorbereitung", title: "Bus öffnen", body: "Vorne die Klappe öffnen und den Knopf drücken, um die Türen zu aktivieren. VHH-Türen ggf. mit dem Universalschlüssel öffnen.", tip: "Universalschlüssel hängt im Schlüsselkasten im Büro." },
    { section: "Innenraum", title: "Fahrerkabine ausfegen", body: "Zuerst die Fahrerkabine fegen, dann in den Innenraum gehen." },
    { section: "Innenraum", title: "Obere Ebene & Seiten fegen", body: "Im Innenraum die oberen Ebenen und die Busseiten (unter den Sitzen) nach hinten durchfegen." },
    { section: "Innenraum", title: "Nach hinten durchlaufen", body: "Bis nach hinten laufen, dabei auch nach oben schauen: Liegt Abfall auf den Sitzen?", tip: "Blick nach oben nicht vergessen – Müll bleibt oft auf Sitzlehnen liegen." },
    { section: "Innenraum", title: "Mittelgang zurückfegen", body: "Auf dem Rückweg den Mittelgang leer fegen – alles Richtung Tür.", tip: "Vor der Tür steht der Auffangbehälter – Müll direkt hineinfegen." },
    { section: "Fahrerkabine", title: "Lenkrad & Armaturen nebelfeucht wischen", body: "Nur den hellen Lappen verwenden – ausschließlich für Lenkrad, Knöpfe, Armatur und Display. Nebelfeucht abwischen, dann sofort mit dem trockenen Lappen nachtrocknen.", warning: "Nie nass sprühen – Elektronik. Immer nur nebelfeucht." },
    { section: "Fahrerkabine", title: "Trennscheibe mit Glasreiniger putzen", body: "Glastrennwand zu den Gästen mit Glasreiniger reinigen: ein Lappen feucht, ein Lappen zum Nachpolieren. Beide Seiten.", tip: "Aus verschiedenen Perspektiven prüfen, ob Schlieren übrig sind." },
    { section: "Kontrolle", title: "Endkontrolle", body: "Prüfen, ob nichts vergessen wurde – Sitze, Gang, Kabine, Scheiben.", tip: "Aus zwei Blickwinkeln gegen das Licht schauen." },
    { section: "Abschluss", title: "Bus verriegeln", body: "Wenn alles sauber ist: Tür schließen, Bus verriegeln und zum nächsten Bus." },
  ];

  const procedure = await prisma.procedure.create({
    data: {
      id: "sop-demo-bus",
      name: "Bus-Innenreinigung",
      description: "Schicht 06:00–10:00 · ca. 14 Busse",
      steps: {
        create: steps.map((s, i) => ({
          section: s.section,
          title: s.title,
          body: s.body,
          tip: s.tip ?? null,
          warning: s.warning ?? null,
          order: i,
        })),
      },
      equipment: {
        create: equipment.map((e, i) => ({ equipmentId: e.id, order: i })),
      },
    },
  });

  await prisma.siteProcedure.upsert({
    where: { qrToken: FIXED_TOKEN },
    update: {
      welcomeText: `Willkommen am ${site.name}`,
      waterLocation: "Zapfstelle Halle B, hintere Ecke neben Spur 3",
      accessNote: "VHH-Türen mit Universalschlüssel; vorne Klappe öffnen, dann Knopf drücken.",
      emergencyNote:
        "Person im Bus (eingeschlafen / zurückgeblieben)? Nicht selbst wecken – sofort die Hochbahn-Leitstelle anrufen.",
    },
    create: {
      qrToken: FIXED_TOKEN,
      siteId: site.id,
      procedureId: procedure.id,
      welcomeText: `Willkommen am ${site.name}`,
      waterLocation: "Zapfstelle Halle B, hintere Ecke neben Spur 3",
      accessNote: "VHH-Türen mit Universalschlüssel; vorne Klappe öffnen, dann Knopf drücken.",
      emergencyNote:
        "Person im Bus (eingeschlafen / zurückgeblieben)? Nicht selbst wecken – sofort die Hochbahn-Leitstelle anrufen.",
    },
  });

  console.log(`✓ Seed fertig. Öffne /sop/${FIXED_TOKEN}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
