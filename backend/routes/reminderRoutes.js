const express = require('express');
const router = express.Router();
const MedicineReminder = require('../models/MedicineReminder');
const auth = require('../middleware/auth');

// @route GET /api/reminders/patient/:patientId
// @desc Get all medicine reminders for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const reminders = await MedicineReminder.find({ patient: req.params.patientId }).sort({ createdAt: -1 });
    res.json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route POST /api/reminders
// @desc Create a new medicine reminder
router.post('/', async (req, res) => {
  try {
    const { patient, medicineName, dosage, frequency, times, startDate, endDate, instructions, channels } = req.body;

    const reminder = new MedicineReminder({
      patient,
      medicineName,
      dosage,
      frequency,
      times: times || [{ time: '09:00', taken: false }, { time: '21:00', taken: false }],
      startDate: startDate || new Date(),
      endDate,
      instructions,
      channels: channels || { email: true, sms: true, whatsapp: true, push: true }
    });

    await reminder.save();
    res.status(201).json({ success: true, message: 'Medicine reminder created', data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating reminder', error: error.message });
  }
});

// @route PUT /api/reminders/:id/take
// @desc Mark a dose as taken
router.put('/:id/take', async (req, res) => {
  try {
    const { timeIndex } = req.body;
    const reminder = await MedicineReminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    if (reminder.times && reminder.times[timeIndex]) {
      reminder.times[timeIndex].taken = true;
      reminder.times[timeIndex].takenAt = new Date();
    }

    reminder.logs.push({
      date: new Date().toISOString().split('T')[0],
      time: reminder.times[timeIndex] ? reminder.times[timeIndex].time : new Date().toLocaleTimeString(),
      status: 'taken',
      notifiedAt: new Date()
    });

    await reminder.save();
    res.json({ success: true, message: 'Dose marked as taken!', data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating reminder', error: error.message });
  }
});

// @route DELETE /api/reminders/:id
// @desc Delete a reminder
router.delete('/:id', async (req, res) => {
  try {
    await MedicineReminder.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting reminder', error: error.message });
  }
});

module.exports = router;
