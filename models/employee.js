// models/employee.js
import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    default: '',
    trim: true
  },
  personnelNumber: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  },
  // Schicht: 'frueh' | 'spaet' | 'ganztags'
  shift: {
    type: String,
    default: 'ganztags'
  },
  // Optionaler eigener Monats-Stundendeckel (0 = volle Minijob-Grenze)
  maxMonthlyHours: {
    type: Number,
    default: 0
  },
  // true = Anwesenheitstage werden pro Monat manuell angekreuzt
  manualDays: {
    type: Boolean,
    default: false
  },
  // Angekreuzte Anwesenheitstage je Monat: { 'YYYY-MM': ['YYYY-MM-DD', ...] }
  presence: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
