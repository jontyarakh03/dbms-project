/**
 * Database Types & Relational Schema Definitions
 * ClaimVault - Insurance Claim Management System
 * Normalized 3NF Relational Architecture with AI Fraud Scoring Engine
 */

export type PolicyType = 'Health' | 'Vehicle' | 'Life' | 'Property' | 'Travel';

export type ClaimStatus = 'Pending' | 'Under Verification' | 'Approved' | 'Rejected' | 'Paid';

export type PaymentStatus = 'Processing' | 'Completed';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type FraudInvestigationStatus = 'Clear' | 'Flagged' | 'Under SIU Review' | 'Confirmed Fraud' | 'False Positive';

export interface FraudRuleTrigger {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  scoreImpact: number;
  description: string;
  evidence: string;
}

// Fraud Assessment Entity (1:1 with Claim, 3NF Normalized)
export interface FraudAssessment {
  Assessment_ID: number;
  Claim_ID: number; // FK -> Claim.Claim_ID (UNIQUE)
  Risk_Score: number; // 0 - 100
  Risk_Level: RiskLevel;
  Triggered_Rules: FraudRuleTrigger[];
  Recommendation: 'Fast-Track Settlement' | 'Standard Verification' | 'Enhanced Due Diligence (EDD)' | 'Refer to SIU (Special Investigation Unit)';
  Assessment_Date: string;
  Status: FraudInvestigationStatus;
  Investigator_Notes?: string;
  Last_Evaluated_By?: string;
}

// 1. Customer Entity (PK: Customer_ID)
export interface Customer {
  Customer_ID: number;    // Primary Key (INT)
  Name: string;           // VARCHAR(100) NOT NULL
  Address: string;        // VARCHAR(255) NOT NULL
  Phone: string;          // VARCHAR(15) NOT NULL, UNIQUE
  Email: string;          // VARCHAR(100) NOT NULL, UNIQUE
  Created_At?: string;
}

// 2. Policy Entity (PK: Policy_ID, FK: Customer_ID -> Customer.Customer_ID)
export interface Policy {
  Policy_ID: number;      // Primary Key (INT)
  Customer_ID: number;    // Foreign Key -> Customer(Customer_ID)
  Policy_Type: PolicyType;// VARCHAR(20) CHECK (Policy_Type IN ('Health', 'Vehicle', 'Life', 'Property', 'Travel'))
  Premium: number;        // DECIMAL(10,2) CHECK (Premium > 0)
  Start_Date: string;     // DATE NOT NULL
  End_Date: string;       // DATE NOT NULL, CHECK (End_Date >= Start_Date)
}

// 3. Claim Entity (PK: Claim_ID, FK: Policy_ID -> Policy.Policy_ID)
export interface Claim {
  Claim_ID: number;           // Primary Key (INT)
  Policy_ID: number;          // Foreign Key -> Policy(Policy_ID)
  Claim_Date: string;         // DATE NOT NULL
  Claim_Amount: number;       // DECIMAL(10,2) CHECK (Claim_Amount > 0)
  Claim_Status: ClaimStatus;  // VARCHAR(25) CHECK (Claim_Status IN ('Pending', 'Under Verification', 'Approved', 'Rejected', 'Paid'))
  Description: string;        // TEXT NOT NULL
  Rejection_Reason?: string;  // TEXT
  Supporting_Doc_Name?: string; // Mapped document upload preview
  Updated_At?: string;
}

// 4. Payment Entity (PK: Payment_ID, FK: Claim_ID -> Claim.Claim_ID)
export interface Payment {
  Payment_ID: number;         // Primary Key (INT)
  Claim_ID: number;           // Foreign Key -> Claim(Claim_ID)
  Payment_Date: string;       // DATE NOT NULL
  Amount: number;             // DECIMAL(10,2) CHECK (Amount > 0)
  Payment_Status: PaymentStatus; // VARCHAR(20) CHECK (Payment_Status IN ('Processing', 'Completed'))
  Transaction_Ref?: string;   // VARCHAR(50)
  Payment_Method?: string;
}

// 5. Admin Entity (PK: Admin_ID)
export interface Admin {
  Admin_ID: number;       // Primary Key (INT)
  Name: string;           // VARCHAR(100) NOT NULL
  Email: string;          // VARCHAR(100) NOT NULL, UNIQUE
  Password: string;       // VARCHAR(255) NOT NULL
  Role: string;           // VARCHAR(50)
  Avatar?: string;
}

// Joined View Representation (Relational Materialized View)
export interface ClaimDetailedView extends Claim {
  policy: Policy;
  customer: Customer;
  payment?: Payment;
  fraudAssessment?: FraudAssessment;
}

// Audit Transaction Log for ACID demonstration
export interface TransactionAuditEntry {
  id: string;
  timestamp: string;
  transactionId: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'BEGIN' | 'COMMIT' | 'ROLLBACK';
  tableName: string;
  details: string;
  status: 'COMMITTED' | 'ROLLED_BACK' | 'ACTIVE';
}

// Category Breakdown for Reports & Analytics
export interface CategoryAnalytics {
  policyType: PolicyType;
  totalPolicies: number;
  totalClaimsCount: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  paidCount: number;
  approvalRate: number;
  totalClaimedAmount: number;
  totalPaidAmount: number;
  totalPremiumCollected: number;
  lossRatio: number;
}
