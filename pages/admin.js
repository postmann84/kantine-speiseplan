import { useState, useEffect, useCallback } from 'react';
import { Save, Loader, AlertCircle, Printer, Lightbulb } from 'lucide-react';
import { getHolidaysForWeek } from '../lib/holidays';
import { formatDate, getWeekNumber, getWeekDates } from '../lib/dateUtils';
import { ALLERGENS, ADDITIVES, formatCodesInline } from '../lib/allergenTaxonomy';

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
        { name: '', price: 5.00, isAction: false, actionNote: '' },
        { name: '', price: 7.00, isAction: false, actionNote: '' }
      ] 
    },
    { 
      day: 'Dienstag', 
      meals: [
        { name: '', price: 5.00, isAction: false, actionNote: '' },
        { name: '', price: 7.00, isAction: false, actionNote: '' }
      ] 
    },
    { 
      day: 'Mittwoch', 
      meals: [
        { name: '', price: 5.00, isAction: false, actionNote: '' },
        { name: '', price: 7.00, isAction: false, actionNote: '' }
      ] 
    },
    { 
      day: 'Donnerstag', 
      meals: [
        { name: '', price: 5.00, isAction: false, actionNote: '' },
        { name: '', price: 7.00, isAction: false, actionNote: '' }
      ] 
    },
    { 
      day: 'Freitag', 
      meals: [
        { name: '', price: 5.00, isAction: false, actionNote: '' },
        { name: '', price: 7.00, isAction: false, actionNote: '' }
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


  const [analyzingMeal, setAnalyzingMeal] = useState(false);

  const [allergenPopup, setAllergenPopup] = useState({
    open: false,
    mealName: '',
    allergens: [],
    additives: []
  });

  const [availableMenus, setAvailableMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);

  // Ideen-Modal State
  const [ideenModal, setIdeenModal] = useState({
    open: false,
    dayIndex: null,
    mealIndex: null,
    selectedCategory: null,
    searchTerm: ''
  });
  const [mealSuggestions, setMealSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Lade Gerichts-Vorschläge aus der DB
  const fetchMealSuggestions = useCallback(async () => {
    if (mealSuggestions) return; // Bereits geladen
    setLoadingSuggestions(true);
    try {
      const response = await fetch('/api/meal-suggestions');
      const data = await response.json();
      if (data.success) {
        setMealSuggestions(data.categories);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Vorschläge:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [mealSuggestions]);

  // Ideen-Modal öffnen
  const openIdeenModal = (dayIndex, mealIndex) => {
    setIdeenModal({
      open: true,
      dayIndex,
      mealIndex,
      selectedCategory: null,
      searchTerm: ''
    });
    fetchMealSuggestions();
  };

  // Gericht aus Modal übernehmen
  const selectSuggestion = (meal) => {
    const { dayIndex, mealIndex } = ideenModal;
    setWeekMenu(prevMenu => {
      const newMenu = [...prevMenu];
      newMenu[dayIndex].meals[mealIndex] = {
        ...newMenu[dayIndex].meals[mealIndex],
        name: meal.name,
        price: meal.price || newMenu[dayIndex].meals[mealIndex].price,
        icon: meal.icon
      };
      return newMenu;
    });
    setIdeenModal(prev => ({ ...prev, open: false }));
  };

  // Standardpreise als Konstanten
  const DEFAULT_PRICES = {
    meal1: 5.00,
    meal2: 7.00
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
          console.log('Geladenes Menü:', menu); // Debug Log
          console.log('isPublished Wert:', menu.isPublished); // Debug Log
          setWeekMenu(menu.days || []);
          setContactInfo(menu.contactInfo || { phone: '', postcode: '' });
          setVacationData(menu.vacation || {
            isOnVacation: false,
            startDate: '',
            endDate: '',
            message: 'Wir befinden uns im Urlaub.'
          });
          // Alte Speisepläne ohne isPublished Feld als "unveröffentlicht" behandeln
          setIsPublished(menu.isPublished === true);
        } else {
          console.log('Kein Menü gefunden für:', selectedWeek.year, selectedWeek.week); // Debug Log
          console.log('API Response:', data); // Debug Log
          // Wenn kein Menü gefunden wurde, setze Standardwerte
          setWeekMenu([
            { day: 'Montag', meals: [{ name: '', price: 5.00, isAction: false }, { name: '', price: 7.00, isAction: false }] },
            { day: 'Dienstag', meals: [{ name: '', price: 5.00, isAction: false }, { name: '', price: 7.00, isAction: false }] },
            { day: 'Mittwoch', meals: [{ name: '', price: 5.00, isAction: false }, { name: '', price: 7.00, isAction: false }] },
            { day: 'Donnerstag', meals: [{ name: '', price: 5.00, isAction: false }, { name: '', price: 7.00, isAction: false }] },
            { day: 'Freitag', meals: [{ name: '', price: 5.00, isAction: false }, { name: '', price: 7.00, isAction: false }] }
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

  // Angepasster handleSubmit mit Auto-Analyse für fehlende Kennzeichnungen
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // NEUE FUNKTION: Analysiere alle Gerichte ohne Kennzeichnungen VOR dem Speichern
    const updatedWeekMenu = [...weekMenu];
    let analyzedCount = 0;
    
    for (let dayIndex = 0; dayIndex < updatedWeekMenu.length; dayIndex++) {
      const day = updatedWeekMenu[dayIndex];
      if (day.isClosed) continue;
      
      for (let mealIndex = 0; mealIndex < day.meals.length; mealIndex++) {
        const meal = day.meals[mealIndex];
        
        // Prüfe ob Gericht einen Namen hat aber keine Kennzeichnungen
        const hasName = meal.name && meal.name.trim().length > 0;
        const hasNoAllergens = !meal.allergenCodes || meal.allergenCodes.length === 0;
        const hasNoAdditives = !meal.additiveCodes || meal.additiveCodes.length === 0;
        
        if (hasName && hasNoAllergens && hasNoAdditives) {
          console.log(`🔄 Auto-Analyse für: ${meal.name}`);
          
          try {
            const response = await fetch('/api/analyze-allergens-v2', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mealName: meal.name })
            });
            
            if (response.ok) {
              const result = await response.json();
              updatedWeekMenu[dayIndex].meals[mealIndex].allergenCodes = result.allergens || [];
              updatedWeekMenu[dayIndex].meals[mealIndex].additiveCodes = result.additives || [];
              analyzedCount++;
              console.log(`✅ Auto-Analyse erfolgreich: ${result.allergens.length} Allergene, ${result.additives.length} Zusatzstoffe`);
            }
          } catch (error) {
            console.error('Auto-Analyse fehlgeschlagen für:', meal.name, error);
          }
        }
      }
    }
    
    if (analyzedCount > 0) {
      console.log(`✅ ${analyzedCount} Gerichte automatisch analysiert`);
      setWeekMenu(updatedWeekMenu);
    }

    const menuData = {
      year: selectedWeek.year,
      weekNumber: selectedWeek.week,
      weekStart: weekDates.start,
      weekEnd: weekDates.end,
      isPublished,
      days: updatedWeekMenu,
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
      
      // Zeige Erfolgsmeldung mit Info über Auto-Analysen
      if (analyzedCount > 0) {
        alert(`✅ Speiseplan gespeichert!\n${analyzedCount} Gerichte wurden automatisch mit Allergenen/Zusatzstoffen gekennzeichnet.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Prüfe ob Speiseplan veröffentlicht ist
    if (!isPublished) {
      alert('Der Speiseplan muss veröffentlicht sein, um gedruckt werden zu können.');
      return;
    }

    // Direkt drucken - genau wie auf der Nutzerseite
    window.print();
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

  const analyzeMealAllergens = async (mealName) => {
    try {
      const response = await fetch('/api/analyze-allergens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealName })
      });
      
      if (!response.ok) {
        throw new Error(`Allergen-Analyse fehlgeschlagen: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        allergens: Array.isArray(data.allergens) ? data.allergens : [],
        additives: Array.isArray(data.additives) ? data.additives : [],
        confidence: data.confidence || 0,
        method: data.method || 'unknown'
      };
    } catch (error) {
      console.error('Allergen-Analyse fehlgeschlagen:', error);
      return { 
        allergens: [], 
        additives: [], 
        confidence: 0, 
        method: 'error'
      };
    }
  };

  // Separate Analyse-Funktion für blur Event
  const handleMealBlur = async (dayIndex, mealIndex, value) => {
    if (!value.trim()) return; // Keine Analyse für leere Eingaben
    
    setAnalyzingMeal(true);
    try {
      const [icon, allergenResult] = await Promise.all([
        analyzeMeal(value),
        analyzeMealAllergens(value)
      ]);
      
      setWeekMenu(prevMenu => {
        const newMenu = [...prevMenu];
        newMenu[dayIndex].meals[mealIndex] = {
          ...newMenu[dayIndex].meals[mealIndex],
          icon: icon,
          allergenCodes: allergenResult.allergens,
          additiveCodes: allergenResult.additives
        };
        return newMenu;
      });
      
    } catch (error) {
      console.error('Analyse fehlgeschlagen:', error);
      // Fallback: Wenigstens das Icon setzen
      try {
        const icon = await analyzeMeal(value);
        if (icon) {
          setWeekMenu(prevMenu => {
            const newMenu = [...prevMenu];
            newMenu[dayIndex].meals[mealIndex] = {
              ...newMenu[dayIndex].meals[mealIndex],
              icon: icon
            };
            return newMenu;
          });
        }
      } catch (iconError) {
        console.error('Auch Icon-Analyse fehlgeschlagen:', iconError);
      }
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
      {/* Print-Styles für Admin-Seite */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20pt; 
              font-size: 11pt; 
              line-height: 1.4;
              color: black;
              background: white;
            }
            
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            
            .print-menu-container {
              display: block !important;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 15pt;
            }
            
            .print-title {
              font-size: 18pt;
              font-weight: bold;
              margin-bottom: 10pt;
              border-bottom: 2pt solid black;
              padding-bottom: 6pt;
            }
            
            .print-contact {
              font-size: 10pt;
              margin-bottom: 15pt;
            }
            
            .print-day {
              margin-bottom: 10pt;
              break-inside: avoid;
            }
            
            .print-day-title {
              font-size: 14pt;
              font-weight: bold;
              margin-bottom: 5pt;
              border-bottom: 1pt solid #666;
              padding-bottom: 3pt;
            }
            
            .print-meal {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 3pt;
              padding: 2pt 0;
            }
            
            .print-meal.action {
              background-color: #fff3cd !important;
              padding: 3pt 5pt;
              border-radius: 3pt;
              border: 1pt solid #f59e0b;
            }
            
            .print-meal-name {
              flex: 1;
            }
            
            .print-meal-price {
              min-width: 50pt;
              text-align: right;
              font-weight: bold;
            }
            
            .print-allergen-codes {
              font-size: 8pt;
              color: #666;
              margin-left: 3pt;
            }
            
            .print-action-badge {
              font-size: 8pt;
              background-color: #fef3c7;
              color: #92400e;
              padding: 1pt 3pt;
              border-radius: 2pt;
              margin-left: 5pt;
              border: 0.5pt solid #f59e0b;
            }
            
            .print-footer {
              margin-top: 15pt;
              border-top: 1pt solid black;
              padding-top: 8pt;
              text-align: center;
              font-size: 9pt;
              color: #666;
            }
            
            .print-vacation {
              background-color: #fef3c7 !important;
              border: 2pt solid #f59e0b !important;
              padding: 10pt;
              margin-bottom: 15pt;
              text-align: center;
              border-radius: 5pt;
            }
            
            .print-closed {
              font-style: italic;
              color: #666;
              font-size: 10pt;
            }
          }
        `
      }} />
      
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8 no-print">
          <h1 className="text-2xl font-bold">Menü-Verwaltung</h1>
        </div>

        {/* Wochenauswahl */}
        <div className="bg-white p-6 rounded-lg shadow mb-6 no-print">
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
        <div className="mb-4 flex items-center justify-end no-print">
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
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 no-print">
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

        <form onSubmit={handleSubmit} className="space-y-6 no-print">
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
                            {/* Ideen-Button */}
                            <button
                              type="button"
                              data-testid={`idea-btn-${dayIndex}-${mealIndex}`}
                              onClick={() => openIdeenModal(dayIndex, mealIndex)}
                              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 border border-amber-200 transition-colors"
                              title="Gerichts-Ideen"
                            >
                              <Lightbulb className="w-4 h-4" />
                            </button>
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={meal.name}
                                onChange={(e) => handleMealChange(dayIndex, mealIndex, 'name', e.target.value)}
                                onBlur={(e) => handleMealBlur(dayIndex, mealIndex, e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="Gericht eingeben..."
                              />
                              
                              {/* Allergen-Anzeige mit Status-Indikator */}
                              {meal.name && meal.name.trim().length > 0 && (
                                <div className="absolute right-2 top-1 flex items-center gap-1">
                                  {/* Warnung wenn keine Kennzeichnungen */}
                                  {(!meal.allergenCodes || meal.allergenCodes.length === 0) && 
                                   (!meal.additiveCodes || meal.additiveCodes.length === 0) && (
                                    <span 
                                      className="text-xs px-1 py-0.5 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded"
                                      title="⚠️ Keine Kennzeichnungen - wird beim Speichern automatisch analysiert"
                                    >
                                      ⚠️
                                    </span>
                                  )}
                                  
                                  {/* Codes anzeigen wenn vorhanden */}
                                  {(meal.allergenCodes?.length > 0 || meal.additiveCodes?.length > 0) && (
                                    <button
                                      type="button"
                                      onClick={() => setAllergenPopup({
                                        open: true,
                                        mealName: meal.name,
                                        allergens: meal.allergenCodes || [],
                                        additives: meal.additiveCodes || []
                                      })}
                                      className="text-xs px-1 py-0.5 bg-green-100 text-green-800 border border-green-300 rounded hover:bg-green-200"
                                      title="✓ Gekennzeichnet - Klicken zum Anzeigen"
                                      style={{ fontSize: '10px', lineHeight: '1' }}
                                    >
                                      <sup>{formatCodesInline(meal.allergenCodes, meal.additiveCodes)}</sup>
                                    </button>
                                  )}
                                  
                                  {/* Manuelle Re-Analyse Button */}
                                  {meal.name && meal.name.trim().length > 0 && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        setAnalyzingMeal(true);
                                        try {
                                          const response = await fetch('/api/analyze-allergens-v2', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ mealName: meal.name })
                                          });
                                          
                                          if (response.ok) {
                                            const result = await response.json();
                                            setWeekMenu(prevMenu => {
                                              const newMenu = [...prevMenu];
                                              newMenu[dayIndex].meals[mealIndex] = {
                                                ...newMenu[dayIndex].meals[mealIndex],
                                                allergenCodes: result.allergens || [],
                                                additiveCodes: result.additives || []
                                              };
                                              return newMenu;
                                            });
                                            alert(`✅ ${result.allergens?.length || 0} Allergene und ${result.additives?.length || 0} Zusatzstoffe erkannt`);
                                          }
                                        } catch (error) {
                                          alert('❌ Analyse fehlgeschlagen');
                                        } finally {
                                          setAnalyzingMeal(false);
                                        }
                                      }}
                                      className="text-xs px-1 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 rounded hover:bg-blue-200"
                                      title="Erneut analysieren"
                                      disabled={analyzingMeal}
                                    >
                                      🔄
                                    </button>
                                  )}
                                </div>
                              )}
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
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('Dieses Gericht wirklich löschen?')) {
                                    removeMeal(dayIndex, mealIndex);
                                  }
                                }}
                                className="ml-2 px-2 py-1 text-sm text-red-600 hover:text-red-800 border border-red-200 rounded hover:bg-red-50"
                                title="Gericht löschen"
                              >
                                Löschen
                              </button>
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
              onClick={handlePrint}
              disabled={!isPublished}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 flex items-center gap-2"
              title={!isPublished ? "Speiseplan muss veröffentlicht sein" : "Speiseplan drucken"}
            >
              <Printer className="w-4 h-4" />
              Drucken
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


        {/* Allergen/Addon Popup */}
        {allergenPopup.open && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Allergene & Zusatzstoffe</h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setAllergenPopup(prev => ({ ...prev, open: false }))}
                >✕</button>
        </div>
              <div className="text-sm text-gray-700 mb-3">
                <div className="font-medium">{allergenPopup.mealName}</div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs uppercase text-gray-500 mb-1">Allergene</div>
                  {allergenPopup.allergens?.length > 0 ? (
                    <ul className="list-disc list-inside text-sm">
                      {allergenPopup.allergens.map((code) => (
                        <li key={`a-${code}`}>
                          <span className="font-mono mr-1">{code}</span>
                          {ALLERGENS[code] || ''}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-500">Keine Allergene erkannt</div>
                  )}
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-500 mb-1">Zusatzstoffe</div>
                  {allergenPopup.additives?.length > 0 ? (
                    <ul className="list-disc list-inside text-sm">
                      {allergenPopup.additives.map((code) => (
                        <li key={`z-${code}`}>
                          <span className="font-mono mr-1">{code}</span>
                          {ADDITIVES[code] || ''}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-500">Keine Zusatzstoffe erkannt</div>
                  )}
                </div>
              </div>

              
              <div className="mt-4 text-right">
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => setAllergenPopup(prev => ({ ...prev, open: false }))}
                >OK</button>
              </div>
            </div>
          </div>
        )}

        {/* Ideen-Modal für Gerichts-Vorschläge */}
        {ideenModal.open && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" data-testid="idea-modal-overlay">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" data-testid="idea-modal">
              {/* Modal Header */}
              <div className="p-5 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Gerichts-Ideen
                  </h3>
                  <button
                    data-testid="idea-modal-close"
                    className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                    onClick={() => setIdeenModal(prev => ({ ...prev, open: false }))}
                  >✕</button>
                </div>

                {/* Kategorie-Buttons */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: '🐷', label: 'Schwein' },
                    { icon: '🐔', label: 'Huhn' },
                    { icon: '🥗', label: 'Vegetarisch' },
                    { icon: '🐄', label: 'Rind' },
                    { icon: '🐟', label: 'Fisch' },
                    { icon: '🥣', label: 'Suppe/Eintopf' },
                    { icon: '🍝', label: 'Pasta' },
                  ].map(cat => {
                    const isActive = ideenModal.selectedCategory === cat.icon;
                    const count = mealSuggestions?.[cat.icon]?.meals?.length || 0;
                    return (
                      <button
                        key={cat.icon}
                        type="button"
                        data-testid={`idea-cat-${cat.label.toLowerCase()}`}
                        onClick={() => setIdeenModal(prev => ({
                          ...prev,
                          selectedCategory: prev.selectedCategory === cat.icon ? null : cat.icon,
                          searchTerm: ''
                        }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                          isActive
                            ? 'bg-amber-100 text-amber-800 border-2 border-amber-400 shadow-sm'
                            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-lg">{cat.icon}</span>
                        <span>{cat.label}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-amber-200 text-amber-900' : 'bg-gray-200 text-gray-600'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Suchfeld */}
                {ideenModal.selectedCategory && (
                  <div className="mt-3">
                    <input
                      type="text"
                      data-testid="idea-search"
                      placeholder="Gerichte filtern..."
                      value={ideenModal.searchTerm}
                      onChange={(e) => setIdeenModal(prev => ({ ...prev, searchTerm: e.target.value }))}
                      className="w-full p-2 border rounded-lg text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4">
                {loadingSuggestions ? (
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Lade Vorschläge...
                  </div>
                ) : !ideenModal.selectedCategory ? (
                  <div className="text-center py-12 text-gray-400">
                    <span className="text-4xl block mb-3">☝️</span>
                    <p>Bitte wählen Sie oben eine Kategorie aus</p>
                  </div>
                ) : (
                  (() => {
                    const catData = mealSuggestions?.[ideenModal.selectedCategory];
                    if (!catData || catData.meals.length === 0) {
                      return (
                        <div className="text-center py-12 text-gray-400">
                          Keine Gerichte in dieser Kategorie
                        </div>
                      );
                    }

                    const filtered = ideenModal.searchTerm
                      ? catData.meals.filter(m =>
                          m.name.toLowerCase().includes(ideenModal.searchTerm.toLowerCase())
                        )
                      : catData.meals;

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-400">
                          Kein Gericht passt zum Suchbegriff
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-1">
                        {filtered.map((meal, idx) => (
                          <button
                            key={idx}
                            type="button"
                            data-testid={`idea-meal-${idx}`}
                            onClick={() => selectSuggestion(meal)}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors group flex items-center justify-between gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-800 group-hover:text-amber-900 truncate">
                                {meal.name}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-3">
                                <span>{meal.count}x serviert</span>
                                {meal.weeksAgo !== null && (
                                  <span>
                                    zuletzt vor {meal.weeksAgo === 0 ? 'dieser Woche' : meal.weeksAgo === 1 ? '1 Woche' : `${meal.weeksAgo} Wochen`}
                                    {meal.lastServedWeek && ` (KW ${meal.lastServedWeek}/${meal.lastServedYear})`}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-xs text-gray-400 group-hover:text-amber-600">
                              {meal.price?.toFixed(2)} €
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 border-t bg-gray-50 rounded-b-xl text-right">
                <button
                  type="button"
                  data-testid="idea-modal-cancel"
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => setIdeenModal(prev => ({ ...prev, open: false }))}
                >Abbrechen</button>
              </div>
            </div>
          </div>
        )}

        {/* Versteckter Druckinhalt - nur beim Drucken sichtbar */}
        <div className="print-only" style={{ display: 'none' }}>
          <div className="print-header">
            <div className="print-title">Betriebskantine</div>
            <div className="print-contact">
              <div><strong>Telefon:</strong> {contactInfo?.phone || ''}</div>
              <div>Für Postfremde erhöht sich der Preis um {contactInfo?.postcode || '0.50'} €</div>
            </div>
          </div>

          {vacationData?.isOnVacation ? (
            <div className="print-vacation">
              <div style={{ fontSize: '14pt', color: '#92400e', fontWeight: 'bold', marginBottom: '5pt' }}>
                🌴 {vacationData.message} 🌴
              </div>
              {vacationData.startDate && vacationData.endDate && (
                <div style={{ fontSize: '10pt', color: '#92400e' }}>
                  Vom {new Date(vacationData.startDate).toLocaleDateString('de-DE')} bis {new Date(vacationData.endDate).toLocaleDateString('de-DE')}
                </div>
              )}
            </div>
          ) : (
            <div>
              {weekMenu?.map((day, index) => {
                const currentDate = new Date(weekDates.start);
                currentDate.setDate(currentDate.getDate() + index);
                
                return (
                  <div key={index} className="print-day">
                    <div className="print-day-title">
                      {day.day} ({currentDate.toLocaleDateString('de-DE')})
                    </div>
                    
                    {day.isClosed ? (
                      <div className="print-closed">
                        {day.closedReason || 'Heute bleibt unsere Kantine geschlossen.'}
                      </div>
                    ) : (
                      <div>
                        {day.meals?.map((meal, mealIndex) => (
                          <div 
                            key={mealIndex} 
                            className={`print-meal ${meal.isAction ? 'action' : ''}`}
                          >
                            <div className="print-meal-name">
                              {meal.name}
                              {(meal.allergenCodes?.length > 0 || meal.additiveCodes?.length > 0) && (
                                <sup className="print-allergen-codes">
                                  {formatCodesInline(meal.allergenCodes, meal.additiveCodes)}
                                </sup>
                              )}
                              {meal.isAction && (
                                <span className="print-action-badge">Aktionsessen</span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4pt' }}>
                              {meal.icon && <span style={{ fontSize: '12pt' }}>{meal.icon}</span>}
                              <span className="print-meal-price">{meal.price.toFixed(2)} €</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="print-footer">
            <div>Bei Fragen zu Inhaltsstoffen und Allergenen kontaktieren Sie uns bitte unter: {contactInfo?.phone || ''}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
