import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export const metadata = {
  title: "Lucid* CRM",
  description: "Kunden, Objekte, Einsaetze und Rechnungen verwalten",
};

const WORD = "Lucid";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <div className="intro-overlay" aria-hidden="true">
          <div className="intro-word">
            {WORD.split("").map((ch, i) => (
              <span
                key={i}
                className="intro-letter"
                style={{ animationDelay: `${200 + i * 90}ms` }}
              >
                {ch}
              </span>
            ))}
            <span className="intro-star">*</span>
          </div>
          <div className="intro-line" />
          <div className="intro-tagline">Cleaning Services</div>
        </div>
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
