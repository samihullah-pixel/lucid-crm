import { Resend } from "resend";

/**
 * Gemeinsamer Resend-Helper. Kapselt API-Key und Absenderadresse,
 * damit nicht jede Stelle (Cron, Server-Actions) Resend selbst initialisiert.
 */
export function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "info@lucid-cleaning.de";

/** Absolute Basis-URL für Links in E-Mails (Token-Seiten, Termin-Detail). */
export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://app.lucid-cleaning.de"
  );
}

type SendArgs = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

/**
 * Versendet eine E-Mail. Wirft bei Fehlern nicht hart, sondern gibt ein
 * Ergebnis-Objekt zurück, damit der aufrufende Flow (z.B. Termin anlegen)
 * nicht komplett scheitert, wenn nur der Mailversand klemmt.
 */
export async function sendEmail({ to, subject, text, html, replyTo }: SendArgs) {
  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM,
      to,
      subject,
      text,
      ...(html ? { html } : {}),
      ...(replyTo ? { replyTo } : {}),
    });
    return { ok: true as const };
  } catch (err) {
    console.error(`E-Mail an ${Array.isArray(to) ? to.join(", ") : to} fehlgeschlagen:`, err);
    return { ok: false as const, error: err };
  }
}
