import { formatDate } from '../lib/dateUtils';

export default function PrintMenu({ menuData }) {
  // Funktion zum Berechnen des Datums für jeden Tag
  const getDayDate = (index) => {
    const startDate = new Date(menuData.weekStart);
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return formatDate(date);
  };

  return (
    <div className="print-only" style={{ display: 'none' }}>
      <div className="print-content">
        <h1 style={{ 
          fontSize: '16pt', 
          marginBottom: '8pt',
          textAlign: 'center'
        }}>Betriebskantine</h1>
        
        <div className="contact-info" style={{ 
          marginBottom: '8pt',
          fontSize: '9pt',
          textAlign: 'center'
        }}>
          <p>Telefon: {menuData?.contactInfo?.phone}</p>
          <p>Für Postfremde erhöht sich der Preis um {menuData?.contactInfo?.postcode} €</p>
        </div>

        {/* Urlaubshinweis */}
        {menuData?.vacation?.isOnVacation ? (
          <div style={{
            backgroundColor: '#fef3c7',
            padding: '12pt',
            marginBottom: '12pt',
            borderRadius: '4pt',
            textAlign: 'center'
          }}>
            <p style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8pt',
              fontSize: '12pt',
              color: '#92400e',
              marginBottom: '8pt'
            }}>
              <span style={{ fontSize: '16pt' }}>🌴</span>
              {menuData.vacation.message}
              <span style={{ fontSize: '16pt' }}>🌴</span>
            </p>
            {menuData.vacation.startDate && menuData.vacation.endDate && (
              <p style={{ 
                fontSize: '10pt', 
                color: '#92400e',
                borderTop: '1pt dashed #f59e0b',
                paddingTop: '8pt',
                marginTop: '8pt'
              }}>
                Vom {formatDate(menuData.vacation.startDate)} bis {formatDate(menuData.vacation.endDate)}
              </p>
            )}
          </div>
        ) : (
          <div className="menu-content">
            {menuData?.days?.map((day, index) => (
              <div key={index} className="day-section" style={{ 
                marginBottom: '10pt',
                pageBreakInside: 'avoid'
              }}>
                <h2 style={{ 
                  fontSize: '11pt', 
                  marginBottom: '4pt',
                  borderBottom: '0.5pt solid #000',
                  paddingBottom: '2pt'
                }}>{day.day} ({getDayDate(index)})</h2>
                
                {day.isClosed ? (
                  <p style={{ 
                    fontStyle: 'italic',
                    fontSize: '9pt'
                  }}>
                    {day.closedReason || 'Heute bleibt unsere Kantine geschlossen.'}
                  </p>
                ) : (
                  <div className="meals" style={{ fontSize: '9pt' }}>
                    {day.meals?.map((meal, mealIndex) => (
                      <div key={mealIndex} style={{
                        marginBottom: '3pt',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: meal.isAction ? '#fff3cd' : 'transparent',
                        padding: meal.isAction ? '4pt' : '0'
                      }}>
                        <span style={{ flex: 1 }}>
                          {meal.name}
                          {meal.isAction && (
                            <span style={{ 
                              fontSize: '8pt',
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              padding: '2pt 4pt',
                              borderRadius: '2pt',
                              marginLeft: '4pt'
                            }}>
                              Aktionsessen
                            </span>
                          )}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4pt' }}>
                          {meal.icon && <span style={{ fontSize: '12pt' }}>{meal.icon}</span>}
                          <span style={{ minWidth: '45pt', textAlign: 'right' }}>
                            {meal.price.toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <footer style={{
          marginTop: '8pt',
          borderTop: '0.5pt solid #000',
          paddingTop: '4pt',
          textAlign: 'center',
          fontSize: '8pt',
          color: '#666'
        }}>
          <p>Bei Fragen zu Inhaltsstoffen und Allergenen kontaktieren Sie uns bitte unter: {menuData?.contactInfo?.phone}</p>
        </footer>
      </div>
    </div>
  );
} 