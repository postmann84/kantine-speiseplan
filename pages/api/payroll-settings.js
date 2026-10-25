// pages/api/payroll-settings.js
import dbConnect from '../../lib/mongodb';
import PayrollSettings from '../../models/payrollSettings';

async function getOrCreateSettings() {
  let settings = await PayrollSettings.findOne({});
  if (!settings) {
    settings = await PayrollSettings.create({});
  }
  return settings;
}

export default async function handler(req, res) {
  await dbConnect();

  // GET: Aktuelle Lohn-Einstellungen
  if (req.method === 'GET') {
    try {
      const settings = await getOrCreateSettings();
      return res.status(200).json({ success: true, settings });
    } catch (error) {
      console.error('Fehler beim Laden der Lohn-Einstellungen:', error);
      return res.status(500).json({ success: false, error: 'Serverfehler' });
    }
  }

  // POST: Lohn-Einstellungen aktualisieren
  if (req.method === 'POST') {
    try {
      const { minimumWage, monthlyLimit, defaultStartTime, breakMinutes, openingStart, openingEnd } = req.body;
      const settings = await getOrCreateSettings();

      if (minimumWage !== undefined) settings.minimumWage = Number(minimumWage);
      if (monthlyLimit !== undefined) settings.monthlyLimit = Number(monthlyLimit);
      if (defaultStartTime !== undefined) settings.defaultStartTime = defaultStartTime;
      if (breakMinutes !== undefined) settings.breakMinutes = Number(breakMinutes);
      if (openingStart !== undefined) settings.openingStart = openingStart;
      if (openingEnd !== undefined) settings.openingEnd = openingEnd;

      await settings.save();
      return res.status(200).json({ success: true, settings });
    } catch (error) {
      console.error('Fehler beim Speichern der Lohn-Einstellungen:', error);
      return res.status(500).json({ success: false, error: 'Serverfehler' });
    }
  }

  return res.status(405).json({ success: false, error: 'Methode nicht erlaubt' });
}
