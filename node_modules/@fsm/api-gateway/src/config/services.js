const AUTH = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const MASTER = process.env.MASTER_DATA_SERVICE_URL || 'http://localhost:3002';
const PROJECT = process.env.PROJECT_SERVICE_URL || 'http://localhost:3003';
const TASK = process.env.TASK_SERVICE_URL || 'http://localhost:3004';
const TICKET = process.env.TICKET_SERVICE_URL || 'http://localhost:3005';
const ATTENDANCE = process.env.ATTENDANCE_SERVICE_URL || 'http://localhost:3006';
const FINANCE = process.env.FINANCE_SERVICE_URL || 'http://localhost:3007';
const NOTIFICATION = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008';
const REPORTING = process.env.REPORTING_SERVICE_URL || 'http://localhost:3009';
const AI = process.env.AI_SERVICE_URL || 'http://localhost:3010';

export const serviceRoutes = [
  // Auth Service
  { path: '/api/auth', target: AUTH, requiresAuth: false },
  { path: '/api/app', target: AUTH, requiresAuth: false },
  { path: '/api/users', target: AUTH, requiresAuth: true },
  { path: '/api/roles', target: AUTH, requiresAuth: true },
  { path: '/api/profile', target: AUTH, requiresAuth: true },
  { path: '/api/managers', target: AUTH, requiresAuth: true },
  { path: '/api/branchuser', target: AUTH, requiresAuth: true },
  { path: '/api/device-approval', target: AUTH, requiresAuth: true },
  { path: '/api/home-approval', target: AUTH, requiresAuth: true },
  { path: '/api/deviceupdate', target: AUTH, requiresAuth: true },
  { path: '/api/app-version', target: AUTH, requiresAuth: true },

  // Master Data Service
  { path: '/api/branches', target: MASTER, requiresAuth: true },
  { path: '/api/companies', target: MASTER, requiresAuth: true },
  { path: '/api/contacts', target: MASTER, requiresAuth: false },
  { path: '/api/customers', target: MASTER, requiresAuth: true },
  { path: '/api/products', target: MASTER, requiresAuth: true },
  { path: '/api/packages', target: MASTER, requiresAuth: true },
  { path: '/api/sources', target: MASTER, requiresAuth: true },
  { path: '/api/customer-statuses', target: MASTER, requiresAuth: true },

  // Project Service
  { path: '/api/projects', target: PROJECT, requiresAuth: true },
  { path: '/api/project-assignees', target: PROJECT, requiresAuth: true },
  { path: '/api/projects-rolewise', target: PROJECT, requiresAuth: true },

  // Task Service
  { path: '/api/tasks', target: TASK, requiresAuth: true },
  { path: '/api/task', target: TASK, requiresAuth: true },
  { path: '/api/tasktypes', target: TASK, requiresAuth: true },
  { path: '/api/task-subcategories', target: TASK, requiresAuth: true },
  { path: '/api/task-rolewise', target: TASK, requiresAuth: true },
  { path: '/api/location', target: TASK, requiresAuth: true },
  { path: '/api/call-logs', target: TASK, requiresAuth: true },
  { path: '/api/dashboard', target: TASK, requiresAuth: true },

  // Ticket Service
  { path: '/api/tickets', target: TICKET, requiresAuth: true },
  { path: '/api/ticket', target: TICKET, requiresAuth: true },
  { path: '/api/ticket-task', target: TICKET, requiresAuth: true },
  { path: '/api/ticket-list', target: TICKET, requiresAuth: true },
  { path: '/api/all-ticket-list', target: TICKET, requiresAuth: true },
  { path: '/api/ticket-statuses', target: TICKET, requiresAuth: true },
  { path: '/api/ticket-categories', target: TICKET, requiresAuth: true },
  { path: '/api/ticket-conditions', target: TICKET, requiresAuth: true },
  { path: '/api/ticket-condition-details', target: TICKET, requiresAuth: true },
  { path: '/api/ticket-status-count', target: TICKET, requiresAuth: true },
  { path: '/api/ticket-status-list', target: TICKET, requiresAuth: true },
  { path: '/api/freshworks', target: TICKET, requiresAuth: false },

  // Attendance Service
  { path: '/api/attendance', target: ATTENDANCE, requiresAuth: true },
  { path: '/api/attendance-config', target: ATTENDANCE, requiresAuth: true },
  { path: '/api/attendance-rolewise', target: ATTENDANCE, requiresAuth: true },
  { path: '/api/attendance-reset', target: ATTENDANCE, requiresAuth: true },
  { path: '/api/attendance-logs', target: ATTENDANCE, requiresAuth: true },
  { path: '/api/forcecheckout', target: ATTENDANCE, requiresAuth: false },

  // Finance Service
  { path: '/api/conveyance-config', target: FINANCE, requiresAuth: true },
  { path: '/api/conveyance', target: FINANCE, requiresAuth: true },
  { path: '/api/conveyance-rolewise', target: FINANCE, requiresAuth: true },
  { path: '/api/claim', target: FINANCE, requiresAuth: true },
  { path: '/api/finance-claim', target: FINANCE, requiresAuth: true },

  // Notification Service
  { path: '/api/notification', target: NOTIFICATION, requiresAuth: true },

  // Reporting Service
  { path: '/api/action-report', target: REPORTING, requiresAuth: true },
  { path: '/api/claim-report', target: REPORTING, requiresAuth: true },
  { path: '/api/checkout-report', target: REPORTING, requiresAuth: true },
  { path: '/api/ticket-report', target: REPORTING, requiresAuth: true },
  { path: '/api/ticket-action-report', target: REPORTING, requiresAuth: true },
  { path: '/api/ticket-checkin-report', target: REPORTING, requiresAuth: true },
  { path: '/api/deviation-report', target: REPORTING, requiresAuth: true },
  { path: '/api/feedback-report', target: REPORTING, requiresAuth: true },
  { path: '/api/preventive-feedback-report', target: REPORTING, requiresAuth: true },
  { path: '/api/projectreport', target: REPORTING, requiresAuth: false },
  { path: '/api/kpi-', target: REPORTING, requiresAuth: true },
  { path: '/api/customer-kpi-', target: REPORTING, requiresAuth: true },

  // AI Service
  { path: '/api/ai', target: AI, requiresAuth: true },
];
