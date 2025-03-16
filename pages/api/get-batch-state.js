import fs from 'fs';
import path from 'path';

// Ruft den aktuellen Batch-Status aus einer temporären Datei ab
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      message: 'Nur GET-Anfragen erlaubt' 
    });
  }

  try {
    const { menuId } = req.query;

    if (!menuId) {
      return res.status(400).json({
        success: false,
        message: 'menuId ist erforderlich'
      });
    }

    // Pfad zur temporären Datei
    const tempDir = path.join(process.cwd(), 'tmp');
    const batchStateFile = path.join(tempDir, `batch-state-${menuId}.json`);

    // Prüfe, ob die Datei existiert
    if (!fs.existsSync(batchStateFile)) {
      return res.status(404).json({
        success: false,
        message: 'Batch-Status nicht gefunden'
      });
    }

    // Lese den Batch-Status aus der Datei
    const batchStateData = fs.readFileSync(batchStateFile, 'utf8');
    const batchState = JSON.parse(batchStateData);

    return res.status(200).json({
      success: true,
      batchState
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Batch-Status:', error);
    return res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen des Batch-Status',
      error: error.message
    });
  }
} 