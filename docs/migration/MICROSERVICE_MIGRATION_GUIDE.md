# FSM Monolith to Microservices — Migration Guide

## 1. Executive Summary

The current **Easy_FSM_backend** is a single Express.js application with ~90 route modules, ~80 controllers, and ~55 models sharing one MySQL database. This guide describes how to decompose it into **11 bounded microservices** while keeping the system running during migration.

### Current Monolith Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ES Modules) |
| Framework | Express 4 |
| Database | MySQL (mysql2, raw SQL) |
| Auth | JWT + bcrypt |
| File Storage | Local `uploads/` |
| Push | Firebase Admin |
| Integrations | Freshdesk, Google Maps, OpenAI, Keka HR |

### Target Microservices Stack

| Layer | Technology |
|-------|-----------|
| API Gateway | Express / Nginx |
| Services | Node.js + Express (same stack, familiar to team) |
| Inter-service | REST (sync) + RabbitMQ/Redis (async events) |
| Database | MySQL per service (database-per-service pattern) |
| Container | Docker + docker-compose (dev), Kubernetes (prod) |
| Shared Auth | JWT issued by auth-service, validated at gateway |

---

## 2. Migration Strategy: Strangler Fig Pattern

Do **not** rewrite everything at once. Use the **Strangler Fig** approach:

```
Phase 1 ──► API Gateway + Auth Service
Phase 2 ──► Reporting Service (read-only, low risk)
Phase 3 ──► Notification + AI Services (isolated integrations)
Phase 4 ──► Master Data + Project Services
Phase 5 ──► Ticket Service + Freshdesk
Phase 6 ──► Task + Attendance + Finance (hardest — shared tasks table)
```

### How Strangler Fig Works

```
                    ┌─────────────────┐
  Client ──────────►│   API Gateway   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        [New Service]  [New Service]  [Monolith Proxy]
              │              │              │
              ▼              ▼              ▼
         Own DB          Own DB      Original Monolith DB
```

1. Deploy API Gateway in front of the monolith
2. Extract one service at a time
3. Gateway routes migrated paths to new service, unmigrated paths to monolith
4. Once all paths are migrated, decommission the monolith

---

## 3. Service Decomposition

### 3.1 API Gateway (`api-gateway` — Port 3000)

**Responsibility:** Single entry point, request routing, JWT validation, rate limiting, CORS.

**Monolith files to migrate:**
- `src/index.js` (middleware setup only)
- `src/middleware/auth.js` (JWT validation only, not login)

**Does NOT own:** Business logic, database.

```
services/api-gateway/
├── src/
│   ├── index.js
│   ├── config/
│   │   └── services.js          # Service URLs and route mappings
│   ├── middleware/
│   │   ├── auth.js              # JWT verify (shared secret)
│   │   ├── rateLimiter.js
│   │   └── cors.js
│   ├── proxy/
│   │   └── serviceProxy.js      # http-proxy-middleware per service
│   └── routes/
│       └── health.js
├── package.json
├── .env.example
└── Dockerfile
```

---

### 3.2 Auth Service (`auth-service` — Port 3001)

**Responsibility:** Authentication, user management, roles, device/home approval, profile.

**Monolith routes:**
- `/api/auth`, `/api/app`, `/api/users`, `/api/roles`
- `/api/profile`, `/api/managers`, `/api/branchuser`
- `/api/device-approval`, `/api/home-approval`, `/api/deviceupdate`

**Database tables:** `users`, `roles`, `loginlogs`, `applogs`

**Monolith files:**
- `controllers/auth.controller.js`, `appauth.controller.js`
- `controllers/user.controller.js`, `role.controller.js`
- `controllers/profile*.js`, `deviceapproval.controller.js`, `homeapproval.controller.js`
- `models/user.js`, `role.js`, `loginlogs.js`, `applogs.js`
- `middleware/auth.js` (login logic)

---

### 3.3 Master Data Service (`master-data-service` — Port 3002)

**Responsibility:** CRM master data — companies, contacts, branches, products, packages, sources.

**Monolith routes:**
- `/api/branches`, `/api/companies`, `/api/contacts`, `/api/customers`
- `/api/products`, `/api/packages`, `/api/sources`, `/api/customer-statuses`

**Database tables:** `branches`, `companies`, `contacts`, `products`, `packages`, `sources`, `customerstatuses`, `companyproducts`

**Monolith files:**
- `controllers/branch.controller.js`, `company.controller.js`, `contact.controller.js`
- `controllers/product.controller.js`, `package.controller.js`, `source.controller.js`
- Corresponding `models/*.js`

---

### 3.4 Project Service (`project-service` — Port 3003)

**Responsibility:** Project lifecycle, assignees, warranties, role-wise project views.

**Monolith routes:**
- `/api/projects`, `/api/project-assignees`, `/api/projects-rolewise`

**Database tables:** `projects`, `projectassignees`, `projectwarranties`

**Monolith files:**
- `controllers/project.controller.js`, `projectassignee.controller.js`
- `models/project.js`, `projectassignee.js`

---

### 3.5 Task Service (`task-service` — Port 3004)

**Responsibility:** Field tasks, task types, location tracking, call logs, dashboard.

**Monolith routes:**
- `/api/tasks`, `/api/task`, `/api/tasktypes`, `/api/task-subcategories`
- `/api/task-rolewise`, `/api/location`, `/api/call-logs`, `/api/dashboard`

**Database tables:** `tasks` (field work only, NOT attendance), `tasktypes`, `tasksubcategories`, `tasknotes`, `locationtracking`, `calllogs`

**Critical:** The monolith uses one `tasks` table for attendance, field work, AND ticket tasks. This service owns field/project tasks only. See [DATABASE_STRATEGY.md](DATABASE_STRATEGY.md).

**Monolith files:**
- `controllers/task.controller.js`, `tasktype.controller.js`, `location.controller.js`
- `models/task.js` (split — largest file, 3800+ lines)
- `utils/distance.js` (Google Maps)

---

### 3.6 Ticket Service (`ticket-service` — Port 3005)

**Responsibility:** Service desk tickets, Freshdesk sync, ticket workflow, ticket-task operations.

**Monolith routes:**
- `/api/tickets`, `/api/ticket`, `/api/ticket-task`, `/api/ticket-list`
- `/api/all-ticket-list`, `/api/ticket-status-*`, `/api/ticket-categories`
- `/api/ticket-conditions`, `/api/ticket-condition-details`, `/api/freshworks`

**Database tables:** `tickets`, `ticketstatuses`, `ticketcategories`, `ticketconditions`, `ticketconditiondetails`, `tasks` (ticket-linked subset)

**Monolith files:**
- `controllers/ticket*.controller.js`, `freshworks.controller.js`, `ticketTask.controller.js`
- `models/ticket.js`, `ticketstatus.js`, etc.

---

### 3.7 Attendance Service (`attendance-service` — Port 3006)

**Responsibility:** Daily attendance, config, force checkout cron, attendance logs.

**Monolith routes:**
- `/api/attendance`, `/api/attendance-config`, `/api/attendance-rolewise`
- `/api/attendance-reset`, `/api/attendance-logs`, `/api/forcecheckout`

**Database tables:** `attendanceconfigs`, `attendancelogs`, `tasks` (attendance subset where tasktype_id=1)

**Cron jobs (from monolith `src/cron/`):**
- 9:30 AM IST — Create daily attendance records
- 11:59 PM IST — Force checkout all open tasks

**Monolith files:**
- `controllers/attendance*.controller.js`, `forcecheckout.controller.js`
- `models/attendanceconfig.js`, `attendancelog.model.js`
- `cron/*.js`

---

### 3.8 Finance Service (`finance-service` — Port 3007)

**Responsibility:** Conveyance rates, expense claims, finance approval.

**Monolith routes:**
- `/api/conveyance-config`, `/api/conveyance`, `/api/conveyance-rolewise`
- `/api/claim`, `/api/finance-claim`

**Database tables:** `conveyanceconfigs`, `claims`, `claimuploads`

**Monolith files:**
- `controllers/conveyance*.controller.js`, `claim.controller.js`, `financeclaim.controller.js`
- `models/conveyanceconfig.js`, conveyance logic in `task.js`

---

### 3.9 Notification Service (`notification-service` — Port 3008)

**Responsibility:** Firebase push notifications, in-app notification inbox.

**Monolith routes:**
- `/api/notification`

**Database tables:** `firebaseinboxes`

**Monolith files:**
- `controllers/firebaseinbox.controller.js`
- `models/firebaseinbox.js`
- `utils/firebaseAdmin.js`

**Event-driven:** Other services publish events (`task.assigned`, `ticket.created`) → this service sends push.

---

### 3.10 Reporting Service (`reporting-service` — Port 3009)

**Responsibility:** All operational and KPI reports (read-only).

**Monolith routes:**
- `/api/action-report`, `/api/claim-report`, `/api/checkout-report`
- `/api/ticket-report`, `/api/ticket-action-report`, `/api/ticket-checkin-report`
- `/api/deviation-report`, `/api/feedback-report`, `/api/preventive-feedback-report`
- `/api/projectreport`
- All `/api/kpi-*` and `/api/customer-kpi-*` routes (30+ endpoints)

**Database:** Read replicas or CQRS read models from other services.

**Why extract first:** Read-only, no write coupling, 30+ similar endpoints.

---

### 3.11 AI Service (`ai-service` — Port 3010)

**Responsibility:** Voice-to-task transcription, AI text extraction.

**Monolith routes:**
- `POST /api/tasks/ai-task-from-voicenote` (voice upload endpoint in task routes)

**Monolith files:**
- `utils/openaiClient.js`, `speechToText.js`, `aiExtractor.js`

**No database needed** — stateless processing service.

---

## 4. Inter-Service Communication

### 4.1 Synchronous (REST)

Use for request/response patterns where the caller needs an immediate answer:

```
Task Service ──GET /users/:id──► Auth Service
Ticket Service ──GET /companies/:id──► Master Data Service
Finance Service ──GET /tasks/:id/checkout──► Task Service
```

### 4.2 Asynchronous (Event Bus)

Use RabbitMQ or Redis Streams for fire-and-forget operations:

| Event | Publisher | Subscriber(s) |
|-------|-----------|---------------|
| `user.created` | auth-service | notification-service |
| `task.assigned` | task-service | notification-service |
| `task.checked_out` | task-service | finance-service, reporting-service |
| `ticket.created` | ticket-service | notification-service, reporting-service |
| `ticket.synced` | ticket-service | reporting-service |
| `attendance.marked` | attendance-service | reporting-service |
| `claim.submitted` | finance-service | notification-service |

### 4.3 Shared Contracts

Define event schemas in `shared/contracts/` and `shared/events/`:

```
shared/
├── contracts/
│   ├── user.contract.js
│   ├── task.contract.js
│   └── ticket.contract.js
├── events/
│   ├── eventBus.js
│   └── eventTypes.js
└── utils/
    ├── httpClient.js        # Inter-service HTTP calls
    └── responseFormatter.js # Standard API response shape
```

---

## 5. Phase-by-Phase Migration Plan

### Phase 1: Foundation (Week 1–2)

**Goal:** API Gateway routes all traffic; Auth Service handles login.

| Step | Action |
|------|--------|
| 1 | Deploy API Gateway in front of monolith (proxy all `/api/*` to monolith) |
| 2 | Extract Auth Service — move login, users, roles |
| 3 | Gateway routes `/api/auth`, `/api/app`, `/api/users`, `/api/roles` to auth-service |
| 4 | All other routes still proxy to monolith |
| 5 | Verify JWT tokens work across gateway → monolith |

**Validation:** Web and mobile login work through gateway. Existing APIs unchanged.

---

### Phase 2: Read-Only Services (Week 3–4)

**Goal:** Extract low-risk, isolated services.

| Step | Action |
|------|--------|
| 1 | Extract Reporting Service — copy all report controllers/models |
| 2 | Reporting reads from monolith DB initially (shared read access) |
| 3 | Extract Notification Service — move Firebase logic |
| 4 | Extract AI Service — move OpenAI utils |
| 5 | Gateway routes report/notification/AI paths to new services |

**Validation:** All 30+ KPI reports return same data. Push notifications still work.

---

### Phase 3: Master Data (Week 5–6)

**Goal:** CRM data in its own service and database.

| Step | Action |
|------|--------|
| 1 | Create `fsm_master_data` database |
| 2 | Migrate tables: branches, companies, contacts, products, packages |
| 3 | Dual-write period: monolith AND master-data-service both write |
| 4 | Switch reads to master-data-service |
| 5 | Stop monolith writes |

---

### Phase 4: Core Business (Week 7–10)

**Goal:** Projects, Tickets, Tasks extracted.

| Step | Action |
|------|--------|
| 1 | Extract Project Service |
| 2 | Extract Ticket Service + Freshdesk webhooks |
| 3 | Split `tasks` table (see DATABASE_STRATEGY.md) |
| 4 | Extract Task Service |
| 5 | Extract Attendance Service + cron jobs |

---

### Phase 5: Finance + Cleanup (Week 11–12)

| Step | Action |
|------|--------|
| 1 | Extract Finance Service |
| 2 | Move file uploads to shared storage (S3/MinIO) |
| 3 | Remove monolith proxy from gateway |
| 4 | Decommission monolith |

---

## 6. Per-Service Standard Structure

Every service follows this template:

```
services/<service-name>/
├── src/
│   ├── index.js                 # Express bootstrap
│   ├── routes/
│   │   ├── index.js             # Route aggregator
│   │   └── *.routes.js          # Feature routes
│   ├── controllers/
│   │   └── *.controller.js      # HTTP handlers
│   ├── models/
│   │   └── *.model.js           # Data access (SQL)
│   ├── middleware/
│   │   ├── auth.js              # JWT validation (from shared)
│   │   └── validate.js          # express-validator rules
│   ├── config/
│   │   ├── database.js          # MySQL pool for THIS service's DB
│   │   └── env.js               # Environment config
│   ├── utils/
│   │   └── *.js                 # Service-specific helpers
│   └── cron/                    # (only attendance, task services)
│       └── *.cron.js
├── tests/
│   └── *.test.js
├── uploads/                     # Local file storage (dev only)
├── package.json
├── .env.example
├── Dockerfile
└── README.md
```

---

## 7. Environment Variables (Per Service)

### Common (all services)

```env
PORT=300X
NODE_ENV=development
JWT_SECRET=shared-secret-across-all-services
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=fsm_<service_name>
DB_PORT=3306
```

### Service-specific

```env
# auth-service
VITE_SECRET_KEY=          # AES encryption

# ticket-service
FRESHDESK_URL=
FRESHDESK_API_KEY=

# task-service / attendance-service
GOOGLE_MAPS_API_KEY=

# ai-service
OPENAI_API_KEY=

# notification-service
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# api-gateway
AUTH_SERVICE_URL=http://localhost:3001
MASTER_DATA_SERVICE_URL=http://localhost:3002
# ... all service URLs
MONOLITH_FALLBACK_URL=http://localhost:4000  # during migration only
```

---

## 8. Docker Compose (Local Dev)

See `infrastructure/docker/docker-compose.yml` for running all services locally with:
- 11 service containers
- MySQL instances (or one MySQL with separate databases)
- RabbitMQ for events
- Nginx as optional reverse proxy

```bash
cd infrastructure/docker
docker-compose up -d
```

---

## 9. Key Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Shared `tasks` table | High — blocks task/attendance/ticket split | Split table first (see DATABASE_STRATEGY.md) |
| No service layer in monolith | Medium — logic in controllers/models | Extract as-is first, refactor later |
| Inconsistent auth on some routes | Medium — security gap | Add auth to all routes during extraction |
| File uploads in local `uploads/` | Medium — not shareable across services | Move to S3/MinIO in Phase 5 |
| Hardcoded Freshdesk URLs | Low | Use env vars in ticket-service |
| `public/src/` duplicate tree | Low — confusion | Delete before migration starts |

---

## 10. Success Criteria

- [ ] All 90+ API endpoints respond through API Gateway
- [ ] Web and mobile apps work without frontend changes (same `/api/*` paths)
- [ ] Each service has its own database
- [ ] Services communicate via events for async operations
- [ ] Cron jobs run only in attendance-service
- [ ] Freshdesk webhooks hit ticket-service directly
- [ ] Monolith decommissioned
- [ ] All services containerized with health checks

---

## 11. Team Recommendations

| Role | Responsibility |
|------|---------------|
| 1 Backend Dev | API Gateway + Auth Service (Phase 1) |
| 1 Backend Dev | Reporting + Notification (Phase 2) |
| 1 Backend Dev | Master Data + Project (Phase 3) |
| 2 Backend Devs | Task + Ticket + Attendance split (Phase 4) |
| 1 DevOps | Docker, CI/CD, database migrations |

**Estimated timeline:** 10–12 weeks with 3–4 developers.
