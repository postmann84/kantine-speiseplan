import React, { useState, useEffect } from 'react';

export default function Home() {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        console.log('API Response:', data); // Debug Log 1
        
        if (data.success && data.data) {
          console.log('Menu Data:', data.data); // Debug Log 2
          console.log('Dates:', {
            start: data.data.weekStart,
            end: data.data.weekEnd
          }); // Debug Log 3
          setMenuData(data.data);
        }
      } catch (error) {
        console.error('Fehler:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

  if (loading) return <div>Laden...</div>;
  if (!menuData) return <div>Kein Speiseplan verfügbar</div>;

  // Debug Log 4
  console.log('Rendering with data:', {
    weekStart: menuData.weekStart,
    weekEnd: menuData.weekEnd
  });

  return (
    <div className="p-4">
      <div className="bg-gray-100 p-4 mb-4 rounded">
        <h1 className="text-xl font-bold mb-2">Speiseplan</h1>
        <p>Gültig von: {menuData.weekStart}</p>
        <p>Gültig bis: {menuData.weekEnd}</p>
      </div>

      {menuData.days?.map((day, index) => (
        <div key={index} className="mb-4">
          <h2 className="font-bold">{day.day}</h2>
          {day.meals?.map((meal, mealIndex) => (
            <div key={mealIndex} className="flex justify-between py-1">
              <span>{meal.name}</span>
              <span>{meal.price.toFixed(2)} €</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
