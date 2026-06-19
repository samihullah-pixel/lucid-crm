import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { IntroSplash } from "@/components/intro-splash";

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
      <body>
        <IntroSplash />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#080808",
              color: "#f7f6f4",
              border: "1px solid rgba(201,169,110,0.3)",
              borderRadius: "8px",
              fontFamily: "Jost, sans-serif",
              fontWeight: "300",
              letterSpacing: "0.5px",
            },
          }}
        />
      </body>
    </html>
  );
}
