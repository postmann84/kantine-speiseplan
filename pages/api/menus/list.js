import dbConnect from '../../../lib/mongodb';
import Menu from '../../../models/menu';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Hole nur eindeutige Kombinationen von Jahr und Kalenderwoche
    const menus = await Menu.aggregate([
      {
        $group: {
          _id: {
            year: "$year",
            weekNumber: "$weekNumber"
          }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          weekNumber: "$_id.weekNumber"
        }
      },
      {
        $sort: { 
          year: -1,
          weekNumber: -1 
        }
      }
    ]);

    console.log('Gefundene Menüs:', menus); // Debug Log
    
    return res.status(200).json({
      success: true,
      menus: menus.filter(menu => menu.year && menu.weekNumber) // Filtere ungültige Einträge
    });
  } catch (error) {
    console.error('Fehler beim Laden der Menüliste:', error);
    return res.status(500).json({ error: 'Serverfehler' });
  }
} 