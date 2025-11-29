// API für Batch-Analyse mehrerer Gerichte auf einmal
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { meals } = req.body;
    
    if (!Array.isArray(meals) || meals.length === 0) {
      return res.status(400).json({ error: 'meals array ist erforderlich' });
    }

    console.log(`📦 Batch-Analyse für ${meals.length} Gerichte`);

    const results = [];
    
    for (const mealName of meals) {
      if (!mealName || mealName.trim().length === 0) {
        results.push({
          meal: mealName,
          allergens: [],
          additives: [],
          confidence: 0,
          method: 'empty_meal_name'
        });
        continue;
      }

      try {
        // Nutze die neue verbesserte API
        const apiUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/api/analyze-allergens-v2`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mealName })
        });
        
        if (response.ok) {
          const result = await response.json();
          results.push({
            meal: mealName,
            allergens: result.allergens || [],
            additives: result.additives || [],
            confidence: result.confidence || 0,
            method: result.method || 'unknown'
          });
        } else {
          results.push({
            meal: mealName,
            allergens: [],
            additives: [],
            confidence: 0,
            method: 'api_error'
          });
        }
      } catch (error) {
        console.error('Fehler bei Analyse von:', mealName, error);
        results.push({
          meal: mealName,
          allergens: [],
          additives: [],
          confidence: 0,
          method: 'exception',
          error: error.message
        });
      }
      
      // Kleine Pause zwischen Anfragen um API nicht zu überlasten
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const successCount = results.filter(r => r.allergens.length > 0 || r.additives.length > 0).length;
    
    return res.status(200).json({
      success: true,
      total: meals.length,
      analyzed: successCount,
      failed: meals.length - successCount,
      results
    });

  } catch (error) {
    console.error('❌ Batch-Analyse fehlgeschlagen:', error);
    return res.status(500).json({ 
      error: 'Batch-Analyse fehlgeschlagen',
      message: error.message 
    });
  }
}
