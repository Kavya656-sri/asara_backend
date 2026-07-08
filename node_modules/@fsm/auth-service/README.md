# Auth Service

**Port:** 3001  
**Database:** `fsm_auth`

## Responsibility

Authentication, user management, roles, device/home approval, profile management.

## Monolith Source Files

Copy from `Easy_FSM_backend/src/`:

| Target | Source |
|--------|--------|
| `routes/auth.routes.js` | `routes/auth.routes.js` |
| `routes/appauth.routes.js` | `routes/appauth.routes.js` |
| `routes/user.routes.js` | `routes/user.routes.js` |
| `routes/role.routes.js` | `routes/role.routes.js` |
| `controllers/*.js` | Matching controllers |
| `models/user.js` | `models/user.js` |
| `models/role.js` | `models/role.js` |

## API Endpoints

- `POST /api/auth/login` — Web admin login
- `POST /api/app/login` — Mobile app login
- `GET/POST/PUT/DELETE /api/users` — User CRUD
- `GET/POST/PUT/DELETE /api/roles` — Role CRUD
- `GET /api/profile/view` — View profile
- `POST /api/profile/update` — Update profile

## Environment

```env
PORT=3001
JWT_SECRET=shared-secret
DB_NAME=fsm_auth
```

## Migration Priority

**Phase 1** — Extract first alongside API Gateway.
