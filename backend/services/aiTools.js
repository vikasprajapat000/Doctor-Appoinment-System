/**
 * AI Tool Registry
 * Central registry that maps roles to their allowed tools.
 * This is the AUTHORIZATION LAYER — the backend enforces what tools
 * each role can call, regardless of what the AI requests.
 *
 * The AI model only REQUESTS tool calls; this registry VALIDATES and EXECUTES them.
 */

const patientTools = require('./aiTools/patientTools');
const doctorTools = require('./aiTools/doctorTools');
const adminTools = require('./aiTools/adminTools');
const superadminTools = require('./aiTools/superadminTools');

// ============================================================
// TOOL DEFINITIONS (sent to AI to understand what it can call)
// ============================================================

const PATIENT_TOOL_DEFINITIONS = [
  {
    name: 'getMyUpcomingAppointments',
    description: 'Get the patient\'s upcoming appointments (pending and confirmed, future dates)',
    parameters: {}
  },
  {
    name: 'getMyAppointments',
    description: 'Get the patient\'s appointments, optionally filtered by status',
    parameters: {
      status: { type: 'str', description: 'Filter by status: pending, confirmed, completed, cancelled, rejected', required: false },
      limit: { type: 'int', description: 'Number of results (max 20)', required: false }
    }
  },
  {
    name: 'getMyAppointmentHistory',
    description: 'Get the patient\'s past/completed appointment history',
    parameters: {
      limit: { type: 'int', description: 'Number of results', required: false }
    }
  },
  {
    name: 'getAvailableDoctors',
    description: 'Get list of available approved doctors, optionally filtered by specialization or name',
    parameters: {
      specialization: { type: 'str', description: 'Doctor specialization to filter by (e.g., Cardiology, Dermatology)', required: false },
      name: { type: 'str', description: 'Doctor name to search', required: false }
    }
  },
  {
    name: 'getDoctorDetails',
    description: 'Get details of a specific doctor',
    parameters: {
      doctorId: { type: 'str', description: 'The doctor\'s ID', required: false },
      doctorName: { type: 'str', description: 'The doctor\'s name to search', required: false }
    }
  },
  {
    name: 'getDoctorAvailability',
    description: 'Get available time slots for a specific doctor on a specific date',
    parameters: {
      doctorId: { type: 'str', description: 'The doctor\'s ID', required: true },
      date: { type: 'str', description: 'Date in YYYY-MM-DD format', required: true }
    }
  },
  {
    name: 'bookAppointment',
    description: 'Book an appointment. Set confirmed=true only when the patient has explicitly confirmed they want to book.',
    parameters: {
      doctorId: { type: 'str', description: 'Doctor ID', required: true },
      date: { type: 'str', description: 'Date in YYYY-MM-DD format', required: true },
      time: { type: 'str', description: 'Time slot (e.g., 10:00 AM)', required: true },
      reason: { type: 'str', description: 'Reason for appointment', required: true },
      type: { type: 'str', description: 'In Person or Video', required: false },
      confirmed: { type: 'bool', description: 'Set to true only after patient confirms', required: false }
    }
  },
  {
    name: 'cancelAppointment',
    description: 'Cancel an appointment. Set confirmed=true only when the patient explicitly confirms cancellation.',
    parameters: {
      appointmentId: { type: 'str', description: 'Appointment ID to cancel', required: true },
      reason: { type: 'str', description: 'Reason for cancellation', required: false },
      confirmed: { type: 'bool', description: 'Set to true only after patient confirms cancellation', required: false }
    }
  },
  {
    name: 'rescheduleAppointment',
    description: 'Reschedule an appointment to a new date/time. Requires confirmation.',
    parameters: {
      appointmentId: { type: 'str', description: 'Appointment ID to reschedule', required: true },
      newDate: { type: 'str', description: 'New date in YYYY-MM-DD format', required: false },
      newTime: { type: 'str', description: 'New time slot', required: false },
      confirmed: { type: 'bool', description: 'Set to true only after patient confirms', required: false }
    }
  }
];

const DOCTOR_TOOL_DEFINITIONS = [
  {
    name: 'getTodayAppointments',
    description: 'Get the doctor\'s appointments for today',
    parameters: {}
  },
  {
    name: 'getUpcomingAppointments',
    description: 'Get the doctor\'s upcoming appointments for the next 7 days',
    parameters: {}
  },
  {
    name: 'getMyAppointments',
    description: 'Get doctor\'s appointments, optionally filtered by status',
    parameters: {
      status: { type: 'str', description: 'Filter: pending, confirmed, completed, cancelled', required: false },
      limit: { type: 'int', description: 'Number of results', required: false }
    }
  },
  {
    name: 'getCompletedAppointments',
    description: 'Get the doctor\'s completed appointments',
    parameters: {
      limit: { type: 'int', description: 'Number of results', required: false }
    }
  },
  {
    name: 'getCancelledAppointments',
    description: 'Get the doctor\'s cancelled or rejected appointments',
    parameters: {
      limit: { type: 'int', description: 'Number of results', required: false }
    }
  },
  {
    name: 'getMyPatients',
    description: 'Get the list of patients who have had appointments with this doctor',
    parameters: {}
  },
  {
    name: 'getAppointmentStatistics',
    description: 'Get comprehensive appointment statistics including totals, monthly, weekly, and growth metrics',
    parameters: {}
  }
];

const ADMIN_TOOL_DEFINITIONS = [
  {
    name: 'getUserStatistics',
    description: 'Get overall user statistics: total users, patients, doctors, admins',
    parameters: {}
  },
  {
    name: 'getPatientStatistics',
    description: 'Get patient registration statistics including growth trends',
    parameters: {}
  },
  {
    name: 'getDoctorStatistics',
    description: 'Get doctor statistics including approved, pending, rejected counts',
    parameters: {}
  },
  {
    name: 'getAppointmentStatistics',
    description: 'Get appointment statistics by status, today, this week, this month',
    parameters: {}
  },
  {
    name: 'getDoctorList',
    description: 'Get list of doctors with their details and appointment counts',
    parameters: {
      status: { type: 'str', description: 'Filter by status: approved, pending, rejected, all', required: false },
      limit: { type: 'int', description: 'Number of results', required: false }
    }
  },
  {
    name: 'getPendingDoctors',
    description: 'Get list of doctors pending approval',
    parameters: {}
  }
];

const SUPERADMIN_TOOL_DEFINITIONS = [
  {
    name: 'getSystemStatistics',
    description: 'Get complete system-wide statistics for all users, appointments, and growth',
    parameters: {}
  },
  {
    name: 'getUserGrowth',
    description: 'Get user registration growth data for the last 6 months',
    parameters: {}
  },
  {
    name: 'getAppointmentGrowth',
    description: 'Get appointment growth and completion trends for the last 6 months',
    parameters: {}
  },
  {
    name: 'getAdminList',
    description: 'Get list of all admin accounts',
    parameters: {
      status: { type: 'str', description: 'Filter by status: approved, pending, rejected, all', required: false }
    }
  },
  {
    name: 'getSystemActivity',
    description: 'Get recent system activity logs',
    parameters: {
      limit: { type: 'int', description: 'Number of activity records', required: false },
      action: { type: 'str', description: 'Filter by action type: login, logout, register, appointment_create, etc.', required: false }
    }
  }
];

// ============================================================
// TOOL EXECUTORS — maps tool names to their implementations
// ============================================================

const PATIENT_TOOL_EXECUTORS = {
  getMyUpcomingAppointments: patientTools.getMyUpcomingAppointments,
  getMyAppointments: patientTools.getMyAppointments,
  getMyAppointmentHistory: patientTools.getMyAppointmentHistory,
  getAvailableDoctors: patientTools.getAvailableDoctors,
  getDoctorDetails: patientTools.getDoctorDetails,
  getDoctorAvailability: patientTools.getDoctorAvailability,
  bookAppointment: patientTools.bookAppointment,
  cancelAppointment: patientTools.cancelAppointment,
  rescheduleAppointment: patientTools.rescheduleAppointment
};

const DOCTOR_TOOL_EXECUTORS = {
  getMyAppointments: doctorTools.getMyAppointments,
  getTodayAppointments: doctorTools.getTodayAppointments,
  getUpcomingAppointments: doctorTools.getUpcomingAppointments,
  getCompletedAppointments: doctorTools.getCompletedAppointments,
  getCancelledAppointments: doctorTools.getCancelledAppointments,
  getMyPatients: doctorTools.getMyPatients,
  getAppointmentStatistics: doctorTools.getAppointmentStatistics
};

const ADMIN_TOOL_EXECUTORS = {
  getUserStatistics: adminTools.getUserStatistics,
  getPatientStatistics: adminTools.getPatientStatistics,
  getDoctorStatistics: adminTools.getDoctorStatistics,
  getAppointmentStatistics: adminTools.getAppointmentStatistics,
  getDoctorList: adminTools.getDoctorList,
  getPendingDoctors: adminTools.getPendingDoctors
};

const SUPERADMIN_TOOL_EXECUTORS = {
  getSystemStatistics: superadminTools.getSystemStatistics,
  getUserGrowth: superadminTools.getUserGrowth,
  getAppointmentGrowth: superadminTools.getAppointmentGrowth,
  getAdminList: superadminTools.getAdminList,
  getSystemActivity: superadminTools.getSystemActivity
};

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Get tool definitions for a given role (sent to AI)
 */
function getToolDefinitionsForRole(role) {
  const map = {
    patient: PATIENT_TOOL_DEFINITIONS,
    doctor: DOCTOR_TOOL_DEFINITIONS,
    admin: ADMIN_TOOL_DEFINITIONS,
    superadmin: SUPERADMIN_TOOL_DEFINITIONS
  };
  return map[role] || [];
}

/**
 * Execute a tool call for a given role.
 * This is the AUTHORIZATION GATE — role is from the verified JWT, never from AI output.
 *
 * @param {string} role - From req.user.role (JWT-verified)
 * @param {string} toolName - Tool name requested by AI
 * @param {Object} params - Tool parameters from AI
 * @param {Object} context - { userId, doctorId (same), role }
 * @returns {Object} Tool result
 */
async function executeTool(role, toolName, params, context) {
  const executorMap = {
    patient: PATIENT_TOOL_EXECUTORS,
    doctor: DOCTOR_TOOL_EXECUTORS,
    admin: ADMIN_TOOL_EXECUTORS,
    superadmin: SUPERADMIN_TOOL_EXECUTORS
  };

  const executors = executorMap[role];
  if (!executors) {
    throw new Error(`Unknown role: ${role}`);
  }

  const toolFn = executors[toolName];
  if (!toolFn) {
    throw new Error(`Tool "${toolName}" is not authorized for role "${role}"`);
  }

  // Build context based on role
  const toolContext = {
    userId: context.userId,
    doctorId: context.userId, // Same ID, doctor uses doctorId field
    role: context.role
  };

  return await toolFn(params || {}, toolContext);
}

module.exports = { getToolDefinitionsForRole, executeTool };
