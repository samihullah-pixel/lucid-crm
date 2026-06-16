# Reinigungsfirma CRM

## Was ist das hier?

Ein vollstaendiges Next.js-Projekt, zusammengebaut aus deinem use.ai-Chat. Enthalten ist:

- Das komplette Datenbank-Schema (`prisma/schema.prisma`): Kunden, Objekte, Vertraege, Termine, Einsaetze, Zusatzarbeiten, Material, Rechnungen.
- Kunden: anlegen (`/customers/new`) und Liste (`/customers`).
- Objekte: anlegen (`/properties/new`) und Liste (`/properties`), inkl. Zugangsdaten, Schluessel, Alarmanlage.
- Termine: anlegen (`/appointments/new`) und Liste (`/appointments`), inkl. Rhythmus und Wochentag.
- Einsaetze: anlegen (`/cleaning-jobs/new`) und Liste (`/cleaning-jobs`), inkl. tatsaechlicher Stunden und Status.
- Zusatzarbeiten: anlegen (`/extra-works/new`) und Liste (`/extra-works`), inkl. automatischer Betragsanzeige.
- Rechnungen: anlegen (`/invoices/new`) und Liste (`/invoices`) — Rechnungsnummer, Steuer- und Bruttobetrag werden automatisch berechnet.
- Dashboard mit echten Live-Zahlen (aktive Kunden, Einsaetze heute, offene Zusatzarbeiten, offene Rechnungen).

Alles ist mit der echten Datenbank verbunden, kein Demo-Dummy-Inhalt mehr.

## Setup auf dem MacBook

1. Node.js installieren: https://nodejs.org (LTS-Version)
2. PostgreSQL-Datenbank besorgen. Am einfachsten kostenlos online: https://neon.tech oder https://supabase.com — Account anlegen, Datenbank erstellen, Connection-String kopieren.
3. Im Terminal in diesen Ordner wechseln, dann:

```
npm install
cp .env.example .env
```

4. In `.env` den `DATABASE_URL` durch deinen echten Connection-String ersetzen.

5. Datenbanktabellen anlegen:

```
npx prisma migrate dev --name init
```

6. App starten:

```
npm run dev
```

7. Im Browser: http://localhost:3000

## Was als Naechstes sinnvoll waere

1. Rechnungen automatisch aus offenen Einsaetzen/Zusatzarbeiten zusammenstellen statt Betrag manuell einzutippen
2. Bearbeiten/Loeschen fuer bestehende Eintraege (aktuell nur Anlegen + Liste)
3. Login/Zugriffsschutz, falls mehrere Personen damit arbeiten

Sag Bescheid, wenn eines davon als Naechstes dran soll.
