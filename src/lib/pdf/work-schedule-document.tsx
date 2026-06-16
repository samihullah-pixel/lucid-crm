import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const GOLD = "#c9a96e";
const GOLD_DARK = "#9a7a45";
const BLACK = "#080808";
const GREY = "#999999";
const LIGHT = "#f7f6f4";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: BLACK,
  },
  headerWordmark: {
    fontFamily: "Times-Roman",
    fontSize: 26,
    color: BLACK,
  },
  headerStar: {
    color: GOLD,
  },
  headerRule: {
    marginTop: 8,
    marginBottom: 20,
    height: 2,
    backgroundColor: GOLD,
    width: 80,
  },
  subtitleEyebrow: {
    fontSize: 8,
    letterSpacing: 2,
    color: GOLD_DARK,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Times-Roman",
    fontSize: 18,
    marginBottom: 20,
  },
  table: {
    borderTopWidth: 1,
    borderTopColor: GOLD,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 6,
  },
  rowHeader: {
    flexDirection: "row",
    paddingVertical: 6,
    backgroundColor: BLACK,
  },
  rowWeekend: {
    backgroundColor: LIGHT,
  },
  cellDate: { width: "25%", paddingLeft: 4 },
  cellWeekday: { width: "35%" },
  cellStatus: { width: "40%" },
  headerCellText: {
    color: "#ffffff",
    fontSize: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statusArbeit: { color: GOLD_DARK, fontFamily: "Helvetica-Bold" },
  statusFrei: { color: GREY },
  footer: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: GOLD,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 9, color: GREY },
});

export type ScheduleDay = {
  date: Date;
  weekday: string;
  status: "Arbeit" | "Frei";
};

export function WorkScheduleDocument({
  employeeName,
  monthName,
  year,
  days,
}: {
  employeeName: string;
  monthName: string;
  year: number;
  days: ScheduleDay[];
}) {
  const workDays = days.filter((d) => d.status === "Arbeit").length;
  const freeDays = days.length - workDays;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.headerWordmark}>
          Lucid<Text style={styles.headerStar}>*</Text>
        </Text>
        <View style={styles.headerRule} />
        <Text style={styles.subtitleEyebrow}>Arbeitsplan</Text>
        <Text style={styles.title}>
          {employeeName} — {monthName} {year}
        </Text>

        <View style={styles.table}>
          <View style={styles.rowHeader}>
            <Text style={[styles.cellDate, styles.headerCellText]}>Datum</Text>
            <Text style={[styles.cellWeekday, styles.headerCellText]}>Wochentag</Text>
            <Text style={[styles.cellStatus, styles.headerCellText]}>Status</Text>
          </View>
          {days.map((d, idx) => {
            const isWeekend = d.weekday === "Samstag" || d.weekday === "Sonntag";
            return (
              <View
                key={idx}
                style={isWeekend ? [styles.row, styles.rowWeekend] : styles.row}
              >
                <Text style={styles.cellDate}>{d.date.toLocaleDateString("de-DE")}</Text>
                <Text style={styles.cellWeekday}>{d.weekday}</Text>
                <Text
                  style={[
                    styles.cellStatus,
                    d.status === "Arbeit" ? styles.statusArbeit : styles.statusFrei,
                  ]}
                >
                  {d.status}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Arbeitstage: {workDays}</Text>
          <Text style={styles.footerText}>Freie Tage: {freeDays}</Text>
          <Text style={styles.footerText}>
            Erstellt am {new Date().toLocaleDateString("de-DE")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
