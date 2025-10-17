import dbConnect from '../../../../lib/mongodb';
import Menu from '../../../../models/menu';

export default async function handler(req, res) {
  const { year, week } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const menu = await Menu.findOne({
      year: parseInt(year),
      weekNumber: parseInt(week)
      // Keine isPublished Filter - diese Route wird für Admin verwendet
    });

    if (!menu) {
      return res.status(404).json({ 
        success: false,
        message: 'Speiseplan nicht gefunden' 
      });
    }

    return res.status(200).json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error('Fehler beim Laden des Menüs:', error);
    return res.status(500).json({ error: 'Serverfehler' });
  }
} 