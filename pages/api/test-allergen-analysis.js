// Test-Endpoint für Allergen-Analyse Debugging
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mealName } = req.body;
  if (!mealName) {
    return res.status(400).json({ error: 'mealName erforderlich' });
  }

  // Importiere die Analyse-Funktion direkt
  try {
    const { analyzeAllergens } = require('./analyze-allergens');
    const result = await analyzeAllergens(mealName);
    
    return res.status(200).json({
      input: mealName,
      result,
      timestamp: new Date().toISOString(),
      debug: true
    });
  } catch (error) {
    console.error('Test-Analyse fehlgeschlagen:', error);
    return res.status(500).json({ 
      error: 'Test fehlgeschlagen',
      details: error.message,
      input: mealName
    });
  }
}



