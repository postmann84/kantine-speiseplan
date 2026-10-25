# Test-Zugangsdaten – Kantine-Speiseplan

## Admin-Bereich (Passwortschutz, gemeinsames Passwort)
- URL: `/admin` (leitet auf `/login` um, wenn nicht angemeldet)
- Login-Seite: `/login`
- **Passwort**: `Hagepatt12`
- Gespeichert als Umgebungsvariable `ADMIN_PASSWORD` in `/app/.env.local`
- Session: signiertes JWT im httpOnly-Cookie `admin_session` (7 Tage), Secret = `AUTH_SECRET`

## Auth-Endpunkte
- `POST /api/auth/login`  Body: `{ "password": "Hagepatt12" }`  → setzt Cookie
- `POST /api/auth/logout` → löscht Cookie
- `GET  /api/auth/me`     → `{ authenticated: true|false }`

## Geschützte API-Routen (benötigen Cookie)
`/api/menu` (nur POST), `/api/employees`, `/api/payroll-settings`, `/api/timesheet`,
`/api/menus/*`, `/api/meal-suggestions`, `/api/reset`, `/api/analyze-*`
Öffentlich (ohne Login): `GET /api/menu`, `GET /api/menu/:year/:week`, `/api/send-menu`, `/api/qr-code`

## Datenbank
- `MONGODB_URI` in `/app/.env.local` (MongoDB Atlas). Keine separate DB-Auth für die App nötig.
