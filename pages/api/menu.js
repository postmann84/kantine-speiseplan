// pages/api/menu.js
import dbConnect from '../../lib/mongodb';
import Menu from '../../models/menu';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const menu = await Menu.create(req.body);
      res.status(201).json({ success: true, data: menu });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      // Hole den aktuellsten Speiseplan
      const menu = await Menu.findOne().sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: menu });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
