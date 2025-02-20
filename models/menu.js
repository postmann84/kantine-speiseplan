// models/menu.js
import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
  weekStart: {
    type: Date,
    required: true
  },
  weekEnd: {
    type: Date,
    required: true
  },
  days: [{
    day: String,
    meals: [{
      name: String,
      price: Number
    }]
  }],
  contactInfo: {
    phone: String,
    postcode: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
 
export default mongoose.models.Menu || mongoose.model('Menu', MenuSchema);
