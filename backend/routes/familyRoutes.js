const express = require('express');
const router = express.Router();
const FamilyMember = require('../models/FamilyMember');
const auth = require('../middleware/auth');

// @route GET /api/family/user/:userId
// @desc Get all family profiles for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const familyMembers = await FamilyMember.find({ primaryUser: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: familyMembers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route POST /api/family
// @desc Add a new family member
router.post('/', async (req, res) => {
  try {
    const { primaryUser, name, relationship, gender, dateOfBirth, age, bloodGroup, allergies, chronicConditions, emergencyContact } = req.body;

    const member = new FamilyMember({
      primaryUser,
      name,
      relationship,
      gender,
      dateOfBirth,
      age: age || (dateOfBirth ? Math.floor((new Date() - new Date(dateOfBirth)) / 31557600000) : undefined),
      bloodGroup: bloodGroup || 'Unknown',
      allergies: Array.isArray(allergies) ? allergies : (allergies ? allergies.split(',').map(s => s.trim()) : []),
      chronicConditions: Array.isArray(chronicConditions) ? chronicConditions : (chronicConditions ? chronicConditions.split(',').map(s => s.trim()) : []),
      emergencyContact
    });

    await member.save();
    res.status(201).json({ success: true, message: 'Family member profile added', data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding family member', error: error.message });
  }
});

// @route DELETE /api/family/:id
// @desc Delete a family member
router.delete('/:id', async (req, res) => {
  try {
    await FamilyMember.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Family member profile deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting family member', error: error.message });
  }
});

module.exports = router;
