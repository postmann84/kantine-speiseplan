// pages/api/menu.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Generiere eine eindeutige ID für das Menü
      const menuId = `menu-${Date.now()}`;
      
      // Füge die ID und das aktuelle Datum zum Menü hinzu
      const menuData = {
        ...req.body,
        id: menuId,
        createdAt: new Date().toISOString()
      };
      
      // Sende die Daten zurück
      res.status(200).json({ 
        success: true, 
        message: 'Menü erfolgreich gespeichert',
        menuId: menuId,
        data: menuData
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
      // In einer echten Anwendung würden wir hier die Daten aus einer Datenbank laden
      // Da wir keinen Dateisystemzugriff haben, senden wir eine Nachricht zurück
      res.status(200).json({ 
        success: true, 
        message: 'Kein gespeichertes Menü verfügbar',
        menu: null
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
