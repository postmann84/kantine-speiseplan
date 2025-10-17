import dbConnect from '../../lib/mongodb';
import Menu from '../../models/menu';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Alle Menüs aus der Datenbank holen
    const allMenus = await Menu.find({}).lean();
    
    const analysis = {
      totalMenus: allMenus.length,
      totalMeals: 0,
      uniqueMeals: new Map(),
      mealFrequency: new Map(),
      allergenPatterns: new Map(),
      additivePatterns: new Map(),
      commonIngredients: new Map(),
      mealCategories: {
        pasta: [],
        fleisch: [],
        fisch: [],
        vegetarisch: [],
        suppe: [],
        salat: []
      }
    };

    // Alle Gerichte durchgehen
    allMenus.forEach(menu => {
      menu.days?.forEach(day => {
        day.meals?.forEach(meal => {
          if (!meal.name || meal.name.trim() === '') return;
          
          const mealName = meal.name.trim().toLowerCase();
          analysis.totalMeals++;
          
          // Häufigkeit zählen
          const currentCount = analysis.mealFrequency.get(mealName) || 0;
          analysis.mealFrequency.set(mealName, currentCount + 1);
          
          // Eindeutige Gerichte mit Allergenen/Zusatzstoffen sammeln
          if (meal.allergenCodes?.length > 0 || meal.additiveCodes?.length > 0) {
            analysis.uniqueMeals.set(mealName, {
              name: meal.name,
              allergenCodes: meal.allergenCodes || [],
              additiveCodes: meal.additiveCodes || [],
              frequency: currentCount + 1,
              price: meal.price
            });
            
            // Allergen-Muster analysieren
            meal.allergenCodes?.forEach(code => {
              const key = `allergen_${code}`;
              const patterns = analysis.allergenPatterns.get(key) || [];
              patterns.push(mealName);
              analysis.allergenPatterns.set(key, patterns);
            });
            
            // Zusatzstoff-Muster analysieren
            meal.additiveCodes?.forEach(code => {
              const key = `additive_${code}`;
              const patterns = analysis.additivePatterns.get(key) || [];
              patterns.push(mealName);
              analysis.additivePatterns.set(key, patterns);
            });
          }
          
          // Kategorisierung basierend auf Keywords
          const categorizeByKeywords = (name) => {
            const lowerName = name.toLowerCase();
            if (lowerName.includes('pasta') || lowerName.includes('spaghetti') || lowerName.includes('nudel')) {
              analysis.mealCategories.pasta.push(mealName);
            }
            if (lowerName.includes('fleisch') || lowerName.includes('schwein') || lowerName.includes('rind') || lowerName.includes('hähnchen')) {
              analysis.mealCategories.fleisch.push(mealName);
            }
            if (lowerName.includes('fisch') || lowerName.includes('lachs') || lowerName.includes('forelle')) {
              analysis.mealCategories.fisch.push(mealName);
            }
            if (lowerName.includes('vegetarisch') || lowerName.includes('gemüse')) {
              analysis.mealCategories.vegetarisch.push(mealName);
            }
            if (lowerName.includes('suppe') || lowerName.includes('eintopf')) {
              analysis.mealCategories.suppe.push(mealName);
            }
            if (lowerName.includes('salat')) {
              analysis.mealCategories.salat.push(mealName);
            }
          };
          
          categorizeByKeywords(meal.name);
          
          // Häufige Zutaten extrahieren
          const extractIngredients = (name) => {
            const ingredients = [
              'käse', 'milch', 'ei', 'eier', 'gluten', 'weizen', 'soja', 'nüsse',
              'mandel', 'haselnuss', 'sellerie', 'senf', 'sesam', 'fisch', 'krebstier',
              'schwefel', 'lupin', 'weichtier', 'erdnuss', 'schalenfrüchte'
            ];
            
            ingredients.forEach(ingredient => {
              if (name.toLowerCase().includes(ingredient)) {
                const count = analysis.commonIngredients.get(ingredient) || 0;
                analysis.commonIngredients.set(ingredient, count + 1);
              }
            });
          };
          
          extractIngredients(meal.name);
        });
      });
    });
    
    // Top-Listen erstellen
    const topMeals = Array.from(analysis.mealFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, frequency: count }));
    
    const topIngredients = Array.from(analysis.commonIngredients.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([ingredient, count]) => ({ ingredient, count }));
    
    // Allergen-Häufigkeit
    const allergenStats = {};
    analysis.allergenPatterns.forEach((meals, key) => {
      const code = key.replace('allergen_', '');
      allergenStats[code] = {
        count: meals.length,
        uniqueMeals: [...new Set(meals)].length,
        examples: [...new Set(meals)].slice(0, 5)
      };
    });
    
    // Zusatzstoff-Häufigkeit
    const additiveStats = {};
    analysis.additivePatterns.forEach((meals, key) => {
      const code = key.replace('additive_', '');
      additiveStats[code] = {
        count: meals.length,
        uniqueMeals: [...new Set(meals)].length,
        examples: [...new Set(meals)].slice(0, 5)
      };
    });

    const result = {
      summary: {
        totalMenus: analysis.totalMenus,
        totalMeals: analysis.totalMeals,
        uniqueMealsWithAllergens: analysis.uniqueMeals.size
      },
      topMeals,
      topIngredients,
      mealCategories: {
        pasta: analysis.mealCategories.pasta.length,
        fleisch: analysis.mealCategories.fleisch.length,
        fisch: analysis.mealCategories.fisch.length,
        vegetarisch: analysis.mealCategories.vegetarisch.length,
        suppe: analysis.mealCategories.suppe.length,
        salat: analysis.mealCategories.salat.length
      },
      allergenStats,
      additiveStats,
      knownMeals: Object.fromEntries(analysis.uniqueMeals)
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Fehler bei der historischen Analyse:', error);
    return res.status(500).json({ error: 'Analyse fehlgeschlagen' });
  }
}


