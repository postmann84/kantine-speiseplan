// pages/api/menu.js
import dbConnect from '../../lib/mongodb';
import Menu from '../../models/menu';

export default async function handler(req, res) {
  try {
    await dbConnect();
    console.log('MongoDB connected successfully');

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
        res.status(200).json({ success: true, data: menu });
      } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(400).json({ 
          success: false, 
          error: error.message,
          details: error.toString()
        });
      }
    }
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      details: error.toString()
    });
  }
}
