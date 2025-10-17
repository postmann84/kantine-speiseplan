import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PrintMenuPage() {
  const router = useRouter();
  const { year, week } = router.query;
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!year || !week) return;

    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/menu/${year}/${week}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setMenuData(data.data);
          setLoading(false);
        } else {
          setError('Speiseplan nicht gefunden oder nicht veröffentlicht');
          setLoading(false);
        }
      } catch (error) {
        console.error('Fehler beim Laden des Speiseplans:', error);
        setError('Fehler beim Laden des Speiseplans');
        setLoading(false);
      }
    };

    fetchMenu();
  }, [year, week]);

  // Formatiere Codes für Anzeige
  const formatCodesInline = (allergenCodes = [], additiveCodes = []) => {
    const allergens = (allergenCodes || []).map((c) => c.toLowerCase()).join('');
    const additives = (additiveCodes || []).map((c) => String(c)).join('');
    if (!allergens && !additives) return '';
    if (allergens && additives) return `${allergens}${additives}`;
    return allergens || additives;
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <h1>Speiseplan wird geladen...</h1>
        <p>Bitte warten Sie einen Moment.</p>
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <h1>Speiseplan nicht verfügbar</h1>
        <p>{error || 'Für diese Woche ist kein Speiseplan veröffentlicht.'}</p>
        <button 
          onClick={() => window.close()} 
          style={{ marginTop: '10px', padding: '10px 20px', fontSize: '14px' }}
        >
          Fenster schließen
        </button>
      </div>
    );
  }

  return (
    <div>
      <style dangerouslySetInnerHTML={{
        __html: `
          @media screen {
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              background-color: #f5f5f5;
            }
            .screen-controls { 
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              text-align: center; 
              margin-bottom: 20px;
            }
            .print-content {
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 800px;
              margin: 0 auto;
            }
          }
          
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
            
            .screen-controls { display: none !important; }
            .print-content { 
              box-shadow: none !important;
              border-radius: 0 !important;
              padding: 0 !important;
              margin: 0 !important;
              max-width: none !important;
            }
            
            h1 { 
              font-size: 18pt; 
              text-align: center; 
              margin-bottom: 12pt;
              border-bottom: 2pt solid black;
              padding-bottom: 6pt;
              color: black;
            }
            
            h2 { 
              font-size: 14pt; 
              margin: 10pt 0 5pt 0;
              border-bottom: 1pt solid #666;
              padding-bottom: 3pt;
              color: black;
            }
            
            .contact-info { 
              text-align: center; 
              font-size: 10pt; 
              margin-bottom: 15pt;
              color: black;
            }
            
            .day-section { 
              margin-bottom: 10pt; 
              break-inside: avoid; 
            }
            
            .meal-item { 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              margin-bottom: 3pt;
              padding: 2pt 0;
            }
            
            .meal-name { 
              flex: 1; 
              color: black;
            }
            
            .meal-price { 
              min-width: 50pt; 
              text-align: right; 
              font-weight: bold;
              color: black;
            }
            
            .allergen-codes { 
              font-size: 8pt; 
              color: #666; 
              margin-left: 3pt; 
            }
            
            .action-meal { 
              background-color: #fff3cd !important;
              padding: 3pt 5pt;
              border-radius: 3pt;
              border: 1pt solid #f59e0b;
            }
            
            .action-badge { 
              font-size: 8pt; 
              background-color: #fef3c7; 
              color: #92400e; 
              padding: 1pt 3pt; 
              border-radius: 2pt; 
              margin-left: 5pt;
              border: 0.5pt solid #f59e0b;
            }
            
            .vacation-notice {
              background-color: #fef3c7 !important;
              border: 2pt solid #f59e0b !important;
              padding: 10pt;
              margin-bottom: 15pt;
              text-align: center;
              border-radius: 5pt;
            }
            
            footer { 
              margin-top: 15pt; 
              border-top: 1pt solid black; 
              padding-top: 8pt; 
              text-align: center; 
              font-size: 9pt; 
              color: #666; 
            }
            
            .closed-notice {
              font-style: italic;
              color: #666;
              font-size: 10pt;
            }
          }
        `
      }} />

      {/* Screen-Steuerung */}
      <div className="screen-controls">
        <h1 style={{ color: '#333', marginBottom: '15px' }}>Speiseplan Druckvorschau</h1>
        <p style={{ marginBottom: '15px', color: '#666' }}>
          Klicken Sie auf "Drucken" um den Druckdialog zu öffnen:
        </p>
        <button 
          onClick={() => window.print()}
          style={{ 
            backgroundColor: '#007cba', 
            color: 'white', 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            marginRight: '10px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🖨️ Drucken
        </button>
        <button 
          onClick={() => window.close()}
          style={{ 
            backgroundColor: '#666', 
            color: 'white', 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Schließen
        </button>
      </div>

      {/* Druckinhalt */}
      <div className="print-content">
        <h1>Betriebskantine</h1>
        
        <div className="contact-info">
          <p><strong>Telefon:</strong> {menuData?.contactInfo?.phone || ''}</p>
          <p>Für Postfremde erhöht sich der Preis um {menuData?.contactInfo?.postcode || '0.50'} €</p>
        </div>

        {menuData?.vacation?.isOnVacation ? (
          <div className="vacation-notice">
            <p style={{ fontSize: '14pt', color: '#92400e', fontWeight: 'bold', marginBottom: '5pt' }}>
              🌴 {menuData.vacation.message} 🌴
            </p>
            {menuData.vacation.startDate && menuData.vacation.endDate && (
              <p style={{ fontSize: '10pt', color: '#92400e' }}>
                Vom {new Date(menuData.vacation.startDate).toLocaleDateString('de-DE')} bis {new Date(menuData.vacation.endDate).toLocaleDateString('de-DE')}
              </p>
            )}
          </div>
        ) : (
          <div>
            {menuData?.days?.map((day, index) => {
              const startDate = new Date(menuData.weekStart);
              const dayDate = new Date(startDate);
              dayDate.setDate(startDate.getDate() + index);
              
              return (
                <div key={index} className="day-section">
                  <h2>{day.day} ({dayDate.toLocaleDateString('de-DE')})</h2>
                  
                  {day.isClosed ? (
                    <p className="closed-notice">
                      {day.closedReason || 'Heute bleibt unsere Kantine geschlossen.'}
                    </p>
                  ) : (
                    <div>
                      {day.meals?.map((meal, mealIndex) => (
                        <div 
                          key={mealIndex} 
                          className={`meal-item ${meal.isAction ? 'action-meal' : ''}`}
                        >
                          <div className="meal-name">
                            {meal.name}
                            {(meal.allergenCodes?.length > 0 || meal.additiveCodes?.length > 0) && (
                              <sup className="allergen-codes">
                                {formatCodesInline(meal.allergenCodes, meal.additiveCodes)}
                              </sup>
                            )}
                            {meal.isAction && (
                              <span className="action-badge">Aktionsessen</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4pt' }}>
                            {meal.icon && <span style={{ fontSize: '12pt' }}>{meal.icon}</span>}
                            <span className="meal-price">{meal.price.toFixed(2)} €</span>
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

        <footer>
          <p>Bei Fragen zu Inhaltsstoffen und Allergenen kontaktieren Sie uns bitte unter: {menuData?.contactInfo?.phone || ''}</p>
        </footer>
      </div>
    </div>
  );
}