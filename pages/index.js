import React, { useState, useEffect } from 'react';
import { getHolidaysForWeek } from '../lib/holidays';
import { formatDate, isSameDay, formatFullDate } from '../lib/dateUtils';
import { QRCodeSVG } from 'qrcode.react';
import PrintMenu from '../components/PrintMenu';

export default function Home() {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [holidays, setHolidays] = useState({});

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
        // Hole Feiertage nur wenn kein Urlaub aktiv ist
        if (!data.data.vacation?.isOnVacation) {
          const weekHolidays = getHolidaysForWeek(data.data.weekStart);
          setHolidays(weekHolidays);
        }
      } catch (error) {
        setError('Fehler beim Laden des Speiseplans');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

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
      <div key={index} className={`mb-6 rounded-lg shadow-md overflow-hidden
        ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}
        ${isVacationDay ? 'bg-yellow-50' : 'bg-white'}`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {day.day} ({formatDate(dayDate)})
            </h2>
            {isVacationDay && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Urlaubstag 🏖️
              </span>
            )}
          </div>

          {isVacationDay ? (
            <div className="mt-4 p-4 text-center">
              <p className="text-yellow-800 text-lg">
                {menu.vacation.message || 'Wir befinden uns im Urlaub.'}
              </p>
              <p className="text-yellow-700 text-sm mt-2">
                Urlaub vom {formatFullDate(menu.vacation.startDate)} bis {formatFullDate(menu.vacation.endDate)}
              </p>
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
                          <span className="mr-2 font-medium">{meal.name}</span>
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
        </div>
      </div>
    );
  };

  // Normaler Return für nicht-Urlaubszeit
  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Betriebskantine</h1>
        <div className="mt-2 text-sm text-gray-600">
          <p>Telefon: {menu.contactInfo?.phone}</p>
          <p>Für Postfremde erhöht sich der Preis um {menu.contactInfo?.postcode} €</p>
        </div>
        <div className="mt-4 no-print">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <span>🖨️</span>
            <span>Speiseplan drucken</span>
          </button>
        </div>
      </header>

      <main>
        {menu.days?.map((day, index) => renderDay(day, index))}
      </main>

      <footer className="mt-8 text-center text-gray-500 text-sm space-y-4 border-t pt-4">
        <p>Bei Fragen zu Inhaltsstoffen und Allergenen kontaktieren Sie uns bitte unter: {menu.contactInfo?.phone}</p>
        
        <div className="flex flex-col items-center mt-4">
          <p className="mb-2">Speiseplan direkt auf dem Smartphone:</p>
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <QRCodeSVG 
              value={typeof window !== 'undefined' ? window.location.href : ''}
              size={100}
              level="L"
              includeMargin={true}
            />
          </div>
        </div>
        
        <p>© {new Date().getFullYear()}</p>
      </footer>

      <PrintMenu menuData={menu} />
    </div>
  );
}
