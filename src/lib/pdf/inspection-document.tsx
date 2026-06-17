import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Cormorant",
  src: "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_qE6GnM.ttf",
});

const INTERVAL_LABELS: Record<string, string> = {
  TAEGLICH: "Täglich",
  WOECHENTLICH: "Wöchentlich",
  ZWEIWOECHENTLICH: "2-wöchentlich",
  MONATLICH: "Monatlich",
  NACH_BEDARF: "Nach Bedarf",
  QUARTAL: "Quartalsweise",
  HALBJAHR: "Halbjährlich",
  JAEHRLICH: "Jährlich",
};

const gold = "#c9a96e";
const black = "#080808";
const grey = "#999999";
const light = "#f7f6f4";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: black, padding: 40, paddingBottom: 60 },
  header: { marginBottom: 24 },
  brand: { fontFamily: "Cormorant", fontSize: 22, fontWeight: "light", color: black, letterSpacing: 1 },
  brandStar: { color: gold, fontSize: 14 },
  divider: { height: 0.5, backgroundColor: gold, marginVertical: 10 },
  title: { fontFamily: "Cormorant", fontSize: 16, fontWeight: "light", color: black, marginBottom: 2 },
  subtitle: { fontSize: 8, color: grey, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  propertyName: { fontSize: 8, color: grey, marginBottom: 2 },
  areaHeader: {
    backgroundColor: black,
    color: "#fff",
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 0,
    marginTop: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: light,
    borderBottomWidth: 0.5,
    borderBottomColor: gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8e8e8",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  rowAlt: { backgroundColor: "#faf9f7" },
  colLabel: { flex: 1, fontSize: 9, color: black },
  colInterval: { width: 90, fontSize: 9, color: grey, textAlign: "right" },
  colDuration: { width: 60, fontSize: 9, color: black, textAlign: "right" },
  colHeaderLabel: { flex: 1, fontSize: 7, color: grey, letterSpacing: 0.5, textTransform: "uppercase" },
  colHeaderInterval: { width: 90, fontSize: 7, color: grey, letterSpacing: 0.5, textTransform: "uppercase", textAlign: "right" },
  colHeaderDuration: { width: 60, fontSize: 7, color: grey, letterSpacing: 0.5, textTransform: "uppercase", textAlign: "right" },
  areaTotal: { flexDirection: "row" as const, backgroundColor: "#f0ebe0", paddingHorizontal: 8, paddingVertical: 4 },
  areaTotalText: { flex: 1, fontSize: 7, color: grey },
  areaTotalVal: { width: 60, fontSize: 7, color: black, textAlign: "right" as const, fontWeight: "bold" as const },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: gold,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: grey },
});

function fmtMin(min: number) {
  if (min < 60) return `${min} Min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} Std` : `${h} Std ${m} Min`;
}

type Item = { label: string; interval: string; durationMinutes?: number | null };
type Area = { name: string; items: Item[] };

export function InspectionDocument({
  templateName,
  propertyName,
  areas,
}: {
  templateName: string;
  propertyName?: string;
  areas: Area[];
}) {
  const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const totalItems = areas.reduce((sum, a) => sum + a.items.length, 0);
  const allItems = areas.flatMap((a) => a.items);
  const totalMinutes = allItems.reduce((sum, i) => sum + (i.durationMinutes ?? 0), 0);

  const INTERVAL_ORDER = ["TAEGLICH", "WOECHENTLICH", "ZWEIWOECHENTLICH", "MONATLICH", "QUARTAL", "HALBJAHR", "JAEHRLICH", "NACH_BEDARF"];
  const byInterval: Record<string, number> = {};
  for (const item of allItems) {
    if (item.durationMinutes) byInterval[item.interval] = (byInterval[item.interval] ?? 0) + item.durationMinutes;
  }
  const intervalEntries = INTERVAL_ORDER.filter((k) => byInterval[k]);
  const areaEntries = areas.map((a) => ({ name: a.name, min: a.items.reduce((s, i) => s + (i.durationMinutes ?? 0), 0) })).filter((e) => e.min > 0);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.brand}>
            Lucid<Text style={s.brandStar}>*</Text>
          </Text>
          <View style={s.divider} />
          <Text style={s.subtitle}>Reinigungsplan / Aufnahmebogen</Text>
          <Text style={s.title}>{templateName}</Text>
          {propertyName && <Text style={s.propertyName}>Objekt: {propertyName}</Text>}
          <Text style={[s.propertyName, { marginTop: 2 }]}>Erstellt: {today}</Text>
        </View>

        {/* Zeitübersicht */}
        {totalMinutes > 0 && (
          <View style={{ borderWidth: 0.5, borderColor: gold, backgroundColor: "#faf8f4", padding: 12, marginBottom: 18 }}>
            {/* Gesamtzeit */}
            <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 10 }}>
              <Text style={{ fontFamily: "Cormorant", fontSize: 18, fontWeight: "light", color: black, marginRight: 8 }}>{fmtMin(totalMinutes)}</Text>
              <Text style={{ fontSize: 7, color: grey, letterSpacing: 1, textTransform: "uppercase" }}>Gesamtaufwand</Text>
            </View>
            <View style={{ height: 0.5, backgroundColor: gold, marginBottom: 10 }} />
            {/* Zwei Spalten: Intervall | Bereich */}
            <View style={{ flexDirection: "row", gap: 24 }}>
              {/* Nach Intervall */}
              {intervalEntries.length > 0 && (
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 7, color: grey, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Nach Intervall</Text>
                  {intervalEntries.map((k) => (
                    <View key={k} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                      <Text style={{ fontSize: 8, color: grey }}>{INTERVAL_LABELS[k] ?? k}</Text>
                      <Text style={{ fontSize: 8, color: black, fontWeight: "bold" }}>{fmtMin(byInterval[k])}</Text>
                    </View>
                  ))}
                </View>
              )}
              {/* Trennlinie */}
              {intervalEntries.length > 0 && areaEntries.length > 0 && (
                <View style={{ width: 0.5, backgroundColor: "#e8e4dc" }} />
              )}
              {/* Nach Bereich */}
              {areaEntries.length > 0 && (
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 7, color: grey, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Nach Bereich</Text>
                  {areaEntries.map((e) => (
                    <View key={e.name} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
                      <Text style={{ fontSize: 8, color: grey }}>{e.name}</Text>
                      <Text style={{ fontSize: 8, color: black, fontWeight: "bold" }}>{fmtMin(e.min)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {areas.map((area, aIdx) => (
          <View key={aIdx} wrap={false}>
            <Text style={s.areaHeader}>{area.name}</Text>
            <View style={s.tableHeader}>
              <Text style={s.colHeaderLabel}>Reinigungspunkt</Text>
              <Text style={s.colHeaderInterval}>Intervall</Text>
              <Text style={s.colHeaderDuration}>Dauer</Text>
            </View>
            {area.items.map((item, iIdx) => (
              <View key={iIdx} style={[s.row, iIdx % 2 === 1 ? s.rowAlt : {}]}>
                <Text style={s.colLabel}>{item.label}</Text>
                <Text style={s.colInterval}>{INTERVAL_LABELS[item.interval] ?? item.interval}</Text>
                <Text style={s.colDuration}>{item.durationMinutes ? fmtMin(item.durationMinutes) : "—"}</Text>
              </View>
            ))}
            {(() => {
              const aMin = area.items.reduce((s, i) => s + (i.durationMinutes ?? 0), 0);
              return aMin > 0 ? (
                <View style={s.areaTotal}>
                  <Text style={s.areaTotalText}>Summe {area.name}</Text>
                  <Text style={s.areaTotalVal}>{fmtMin(aMin)}</Text>
                </View>
              ) : null;
            })()}
          </View>
        ))}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Lucid* Cleaning — {templateName}</Text>
          <Text style={s.footerText}>{totalItems} Punkte in {areas.length} Bereichen{totalMinutes > 0 ? ` · Gesamt ${fmtMin(totalMinutes)}` : ""}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
