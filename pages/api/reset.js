import dbConnect from '../../lib/mongodb';
import Menu from '../../models/menu';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Löschen Sie alle bestehenden Menüs
    await Menu.deleteMany({});
    
    return res.status(200).json({ message: 'Database reset successful' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
} 