// pages/api/menu.js
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Generiere eine eindeutige ID für das Menü
      const menuId = uuidv4();
      
      // Füge die ID und das aktuelle Datum zum Menü hinzu
      const menuData = {
        ...req.body,
        id: menuId,
        createdAt: new Date().toISOString()
      };
      
      // Speichere das Menü in einer Datei
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const filePath = path.join(dataDir, 'menu.json');
      fs.writeFileSync(filePath, JSON.stringify(menuData, null, 2));
      
      res.status(200).json({ 
        success: true, 
        message: 'Menü erfolgreich gespeichert',
        menuId: menuId
      });
    } catch (error) {
      console.error('Fehler beim Speichern des Menüs:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Fehler beim Speichern des Menüs',
        error: error.message
      });
    }
  } else if (req.method === 'GET') {
    try {
      const filePath = path.join(process.cwd(), 'data', 'menu.json');
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
          success: false, 
          message: 'Kein Menü gefunden' 
        });
      }
      
      const menuData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.status(200).json({ 
        success: true, 
        menu: menuData 
      });
    } catch (error) {
      console.error('Fehler beim Laden des Menüs:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Fehler beim Laden des Menüs',
        error: error.message
      });
    }
  } else {
    res.status(405).json({ 
      success: false, 
      message: 'Methode nicht erlaubt' 
    });
  }
}
