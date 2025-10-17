// pages/api/menu.js
import dbConnect from '../../lib/mongodb';
import Menu from '../../models/menu';

export default async function handler(req, res) {
  await dbConnect();

  // GET: Lade aktuellen (veröffentlichten) Speiseplan
  if (req.method === 'GET') {
    try {
      const menu = await Menu.findOne({
        $or: [
          { isPublished: true },              // Neue veröffentlichte Speisepläne
          { isPublished: { $exists: false } } // Alte Speisepläne ohne isPublished Feld
        ]
      })
      .sort({ year: -1, weekNumber: -1 })     // Neuestes Menü zuerst
      .lean();

      if (!menu) {
        return res.status(200).json({
          success: false,
          message: 'Aktuell ist kein Speiseplan verfügbar.'
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

  // POST: Speichere oder aktualisiere Speiseplan
  if (req.method === 'POST') {
    try {
      const menuData = req.body;
      
      // Suche nach existierendem Menü für diese Woche
      const existingMenu = await Menu.findOne({
        year: menuData.year,
        weekNumber: menuData.weekNumber
      });

      let result;
      if (existingMenu) {
        // Aktualisiere existierendes Menü
        result = await Menu.findByIdAndUpdate(
          existingMenu._id,
          menuData,
          { new: true }
        );
      } else {
        // Erstelle neues Menü
        result = await Menu.create(menuData);
      }

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
