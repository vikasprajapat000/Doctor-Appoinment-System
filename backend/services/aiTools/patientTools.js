/**
 * Patient AI Tools
 * Secure data access functions for PATIENT role only.
 * All functions enforce patientId = req.user.id (from verified JWT).
 * Never trust external input for patientId.
 */

const User = require('../../models/User');
const Appointment = require('../../models/Appointment');

// Safe appointment fields to return to AI (no internal DB fields)
const SAFE_APPOINTMENT_FIELDS = 'date time type status reason notes cancelReason department';
const SAFE_DOCTOR_FIELDS = 'name specialization qualification experience profileImage';

/**
 * Get patient's upcoming appointments
 */
async function getMyAppointments(params, context) {
  const { userId } = context;
  const { status, limit = 10 } = params;

  const query = { patient: userId };
  if (status) {
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'];
    if (validStatuses.includes(status)) {
      query.status = status;
    }
  }

  const appointments = await Appointment.find(query)
    .populate('doctor', SAFE_DOCTOR_FIELDS)
    .select(SAFE_APPOINTMENT_FIELDS)
    .sort({ date: -1 })
    .limit(Math.min(Number(limit) || 10, 20));

  return {
    count: appointments.length,
    appointments: appointments.map(a => formatAppointment(a))
  };
}

/**
 * Get upcoming appointments specifically
 */
async function getMyUpcomingAppointments(params, context) {
  const { userId } = context;

  const appointments = await Appointment.find({
    patient: userId,
    date: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] }
  })
    .populate('doctor', SAFE_DOCTOR_FIELDS)
    .select(SAFE_APPOINTMENT_FIELDS)
    .sort({ date: 1 })
    .limit(10);

  return {
    count: appointments.length,
    appointments: appointments.map(a => formatAppointment(a))
  };
}

/**
 * Get appointment history (past appointments)
 */
async function getMyAppointmentHistory(params, context) {
  const { userId } = context;
  const { limit = 10 } = params;

  const appointments = await Appointment.find({
    patient: userId,
    $or: [
      { status: 'completed' },
      { date: { $lt: new Date() } }
    ]
  })
    .populate('doctor', SAFE_DOCTOR_FIELDS)
    .select(SAFE_APPOINTMENT_FIELDS)
    .sort({ date: -1 })
    .limit(Math.min(Number(limit) || 10, 20));

  return {
    count: appointments.length,
    appointments: appointments.map(a => formatAppointment(a))
  };
}

/**
 * Get available doctors, optionally filtered by specialization
 */
async function getAvailableDoctors(params, context) {
  const { specialization, name } = params;

  const query = { role: 'doctor', status: 'approved' };
  if (specialization) {
    query.specialization = { $regex: specialization, $options: 'i' };
  }
  if (name) {
    query.name = { $regex: name, $options: 'i' };
  }

  const doctors = await User.find(query)
    .select('name email specialization qualification experience profileImage')
    .sort({ name: 1 })
    .limit(10);

  return {
    count: doctors.length,
    doctors: doctors.map(d => ({
      id: d._id,
      name: d.name,
      specialization: d.specialization || 'General',
      qualification: d.qualification || '',
      experience: d.experience || 0,
      hasProfileImage: !!d.profileImage
    }))
  };
}

/**
 * Get details of a specific doctor
 */
async function getDoctorDetails(params, context) {
  const { doctorId, doctorName } = params;

  let query = { role: 'doctor', status: 'approved' };
  if (doctorId) {
    query._id = doctorId;
  } else if (doctorName) {
    query.name = { $regex: doctorName, $options: 'i' };
  } else {
    return { error: 'Please provide a doctor ID or name' };
  }

  const doctor = await User.findOne(query)
    .select('name email specialization qualification experience profileImage');

  if (!doctor) return { error: 'Doctor not found' };

  return {
    id: doctor._id,
    name: doctor.name,
    specialization: doctor.specialization || 'General',
    qualification: doctor.qualification || '',
    experience: doctor.experience || 0,
    hasProfileImage: !!doctor.profileImage
  };
}

/**
 * Get available time slots for a doctor on a specific date
 */
async function getDoctorAvailability(params, context) {
  const { doctorId, date } = params;

  if (!doctorId || !date) {
    return { error: 'Doctor ID and date are required' };
  }

  // Verify doctor exists
  const doctor = await User.findOne({ _id: doctorId, role: 'doctor', status: 'approved' });
  if (!doctor) return { error: 'Doctor not found or not available' };

  const allSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM'
  ];

  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    date: new Date(date),
    status: { $in: ['pending', 'confirmed'] }
  });

  const bookedSlots = bookedAppointments.map(a => a.time);
  const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

  return {
    doctorName: doctor.name,
    specialization: doctor.specialization,
    date,
    availableSlots,
    bookedSlotsCount: bookedSlots.length,
    totalSlots: allSlots.length
  };
}

/**
 * Book an appointment — only called after patient confirms.
 * Requires confirmed: true in params to prevent accidental booking.
 */
async function bookAppointment(params, context) {
  const { userId } = context;
  const { doctorId, date, time, reason, type = 'In Person', confirmed } = params;

  // Safety gate: only execute if explicitly confirmed
  if (!confirmed) {
    return {
      requiresConfirmation: true,
      message: 'Please confirm the appointment booking',
      appointmentDetails: { doctorId, date, time, reason, type }
    };
  }

  if (!doctorId || !date || !time || !reason) {
    return { error: 'Doctor ID, date, time, and reason are required' };
  }

  // Verify doctor
  const doctorUser = await User.findOne({ _id: doctorId, role: 'doctor', status: 'approved' });
  if (!doctorUser) return { error: 'Doctor not available' };

  // Check for double booking
  const existing = await Appointment.findOne({
    doctor: doctorId, date: new Date(date), time,
    status: { $in: ['pending', 'confirmed'] }
  });
  if (existing) return { error: 'This time slot is already booked. Please choose another.' };

  const appointment = new Appointment({
    patient: userId, doctor: doctorId,
    date: new Date(date), time, type, reason,
    department: doctorUser.specialization,
    status: 'pending'
  });

  await appointment.save();

  return {
    success: true,
    message: `Appointment booked with Dr. ${doctorUser.name} on ${date} at ${time}. Status: Pending confirmation from doctor.`,
    appointmentId: appointment._id,
    doctorName: doctorUser.name,
    date, time, type, status: 'pending'
  };
}

/**
 * Cancel an appointment — only called after patient confirms.
 * Enforces ownership: patient can only cancel their own appointment.
 */
async function cancelAppointment(params, context) {
  const { userId } = context;
  const { appointmentId, reason: cancelReason, confirmed } = params;

  if (!appointmentId) return { error: 'Appointment ID is required' };

  const appointment = await Appointment.findOne({ _id: appointmentId, patient: userId })
    .populate('doctor', 'name specialization');

  if (!appointment) return { error: 'Appointment not found or you are not authorized' };
  if (appointment.status === 'completed') return { error: 'Cannot cancel a completed appointment' };
  if (appointment.status === 'cancelled') return { error: 'This appointment is already cancelled' };

  // Safety gate
  if (!confirmed) {
    return {
      requiresConfirmation: true,
      message: `Found your appointment with Dr. ${appointment.doctor?.name} on ${formatDate(appointment.date)} at ${appointment.time}. Do you want to cancel it?`,
      appointmentId: appointment._id,
      doctorName: appointment.doctor?.name,
      date: formatDate(appointment.date),
      time: appointment.time
    };
  }

  appointment.status = 'cancelled';
  if (cancelReason) appointment.cancelReason = cancelReason;
  await appointment.save();

  return {
    success: true,
    message: `Appointment with Dr. ${appointment.doctor?.name} on ${formatDate(appointment.date)} at ${appointment.time} has been cancelled.`
  };
}

/**
 * Reschedule an appointment — requires confirmation.
 * Enforces ownership.
 */
async function rescheduleAppointment(params, context) {
  const { userId } = context;
  const { appointmentId, newDate, newTime, confirmed } = params;

  if (!appointmentId) return { error: 'Appointment ID is required' };

  const appointment = await Appointment.findOne({ _id: appointmentId, patient: userId })
    .populate('doctor', 'name specialization');

  if (!appointment) return { error: 'Appointment not found or you are not authorized' };
  if (['completed', 'cancelled'].includes(appointment.status)) {
    return { error: 'Cannot reschedule a completed or cancelled appointment' };
  }

  if (!confirmed) {
    return {
      requiresConfirmation: true,
      message: `Found your appointment with Dr. ${appointment.doctor?.name}. Please provide the new date and time to reschedule.`,
      currentDate: formatDate(appointment.date),
      currentTime: appointment.time,
      appointmentId: appointment._id
    };
  }

  if (!newDate || !newTime) return { error: 'New date and time are required to reschedule' };

  // Check for conflict
  const existing = await Appointment.findOne({
    doctor: appointment.doctor._id,
    date: new Date(newDate), time: newTime,
    status: { $in: ['pending', 'confirmed'] },
    _id: { $ne: appointmentId }
  });
  if (existing) return { error: 'The selected time slot is already booked. Please choose another.' };

  appointment.date = new Date(newDate);
  appointment.time = newTime;
  appointment.status = 'pending';
  await appointment.save();

  return {
    success: true,
    message: `Appointment rescheduled with Dr. ${appointment.doctor?.name} to ${newDate} at ${newTime}. Status reset to Pending for doctor re-confirmation.`
  };
}

// Helper formatters
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatAppointment(a) {
  return {
    id: a._id,
    date: formatDate(a.date),
    time: a.time,
    type: a.type,
    status: a.status,
    reason: a.reason,
    department: a.department,
    cancelReason: a.cancelReason,
    doctor: a.doctor ? {
      name: a.doctor.name,
      specialization: a.doctor.specialization,
      qualification: a.doctor.qualification,
      experience: a.doctor.experience
    } : null
  };
}

module.exports = {
  getMyAppointments,
  getMyUpcomingAppointments,
  getMyAppointmentHistory,
  getAvailableDoctors,
  getDoctorDetails,
  getDoctorAvailability,
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment
};
