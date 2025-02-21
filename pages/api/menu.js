// pages/api/menu.js
import dbConnect from '../../lib/mongodb';
import Menu from '../../models/menu';

export default async function handler(req, res) {
  try {
    await dbConnect();
    console.log('MongoDB verbunden');

    if (req.method === 'GET') {
      try {
        const menu = await Menu.findOne().sort({ createdAt: -1 });
        console.log('GET Request - Gefundenes Menü:', menu); // Debug Log
        
        if (!menu) {
          return res.status(404).json({ 
            success: false, 
            error: 'Kein Menü gefunden' 
          });
        }

        return res.status(200).json({ 
          success: true, 
          data: menu
        });

      } catch (error) {
        console.error('GET Request - Fehler:', error);
        return res.status(400).json({ 
          success: false, 
          error: error.message 
        });
      }
    }

    if (req.method === 'POST') {
      try {
        const menuData = req.body;
        console.log('POST Request - Empfangene Daten:', menuData); // Debug Log
        
        // Stellen Sie sicher, dass isAction und actionNote für jedes Gericht existieren
        menuData.days = menuData.days.map(day => ({
          ...day,
          meals: day.meals.map(meal => ({
            ...meal,
            isAction: meal.isAction || false,
            actionNote: meal.actionNote || ''
          }))
        }));

        const menu = await Menu.create(menuData);
        console.log('POST Request - Gespeichertes Menü:', menu); // Debug Log
        
        return res.status(201).json({
          success: true,
          data: menu
        });
      } catch (error) {
        console.error('POST Request - Fehler:', error);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }

  } catch (error) {
    console.error('Verbindungsfehler:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Datenbankverbindung fehlgeschlagen' 
    });
  }
}
