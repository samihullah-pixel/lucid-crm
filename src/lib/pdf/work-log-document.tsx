import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Cormorant",
  src: "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_qE6GnM.ttf",
});

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
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8e8e8",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  rowAlt: { backgroundColor: "#faf9f7" },
  colCheck: { width: 20 },
  colLabel: { flex: 1, fontSize: 9, color: black },
  colEmployee: { width: 110, fontSize: 9, color: grey, textAlign: "right" },
  colHeaderCheck: { width: 20, fontSize: 7, color: grey },
  colHeaderLabel: { flex: 1, fontSize: 7, color: grey, letterSpacing: 0.5, textTransform: "uppercase" },
  colHeaderEmployee: { width: 110, fontSize: 7, color: grey, letterSpacing: 0.5, textTransform: "uppercase", textAlign: "right" },
  checkboxOn: {
    width: 10,
    height: 10,
    borderWidth: 0.75,
    borderColor: "#059669",
    backgroundColor: "#d1fae5",
  },
  checkboxOff: {
    width: 10,
    height: 10,
    borderWidth: 0.75,
    borderColor: grey,
  },
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

type Entry = {
  itemLabel: string;
  checked: boolean;
  employeeName?: string | null;
};
type Area = { name: string; entries: Entry[] };

export function WorkLogDocument({
  siteName,
  templateName,
  date,
  dayName,
  status,
  notes,
  areas,
}: {
  siteName: string;
  templateName?: string;
  date: string;
  dayName: string;
  status: string;
  notes?: string | null;
  areas: Area[];
}) {
  const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const allEntries = areas.flatMap((a) => a.entries);
  const totalItems = allEntries.length;
  const totalChecked = allEntries.filter((e) => e.checked).length;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.brand}>
            Lucid<Text style={s.brandStar}>*</Text>
          </Text>
          <View style={s.divider} />
          <Text style={s.subtitle}>Arbeitsprotokoll / Checkliste</Text>
          <Text style={s.title}>{siteName}</Text>
          {templateName && <Text style={s.propertyName}>Vorlage: {templateName}</Text>}
          <Text style={s.propertyName}>
            {dayName}, {date} · Status: {status}
          </Text>
          <Text style={[s.propertyName, { marginTop: 2 }]}>Erstellt: {today}</Text>
          {notes && <Text style={[s.propertyName, { marginTop: 4, fontStyle: "italic" }]}>Anmerkungen: {notes}</Text>}
        </View>

        {areas.map((area, aIdx) => {
          const areaChecked = area.entries.filter((e) => e.checked).length;
          return (
            <View key={aIdx} wrap={false}>
              <Text style={s.areaHeader}>{area.name}</Text>
              <View style={s.tableHeader}>
                <Text style={s.colHeaderCheck}></Text>
                <Text style={s.colHeaderLabel}>Reinigungspunkt</Text>
                <Text style={s.colHeaderEmployee}>Mitarbeiter</Text>
              </View>
              {area.entries.map((entry, iIdx) => (
                <View key={iIdx} style={[s.row, iIdx % 2 === 1 ? s.rowAlt : {}]}>
                  <View style={s.colCheck}>
                    <View style={entry.checked ? s.checkboxOn : s.checkboxOff} />
                  </View>
                  <Text style={s.colLabel}>{entry.itemLabel}</Text>
                  <Text style={s.colEmployee}>{entry.employeeName ?? "—"}</Text>
                </View>
              ))}
              <View style={s.areaTotal}>
                <Text style={s.areaTotalText}>Erledigt {area.name}</Text>
                <Text style={s.areaTotalVal}>
                  {areaChecked}/{area.entries.length}
                </Text>
              </View>
            </View>
          );
        })}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Lucid* Cleaning — {siteName}</Text>
          <Text style={s.footerText}>
            {totalChecked}/{totalItems} Punkte erledigt in {areas.length} Bereichen
          </Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
