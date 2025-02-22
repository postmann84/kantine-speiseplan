// pages/api/menu.js
import dbConnect from '../../lib/mongodb';
import Menu from '../../models/menu';

export default async function handler(req, res) {
  await dbConnect();

  // GET: Lade aktuellen Speiseplan
  if (req.method === 'GET') {
    try {
      const menu = await Menu.findOne()
        .sort({ createdAt: -1 })
        .lean();

      if (!menu) {
        return res.status(200).json({
          success: false,
          message: 'Noch kein Speiseplan verfügbar.'
        });
      }

      return res.status(200).json({
        success: true,
        data: menu
      });

    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Interner Serverfehler'
      });
    }
  }

  // POST: Speichere neuen Speiseplan
  if (req.method === 'POST') {
    try {
      const menuData = req.body;
      
      // Lösche alten Speiseplan und erstelle neuen
      await Menu.deleteMany({});
      const result = await Menu.create(menuData);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      return res.status(500).json({
        success: false,
        error: 'Fehler beim Speichern des Menüs'
      });
    }
  }
}
