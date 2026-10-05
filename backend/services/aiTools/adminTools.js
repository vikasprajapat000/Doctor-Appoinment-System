/**
 * Admin AI Tools
 * Administrative analytics and management data for ADMIN role.
 * Aggregated statistics only — no individual patient private data exposed.
 */

const User = require('../../models/User');
const Appointment = require('../../models/Appointment');
const ActivityLog = require('../../models/ActivityLog');

/**
 * Get overall user statistics
 */
async function getUserStatistics(params, context) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalUsers,
    totalPatients,
    totalDoctors,
    approvedDoctors,
    pendingDoctors,
    totalAdmins,
    registeredThisMonth
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'patient' }),
    User.countDocuments({ role: 'doctor' }),
    User.countDocuments({ role: 'doctor', status: 'approved' }),
    User.countDocuments({ role: 'doctor', status: 'pending' }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ createdAt: { $gte: firstDayOfMonth } })
  ]);

  return {
    totalUsers,
    totalPatients,
    totalDoctors,
    approvedDoctors,
    pendingDoctors,
    totalAdmins,
    registeredThisMonth,
    summary: `System has ${totalUsers} total users: ${totalPatients} patients, ${approvedDoctors} approved doctors (${pendingDoctors} pending), ${totalAdmins} admins. ${registeredThisMonth} users registered this month.`
  };
}

/**
 * Get patient-specific statistics
 */
async function getPatientStatistics(params, context) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  const [total, thisMonth, lastMonth] = await Promise.all([
    User.countDocuments({ role: 'patient' }),
    User.countDocuments({ role: 'patient', createdAt: { $gte: firstDayOfMonth } }),
    User.countDocuments({ role: 'patient', createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth } })
  ]);

  const growthPercent = lastMonth > 0
    ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1)
    : thisMonth > 0 ? 100 : 0;

  return {
    total,
    registeredThisMonth: thisMonth,
    registeredLastMonth: lastMonth,
    growthPercent: Number(growthPercent)
  };
}

/**
 * Get doctor-specific statistics
 */
async function getDoctorStatistics(params, context) {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [total, approved, pending, rejected, registeredThisMonth] = await Promise.all([
    User.countDocuments({ role: 'doctor' }),
    User.countDocuments({ role: 'doctor', status: 'approved' }),
    User.countDocuments({ role: 'doctor', status: 'pending' }),
    User.countDocuments({ role: 'doctor', status: 'rejected' }),
    User.countDocuments({ role: 'doctor', createdAt: { $gte: firstDayOfMonth } })
  ]);

  return {
    total,
    approved,
    pending,
    rejected,
    registeredThisMonth,
    summary: `${total} doctors total: ${approved} approved, ${pending} pending approval, ${rejected} rejected.`
  };
}

/**
 * Get appointment statistics
 */
async function getAppointmentStatistics(params, context) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const [
    total,
    pending,
    confirmed,
    completed,
    cancelled,
    rejected,
    todayCount,
    thisWeek,
    thisMonth
  ] = await Promise.all([
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.countDocuments({ status: 'confirmed' }),
    Appointment.countDocuments({ status: 'completed' }),
    Appointment.countDocuments({ status: 'cancelled' }),
    Appointment.countDocuments({ status: 'rejected' }),
    Appointment.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
    Appointment.countDocuments({ date: { $gte: startOfWeek } }),
    Appointment.countDocuments({ createdAt: { $gte: firstDayOfMonth } })
  ]);

  return {
    total,
    byStatus: { pending, confirmed, completed, cancelled, rejected },
    today: todayCount,
    thisWeek,
    thisMonth,
    summary: `${total} total appointments: ${pending} pending, ${confirmed} confirmed, ${completed} completed, ${cancelled} cancelled. Today: ${todayCount} booked. This month: ${thisMonth}.`
  };
}

/**
 * Get list of doctors with appointment counts
 */
async function getDoctorList(params, context) {
  const { status = 'approved', limit = 10 } = params;

  const validStatuses = ['approved', 'pending', 'rejected', 'all'];
  const query = { role: 'doctor' };
  if (status !== 'all' && validStatuses.includes(status)) {
    query.status = status;
  }

  const doctors = await User.find(query)
    .select('name email specialization status createdAt licenseNumber experience')
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 10, 20));

  // Get appointment counts for each doctor
  const doctorsWithCounts = await Promise.all(doctors.map(async (d) => {
    const appointmentCount = await Appointment.countDocuments({ doctor: d._id });
    return {
      id: d._id,
      name: d.name,
      specialization: d.specialization || 'General',
      status: d.status,
      experience: d.experience || 0,
      appointmentCount,
      registeredOn: d.createdAt?.toLocaleDateString('en-US')
    };
  }));

  return {
    count: doctorsWithCounts.length,
    doctors: doctorsWithCounts
  };
}

/**
 * Get pending doctor registrations awaiting approval
 */
async function getPendingDoctors(params, context) {
  const doctors = await User.find({ role: 'doctor', status: 'pending' })
    .select('name email specialization qualification licenseNumber experience createdAt')
    .sort({ createdAt: -1 })
    .limit(15);

  return {
    count: doctors.length,
    doctors: doctors.map(d => ({
      id: d._id,
      name: d.name,
      email: d.email,
      specialization: d.specialization || 'Not specified',
      qualification: d.qualification || 'Not specified',
      licenseNumber: d.licenseNumber || 'Not provided',
      experience: d.experience || 0,
      appliedOn: d.createdAt?.toLocaleDateString('en-US')
    }))
  };
}

module.exports = {
  getUserStatistics,
  getPatientStatistics,
  getDoctorStatistics,
  getAppointmentStatistics,
  getDoctorList,
  getPendingDoctors
};
