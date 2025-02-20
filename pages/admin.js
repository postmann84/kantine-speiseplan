// pages/admin.js
import { useState } from 'react';
import { Save } from 'lucide-react';

export default function Admin() {
  const [contactInfo, setContactInfo] = useState({
    phone: '05101-84809',
    postcode: '0.50'
  });
  
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const [weekMenu, setWeekMenu] = useState([
    { 
      day: 'Montag', 
      meals: [
        { name: '', price: 4.80 },
        { name: '', price: 6.80 }
      ]
    },
    { 
      day: 'Dienstag', 
      meals: [
        { name: '', price: 4.80 },
        { name: '', price: 6.80 }
      ]
    },
    { 
      day: 'Mittwoch', 
      meals: [
        { name: '', price: 4.80 },
        { name: '', price: 6.80 }
      ]
    },
    { 
      day: 'Donnerstag', 
      meals: [
        { name: '', price: 4.80 },
        { name: '', price: 6.80 }
      ]
    },
    { 
      day: 'Freitag', 
      meals: [
        { name: '', price: 4.80 },
        { name: '', price: 6.80 }
      ]
    }
  ]);

  const handleMealChange = (dayIndex, mealIndex, value) => {
    const newMenu = [...weekMenu];
    newMenu[dayIndex].meals[mealIndex].name = value;
    setWeekMenu(newMenu);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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

      if (!response.ok) throw new Error('Fehler beim Speichern');
      
      alert('Speiseplan erfolgreich gespeichert!');
    } catch (error) {
      alert('Fehler: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Speiseplan Administration</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Kontaktinformationen</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Telefon
              </label>
              <input
                type="text"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Postleitzahl
              </label>
              <input
                type="text"
                value={contactInfo.postcode}
                onChange={(e) => setContactInfo({...contactInfo, postcode: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Zeitraum</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Von
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Bis
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {weekMenu.map((day, dayIndex) => (
          <div key={day.day} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">{day.day}</h2>
            <div className="space-y-4">
              {day.meals.map((meal, mealIndex) => (
                <div key={mealIndex} className="grid grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={meal.name}
                      onChange={(e) => handleMealChange(dayIndex, mealIndex, e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Gericht eingeben..."
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={meal.price.toFixed(2) + ' €'}
                      readOnly
                      className="w-full p-2 bg-gray-100 border rounded text-right"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <button
          type="submit"
          className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
        >
          <Save className="w-5 h-5 mr-2" />
          Speiseplan speichern
        </button>
      </form>
    </div>
  );
}
