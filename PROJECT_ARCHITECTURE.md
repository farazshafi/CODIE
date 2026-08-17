# CODIE - Project Architecture Document

## 1. System Overview

**CODIE** is a real-time collaborative development environment engineered for pair programming, live code editing, instant execution, and community project discovery. The system uses a microservice-ready modular architecture consisting of a Next.js 15 client, an Express/Node.js backend with Socket.io, a sandboxed Piston execution engine, Redis caching/messaging, and MongoDB primary storage.

---

## 2. Technical Stack & Layer Responsibilities

### A. Frontend Client (`/client`)
* **Framework**: Next.js 15 (App Router), React 19
* **Language**: TypeScript 5
* **Styling & UI**: Tailwind CSS 4, Radix UI primitives, Framer Motion
* **State Management**:
  * **Client State**: Zustand
  * **Server State**: TanStack / React Query
* **Code Editor**: Monaco Editor (`@monaco-editor/react`)
* **Real-time Client**: `socket.io-client`
* **HTTP Client**: Axios

### B. Backend API & Real-time Server (`/server`)
* **Runtime**: Node.js v20+, Express.js framework
* **Language**: TypeScript 5 with Dependency Injection via Awilix IoC container
* **API Architecture**: RESTful API endpoints (Controllers, Services, Repositories)
* **Database Layer**:
  * **Primary DB**: MongoDB with Mongoose ORM
  * **Relational DB**: Neon (PostgreSQL integration option)
* **Real-time Collaboration Engine**: Socket.io with `@socket.io/redis-adapter` for multi-instance scaling
* **Task Queue & Async Processing**: BullMQ with Redis
* **Logging & Telemetry**: Structured logging via Pino and Pino-HTTP
* **Cron Scheduling**: `node-cron` for periodic maintenance background tasks

### C. Sandboxed Execution Engine (`/piston`)
* **Purpose**: Isolated code execution engine wrapper
* **Features**: Receives code payloads, executes them in a secure containerized environment, and streams stdout/stderr outputs back to the client.

### D. Data & Messaging Layer
* **MongoDB**: Stores user profiles, projects, code snippets, subscriptions, and comment threads.
* **Redis**: Used for session caching, Socket.io pub/sub event distribution across server instances, and BullMQ worker job queuing.

### E. Infrastructure & Deployment (`/k8s` & Docker)
* **Docker & Docker Compose**: Local development container orchestration
* **Kubernetes (K8s)**: Declarative deployment manifests (`backend-deployment.yaml`, `backend-service.yaml`, `frontend-deployment.yaml`, `frontend-service.yaml`)

---

## 3. Core Subsystems & Workflows

1. **Real-time Collaboration Subsystem**
   * Clients establish WebSocket connections to the Socket manager.
   * Project sessions join room channels (`project:{id}`).
   * Editor updates, cursor positions, and presence states are broadcasted across room participants via Socket.io backed by Redis Pub/Sub adapter.

2. **Code Execution Subsystem**
   * Users request code runs directly from the Monaco editor frontend.
   * Requests route to the backend execution controllers, which delegate execution to the Piston engine service.
   * Standard output, standard error, and runtime metrics stream back live to the user's terminal UI.

3. **Authentication & Authorization**
   * Multi-provider authentication supporting Firebase Auth and custom JWT tokens.
   * Middleware layers enforce Role-Based Access Control (RBAC) across protected API routes.

4. **Billing & Subscriptions**
   * Razorpay integration for premium tiers and subscription handling.
   * Webhook listeners process payment state changes asynchronously.

---

## 4. Directory Structure Overview

```text
CODIE/
├── client/                     # Next.js 15 Frontend Application
│   ├── public/                 # Static assets & public images
│   └── src/
│       ├── apis/               # REST API client logic
│       ├── app/                # Next.js App Router pages & layouts
│       ├── components/         # Modular React components & Monaco editor UI
│       ├── context/            # React context providers
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # Client utilities & configuration
│       ├── stores/             # Zustand global state stores
│       └── types/              # Frontend TypeScript types
│
├── server/                     # Express & Node.js Backend API
│   └── src/
│       ├── bullmq/             # Async background workers & queue definitions
│       ├── config/             # Environment, DB, & Redis configurations
│       ├── controllers/        # Express HTTP endpoint controllers
│       ├── db/                 # Database connection drivers
│       ├── middlewares/        # Security, Auth, & Error handling middlewares
│       ├── models/             # Mongoose database schemas & models
│       ├── repositories/       # Data Access Layer (DAL) abstractions
│       ├── routes/             # API route handlers
│       ├── services/           # Business logic layer
│       ├── sockets/            # Socket.io event handlers & room handlers
│       ├── types/              # Backend TypeScript types
│       ├── utils/              # Helper utilities & Pino logger
│       ├── validation/         # Input validation schemas
│       ├── app.ts              # Express application initializer
│       ├── container.ts        # Awilix DI Container registration
│       ├── server.ts           # HTTP & Socket server bootstrap
│       └── worker.ts           # BullMQ worker startup script
│
├── piston/                     # Code execution sandboxed engine
│   ├── Dockerfile              # Container spec for Piston runner
│   └── server.js               # Code runner entry point
│
└── k8s/                        # Kubernetes deployment & service manifests
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── frontend-deployment.yaml
    └── frontend-service.yaml
```

---

## 5. Architectural Patterns & Design Principles

* **Dependency Injection (DI)**: Powered by Awilix IoC container to decouple controllers, services, repositories, and third-party modules.
* **Repository Pattern**: Strict separation between business logic and database queries for maximum testability.
* **Event-Driven Architecture**: Real-time event broadcasting using Socket.io and Redis Pub/Sub.
* **Asynchronous Queue Pattern**: Heavy tasks offloaded to BullMQ workers to keep HTTP responses low-latency and event loop non-blocking.
* **Horizontal Scalability**: Stateless API design supporting horizontal pod autoscaling via Kubernetes.
