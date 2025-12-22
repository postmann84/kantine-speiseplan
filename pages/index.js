import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getHolidaysForWeek } from '../lib/holidays';
import { formatDate, isSameDay, formatFullDate } from '../lib/dateUtils';
import { QRCodeSVG } from 'qrcode.react';
import PrintMenu from '../components/PrintMenu';
import { ALLERGENS, ADDITIVES, formatCodesInline } from '../lib/allergenTaxonomy';

export default function Home() {
  const router = useRouter();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [holidays, setHolidays] = useState({});
  const [allergenPopup, setAllergenPopup] = useState({ open: false, mealName: '', allergens: [], additives: [] });
  const [showSanta, setShowSanta] = useState(false);
  const [showSnowflakes, setShowSnowflakes] = useState(false);
  const [showNewYear, setShowNewYear] = useState(false);
  const [newYearPhase, setNewYearPhase] = useState(1); // 1=Rakete, 2=Explosion, 3=2026 fällt
  
  // Kiosk-Modus für Monitor-Anzeige
  const isKioskMode = router.query.kiosk === 'true';
  
  // Debug-Log für Kiosk-Modus
  useEffect(() => {
    console.log('Kiosk-Modus:', isKioskMode, 'Query:', router.query);
  }, [isKioskMode, router.query]);

  // Prüft ob ein Datum im aktiven Urlaubszeitraum liegt
  const isDateInVacation = (date, vacation) => {
    if (!vacation?.isOnVacation || !vacation?.startDate || !vacation?.endDate) {
      return false;
    }
    
    const checkDate = new Date(date);
    checkDate.setHours(12, 0, 0, 0);
    
    const vacationStart = new Date(vacation.startDate);
    vacationStart.setHours(12, 0, 0, 0);
    
    const vacationEnd = new Date(vacation.endDate);
    vacationEnd.setHours(12, 0, 0, 0);
    
    return checkDate >= vacationStart && checkDate <= vacationEnd;
  };

  // Berechnet das Datum für jeden Wochentag
  const getDayDate = (weekStart, dayIndex) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex);
    return date.toISOString().split('T')[0];
  };

  // Prüft ob der übergebene Tag heute ist
  const isToday = (dayName) => {
    const today = new Date();
    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return weekdays[today.getDay()] === dayName;
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json();

        if (!data.success) {
          setError(data.message);
          return;
        }

        setMenu(data.data);
        console.log('Menu data:', data.data); // Debug log
        console.log('Menu days:', data.data?.days); // Debug log
        // Hole Feiertage immer, unabhängig vom Urlaubsstatus
        const weekHolidays = getHolidaysForWeek(data.data.weekStart);
        setHolidays(weekHolidays);
        
        // Prüfe ob Weihnachtsmann-Animation gezeigt werden soll
        checkSantaAnimation(data.data);
      } catch (error) {
        setError('Fehler beim Laden des Speiseplans');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []); // Lädt einmal beim Seitenaufruf

  // Funktion zum Prüfen ob Weihnachtsmann-Animation angezeigt werden soll
  // Animation läuft in ZWEI Wochen: 15.-19.12. (KW 51) UND 23.-29.12. (KW 52)
  const checkSantaAnimation = (menuData) => {
    if (!menuData || !menuData.isPublished) {
      console.log('❌ Kein veröffentlichter Speiseplan');
      return; // Kein veröffentlichter Speiseplan
    }

    const today = new Date();
    const currentYear = today.getFullYear();

    // Definiere die Zeiträume für die Animation
    const weekStart = new Date(menuData.weekStart);
    const weekEnd = new Date(menuData.weekEnd);
    
    // Wichtige Dezember-Daten
    const dec15 = new Date(currentYear, 11, 15); // 15.12. (Beginn KW 51)
    const dec24 = new Date(currentYear, 11, 24); // 24.12. (in KW 52)

    // Setze alle Uhrzeiten auf Mitternacht für korrekten Vergleich
    weekStart.setHours(0, 0, 0, 0);
    weekEnd.setHours(23, 59, 59, 999);
    dec15.setHours(0, 0, 0, 0);
    dec24.setHours(12, 0, 0, 0);

    // Prüfe ob die Woche den 15.12. ODER den 24.12. enthält
    const containsDec15 = dec15 >= weekStart && dec15 <= weekEnd;
    const containsDec24 = dec24 >= weekStart && dec24 <= weekEnd;

    if (containsDec15 || containsDec24) {
      console.log('🎅 Weihnachtsmann-Animation wird aktiviert!');
      console.log(`✅ Veröffentlichte Woche: ${weekStart.toISOString().split('T')[0]} bis ${weekEnd.toISOString().split('T')[0]}`);
      
      if (containsDec15 && containsDec24) {
        console.log('🎄 Diese Woche enthält 15.12. UND 24.12. → Animation aktiv!');
      } else if (containsDec15) {
        console.log('🎄 Diese Woche enthält 15.12. (KW 51) → Animation aktiv!');
      } else {
        console.log('🎄 Diese Woche enthält 24.12. (KW 52) → Animation aktiv!');
      }
      
      setShowSanta(true);
      
      // KEINE Zeitbegrenzung mehr - Animation läuft kontinuierlich!
      
      // Schneeflocken-Animation: Alle 30 Sekunden für 5 Sekunden
      startSnowflakeInterval();
    } else {
      console.log(`❌ Woche (${weekStart.toISOString().split('T')[0]} bis ${weekEnd.toISOString().split('T')[0]}) enthält weder 15.12. noch 24.12.`);
    }
    
    // Prüfe auch Neujahrs-Animation
    checkNewYearAnimation(menuData);
  };

  // Funktion zum Prüfen ob Neujahrs-Animation angezeigt werden soll
  // Animation läuft in der Woche mit dem 1. Januar
  const checkNewYearAnimation = (menuData) => {
    if (!menuData || !menuData.isPublished) {
      return;
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const nextYear = currentYear + 1;

    const weekStart = new Date(menuData.weekStart);
    const weekEnd = new Date(menuData.weekEnd);
    
    // Prüfe ob die Woche den 1. Januar enthält (vom aktuellen oder nächsten Jahr)
    const jan1Current = new Date(currentYear, 0, 1); // 1.1. aktuelles Jahr
    const jan1Next = new Date(nextYear, 0, 1); // 1.1. nächstes Jahr

    weekStart.setHours(0, 0, 0, 0);
    weekEnd.setHours(23, 59, 59, 999);
    jan1Current.setHours(12, 0, 0, 0);
    jan1Next.setHours(12, 0, 0, 0);

    const containsJan1 = (jan1Current >= weekStart && jan1Current <= weekEnd) || 
                         (jan1Next >= weekStart && jan1Next <= weekEnd);

    if (containsJan1) {
      console.log('🎆 Neujahrs-Animation wird aktiviert!');
      console.log(`✅ Veröffentlichte Woche: ${weekStart.toISOString().split('T')[0]} bis ${weekEnd.toISOString().split('T')[0]}`);
      console.log('🎊 Diese Woche enthält den 1. Januar → Silvester-Animation aktiv!');
      
      setShowNewYear(true);
      startNewYearAnimation();
    }
  };

  // Neujahrs-Animation: 3 Phasen
  const startNewYearAnimation = () => {
    // Phase 1: Rakete fliegt diagonal nach oben (3 Sekunden - schneller!)
    setNewYearPhase(1);
    
    setTimeout(() => {
      // Phase 2: Explosion/Feuerwerk (2 Sekunden)
      setNewYearPhase(2);
      
      setTimeout(() => {
        // Phase 3: VIELE 2026er fallen runter (8 Sekunden)
        setNewYearPhase(3);
        
        setTimeout(() => {
          // Zurück zu Phase 1 und wiederholen
          startNewYearAnimation();
        }, 8000);
      }, 2000);
    }, 3000);
  };

  // Schneeflocken-Intervall: Alle 30 Sekunden für 5 Sekunden
  const startSnowflakeInterval = () => {
    // Erste Schneeflocken nach 5 Sekunden
    setTimeout(() => {
      setShowSnowflakes(true);
      setTimeout(() => setShowSnowflakes(false), 5000); // 5 Sekunden lang
    }, 5000);

    // Dann alle 30 Sekunden wiederholen
    setInterval(() => {
      setShowSnowflakes(true);
      setTimeout(() => setShowSnowflakes(false), 5000); // 5 Sekunden lang
    }, 30000); // Alle 30 Sekunden
  };

  if (loading) return <div>Lade Speiseplan...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!menu) return <div>Noch kein Speiseplan verfügbar.</div>;

  // Wenn Urlaub aktiv ist, zeigen wir nur die Urlaubsmeldung
  if (menu?.vacation?.isOnVacation) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const vacationStart = new Date(menu.vacation.startDate);
    const vacationEnd = new Date(menu.vacation.endDate);

    if (today >= vacationStart && today <= vacationEnd) {
      return (
        <div className="max-w-4xl mx-auto p-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Betriebskantine</h1>
          </header>

          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-8 text-center">
            <div className="text-6xl mb-6">🏖️</div>
            <h2 className="text-2xl font-bold text-yellow-800 mb-4">
              Wir sind bald wieder für Sie da
            </h2>
            <p className="text-xl text-yellow-700 mb-6">
              {menu.vacation.message}
            </p>
            <div className="text-lg font-medium text-yellow-800">
              <p>Von: {formatFullDate(menu.vacation.startDate)}</p>
              <p>Bis: {formatFullDate(menu.vacation.endDate)}</p>
            </div>
          </div>

          <footer className="mt-8 text-center text-gray-500 text-sm space-y-2">
            <p>Bei Fragen zu Inhaltsstoffen und Allergenen kontaktieren Sie uns bitte unter: {menu.contactInfo.phone}</p>
            <p>© {new Date().getFullYear()}</p>
          </footer>
        </div>
      );
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Speiseplan Drucken</title>
          <style>
            @page {
              size: A4;
              margin: 2cm;
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.5;
              margin: 0;
              padding: 0;
            }
            .print-content {
              max-width: 100%;
              margin: 0 auto;
            }
            @media print {
              .print-content {
                width: 100%;
              }
            }
          </style>
        </head>
        <body>
    `);
    
    // Füge den Inhalt der PrintMenu-Komponente hinzu
    const printContent = document.querySelector('.print-content').innerHTML;
    printWindow.document.write(printContent);
    
    printWindow.document.write(`
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleEmailSend = async (email) => {
    try {
      console.log('Sende Menüdaten:', menu); // Debug-Log

      const response = await fetch('/api/send-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menu: {
            days: menu.days,
            contactInfo: menu.contactInfo
          },
          recipient: email
        })
      });

      if (!response.ok) {
        throw new Error('E-Mail-Versand fehlgeschlagen');
      }

      alert('E-Mail wurde erfolgreich versendet!');
    } catch (error) {
      console.error('Fehler beim E-Mail-Versand:', error);
      alert('Fehler beim Versenden der E-Mail');
    }
  };

  // Render-Funktion für einen einzelnen Tag
  const renderDay = (day, index) => {
    const dayDate = new Date(menu.weekStart);
    dayDate.setDate(dayDate.getDate() + index);
    const dateStr = dayDate.toISOString().split('T')[0];
    const holidayInfo = holidays[dateStr];
    
    // Prüfe ob der Tag im Urlaubszeitraum liegt
    const isVacationDay = isDateInVacation(dayDate, menu.vacation);
    const isCurrentDay = isToday(day.day);

    return (
      <div key={index} className={`mb-4 rounded-lg shadow-md overflow-hidden
        ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}
        ${isVacationDay ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-white'}`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {day.day} ({formatDate(dayDate)})
            </h2>
            
            {/* Feiertags-Badge - dezenteres Design */}
            {holidayInfo && !isVacationDay && (
              <div className={`px-2 py-1 text-xs rounded-md self-start ${
                holidayInfo.type === 'holiday' && holidayInfo.isLegalHolidayInLowerSaxony
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : `bg-${holidayInfo.color}-50 text-${holidayInfo.color}-700 border border-${holidayInfo.color}-200`
              }`}>
                {holidayInfo.name}
              </div>
            )}
          </div>

          {/* Urlaubstag-Anzeige */}
          {isVacationDay ? (
            <div className="mt-4 p-6 bg-yellow-100 rounded-lg text-center">
              <div className="text-4xl mb-3">🌴</div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Urlaubstag
              </h3>
              <p className="text-yellow-700">
                {menu.vacation?.message || 'Wir befinden uns im Urlaub.'}
              </p>
            </div>
          ) : (
            <>
              {/* Geschlossen-Nachricht für gesetzliche Feiertage */}
              {(holidayInfo?.type === 'holiday' && 
                holidayInfo?.isLegalHolidayInLowerSaxony) ? (
                <div className="mt-2 p-2 bg-gray-50 rounded text-gray-600 text-center text-sm">
                  An gesetzlichen Feiertagen bleibt die Kantine geschlossen
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {/* Menü-Einträge */}
                  {!day.isClosed ? (
                    <div className="space-y-2">
                      {day.meals?.map((meal, mealIndex) => (
                        <div 
                          key={mealIndex} 
                          className={`flex items-center justify-between ${meal.isAction ? 'bg-yellow-50 p-2 rounded' : ''}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="mr-2 font-medium">
                                {meal.name}
                                {(meal.allergenCodes?.length > 0 || meal.additiveCodes?.length > 0) && (
                                  <button
                                    type="button"
                                    onClick={() => setAllergenPopup({
                                      open: true,
                                      mealName: meal.name,
                                      allergens: meal.allergenCodes || [],
                                      additives: meal.additiveCodes || []
                                    })}
                                    className="ml-1 text-xs px-1 py-0.5 bg-gray-100 border rounded hover:bg-gray-200"
                                    title="Allergene/Zusatzstoffe anzeigen"
                                    style={{ fontSize: '9px', lineHeight: '1', verticalAlign: 'super' }}
                                  >
                                    {formatCodesInline(meal.allergenCodes, meal.additiveCodes)}
                                  </button>
                                )}
                              </span>
                              {meal.isAction && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                  Aktionsessen
                                </span>
                              )}
                            </div>
                            {meal.isAction && meal.actionNote && (
                              <div className="text-sm text-yellow-800 mt-1 font-medium">{meal.actionNote}</div>
                            )}
                          </div>
                          <div className="flex items-center">
                            <span className="text-xl mr-2">{meal.icon}</span>
                            <span className="text-gray-700 font-semibold">
                              {meal.price.toFixed(2)} €
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      {day.closedReason || 'Heute geschlossen'}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Normaler Return für nicht-Urlaubszeit
  return (
    <>
      {isKioskMode && (
        <style jsx>{`
          .kiosk-mode {
            padding: 0.5rem !important;
            font-size: 0.9em;
          }
          .kiosk-mode .container {
            max-width: 100% !important;
            padding: 0.5rem !important;
          }
          .kiosk-mode h1 {
            font-size: 1.5rem !important;
            margin-bottom: 0.5rem !important;
          }
          .kiosk-mode .day-section {
            margin-bottom: 0.75rem !important;
            padding: 0.5rem !important;
          }
          .kiosk-mode .meal-item {
            padding: 0.375rem !important;
            font-size: 0.85rem !important;
          }
          .kiosk-mode .day-header {
            font-size: 1rem !important;
            padding: 0.375rem !important;
          }
          .kiosk-mode .info-grid {
            font-size: 0.8rem !important;
            padding: 0.5rem !important;
          }
          @media screen and (max-height: 1080px) {
            .kiosk-mode {
              transform: scale(0.9);
              transform-origin: top center;
            }
          }
          @media screen and (max-height: 900px) {
            .kiosk-mode {
              transform: scale(0.8);
              transform-origin: top center;
            }
          }
          @media screen and (max-height: 768px) {
            .kiosk-mode {
              transform: scale(0.7);
              transform-origin: top center;
            }
          }
        `}</style>
      )}
      <div className={`max-w-4xl mx-auto p-4 ${isKioskMode ? 'kiosk-mode container' : ''}`} style={isKioskMode ? {
        background: 'white',
        minHeight: '100vh'
      } : {}}>
      <header className={`${isKioskMode ? 'mb-4' : 'mb-8'} ${isKioskMode ? 'relative' : ''}`}>
        {isKioskMode ? (
          /* Kiosk-Modus: Responsive Layout - Logo links, Öffnungszeiten rechts */
          <div className="flex flex-col sm:flex-row items-center justify-between p-2 bg-white rounded-lg shadow-sm border border-gray-100 gap-2 sm:gap-0">
            {/* Logo on the left */}
            <div className="flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="Rainer Westermann Kantine" 
                className="h-12 sm:h-16 w-auto"
              />
            </div>
            {/* Opening hours on the right - responsive */}
            <div className="flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm">
                <div className="flex items-center space-x-1">
                  <span className="text-gray-600 font-medium">Frühstück:</span>
                  <span className="text-gray-800">07:00-10:00</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-600 font-medium">Mittagstisch:</span>
                  <span className="text-gray-800">11:30-14:00</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-600 font-medium">Postfremde:</span>
                  <span className="text-gray-800">+{menu.contactInfo?.postcode}€</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Normaler Modus: Logo links, Hauptinhalt rechts - professionell und symmetrisch */
          <div className="flex items-center gap-4 mb-8">
            {/* Logo links - mit Hintergrund für einheitliches Aussehen */}
            <div className="flex-shrink-0 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <img 
                src="/logo.png" 
                alt="Rainer Westermann Kantine" 
                className="h-36 w-auto"
              />
            </div>
            {/* Hauptinhalt rechts - kompakter Info-Block */}
            <div className="flex-1">
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 h-44 flex flex-col justify-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-3 text-center">Speiseplan</h1>
                <div className="grid grid-cols-2 gap-4">
                  {/* Linke Spalte: Öffnungszeiten */}
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800 mb-1">Öffnungszeiten</h2>
                    <div className="flex space-x-4 text-xs">
                      <div>
                        <span className="text-gray-600 font-medium">Frühstück:</span>
                        <span className="text-gray-800 ml-1">07:00-10:00</span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Mittagstisch:</span>
                        <span className="text-gray-800 ml-1">11:30-14:00</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Rechte Spalte: Kontaktinfo */}
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800 mb-1">Kontakt</h2>
                    <p className="text-gray-800 text-xs">Telefon: {menu.contactInfo?.phone}</p>
                    <p className="text-gray-600 text-xs mt-1">Für Postfremde +{menu.contactInfo?.postcode}€</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {menu.days?.map((day, index) => renderDay(day, index))}
      </main>

      <footer className="mt-8 text-center text-gray-500 text-sm space-y-4 border-t pt-4">
        <p>Bei Fragen zu Inhaltsstoffen und Allergenen kontaktieren Sie uns bitte unter: {menu.contactInfo?.phone}</p>
        
        <div className="no-print">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <span>🖨️</span>
            <span>Speiseplan drucken</span>
          </button>
        </div>
        
        {!isKioskMode && (
          <>
            <div className="flex flex-col items-center mt-4">
              <p className="mb-2">Speiseplan direkt auf dem Smartphone:</p>
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <QRCodeSVG 
                  value={process.env.NEXT_PUBLIC_WEBSITE_URL || window.location.href}
                  size={100}
                  level="L"
                  includeMargin={true}
                />
              </div>
            </div>
            
            <p>© {new Date().getFullYear()}</p>
          </>
        )}
      </footer>

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
                  <div className="text-sm text-gray-500">Keine Allergene angegeben</div>
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
                  <div className="text-sm text-gray-500">Keine Zusatzstoffe angegeben</div>
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

      {/* Weihnachtsmann-Animation am 24.12. */}
      {showSanta && (
        <>
          <style jsx>{`
            @keyframes santaFly {
              0% {
                left: -200px;
              }
              100% {
                left: 100%;
              }
            }
            
            .santa-container {
              position: fixed;
              bottom: 20%;
              left: -200px;
              z-index: 9999;
              pointer-events: none;
              animation: santaFly 15s linear infinite; /* Langsamer: 15s statt 7s */
            }
            
            .santa-video {
              height: 240px; /* Doppelt so groß: 240px statt 120px */
              width: auto;
              /* Transparenter Hintergrund */
              background: transparent !important;
              
              /* WebM mit Alpha-Kanal braucht KEINE Blend-Modes! */
              /* Für MP4 Fallback (falls Sie noch kein WebM haben): */
              /* mix-blend-mode: multiply; */
            }
            
            /* Fallback für GIF-Bild */
            .santa-video img {
              height: 240px; /* Doppelt so groß: 240px statt 120px */
              width: auto;
              background: transparent;
            }
            
            @media (max-width: 768px) {
              .santa-video {
                height: 160px; /* Doppelt so groß: 160px statt 80px */
              }
              
              .santa-container {
                bottom: 10%;
              }
            }
          `}</style>
          
          <div className="santa-container">
            {/* Prüfe ob WebM (mit Transparenz) verfügbar ist, sonst MP4 */}
            <video 
              className="santa-video"
              autoPlay 
              loop 
              muted
              playsInline
              style={{ background: 'transparent' }}
            >
              {/* WebM mit Alpha-Kanal (Transparenz) - BESTE OPTION */}
              <source src="/santa-animation.webm" type="video/webm" />
              
              {/* Fallback auf MP4 falls WebM nicht verfügbar */}
              <source src="/santa-animation.mp4" type="video/mp4" />
              
              {/* Fallback auf GIF falls Video nicht unterstützt wird */}
              <img src="/santa-animation.gif" alt="Weihnachtsmann Animation" />
            </video>
          </div>
        </>
      )}

      {/* Schneeflocken-Animation - alle 30 Sekunden für 5 Sekunden */}
      {showSnowflakes && showSanta && (
        <>
          <style jsx>{`
            @keyframes snowfall {
              0% {
                transform: translateY(-10vh) translateX(0);
                opacity: 0;
              }
              10% {
                opacity: 1;
              }
              90% {
                opacity: 1;
              }
              100% {
                transform: translateY(110vh) translateX(var(--drift));
                opacity: 0;
              }
            }
            
            @keyframes sway {
              0%, 100% {
                transform: translateX(0);
              }
              50% {
                transform: translateX(20px);
              }
            }
            
            .snowflake-container {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              pointer-events: none;
              z-index: 9998; /* Unter Santa, über Rest */
              overflow: hidden;
            }
            
            .snowflake {
              position: absolute;
              color: white;
              font-size: var(--size);
              animation: snowfall var(--duration) linear infinite;
              animation-delay: var(--delay);
              text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
              opacity: 0.9;
              user-select: none;
            }
            
            /* Verschiedene Schneeflocken-Größen und Geschwindigkeiten */
            .snowflake:nth-child(1) { --size: 20px; --duration: 8s; --delay: 0s; left: 5%; --drift: 30px; }
            .snowflake:nth-child(2) { --size: 16px; --duration: 10s; --delay: 1s; left: 15%; --drift: -20px; }
            .snowflake:nth-child(3) { --size: 24px; --duration: 12s; --delay: 0.5s; left: 25%; --drift: 40px; }
            .snowflake:nth-child(4) { --size: 18px; --duration: 9s; --delay: 2s; left: 35%; --drift: -30px; }
            .snowflake:nth-child(5) { --size: 22px; --duration: 11s; --delay: 1.5s; left: 45%; --drift: 25px; }
            .snowflake:nth-child(6) { --size: 16px; --duration: 10s; --delay: 0.8s; left: 55%; --drift: -35px; }
            .snowflake:nth-child(7) { --size: 20px; --duration: 13s; --delay: 2.5s; left: 65%; --drift: 20px; }
            .snowflake:nth-child(8) { --size: 18px; --duration: 9s; --delay: 1.2s; left: 75%; --drift: -25px; }
            .snowflake:nth-child(9) { --size: 24px; --duration: 11s; --delay: 0.3s; left: 85%; --drift: 35px; }
            .snowflake:nth-child(10) { --size: 16px; --duration: 10s; --delay: 1.8s; left: 95%; --drift: -20px; }
            .snowflake:nth-child(11) { --size: 20px; --duration: 12s; --delay: 0.6s; left: 10%; --drift: 28px; }
            .snowflake:nth-child(12) { --size: 18px; --duration: 9s; --delay: 2.2s; left: 30%; --drift: -32px; }
            .snowflake:nth-child(13) { --size: 22px; --duration: 11s; --delay: 1.1s; left: 50%; --drift: 22px; }
            .snowflake:nth-child(14) { --size: 16px; --duration: 10s; --delay: 1.6s; left: 70%; --drift: -28px; }
            .snowflake:nth-child(15) { --size: 24px; --duration: 13s; --delay: 0.9s; left: 90%; --drift: 38px; }
          `}</style>
          
          <div className="snowflake-container">
            {/* 15 Schneeflocken mit verschiedenen Designs */}
            <div className="snowflake">❄</div>
            <div className="snowflake">❅</div>
            <div className="snowflake">❆</div>
            <div className="snowflake">❄</div>
            <div className="snowflake">❅</div>
            <div className="snowflake">❆</div>
            <div className="snowflake">❄</div>
            <div className="snowflake">❅</div>
            <div className="snowflake">❆</div>
            <div className="snowflake">❄</div>
            <div className="snowflake">❅</div>
            <div className="snowflake">❆</div>
            <div className="snowflake">❄</div>
            <div className="snowflake">❅</div>
            <div className="snowflake">❆</div>
          </div>
        </>
      )}

      {/* Neujahrs-Animation - 3 Phasen */}
      {showNewYear && (
        <>
          <style jsx>{`
            /* Phase 1: Rakete fliegt diagonal von links unten nach rechts oben */
            @keyframes rocketFly {
              0% {
                left: -300px;
                bottom: -200px;
                transform: rotate(-45deg);
              }
              100% {
                left: 100%;
                bottom: 80%;
                transform: rotate(-45deg);
              }
            }
            
            /* Phase 2: Explosion/Feuerwerk erscheint */
            @keyframes explode {
              0% {
                transform: scale(0) rotate(0deg);
                opacity: 0;
              }
              50% {
                transform: scale(1.2) rotate(180deg);
                opacity: 1;
              }
              100% {
                transform: scale(1) rotate(360deg);
                opacity: 1;
              }
            }
            
            /* Phase 3: Viele 2026er fallen wie Schneeflocken */
            @keyframes fallDown {
              0% {
                top: -200px;
                transform: translateX(0) rotate(0deg);
                opacity: 0;
              }
              10% {
                opacity: 1;
              }
              100% {
                top: 110vh;
                transform: translateX(var(--drift)) rotate(var(--rotation));
                opacity: 1;
              }
            }
            
            /* Sanftes Schwingen beim Fallen */
            @keyframes swing {
              0%, 100% {
                transform: rotate(-3deg);
              }
              50% {
                transform: rotate(3deg);
              }
            }
            
            .newyear-container {
              position: fixed;
              z-index: 9997; /* Unter Santa und Schneeflocken */
              pointer-events: none;
            }
            
            /* Phase 1: Rakete */
            .rocket-phase {
              bottom: -200px;
              left: -300px;
              animation: rocketFly 3s ease-out forwards;
            }
            
            .rocket-img {
              height: 250px;
              width: auto;
              /* Entferne grauen Hintergrund mit Mix-Blend-Mode */
              mix-blend-mode: multiply;
              filter: brightness(1.1);
            }
            
            /* Phase 2: Explosion - Position oben rechts wo Rakete ankommt */
            .explosion-phase {
              right: 5%;
              top: 15%;
            }
            
            .explosion-img {
              width: 600px;
              height: auto;
              animation: explode 2s ease-out forwards;
              /* Entferne Schachbrett-Hintergrund */
              mix-blend-mode: screen;
              filter: contrast(1.2) brightness(1.1);
            }
            
            /* Phase 3: Viele 2026er fallen - Container für alle */
            .falling-phase-container {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              pointer-events: none;
              z-index: 9997;
              overflow: hidden;
            }
            
            /* Einzelne 2026 Fallschirme */
            .year-item {
              position: absolute;
              top: -200px;
              animation: fallDown var(--duration) ease-in forwards;
              animation-delay: var(--delay);
            }
            
            .year-img {
              height: var(--size);
              width: auto;
              animation: swing 2s ease-in-out infinite;
              /* Entferne Schachbrett-Hintergrund */
              mix-blend-mode: screen;
              filter: contrast(1.2) brightness(1.05);
            }
            
            /* Verschiedene Positionen und Geschwindigkeiten für 2026er */
            .year-item:nth-child(1) { left: 10%; --size: 180px; --duration: 8s; --delay: 0s; --drift: 30px; --rotation: 5deg; }
            .year-item:nth-child(2) { left: 25%; --size: 220px; --duration: 10s; --delay: 0.5s; --drift: -20px; --rotation: -8deg; }
            .year-item:nth-child(3) { left: 40%; --size: 200px; --duration: 9s; --delay: 1s; --drift: 40px; --rotation: 12deg; }
            .year-item:nth-child(4) { left: 55%; --size: 190px; --duration: 11s; --delay: 0.3s; --drift: -30px; --rotation: -5deg; }
            .year-item:nth-child(5) { left: 70%; --size: 210px; --duration: 8.5s; --delay: 0.8s; --drift: 25px; --rotation: 8deg; }
            .year-item:nth-child(6) { left: 85%; --size: 195px; --duration: 10.5s; --delay: 0.2s; --drift: -35px; --rotation: -10deg; }
            .year-item:nth-child(7) { left: 15%; --size: 205px; --duration: 9.5s; --delay: 1.2s; --drift: 20px; --rotation: 6deg; }
            .year-item:nth-child(8) { left: 50%; --size: 215px; --duration: 10s; --delay: 0.6s; --drift: -25px; --rotation: -7deg; }
            .year-item:nth-child(9) { left: 35%; --size: 185px; --duration: 8.8s; --delay: 1.5s; --drift: 35px; --rotation: 9deg; }
            .year-item:nth-child(10) { left: 80%; --size: 200px; --duration: 9.2s; --delay: 0.4s; --drift: -20px; --rotation: -6deg; }
            
            @media (max-width: 768px) {
              .rocket-img {
                height: 150px;
              }
              
              .explosion-img {
                width: 400px;
              }
              
              .year-item:nth-child(n) {
                --size: 120px !important;
              }
            }
          `}</style>
          
          {/* Phase 1: Rakete fliegt diagonal nach oben */}
          {newYearPhase === 1 && (
            <div className="newyear-container rocket-phase">
              <img 
                src="/newyear-rocket.png" 
                alt="Schweinchen auf Rakete"
                className="rocket-img"
              />
            </div>
          )}
          
          {/* Phase 2: Explosion/Feuerwerk oben rechts */}
          {newYearPhase === 2 && (
            <div className="newyear-container explosion-phase">
              <img 
                src="/newyear-firework.png" 
                alt="Silvester Feuerwerk"
                className="explosion-img"
              />
            </div>
          )}
          
          {/* Phase 3: VIELE 2026er fallen mit Fallschirm */}
          {newYearPhase === 3 && (
            <div className="falling-phase-container">
              {/* 10 verschiedene 2026 Fallschirme */}
              <div className="year-item">
                <img src="/newyear-2026.png" alt="2026" className="year-img" />
              </div>
              <div className="year-item">
                <img src="/newyear-2026.png" alt="2026" className="year-img" />
              </div>
              <div className="year-item">
                <img src="/newyear-2026.png" alt="2026" className="year-img" />
              </div>
              <div className="year-item">
                <img src="/newyear-2026.png" alt="2026" className="year-img" />
              </div>
              <div className="year-item">
                <img src="/newyear-2026.png" alt="2026" className="year-img" />
              </div>
              <div className="year-item">
                <img src="/newyear-2026.png" alt="2026" className="year-img" />
              </div>
              <div className="year-item">
                <img src="/newyear-2026.png" alt="2026" className="year-img" />
              </div>
              <div className="year-item">
                <img src="/newyear-2026.png" alt="2026" className="year-img" />
              </div>
              <div className="year-item">
                <img src="/newyear-2026.png" alt="2026" className="year-img" />
              </div>
              <div className="year-item">
                <img src="/newyear-2026.png" alt="2026" className="year-img" />
              </div>
            </div>
          )}
        </>
      )}

      <PrintMenu menuData={menu} />
      </div>
    </>
  );
}
