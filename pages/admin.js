import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Save, Loader, AlertCircle, Printer, Lightbulb, Users, Clock, Download, Trash2, Plus, X, LogOut } from 'lucide-react';
import { getHolidaysForWeek } from '../lib/holidays';
import { formatDate, getWeekNumber, getWeekDates } from '../lib/dateUtils';
import { ALLERGENS, ADDITIVES, formatCodesInline } from '../lib/allergenTaxonomy';

export default function Admin() {
  const router = useRouter();
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

  // Personal- & Stundenzettel-Modal
  const [personalModalOpen, setPersonalModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [payrollSettings, setPayrollSettings] = useState({
    minimumWage: 13.90,
    monthlyLimit: 603.00,
    openingStart: '07:00',
    openingEnd: '14:00',
    breakMinutes: 0,
    fruehStart: '07:00', fruehEnd: '11:00',
    spaetStart: '11:00', spaetEnd: '14:00',
    ganztagsStart: '07:00', ganztagsEnd: '13:30'
  });
  const [empForm, setEmpForm] = useState({ _id: null, firstName: '', lastName: '', personnelNumber: '', shift: 'ganztags' });
  const [tsYear, setTsYear] = useState(() => new Date().getFullYear());
  const [tsMonth, setTsMonth] = useState(() => new Date().getMonth() + 1);
  const [tsData, setTsData] = useState(null);
  const [tsLoading, setTsLoading] = useState(false);
  const [personalSaving, setPersonalSaving] = useState(false);
  const [pdfLogo, setPdfLogo] = useState(null);
  const [yearDownloading, setYearDownloading] = useState(null);

  const MONTH_NAMES = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  // Daten für das Personal-Modal laden
  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.success) setEmployees(data.employees);
    } catch (err) {
      console.error('Fehler beim Laden der Mitarbeiter:', err);
    }
  }, []);

  const fetchPayrollSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/payroll-settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setPayrollSettings({
          minimumWage: data.settings.minimumWage,
          monthlyLimit: data.settings.monthlyLimit,
          openingStart: data.settings.openingStart || '07:00',
          openingEnd: data.settings.openingEnd || '14:00',
          breakMinutes: data.settings.breakMinutes || 0,
          fruehStart: data.settings.fruehStart || '07:00',
          fruehEnd: data.settings.fruehEnd || '11:00',
          spaetStart: data.settings.spaetStart || '11:00',
          spaetEnd: data.settings.spaetEnd || '14:00',
          ganztagsStart: data.settings.ganztagsStart || '07:00',
          ganztagsEnd: data.settings.ganztagsEnd || '13:30'
        });
      }
    } catch (err) {
      console.error('Fehler beim Laden der Lohn-Einstellungen:', err);
    }
  }, []);

  const fetchTimesheet = useCallback(async (year, month) => {
    setTsLoading(true);
    try {
      const res = await fetch(`/api/timesheet?year=${year}&month=${month}`);
      const data = await res.json();
      if (data.success) setTsData(data);
      else setTsData(null);
    } catch (err) {
      console.error('Fehler beim Laden des Stundenzettels:', err);
      setTsData(null);
    } finally {
      setTsLoading(false);
    }
  }, []);

  const openPersonalModal = () => {
    setPersonalModalOpen(true);
    fetchEmployees();
    fetchPayrollSettings();
    fetchTimesheet(tsYear, tsMonth);
    // Logo einmalig für die PDF-Erzeugung vorladen
    if (!pdfLogo) {
      import('../lib/timesheetPdf').then(({ loadLogoDataUrl }) => {
        loadLogoDataUrl().then((logo) => { if (logo) setPdfLogo(logo); });
      });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) { /* ignore */ }
    router.replace('/login');
  };

  // Mitarbeiter speichern (neu oder bearbeiten)
  const saveEmployee = async () => {
    if (!empForm.firstName.trim()) {
      alert('Bitte mindestens den Vornamen eingeben.');
      return;
    }
    setPersonalSaving(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empForm)
      });
      const data = await res.json();
      if (data.success) {
        setEmpForm({ _id: null, firstName: '', lastName: '', personnelNumber: '', shift: 'ganztags' });
        fetchEmployees();
      } else {
        alert(data.error || 'Fehler beim Speichern');
      }
    } catch (err) {
      console.error(err);
      alert('Fehler beim Speichern des Mitarbeiters');
    } finally {
      setPersonalSaving(false);
    }
  };

  const deleteEmployee = async (id) => {
    if (!confirm('Diesen Mitarbeiter wirklich löschen?')) return;
    try {
      await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const savePayrollSettings = async () => {
    setPersonalSaving(true);
    try {
      const res = await fetch('/api/payroll-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payrollSettings)
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setPayrollSettings({
          minimumWage: data.settings.minimumWage,
          monthlyLimit: data.settings.monthlyLimit,
          openingStart: data.settings.openingStart || '07:00',
          openingEnd: data.settings.openingEnd || '14:00',
          breakMinutes: data.settings.breakMinutes || 0,
          fruehStart: data.settings.fruehStart || '07:00',
          fruehEnd: data.settings.fruehEnd || '11:00',
          spaetStart: data.settings.spaetStart || '11:00',
          spaetEnd: data.settings.spaetEnd || '14:00',
          ganztagsStart: data.settings.ganztagsStart || '07:00',
          ganztagsEnd: data.settings.ganztagsEnd || '13:30'
        });
        alert('Lohn-Einstellungen gespeichert.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPersonalSaving(false);
    }
  };

  // Berechnungen für den Stundenzettel
  const getTimesheetCalc = () => {
    const wage = Number(payrollSettings.minimumWage) || 0;
    const limit = Number(payrollSettings.monthlyLimit) || 0;
    const maxHoursMonth = wage > 0 ? limit / wage : 0;
    const numDays = tsData?.workingDays?.length || 0;
    // Pro-Tag-Stunden auf 2 Nachkommastellen abrunden, damit die Grenze nie überschritten wird
    const hoursPerDay = numDays > 0 ? Math.floor((maxHoursMonth / numDays) * 100) / 100 : 0;
    const totalHours = Math.round(hoursPerDay * numDays * 100) / 100;
    const totalWage = Math.round(totalHours * wage * 100) / 100;
    const weeklyHours = Math.round((totalHours / 4.33) * 100) / 100;
    return { wage, limit, maxHoursMonth, numDays, hoursPerDay, totalHours, totalWage, weeklyHours };
  };

  const addMinutesToTime = (start, hoursDecimal, breakMin = 0) => {
    const [h, m] = (start || '07:00').split(':').map(Number);
    const totalMin = (h * 60) + m + Math.round(hoursDecimal * 60) + Number(breakMin || 0);
    const eh = Math.floor(totalMin / 60) % 24;
    const em = totalMin % 60;
    return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
  };

  // Stundenzettel für einen Mitarbeiter als professionelles PDF herunterladen (aktueller Monat)
  const generateTimesheet = async (employee) => {
    const calc = getTimesheetCalc();
    if (calc.numDays === 0) {
      alert('Für diesen Monat wurden keine Öffnungstage in der Speiseplan-Historie gefunden.');
      return;
    }
    const { downloadMonthPdf, loadLogoDataUrl } = await import('../lib/timesheetPdf');
    const logo = pdfLogo || await loadLogoDataUrl();
    if (logo && !pdfLogo) setPdfLogo(logo);
    downloadMonthPdf({
      employee,
      year: tsYear,
      month: tsMonth,
      workingDays: tsData.workingDays,
      settings: payrollSettings,
      logo
    });
  };

  // Ganzes Jahr als ZIP (je Monat eine PDF-Datei) für einen Mitarbeiter
  const downloadTimesheetYear = async (employee) => {
    setYearDownloading(employee._id);
    try {
      const { downloadYearZip, loadLogoDataUrl } = await import('../lib/timesheetPdf');
      const logo = pdfLogo || await loadLogoDataUrl();
      if (logo && !pdfLogo) setPdfLogo(logo);

      const fetchMonth = async (month) => {
        const res = await fetch(`/api/timesheet?year=${tsYear}&month=${month}`);
        const data = await res.json();
        return data.success ? data.workingDays : [];
      };

      const count = await downloadYearZip({
        employee,
        year: tsYear,
        settings: payrollSettings,
        logo,
        fetchMonth
      });

      if (count === 0) {
        alert(`Für ${tsYear} wurden keine Öffnungstage in der Speiseplan-Historie gefunden.`);
      }
    } catch (err) {
      console.error('Fehler beim Jahres-Download:', err);
      alert('Fehler beim Erstellen der Jahres-ZIP.');
    } finally {
      setYearDownloading(null);
    }
  };

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

  // Gericht aus Modal übernehmen (ohne Preis)
  const selectSuggestion = (meal) => {
    const { dayIndex, mealIndex } = ideenModal;
    setWeekMenu(prevMenu => {
      const newMenu = [...prevMenu];
      newMenu[dayIndex].meals[mealIndex] = {
        ...newMenu[dayIndex].meals[mealIndex],
        name: meal.name,
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
        isFuture: weekOffset > 0,
        prefix: weekOffset < 0 ? 'Vergangen' : weekOffset === 0 ? 'Aktuell' : 'Kommend'
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
      
      <div className="max-w-4xl mx-auto p-2 sm:p-4">
        <div className="flex justify-between items-center mb-6 sm:mb-8 no-print">
          <h1 className="text-xl sm:text-2xl font-bold">Menü-Verwaltung</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openPersonalModal}
              data-testid="open-personal-modal-btn"
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"
              title="Personal & Stundenzettel verwalten"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Personal &amp; Stundenzettel</span>
              <span className="sm:hidden">Personal</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              data-testid="logout-btn"
              className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
              title="Abmelden"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Abmelden</span>
            </button>
          </div>
        </div>

        {/* Wochenauswahl */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
              >
                {getWeekOptions().map((option) => (
                  <option 
                    key={`${option.year}-${option.week}`} 
                    value={`${option.year}-${option.week}`}
                  >
                    {option.isCurrent ? '● ' : '  '}{option.label}{option.isCurrent ? '  ← aktuelle Woche' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:ml-4 flex items-center">
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
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Kontaktinformationen</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div key={dayIndex} className="bg-white p-3 sm:p-6 rounded-lg shadow mb-6">
                <div className="flex flex-col gap-4">
                  {/* Tag und Schließtag-Checkbox */}
                  <div className="flex items-center justify-between border-b pb-3 sm:pb-4">
                    <h2 className="text-lg sm:text-xl font-semibold">{day.day}</h2>
                    
                    <label className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-700 cursor-pointer">
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
                        <div key={mealIndex} className="mb-2 sm:mb-4 border-b border-gray-100 pb-3 sm:pb-0 sm:border-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            {/* Zeile 1 Mobile / Links Desktop: Ideen-Button + Input */}
                            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                              <button
                                type="button"
                                data-testid={`idea-btn-${dayIndex}-${mealIndex}`}
                                onClick={() => openIdeenModal(dayIndex, mealIndex)}
                                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 border border-amber-200 transition-colors"
                                title="Gerichts-Ideen"
                              >
                                <Lightbulb className="w-4 h-4" />
                              </button>
                              <div className="flex-1 relative min-w-0">
                                <input
                                  type="text"
                                  value={meal.name}
                                  onChange={(e) => handleMealChange(dayIndex, mealIndex, 'name', e.target.value)}
                                  onBlur={(e) => handleMealBlur(dayIndex, mealIndex, e.target.value)}
                                  className="w-full p-2 border rounded text-sm sm:text-base"
                                  placeholder="Gericht eingeben..."
                                />
                                {meal.name && meal.name.trim().length > 0 && (
                                  <div className="absolute right-2 top-1 flex items-center gap-1">
                                    {(!meal.allergenCodes || meal.allergenCodes.length === 0) && 
                                     (!meal.additiveCodes || meal.additiveCodes.length === 0) && (
                                      <span className="text-xs px-1 py-0.5 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded" title="Keine Kennzeichnungen">⚠️</span>
                                    )}
                                    {(meal.allergenCodes?.length > 0 || meal.additiveCodes?.length > 0) && (
                                      <button type="button" onClick={() => setAllergenPopup({ open: true, mealName: meal.name, allergens: meal.allergenCodes || [], additives: meal.additiveCodes || [] })} className="text-xs px-1 py-0.5 bg-green-100 text-green-800 border border-green-300 rounded hover:bg-green-200" style={{ fontSize: '10px', lineHeight: '1' }}>
                                        <sup>{formatCodesInline(meal.allergenCodes, meal.additiveCodes)}</sup>
                                      </button>
                                    )}
                                    {meal.name && meal.name.trim().length > 0 && (
                                      <button type="button" onClick={async () => {
                                        setAnalyzingMeal(true);
                                        try {
                                          const response = await fetch('/api/analyze-allergens-v2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mealName: meal.name }) });
                                          if (response.ok) {
                                            const result = await response.json();
                                            setWeekMenu(prevMenu => { const newMenu = [...prevMenu]; newMenu[dayIndex].meals[mealIndex] = { ...newMenu[dayIndex].meals[mealIndex], allergenCodes: result.allergens || [], additiveCodes: result.additives || [] }; return newMenu; });
                                            alert(`✅ ${result.allergens?.length || 0} Allergene und ${result.additives?.length || 0} Zusatzstoffe erkannt`);
                                          }
                                        } catch (error) { alert('❌ Analyse fehlgeschlagen'); } finally { setAnalyzingMeal(false); }
                                      }} className="text-xs px-1 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 rounded hover:bg-blue-200" title="Erneut analysieren" disabled={analyzingMeal}>🔄</button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Zeile 2 Mobile / Rechts Desktop: Icon + Preis + Aktionsessen + Löschen */}
                            <div className="flex items-center gap-2 ml-10 sm:ml-0 flex-shrink-0 flex-wrap">
                              {meal.icon && <span className="text-xl sm:text-2xl">{meal.icon}</span>}
                              <input
                                type="number"
                                value={meal.price}
                                onChange={(e) => updateMeal(dayIndex, mealIndex, 'price', e.target.value)}
                                className="w-20 sm:w-24 p-1.5 sm:p-2 border rounded text-sm"
                                step="0.1"
                                placeholder="Preis"
                              />
                              <label className="flex items-center gap-1.5 text-sm">
                                <input type="checkbox" checked={meal.isAction} onChange={(e) => handleActionChange(dayIndex, mealIndex, 'isAction', e.target.checked)} className="rounded border-gray-300" />
                                <span className="hidden sm:inline">Aktionsessen</span>
                                <span className="sm:hidden">Aktion</span>
                              </label>
                              <button type="button" onClick={() => { if (confirm('Dieses Gericht wirklich löschen?')) { removeMeal(dayIndex, mealIndex); } }} className="px-2 py-1 text-xs sm:text-sm text-red-600 hover:text-red-800 border border-red-200 rounded hover:bg-red-50" title="Gericht löschen">Löschen</button>
                            </div>
                          </div>
                          {meal.isAction && (
                            <input
                              type="text"
                              value={meal.actionNote}
                              onChange={(e) => handleActionChange(dayIndex, mealIndex, 'actionNote', e.target.value)}
                              className="mt-2 ml-10 sm:ml-12 w-auto flex-1 p-2 border rounded bg-yellow-50 text-sm"
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
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
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

        {/* Personal- & Stundenzettel-Modal */}
        {personalModalOpen && (() => {
          const tsCalc = getTimesheetCalc();
          return (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4" data-testid="personal-modal-overlay">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" data-testid="personal-modal">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Personal &amp; Stundenzettel
                </h3>
                <button
                  onClick={() => setPersonalModalOpen(false)}
                  className="text-gray-400 hover:text-gray-700"
                  data-testid="close-personal-modal-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-8">
                {/* Abschnitt: Mitarbeiter */}
                <section>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" /> Mitarbeiter
                  </h4>

                  <div className="space-y-2 mb-4">
                    {employees.length === 0 && (
                      <p className="text-sm text-gray-500">Noch keine Mitarbeiter angelegt.</p>
                    )}
                    {employees.map((emp) => (
                      <div key={emp._id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2" data-testid="employee-row">
                        <div className="text-sm">
                          <span className="font-medium">{emp.firstName} {emp.lastName}</span>
                          {emp.personnelNumber && <span className="text-gray-500 ml-2">Nr. {emp.personnelNumber}</span>}
                          <span className="ml-2 inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            {emp.shift === 'frueh' ? 'Frühschicht' : emp.shift === 'spaet' ? 'Spätschicht' : 'Ganztagsschicht'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEmpForm({ _id: emp._id, firstName: emp.firstName, lastName: emp.lastName || '', personnelNumber: emp.personnelNumber || '', shift: emp.shift || 'ganztags' })}
                            className="text-xs px-2 py-1 text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50"
                            data-testid="edit-employee-btn"
                          >
                            Bearbeiten
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteEmployee(emp._id)}
                            className="text-red-500 hover:text-red-700"
                            data-testid="delete-employee-btn"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mitarbeiter-Formular */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Vorname *"
                      value={empForm.firstName}
                      onChange={(e) => setEmpForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="rounded-md border-gray-300 border shadow-sm text-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                      data-testid="employee-firstname-input"
                    />
                    <input
                      type="text"
                      placeholder="Nachname"
                      value={empForm.lastName}
                      onChange={(e) => setEmpForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="rounded-md border-gray-300 border shadow-sm text-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                      data-testid="employee-lastname-input"
                    />
                    <input
                      type="text"
                      placeholder="Personal-Nr. (optional)"
                      value={empForm.personnelNumber}
                      onChange={(e) => setEmpForm(prev => ({ ...prev, personnelNumber: e.target.value }))}
                      className="rounded-md border-gray-300 border shadow-sm text-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                      data-testid="employee-personnelnumber-input"
                    />
                    <select
                      value={empForm.shift}
                      onChange={(e) => setEmpForm(prev => ({ ...prev, shift: e.target.value }))}
                      className="rounded-md border-gray-300 border shadow-sm text-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                      data-testid="employee-shift-select"
                    >
                      <option value="frueh">Frühschicht</option>
                      <option value="spaet">Spätschicht</option>
                      <option value="ganztags">Ganztagsschicht</option>
                    </select>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={saveEmployee}
                      disabled={personalSaving}
                      className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:bg-gray-400"
                      data-testid="save-employee-btn"
                    >
                      <Plus className="w-4 h-4" />
                      {empForm._id ? 'Mitarbeiter aktualisieren' : 'Mitarbeiter hinzufügen'}
                    </button>
                    {empForm._id && (
                      <button
                        type="button"
                        onClick={() => setEmpForm({ _id: null, firstName: '', lastName: '', personnelNumber: '', shift: 'ganztags' })}
                        className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        Abbrechen
                      </button>
                    )}
                  </div>
                </section>

                {/* Abschnitt: Lohn-Einstellungen */}
                <section>
                  <h4 className="font-semibold text-gray-800 mb-3">Lohn-Einstellungen (Minijob)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Mindestlohn (€/h)</label>
                      <input
                        type="number" step="0.01"
                        value={payrollSettings.minimumWage}
                        onChange={(e) => setPayrollSettings(prev => ({ ...prev, minimumWage: e.target.value }))}
                        className="w-full rounded-md border-gray-300 border shadow-sm text-sm px-2 py-1.5"
                        data-testid="minimum-wage-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Verdienstgrenze (€)</label>
                      <input
                        type="number" step="0.01"
                        value={payrollSettings.monthlyLimit}
                        onChange={(e) => setPayrollSettings(prev => ({ ...prev, monthlyLimit: e.target.value }))}
                        className="w-full rounded-md border-gray-300 border shadow-sm text-sm px-2 py-1.5"
                        data-testid="monthly-limit-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Öffnung von</label>
                      <input
                        type="time"
                        value={payrollSettings.openingStart}
                        onChange={(e) => setPayrollSettings(prev => ({ ...prev, openingStart: e.target.value }))}
                        className="w-full rounded-md border-gray-300 border shadow-sm text-sm px-2 py-1.5"
                        data-testid="opening-start-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Öffnung bis</label>
                      <input
                        type="time"
                        value={payrollSettings.openingEnd}
                        onChange={(e) => setPayrollSettings(prev => ({ ...prev, openingEnd: e.target.value }))}
                        className="w-full rounded-md border-gray-300 border shadow-sm text-sm px-2 py-1.5"
                        data-testid="opening-end-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Pause (min)</label>
                      <input
                        type="number"
                        value={payrollSettings.breakMinutes}
                        onChange={(e) => setPayrollSettings(prev => ({ ...prev, breakMinutes: e.target.value }))}
                        className="w-full rounded-md border-gray-300 border shadow-sm text-sm px-2 py-1.5"
                        data-testid="break-minutes-input"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Öffnungszeiten entsprechen den Kantinen-Zeiten (Frühstück/Mittagstisch) und bestimmen den Arbeitsbeginn im Stundenzettel.</p>

                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">Schicht-Zeitfenster (Randomizer verteilt die Zeiten innerhalb dieser Grenzen)</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'frueh', label: 'Frühschicht' },
                        { key: 'spaet', label: 'Spätschicht' },
                        { key: 'ganztags', label: 'Ganztagsschicht' }
                      ].map((s) => (
                        <div key={s.key} className="border border-gray-200 rounded-md p-2">
                          <div className="text-xs font-medium text-gray-700 mb-1">{s.label}</div>
                          <div className="flex items-center gap-1">
                            <input
                              type="time"
                              value={payrollSettings[`${s.key}Start`]}
                              onChange={(e) => setPayrollSettings(prev => ({ ...prev, [`${s.key}Start`]: e.target.value }))}
                              className="w-full rounded border-gray-300 border text-xs px-1 py-1"
                              data-testid={`${s.key}-start-input`}
                            />
                            <span className="text-gray-400 text-xs">–</span>
                            <input
                              type="time"
                              value={payrollSettings[`${s.key}End`]}
                              onChange={(e) => setPayrollSettings(prev => ({ ...prev, [`${s.key}End`]: e.target.value }))}
                              className="w-full rounded border-gray-300 border text-xs px-1 py-1"
                              data-testid={`${s.key}-end-input`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={savePayrollSettings}
                    disabled={personalSaving}
                    className="mt-2 px-3 py-1.5 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                    data-testid="save-payroll-settings-btn"
                  >
                    Einstellungen speichern
                  </button>
                </section>

                {/* Abschnitt: Stundenzettel */}
                <section>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" /> Stundenzettel (monatsweise)
                  </h4>

                  <div className="flex flex-wrap items-end gap-3 mb-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Monat</label>
                      <select
                        value={tsMonth}
                        onChange={(e) => { const m = Number(e.target.value); setTsMonth(m); fetchTimesheet(tsYear, m); }}
                        className="rounded-md border-gray-300 border shadow-sm text-sm px-2 py-1.5"
                        data-testid="timesheet-month-select"
                      >
                        {MONTH_NAMES.map((name, i) => (
                          <option key={i} value={i + 1}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Jahr</label>
                      <select
                        value={tsYear}
                        onChange={(e) => { const y = Number(e.target.value); setTsYear(y); fetchTimesheet(y, tsMonth); }}
                        className="rounded-md border-gray-300 border shadow-sm text-sm px-2 py-1.5"
                        data-testid="timesheet-year-select"
                      >
                        {[tsYear - 1, tsYear, tsYear + 1].filter((v, i, a) => a.indexOf(v) === i).sort().map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Berechnungs-Übersicht */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-4 text-sm" data-testid="timesheet-summary">
                    {tsLoading ? (
                      <div className="flex items-center gap-2 text-gray-500"><Loader className="w-4 h-4 animate-spin" /> Lade Öffnungstage…</div>
                    ) : tsCalc.numDays === 0 ? (
                      <p className="text-gray-600">Keine Öffnungstage für {MONTH_NAMES[tsMonth - 1]} {tsYear} in der Speiseplan-Historie gefunden.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1 gap-x-4">
                        <div>Öffnungstage: <strong>{tsCalc.numDays}</strong></div>
                        <div>max. Stunden/Monat: <strong>{tsCalc.maxHoursMonth.toFixed(2).replace('.', ',')} h</strong></div>
                        <div>Stunden/Tag: <strong>{tsCalc.hoursPerDay.toFixed(2).replace('.', ',')} h</strong></div>
                        <div>Stunden/Woche: <strong>ca. {tsCalc.weeklyHours.toFixed(2).replace('.', ',')} h</strong></div>
                        <div>Stunden gesamt: <strong>{tsCalc.totalHours.toFixed(2).replace('.', ',')} h</strong></div>
                        <div>Lohn gesamt: <strong>{tsCalc.totalWage.toFixed(2).replace('.', ',')} €</strong></div>
                      </div>
                    )}
                  </div>

                  {/* Download pro Mitarbeiter */}
                  <div className="space-y-2">
                    {employees.length === 0 ? (
                      <p className="text-sm text-gray-500">Zuerst Mitarbeiter anlegen, um Stundenzettel zu erstellen.</p>
                    ) : (
                      employees.map((emp) => (
                        <div key={emp._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-gray-200 rounded-lg px-3 py-2 gap-2">
                          <span className="text-sm font-medium">{emp.firstName} {emp.lastName}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => generateTimesheet(emp)}
                              disabled={tsCalc.numDays === 0 || yearDownloading}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300"
                              data-testid="download-timesheet-btn"
                            >
                              <Download className="w-4 h-4" /> Monat (PDF)
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadTimesheetYear(emp)}
                              disabled={!!yearDownloading}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300"
                              data-testid="download-year-zip-btn"
                              title={`Alle Monate ${tsYear} als ZIP (je Monat eine PDF)`}
                            >
                              {yearDownloading === emp._id ? (
                                <><Loader className="w-4 h-4 animate-spin" /> erstelle…</>
                              ) : (
                                <><Download className="w-4 h-4" /> Jahr {tsYear} (ZIP)</>
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">„Jahr (ZIP)“ lädt für {tsYear} je Monat eine eigene PDF-Datei gebündelt herunter.</p>
                </section>
              </div>
            </div>
          </div>
          );
        })()}

        {/* Ideen-Modal für Gerichts-Vorschläge */}
        {ideenModal.open && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" data-testid="idea-modal-overlay">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] mx-2 sm:mx-0 flex flex-col" data-testid="idea-modal">
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
