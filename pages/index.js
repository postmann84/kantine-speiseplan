import React, { useState, useEffect } from 'react';

export default function Home() {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vereinfachte Datumsformatierung
  const formatDate = (dateString) => {
    if (!dateString) return '';
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
        console.log('Geladene Daten:', data); // Debug-Ausgabe
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

  console.log('MenuData:', menuData); // Debug-Ausgabe

  return (
    <div>
      {/* Zeitraum des Speiseplans */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-2">Aktueller Speiseplan</h2>
        <p className="text-gray-700">
          Gültig vom {formatDate(menuData.weekStart)} bis {formatDate(menuData.weekEnd)}
        </p>
      </div>

      {/* Speiseplan */}
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
