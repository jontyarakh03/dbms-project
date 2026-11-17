# ClaimVault — Insurance Claim Management System (3NF DBMS)
**Modern Insurtech / Fintech Platform with Relational Database Engine**

---

## 🏛️ System Overview & Architecture

**ClaimVault** is an enterprise-grade Insurance Claim Management web application based on a normalized **3rd Normal Form (3NF)** relational database schema. It features a modern fintech UI, a 7-step claim verification lifecycle, atomic SQL settlement transactions (ACID), and an interactive in-browser DBMS & SQL Query Console.

### 🎨 Visual Design System & Palette
- **Deep Navy** (`#0B2559`): Primary sidebar, dark headers, brand accents
- **Royal Blue** (`#15529E`): Primary action buttons, active navigation states
- **Teal** (`#008B9E`): Accent badges, settlement indicators, highlights
- **Slate App Background** (`#F6F9FC`): Light background with crisp contrast
- **Dark Mode**: Fully supported with instant toggle
- **Typography**: Geometric UI sans (`Inter`, `Plus Jakarta Sans`) & tabular monospace (`JetBrains Mono`) for monetary currency (`₹`), Primary Keys (`PK`), Foreign Keys (`FK`), and SQL scripts.

---

## 📊 Relational Database Schema (3NF)

```
       +---------------------------------------------+
       |                  CUSTOMER                   |
       |  PK: Customer_ID (INT)                      |
       |  Attributes: Name, Address, Phone, Email    |
       |  Constraints: UNIQUE(Phone), UNIQUE(Email)  |
       +---------------------------------------------+
                              |
                              | 1 : N (One Customer has Many Policies)
                              v
       +---------------------------------------------+
       |                   POLICY                    |
       |  PK: Policy_ID (INT)                        |
       |  FK: Customer_ID -> Customer(Customer_ID)   |
       |  Attributes: Policy_Type, Premium, Dates    |
       |  Constraints: CHECK(Premium > 0), Dates     |
       +---------------------------------------------+
                              |
                              | 1 : N (One Policy has Many Claims)
                              v
       +---------------------------------------------+
       |                    CLAIM                    |
       |  PK: Claim_ID (INT)                         |
       |  FK: Policy_ID -> Policy(Policy_ID)         |
       |  Attributes: Date, Amount (>0), Status, Desc|
       |  Constraints: CHECK(Claim_Amount > 0)       |
       +---------------------------------------------+
                              |
                              | 1 : 1 (One Claim has One Settlement)
                              v
       +---------------------------------------------+
       |                   PAYMENT                   |
       |  PK: Payment_ID (INT)                       |
       |  FK: Claim_ID -> Claim(Claim_ID) [UNIQUE]   |
       |  Attributes: Date, Amount, Status, Ref      |
       |  Constraints: CHECK(Amount > 0)             |
       +---------------------------------------------+

       +---------------------------------------------+
       |                    ADMIN                    |
       |  PK: Admin_ID (INT)                         |
       |  Attributes: Name, Email (UQ), PasswordHash |
       |  Role: Chief Adjudicator / Verification     |
       +---------------------------------------------+
```

---

## ⚡ Core System Modules

1. **Dashboard:**
   - 4 Real-time KPI cards: Total Customers, Active Policies, Pending / In-Review Claims, Disbursed Payouts (₹).
   - Interactive charts: Claims by Status distribution and Claims by Policy Type (Health, Vehicle, Life, Property, Travel).
   - Quick-action buttons: `+ Register Customer`, `+ Issue Policy`, `+ File Claim`.
   - Recent Claims Activity Ledger joining Customer + Policy + Claim.

2. **Customer Management (`/customers`):**
   - Searchable, sortable table (Customer ID, Name, Phone, Email, Address, Policy Count).
   - Slide-over detail drawer showing a customer's linked Policies and Claims (`1:N` relational view).
   - Register Customer modal & Edit Customer modal with duplicate Phone/Email validation.
   - Safe delete protection enforcing referential integrity (`ON DELETE RESTRICT`).

3. **Policy Management (`/policies`):**
   - Filterable by Policy Type (`Health`, `Vehicle`, `Life`, `Property`, `Travel`).
   - Active / Expired badge calculated from current date.
   - Issue Policy modal with Customer FK selector, premium, and date bounds (`End_Date >= Start_Date`).

4. **Claim Management & 7-Step Verification Workflow (`/claims`):**
   - Tabbed status filters: `All`, `Pending`, `Under Verification`, `Approved`, `Rejected`, `Paid`.
   - "File New Claim" modal with Customer ➔ Policy selection, amount (`> 0`), date, description, and document upload preview.
   - **Slide-over 7-Step Verification Drawer:**
     - Step 1: Customer Registration
     - Step 2: Policy Creation
     - Step 3: Claim Filed
     - Step 4: Under Verification
     - Step 5: Approved / Rejected
     - Step 6: Payment Processing
     - Step 7: Paid / Disbursed
   - Admin workflow actions:
     - `Start Verification` (`Pending` ➔ `Under Verification`)
     - `Approve & Create Payment` (Atomic transaction creating `Processing` payment voucher)
     - `Reject Claim` (with reason note)

5. **Payment Management (`/payments`):**
   - Joined payout ledger: `Payment_ID`, `Claim_ID`, Customer Name, Policy Type, Date, Amount, Status, Transaction Ref.
   - One-click `"Mark Completed"` button updating `Payment_Status = Completed` and `Claim_Status = Paid` with confetti celebration and live WAL logs.
   - Electronic Payment Voucher / Settlement Receipt modal with print support.

6. **Reports & Analytics (`/reports`):**
   - Multi-dimensional breakdown by insurance category: Policy volume, claims count, approval rate, rejection rate, loss ratio.
   - One-click **CSV Exports** for:
     - Customers (`claimvault_customers_3nf.csv`)
     - Claims (`claimvault_claims_ledger.csv`)
     - Payments (`claimvault_payments_payouts.csv`)

7. **DBMS & SQL Explorer (`/dbms`):**
   - **Admin Login & Role Switcher** backed by the `Admin` table.
   - **Interactive ER Diagram**: Visual mapping with PK/FK badges, relationship connectors, and live sample table rows.
   - **3NF Normalization Proof**: Rigorous explanation of 1NF, 2NF, and 3NF compliance.
   - **Live SQL Query Console**: Pre-loaded SQL presets, query execution with elapsed time in ms, query plan, and formatted results table.
   - **ACID Transaction Simulator**: Live Write-Ahead Logging (WAL) audit trail with Commit and Rollback recovery.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone or navigate to the directory
cd /Users/grishma/Downloads/insurance

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the assigned port) in your web browser.

### Building for Production
```bash
npm run build
```
Creates an optimized static bundle in the `dist/` directory.
