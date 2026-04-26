import dbConnect from '../../lib/mongodb';
import Menu from '../../models/menu';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const menus = await Menu.find({}, {
      'days.meals.name': 1,
      'days.meals.icon': 1,
      'days.meals.price': 1,
      'days.day': 1,
      'weekNumber': 1,
      'year': 1,
      'weekStart': 1
    }).lean();

    // Collect all meals with metadata
    const mealMap = {};

    for (const menu of menus) {
      if (!menu.days) continue;
      for (const day of menu.days) {
        if (!day.meals) continue;
        for (const meal of day.meals) {
          if (!meal.name || !meal.name.trim()) continue;

          const key = meal.name.trim();
          if (!mealMap[key]) {
            mealMap[key] = {
              name: key,
              icon: meal.icon || '',
              price: meal.price || 0,
              count: 0,
              lastServed: null,
              lastServedWeek: null,
              lastServedYear: null
            };
          }

          mealMap[key].count += 1;

          // Track most recent icon (in case it changed over time)
          if (meal.icon) {
            mealMap[key].icon = meal.icon;
          }

          // Track last served date
          const servedDate = menu.weekStart ? new Date(menu.weekStart) : null;
          if (servedDate && (!mealMap[key].lastServed || servedDate > mealMap[key].lastServed)) {
            mealMap[key].lastServed = servedDate;
            mealMap[key].lastServedWeek = menu.weekNumber;
            mealMap[key].lastServedYear = menu.year;
          }
        }
      }
    }

    // Group by icon category
    const categories = {
      '🐷': { label: 'Schwein', icon: '🐷', meals: [] },
      '🐔': { label: 'Huhn', icon: '🐔', meals: [] },
      '🥗': { label: 'Vegetarisch', icon: '🥗', meals: [] },
      '🐄': { label: 'Rind', icon: '🐄', meals: [] },
      '🐟': { label: 'Fisch', icon: '🐟', meals: [] },
      '🥣': { label: 'Suppe/Eintopf', icon: '🥣', meals: [] },
      '🍝': { label: 'Pasta', icon: '🍝', meals: [] },
    };

    // Calculate weeks ago for each meal
    const now = new Date();
    const currentWeekMs = now.getTime();

    for (const meal of Object.values(mealMap)) {
      let weeksAgo = null;
      if (meal.lastServed) {
        const diffMs = currentWeekMs - meal.lastServed.getTime();
        weeksAgo = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
      }

      const entry = {
        name: meal.name,
        icon: meal.icon,
        price: meal.price,
        count: meal.count,
        weeksAgo,
        lastServedWeek: meal.lastServedWeek,
        lastServedYear: meal.lastServedYear
      };

      if (categories[meal.icon]) {
        categories[meal.icon].meals.push(entry);
      }
      // Meals with unknown icons go nowhere (🍽️, kein icon)
    }

    // Sort each category: most frequent first
    for (const cat of Object.values(categories)) {
      cat.meals.sort((a, b) => b.count - a.count);
    }

    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Meal suggestions error:', error);
    return res.status(500).json({ success: false, error: 'Interner Serverfehler' });
  }
}
