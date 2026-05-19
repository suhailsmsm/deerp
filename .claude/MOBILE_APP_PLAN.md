# Mobile App Implementation Plan

## Overview
Create a React Native mobile app for dERP with limited features (POS, CRM, mobile settings), sharing a REST API backend with the existing Electron desktop app.

**Stack:**
- Frontend: React Native (Expo for easier development)
- Backend: Express.js API layer (extracted from Electron main.js)
- Database: Same Prisma setup (SQLite dev / PostgreSQL prod)
- State: Zustand (mobile store)
- Architecture: Online-only, REST API-based

---

## Phase 1: Backend API Layer (Week 1-2)

### 1.1 Extract Business Logic to API Server
**Objective:** Create an Express.js REST API that serves both desktop (Electron IPC) and mobile apps.

**Tasks:**
- Create `/api` directory with Express.js setup
- Extract POS business logic into API routes:
  - `POST /api/pos/transactions` - Create transaction
  - `GET /api/pos/transactions` - List transactions
  - `GET /api/pos/products` - List products
  - `POST /api/pos/calculate-tax` - Tax calculation (UAE VAT)
  - `GET /api/pos/receipt/:id` - Get receipt
- Extract CRM business logic into API routes:
  - `GET /api/crm/customers` - List customers
  - `POST /api/crm/customers` - Create customer
  - `GET /api/crm/customers/:id` - Get customer details
  - `PUT /api/crm/customers/:id` - Update customer
  - `GET /api/crm/orders` - List orders
  - `POST /api/crm/orders` - Create order
- Create authentication routes:
  - `POST /api/auth/login` - Mobile login
  - `POST /api/auth/logout` - Logout
  - `POST /api/auth/refresh` - Token refresh
- Create settings routes:
  - `GET /api/settings/mobile` - Get mobile app settings
  - `PUT /api/settings/mobile` - Update mobile settings
  - `GET /api/user/profile` - Get user profile

**Files to Create:**
- `api/server.js` - Express app setup
- `api/routes/pos.js` - POS endpoints
- `api/routes/crm.js` - CRM endpoints
- `api/routes/auth.js` - Authentication
- `api/routes/settings.js` - Settings management
- `api/middleware/auth.js` - JWT verification
- `api/middleware/validation.js` - Input validation
- `.env.api` - API configuration

### 1.2 Database Migrations for Mobile Features
**Tasks:**
- Add `mobileToken` field to User model (for mobile app sessions)
- Add `lastMobileSync` timestamp (for future offline sync)
- Ensure multi-tenancy support in all endpoints

**Files to Modify:**
- `schema.prisma` - Add mobile-related fields

### 1.3 Update Electron Main Process
**Tasks:**
- Modify Electron to start Express API server alongside IPC
- Switch Electron IPC handlers to call API endpoints instead of direct DB access
- Set API port (e.g., 3001)

**Files to Modify:**
- `main.js` - Add API server startup

---

## Phase 2: Mobile App Project Setup (Week 1-2)

### 2.1 Create React Native Project
**Objective:** Set up Expo-based React Native project structure.

**Tasks:**
- Create new folder: `mobile-app/` at project root
- Initialize Expo project: `npx create-expo-app deerp-mobile`
- Install shared dependencies:
  ```
  npm install zustand axios react-native-secure-store
  npm install --save-dev typescript @types/react-native
  ```
- Create folder structure:
  ```
  mobile-app/
  ├── app/               # Expo routing (if using Expo Router)
  ├── src/
  │   ├── screens/       # POS, CRM, Settings screens
  │   ├── components/    # Shared mobile components
  │   ├── store/         # Zustand stores
  │   ├── services/      # API client
  │   ├── utils/         # Helpers
  │   └── styles/        # Mobile-specific styles
  ├── App.js
  ├── app.json
  ├── package.json
  └── tsconfig.json
  ```

**Files to Create:**
- `mobile-app/app.json` - Expo config
- `mobile-app/App.jsx` - Root component
- `mobile-app/package.json` - Mobile dependencies
- `mobile-app/tsconfig.json` - TypeScript config

---

## Phase 3: Shared Code Layer (Week 2)

### 3.1 Create Shared Services
**Objective:** Create reusable API client and business logic for both desktop and mobile.

**Tasks:**
- Create `shared/` directory (used by both desktop and mobile):
  - `shared/api/client.js` - Axios API client with auth tokens
  - `shared/services/pos.js` - POS business logic (calls API)
  - `shared/services/crm.js` - CRM business logic (calls API)
  - `shared/utils/vat.js` - VAT calculation (reuse from rbac.js if applicable)
  - `shared/types.ts` - Shared TypeScript types

**Files to Create:**
- `shared/api/client.js` - Base API client
- `shared/services/pos.js` - POS service layer
- `shared/services/crm.js` - CRM service layer
- `shared/constants/config.js` - API URLs, constants

---

## Phase 4: Mobile App - Authentication & Core (Week 2-3)

### 4.1 Authentication Flow
**Tasks:**
- Create login screen with email/password
- Implement JWT token storage (secure storage on mobile)
- Create token refresh logic
- Add logout functionality
- Create protected route wrapper

**Files to Create:**
- `mobile-app/src/screens/LoginScreen.jsx`
- `mobile-app/src/store/authStore.js` - Auth state
- `mobile-app/src/services/authService.js` - Login/logout logic
- `mobile-app/src/components/ProtectedRoute.jsx`

### 4.2 Core Navigation & Layout
**Tasks:**
- Set up bottom tab navigation (POS, CRM, Settings)
- Create main app layout component
- Add header with user info, logout button

**Files to Create:**
- `mobile-app/src/Navigation.jsx` - Navigation structure
- `mobile-app/src/components/Header.jsx`
- `mobile-app/src/components/BottomTabs.jsx`

---

## Phase 5: Mobile App - POS Module (Week 3-4)

### 5.1 POS Features
**Screens:**
- **Products List** - Browse products, search, filter
- **Cart** - Add/remove items, adjust quantities, see total
- **Checkout** - Finalize sale, select payment method, print receipt
- **Transaction History** - View past transactions

**Tasks:**
- Create product listing with search
- Build shopping cart with add/remove items
- Implement cart total calculation (with VAT)
- Create checkout flow
- Add receipt preview/printing
- Connect to `/api/pos/*` endpoints

**Files to Create:**
- `mobile-app/src/screens/POS/ProductsScreen.jsx`
- `mobile-app/src/screens/POS/CartScreen.jsx`
- `mobile-app/src/screens/POS/CheckoutScreen.jsx`
- `mobile-app/src/screens/POS/HistoryScreen.jsx`
- `mobile-app/src/components/ProductCard.jsx`
- `mobile-app/src/components/CartItem.jsx`
- `mobile-app/src/store/posStore.js` - Cart & POS state
- `mobile-app/src/services/posService.js` - POS API calls

---

## Phase 6: Mobile App - CRM Module (Week 4)

### 6.1 CRM Features
**Screens:**
- **Customers List** - Browse customers, search
- **Customer Detail** - View customer info, order history
- **Create Order** - Create order for customer
- **Order History** - View customer orders

**Tasks:**
- Create customers listing with search
- Build customer detail view
- Implement order creation flow
- Display customer order history
- Connect to `/api/crm/*` endpoints

**Files to Create:**
- `mobile-app/src/screens/CRM/CustomersScreen.jsx`
- `mobile-app/src/screens/CRM/CustomerDetailScreen.jsx`
- `mobile-app/src/screens/CRM/CreateOrderScreen.jsx`
- `mobile-app/src/components/CustomerCard.jsx`
- `mobile-app/src/store/crmStore.js` - CRM state
- `mobile-app/src/services/crmService.js` - CRM API calls

---

## Phase 7: Mobile App - Settings & Profile (Week 4)

### 7.1 Mobile Settings
**Screens:**
- **User Profile** - View/edit profile
- **App Settings** - Language, theme, currency, default tax rate
- **Offline Settings** (placeholder for future)
- **About** - App version, company info

**Tasks:**
- Create user profile screen
- Build settings screen with toggles/dropdowns
- Save settings to mobile storage (AsyncStorage)
- Sync settings with server on change
- Add logout button

**Files to Create:**
- `mobile-app/src/screens/SettingsScreen.jsx`
- `mobile-app/src/screens/ProfileScreen.jsx`
- `mobile-app/src/store/settingsStore.js`
- `mobile-app/src/services/settingsService.js`

---

## Phase 8: Mobile Styling & UX (Week 4-5)

### 8.1 Styling Setup
**Tasks:**
- Create mobile-specific theme system (colors, typography, spacing)
- Use React Native StyleSheet and/or NativeWind (Tailwind for React Native)
- Ensure responsive design for various phone sizes
- Create reusable component library

**Files to Create:**
- `mobile-app/src/styles/theme.js` - Colors, fonts, spacing
- `mobile-app/src/styles/global.js` - Global styles
- `mobile-app/src/components/Button.jsx` - Styled button
- `mobile-app/src/components/Input.jsx` - Styled input
- `mobile-app/src/components/Card.jsx` - Styled card

---

## Phase 9: Testing & Deployment Setup (Week 5)

### 9.1 Testing
**Tasks:**
- Add Jest + React Native Testing Library
- Write unit tests for services (API calls, calculations)
- Test authentication flow
- Test POS cart logic
- Test CRM customer operations

**Files to Create:**
- `mobile-app/__tests__/services/posService.test.js`
- `mobile-app/__tests__/services/crmService.test.js`
- `mobile-app/__tests__/store/authStore.test.js`

### 9.2 Build Configuration
**Tasks:**
- Configure Expo build for iOS
- Configure Expo build for Android
- Set up Expo development build
- Create CI/CD pipeline (GitHub Actions or similar)
- Configure environment variables for different builds (dev, staging, prod)

**Files to Create:**
- `mobile-app/.env.development`
- `mobile-app/.env.staging`
- `mobile-app/.env.production`
- `.github/workflows/mobile-build.yml` (if using GitHub Actions)

---

## Implementation Order (Priority)

1. **Phase 1** (API Layer) - Foundation for all mobile features
2. **Phase 2 + 3** (Mobile Setup + Shared Code) - Project structure
3. **Phase 4** (Auth) - Without auth, nothing else works
4. **Phase 5** (POS) - Most commonly used feature
5. **Phase 6** (CRM) - Second priority feature
6. **Phase 7** (Settings) - Enhances user experience
7. **Phase 8** (Styling) - Polish UI
8. **Phase 9** (Testing/Deployment) - Production-ready

---

## Dependencies to Install

**Backend (API):**
```json
{
  "express": "^4.18.0",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3"
}
```

**Mobile App:**
```json
{
  "expo": "^50.0.0",
  "react-native": "^0.73.0",
  "zustand": "^4.5.0",
  "axios": "^1.6.0",
  "react-native-secure-store": "^2.0.0",
  "@react-navigation/native": "^6.0.0",
  "@react-navigation/bottom-tabs": "^6.0.0",
  "nativewind": "^2.0.0"
}
```

---

## Git Structure

```
deerp/
├── api/                       # New: Express API server
├── shared/                    # New: Shared code (services, types)
├── mobile-app/                # New: React Native Expo app
├── main.js                    # Modified: Start API server
├── schema.prisma              # Modified: Add mobile fields
└── ...existing desktop files
```

---

## Database Changes Needed

```prisma
model User {
  // ... existing fields
  mobileToken    String?       // Token for mobile app sessions
  mobileDeviceId String?       // Device identifier for mobile
  lastMobileSync DateTime?     // Track last sync time
}
```

---

## Security Considerations

1. **API Authentication:** JWT tokens with refresh mechanism
2. **Secure Token Storage:** Use `react-native-secure-store` for mobile
3. **CORS Configuration:** API should only accept requests from authorized mobile app
4. **Rate Limiting:** Implement rate limiting on API endpoints
5. **Input Validation:** Validate all API inputs server-side
6. **Encryption:** Encrypt sensitive data in transit (HTTPS only)

---

## Success Criteria

- ✅ Mobile app runs on iOS and Android
- ✅ User can login with mobile credentials
- ✅ POS module: Create transactions, view history
- ✅ CRM module: Browse customers, view/create orders
- ✅ Settings: Update profile, change app settings
- ✅ All features work online-only without data loss
- ✅ Mobile app syncs data with desktop ERP
- ✅ Proper error handling and loading states
- ✅ Tests pass with >80% coverage
