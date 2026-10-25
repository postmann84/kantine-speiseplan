// lib/timesheetPdf.js
// Erzeugt professionelle Stundenzettel-PDFs (Arbeitszeitnachweis gem. § 17 MiLoG)
// für geringfügig Beschäftigte (Minijob). Nur im Browser verwenden (dynamischer Import).
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import JSZip from 'jszip';

const MONTH_NAMES = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

const COMPANY_NAME = 'Rainer Westermann Kantine';
const OWNER_NAME = 'Rainer Westermann';

export function computeCalc(workingDays, settings) {
  const wage = Number(settings.minimumWage) || 0;
  const limit = Number(settings.monthlyLimit) || 0;
  const maxHoursMonth = wage > 0 ? limit / wage : 0;
  const numDays = (workingDays && workingDays.length) || 0;
  // Abrunden, damit die Verdienstgrenze nie überschritten wird
  const hoursPerDay = numDays > 0 ? Math.floor((maxHoursMonth / numDays) * 100) / 100 : 0;
  const totalHours = Math.round(hoursPerDay * numDays * 100) / 100;
  const totalWage = Math.round(totalHours * wage * 100) / 100;
  const weeklyHours = Math.round((totalHours / 4.33) * 100) / 100;
  return { wage, limit, maxHoursMonth, numDays, hoursPerDay, totalHours, totalWage, weeklyHours };
}

function num(n, dec = 2) {
  return n.toFixed(dec).replace('.', ',');
}

function addMinutesToTime(start, hoursDecimal, breakMin = 0) {
  const [h, m] = (start || '07:00').split(':').map(Number);
  const totalMin = (h * 60) + m + Math.round(hoursDecimal * 60) + Number(breakMin || 0);
  const eh = Math.floor(totalMin / 60) % 24;
  const em = totalMin % 60;
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
}

function durationLabel(hoursDecimal) {
  const total = Math.round(hoursDecimal * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}:${String(m).padStart(2, '0')} h`;
}

function minLabel(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${String(m).padStart(2, '0')} h`;
}

function parseHM(s) {
  const [h, m] = (s || '0:0').split(':').map(Number);
  return (h * 60) + (m || 0);
}

function fmtHM(min) {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const SHIFT_LABELS = {
  frueh: 'Frühschicht',
  spaet: 'Spätschicht',
  ganztags: 'Ganztagsschicht'
};

function getShiftWindow(shift, settings) {
  if (shift === 'frueh') return [parseHM(settings.fruehStart || '07:00'), parseHM(settings.fruehEnd || '11:00')];
  if (shift === 'spaet') return [parseHM(settings.spaetStart || '11:00'), parseHM(settings.spaetEnd || '14:00')];
  return [parseHM(settings.ganztagsStart || '07:00'), parseHM(settings.ganztagsEnd || '13:30')];
}

// Deterministischer Zufallsgenerator (gleicher Mitarbeiter + Monat => gleiches Ergebnis)
function makeRng(seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Erzeugt einen randomisierten, aber reproduzierbaren Monatsplan innerhalb der Minijob-Grenze
export function buildSchedule({ workingDays, settings, employee, year, month }) {
  const calc = computeCalc(workingDays, settings);
  const breakMin = Number(settings.breakMinutes) || 0;
  const shift = employee.shift || 'ganztags';
  const [winStart, winEnd] = getShiftWindow(shift, settings);
  const winLen = Math.max(60, winEnd - winStart);
  const numDays = calc.numDays;
  const rng = makeRng(`${employee._id || employee.firstName}-${year}-${month}`);

  if (numDays === 0) return { rows: [], totalMin: 0, calc, breakMin, shift, winStart, winEnd };

  // Zielsumme in 5-Min-Schritten, immer unter der Verdienstgrenze
  const targetTotal = Math.floor((calc.maxHoursMonth * 60) / 5) * 5;
  const maxDay = Math.max(30, winLen - breakMin);
  const minDay = 30;
  const avg = targetTotal / numDays;

  // Grunddauer je Tag mit leichtem Zufall (±10 Min)
  let dayMin = workingDays.map(() => {
    const jitter = (Math.floor(rng() * 5) - 2) * 5; // -10..+10
    let v = Math.round(avg / 5) * 5 + jitter;
    return Math.min(maxDay, Math.max(minDay, v));
  });

  // Summe exakt auf das Ziel justieren (bleibt unter der Grenze)
  let sum = dayMin.reduce((a, b) => a + b, 0);
  let guard = 0;
  while (sum !== targetTotal && guard < 200000) {
    const i = Math.floor(rng() * numDays);
    if (sum > targetTotal && dayMin[i] > minDay) { dayMin[i] -= 5; sum -= 5; }
    else if (sum < targetTotal && dayMin[i] < maxDay) { dayMin[i] += 5; sum += 5; }
    guard++;
  }

  const rows = workingDays.map((iso, idx) => {
    const dur = dayMin[idx];
    const span = dur + breakMin; // belegte Zeit inkl. Pause
    const latestOffset = Math.max(0, winLen - span);
    const startOffset = Math.round((rng() * latestOffset) / 5) * 5;
    const startMin = winStart + startOffset;
    const endMin = startMin + span;
    return { iso, startMin, endMin, breakMin, durMin: dur };
  });

  const totalMin = dayMin.reduce((a, b) => a + b, 0);
  return { rows, totalMin, calc, breakMin, shift, winStart, winEnd };
}

function sanitizeFile(str) {
  return (str || '')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss')
    .replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

// Logo von /logo.png laden, herunterskalieren und als JPEG-DataURL zurückgeben
export async function loadLogoDataUrl() {
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = '/logo.png';
    });
    const maxW = 320;
    const scale = Math.min(1, maxW / img.width);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return { dataUrl: canvas.toDataURL('image/jpeg', 0.9), w, h };
  } catch (e) {
    return null;
  }
}

// Baut ein jsPDF-Dokument für einen Monat
export function buildMonthDoc({ employee, year, month, workingDays, settings, logo }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 15;
  const schedule = buildSchedule({ workingDays, settings, employee, year, month });
  const calc = schedule.calc;
  const breakMin = schedule.breakMin;
  const totalMin = schedule.totalMin;
  const totalHours = totalMin / 60;
  const totalWage = Math.round((totalHours * calc.wage) * 100) / 100;
  const avgPerDayMin = calc.numDays > 0 ? totalMin / calc.numDays : 0;
  const shiftLabel = SHIFT_LABELS[schedule.shift] || 'Ganztagsschicht';
  const shiftWindow = `${fmtHM(schedule.winStart)}–${fmtHM(schedule.winEnd)}`;
  const fullName = `${employee.firstName} ${employee.lastName || ''}`.trim();
  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  // --- Kopfbereich ---
  let logoRight = margin;
  if (logo && logo.dataUrl) {
    const logoH = 16;
    const logoW = Math.min(45, logoH * (logo.w / logo.h));
    doc.addImage(logo.dataUrl, 'JPEG', margin, 12, logoW, logoH);
    logoRight = margin + logoW;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30);
  doc.text(COMPANY_NAME, pageW - margin, 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(`Inhaber: ${OWNER_NAME}`, pageW - margin, 21, { align: 'right' });

  // Trennlinie
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(margin, 31, pageW - margin, 31);

  // Titel
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(20);
  doc.text('Arbeitszeitnachweis / Stundenzettel', margin, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text('Geringfügige Beschäftigung (Minijob) – Aufzeichnung gem. § 17 MiLoG', margin, 45.5);

  // Info-Block (zwei Spalten)
  const infoY = 55;
  doc.setFontSize(10);
  const labelVal = (x, y, label, value) => {
    doc.setTextColor(120);
    doc.setFont('helvetica', 'normal');
    doc.text(label, x, y);
    doc.setTextColor(20);
    doc.setFont('helvetica', 'bold');
    doc.text(String(value), x + 36, y);
  };
  labelVal(margin, infoY, 'Mitarbeiter/in:', fullName || '—');
  labelVal(margin, infoY + 6, 'Personal-Nr.:', employee.personnelNumber || '—');
  labelVal(pageW / 2, infoY, 'Abrechnungsmonat:', monthLabel);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.setFont('helvetica', 'normal');
  doc.text('Schicht:', margin, infoY + 12);
  doc.setTextColor(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`${shiftLabel} (${shiftWindow})`, margin + 36, infoY + 12);

  // --- Tabelle ---
  const head = [['Datum', 'Wochentag', 'Beginn', 'Ende', 'Pause', 'Arbeitszeit']];
  const body = schedule.rows.map((r) => {
    const d = new Date(r.iso + 'T12:00:00');
    const dateStr = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return [
      dateStr,
      WEEKDAYS[d.getDay()],
      fmtHM(r.startMin),
      fmtHM(r.endMin),
      `${r.breakMin} min`,
      minLabel(r.durMin)
    ];
  });

  autoTable(doc, {
    head,
    body,
    foot: [['', '', '', '', 'Summe', minLabel(totalMin)]],
    startY: infoY + 18,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 1.4, textColor: 30, lineColor: [210, 210, 210] },
    headStyles: { fillColor: [55, 48, 163], textColor: 255, fontStyle: 'bold', halign: 'left' },
    footStyles: { fillColor: [238, 240, 247], textColor: 20, fontStyle: 'bold' },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' }
    }
  });

  let y = doc.lastAutoTable.finalY + 7;

  // Platz prüfen – Zusammenfassung + Unterschriften + Hinweis brauchen ~60mm
  if (y > pageH - 64) {
    doc.addPage();
    y = 20;
  }

  // --- Zusammenfassung ---
  const rows = [
    ['Arbeitstage im Monat', String(calc.numDays)],
    ['Ø Stunden pro Tag', `${minLabel(Math.round(avgPerDayMin))}`],
    ['Stunden gesamt', `${num(totalHours)} h`]
  ];
  const boxH = 10 + Math.ceil(rows.length / 2) * 6;
  doc.setDrawColor(210);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageW - 2 * margin, boxH, 2, 2, 'FD');
  doc.setFontSize(9.5);
  let ry = y + 6;
  const colX = margin + 4;
  const valX = pageW - margin - 4;
  // zweispaltig anordnen
  const half = Math.ceil(rows.length / 2);
  rows.forEach((r, i) => {
    const isLeft = i < half;
    const cx = isLeft ? colX : (pageW / 2) + 2;
    const vx = isLeft ? (pageW / 2) - 4 : valX;
    const lineY = y + 6 + (isLeft ? i : (i - half)) * 6;
    doc.setTextColor(90);
    doc.setFont('helvetica', 'normal');
    doc.text(r[0], cx, lineY);
    doc.setTextColor(20);
    doc.setFont('helvetica', 'bold');
    doc.text(r[1], vx, lineY, { align: 'right' });
  });

  y += boxH + 10;

  // --- Unterschriften (fließend unter der Zusammenfassung) ---
  const sigW = (pageW - 2 * margin - 20) / 2;
  const leftX = margin;
  const rightX = margin + sigW + 20;
  doc.setDrawColor(60);
  doc.setLineWidth(0.3);
  doc.line(leftX, y, leftX + sigW, y);
  doc.line(rightX, y, rightX + sigW, y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text(fullName || 'Arbeitnehmer/in', leftX, y + 5);
  doc.text(`${OWNER_NAME} (Inhaber)`, rightX, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110);
  doc.setFontSize(8);
  doc.text('Ort, Datum, Unterschrift Arbeitnehmer/in', leftX, y + 9);
  doc.text('Ort, Datum, Unterschrift Arbeitgeber', rightX, y + 9);

  y += 16;

  // --- Rechtlicher Hinweis ---
  doc.setFontSize(7.5);
  doc.setTextColor(140);
  doc.text('Aufzeichnung der täglichen Arbeitszeit gem. § 17 MiLoG. Aufbewahrungsfrist mindestens 2 Jahre. Dauer = Arbeitszeit abzüglich Pausen.', margin, y, { maxWidth: pageW - 2 * margin });

  return doc;
}

export function monthFileName(employee, year, month) {
  const fullName = `${employee.firstName}_${employee.lastName || ''}`;
  return `Stundenzettel_${sanitizeFile(fullName)}_${year}-${String(month).padStart(2, '0')}.pdf`;
}

// Einzelnen Monat herunterladen
export function downloadMonthPdf({ employee, year, month, workingDays, settings, logo }) {
  const doc = buildMonthDoc({ employee, year, month, workingDays, settings, logo });
  doc.save(monthFileName(employee, year, month));
}

// Ganzes Jahr als ZIP (je Monat eine PDF-Datei)
// fetchMonth(month) muss ein Array von Arbeitstagen (ISO-Strings) liefern.
export async function downloadYearZip({ employee, year, settings, logo, fetchMonth }) {
  const zip = new JSZip();
  let added = 0;
  for (let month = 1; month <= 12; month++) {
    const workingDays = await fetchMonth(month);
    if (!workingDays || workingDays.length === 0) continue; // Monate ohne Öffnungstage überspringen
    const doc = buildMonthDoc({ employee, year, month, workingDays, settings, logo });
    const buf = doc.output('arraybuffer');
    zip.file(monthFileName(employee, year, month), buf);
    added++;
  }
  if (added === 0) return 0;
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Stundenzettel_${sanitizeFile(`${employee.firstName}_${employee.lastName || ''}`)}_${year}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return added;
}
