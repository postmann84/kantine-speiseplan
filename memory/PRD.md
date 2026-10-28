# Kantine-Speiseplan – PRD

## Projektbeschreibung
Next.js-Monolith-Anwendung für die Verwaltung und Anzeige eines Wochenspeiseplans einer Betriebskantine (Rainer Westermann Kantine).

## Tech Stack
- **Framework**: Next.js 14 (Pages Router)
- **Styling**: Tailwind CSS
- **Datenbank**: MongoDB Atlas (Cluster: kantine-cluster, DB: test)
- **Animationen**: anime.js v4
- **KI**: OpenAI GPT (Allergen-/Icon-Analyse)
- **Deployment**: Vercel (Produktion)

## Kernfunktionen
1. **Öffentlicher Speiseplan** (`/`) – Wochenmenü mit Allergenen, Icons, Preisen
2. **Admin-Bereich** (`/admin`) – Menüverwaltung mit KW-Auswahl, Veröffentlichung, Druckfunktion
3. **Allergen-System** – Automatische Erkennung via OpenAI API
4. **Saisonale Animationen** – Weihnachten, Neujahr (anime.js), Oster-Logo
5. **Gerichts-Ideen** (`/api/meal-suggestions`) – Kategorie-basierte Vorschläge aus DB

## Implementierte Features

### Teilzeit-Erfassung: Tage ankreuzen, Monatsdeckel & Blanko-Zettel (Juni 2026)
- **Tage manuell ankreuzen** (`manualDays` pro Mitarbeiter): Öffnungstage des Monats als antippbare Chips; nur gewählte Tage kommen auf den Zettel. Gespeichert in `employee.presence['YYYY-MM']` (Mixed), Teil-Update über `POST /api/employees` mit `presenceMonth`/`presenceDays`.
- **Eigener Monats-Stundendeckel** (`maxMonthlyHours`, 0 = volle Minijob-Grenze), z. B. 10 h/Monat; `buildSchedule` begrenzt die Zielsumme auf `min(Grenze, Deckel)`.
- **Blanko-Zettel** pro Mitarbeiter (`buildMonthDoc({blank:true})`): leerer Zettel mit vorausgefüllten Datums-/Wochentagszeilen, leere Zeit-Spalten, keine Summen.
- UI: Formularfeld „Monats-Limit Std." + Checkbox „Tage manuell ankreuzen"; Badges; Tages-Picker + Button „Blanko" je Mitarbeiter. Getestet (3 Tage → nur diese im PDF, Blanko mit leeren Zeilen).


### Passwortschutz Admin-Bereich (Juni 2026)
- **Gemeinsames Admin-Passwort** schützt `/admin` und alle schreibenden/Admin-APIs.
- Dateien: `lib/auth.js` (jose JWT), `pages/api/auth/{login,logout,me}.js`, `pages/login.js`, `middleware.js`.
- Session: signiertes JWT im httpOnly-Cookie `admin_session` (7 Tage). `AUTH_SECRET` + `ADMIN_PASSWORD` in `/app/.env.local` (Passwort: `Hagepatt12`, siehe test_credentials.md).
- `middleware.js` leitet `/admin` ohne Login auf `/login` um und gibt bei geschützten APIs 401 zurück. Öffentlich bleiben: `GET /api/menu`, `GET /api/menu/:year/:week`, `/api/send-menu`, `/api/qr-code`.
- Abmelden-Button im Admin-Header. Cookie `secure` nur über HTTPS (x-forwarded-proto), damit lokaler http-Test funktioniert.

### Schichten & Randomizer für Stundenzettel (Juni 2026)
- Pro Mitarbeiter wählbare **Schicht**: Frühschicht / Spätschicht / Ganztagsschicht (`shift` im Employee-Model).
- Schicht-**Zeitfenster** global konfigurierbar in den Lohn-Einstellungen (Default: Früh 07:00–11:00, Spät 11:00–14:00, Ganztags 07:00–13:30).
- **Randomizer** (`buildSchedule` in `lib/timesheetPdf.js`): verteilt die monatlichen Minijob-Stunden mit leichter Variation (±10 Min, 5-Min-Raster) auf die Öffnungstage; Beginn zufällig innerhalb des Schichtfensters. Summe bleibt immer unter der Verdienstgrenze.
- **Deterministisch**: Seed = Mitarbeiter-ID + Jahr + Monat → gleicher Monat ergibt beim erneuten Download denselben (unterschriebenen) Zettel. Verifiziert.
- Minijob-Grenze bleibt das Limit (Entscheidung des Nutzers): Schicht legt nur das Zeitfenster fest, nicht die Gesamtstunden.

### Personal & Stundenzettel – PDF-Erweiterung (Juni 2026)
- **Professionelle PDF-Erzeugung** via `lib/timesheetPdf.js` (jspdf + jspdf-autotable + jszip, dynamisch importiert → nicht im Hauptbundle).
- **Layout**: Firmen-Logo (aus `/public/logo.png`, clientseitig verkleinert), Firmenkopf „Rainer Westermann Kantine / Inhaber: Rainer Westermann", Titel „Arbeitszeitnachweis / Stundenzettel", Hinweis „§ 17 MiLoG", Info-Block, Tabelle (Datum, Wochentag, Beginn, Ende, Pause, Arbeitszeit) + Summe, Zusammenfassungs-Box, Unterschriftszeilen (Arbeitnehmer/in + „Rainer Westermann (Inhaber)" als Arbeitgeber), rechtliche Fußzeile (§ 17 MiLoG, 2 Jahre Aufbewahrung). Passt für Monate bis ~23 Öffnungstage auf eine Seite.
- **Öffnungszeiten**: In den Lohn-Einstellungen hinterlegt (`openingStart`/`openingEnd`, Default 07:00–14:00 = Kantinen-Öffnungszeiten) und bestimmen den Arbeitsbeginn im Stundenzettel.
- **Einzel-Download**: „Monat (PDF)" lädt eine echte PDF-Datei (`doc.save`).
- **Bulk-Download**: „Jahr (ZIP)" erzeugt für das gewählte Jahr je Monat mit Öffnungstagen eine eigene PDF und bündelt alle in einer ZIP (Monate ohne Historie werden übersprungen).
- **Testing**: PDFs per pdftoppm visuell geprüft (Einzelseite + ZIP mit 10 Monaten), Downloads per Playwright verifiziert.

### Personal & Stundenzettel (Minijob) (Juni 2026)
- **Ziel**: Im Admin-Bereich Mitarbeiter (geringfügig Beschäftigte / Minijob) verwalten und monatliche Stundenzettel aus der Speiseplan-Historie erzeugen.
- **Button**: "Personal & Stundenzettel" oben rechts im Admin-Header öffnet ein Modal.
- **Mitarbeiter-CRUD**: `/api/employees` (GET/POST/DELETE), Model `models/employee.js` (Vorname, Nachname, Personal-Nr.).
- **Lohn-Einstellungen**: `/api/payroll-settings`, Model `models/payrollSettings.js`. Standard (Stand 01.01.2026): Mindestlohn **13,90 €/h**, Minijob-Verdienstgrenze **603,00 €/Monat**. Editierbar (plus Beginn-Zeit & Pause).
- **Öffnungstage**: `/api/timesheet?year=&month=` ermittelt die tatsächlichen Arbeitstage eines Monats aus der Speiseplan-Historie (Tage mit `!isClosed`, ohne gesetzliche Feiertage/Urlaub). WICHTIG: `weekStart` ist in Berliner Zeit gespeichert (Mo 00:00 Berlin = So 23:00 UTC); Server läuft in UTC → Normalisierung via `Intl` Europe/Berlin, sonst -1 Tag Verschiebung.
- **Berechnung**: max. Stunden/Monat = Grenze ÷ Mindestlohn (603/13,90 = 43,38 h), gleichmäßig auf Öffnungstage verteilt (abgerundet, bleibt unter Grenze).
- **Download**: Pro Mitarbeiter wird ein druckbarer Stundenzettel (neues Fenster, Browser-Druck/PDF) mit Datum, Wochentag, Beginn/Ende, Pause, Stunden, Summen und Unterschriftszeilen erzeugt.
- **Testing**: Backend-APIs per curl + Frontend-Flow (Modal, Monatsauswahl, PDF-Popup) per Playwright-Screenshot verifiziert.

### Gerichts-Ideen-Feature (26.04.2026)
- **API**: `/api/meal-suggestions` – Gruppiert 509 einzigartige Gerichte in 7 Kategorien
- **Kategorien**: 🐷 Schwein (158), 🐔 Huhn (68), 🥗 Vegetarisch (60), 🐄 Rind (50), 🐟 Fisch (46), 🥣 Suppe/Eintopf (50), 🍝 Pasta (51)
- **Sortierung**: Häufigste zuerst + letztes Serviert-Datum (KW/Jahr)
- **UI**: Ideen-Button (💡) neben jedem Gericht-Input im Admin, Modal mit Kategorie-Icons, Suchfeld, Klick übernimmt Gericht
- **Testing**: 100% Backend + Frontend (Test-Report: /app/test_reports/iteration_1.json)

### Frühere Features
- Neujahr-Animation (anime.js v4, Schweinchen-Rakete + Feuerwerk)
- Mobile Layout-Optimierung im Header
- Temporäres Oster-Logo (bis 07.04.2026, abgelaufen)
- Allergen-System V2 mit automatischer Analyse beim Speichern

## Datenmodell
```
WeekMenu: {
  year, weekNumber, weekStart, weekEnd,
  isPublished,
  days: [{
    day, isClosed, closedReason,
    meals: [{
      name, price, icon, isAction, actionNote,
      allergenCodes[], additiveCodes[]
    }]
  }],
  contactInfo: { phone, postcode },
  vacation: { isOnVacation, startDate, endDate, message }
}
```

## API Endpoints
- `GET /api/menu` – Aktuell veröffentlichtes Menü
- `POST /api/menu` – Menü speichern/aktualisieren
- `GET /api/menu/:year/:week` – Menü nach KW
- `GET /api/meal-suggestions` – Gerichts-Vorschläge nach Kategorie
- `GET|POST|DELETE /api/employees` – Mitarbeiter-Verwaltung
- `GET|POST /api/payroll-settings` – Lohn-Einstellungen (Minijob)
- `GET /api/timesheet?year=&month=` – Öffnungstage/Arbeitstage eines Monats aus der Historie
- `POST /api/analyze-allergens-v2` – Allergen-Analyse via OpenAI
- `POST /api/analyze-meal` – Icon-Zuordnung via OpenAI

## Backlog
- **P1**: Refactoring `pages/index.js` und `pages/admin.js` (beide >1100 Zeilen) – Komponenten extrahieren
- **P2**: Lokale Preview-URL reparieren (Emergent-Plattform-Routing-Problem)
