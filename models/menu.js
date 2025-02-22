// models/menu.js
import mongoose from 'mongoose';

// Löschen Sie zuerst alle existierenden Models
mongoose.models = {};

const MealSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  isAction: {
    type: Boolean,
    default: false
  },
  actionNote: {
    type: String,
    default: ''
  }
});

const DaySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true
  },
  meals: [MealSchema],
  isClosed: {
    type: Boolean,
    default: false
  },
  closedReason: {
    type: String,
    default: ''
  }
});

const MenuSchema = new mongoose.Schema({
  weekStart: {
    type: Date,
    required: true
  },
  weekEnd: {
    type: Date,
    required: true
  },
  days: [DaySchema],
  contactInfo: {
    phone: String,
    postcode: String
  },
  vacation: {
    isOnVacation: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date,
    message: {
      type: String,
      default: 'Wir befinden uns im Urlaub.'
    }
  }
}, {
  timestamps: true
});

// Compound Index für schnelle Suche
MenuSchema.index({ year: 1, weekNumber: 1 });

export default mongoose.model('Menu', MenuSchema);
