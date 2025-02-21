import Holidays from 'date-holidays';

const hd = new Holidays('DE', 'NI'); // DE für Deutschland, NI für Niedersachsen

// Liste der besonderen Tage, die keine arbeitsfreien Feiertage sind
const SPECIAL_DAYS = {
  'Weiberfastnacht': { type: 'special', color: 'purple' },
  'Rosenmontag': { type: 'special', color: 'purple' },
  'Faschingsdienstag': { type: 'special', color: 'purple' },
  'Aschermittwoch': { type: 'special', color: 'purple' },
  'Nikolaus': { type: 'special', color: 'red' },
  'Heiligabend': { type: 'special', color: 'red' },
  'Silvester': { type: 'special', color: 'blue' }
};

export function checkDay(dateString) {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const holiday = hd.isHoliday(date);
  
  if (holiday) {
    const holidayName = holiday[0].name;
    
    // Prüfen ob es ein spezieller Tag ist
    if (SPECIAL_DAYS[holidayName]) {
      return {
        name: holidayName,
        type: 'special',
        ...SPECIAL_DAYS[holidayName]
      };
    }
    
    // Ansonsten ist es ein echter Feiertag
    return {
      name: holidayName,
      type: 'holiday',
      color: 'red'
    };
  }
  
  return null;
}

export function getHolidaysForWeek(weekStart) {
  const days = {};
  const startDate = new Date(weekStart);

  for (let i = 0; i < 5; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const dateKey = currentDate.toISOString().split('T')[0];
    const dayInfo = checkDay(currentDate);
    
    if (dayInfo) {
      days[dateKey] = dayInfo;
    }
  }

  return days;
} 