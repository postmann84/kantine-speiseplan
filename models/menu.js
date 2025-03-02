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

const WeekMenuSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  weekStart: {
    type: Date,
    required: true
  },
  weekEnd: {
    type: Date,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
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
WeekMenuSchema.index({ year: 1, weekNumber: 1 }, { unique: true });

// Verbesserte Version des Pre-save Hooks
WeekMenuSchema.pre('save', async function(next) {
  try {
    // Nur wenn das Dokument als veröffentlicht markiert werden soll
    if (this.isPublished) {
      // Setze alle anderen Dokumente auf nicht veröffentlicht
      await mongoose.model('Menu').updateMany(
        { 
          _id: { $ne: this._id },
          isPublished: true 
        },
        { 
          $set: { isPublished: false } 
        }
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware für findOneAndUpdate und findByIdAndUpdate
WeekMenuSchema.pre(['findOneAndUpdate', 'findByIdAndUpdate'], async function(next) {
  try {
    const update = this.getUpdate();
    // Prüfe, ob das Update isPublished auf true setzt
    if (update.$set?.isPublished === true || update.isPublished === true) {
      // Setze alle anderen Dokumente auf nicht veröffentlicht
      await mongoose.model('Menu').updateMany(
        { 
          _id: { $ne: this._conditions._id },
          isPublished: true 
        },
        { 
          $set: { isPublished: false } 
        }
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('Menu', WeekMenuSchema);
