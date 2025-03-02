export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Neue Funktion für vollständiges Datum mit Jahr
export function formatFullDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

// ISO Kalenderwoche berechnen
const getISOWeek = (date) => {
  const target = new Date(date);
  const dayNr = (target.getDay() + 6) % 7;
  
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  
  return 1 + Math.ceil((firstThursday - target) / 604800000);
};

// Montag einer bestimmten Woche berechnen
const getMondayOfWeek = (year, week) => {
  const jan4th = new Date(year, 0, 4);
  const jan4thDay = jan4th.getDay();
  
  // Finde den ersten Montag des Jahres
  const firstMonday = new Date(year, 0, 4 - jan4thDay + 1);
  
  // Gehe zur gewünschten Woche
  const targetMonday = new Date(firstMonday);
  targetMonday.setDate(firstMonday.getDate() + (week - 1) * 7);
  
  return targetMonday;
};

// Freitag einer Woche berechnen
const getFridayOfWeek = (mondayDate) => {
  const friday = new Date(mondayDate);
  friday.setDate(mondayDate.getDate() + 4);
  return friday;
};

// Berechnet die Kalenderwoche für ein gegebenes Datum
export function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return {
    year: d.getFullYear(),
    week: weekNo
  };
}

// Berechnet Start- und Enddatum einer Kalenderwoche
export function getWeekDates(year, week) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const weekStart = new Date(simple);
  weekStart.setDate(simple.getDate() - dow + 1);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 4); // Freitag

  return {
    start: weekStart,
    end: weekEnd
  };
}

export {
  getISOWeek,
  getMondayOfWeek,
  getFridayOfWeek
}; 