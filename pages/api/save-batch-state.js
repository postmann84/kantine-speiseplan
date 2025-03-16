import fs from 'fs';
import path from 'path';

// Speichert den aktuellen Batch-Status in einer temporären Datei
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Nur POST-Anfragen erlaubt' 
    });
  }

  try {
    const { menuId, currentBatchIndex, totalBatches } = req.body;

    if (!menuId) {
      return res.status(400).json({
        success: false,
        message: 'menuId ist erforderlich'
      });
    }

    // Erstelle ein Verzeichnis für temporäre Dateien, falls es nicht existiert
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Speichere den Batch-Status in einer temporären Datei
    const batchStateFile = path.join(tempDir, `batch-state-${menuId}.json`);
    const batchState = {
      menuId,
      currentBatchIndex,
      totalBatches,
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(batchStateFile, JSON.stringify(batchState, null, 2));

    return res.status(200).json({
      success: true,
      message: 'Batch-Status erfolgreich gespeichert'
    });
  } catch (error) {
    console.error('Fehler beim Speichern des Batch-Status:', error);
    return res.status(500).json({
      success: false,
      message: 'Fehler beim Speichern des Batch-Status',
      error: error.message
    });
  }
} 