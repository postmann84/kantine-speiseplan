import React, { useState, useEffect } from 'react';

export default function Home() {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vereinfachte Datumsformatierung
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  };

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

  if (loading) {
    return <div>Laden...</div>;
  }

  if (!menuData) {
    return <div>Kein Speiseplan verfügbar</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <p>Speiseplan vom {formatDate(menuData.weekStart)} bis {formatDate(menuData.weekEnd)}</p>
      </div>

      {menuData.days?.map((day, index) => (
        <div key={index} className="menu-card">
          <h2 className="menu-day">{day.day}</h2>
          <div className="space-y-2">
            {day.meals.map((meal, mealIndex) => (
              <div key={mealIndex} className="menu-item">
                <span>{meal.name}</span>
                <span className="menu-price">{meal.price.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
