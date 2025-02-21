import { useState, useEffect } from 'react';
import { Save, Loader, AlertCircle } from 'lucide-react';

export default function Admin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [weekMenu, setWeekMenu] = useState([
    { day: 'Montag', meals: [{ name: '', price: 0 }] },
    { day: 'Dienstag', meals: [{ name: '', price: 0 }] },
    { day: 'Mittwoch', meals: [{ name: '', price: 0 }] },
    { day: 'Donnerstag', meals: [{ name: '', price: 0 }] },
    { day: 'Freitag', meals: [{ name: '', price: 0 }] }
  ]);
  
  const [contactInfo, setContactInfo] = useState({
    phone: '05101-84809',
    postcode: '0.50'
  });

  // Funktion zum Hinzufügen einer Mahlzeit
  const addMeal = (dayIndex) => {
    const newWeekMenu = [...weekMenu];
    newWeekMenu[dayIndex].meals.push({ name: '', price: 0 });
    setWeekMenu(newWeekMenu);
  };

  // Funktion zum Aktualisieren einer Mahlzeit
  const updateMeal = (dayIndex, mealIndex, field, value) => {
    const newWeekMenu = [...weekMenu];
    newWeekMenu[dayIndex].meals[mealIndex][field] = field === 'price' ? parseFloat(value) : value;
    setWeekMenu(newWeekMenu);
  };

  // Funktion zum Entfernen einer Mahlzeit
  const removeMeal = (dayIndex, mealIndex) => {
    const newWeekMenu = [...weekMenu];
    newWeekMenu[dayIndex].meals.splice(mealIndex, 1);
    setWeekMenu(newWeekMenu);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart: dateRange.start,
          weekEnd: dateRange.end,
          days: weekMenu,
          contactInfo
        })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Fehler beim Speichern');
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Speiseplan Administration</h1>
          <p className="mt-2 text-gray-600">Verwalten Sie hier den wöchentlichen Speiseplan</p>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <p className="text-green-700">Speiseplan erfolgreich gespeichert!</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Kontaktinformationen</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Telefon
                </label>
                <input
                  type="text"
                  name="phone"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Postfremde
                </label>
                <input
                  type="text"
                  name="postcode"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={contactInfo.postcode}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, postcode: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Zeitraum</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Von
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bis
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Menu Items */}
          {weekMenu.map((day, dayIndex) => (
            <div key={day.day} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">{day.day}</h2>
              <div className="space-y-4">
                {day.meals.map((meal, mealIndex) => (
                  <div key={mealIndex} className="grid grid-cols-5 gap-4 mb-4">
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Gericht"
                        value={meal.name}
                        onChange={(e) => updateMeal(dayIndex, mealIndex, 'name', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preis"
                        value={meal.price}
                        onChange={(e) => updateMeal(dayIndex, mealIndex, 'price', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeMeal(dayIndex, mealIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Entfernen
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addMeal(dayIndex)}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  + Gericht hinzufügen
                </button>
              </div>
            </div>
          ))}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-4 rounded-lg text-white font-medium flex items-center justify-center transition-colors
              ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Wird gespeichert...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Speiseplan speichern
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
