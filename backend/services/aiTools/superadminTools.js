/**
 * Super Admin AI Tools
 * System-wide analytics for SUPERADMIN role only.
 * Highest level of aggregated access — no credentials or secrets exposed.
 */

const User = require('../../models/User');
const Appointment = require('../../models/Appointment');
const ActivityLog = require('../../models/ActivityLog');

/**
 * Get complete system statistics
 */
async function getSystemStatistics(params, context) {
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
    approvedAdmins,
    pendingAdmins,
    superAdmins,
    totalAppointments,
    completedAppointments,
    pendingAppointments,
    cancelledAppointments,
    registeredThisMonth,
    appointmentsThisMonth,
    onlineUsers
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'patient' }),
    User.countDocuments({ role: 'doctor' }),
    User.countDocuments({ role: 'doctor', status: 'approved' }),
    User.countDocuments({ role: 'doctor', status: 'pending' }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'admin', status: 'approved' }),
    User.countDocuments({ role: 'admin', status: 'pending' }),
    User.countDocuments({ role: 'superadmin' }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: 'completed' }),
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.countDocuments({ status: { $in: ['cancelled', 'rejected'] } }),
    User.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
    Appointment.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
    User.countDocuments({ isOnline: true })
  ]);

  return {
    users: {
      total: totalUsers,
      patients: totalPatients,
      doctors: { total: totalDoctors, approved: approvedDoctors, pending: pendingDoctors },
      admins: { total: totalAdmins, approved: approvedAdmins, pending: pendingAdmins },
      superAdmins,
      onlineNow: onlineUsers
    },
    appointments: {
      total: totalAppointments,
      completed: completedAppointments,
      pending: pendingAppointments,
      cancelled: cancelledAppointments
    },
    thisMonth: {
      newUsers: registeredThisMonth,
      appointments: appointmentsThisMonth
    },
    summary: `System Overview: ${totalUsers} total users (${totalPatients} patients, ${approvedDoctors} doctors, ${approvedAdmins} admins). ${totalAppointments} total appointments (${completedAppointments} completed). This month: ${registeredThisMonth} new users, ${appointmentsThisMonth} appointments. ${onlineUsers} users currently online.`
  };
}

/**
 * Get user registration growth (last 6 months)
 */
async function getUserGrowth(params, context) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const [patients, doctors, admins] = await Promise.all([
      User.countDocuments({ role: 'patient', createdAt: { $gte: start, $lte: end } }),
      User.countDocuments({ role: 'doctor', createdAt: { $gte: start, $lte: end } }),
      User.countDocuments({ role: 'admin', createdAt: { $gte: start, $lte: end } })
    ]);

    months.push({
      month: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      patients, doctors, admins,
      total: patients + doctors + admins
    });
  }

  return {
    period: 'Last 6 months',
    data: months
  };
}

/**
 * Get appointment growth (last 6 months)
 */
async function getAppointmentGrowth(params, context) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const [total, completed, cancelled] = await Promise.all([
      Appointment.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Appointment.countDocuments({ status: 'completed', createdAt: { $gte: start, $lte: end } }),
      Appointment.countDocuments({ status: { $in: ['cancelled', 'rejected'] }, createdAt: { $gte: start, $lte: end } })
    ]);

    months.push({
      month: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      total, completed, cancelled
    });
  }

  return {
    period: 'Last 6 months',
    data: months
  };
}

/**
 * Get list of all admins
 */
async function getAdminList(params, context) {
  const { status = 'all' } = params;

  const query = { role: 'admin' };
  if (status !== 'all') {
    const validStatuses = ['approved', 'pending', 'rejected'];
    if (validStatuses.includes(status)) query.status = status;
  }

  const admins = await User.find(query)
    .select('name email status isOnline lastLogin createdAt')
    .sort({ createdAt: -1 })
    .limit(20);

  return {
    count: admins.length,
    admins: admins.map(a => ({
      id: a._id,
      name: a.name,
      email: a.email,
      status: a.status,
      isOnline: a.isOnline,
      lastLogin: a.lastLogin?.toLocaleDateString('en-US') || 'Never',
      registeredOn: a.createdAt?.toLocaleDateString('en-US')
    }))
  };
}

/**
 * Get recent system activity from audit logs
 */
async function getSystemActivity(params, context) {
  const { limit = 15, action } = params;

  const query = {};
  if (action) {
    const validActions = ['login', 'logout', 'register', 'appointment_create', 'appointment_cancel', 'user_reject', 'user_delete'];
    if (validActions.includes(action)) query.action = action;
  }

  const logs = await ActivityLog.find(query)
    .populate('user', 'name role')
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 15, 30));

  return {
    count: logs.length,
    activities: logs.map(log => ({
      action: log.action,
      description: log.description,
      userRole: log.user?.role || 'unknown',
      userName: log.user?.name || 'Unknown',
      timestamp: log.createdAt?.toLocaleString('en-US'),
      ipAddress: log.ipAddress || 'Unknown'
    }))
  };
}

module.exports = {
  getSystemStatistics,
  getUserGrowth,
  getAppointmentGrowth,
  getAdminList,
  getSystemActivity
};
