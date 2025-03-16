import dbConnect from '../../../../lib/mongodb';
import Menu from '../../../../models/menu';

export default async function handler(req, res) {
  const { year, week } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In einer echten Anwendung würden wir hier die Daten aus einer Datenbank laden
    // Da wir keinen Dateisystemzugriff haben, senden wir ein leeres Menü zurück
    
    // Erstelle ein leeres Menü mit Standardwerten
    const emptyMenu = {
      year: parseInt(year),
      weekNumber: parseInt(week),
      days: [
        { day: 'Montag', meals: [{ name: '', price: 4.80, isAction: false }, { name: '', price: 6.80, isAction: false }] },
        { day: 'Dienstag', meals: [{ name: '', price: 4.80, isAction: false }, { name: '', price: 6.80, isAction: false }] },
        { day: 'Mittwoch', meals: [{ name: '', price: 4.80, isAction: false }, { name: '', price: 6.80, isAction: false }] },
        { day: 'Donnerstag', meals: [{ name: '', price: 4.80, isAction: false }, { name: '', price: 6.80, isAction: false }] },
        { day: 'Freitag', meals: [{ name: '', price: 4.80, isAction: false }, { name: '', price: 6.80, isAction: false }] }
      ],
      contactInfo: {
        phone: '05101-84809',
        postcode: '0.50'
      },
      vacation: {
        isOnVacation: false,
        startDate: '',
        endDate: '',
        message: 'Wir befinden uns im Urlaub.'
      }
    };

    return res.status(200).json({
      success: true,
      data: emptyMenu
    });
  } catch (error) {
    console.error('Fehler beim Laden des Menüs:', error);
    return res.status(500).json({ error: 'Serverfehler' });
  }
} 