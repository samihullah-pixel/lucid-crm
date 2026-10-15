import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Cormorant",
  src: "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_qE6GnM.ttf",
});

const gold = "#c9a96e";
const black = "#141414";
const grey = "#999999";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  header: { backgroundColor: black, paddingHorizontal: 24, paddingTop: 26, paddingBottom: 22, alignItems: "center" },
  brand: { fontFamily: "Cormorant", fontSize: 28, color: "#f7f6f4", letterSpacing: 1 },
  star: { color: gold, fontSize: 16 },
  label: { marginTop: 16, fontSize: 7, color: gold, letterSpacing: 3, textTransform: "uppercase" },
  name: { marginTop: 4, fontFamily: "Cormorant", fontSize: 19, color: "#f7f6f4", textAlign: "center" },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  qr: { width: 170, height: 170 },
  instruction: { marginTop: 16, fontSize: 10, color: black, textAlign: "center", lineHeight: 1.5 },
  rule: { width: 40, height: 1, backgroundColor: gold, marginTop: 14 },
  footer: { paddingBottom: 18, alignItems: "center" },
  footerText: { fontSize: 7, color: grey, letterSpacing: 1.5, textTransform: "uppercase" },
});

export function QrPosterDocument({
  propertyName,
  address,
  qrDataUrl,
}: {
  propertyName: string;
  address: string;
  qrDataUrl: string;
}) {
  return (
    <Document title={`QR-Poster ${propertyName}`}>
      <Page size="A6" style={s.page}>
        <View style={s.header}>
          <Text style={s.brand}>
            Lucid<Text style={s.star}>*</Text>
          </Text>
          <Text style={s.label}>Shift check-in</Text>
          <Text style={s.name}>{propertyName}</Text>
        </View>
        <View style={s.body}>
          <Image src={qrDataUrl} style={s.qr} />
          <Text style={s.instruction}>
            Scan with your phone to start{"\n"}and end your shift
          </Text>
          <View style={s.rule} />
        </View>
        <View style={s.footer}>
          <Text style={s.footerText}>{address}</Text>
        </View>
      </Page>
    </Document>
  );
}
