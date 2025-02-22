import Holidays from 'date-holidays';

const hd = new Holidays('DE', 'NI'); // DE für Deutschland, NI für Niedersachsen

// Spezielle Tage, die nur als Information angezeigt werden
const SPECIAL_DAYS = {
  '02-14': { name: 'Valentinstag', type: 'info', color: 'red', forceClose: false },
  '12-06': { name: 'Nikolaus', type: 'info', color: 'red', forceClose: false },
  '12-24': { name: 'Heiligabend', type: 'special', color: 'red', forceClose: true },
  '12-31': { name: 'Silvester', type: 'special', color: 'blue', forceClose: true }
};

// Feste Feiertage und besondere Tage
const FIXED_DAYS = {
  '01-01': { name: 'Neujahr', type: 'holiday' },
  '05-01': { name: 'Tag der Arbeit', type: 'holiday' },
  '10-03': { name: 'Tag der Deutschen Einheit', type: 'holiday' },
  '12-25': { name: 'Weihnachten', type: 'holiday' },
  '12-26': { name: '2. Weihnachtstag', type: 'holiday' }
};

// Gauss'sche Osterformel
function calculateEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}

// Hilfsfunktion zum Formatieren des Datums (MM-DD)
function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

// Berechnung von Weiberfastnacht (52 Tage vor Ostern)
function calculateWeiberfastnacht(year) {
  const easter = calculateEaster(year);
  const weiberfastnacht = new Date(easter);
  weiberfastnacht.setDate(easter.getDate() - 52);
  return weiberfastnacht;
}

export function getHolidaysForWeek(startDate) {
  const result = {};
  
  // Prüfe 5 Tage ab startDate
  for (let i = 0; i < 5; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Berechne Weiberfastnacht für das aktuelle Jahr
    const weiberfastnacht = calculateWeiberfastnacht(currentDate.getFullYear());
    
    // Prüfe ob der aktuelle Tag Weiberfastnacht ist
    if (currentDate.getDate() === weiberfastnacht.getDate() && 
        currentDate.getMonth() === weiberfastnacht.getMonth()) {
      result[dateStr] = {
        name: 'Weiberfastnacht',
        type: 'info',
        color: 'pink',
        forceClose: false
      };
      continue;
    }
    
    // Formatiere das Datum für den Vergleich
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const mmdd = `${month}-${day}`;
    
    // Prüfe zuerst gesetzliche Feiertage
    if (FIXED_DAYS[mmdd]) {
      result[dateStr] = {
        ...FIXED_DAYS[mmdd],
        forceClose: true
      };
      continue;
    }
    
    // Prüfe dann spezielle Tage
    if (SPECIAL_DAYS[mmdd]) {
      result[dateStr] = {
        ...SPECIAL_DAYS[mmdd],
        forceClose: SPECIAL_DAYS[mmdd].forceClose || false
      };
      continue;
    }
    
    // Prüfe bewegliche Feiertage über date-holidays
    const holiday = hd.isHoliday(currentDate);
    if (holiday) {
      result[dateStr] = {
        name: holiday[0].name,
        type: 'holiday',
        color: 'red',
        forceClose: true
      };
    }
  }
  
  return result;
}

export function checkDay(dateString) {
  const date = new Date(dateString);
  const holiday = hd.isHoliday(date);
  
  if (holiday) {
    return {
      name: holiday[0].name,
      type: 'holiday',
      color: 'red',
      forceClose: true
    };
  }
  
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const mmdd = `${month}-${day}`;
  
  return SPECIAL_DAYS[mmdd] ? { ...SPECIAL_DAYS[mmdd] } : null;
} 