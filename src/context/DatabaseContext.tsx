import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../database/dbEngine';
import {
  Customer,
  Policy,
  Claim,
  Payment,
  Admin,
  ClaimDetailedView,
  TransactionAuditEntry,
  ClaimStatus,
  PolicyType,
  CategoryAnalytics,
  FraudAssessment,
  FraudInvestigationStatus
} from '../types/database';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface DatabaseContextType {
  // State
  customers: Customer[];
  policies: Policy[];
  claims: Claim[];
  payments: Payment[];
  admins: Admin[];
  auditLog: TransactionAuditEntry[];
  detailedClaims: ClaimDetailedView[];
  categoryAnalytics: CategoryAnalytics[];

  // Auth
  isLoggedIn: boolean;
  loginAsAdmin: (email: string) => boolean;
  loginAsCustomer: (email: string, customerId: number) => boolean;
  logout: () => void;

  // Active Admin / User
  activeAdmin: Admin;
  setActiveAdmin: (admin: Admin) => void;
  currentRole: 'admin' | 'customer';
  setRole: (role: 'admin' | 'customer') => void;
  selectedCustomerId: number;
  setSelectedCustomerId: (id: number) => void;
  activeCustomer?: Customer;

  // Dark mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Global Search
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;

  // Navigation & Modals
  activeSection: string;
  setActiveSection: (sec: string) => void;
  isRegisterCustomerOpen: boolean;
  setIsRegisterCustomerOpen: (open: boolean) => void;
  isIssuePolicyOpen: boolean;
  setIsIssuePolicyOpen: (open: boolean) => void;
  isFileClaimOpen: boolean;
  setIsFileClaimOpen: (open: boolean) => void;
  selectedClaimForDetail: ClaimDetailedView | null;
  setSelectedClaimForDetail: (claim: ClaimDetailedView | null) => void;
  selectedReceiptPayment: { payment: Payment; claim: ClaimDetailedView } | null;
  setSelectedReceiptPayment: (val: { payment: Payment; claim: ClaimDetailedView } | null) => void;

  // Actions
  addCustomer: (cust: Omit<Customer, 'Customer_ID'> & { Customer_ID?: number }) => Customer;
  updateCustomer: (id: number, updates: Partial<Omit<Customer, 'Customer_ID'>>) => Customer;
  deleteCustomer: (id: number) => void;
  addPolicy: (pol: Omit<Policy, 'Policy_ID'> & { Policy_ID?: number }) => Policy;
  deletePolicy: (id: number) => void;
  fileClaim: (data: { policyId: number; amount: number; date: string; description: string; supportingDocName?: string }) => Promise<Claim>;
  startVerification: (claimId: number) => void;
  approveAndCreatePayment: (claimId: number) => { claim: Claim; payment: Payment; txLog: string[] };
  rejectClaim: (claimId: number, reason: string) => void;
  completePayment: (paymentId: number) => { payment: Payment; claim: Claim; txLog: string[] };
  deleteClaim: (id: number) => void;
  updateFraudStatus: (claimId: number, status: FraudInvestigationStatus, notes?: string) => void;
  runDeepFraudScan: (claimId: number) => FraudAssessment;
  resetDatabase: () => void;

  // Toast System
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(() => db.getCustomers());
  const [policies, setPolicies] = useState<Policy[]>(() => db.getPolicies());
  const [claims, setClaims] = useState<Claim[]>(() => db.getClaims());
  const [payments, setPayments] = useState<Payment[]>(() => db.getPayments());
  const [admins, setAdmins] = useState<Admin[]>(() => db.getAdmins());
  const [auditLog, setAuditLog] = useState<TransactionAuditEntry[]>(() => db.getAuditLog());
  const [detailedClaims, setDetailedClaims] = useState<ClaimDetailedView[]>(() => db.getDetailedClaims());
  const [categoryAnalytics, setCategoryAnalytics] = useState<CategoryAnalytics[]>(() => db.getCategoryAnalytics());

  // Active Admin
  const [activeAdmin, setActiveAdmin] = useState<Admin>(() => db.getAdmins()[0]);
  const [currentRole, setRole] = useState<'admin' | 'customer'>('admin');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(101);

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('claimvault_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('claimvault_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('claimvault_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Global search & section
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');

  // Modal triggers
  const [isRegisterCustomerOpen, setIsRegisterCustomerOpen] = useState(false);
  const [isIssuePolicyOpen, setIsIssuePolicyOpen] = useState(false);
  const [isFileClaimOpen, setIsFileClaimOpen] = useState(false);
  const [selectedClaimForDetail, setSelectedClaimForDetail] = useState<ClaimDetailedView | null>(null);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<{ payment: Payment; claim: ClaimDetailedView } | null>(null);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Auth state (placed after all state declarations so setters are available) ─
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const loginAsAdmin = useCallback((email: string): boolean => {
    const admin = db.getAdmins().find(a => a.Email.toLowerCase() === email.toLowerCase());
    if (admin) {
      setActiveAdmin(admin);
      setRole('admin');
      setActiveSection('dashboard');
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  const loginAsCustomer = useCallback((_email: string, customerId: number): boolean => {
    const cust = db.getCustomers().find(c => c.Customer_ID === customerId);
    if (cust) {
      setSelectedCustomerId(customerId);
      setRole('customer');
      setActiveSection('dashboard');
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setRole('admin');
    setActiveSection('dashboard');
  }, []);

  // Sync state from DBMS Engine
  const refreshState = useCallback(() => {
    setCustomers(db.getCustomers());
    setPolicies(db.getPolicies());
    setClaims(db.getClaims());
    setPayments(db.getPayments());
    setAdmins(db.getAdmins());
    setAuditLog(db.getAuditLog());
    setDetailedClaims(db.getDetailedClaims());
    setCategoryAnalytics(db.getCategoryAnalytics());
  }, []);

  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      refreshState();
    });
    return unsubscribe;
  }, [refreshState]);

  const activeCustomer = customers.find((c) => c.Customer_ID === selectedCustomerId) || customers[0];

  // Actions
  const addCustomerHandler = (cust: Omit<Customer, 'Customer_ID'> & { Customer_ID?: number }) => {
    try {
      const created = db.addCustomer(cust);
      addToast('Customer Created', `Customer #${created.Customer_ID} (${created.Name}) successfully added to 3NF schema.`, 'success');
      return created;
    } catch (err: any) {
      addToast('Constraint Violation', err.message, 'error');
      throw err;
    }
  };

  const updateCustomerHandler = (id: number, updates: Partial<Omit<Customer, 'Customer_ID'>>) => {
    try {
      const updated = db.updateCustomer(id, updates);
      addToast('Customer Updated', `Customer #${id} (${updated.Name}) profile updated.`, 'success');
      return updated;
    } catch (err: any) {
      addToast('Update Failed', err.message, 'error');
      throw err;
    }
  };

  const deleteCustomerHandler = (id: number) => {
    try {
      db.deleteCustomer(id);
      addToast('Customer Deleted', `Customer #${id} removed from schema.`, 'info');
    } catch (err: any) {
      addToast('Referential Integrity Block', err.message, 'error');
      throw err;
    }
  };

  const addPolicyHandler = (pol: Omit<Policy, 'Policy_ID'> & { Policy_ID?: number }) => {
    try {
      const created = db.addPolicy(pol);
      addToast('Policy Issued', `Policy #${created.Policy_ID} (${created.Policy_Type}) bound to Customer #${created.Customer_ID}.`, 'success');
      return created;
    } catch (err: any) {
      addToast('Foreign Key / Check Error', err.message, 'error');
      throw err;
    }
  };

  const deletePolicyHandler = (id: number) => {
    try {
      db.deletePolicy(id);
      addToast('Policy Deleted', `Policy #${id} removed from database.`, 'info');
    } catch (err: any) {
      addToast('Referential Integrity Block', err.message, 'error');
      throw err;
    }
  };

  const fileClaimHandler = async (data: { policyId: number; amount: number; date: string; description: string; supportingDocName?: string }) => {
    try {
      const newClaim = db.addClaim({
        Policy_ID: data.policyId,
        Claim_Amount: data.amount,
        Claim_Date: data.date,
        Description: data.description,
        Supporting_Doc_Name: data.supportingDocName || 'Claim_Supporting_Document.pdf',
      });

      addToast(
        'Claim Filed Successfully',
        `Claim #${newClaim.Claim_ID} for ₹${data.amount.toLocaleString()} is now Pending Review. (FK validated: Policy #${data.policyId})`,
        'success'
      );
      return newClaim;
    } catch (err: any) {
      addToast('Referential / Integrity Error', err.message, 'error');
      throw err;
    }
  };

  const startVerificationHandler = (claimId: number) => {
    try {
      db.startVerification(claimId);
      addToast('Claim Under Verification', `Claim #${claimId} moved to verification stage by ${activeAdmin.Name}.`, 'info');
      if (selectedClaimForDetail && selectedClaimForDetail.Claim_ID === claimId) {
        const updated = db.getDetailedClaims().find((c) => c.Claim_ID === claimId);
        if (updated) setSelectedClaimForDetail(updated);
      }
    } catch (err: any) {
      addToast('Verification Error', err.message, 'error');
    }
  };

  const approveAndCreatePaymentHandler = (claimId: number) => {
    try {
      const result = db.approveAndCreatePayment(claimId);
      addToast(
        'Claim Approved & Payment Generated (ACID)',
        `Claim #${claimId} Approved! Payout Voucher #${result.payment.Payment_ID} created in 'Processing' status (₹${result.payment.Amount.toLocaleString()}).`,
        'success'
      );
      if (selectedClaimForDetail && selectedClaimForDetail.Claim_ID === claimId) {
        const updated = db.getDetailedClaims().find((c) => c.Claim_ID === claimId);
        if (updated) setSelectedClaimForDetail(updated);
      }
      return result;
    } catch (err: any) {
      addToast('Approval Error', err.message, 'error');
      throw err;
    }
  };

  const rejectClaimHandler = (claimId: number, reason: string) => {
    try {
      db.rejectClaim(claimId, reason);
      addToast('Claim Rejected', `Claim #${claimId} marked as Rejected. Note logged in audit.`, 'warning');
      if (selectedClaimForDetail && selectedClaimForDetail.Claim_ID === claimId) {
        const updated = db.getDetailedClaims().find((c) => c.Claim_ID === claimId);
        if (updated) setSelectedClaimForDetail(updated);
      }
    } catch (err: any) {
      addToast('Rejection Error', err.message, 'error');
    }
  };

  const completePaymentHandler = (paymentId: number) => {
    try {
      const result = db.completePayment(paymentId);
      addToast(
        'Payment Settled & Claim Paid (ACID)',
        `Disbursed ₹${result.payment.Amount.toLocaleString()} via ${result.payment.Transaction_Ref}. Claim #${result.claim.Claim_ID} atomically updated to 'Paid'.`,
        'success'
      );
      if (selectedClaimForDetail && selectedClaimForDetail.Claim_ID === result.claim.Claim_ID) {
        const updated = db.getDetailedClaims().find((c) => c.Claim_ID === result.claim.Claim_ID);
        if (updated) setSelectedClaimForDetail(updated);
      }
      return result;
    } catch (err: any) {
      addToast('Settlement Error', err.message, 'error');
      throw err;
    }
  };

  const deleteClaimHandler = (id: number) => {
    try {
      db.deleteClaim(id);
      addToast('Claim Deleted', `Claim #${id} removed from schema.`, 'info');
    } catch (err: any) {
      addToast('Referential Integrity Block', err.message, 'error');
      throw err;
    }
  };

  const updateFraudStatusHandler = (claimId: number, status: FraudInvestigationStatus, notes?: string) => {
    try {
      db.updateFraudAssessmentStatus(claimId, status, notes);
      addToast('Fraud Assessment Updated', `Claim #${claimId} fraud status set to '${status}'.`, 'info');
      if (selectedClaimForDetail && selectedClaimForDetail.Claim_ID === claimId) {
        const updated = db.getDetailedClaims().find((c) => c.Claim_ID === claimId);
        if (updated) setSelectedClaimForDetail(updated);
      }
    } catch (err: any) {
      addToast('Fraud Assessment Error', err.message, 'error');
    }
  };

  const runDeepFraudScanHandler = (claimId: number) => {
    try {
      const assessment = db.runDeepFraudScan(claimId);
      addToast(
        'AI Fraud Scan Complete',
        `Evaluated Claim #${claimId}: Risk Score ${assessment.Risk_Score}/100 (${assessment.Risk_Level} Risk).`,
        assessment.Risk_Level === 'Critical' || assessment.Risk_Level === 'High' ? 'warning' : 'success'
      );
      if (selectedClaimForDetail && selectedClaimForDetail.Claim_ID === claimId) {
        const updated = db.getDetailedClaims().find((c) => c.Claim_ID === claimId);
        if (updated) setSelectedClaimForDetail(updated);
      }
      return assessment;
    } catch (err: any) {
      addToast('Fraud Scan Error', err.message, 'error');
      throw err;
    }
  };

  const resetDatabase = () => {
    db.resetToSeedData();
    addToast('Database Reset', 'All tables reset to initial course seed records (3 customers, 3 policies, 5 claims, 2 payments).', 'info');
  };

  return (
    <DatabaseContext.Provider
      value={{
        customers,
        policies,
        claims,
        payments,
        admins,
        auditLog,
        detailedClaims,
        categoryAnalytics,
        isLoggedIn,
        loginAsAdmin,
        loginAsCustomer,
        logout,
        activeAdmin,
        setActiveAdmin,
        currentRole,
        setRole,
        selectedCustomerId,
        setSelectedCustomerId,
        activeCustomer,
        isDarkMode,
        toggleDarkMode,
        globalSearchQuery,
        setGlobalSearchQuery,
        activeSection,
        setActiveSection,
        isRegisterCustomerOpen,
        setIsRegisterCustomerOpen,
        isIssuePolicyOpen,
        setIsIssuePolicyOpen,
        isFileClaimOpen,
        setIsFileClaimOpen,
        selectedClaimForDetail,
        setSelectedClaimForDetail,
        selectedReceiptPayment,
        setSelectedReceiptPayment,
        addCustomer: addCustomerHandler,
        updateCustomer: updateCustomerHandler,
        deleteCustomer: deleteCustomerHandler,
        addPolicy: addPolicyHandler,
        deletePolicy: deletePolicyHandler,
        fileClaim: fileClaimHandler,
        startVerification: startVerificationHandler,
        approveAndCreatePayment: approveAndCreatePaymentHandler,
        rejectClaim: rejectClaimHandler,
        completePayment: completePaymentHandler,
        deleteClaim: deleteClaimHandler,
        updateFraudStatus: updateFraudStatusHandler,
        runDeepFraudScan: runDeepFraudScanHandler,
        resetDatabase,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
