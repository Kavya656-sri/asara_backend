# Database Strategy — Splitting the Shared `tasks` Table

## The Core Problem

The monolith uses a **single `tasks` table** for three different business domains:

| tasktype_id | Domain | Used By |
|-------------|--------|---------|
| 1 | Daily Attendance | attendance-service |
| 2-7 | Project Field Work | task-service |
| 8+ | Ticket-linked Work | ticket-service |

This is the **#1 blocker** for microservice extraction. All three services read/write the same table with different semantics.

---

## Current `tasks` Table (Monolith)

Key columns used across domains:

```sql
tasks
├── id
├── tasktype_id          -- 1=attendance, 2-7=field, 8+=ticket
├── user_id              -- assigned engineer
├── project_id           -- (field tasks only)
├── ticket_id            -- (ticket tasks only)
├── status               -- open, in-progress, completed, etc.
├── checkin_time
├── checkout_time
├── checkin_lat/lng
├── checkout_lat/lng
├── distance             -- for conveyance
├── deviation_distance   -- for deviation reports
├── claim_amount         -- for finance
├── created_at
└── updated_at
```

Related tables:
- `tasknotes` — attachments and notes
- `attendancelogs` — audit trail for attendance
- `claims` / `claimuploads` — expense claims linked to task checkout
- `locationtracking` — GPS breadcrumbs during task

---

## Strategy: Gradual Table Split

### Option A: Split by Domain (Recommended)

Create three separate tables, each owned by one service:

```sql
-- attendance-service owns:
CREATE TABLE attendance_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  checkin_time DATETIME,
  checkout_time DATETIME,
  checkin_lat DECIMAL(10,8),
  checkin_lng DECIMAL(11,8),
  checkout_lat DECIMAL(10,8),
  checkout_lng DECIMAL(11,8),
  status ENUM('present','absent','half-day','leave'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (user_id, date)
);

-- task-service owns:
CREATE TABLE field_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tasktype_id INT NOT NULL,
  tasksubcategory_id INT,
  user_id INT NOT NULL,
  project_id INT,
  company_id INT,
  status VARCHAR(50),
  checkin_time DATETIME,
  checkout_time DATETIME,
  checkin_lat DECIMAL(10,8),
  checkin_lng DECIMAL(11,8),
  checkout_lat DECIMAL(10,8),
  checkout_lng DECIMAL(11,8),
  distance DECIMAL(10,2),
  deviation_distance DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- ticket-service owns:
CREATE TABLE ticket_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT NOT NULL,
  user_id INT NOT NULL,
  status VARCHAR(50),
  checkin_time DATETIME,
  checkout_time DATETIME,
  checkin_lat DECIMAL(10,8),
  checkin_lng DECIMAL(11,8),
  checkout_lat DECIMAL(10,8),
  checkout_lng DECIMAL(11,8),
  remote_help BOOLEAN DEFAULT FALSE,
  phone_call BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Option B: Keep Unified Table with Views (Transitional)

During migration, keep the original `tasks` table but create database views per service:

```sql
-- In fsm_attendance database (read from monolith via federated or replica):
CREATE VIEW attendance_tasks AS
  SELECT * FROM monolith.tasks WHERE tasktype_id = 1;

-- In fsm_tasks database:
CREATE VIEW field_tasks AS
  SELECT * FROM monolith.tasks WHERE tasktype_id BETWEEN 2 AND 7;

-- In fsm_tickets database:
CREATE VIEW ticket_tasks AS
  SELECT * FROM monolith.tasks WHERE tasktype_id >= 8;
```

Use Option B during Phases 1-4, then migrate to Option A in Phase 5.

---

## Migration Steps for Table Split

### Step 1: Add `domain` Column (Non-Breaking)

```sql
ALTER TABLE tasks ADD COLUMN domain ENUM('attendance','field','ticket') 
  GENERATED ALWAYS AS (
    CASE 
      WHEN tasktype_id = 1 THEN 'attendance'
      WHEN tasktype_id BETWEEN 2 AND 7 THEN 'field'
      ELSE 'ticket'
    END
  ) STORED;
```

### Step 2: Create New Tables in Service Databases

Run the CREATE TABLE statements above in each service's database.

### Step 3: Data Migration Script

```sql
-- Migrate attendance records
INSERT INTO fsm_attendance.attendance_records 
  (id, user_id, date, checkin_time, checkout_time, status, ...)
SELECT id, user_id, DATE(checkin_time), checkin_time, checkout_time, status, ...
FROM monolith.tasks WHERE tasktype_id = 1;

-- Migrate field tasks
INSERT INTO fsm_tasks.field_tasks 
  (id, tasktype_id, user_id, project_id, status, ...)
SELECT id, tasktype_id, user_id, project_id, status, ...
FROM monolith.tasks WHERE tasktype_id BETWEEN 2 AND 7;

-- Migrate ticket tasks
INSERT INTO fsm_tickets.ticket_tasks 
  (id, ticket_id, user_id, status, ...)
SELECT id, ticket_id, user_id, status, ...
FROM monolith.tasks WHERE tasktype_id >= 8;
```

### Step 4: Dual-Write Period

During transition, write to BOTH old `tasks` table AND new service tables:

```javascript
// In task-service controller (during migration)
async createTask(data) {
  // Write to new table
  const task = await FieldTaskModel.create(data);
  
  // Dual-write to monolith (temporary)
  if (process.env.DUAL_WRITE_ENABLED === 'true') {
    await monolithDb.query('INSERT INTO tasks ...', [data]);
  }
  
  return task;
}
```

### Step 5: Switch Reads to New Tables

Update each service to read from its own table. Verify data consistency.

### Step 6: Stop Dual-Write, Drop Old Table

Once all services are migrated and verified:
```sql
-- Only after full verification
DROP TABLE monolith.tasks;
```

---

## Cross-Service References

After the split, services reference each other by ID only:

```
attendance-service                task-service
┌──────────────────┐             ┌──────────────────┐
│ attendance_records│             │ field_tasks       │
│ user_id ──────────┼── REST ───►│ user_id           │
└──────────────────┘             │ project_id ───────┼── REST ──► project-service
                                 └──────────────────┘

ticket-service                    task-service
┌──────────────────┐             ┌──────────────────┐
│ ticket_tasks      │             │ field_tasks       │
│ ticket_id         │             │ id                │
│ user_id ──────────┼── REST ───►│ (for shared       │
└──────────────────┘             │  checkout data)   │
                                 └──────────────────┘

finance-service                   task-service
┌──────────────────┐             ┌──────────────────┐
│ claims            │             │ field_tasks       │
│ task_id ──────────┼── event ──►│ checkout event    │
│ distance          │             │ distance          │
└──────────────────┘             └──────────────────┘
```

### Finance Service Gets Checkout Data via Events

Instead of querying `tasks` directly:

```javascript
// task-service publishes on checkout:
eventBus.publish('task.checked_out', {
  taskId: task.id,
  userId: task.user_id,
  distance: task.distance,
  checkoutTime: task.checkout_time,
  projectId: task.project_id
});

// finance-service subscribes:
eventBus.subscribe('task.checked_out', async (event) => {
  const rate = await ConveyanceConfigModel.getRate(event.userId);
  await ClaimModel.create({
    task_id: event.taskId,
    user_id: event.userId,
    amount: event.distance * rate,
    status: 'pending'
  });
});
```

---

## Database Initialization Script

See `infrastructure/scripts/init-databases.sql`:

```sql
CREATE DATABASE IF NOT EXISTS fsm_auth;
CREATE DATABASE IF NOT EXISTS fsm_master_data;
CREATE DATABASE IF NOT EXISTS fsm_projects;
CREATE DATABASE IF NOT EXISTS fsm_tasks;
CREATE DATABASE IF NOT EXISTS fsm_tickets;
CREATE DATABASE IF NOT EXISTS fsm_attendance;
CREATE DATABASE IF NOT EXISTS fsm_finance;
CREATE DATABASE IF NOT EXISTS fsm_notifications;
CREATE DATABASE IF NOT EXISTS fsm_reporting;

-- Create service-specific users with limited permissions
CREATE USER 'fsm_auth'@'%' IDENTIFIED BY 'auth_password';
GRANT ALL ON fsm_auth.* TO 'fsm_auth'@'%';

CREATE USER 'fsm_tasks'@'%' IDENTIFIED BY 'tasks_password';
GRANT ALL ON fsm_tasks.* TO 'fsm_tasks'@'%';

-- ... repeat for each service
```

---

## Reporting Service Data Strategy

The reporting service needs data from ALL domains. Two approaches:

### Approach 1: Read Replicas (Simpler)

Reporting service connects to read replicas of each service database:

```
reporting-service
  ├── read → fsm_auth (replica)
  ├── read → fsm_tasks (replica)
  ├── read → fsm_tickets (replica)
  ├── read → fsm_attendance (replica)
  └── read → fsm_finance (replica)
```

### Approach 2: Event-Sourced Read Models (Better Long-Term)

Each service publishes events → reporting service builds denormalized read models:

```sql
-- In fsm_reporting database
CREATE TABLE report_tasks (
  id INT PRIMARY KEY,
  user_name VARCHAR(255),
  project_name VARCHAR(255),
  company_name VARCHAR(255),
  task_type VARCHAR(100),
  status VARCHAR(50),
  checkin_time DATETIME,
  checkout_time DATETIME,
  distance DECIMAL(10,2),
  -- denormalized for fast report queries
  INDEX idx_checkin (checkin_time),
  INDEX idx_user (user_name),
  INDEX idx_status (status)
);
```

Start with Approach 1 (read replicas) for Phase 2, migrate to Approach 2 over time.

---

## ID Generation Across Services

The monolith uses auto-increment IDs. In microservices:

| Strategy | When to Use |
|----------|------------|
| Auto-increment per DB | Simple, works if no cross-service ID conflicts |
| UUID v4 | When global uniqueness needed |
| Snowflake IDs | High-volume, sortable, globally unique |

**Recommendation:** Keep auto-increment per service database. Cross-service references use the ID + service name (e.g., `task-service:1234`).

For project IDs (EP####), keep the generation logic in project-service only.
