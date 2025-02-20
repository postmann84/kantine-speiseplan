import { useState, useEffect } from 'react';
import { Save, Loader, AlertCircle } from 'lucide-react';

export default function Admin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    postcode: ''
  });
  
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const [weekMenu, setWeekMenu] = useState([]);

  useEffect(() => {
    async function fetchCurrentMenu() {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        
        if (data.success && data.data) {
          setDateRange({
            start: data.data.weekStart.split('T')[0],
            end: data.data.weekEnd.split('T')[0]
          });
          setWeekMenu(data.data.days || []);
          setContactInfo(data.data.contactInfo || { phone: '', postcode: '' });
        }
      } catch (error) {
        console.error('Fehler beim Laden des aktuellen Speiseplans:', error);
        setError('Fehler beim Laden des aktuellen Speiseplans');
      }
    }

    fetchCurrentMenu();
  }, []);

  const handleMealChange = (dayIndex, mealIndex, value) => {
    const newMenu = [...weekMenu];
    newMenu[dayIndex].meals[mealIndex].name = value;
    setWeekMenu(newMenu);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    const menuData = {
      weekStart: dateRange.start,
      weekEnd: dateRange.end,
      days: weekMenu,
      contactInfo
    };

    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Speichern');
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Fehler:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo({ ...contactInfo, [name]: value });
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
                  onChange={handleContactInfoChange}
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
                  onChange={handleContactInfoChange}
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
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
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
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
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
                  <div key={mealIndex} className="grid grid-cols-4 gap-4">
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={meal.name}
                        onChange={(e) => handleMealChange(dayIndex, mealIndex, e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`${mealIndex === 0 ? 'Erstes' : 'Zweites'} Gericht eingeben...`}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={meal.price.toFixed(2) + ' €'}
                        readOnly
                        className="w-full p-2 bg-gray-50 border rounded-md text-right"
                      />
                    </div>
                  </div>
                ))}
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
