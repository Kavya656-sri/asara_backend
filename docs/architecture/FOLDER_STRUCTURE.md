# Per-Service Folder Structure

Complete folder layout for each microservice with monolith file mapping.

---

## Root Structure

```
FSM_Microservice/
├── README.md
├── package.json                          # npm workspaces root
├── .env.example                          # Shared env template
│
├── services/                             # All microservices
│   ├── api-gateway/
│   ├── auth-service/
│   ├── master-data-service/
│   ├── project-service/
│   ├── task-service/
│   ├── ticket-service/
│   ├── attendance-service/
│   ├── finance-service/
│   ├── notification-service/
│   ├── reporting-service/
│   └── ai-service/
│
├── shared/                               # Cross-service code (npm package)
│   ├── package.json
│   ├── contracts/                        # API request/response schemas
│   ├── events/                           # Event bus types and publisher
│   ├── middleware/                       # Shared JWT validation
│   └── utils/                            # HTTP client, response formatter
│
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   └── docker-compose.dev.yml
│   ├── kubernetes/
│   │   ├── namespace.yaml
│   │   ├── api-gateway/
│   │   └── ... (per service)
│   ├── nginx/
│   │   └── nginx.conf
│   └── scripts/
│       ├── init-databases.sql
│       ├── migrate-monolith-data.sh
│       └── health-check.sh
│
└── docs/
    ├── architecture/
    ├── migration/
    └── api-contracts/
```

---

## 1. API Gateway

```
services/api-gateway/
├── src/
│   ├── index.js
│   ├── config/
│   │   ├── env.js
│   │   └── services.js              # { auth: 'http://localhost:3001', ... }
│   ├── middleware/
│   │   ├── auth.js                  # FROM: Easy_FSM_backend/src/middleware/auth.js
│   │   ├── cors.js
│   │   ├── rateLimiter.js
│   │   └── requestLogger.js
│   ├── proxy/
│   │   └── serviceProxy.js          # http-proxy-middleware setup
│   └── routes/
│       ├── index.js                 # Route → service mapping
│       └── health.js                # Aggregated health check
├── tests/
├── package.json
├── .env.example
├── Dockerfile
└── README.md
```

**No database. No models. No controllers.**

---

## 2. Auth Service

```
services/auth-service/
├── src/
│   ├── index.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.routes.js           # FROM: routes/auth.routes.js
│   │   ├── appauth.routes.js        # FROM: routes/appauth.routes.js
│   │   ├── user.routes.js           # FROM: routes/user.routes.js
│   │   ├── role.routes.js           # FROM: routes/role.routes.js
│   │   ├── profile.routes.js        # FROM: routes/profile.js + profileupdate.js
│   │   ├── manager.routes.js        # FROM: routes/manager.routes.js
│   │   ├── branchuser.routes.js     # FROM: routes/branchusers.routes.js
│   │   ├── deviceapproval.routes.js # FROM: routes/deviceapproval.routes.js
│   │   ├── homeapproval.routes.js   # FROM: routes/homeapproval.routes.js
│   │   └── deviceupdate.routes.js   # FROM: routes/deviceupdate.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── appauth.controller.js
│   │   ├── user.controller.js
│   │   ├── role.controller.js
│   │   ├── profile.controller.js
│   │   ├── manager.controller.js
│   │   ├── deviceapproval.controller.js
│   │   └── homeapproval.controller.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── role.model.js
│   │   ├── loginlogs.model.js
│   │   └── applogs.model.js
│   ├── middleware/
│   │   └── validate.js
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   └── utils/
│       └── crypto.js                # FROM: utils (AES encryption)
├── uploads/                         # Profile images (dev only)
├── tests/
├── package.json
├── .env.example
├── Dockerfile
└── README.md
```

**Database:** `fsm_auth`

---

## 3. Master Data Service

```
services/master-data-service/
├── src/
│   ├── index.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── branch.routes.js
│   │   ├── company.routes.js
│   │   ├── contact.routes.js
│   │   ├── customer.routes.js
│   │   ├── product.routes.js
│   │   ├── package.routes.js
│   │   ├── source.routes.js
│   │   └── customerstatus.routes.js
│   ├── controllers/
│   │   ├── branch.controller.js
│   │   ├── company.controller.js
│   │   ├── contact.controller.js
│   │   ├── customer.controller.js
│   │   ├── product.controller.js
│   │   ├── package.controller.js
│   │   ├── source.controller.js
│   │   └── customerstatus.controller.js
│   ├── models/
│   │   ├── branch.model.js
│   │   ├── company.model.js
│   │   ├── contact.model.js
│   │   ├── product.model.js
│   │   ├── package.model.js
│   │   ├── source.model.js
│   │   └── customerstatus.model.js
│   ├── middleware/
│   ├── config/
│   └── utils/
├── tests/
├── package.json
├── Dockerfile
└── README.md
```

**Database:** `fsm_master_data`

---

## 4. Project Service

```
services/project-service/
├── src/
│   ├── index.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── project.routes.js
│   │   ├── projectassignee.routes.js
│   │   └── projectrolewise.routes.js
│   ├── controllers/
│   │   ├── project.controller.js
│   │   └── projectassignee.controller.js
│   ├── models/
│   │   ├── project.model.js
│   │   └── projectassignee.model.js
│   ├── middleware/
│   ├── config/
│   └── utils/
│       └── idGenerator.js           # EP#### project ID generation
├── tests/
├── package.json
├── Dockerfile
└── README.md
```

**Database:** `fsm_projects`

---

## 5. Task Service

```
services/task-service/
├── src/
│   ├── index.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── task.routes.js
│   │   ├── taskrought.routes.js
│   │   ├── tasktype.routes.js
│   │   ├── tasksubcategory.routes.js
│   │   ├── taskrolewise.routes.js
│   │   ├── location.routes.js
│   │   ├── calllog.routes.js
│   │   └── dashboard.routes.js
│   ├── controllers/
│   │   ├── task.controller.js       # Largest controller — field tasks only
│   │   ├── tasktype.controller.js
│   │   ├── tasksubcategory.controller.js
│   │   ├── location.controller.js
│   │   ├── calllog.controller.js
│   │   └── dashboard.controller.js
│   ├── models/
│   │   ├── task.model.js            # Field tasks ONLY (not attendance/ticket)
│   │   ├── tasktype.model.js
│   │   ├── tasksubcategory.model.js
│   │   ├── tasknote.model.js
│   │   ├── locationtracking.model.js
│   │   └── calllog.model.js
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   │   └── distance.js              # Google Maps distance calculation
│   └── cron/                        # (if any task-related cron)
├── uploads/                         # Task attachments, voice notes
├── tests/
├── package.json
├── Dockerfile
└── README.md
```

**Database:** `fsm_tasks`

---

## 6. Ticket Service

```
services/ticket-service/
├── src/
│   ├── index.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── ticket.routes.js
│   │   ├── ticketsassigned.routes.js
│   │   ├── ticketTask.routes.js
│   │   ├── ticketList.routes.js
│   │   ├── allTicketList.routes.js
│   │   ├── ticketstatus.routes.js
│   │   ├── ticketcategory.routes.js
│   │   ├── ticketcondition.routes.js
│   │   ├── ticketconditiondetail.routes.js
│   │   ├── ticketStatusCount.routes.js
│   │   ├── ticketStatusList.routes.js
│   │   └── freshworks.routes.js     # Webhook receiver (no auth)
│   ├── controllers/
│   │   ├── ticket.controller.js
│   │   ├── ticketTask.controller.js
│   │   ├── ticketList.controller.js
│   │   ├── ticketstatus.controller.js
│   │   ├── ticketcategory.controller.js
│   │   ├── ticketcondition.controller.js
│   │   └── freshworks.controller.js
│   ├── models/
│   │   ├── ticket.model.js
│   │   ├── ticketstatus.model.js
│   │   ├── ticketcategory.model.js
│   │   ├── ticketcondition.model.js
│   │   ├── ticketconditiondetail.model.js
│   │   └── tickettask.model.js      # Ticket-linked tasks subset
│   ├── middleware/
│   │   └── freshdeskAuth.js         # Webhook API key validation
│   ├── config/
│   └── utils/
│       └── freshdeskClient.js       # Outbound Freshdesk API calls
├── tests/
├── package.json
├── Dockerfile
└── README.md
```

**Database:** `fsm_tickets`

---

## 7. Attendance Service

```
services/attendance-service/
├── src/
│   ├── index.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── attendance.routes.js
│   │   ├── attendanceconfig.routes.js
│   │   ├── attendancerolewise.routes.js
│   │   ├── attendancereset.routes.js
│   │   ├── attendancelog.routes.js
│   │   └── forcecheckout.routes.js
│   ├── controllers/
│   │   ├── attendance.controller.js
│   │   ├── attendanceconfig.controller.js
│   │   ├── attendancereset.controller.js
│   │   ├── attendancelog.controller.js
│   │   └── forcecheckout.controller.js
│   ├── models/
│   │   ├── attendance.model.js      # Attendance tasks (tasktype_id=1)
│   │   ├── attendanceconfig.model.js
│   │   └── attendancelog.model.js
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   └── cron/
│       ├── attendanceCreate.cron.js # 9:30 AM IST daily
│       └── forceCheckout.cron.js    # 11:59 PM IST daily
├── tests/
├── package.json
├── Dockerfile
└── README.md
```

**Database:** `fsm_attendance`

---

## 8. Finance Service

```
services/finance-service/
├── src/
│   ├── index.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── conveyanceconfig.routes.js
│   │   ├── conveyance.routes.js
│   │   ├── conveyancerolewise.routes.js
│   │   ├── claim.routes.js
│   │   └── financeclaim.routes.js
│   ├── controllers/
│   │   ├── conveyanceconfig.controller.js
│   │   ├── conveyance.controller.js
│   │   ├── claim.controller.js
│   │   └── financeclaim.controller.js
│   ├── models/
│   │   ├── conveyanceconfig.model.js
│   │   ├── claim.model.js
│   │   └── claimupload.model.js
│   ├── middleware/
│   ├── config/
│   └── utils/
├── uploads/                         # Claim receipt images
├── tests/
├── package.json
├── Dockerfile
└── README.md
```

**Database:** `fsm_finance`

---

## 9. Notification Service

```
services/notification-service/
├── src/
│   ├── index.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── firebaseinbox.routes.js
│   │   └── internal.routes.js       # POST /internal/send (service-to-service)
│   ├── controllers/
│   │   ├── firebaseinbox.controller.js
│   │   └── push.controller.js       # Event-driven push sender
│   ├── models/
│   │   └── firebaseinbox.model.js
│   ├── middleware/
│   ├── config/
│   │   └── firebase.js
│   ├── utils/
│   │   └── firebaseAdmin.js
│   └── events/
│       └── subscribers.js           # Listen for task.assigned, etc.
├── tests/
├── package.json
├── Dockerfile
└── README.md
```

**Database:** `fsm_notifications`

---

## 10. Reporting Service

```
services/reporting-service/
├── src/
│   ├── index.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── actionReport.routes.js
│   │   ├── claimReport.routes.js
│   │   ├── checkoutReport.routes.js
│   │   ├── ticketReport.routes.js
│   │   ├── ticketActionReport.routes.js
│   │   ├── ticketCheckinReport.routes.js
│   │   ├── deviationReport.routes.js
│   │   ├── feedbackReport.routes.js
│   │   ├── preventiveFeedback.routes.js
│   │   ├── projectReport.routes.js
│   │   └── kpi/                       # 30+ KPI report routes
│   │       ├── kpiReport.routes.js
│   │       ├── kpiTicketReport.routes.js
│   │       ├── kpiActionReport.routes.js
│   │       └── ... (all kpi-* and customer-kpi-*)
│   ├── controllers/
│   │   ├── actionReport.controller.js
│   │   ├── claimReport.controller.js
│   │   └── kpi/                       # All KPI controllers
│   ├── models/
│   │   └── readModels/                # CQRS read models
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   └── events/
│       └── subscribers.js             # Update read models on events
├── tests/
├── package.json
├── Dockerfile
└── README.md
```

**Database:** `fsm_reporting` (read models, materialized views)

---

## 11. AI Service

```
services/ai-service/
├── src/
│   ├── index.js
│   ├── routes/
│   │   ├── index.js
│   │   └── voice.routes.js          # POST /voice-to-task
│   ├── controllers/
│   │   └── voice.controller.js
│   ├── middleware/
│   │   └── upload.js                # Multer for voice file upload
│   ├── config/
│   │   └── openai.js
│   └── utils/
│       ├── openaiClient.js
│       ├── speechToText.js
│       └── aiExtractor.js
├── uploads/                         # Temp voice note storage
├── tests/
├── package.json
├── Dockerfile
└── README.md
```

**No database.** Stateless service.

---

## Shared Package

```
shared/
├── package.json                       # @fsm/shared
├── contracts/
│   ├── user.contract.js              # User DTO shape
│   ├── task.contract.js
│   ├── ticket.contract.js
│   ├── project.contract.js
│   └── claim.contract.js
├── events/
│   ├── eventBus.js                   # RabbitMQ/Redis publisher
│   ├── eventTypes.js                 # Enum of all event names
│   └── schemas/
│       ├── taskEvents.js
│       └── ticketEvents.js
├── middleware/
│   ├── verifyToken.js                # Shared JWT middleware
│   └── serviceAuth.js                # Service-to-service API key
└── utils/
    ├── httpClient.js                 # Axios wrapper for inter-service calls
    ├── responseFormatter.js          # { success, data, message } shape
    ├── logger.js                     # Winston logger with correlation ID
    └── database.js                   # MySQL pool factory
```

Install in each service:
```json
"dependencies": {
  "@fsm/shared": "workspace:*"
}
```
