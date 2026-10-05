const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['Bill', 'Payment', 'bill', 'payment'],
    default: 'Bill'
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue', 'pending', 'paid', 'overdue'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    default: ''
  },
  paymentDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Sync patient and patientId before saving
billingSchema.pre('save', function(next) {
  if (this.patientId && !this.patient) {
    this.patient = this.patientId;
  } else if (this.patient && !this.patientId) {
    this.patientId = this.patient;
  }
  if (this.doctorId && !this.doctor) {
    this.doctor = this.doctorId;
  } else if (this.doctor && !this.doctorId) {
    this.doctorId = this.doctor;
  }
  next();
});

module.exports = mongoose.model('Billing', billingSchema);