# DERPX - System Architecture

## Core Stack
- **Backend:** Electron (Node.js) + Prisma (ORM) + SQLite (Local) / PostgreSQL (Cloud).
- **Frontend:** React 18 + Vite + Tailwind CSS + Zustand.
- **Compliance:** UAE FTA VAT 201, ZATCA-style QR, WPS SIF Generation.

## Directory Structure (Production Ready)
```text
deerp/
├── prisma/                 # Database Schema & Migrations
├── services/               # Shared Business Logic
│   ├── rbac.js             # Role-Based Access Control
│   ├── vatCalculator.js    # UAE VAT Compliance Logic
│   └── wpsGenerator.js     # UAE WPS SIF File Logic
├── src/                    # Frontend React Application
│   ├── components/         # Shared UI Components (Modals, Inputs)
│   ├── modules/            # ERP Modules (POS, HR, Accounting)
│   ├── store/              # Zustand State Management
│   └── utils/              # Frontend Helpers (Bilingual formatting)
├── main.js                 # Electron Main Process (IPC Handlers)
└── preload.js              # Secure Bridge
```

## Multi-Tenancy Strategy
- Each `Tenant` has a unique UUID.
- Data isolation is enforced at the database level using `tenantId` on all core models.
- Subscription tiers (Starter, Pro, Enterprise) control module access via `moduleStore.js`.

## UAE Compliance
- **Bilingual:** All `Product` and `Company` models support `name` and `nameAr`.
- **VAT:** Standard 5% rate with "Tax Invoice" requirements.
- **WPS:** Automated .SIF file generation for Ministry of Human Resources & Emiratisation (MOHRE).
