import { useState, useEffect } from 'react';
import { Save, Loader, AlertCircle } from 'lucide-react';
import { getHolidaysForWeek } from '../lib/holidays';
import { formatDate, getWeekNumber, getWeekDates } from '../lib/dateUtils';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DayMenu from '../components/DayMenu';
import ContactInfo from '../components/ContactInfo';
import VacationToggle from '../components/VacationToggle';
import BatchStatus from '../components/BatchStatus';

export default function Admin() {
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
  const [menuId, setMenuId] = useState(null);
  const [showBatchStatus, setShowBatchStatus] = useState(false);

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
      setEmailStatus('Speichere Menüdaten und bereite E-Mail-Versand vor...');

      // Speichere zuerst die Menüdaten
      const menuData = {
        year: selectedWeek.year,
        weekNumber: selectedWeek.week,
        weekStart: weekDates.start,
        weekEnd: weekDates.end,
        days: weekMenu,
        contactInfo: contactInfo,
        vacation: vacationData
      };

      // Speichere die Daten über die API
      const saveResponse = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuData)
      });

      if (!saveResponse.ok) {
        throw new Error('Fehler beim Speichern der Menüdaten');
      }

      const saveResult = await saveResponse.json();
      
      // Setze die menuId für die BatchStatus-Komponente
      if (saveResult.menuId) {
        setMenuId(saveResult.menuId);
      }
      
      // Sende die E-Mail mit den Menüdaten
      setEmailStatus('Starte E-Mail-Versand...');
      
      const emailResponse = await fetch('/api/send-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menu: {
            days: weekMenu,
            contactInfo: contactInfo,
            weekStart: weekDates.start,
            weekEnd: weekDates.end
          },
          year: selectedWeek.year,
          weekNumber: selectedWeek.week,
          menuId: saveResult.menuId // Verwende die menuId aus dem Speichern
        })
      });

      if (!emailResponse.ok) {
        let errorMessage = 'Fehler beim Versenden der E-Mail';
        try {
          const errorData = await emailResponse.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Ignoriere Fehler beim Parsen der JSON-Antwort
        }
        throw new Error(errorMessage);
      }

      const emailResult = await emailResponse.json();
      
      // Aktualisiere die menuId, falls sie in der E-Mail-Antwort enthalten ist
      if (emailResult.menuId) {
        setMenuId(emailResult.menuId);
      }
      
      if (emailResult.success) {
        if (emailResult.needsMoreRuns) {
          // Mehrere Durchläufe erforderlich
          setEmailStatus(`E-Mail-Versand gestartet: Batch ${emailResult.currentBatch}/${emailResult.totalBatches} wird versendet. Der Versand wird im Hintergrund fortgesetzt. Sie erhalten eine Bestätigungs-E-Mail, wenn alle ${emailResult.totalBatches} Batches versendet wurden.`);
          setShowBatchStatus(true);
        } else if (emailResult.totalBatches > 1) {
          // Mehrere Batches, aber nur ein Durchlauf
          setEmailStatus(`E-Mail-Versand erfolgreich: ${emailResult.totalBatches} Batches werden versendet. Sie erhalten eine Bestätigungs-E-Mail, wenn der Versand abgeschlossen ist.`);
        } else {
          // Einzelner Empfänger oder einzelner Batch
          setEmailStatus('E-Mail wurde erfolgreich versendet!');
        }
      } else {
        setEmailStatus(`Fehler beim E-Mail-Versand: ${emailResult.message}`);
      }
    } catch (error) {
      console.error('Fehler beim E-Mail-Versand:', error);
      setEmailStatus(`Fehler: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Callback-Funktion für den Abschluss des Batch-Prozesses
  const handleBatchComplete = () => {
    setEmailStatus('E-Mail-Versand abgeschlossen! Alle Batches wurden erfolgreich versendet.');
    setShowBatchStatus(false);
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
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Admin - Speiseplan</title>
      </Head>
      
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Menü-Verwaltung</h1>
        </div>

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

        {/* Urlaubs-Toggle Komponente */}
        <VacationToggle 
          vacationData={vacationData} 
          setVacationData={setVacationData} 
        />

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

          {/* Contact Info Komponente */}
          <ContactInfo 
            contactInfo={contactInfo} 
            setContactInfo={setContactInfo} 
          />

          {/* Menu Items */}
          {weekMenu.map((day, dayIndex) => {
            const currentDate = new Date(weekDates.start);
            currentDate.setDate(currentDate.getDate() + dayIndex);
            const dateStr = currentDate.toISOString().split('T')[0];
            const holidayInfo = holidays[dateStr];

            return (
              <DayMenu
                key={dayIndex}
                day={day}
                dayIndex={dayIndex}
                updateMeal={updateMeal}
                removeMeal={removeMeal}
                addMeal={addMeal}
                handleActionChange={handleActionChange}
                handleClosedChange={handleClosedChange}
                handleClosedReasonChange={handleClosedReasonChange}
                handleMealBlur={handleMealBlur}
                handleMealChange={handleMealChange}
                holidayInfo={holidayInfo}
              />
            );
          })}
          
          {/* Buttons am Ende der Seite */}
          <div className="mt-8 flex gap-4 justify-end">
            <button
              onClick={handleEmailSend}
              disabled={isSending}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              type="button"
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

        {/* Status-Meldung für E-Mail-Versand */}
        {emailStatus && (
          <div className="mt-4 p-4 bg-blue-100 rounded-lg">
            <p className="text-blue-800">{emailStatus}</p>
          </div>
        )}
        
        {/* Batch-Status-Anzeige */}
        {showBatchStatus && menuId && (
          <BatchStatus 
            menuId={menuId} 
            onComplete={handleBatchComplete} 
          />
        )}
      </div>
    </div>
  );
}
