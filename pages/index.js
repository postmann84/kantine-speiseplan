// pages/index.js
import { useEffect, useState } from 'react';

export default function Home() {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        if (data.success) {
          setMenuData(data.data);
        }
      } catch (error) {
        console.error('Fehler beim Laden des Speiseplans:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

  if (loading) return <div>Lädt...</div>;
  if (!menuData) return <div>Kein aktueller Speiseplan verfügbar</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-6">
        <p className="text-gray-600">Tel. {menuData.contactInfo.phone}</p>
        <p className="text-gray-600">Postfremde-Kunden {menuData.contactInfo.postcode}</p>
      </div>
      
      <h1 className="text-2xl font-bold text-center mb-2">Mittagskarte</h1>
      <p className="text-center mb-6">
        {new Date(menuData.weekStart).toLocaleDateString()} - {new Date(menuData.weekEnd).toLocaleDateString()}
      </p>
      
      <div className="space-y-8">
        {menuData.days.map((day) => (
          <div key={day.day} className="space-y-4">
            <h2 className="text-xl font-semibold">{day.day}</h2>
            {day.meals.map((meal, index) => (
              <div key={index} className="space-y-1">
                <p className="italic">{meal.name}</p>
                <p className="pl-4">Euro {meal.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
