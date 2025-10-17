import dbConnect from '../../lib/mongodb';
import Menu from '../../models/menu';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mealName } = req.body;
    if (!mealName) {
      return res.status(400).json({ error: 'mealName erforderlich' });
    }

    await dbConnect();
    
    // Suche alle Vorkommen dieses Gerichts in der Datenbank
    const mealsWithName = await Menu.aggregate([
      { $unwind: '$days' },
      { $unwind: '$days.meals' },
      {
        $match: {
          'days.meals.name': { $regex: new RegExp(mealName.trim(), 'i') }
        }
      },
      {
        $project: {
          _id: 1,
          weekNumber: 1,
          year: 1,
          dayName: '$days.dayName',
          mealName: '$days.meals.name',
          allergenCodes: '$days.meals.allergenCodes',
          additiveCodes: '$days.meals.additiveCodes',
          price: '$days.meals.price',
          icon: '$days.meals.icon',
          analysisMethod: '$days.meals.analysisMethod',
          analysisConfidence: '$days.meals.analysisConfidence'
        }
      },
      { $sort: { year: -1, weekNumber: -1 } }
    ]);

    // Ähnliche Gerichte finden
    const similarMeals = await Menu.aggregate([
      { $unwind: '$days' },
      { $unwind: '$days.meals' },
      {
        $match: {
          'days.meals.name': { 
            $regex: new RegExp(mealName.toLowerCase().split(' ').join('|'), 'i') 
          },
          'days.meals.name': { $ne: mealName.trim() }
        }
      },
      {
        $project: {
          mealName: '$days.meals.name',
          allergenCodes: '$days.meals.allergenCodes',
          additiveCodes: '$days.meals.additiveCodes'
        }
      },
      { $limit: 10 }
    ]);

    const analysis = {
      searchedMeal: mealName,
      exactMatches: mealsWithName,
      exactMatchCount: mealsWithName.length,
      similarMeals: similarMeals,
      
      // Analyse der Allergene/Zusatzstoffe Konsistenz
      allergenVariations: [...new Set(mealsWithName.map(m => JSON.stringify(m.allergenCodes || [])))],
      additiveVariations: [...new Set(mealsWithName.map(m => JSON.stringify(m.additiveCodes || [])))],
      
      // Probleme identifizieren
      hasInconsistentAllergens: [...new Set(mealsWithName.map(m => JSON.stringify(m.allergenCodes || [])))].length > 1,
      hasInconsistentAdditives: [...new Set(mealsWithName.map(m => JSON.stringify(m.additiveCodes || [])))].length > 1,
      
      // Verdächtige Allergene (die nicht zu einem typischen deutschen Gericht passen)
      suspiciousAllergens: mealsWithName.length > 0 ? 
        (mealsWithName[0].allergenCodes || []).filter(code => 
          ['b', 'd', 'n'].includes(code) && // Krebstiere, Fisch, Weichtiere
          !mealName.toLowerCase().includes('fisch') && 
          !mealName.toLowerCase().includes('lachs') &&
          !mealName.toLowerCase().includes('garnele') &&
          !mealName.toLowerCase().includes('muschel')
        ) : []
    };

    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Debug-Analyse fehlgeschlagen:', error);
    return res.status(500).json({ error: 'Analyse fehlgeschlagen' });
  }
}


