export default function PrintMenu({ menuData }) {
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
              }}>{day.day}</h2>
              
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
                      gap: '6pt',
                      backgroundColor: meal.isAction ? '#fff3cd' : 'transparent',
                      padding: meal.isAction ? '4pt' : '0'
                    }}>
                      <span style={{ fontSize: '12pt' }}>{meal.icon}</span>
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
                      <span style={{ minWidth: '45pt', textAlign: 'right' }}>
                        {meal.price.toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

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