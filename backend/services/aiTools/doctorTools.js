/**
 * Doctor AI Tools
 * Secure data access functions for DOCTOR role only.
 * All functions enforce doctorId = req.user.id (from verified JWT).
 */

const Appointment = require('../../models/Appointment');
const User = require('../../models/User');
const Prescription = require('../../models/Prescription');

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
    patient: a.patient ? {
      name: a.patient.name,
      email: a.patient.email,
      phone: a.patient.phone,
      bloodType: a.patient.bloodType,
      gender: a.patient.gender
    } : null
  };
}

/**
 * Get doctor's appointments, optionally filtered by status
 */
async function getMyAppointments(params, context) {
  const { doctorId } = context;
  const { status, limit = 10 } = params;

  const query = { doctor: doctorId };
  if (status) {
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'];
    if (validStatuses.includes(status)) query.status = status;
  }

  const appointments = await Appointment.find(query)
    .populate('patient', 'name email phone bloodType gender profileImage')
    .sort({ date: -1 })
    .limit(Math.min(Number(limit) || 10, 20));

  return {
    count: appointments.length,
    appointments: appointments.map(a => formatAppointment(a))
  };
}

/**
 * Get today's appointments
 */
async function getTodayAppointments(params, context) {
  const { doctorId } = context;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointments = await Appointment.find({
    doctor: doctorId,
    date: { $gte: today, $lt: tomorrow },
    status: { $in: ['pending', 'confirmed'] }
  })
    .populate('patient', 'name email phone bloodType gender profileImage')
    .sort({ time: 1 });

  return {
    date: today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    count: appointments.length,
    appointments: appointments.map(a => formatAppointment(a))
  };
}

/**
 * Get upcoming appointments (next 7 days)
 */
async function getUpcomingAppointments(params, context) {
  const { doctorId } = context;

  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const appointments = await Appointment.find({
    doctor: doctorId,
    date: { $gte: now, $lte: nextWeek },
    status: { $in: ['pending', 'confirmed'] }
  })
    .populate('patient', 'name email phone bloodType gender')
    .sort({ date: 1, time: 1 })
    .limit(20);

  return {
    count: appointments.length,
    appointments: appointments.map(a => formatAppointment(a))
  };
}

/**
 * Get completed appointments
 */
async function getCompletedAppointments(params, context) {
  const { doctorId } = context;
  const { limit = 10 } = params;

  const appointments = await Appointment.find({ doctor: doctorId, status: 'completed' })
    .populate('patient', 'name email phone')
    .sort({ date: -1 })
    .limit(Math.min(Number(limit) || 10, 20));

  return {
    count: appointments.length,
    appointments: appointments.map(a => formatAppointment(a))
  };
}

/**
 * Get cancelled appointments
 */
async function getCancelledAppointments(params, context) {
  const { doctorId } = context;
  const { limit = 10 } = params;

  const appointments = await Appointment.find({
    doctor: doctorId,
    status: { $in: ['cancelled', 'rejected'] }
  })
    .populate('patient', 'name email phone')
    .sort({ date: -1 })
    .limit(Math.min(Number(limit) || 10, 20));

  return {
    count: appointments.length,
    appointments: appointments.map(a => formatAppointment(a))
  };
}

/**
 * Get list of unique patients
 */
async function getMyPatients(params, context) {
  const { doctorId } = context;

  const patientIds = await Appointment.distinct('patient', { doctor: doctorId });
  const patients = await User.find({
    _id: { $in: patientIds }, role: 'patient'
  }).select('name email phone bloodType gender profileImage dateOfBirth');

  return {
    count: patients.length,
    patients: patients.map(p => ({
      id: p._id,
      name: p.name,
      email: p.email,
      phone: p.phone || 'N/A',
      bloodType: p.bloodType || 'Unknown',
      gender: p.gender || 'Unknown'
    }))
  };
}

/**
 * Get comprehensive appointment statistics
 */
async function getAppointmentStatistics(params, context) {
  const { doctorId } = context;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay());

  const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  const [
    total,
    pending,
    confirmed,
    completed,
    cancelled,
    todayCount,
    thisWeek,
    thisMonth,
    thisMonthCompleted,
    lastMonthCompleted,
    uniquePatients
  ] = await Promise.all([
    Appointment.countDocuments({ doctor: doctorId }),
    Appointment.countDocuments({ doctor: doctorId, status: 'pending' }),
    Appointment.countDocuments({ doctor: doctorId, status: 'confirmed' }),
    Appointment.countDocuments({ doctor: doctorId, status: 'completed' }),
    Appointment.countDocuments({ doctor: doctorId, status: { $in: ['cancelled', 'rejected'] } }),
    Appointment.countDocuments({ doctor: doctorId, date: { $gte: today, $lt: tomorrow } }),
    Appointment.countDocuments({ doctor: doctorId, date: { $gte: firstDayOfWeek } }),
    Appointment.countDocuments({ doctor: doctorId, date: { $gte: firstDayOfMonth } }),
    Appointment.countDocuments({ doctor: doctorId, status: 'completed', date: { $gte: firstDayOfMonth } }),
    Appointment.countDocuments({ doctor: doctorId, status: 'completed', date: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth } }),
    Appointment.distinct('patient', { doctor: doctorId })
  ]);

  const growthPercent = lastMonthCompleted > 0
    ? (((thisMonthCompleted - lastMonthCompleted) / lastMonthCompleted) * 100).toFixed(1)
    : thisMonthCompleted > 0 ? 100 : 0;

  return {
    total,
    byStatus: { pending, confirmed, completed, cancelled },
    today: todayCount,
    thisWeek,
    thisMonth,
    thisMonthCompleted,
    lastMonthCompleted,
    completionGrowthPercent: Number(growthPercent),
    totalUniquePatients: uniquePatients.length,
    summary: `You have ${total} total appointments. This month: ${thisMonth} appointments (${thisMonthCompleted} completed). Today: ${todayCount} scheduled.`
  };
}

module.exports = {
  getMyAppointments,
  getTodayAppointments,
  getUpcomingAppointments,
  getCompletedAppointments,
  getCancelledAppointments,
  getMyPatients,
  getAppointmentStatistics
};
