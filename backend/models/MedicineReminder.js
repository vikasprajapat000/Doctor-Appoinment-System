const mongoose = require('mongoose');

const MedicineReminderSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  medicineName: {
    type: String,
    required: true
  },
  dosage: {
    type: String, // e.g. "500mg", "1 tablet"
    required: true
  },
  frequency: {
    type: String, // e.g. "Once Daily", "Twice Daily", "Thrice Daily", "Custom"
    default: 'Once Daily'
  },
  times: [
    {
      time: { type: String, required: true }, // "08:00", "14:00", "20:00"
      taken: { type: Boolean, default: false },
      takenAt: Date
    }
  ],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  instructions: {
    type: String, // e.g. "After food"
    default: 'After meals'
  },
  channels: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  logs: [
    {
      date: { type: String }, // YYYY-MM-DD
      time: { type: String },
      status: { type: String, enum: ['taken', 'missed', 'pending'], default: 'pending' },
      notifiedAt: Date
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('MedicineReminder', MedicineReminderSchema);
