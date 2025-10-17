import dbConnect from '../../lib/mongodb';
import Menu from '../../models/menu';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mealName, correctAllergens, correctAdditives, fixAll } = req.body;
    
    if (!mealName) {
      return res.status(400).json({ error: 'mealName erforderlich' });
    }

    await dbConnect();
    
    const updateQuery = fixAll ? 
      { 'days.meals.name': { $regex: new RegExp(`^${mealName.trim()}$`, 'i') } } :
      { 'days.meals.name': mealName.trim() };

    const updateResult = await Menu.updateMany(
      updateQuery,
      {
        $set: {
          'days.$[day].meals.$[meal].allergenCodes': correctAllergens || [],
          'days.$[day].meals.$[meal].additiveCodes': correctAdditives || [],
          'days.$[day].meals.$[meal].analysisMethod': 'manual_correction',
          'days.$[day].meals.$[meal].analysisConfidence': 100,
          'days.$[day].meals.$[meal].lastCorrected': new Date()
        }
      },
      {
        arrayFilters: [
          { 'day.meals': { $exists: true } },
          { 'meal.name': { $regex: new RegExp(`^${mealName.trim()}$`, 'i') } }
        ]
      }
    );

    return res.status(200).json({
      success: true,
      mealName: mealName,
      correctedAllergens: correctAllergens,
      correctedAdditives: correctAdditives,
      modifiedCount: updateResult.modifiedCount,
      matchedCount: updateResult.matchedCount
    });
  } catch (error) {
    console.error('Korrektur fehlgeschlagen:', error);
    return res.status(500).json({ error: 'Korrektur fehlgeschlagen' });
  }
}


