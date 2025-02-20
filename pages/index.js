import React from 'react';
import { useState, useEffect } from 'react';

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
    <div className="max-w-3xl mx-auto p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-gray-600 text-sm mb-2">Tel. {menuData.contactInfo.phone}</div>
        <div className="text-gray-600 text-sm mb-4">Postfremde-Kunden {menuData.contactInfo.postcode}</div>
        <h1 className="text-3xl font-bold mb-2">Mittagskarte</h1>
        <p className="text-gray-600">
          {new Date(menuData.weekStart).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })} - {new Date(menuData.weekEnd).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </p>
      </div>

      {/* Menu Items */}
      <div className="space-y-8">
        {menuData.days.map((day, dayIndex) => (
          <div key={dayIndex} className="border-b pb-6 last:border-b-0">
            <h2 className="text-xl font-semibold mb-4">{day.day}</h2>
            <div className="space-y-4">
              {day.meals.map((meal, mealIndex) => (
                <div key={mealIndex} className="group">
                  <p className="italic text-lg mb-1">{meal.name}</p>
                  <p className="pl-4 text-right text-gray-700">
                    Euro {typeof meal.price === 'number' ? meal.price.toFixed(2) : meal.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
        <p>Alle Preise inkl. MwSt</p>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .min-h-screen {
            min-height: auto;
          }
          @page {
            margin: 2cm;
          }
        }
      `}</style>
    </div>
  );
}
