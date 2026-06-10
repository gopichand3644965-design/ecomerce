import { FiMenu, FiLogOut } from 'react-icons/fi';
import { useAdminAuth } from '../AuthContext';

export default function AdminTopbar({ onMenuClick = () => {}, onLogout = () => {} }) {
  const { admin } = useAdminAuth();

  return (
    <header className="flex flex-col gap-3 px-4 py-4 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:bg-slate-950/95 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          <FiMenu size={20} />
        </button>
        <div className="text-lg font-semibold text-slate-900 dark:text-white">Product Management</div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="hidden sm:flex items-center gap-3 rounded-3xl border border-slate-200/80 bg-white px-4 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white">
            {admin?.name?.slice(0, 1) || 'A'}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{admin?.name || 'Admin'}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Product Manager</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex h-11 items-center gap-2 rounded-3xl border border-slate-200/80 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <FiLogOut size={18} />
          Sign out
        </button>
      </div>
    </header>
  );
}
