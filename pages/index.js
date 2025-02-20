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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header Bereich */}
        <div className="bg-blue-600 text-white px-8 py-6">
          <div className="text-sm mb-1 opacity-90">Tel. {menuData.contactInfo?.phone}</div>
          <div className="text-sm mb-4 opacity-90">Postleitzahl-Kunden {menuData.contactInfo?.postcode}</div>
          <h1 className="text-3xl font-bold">Mittagskarte</h1>
          <p className="mt-2 text-lg">
            {menuData.weekStart && formatDate(menuData.weekStart)} - {menuData.weekEnd && formatDate(menuData.weekEnd)}
          </p>
        </div>

        {/* Speiseplan */}
        <div className="p-8">
          <div className="divide-y divide-gray-200">
            {menuData.days?.map((day, dayIndex) => (
              <div key={dayIndex} className={`py-6 ${dayIndex === 0 ? 'pt-0' : ''}`}>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{day.day}</h2>
                <div className="space-y-4">
                  {day.meals?.map((meal, mealIndex) => (
                    <div key={mealIndex} className="flex justify-between items-start group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <div className="flex-1">
                        <p className="text-gray-800 text-lg font-medium italic">{meal.name}</p>
                      </div>
                      <div className="ml-4">
                        <p className="text-lg font-semibold text-blue-600">
                          € {typeof meal.price === 'number' ? meal.price.toFixed(2) : meal.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            Alle Preise inkl. MwSt
          </p>
        </div>
      </div>
    </div>
  );
}
