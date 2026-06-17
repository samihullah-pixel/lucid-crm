import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Cormorant",
  src: "https://fonts.gstatic.com/s/cormorantgaramond/v16/co3YmX5slCNuHLi8bLeY9MK7whWMhyjYrEPjuw.ttf",
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
  colInterval: { width: 100, fontSize: 9, color: grey, textAlign: "right" },
  colHeaderLabel: { flex: 1, fontSize: 7, color: grey, letterSpacing: 0.5, textTransform: "uppercase" },
  colHeaderInterval: { width: 100, fontSize: 7, color: grey, letterSpacing: 0.5, textTransform: "uppercase", textAlign: "right" },
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

type Item = { label: string; interval: string };
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

        {areas.map((area, aIdx) => (
          <View key={aIdx} wrap={false}>
            <Text style={s.areaHeader}>{area.name}</Text>
            <View style={s.tableHeader}>
              <Text style={s.colHeaderLabel}>Reinigungspunkt</Text>
              <Text style={s.colHeaderInterval}>Intervall</Text>
            </View>
            {area.items.map((item, iIdx) => (
              <View key={iIdx} style={[s.row, iIdx % 2 === 1 ? s.rowAlt : {}]}>
                <Text style={s.colLabel}>{item.label}</Text>
                <Text style={s.colInterval}>{INTERVAL_LABELS[item.interval] ?? item.interval}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Lucid* Cleaning — {templateName}</Text>
          <Text style={s.footerText}>{totalItems} Punkte in {areas.length} Bereichen</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
