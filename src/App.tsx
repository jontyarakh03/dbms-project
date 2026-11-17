import React, { useState } from 'react';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { CustomerManagementView } from './components/customers/CustomerManagementView';
import { PolicyManagementView } from './components/policies/PolicyManagementView';
import { ClaimsManagementView } from './components/claims/ClaimsManagementView';
import { PaymentManagementView } from './components/payments/PaymentManagementView';
import { ReportsAnalyticsView } from './components/reports/ReportsAnalyticsView';
import { FraudDetectionView } from './components/fraud/FraudDetectionView';
import { RegisterCustomerModal } from './components/modals/RegisterCustomerModal';
import { IssuePolicyModal } from './components/modals/IssuePolicyModal';
import { FileClaimModal } from './components/modals/FileClaimModal';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginPage } from './components/auth/LoginPage';
import { CustomerPortal } from './components/auth/CustomerPortal';
import { Shield } from 'lucide-react';

// ── Admin layout (full access) ───────────────────────────────────────────────
const AdminContent: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { activeSection, isDarkMode } = useDatabase();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F9FC] dark:bg-[#071630] text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-[#15529E] selection:text-white transition-colors duration-200">
      {/* Persistent Collapsible Left Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onLogout={onLogout}
        />

        {/* Dynamic Page */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeSection === 'dashboard' && <DashboardView />}
          {activeSection === 'customers' && <CustomerManagementView />}
          {activeSection === 'policies'  && <PolicyManagementView />}
          {activeSection === 'claims'    && <ClaimsManagementView />}
          {activeSection === 'payments'  && <PaymentManagementView />}
          {activeSection === 'fraud'     && <FraudDetectionView />}
          {activeSection === 'reports'   && <ReportsAnalyticsView />}
        </main>

        {/* Footer */}
        <footer className="mt-auto py-5 px-6 border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#0B2559] text-teal-300 flex items-center justify-center font-bold text-[10px]">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">ClaimVault</span>
              <span>— Insurance Claim Management System</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">System Online</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Modals */}
      <RegisterCustomerModal />
      <IssuePolicyModal />
      <FileClaimModal />

      {/* Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

// ── App shell with auth gating ────────────────────────────────────────────────
const AppContent: React.FC = () => {
  const { isLoggedIn, currentRole, loginAsAdmin, loginAsCustomer, logout, isDarkMode } = useDatabase();

  // Apply dark mode class to root
  React.useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  if (!isLoggedIn) {
    return (
      <LoginPage
        onAdminLogin={loginAsAdmin}
        onCustomerLogin={loginAsCustomer}
      />
    );
  }

  if (currentRole === 'customer') {
    return (
      <>
        <CustomerPortal onLogout={logout} />
        <FileClaimModal />
        <ToastContainer />
      </>
    );
  }

  // Admin
  return <AdminContent onLogout={logout} />;
};

export const App: React.FC = () => {
  return (
    <DatabaseProvider>
      <AppContent />
    </DatabaseProvider>
  );
};

export default App;
