# DERPX - Project Structure

## Overview
This document describes the reorganized folder structure for the DERPX POS/ERP system.

## Directory Structure

```
/workspace
├── frontend/                 # React Web Application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Sidebar.jsx
│   │   │   └── TableMap.jsx
│   │   ├── pages/           # Page components (modules)
│   │   │   ├── AIInsights.jsx
│   │   │   ├── Accounting.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── AdvancedInventory.jsx
│   │   │   ├── CRM.jsx
│   │   │   ├── HRPayroll.jsx
│   │   │   ├── InventoryExpiry.jsx
│   │   │   ├── ModuleSettings.jsx
│   │   │   ├── Procurement.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ReceiptPreview.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── SalesReports.jsx
│   │   │   ├── SettingsAdmin.jsx
│   │   │   ├── StaffLogin.jsx
│   │   │   └── page.tsx
│   │   ├── store/           # State management (Zustand)
│   │   │   ├── cartStore.js
│   │   │   ├── moduleStore.js
│   │   │   └── sessionStore.js
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   │   └── rbac.js
│   │   ├── assets/          # Images, fonts, etc.
│   │   ├── app.css
│   │   ├── index.css
│   │   ├── pos_erp_system.css
│   │   ├── global.d.ts
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── api/                     # Backend API (Node.js/Express)
│   ├── routes/              # API route handlers
│   ├── middleware/          # Express middleware
│   └── server.js            # Main server entry point
│
├── mobile-app/              # React Native Mobile Application
│   ├── src/
│   ├── assets/
│   ├── App.tsx
│   ├── package.json
│   └── ...
│
├── desktop-app/             # Electron Desktop Application
│   ├── main.js              # Electron main process
│   ├── preload.js           # Preload script
│   └── browserElectronFallback.js
│
├── database/                # Database Configuration
│   ├── migrations/          # Prisma migrations
│   ├── seeds/               # Seed data
│   ├── schema.prisma        # Prisma schema
│   └── seed.js              # Seed script
│
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md
│   ├── SPECIFICATIONS.md
│   ├── OPTIMIZATION_SUMMARY.md
│   ├── DEPENDENCY_AUDIT_REPORT.md
│   ├── PROJECT_STRUCTURE.md
│   └── .env.api             # Environment variables template
│
├── scripts/                 # Build & Deployment Scripts
│   ├── start-server.sh
│   ├── create-test-users.js
│   └── wpsGenerator.js
│
├── .gitignore
└── README.md
```

## Modules Overview

### Frontend Pages (src/pages/)
- **POS Module**: Point of Sale interface
- **Inventory**: Advanced inventory management with expiry tracking
- **Accounting**: Financial management and VAT compliance
- **HR/Payroll**: Employee management and UAE WPS payroll
- **CRM**: Customer relationship management
- **Procurement**: Purchase orders and supplier management
- **Projects**: Project tracking and management
- **Reports**: Sales and business analytics
- **Admin**: System administration and settings

### Key Features
- ✅ Bilingual support (Arabic/English with RTL)
- ✅ UAE VAT compliance (5%)
- ✅ Multi-branch support
- ✅ Role-based access control (RBAC)
- ✅ Real-time inventory tracking
- ✅ WPS payroll export

## Getting Started

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd api
npm install
node server.js
```

### Database Setup
```bash
cd database
npx prisma migrate dev
node seed.js
```

## Deployment
- **Frontend**: Deploy to Vercel, Netlify, or GitHub Pages
- **Backend**: Deploy to Render, Railway, or Fly.io
- **Database**: Use Neon, Supabase, or managed PostgreSQL
