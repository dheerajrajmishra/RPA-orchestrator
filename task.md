# Task: RPA Orchestrator Backend
- [x] Initialized Spring Boot 3 + Java 21 project for dashboard backend
- [x] Created JPA entities for User, Role, Permissions, ProcessRegistry
- [x] Implemented JWT authentication filter and utilities
- [x] Implemented Role-Based Access Control (dynamic permissions)
- [x] Created basic REST controllers for dashboard usage (Auth, Process)

## Completed
- Initialized `reporter-api` project (Spring Boot 3, Java 21)
- Implemented `ApiKey`, `ProcessRun`, `ProcessRunStep`, `ProcessRunLog`, and `ProcessRegistry` JPA Entities
- Created Repositories for all entities
- Configured Bucket4j Rate Limiting (`RateLimitingFilter`)
- Configured Custom API Key Authentication Filter (`ApiKeyAuthFilter`, `SecurityConfig`)
- Implemented ingest endpoints (`RunController` with start, complete, heartbeat, step and log endpoints)

## Pending
- Configure `application.yml` for PostgreSQL and Flyway
- Write Unit and Integration Tests
- Build Backend API (Dashboard-facing)
- [x] Build Frontend (Next.js)
  - Initialized Next.js 14 App Router project in the `frontend` directory.
  - Implemented Dashboard layout, light/dark mode theming, and users & permissions screens.
