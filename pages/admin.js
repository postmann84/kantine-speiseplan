import { useState, useEffect } from 'react';
import { Save, Loader, AlertCircle } from 'lucide-react';
import { getHolidaysForWeek } from '../lib/holidays';
import { formatDate, getWeekNumber, getWeekDates } from '../lib/dateUtils';
import Login from '../components/Login';
import { getIronSession } from 'iron-session';

// Session-Optionen
const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'admin-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
};

// Server-side props mit Authentifizierungsprüfung
export async function getServerSideProps({ req, res }) {
  // Temporäre Änderung: Überspringen der Authentifizierungsprüfung
  return {
    props: {
      isLoggedIn: true // Immer als eingeloggt betrachten
    }
  };
  
  // Original-Code (auskommentiert für späteren Gebrauch)
  /* 
  const session = await getIronSession(req, res, sessionOptions);

  if (!session.isLoggedIn) {
    return {
      props: {
        isLoggedIn: false
      }
    };
  }

  return {
    props: {
      isLoggedIn: true
    }
  };
  */
}

export default function Admin({ isLoggedIn }) {
  // Wenn nicht eingeloggt, zeige Login-Komponente
  if (!isLoggedIn) {
    return <Login />;
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    return getWeekNumber(today);
  });

  const [weekDates, setWeekDates] = useState(() => {
    const today = new Date();
    const { year, week } = getWeekNumber(today);
    return getWeekDates(year, week);
  });

  const [isPublished, setIsPublished] = useState(false);
  
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

  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  const [analyzingMeal, setAnalyzingMeal] = useState(false);

  const [availableMenus, setAvailableMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);

  // Standardpreise als Konstanten
  const DEFAULT_PRICES = {
    meal1: 4.80,
    meal2: 6.80
  };

  // Laden des Menüs für die ausgewählte Woche
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/menu/${selectedWeek.year}/${selectedWeek.week}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const menu = data.data;
          setWeekMenu(menu.days || []);
          setContactInfo(menu.contactInfo || { phone: '', postcode: '' });
          setVacationData(menu.vacation || {
            isOnVacation: false,
            startDate: '',
            endDate: '',
            message: 'Wir befinden uns im Urlaub.'
          });
          setIsPublished(menu.isPublished || false);
        } else {
          // Wenn kein Menü gefunden wurde, setze Standardwerte
          setWeekMenu([
            { day: 'Montag', meals: [{ name: '', price: 4.80, isAction: false }, { name: '', price: 6.80, isAction: false }] },
            { day: 'Dienstag', meals: [{ name: '', price: 4.80, isAction: false }, { name: '', price: 6.80, isAction: false }] },
            { day: 'Mittwoch', meals: [{ name: '', price: 4.80, isAction: false }, { name: '', price: 6.80, isAction: false }] },
            { day: 'Donnerstag', meals: [{ name: '', price: 4.80, isAction: false }, { name: '', price: 6.80, isAction: false }] },
            { day: 'Freitag', meals: [{ name: '', price: 4.80, isAction: false }, { name: '', price: 6.80, isAction: false }] }
          ]);
          setIsPublished(false);
        }
      } catch (error) {
        console.error('Fehler beim Laden des Menüs:', error);
        setError('Fehler beim Laden des Menüs');
      } finally {
        setLoading(false);
      }
    };

    // Aktualisiere weekDates wenn sich die ausgewählte Woche ändert
    const dates = getWeekDates(selectedWeek.year, selectedWeek.week);
    setWeekDates(dates);
    
    // Hole Feiertage für die neue Woche
    const weekHolidays = getHolidaysForWeek(dates.start);
    setHolidays(weekHolidays);

    fetchMenu();
  }, [selectedWeek]);

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

  // Angepasster handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const menuData = {
      year: selectedWeek.year,
      weekNumber: selectedWeek.week,
      weekStart: weekDates.start,
      weekEnd: weekDates.end,
      isPublished,
      days: weekMenu,
      contactInfo,
      vacation: vacationData
    };

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

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSend = async () => {
    try {
      setIsSending(true);
      setEmailStatus('Speichere Speiseplan...');

      // Zuerst den Speiseplan speichern (gleiche Logik wie handleSave)
      const menuData = {
        year: selectedWeek.year,
        weekNumber: selectedWeek.week,
        weekStart: weekDates.start,
        weekEnd: weekDates.end,
        days: weekMenu,
        contactInfo: contactInfo,
        vacation: vacationData,
        createdAt: new Date()
      };

      const saveResponse = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuData)
      });

      if (!saveResponse.ok) {
        throw new Error('Fehler beim Speichern des Speiseplans');
      }

      setEmailStatus('Speiseplan gespeichert. Starte E-Mail-Versand...');

      // Dann E-Mail versenden - übergebe jetzt auch die Wochennummer und das Jahr
      const emailResponse = await fetch('/api/send-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekStart: weekDates.start,
          weekEnd: weekDates.end,
          weekNumber: selectedWeek.week,
          year: selectedWeek.year
        })
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.message || 'E-Mail-Versand fehlgeschlagen');
      }

      const emailResult = await emailResponse.json();
      setEmailStatus(`E-Mail wurde erfolgreich versendet! (Message ID: ${emailResult.messageId})`);

    } catch (error) {
      console.error('Fehler:', error);
      setEmailStatus(`Fehler: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const analyzeMeal = async (mealName) => {
    try {
      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mealName }),
      });
      
      if (!response.ok) throw new Error('Analyse fehlgeschlagen');
      
      const data = await response.json();
      console.log('API Antwort:', data);
      return data.icon;
    } catch (error) {
      console.error('Fehler bei der Analyse:', error);
      return null;
    }
  };

  // Separate Analyse-Funktion für blur Event
  const handleMealBlur = async (dayIndex, mealIndex, value) => {
    if (!value.trim()) return; // Keine Analyse für leere Eingaben
    
    setAnalyzingMeal(true);
    try {
      console.log('Analysiere Gericht:', value);
      const icon = await analyzeMeal(value);
      console.log('Erhaltenes Icon:', icon);
      
      setWeekMenu(prevMenu => {
        const newMenu = [...prevMenu];
        newMenu[dayIndex].meals[mealIndex] = {
          ...newMenu[dayIndex].meals[mealIndex],
          icon: icon
        };
        console.log('Aktualisiertes Menü:', newMenu[dayIndex].meals[mealIndex]);
        return newMenu;
      });
    } catch (error) {
      console.error('Fehler bei der Analyse:', error);
    } finally {
      setAnalyzingMeal(false);
    }
  };

  // Vereinfachte handleMealChange Funktion (nur Wertänderung)
  const handleMealChange = (dayIndex, mealIndex, field, value) => {
    setWeekMenu(prevMenu => {
      const newMenu = [...prevMenu];
      newMenu[dayIndex].meals[mealIndex] = {
        ...newMenu[dayIndex].meals[mealIndex],
        [field]: value
      };
      return newMenu;
    });
  };

  // Laden der verfügbaren Menüs
  useEffect(() => {
    const fetchAvailableMenus = async () => {
      try {
        const response = await fetch('/api/menus/list');
        const data = await response.json();
        console.log('Verfügbare Menüs:', data); // Debug Log
        if (data.success) {
          setAvailableMenus(data.menus);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Menüliste:', error);
      }
    };

    fetchAvailableMenus();
  }, []); // Leere Dependency Array = nur beim ersten Render ausführen

  // Funktion zum Generieren der Kalenderwochenoptionen
  const getWeekOptions = () => {
    const options = [];
    const currentDate = new Date();
    const { year: currentYear, week: currentWeek } = getWeekNumber(currentDate);
    
    // Berechne die letzten 8 Wochen und die nächsten 4 Wochen
    for (let weekOffset = -8; weekOffset <= 4; weekOffset++) {
      let year = currentYear;
      let week = currentWeek + weekOffset;
      
      // Wenn die Woche unter 1 geht, setze auf die letzten Wochen des Vorjahres
      if (week < 1) {
        year--;
        week = 52 + week; // week ist negativ, daher addieren wir
      }
      
      // Wenn die Woche über 52 geht, setze auf Woche 1 des nächsten Jahres
      if (week > 52) {
        year++;
        week = week - 52;
      }
      
      const dates = getWeekDates(year, week);
      options.push({
        year,
        week,
        label: `KW ${week} (${formatDate(dates.start)} - ${formatDate(dates.end)})`,
        isPast: weekOffset < 0,
        isCurrent: weekOffset === 0,
        isFuture: weekOffset > 0
      });
    }
    
    return options;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-8">Menü-Verwaltung</h1>

        {/* Wochenauswahl */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kalenderwoche auswählen
              </label>
              <select
                value={`${selectedWeek.year}-${selectedWeek.week}`}
                onChange={(e) => {
                  const [year, week] = e.target.value.split('-').map(Number);
                  setSelectedWeek({ year, week });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {getWeekOptions().map((option) => (
                  <option 
                    key={`${option.year}-${option.week}`} 
                    value={`${option.year}-${option.week}`}
                  >
                    {option.isPast ? '◀ ' : option.isCurrent ? '▶ ' : '▶▶ '}{option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-4 flex items-center">
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span>Veröffentlichen</span>
              </label>
            </div>
          </div>
        </div>

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
              {vacationData.isOnVacation ? '🌴' : ''}
            </span>
            Urlaubsmodus {vacationData.isOnVacation ? 'aktiv' : 'inaktiv'}
          </button>
        </div>

        {/* Urlaubs-Einstellungen */}
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
                placeholder="z.B.: Wir machen Betriebsferien 🌴"
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

          {/* Menu Items */}
          {weekMenu.map((day, dayIndex) => {
            const currentDate = new Date(weekDates.start);
            currentDate.setDate(currentDate.getDate() + dayIndex);
            const dateStr = currentDate.toISOString().split('T')[0];
            const holidayInfo = holidays[dateStr];

            return (
              <div key={dayIndex} className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="flex flex-col gap-4">
                  {/* Tag und Schließtag-Checkbox */}
                  <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-xl font-semibold">{day.day}</h2>
                    
                    <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={holidayInfo?.type === 'holiday' && holidayInfo?.isLegalHolidayInLowerSaxony ? true : day.isClosed || false}
                        onChange={(e) => handleClosedChange(dayIndex, e.target.checked)}
                        disabled={holidayInfo?.type === 'holiday' && holidayInfo?.isLegalHolidayInLowerSaxony}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span>Als Schließtag markieren</span>
                    </label>
                  </div>

                  {/* Feiertags-Badge wenn vorhanden */}
                  {holidayInfo && (
                    <div className={`px-4 py-2 rounded-lg self-start ${
                      holidayInfo.type === 'holiday' && holidayInfo.isLegalHolidayInLowerSaxony
                        ? 'bg-red-100 text-red-800' 
                        : `bg-${holidayInfo.color}-100 text-${holidayInfo.color}-800`
                    }`}>
                      {holidayInfo.name}
                    </div>
                  )}

                  {/* Mahlzeiten oder Geschlossen-Nachricht */}
                  {(holidayInfo?.type === 'holiday' && holidayInfo?.isLegalHolidayInLowerSaxony) ? (
                    <div className="p-4 bg-gray-50 rounded text-gray-600 text-center">
                      An gesetzlichen Feiertagen bleibt die Kantine geschlossen
                    </div>
                  ) : day.isClosed ? (
                    <div className="p-4 bg-gray-50 rounded text-gray-600 text-center">
                      {day.closedReason || 'Kantine geschlossen'}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {day.meals.map((meal, mealIndex) => (
                        <div key={mealIndex} className="mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={meal.name}
                                onChange={(e) => handleMealChange(dayIndex, mealIndex, 'name', e.target.value)}
                                onBlur={(e) => handleMealBlur(dayIndex, mealIndex, e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Gericht eingeben..."
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              {meal.icon && <span className="text-2xl">{meal.icon}</span>}
                              <input
                                type="number"
                                value={meal.price}
                                onChange={(e) => updateMeal(dayIndex, mealIndex, 'price', e.target.value)}
                                className="w-24 p-2 border rounded"
                                step="0.1"
                                placeholder="Preis"
                              />
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={meal.isAction}
                                  onChange={(e) => handleActionChange(dayIndex, mealIndex, 'isAction', e.target.checked)}
                                  className="rounded border-gray-300"
                                />
                                <span>Aktionsessen</span>
                              </label>
                            </div>
                          </div>
                          {meal.isAction && (
                            <input
                              type="text"
                              value={meal.actionNote}
                              onChange={(e) => handleActionChange(dayIndex, mealIndex, 'actionNote', e.target.value)}
                              className="mt-2 w-full p-2 border rounded bg-yellow-50"
                              placeholder="Aktionsnotiz eingeben..."
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
          
          {/* Buttons am Ende der Seite */}
          <div className="mt-8 flex gap-4 justify-end">
            <button
              onClick={handleEmailSend}
              disabled={isSending}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isSending ? 'Wird versendet...' : 'Per E-Mail versenden'}
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700`}
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
          </div>
        </form>

        {/* Status-Meldung */}
        <div className="mt-2 text-sm">
          {emailStatus && <p className="text-gray-600">{emailStatus}</p>}
        </div>
      </div>
    </div>
  );
}
