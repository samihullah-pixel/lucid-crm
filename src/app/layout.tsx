import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Lucid* CRM",
  description: "Kunden, Objekte, Einsaetze und Rechnungen verwalten",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
