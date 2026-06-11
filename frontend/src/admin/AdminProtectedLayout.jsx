import { Outlet, Navigate } from 'react-router-dom';
import { useAdminAuth } from './AuthContext';
import { useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';

export default function AdminProtectedLayout() {
  const { admin, loading, logout, isServerWaking, connectionError, verify } = useAdminAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="max-w-md w-full rounded-[32px] border border-slate-200 bg-white px-8 py-10 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center text-amber-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Connection Error</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {connectionError}
          </p>
          <div className="space-y-3 pt-2">
            <button
              onClick={verify}
              className="w-full py-3 px-5 rounded-3xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold transition"
            >
              Retry Connection
            </button>
            <button
              onClick={() => logout(true)}
              className="w-full py-3 px-5 rounded-3xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="rounded-[32px] border border-slate-200/80 bg-white px-8 py-10 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white mx-auto"></div>
          <p className="text-slate-900 dark:text-slate-100 font-medium">
            {isServerWaking 
              ? 'Waking up server (Render free tier cold start may take 30-50s)...' 
              : 'Verifying admin session...'}
          </p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={logout} />
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <AdminTopbar onMenuClick={() => setSidebarOpen((current) => !current)} onLogout={logout} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
