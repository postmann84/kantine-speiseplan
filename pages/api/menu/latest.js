import dbConnect from '../../../lib/mongodb';
import Menu from '../../../models/menu';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Hole den neuesten Speiseplan
    const latestMenu = await Menu.findOne()
      .sort({ createdAt: -1 })
      .limit(1);

    return res.status(200).json({
      success: true,
      menu: latestMenu
    });
  } catch (error) {
    console.error('Fehler beim Laden des letzten Menüs:', error);
    return res.status(500).json({ error: 'Serverfehler' });
  }
} 