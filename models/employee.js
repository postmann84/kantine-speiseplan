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
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
