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
  page: { fontFamily: "Helvetica", fontSize: 9, color: black, padding: 48, paddingBottom: 70 },
  brand: { fontFamily: "Cormorant", fontSize: 26, fontWeight: "light", color: black },
  brandStar: { color: gold, fontSize: 16 },
  tagline: { fontSize: 7, color: grey, letterSpacing: 2, textTransform: "uppercase", marginTop: 2 },
  divider: { height: 0.5, backgroundColor: gold, marginVertical: 14 },
  thinDivider: { height: 0.5, backgroundColor: "#e0e0e0", marginVertical: 6 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  senderBlock: { flex: 1 },
  senderName: { fontFamily: "Cormorant", fontSize: 11, fontWeight: "light", marginBottom: 2 },
  senderLine: { fontSize: 8, color: grey, marginBottom: 1 },
  recipientBlock: { flex: 1, alignItems: "flex-end" },
  recipientLabel: { fontSize: 7, color: grey, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  recipientLine: { fontSize: 9, marginBottom: 1 },
  metaBlock: { marginBottom: 24 },
  metaRow: { flexDirection: "row", marginBottom: 3 },
  metaLabel: { width: 110, fontSize: 8, color: grey },
  metaValue: { fontSize: 8, color: black },
  invoiceTitle: { fontFamily: "Cormorant", fontSize: 20, fontWeight: "light", marginBottom: 4 },
  invoiceSubtitle: { fontSize: 8, color: grey, marginBottom: 20 },
  tableHeader: { flexDirection: "row", backgroundColor: black, paddingHorizontal: 8, paddingVertical: 5, marginBottom: 0 },
  tableHeaderText: { color: "#fff", fontSize: 7, letterSpacing: 1, textTransform: "uppercase" },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#ebebeb", paddingHorizontal: 8, paddingVertical: 6 },
  tableRowAlt: { backgroundColor: light },
  colDesc: { flex: 1, fontSize: 9 },
  colNum: { width: 70, fontSize: 9, textAlign: "right" },
  totalsBlock: { marginTop: 16, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", marginBottom: 4 },
  totalLabel: { width: 120, fontSize: 9, color: grey, textAlign: "right", marginRight: 16 },
  totalValue: { width: 80, fontSize: 9, textAlign: "right" },
  grandTotalRow: { flexDirection: "row", marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: gold },
  grandLabel: { width: 120, fontFamily: "Cormorant", fontSize: 13, color: black, textAlign: "right", marginRight: 16 },
  grandValue: { width: 80, fontFamily: "Cormorant", fontSize: 13, color: black, textAlign: "right" },
  notesBlock: { marginTop: 24, fontSize: 8, color: grey },
  notesLabel: { fontWeight: "bold", color: black, marginBottom: 3 },
  footer: {
    position: "absolute", bottom: 30, left: 48, right: 48,
    flexDirection: "row", justifyContent: "space-between",
    borderTopWidth: 0.5, borderTopColor: gold, paddingTop: 6,
  },
  footerText: { fontSize: 7, color: grey },
});

type InvoiceData = {
  invoiceNumber: string;
  invoiceDate: Date;
  servicePeriodFrom: Date;
  servicePeriodTo: Date;
  netAmount: number;
  taxRate: number;
  taxAmount: number;
  grossAmount: number;
  status: string;
  notes: string | null;
  customer: {
    companyName: string;
    contactPerson: string | null;
    billingAddress: string | null;
    postalCode: string | null;
    city: string | null;
    email: string | null;
    vatId: string | null;
  };
  property?: { name: string; address: string } | null;
};

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " €";
}
function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function InvoiceDocument({ invoice }: { invoice: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
          <View>
            <Text style={s.brand}>Lucid<Text style={s.brandStar}>*</Text></Text>
            <Text style={s.tagline}>Professional Cleaning Services</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.invoiceTitle}>Rechnung</Text>
            <Text style={[s.metaValue, { fontSize: 8, color: grey }]}>{invoice.invoiceNumber}</Text>
          </View>
        </View>
        <View style={s.divider} />

        {/* Addresses */}
        <View style={s.headerRow}>
          <View style={s.senderBlock}>
            <Text style={s.senderName}>Lucid* Cleaning</Text>
            <Text style={s.senderLine}>Hamburg, Deutschland</Text>
          </View>
          <View style={s.recipientBlock}>
            <Text style={s.recipientLabel}>Rechnungsempfänger</Text>
            <Text style={s.recipientLine}>{invoice.customer.companyName}</Text>
            {invoice.customer.contactPerson && <Text style={[s.recipientLine, { color: grey }]}>{invoice.customer.contactPerson}</Text>}
            {invoice.customer.billingAddress && <Text style={[s.recipientLine, { color: grey }]}>{invoice.customer.billingAddress}</Text>}
            {(invoice.customer.postalCode || invoice.customer.city) && (
              <Text style={[s.recipientLine, { color: grey }]}>
                {[invoice.customer.postalCode, invoice.customer.city].filter(Boolean).join(" ")}
              </Text>
            )}
            {invoice.customer.vatId && <Text style={[s.recipientLine, { color: grey, marginTop: 4 }]}>USt-IdNr.: {invoice.customer.vatId}</Text>}
          </View>
        </View>

        {/* Meta */}
        <View style={s.metaBlock}>
          <View style={s.metaRow}><Text style={s.metaLabel}>Rechnungsdatum</Text><Text style={s.metaValue}>{fmtDate(invoice.invoiceDate)}</Text></View>
          <View style={s.metaRow}><Text style={s.metaLabel}>Leistungszeitraum</Text><Text style={s.metaValue}>{fmtDate(invoice.servicePeriodFrom)} – {fmtDate(invoice.servicePeriodTo)}</Text></View>
          {invoice.property && <View style={s.metaRow}><Text style={s.metaLabel}>Objekt</Text><Text style={s.metaValue}>{invoice.property.name}, {invoice.property.address}</Text></View>}
        </View>

        {/* Line items */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, { flex: 1 }]}>Leistungsbeschreibung</Text>
          <Text style={[s.tableHeaderText, { width: 80, textAlign: "right" }]}>Betrag</Text>
        </View>
        <View style={s.tableRow}>
          <Text style={s.colDesc}>
            Reinigungsleistungen{invoice.property ? ` – ${invoice.property.name}` : ""}{"\n"}
            <Text style={{ color: grey, fontSize: 8 }}>Leistungszeitraum {fmtDate(invoice.servicePeriodFrom)} – {fmtDate(invoice.servicePeriodTo)}</Text>
          </Text>
          <Text style={s.colNum}>{fmt(invoice.netAmount)}</Text>
        </View>
        <View style={[s.tableRow, s.tableRowAlt]}>
          <Text style={[s.colDesc, { color: grey }]}>Mehrwertsteuer {invoice.taxRate}%</Text>
          <Text style={[s.colNum, { color: grey }]}>{fmt(invoice.taxAmount)}</Text>
        </View>

        {/* Totals */}
        <View style={s.totalsBlock}>
          <View style={s.grandTotalRow}>
            <Text style={s.grandLabel}>Gesamtbetrag</Text>
            <Text style={s.grandValue}>{fmt(invoice.grossAmount)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={s.notesBlock}>
            <View style={s.thinDivider} />
            <Text style={s.notesLabel}>Hinweise</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Lucid* Cleaning — {invoice.invoiceNumber}</Text>
          <Text style={s.footerText}>{invoice.customer.companyName}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
