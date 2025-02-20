import React, { useState, useEffect } from 'react';

export default function Home() {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Datumsformatierung-Funktion
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Kein aktueller Speiseplan verfügbar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {menuData?.days.map((day, index) => (
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
