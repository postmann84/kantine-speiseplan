export function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.`;
}

// Neue Funktion für vollständiges Datum mit Jahr
export function formatFullDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear();
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

export {
  getISOWeek,
  getMondayOfWeek,
  getFridayOfWeek
}; 