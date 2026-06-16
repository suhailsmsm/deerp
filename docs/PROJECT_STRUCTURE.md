# DERPX - Project Structure

## Overview
This document outlines the organized folder structure for the DERPX POS/ERP system.

## Current Structure

```
/workspace
├── 📁 frontend/              # React Web Application (TO BE CREATED)
│   ├── 📁 src/
│   │   ├── 📁 components/    # Reusable UI components
│   │   ├── 📁 pages/         # Page components (POS, Inventory, etc.)
│   │   ├── 📁 modules/       # Feature modules
│   │   │   ├── 📁 pos/       # Point of Sale
│   │   │   ├── 📁 inventory/ # Inventory Management
│   │   │   ├── 📁 accounting/# Accounting & VAT
│   │   │   ├── 📁 hr/        # HR & Payroll
│   │   │   ├── 📁 crm/       # Customer Relationship
│   │   │   ├── 📁 procurement/# Procurement
│   │   │   └── 📁 projects/  # Project Management
│   │   ├── 📁 stores/        # Zustand state management
│   │   ├── 📁 hooks/         # Custom React hooks
│   │   ├── 📁 services/      # API services
│   │   ├── 📁 utils/         # Utility functions
│   │   ├── 📁 types/         # TypeScript types
│   │   └── 📁 styles/        # CSS/Tailwind styles
│   ├── 📁 public/            # Static assets
│   ├── index.html
│   ├── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── 📁 api/                   # Backend API (Node.js/Express)
│   ├── 📁 routes/            # API route handlers
│   ├── 📁 middleware/        # Express middleware
│   ├── 📁 controllers/       # Business logic controllers
│   ├── 📁 models/            # Database models
│   ├── 📁 services/          # Business services
│   ├── 📁 utils/             # Utility functions
│   ├── server.js             # Express server entry
│   └── package.json
│
├── 📁 mobile-app/            # React Native Mobile App (Expo)
│   ├── 📁 src/
│   │   ├── 📁 screens/       # Mobile screens
│   │   ├── 📁 components/    # Mobile components
│   │   ├── 📁 navigation/    # Navigation config
│   │   ├── 📁 store/         # State management
│   │   ├── 📁 services/      # API services
│   │   ├── 📁 hooks/         # Custom hooks
│   │   ├── 📁 types/         # TypeScript types
│   │   └── 📁 constants/     # App constants
│   ├── 📁 assets/            # Images, fonts, icons
│   ├── App.tsx
│   ├── package.json
│   └── app.json
│
├── 📁 desktop-app/           # Electron Desktop App (TO BE ORGANIZED)
│   ├── 📁 src/               # Electron main process
│   ├── 📁 renderer/          # React renderer
│   ├── main.js               # Electron main entry
│   ├── preload.js            # Preload script
│   └── package.json
│
├── 📁 super-admin/           # Super Admin Panel (TO BE ORGANIZED)
│   ├── 📁 src/
│   ├── package.json
│   └── vite.config.ts
│
├── 📁 database/              # Database Configuration
│   ├── schema.prisma         # Prisma schema
│   ├── 📁 migrations/        # Database migrations
│   ├── seed.js               # Seed data
│   └── .env                  # Database env vars
│
├── 📁 docs/                  # Documentation (TO BE CREATED)
│   ├── ARCHITECTURE.md
│   ├── SPECIFICATIONS.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── 📁 scripts/               # Build & Deployment Scripts
│   ├── start-server.sh
│   ├── create-test-users.js
│   └── wpsGenerator.js
│
├── .env                      # Environment variables
├── .env.api                  # API environment variables
├── package.json              # Root package.json (workspace)
├── tsconfig.json             # TypeScript config
└── README.md
```

## Module Breakdown

### 1. POS Module (`frontend/src/modules/pos/`)
- `POSScreen.jsx` - Main POS interface
- `CartManager.jsx` - Cart handling
- `PaymentModal.jsx` - Payment processing
- `ReceiptPrinter.jsx` - Receipt generation
- `BarcodeScanner.jsx` - Barcode scanning

### 2. Inventory Module (`frontend/src/modules/inventory/`)
- `InventoryDashboard.jsx` - Overview
- `StockManagement.jsx` - Stock levels
- `ExpiryTracking.jsx` - Expiry dates
- `BranchTransfer.jsx` - Multi-branch transfers
- `ProductCatalog.jsx` - Product management

### 3. Accounting Module (`frontend/src/modules/accounting/`)
- `AccountingDashboard.jsx` - Financial overview
- `VATReports.jsx` - UAE VAT reports
- `FinancialStatements.jsx` - P&L, Balance Sheet
- `JournalEntries.jsx` - Manual entries
- `FTACoreporting.jsx` - FTA compliance

### 4. HR Module (`frontend/src/modules/hr/`)
- `HRDashboard.jsx` - HR overview
- `EmployeeManagement.jsx` - Employee records
- `AttendanceTracking.jsx` - Attendance
- `PayrollProcessing.jsx` - Salary calculation
- `WPSExport.jsx` - UAE WPS export

### 5. CRM Module (`frontend/src/modules/crm/`)
- `CRMDashboard.jsx` - Customer overview
- `CustomerProfiles.jsx` - Customer details
- `CommunicationLog.jsx` - Interactions
- `LoyaltyProgram.jsx` - Loyalty points

### 6. Procurement Module (`frontend/src/modules/procurement/`)
- `ProcurementDashboard.jsx` - Purchase overview
- `PurchaseOrders.jsx` - PO management
- `SupplierManagement.jsx` - Suppliers
- `GoodsReceipt.jsx` - GRN processing

### 7. Projects Module (`frontend/src/modules/projects/`)
- `ProjectDashboard.jsx` - Project overview
- `ProjectPlanning.jsx` - Planning & timelines
- `ResourceAllocation.jsx` - Resources
- `ProjectAccounting.jsx` - Project costs

## File Migration Plan

### Files to Move to `frontend/src/pages/`:
- `AdminPanel.jsx` → `frontend/src/pages/AdminPanel.jsx`
- `StaffLogin.jsx` → `frontend/src/pages/StaffLogin.jsx`
- `ModuleSettings.jsx` → `frontend/src/pages/ModuleSettings.jsx`
- `SettingsAdmin.jsx` → `frontend/src/pages/SettingsAdmin.jsx`

### Files to Move to `frontend/src/modules/`:
- `AIInsights.jsx` → `frontend/src/modules/common/AIInsights.jsx`
- `Accounting.jsx` → `frontend/src/modules/accounting/Accounting.jsx`
- `AdvancedInventory.jsx` → `frontend/src/modules/inventory/AdvancedInventory.jsx`
- `CRM.jsx` → `frontend/src/modules/crm/CRM.jsx`
- `HRPayroll.jsx` → `frontend/src/modules/hr/HRPayroll.jsx`
- `InventoryExpiry.jsx` → `frontend/src/modules/inventory/InventoryExpiry.jsx`
- `Procurement.jsx` → `frontend/src/modules/procurement/Procurement.jsx`
- `Projects.jsx` → `frontend/src/modules/projects/Projects.jsx`
- `SalesReports.jsx` → `frontend/src/modules/reports/SalesReports.jsx`
- `Reports.jsx` → `frontend/src/modules/reports/Reports.jsx`

### Files to Move to `frontend/src/components/`:
- `Sidebar.jsx` → `frontend/src/components/layout/Sidebar.jsx`
- `TableMap.jsx` → `frontend/src/components/common/TableMap.jsx`
- `ReceiptPreview.jsx` → `frontend/src/components/pos/ReceiptPreview.jsx`

### Files to Move to `frontend/src/store/`:
- `cartStore.js` → `frontend/src/store/cartStore.js`
- `moduleStore.js` → `frontend/src/store/moduleStore.js`
- `sessionStore.js` → `frontend/src/store/sessionStore.js`
- `rbac.js` → `frontend/src/store/rbac.js`

### Keep in Root (for now):
- `main.tsx` → Entry point (stays in frontend root after restructure)
- `index.html` → HTML template
- `app.css`, `index.css` → Global styles
- `pos_erp_system.css` → Main styles
- `page.tsx` → Main app component (to be refactored)

### Backend Files:
- `api/server.js` → Main API server
- `api/routes/*` → API routes
- `api/middleware/*` → Middleware
- `schema.prisma` → Database schema
- `seed.js` → Seed script

### Mobile App:
- Already well structured in `mobile-app/`

## Next Steps

1. Create the new directory structure
2. Move files to appropriate locations
3. Update all import paths
4. Create missing configuration files
5. Set up GitHub Pages deployment workflow

Would you like me to proceed with reorganizing the files into this structure?
