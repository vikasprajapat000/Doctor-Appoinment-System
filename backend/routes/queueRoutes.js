const express = require('express');
const router = express.Router();
const Queue = require('../models/Queue');
const auth = require('../middleware/auth');

// @route GET /api/queue/doctor/:doctorId
// @desc Get active queue for a specific doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let queue = await Queue.findOne({ doctor: req.params.doctorId, date: today })
      .populate('doctor', 'name specialization department')
      .populate('tokens.patientId', 'name phone email');

    if (!queue) {
      // Return a default initial state
      return res.json({
        success: true,
        data: {
          doctor: req.params.doctorId,
          date: today,
          currentToken: 0,
          totalTokens: 0,
          avgConsultationTimeMins: 15,
          status: 'active',
          tokens: []
        }
      });
    }

    res.json({ success: true, data: queue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route GET /api/queue/patient/:patientId
// @desc Get current token status and estimated wait time for patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const queues = await Queue.find({
      date: today,
      'tokens.patientId': req.params.patientId
    }).populate('doctor', 'name specialization roomNumber');

    const patientQueues = queues.map(q => {
      const myToken = q.tokens.find(t => t.patientId && t.patientId.toString() === req.params.patientId.toString());
      const tokensAhead = myToken && myToken.tokenNumber > q.currentToken 
        ? myToken.tokenNumber - q.currentToken - 1 
        : 0;
      const estimatedWaitTime = tokensAhead * (q.avgConsultationTimeMins || 15);

      return {
        queueId: q._id,
        doctor: q.doctor,
        currentToken: q.currentToken,
        yourToken: myToken ? myToken.tokenNumber : null,
        tokenStatus: myToken ? myToken.status : null,
        tokensAhead,
        estimatedWaitTimeMins: Math.max(0, estimatedWaitTime),
        queueStatus: q.status
      };
    });

    res.json({ success: true, data: patientQueues });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route POST /api/queue/join
// @desc Add a patient token to a doctor queue
router.post('/join', async (req, res) => {
  try {
    const { doctorId, patientId, patientName, appointmentId, timeSlot } = req.body;
    const today = new Date().toISOString().split('T')[0];

    let queue = await Queue.findOne({ doctor: doctorId, date: today });
    if (!queue) {
      queue = new Queue({
        doctor: doctorId,
        date: today,
        currentToken: 1,
        totalTokens: 0,
        tokens: []
      });
    }

    const nextTokenNumber = queue.totalTokens + 1;
    queue.totalTokens = nextTokenNumber;
    queue.tokens.push({
      tokenNumber: nextTokenNumber,
      patientId,
      patientName: patientName || 'Patient',
      appointmentId,
      timeSlot,
      status: 'waiting'
    });

    await queue.save();

    // Broadcast if io instance exists
    const io = req.app.get('io');
    if (io) {
      io.emit(`queue:update:${doctorId}`, queue);
    }

    res.json({
      success: true,
      message: 'Joined queue successfully',
      data: {
        tokenNumber: nextTokenNumber,
        currentToken: queue.currentToken,
        queue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to join queue', error: error.message });
  }
});

// @route PUT /api/queue/advance
// @desc Doctor calls next token in queue
router.put('/advance', async (req, res) => {
  try {
    const { doctorId, nextTokenNumber } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const queue = await Queue.findOne({ doctor: doctorId, date: today });
    if (!queue) {
      return res.status(404).json({ success: false, message: 'Queue not found' });
    }

    const targetToken = nextTokenNumber !== undefined ? nextTokenNumber : queue.currentToken + 1;
    queue.currentToken = targetToken;

    // Update token statuses
    queue.tokens.forEach(t => {
      if (t.tokenNumber < targetToken && t.status === 'waiting') {
        t.status = 'completed';
        t.completedAt = new Date();
      } else if (t.tokenNumber === targetToken) {
        t.status = 'in-consultation';
        t.calledAt = new Date();
      }
    });

    await queue.save();

    const io = req.app.get('io');
    if (io) {
      io.emit(`queue:update:${doctorId}`, queue);
      io.emit(`queue:token-called`, { doctorId, tokenNumber: targetToken });
    }

    res.json({ success: true, message: 'Queue advanced', data: queue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to advance queue', error: error.message });
  }
});

module.exports = router;
