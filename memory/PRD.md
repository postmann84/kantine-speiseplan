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
- `POST /api/analyze-allergens-v2` – Allergen-Analyse via OpenAI
- `POST /api/analyze-meal` – Icon-Zuordnung via OpenAI

## Backlog
- **P1**: Refactoring `pages/index.js` und `pages/admin.js` (beide >1100 Zeilen) – Komponenten extrahieren
- **P2**: Lokale Preview-URL reparieren (Emergent-Plattform-Routing-Problem)
