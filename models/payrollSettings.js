// models/payrollSettings.js
// Globale Lohn-Einstellungen für die Stundenzettel (Minijob / geringfügige Beschäftigung)
import mongoose from 'mongoose';

const PayrollSettingsSchema = new mongoose.Schema({
  // Gesetzlicher Mindestlohn pro Stunde (Stand 01.01.2026: 13,90 €)
  minimumWage: {
    type: Number,
    default: 13.90
  },
  // Monatliche Verdienstgrenze Minijob (Stand 01.01.2026: 603,00 €)
  monthlyLimit: {
    type: Number,
    default: 603.00
  },
  // Standard-Arbeitsbeginn für den Stundenzettel (Anzeige)
  defaultStartTime: {
    type: String,
    default: '08:00'
  },
  // Öffnungszeiten der Kantine (für den Stundenzettel-Arbeitsbeginn)
  openingStart: {
    type: String,
    default: '07:00'
  },
  openingEnd: {
    type: String,
    default: '14:00'
  },
  // Schicht-Zeitfenster (Randomizer bewegt sich innerhalb dieser Grenzen)
  fruehStart: { type: String, default: '07:00' },
  fruehEnd: { type: String, default: '11:00' },
  spaetStart: { type: String, default: '11:00' },
  spaetEnd: { type: String, default: '14:00' },
  ganztagsStart: { type: String, default: '07:00' },
  ganztagsEnd: { type: String, default: '13:30' },
  // Pause in Minuten pro Arbeitstag
  breakMinutes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.models.PayrollSettings || mongoose.model('PayrollSettings', PayrollSettingsSchema);
