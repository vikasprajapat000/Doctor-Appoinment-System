const mongoose = require('mongoose');

const FamilyMemberSchema = new mongoose.Schema({
  primaryUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  relationship: {
    type: String,
    enum: ['Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Other'],
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  age: {
    type: Number
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown'
  },
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  emergencyContact: {
    phone: String,
    relation: String
  }
}, { timestamps: true });

module.exports = mongoose.model('FamilyMember', FamilyMemberSchema);
