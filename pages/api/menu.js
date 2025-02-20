// pages/api/menu.js
import dbConnect from '../../lib/mongodb';
import Menu from '../../models/menu';

export default async function handler(req, res) {
  try {
    await dbConnect();
    console.log('MongoDB verbunden');

    if (req.method === 'POST') {
      try {
        console.log('Received data:', req.body);
        const menu = await Menu.create(req.body);
        console.log('Menu created:', menu);
        res.status(201).json({ success: true, data: menu });
      } catch (error) {
        console.error('Error creating menu:', error);
        res.status(400).json({ 
          success: false, 
          error: error.message,
          details: error.toString()
        });
      }
    } else if (req.method === 'GET') {
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
          data: {
            weekStart: menu.weekStart,
            weekEnd: menu.weekEnd,
            days: menu.days,
            contactInfo: menu.contactInfo
          }
        });

      } catch (error) {
        console.error('GET Request - Fehler:', error);
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
