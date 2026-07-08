# Monolith Route → Microservice Mapping

Complete mapping of every route in `Easy_FSM_backend/src/routes/index.js` to its target microservice.

**Legend:**
- ✅ Ready to extract (low coupling)
- ⚠️ Medium coupling (needs inter-service calls)
- 🔴 High coupling (blocked by shared `tasks` table)

---

## API Gateway (Port 3000)

| Monolith Route | Gateway Path | Target Service |
|---------------|-------------|----------------|
| `GET /api` | `/api` | Gateway health check |

---

## Auth Service (Port 3001)

| Monolith Prefix | Route File | Endpoints | Status |
|----------------|-----------|-----------|--------|
| `/api/auth` | `auth.routes.js` | `POST /login` | ✅ |
| `/api/app` | `appauth.routes.js` | `POST /login` | ✅ |
| `/api/users` | `user.routes.js` | CRUD, change-password, logout, tracking | ✅ |
| `/api/roles` | `role.routes.js` | CRUD | ✅ |
| `/api/profile` | `profile.js` | `GET /view` | ✅ |
| `/api/profile` | `profileupdate.js` | `POST /update` | ✅ |
| `/api/managers` | `manager.routes.js` | `GET /`, `GET /:id` | ✅ |
| `/api/branchuser` | `branchusers.routes.js` | `POST /branch-users` | ✅ |
| `/api/device-approval` | `deviceapproval.routes.js` | `POST /approve` | ✅ |
| `/api/home-approval` | `homeapproval.routes.js` | `POST /approve` | ✅ |
| `/api/deviceupdate` | `deviceupdate.routes.js` | `POST /deviceupdate` | ✅ |
| `/api/app-version` | `appversion.routes.js` | `GET /`, `POST /updatekey` | ✅ |

---

## Master Data Service (Port 3002)

| Monolith Prefix | Route File | Endpoints | Status |
|----------------|-----------|-----------|--------|
| `/api/branches` | `branch.routes.js` | CRUD | ✅ |
| `/api/companies` | `company.routes.js` | CRUD, datatable, stats | ✅ |
| `/api/contacts` | `contact.routes.js` | CRUD, datatable, stats | ✅ |
| `/api/customers` | `customer.routes.js` | `GET /customer/:id/page` | ✅ |
| `/api/products` | `product.routes.js` | CRUD, checklists | ✅ |
| `/api/packages` | `package.routes.js` | CRUD, details | ✅ |
| `/api/sources` | `source.routes.js` | CRUD, status patch | ✅ |
| `/api/customer-statuses` | `customerstatus.routes.js` | CRUD, status patch | ✅ |

---

## Project Service (Port 3003)

| Monolith Prefix | Route File | Endpoints | Status |
|----------------|-----------|-----------|--------|
| `/api/projects` | `project.routes.js` | CRUD, status, warranty, products | ⚠️ |
| `/api/project-assignees` | `projectassignee.routes.js` | CRUD, get-project-assignees | ⚠️ |
| `/api/projects-rolewise` | `projectrolewise.js` | list, datatable | ⚠️ |

---

## Task Service (Port 3004)

| Monolith Prefix | Route File | Endpoints | Status |
|----------------|-----------|-----------|--------|
| `/api/tasks` | `task.routes.js` | CRUD, status, filter, conveyance, notes | 🔴 |
| `/api/task` | `taskrought.js` | CRUD | 🔴 |
| `/api/tasktypes` | `tasktype.routes.js` | CRUD, activetasktypes | ✅ |
| `/api/task-subcategories` | `tasksubcategory.routes.js` | CRUD, by-tasktype | ✅ |
| `/api/task-rolewise` | `taskrolewise.js` | list, datatable | 🔴 |
| `/api/location` | `location.routes.js` | track-location, view-tracking | ⚠️ |
| `/api/call-logs` | `calllog.routes.js` | list, create, update | ✅ |
| `/api/dashboard` | `dashboard.routes.js` | `GET /` | 🔴 |

**Note:** Voice-to-task (`POST /api/tasks/ai-task-from-voicenote`) moves to AI Service.

---

## Ticket Service (Port 3005)

| Monolith Prefix | Route File | Endpoints | Status |
|----------------|-----------|-----------|--------|
| `/api/tickets` | `ticketsassigned.routes.js` | assigned, filterlist, createtask | 🔴 |
| `/api/ticket` | `ticket.routes.js` | `POST /createtask` | 🔴 |
| `/api/ticket-task` | `ticketTask.routes.js` | 20+ workflow endpoints | 🔴 |
| `/api/ticket-list` | `ticketList.routes.js` | `GET /` | ⚠️ |
| `/api/all-ticket-list` | `allTicketList.routes.js` | `GET /` | ⚠️ |
| `/api/ticket-statuses` | `ticketstatus.routes.js` | CRUD | ✅ |
| `/api/ticket-categories` | `ticketcategory.routes.js` | CRUD | ✅ |
| `/api/ticket-conditions` | `ticketcondition.routes.js` | CRUD | ✅ |
| `/api/ticket-condition-details` | `ticketconditiondetail.routes.js` | CRUD | ✅ |
| `/api/ticket-status-count` | `ticketStatusCount.routes.js` | `GET /` | ⚠️ |
| `/api/ticket-status-list` | `ticketStatusList.routes.js` | create, save, view, list | ⚠️ |
| `/api/freshworks` | `freshworks.routes.js` | Webhooks (no auth) | ✅ |

---

## Attendance Service (Port 3006)

| Monolith Prefix | Route File | Endpoints | Status |
|----------------|-----------|-----------|--------|
| `/api/attendance` | `attendanceroutes.js` | list, present-absent, by id | 🔴 |
| `/api/attendance-config` | `attendanceconfig.routes.js` | GET, PUT | ✅ |
| `/api/attendance-rolewise` | `attendancerolewise.js` | list, datatable | 🔴 |
| `/api/attendance-reset` | `attendancereset.routes.js` | `POST /attendance-reset` | 🔴 |
| `/api/attendance-logs` | `attendancelog.routes.js` | by task_id | ⚠️ |
| `/api/forcecheckout` | `forcecheckout.routes.js` | `GET /forcecheckout` (cron) | 🔴 |

**Cron jobs:**
- `src/cron/` → attendance-service `src/cron/`

---

## Finance Service (Port 3007)

| Monolith Prefix | Route File | Endpoints | Status |
|----------------|-----------|-----------|--------|
| `/api/conveyance-config` | `conveyanceconfig.routes.js` | GET, PUT | ✅ |
| `/api/conveyance` | `conveyance.routes.js` | claims CRUD, finance, datatables | 🔴 |
| `/api/conveyance-rolewise` | `conveyancerolewise.js` | list, datatable | 🔴 |
| `/api/claim` | `claim.routes.js` | `POST /update` | ⚠️ |
| `/api/finance-claim` | `financeclaim.routes.js` | `POST /update` | ⚠️ |

---

## Notification Service (Port 3008)

| Monolith Prefix | Route File | Endpoints | Status |
|----------------|-----------|-----------|--------|
| `/api/notification` | `firebaseinbox.routes.js` | firebase-notification CRUD | ✅ |

---

## Reporting Service (Port 3009)

| Monolith Prefix | Route File | Status |
|----------------|-----------|--------|
| `/api/action-report` | `actionReport.routes.js` | ✅ |
| `/api/claim-report` | `claimReport.routes.js` | ✅ |
| `/api/checkout-report` | `checkoutReport.routes.js` | ✅ |
| `/api/ticket-report` | `ticketReport.routes.js` | ✅ |
| `/api/ticket-action-report` | `ticketActionReport.routes.js` | ✅ |
| `/api/ticket-checkin-report` | `ticketCheckinReport.routes.js` | ✅ |
| `/api/deviation-report` | `deviationReport.routes.js` | ✅ |
| `/api/feedback-report` | `feedback.routes.js` | ✅ |
| `/api/preventive-feedback-report` | `preventiveFeedback.routes.js` | ✅ |
| `/api/projectreport` | `projectReport.routes.js` | ✅ |
| `/api/kpi-report` | `kpiReport.routes.js` | ✅ |
| `/api/kpi-ticket-report` | `kpiTicketReport.routes.js` | ✅ |
| `/api/kpi-action-report` | `kpiActionReport.routes.js` | ✅ |
| `/api/kpi-visit-report` | `kpiVisitReport.routes.js` | ✅ |
| `/api/kpi-single-visit-report` | `kpiSingleVisitReport.routes.js` | ✅ |
| `/api/kpi-average-response-report` | `kpiAverageResponseReport.routes.js` | ✅ |
| `/api/kpi-average-resolution-report` | `kpiAverageResolutionReport.routes.js` | ✅ |
| `/api/kpi-remote-report` | `kpiRemoteReport.routes.js` | ✅ |
| `/api/kpi-open-ticket-report` | `kpiOpenTicketReport.routes.js` | ✅ |
| `/api/kpi-completed-ticket-report` | `kpiCompletedTicketReport.routes.js` | ✅ |
| `/api/kpi-resolved-ticket-report` | `kpiResolvedTicketReport.routes.js` | ✅ |
| `/api/kpi-total-resolved-ticket-report` | `kpiTotalResolvedTicketReport.routes.js` | ✅ |
| `/api/kpi-feedback-report` | `kpiFeedbackReport.routes.js` | ✅ |
| `/api/kpi-feedback-average-report` | `kpiFeedbackAverageReport.routes.js` | ✅ |
| `/api/customer-kpi-*` | (mirror of all kpi-* above) | ✅ |

---

## AI Service (Port 3010)

| Monolith Route | Source | Status |
|---------------|--------|--------|
| `POST /api/tasks/ai-task-from-voicenote` | `task.routes.js` (voice upload) | ✅ |
| Voice transcription utils | `utils/openaiClient.js`, `speechToText.js`, `aiExtractor.js` | ✅ |

---

## Extraction Priority Order

Based on coupling analysis:

```
Priority 1 (Week 1-2):  api-gateway, auth-service
Priority 2 (Week 3-4):  reporting-service, notification-service, ai-service
Priority 3 (Week 5-6):  master-data-service
Priority 4 (Week 7-8):  project-service, ticket-service (masters only)
Priority 5 (Week 9-10): task-service, attendance-service (after tasks table split)
Priority 6 (Week 11-12): finance-service, cleanup
```
