// pages/api/timesheet.js
// Ermittelt die tatsächlichen Öffnungstage (Arbeitstage) eines Monats aus der
// Speiseplan-Historie. Grundlage für die monatlichen Stundenzettel.
import dbConnect from '../../lib/mongodb';
import Menu from '../../models/menu';
import { checkDay } from '../../lib/holidays';

const DAY_INDEX = {
  'Montag': 0,
  'Dienstag': 1,
  'Mittwoch': 2,
  'Donnerstag': 3,
  'Freitag': 4
};

const BERLIN_TZ = 'Europe/Berlin';

// Liefert das Kalenderdatum (YYYY-MM-DD) einer Date in Berliner Zeit.
// Die Speisepläne wurden in Berliner Zeit gespeichert (Montag 00:00 Berlin = So 23:00 UTC),
// der Server läuft in UTC – daher muss hier konsequent nach Berlin normalisiert werden.
function berlinYMD(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BERLIN_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function isoUTC(d) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Methode nicht erlaubt' });
  }

  await dbConnect();

  const year = parseInt(req.query.year, 10);
  const month = parseInt(req.query.month, 10); // 1-12

  if (!year || !month || month < 1 || month > 12) {
    return res.status(400).json({ success: false, error: 'Jahr und Monat (1-12) erforderlich' });
  }

  try {
    // Großzügige DB-Abfrage (±1 Woche Puffer), exakte Filterung erfolgt danach pro Tag
    const rangeStart = new Date(Date.UTC(year, month - 1, 1));
    rangeStart.setUTCDate(rangeStart.getUTCDate() - 8);
    const rangeEnd = new Date(Date.UTC(year, month, 0));
    rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 8);

    const menus = await Menu.find({
      weekStart: { $lte: rangeEnd },
      weekEnd: { $gte: rangeStart }
    }).lean();

    const workingDays = new Set();

    for (const menu of menus) {
      // Montag der Woche in Berliner Zeit bestimmen
      const mondayYMD = berlinYMD(new Date(menu.weekStart));
      const monday = new Date(`${mondayYMD}T12:00:00Z`);

      for (const day of (menu.days || [])) {
        const idx = DAY_INDEX[day.day];
        if (idx === undefined) continue;
        if (day.isClosed) continue; // Tag war geschlossen

        const date = new Date(monday);
        date.setUTCDate(monday.getUTCDate() + idx);

        // Nur Tage des gewählten Monats
        if (date.getUTCFullYear() !== year || (date.getUTCMonth() + 1) !== month) continue;

        const ymd = isoUTC(date);

        // Urlaubszeitraum ausschließen
        if (menu.vacation?.isOnVacation && menu.vacation.startDate && menu.vacation.endDate) {
          const vs = berlinYMD(new Date(menu.vacation.startDate));
          const ve = berlinYMD(new Date(menu.vacation.endDate));
          if (ymd >= vs && ymd <= ve) continue;
        }

        // Gesetzliche Feiertage ausschließen
        const holiday = checkDay(ymd);
        if (holiday?.forceClose) continue;

        workingDays.add(ymd);
      }
    }

    const sorted = [...workingDays].sort();

    return res.status(200).json({
      success: true,
      year,
      month,
      workingDays: sorted,
      daysFound: sorted.length
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Stundenzettels:', error);
    return res.status(500).json({ success: false, error: 'Serverfehler' });
  }
}
