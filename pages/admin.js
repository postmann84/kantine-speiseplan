import { useState, useEffect } from 'react';
import { Save, Loader, AlertCircle } from 'lucide-react';
import { getHolidaysForWeek } from '../lib/holidays';
import { formatDate } from '../lib/dateUtils';

export default function Admin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  // Vorinitialisierte Wochentage mit zwei Gerichten und Standardpreisen
  const [weekMenu, setWeekMenu] = useState([
    { 
      day: 'Montag', 
      meals: [
        { name: '', price: 4.80, isAction: false, actionNote: '' },
        { name: '', price: 6.80, isAction: false, actionNote: '' }
      ] 
    },
    { 
      day: 'Dienstag', 
      meals: [
        { name: '', price: 4.80, isAction: false, actionNote: '' },
        { name: '', price: 6.80, isAction: false, actionNote: '' }
      ] 
    },
    { 
      day: 'Mittwoch', 
      meals: [
        { name: '', price: 4.80, isAction: false, actionNote: '' },
        { name: '', price: 6.80, isAction: false, actionNote: '' }
      ] 
    },
    { 
      day: 'Donnerstag', 
      meals: [
        { name: '', price: 4.80, isAction: false, actionNote: '' },
        { name: '', price: 6.80, isAction: false, actionNote: '' }
      ] 
    },
    { 
      day: 'Freitag', 
      meals: [
        { name: '', price: 4.80, isAction: false, actionNote: '' },
        { name: '', price: 6.80, isAction: false, actionNote: '' }
      ] 
    }
  ]);
  
  const [contactInfo, setContactInfo] = useState({
    phone: '05101-84809',
    postcode: '0.50'
  });

  const [vacationData, setVacationData] = useState({
    isOnVacation: false,
    startDate: '',
    endDate: '',
    message: 'Wir befinden uns im Urlaub.'
  });

  const [holidays, setHolidays] = useState({});

  // Aktualisiere Feiertage wenn sich das Datum ändert
  useEffect(() => {
    if (dateRange.start) {
      const weekHolidays = getHolidaysForWeek(dateRange.start);
      setHolidays(weekHolidays);
    }
  }, [dateRange.start]);

  // Funktion zum Berechnen des Freitags der ausgewählten Woche
  const calculateFriday = (startDate) => {
    const date = new Date(startDate);
    const day = date.getDay();
    const diff = day <= 5 ? 5 - day : 5 + (7 - day);
    date.setDate(date.getDate() + diff);
    return date.toISOString().split('T')[0];
  };

  // Handler für Datumsänderung
  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    const newEnd = calculateFriday(newStart);
    setDateRange({
      start: newStart,
      end: newEnd
    });
  };

  // Funktion zum Hinzufügen einer Mahlzeit
  const addMeal = (dayIndex) => {
    const newWeekMenu = [...weekMenu];
    newWeekMenu[dayIndex].meals.push({ name: '', price: 0, isAction: false, actionNote: '' });
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

  // Funktion zum Aktualisieren der Aktionsessen-Eigenschaften
  const handleActionChange = (dayIndex, mealIndex, field, value) => {
    console.log(`Updating ${field} to ${value} for day ${dayIndex}, meal ${mealIndex}`); // Debug Log
    
    setWeekMenu(prevMenu => {
      const newMenu = JSON.parse(JSON.stringify(prevMenu)); // Deep copy
      newMenu[dayIndex].meals[mealIndex][field] = value;
      
      console.log('Updated menu:', newMenu[dayIndex].meals[mealIndex]); // Debug Log
      return newMenu;
    });
  };

  const handleClosedChange = (dayIndex, isClosed) => {
    setWeekMenu(prevMenu => {
      const newMenu = [...prevMenu];
      newMenu[dayIndex] = {
        ...newMenu[dayIndex],
        isClosed: isClosed,
        closedReason: isClosed ? newMenu[dayIndex].closedReason || 'Kantine geschlossen' : ''
      };
      return newMenu;
    });
  };

  const handleClosedReasonChange = (dayIndex, reason) => {
    setWeekMenu(prevMenu => {
      const newMenu = [...prevMenu];
      newMenu[dayIndex] = {
        ...newMenu[dayIndex],
        closedReason: reason
      };
      return newMenu;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const menuData = {
      weekStart: new Date(dateRange.start),
      weekEnd: new Date(dateRange.end),
      days: weekMenu.map(day => ({
        day: day.day,
        meals: day.meals.map(meal => ({
          name: meal.name,
          price: meal.price,
          isAction: Boolean(meal.isAction),
          actionNote: meal.actionNote || ''
        })),
        isClosed: day.isClosed,
        closedReason: day.closedReason || ''
      })),
      contactInfo,
      vacation: vacationData
    };

    console.log('Submitting menu data:', menuData); // Debug Log

    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuData)
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern');
      }

      const result = await response.json();
      console.log('Server response:', result); // Debug Log

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-8">Menü-Verwaltung</h1>

        {/* Urlaubs-Toggle als kleiner Button */}
        <div className="mb-4 flex items-center justify-end">
          <button
            onClick={() => setVacationData(prev => ({...prev, isOnVacation: !prev.isOnVacation}))}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
              vacationData.isOnVacation 
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="material-icons text-sm">
              {vacationData.isOnVacation ? '' : ''}
            </span>
            Urlaubsmodus {vacationData.isOnVacation ? 'aktiv' : 'inaktiv'}
          </button>
        </div>

        {/* Urlaubs-Einstellungen als Modal/Dialog */}
        {vacationData.isOnVacation && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Von</label>
                <input
                  type="date"
                  value={vacationData.startDate}
                  onChange={(e) => setVacationData({
                    ...vacationData,
                    startDate: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bis</label>
                <input
                  type="date"
                  value={vacationData.endDate}
                  onChange={(e) => setVacationData({
                    ...vacationData,
                    endDate: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nachricht</label>
              <input
                type="text"
                value={vacationData.message}
                onChange={(e) => setVacationData({
                  ...vacationData,
                  message: e.target.value
                })}
                placeholder="z.B.: Wir machen Betriebsferien"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

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
                  onChange={handleStartDateChange}
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
                  disabled
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Menu Items */}
          {weekMenu.map((day, dayIndex) => {
            const currentDate = new Date(dateRange.start);
            currentDate.setDate(currentDate.getDate() + dayIndex);
            const dateStr = currentDate.toISOString().split('T')[0];
            const holidayInfo = holidays[dateStr];

            return (
              <div key={dayIndex} className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex flex-col gap-4">
                  {/* Tag und Schließtag-Checkbox */}
                  <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-xl font-semibold">{day.day}</h2>
                    
                    {/* Schließtag-Checkbox - Bedingung entfernt */}
                    <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.isClosed || false}
                        onChange={(e) => handleClosedChange(dayIndex, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span>Als Schließtag markieren</span>
                    </label>
                  </div>

                  {/* Feiertags-Badge wenn vorhanden */}
                  {holidayInfo && (
                    <div className={`px-4 py-2 rounded-lg self-start ${
                      holidayInfo.type === 'holiday' 
                        ? 'bg-red-100 text-red-800' 
                        : `bg-${holidayInfo.color}-100 text-${holidayInfo.color}-800`
                    }`}>
                      {holidayInfo.type === 'holiday' ? 'Feiertag: ' : ''}{holidayInfo.name}
                    </div>
                  )}

                  {/* Grund für Schließung wenn als Schließtag markiert */}
                  {day.isClosed && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={day.closedReason || ''}
                        onChange={(e) => handleClosedReasonChange(dayIndex, e.target.value)}
                        placeholder="Grund für die Schließung eingeben"
                        className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* Mahlzeiten oder Geschlossen-Nachricht */}
                  {holidayInfo?.type === 'holiday' || day.isClosed ? (
                    <div className="p-4 bg-gray-50 rounded text-gray-600 text-center">
                      {holidayInfo?.type === 'holiday' 
                        ? 'An Feiertagen bleibt die Kantine geschlossen'
                        : day.closedReason || 'Kantine geschlossen'}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {day.meals.map((meal, mealIndex) => (
                        <div key={mealIndex} className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder={`Gericht ${mealIndex + 1}`}
                              value={meal.name}
                              onChange={(e) => handleActionChange(dayIndex, mealIndex, 'name', e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <input
                              type="number"
                              step="0.01"
                              value={meal.price}
                              onChange={(e) => handleActionChange(dayIndex, mealIndex, 'price', parseFloat(e.target.value))}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          
                          {/* Aktionsessen Checkbox */}
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={meal.isAction}
                              onChange={(e) => handleActionChange(dayIndex, mealIndex, 'isAction', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label className="text-sm text-gray-700">
                              Als Aktionsessen markieren
                            </label>
                          </div>
                          
                          {/* Bemerkungsfeld (nur sichtbar wenn isAction true ist) */}
                          {meal.isAction && (
                            <input
                              type="text"
                              placeholder="Bemerkung zum Aktionsessen"
                              value={meal.actionNote}
                              onChange={(e) => handleActionChange(dayIndex, mealIndex, 'actionNote', e.target.value)}
                              className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          )}
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
                  )}
                </div>
              </div>
            );
          })}
          
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
