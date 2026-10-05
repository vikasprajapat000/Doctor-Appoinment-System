const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  department: {
    type: String,
    default: 'General'
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    default: () => new Date().toISOString().split('T')[0]
  },
  currentToken: {
    type: Number,
    default: 0
  },
  totalTokens: {
    type: Number,
    default: 0
  },
  avgConsultationTimeMins: {
    type: Number,
    default: 15
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  },
  tokens: [
    {
      tokenNumber: { type: Number, required: true },
      patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
      patientName: { type: String, required: true },
      appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
      status: {
        type: String,
        enum: ['waiting', 'in-consultation', 'completed', 'skipped'],
        default: 'waiting'
      },
      timeSlot: String,
      joinedAt: { type: Date, default: Date.now },
      calledAt: Date,
      completedAt: Date
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Queue', QueueSchema);
