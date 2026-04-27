import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/admin',             icon: '📊', label: 'Dashboard',         exact: true },
  { to: '/admin/dresses',     icon: '👗', label: 'Dresses',           exact: false },
  { to: '/admin/bulk-avail',  icon: '📦', label: 'Bulk Availability', exact: false },
];

export default function AdminLayout() {
  const { username, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const isActive = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose/20 border border-rose/30 flex items-center justify-center text-lg">
            👗
          </div>
          <div>
            <p className="text-white font-bold text-sm">Dressy Admin</p>
            <p className="text-white/40 text-xs">Dress Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV.map(item => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                        transition-all duration-200 group ${
              isActive(item.to, item.exact)
                ? 'bg-rose text-white shadow-lg shadow-rose/30'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-2">
          <div className="w-8 h-8 rounded-full bg-rose/30 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {username?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{username}</p>
            <p className="text-white/40 text-xs">Employee</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold
                     text-white/60 hover:text-white hover:bg-red-500/20 transition-all duration-200"
        >
          <span>🚪</span>
          {loggingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-60 flex-col bg-gradient-to-b from-ink to-ink-soft shrink-0 fixed inset-y-0 start-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 start-0 w-60 bg-gradient-to-b from-ink to-ink-soft z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ms-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            ☰
          </button>
          <div className="flex-1">
            <h1 className="text-gray-800 font-semibold text-sm">
              {NAV.find(n => isActive(n.to, n.exact))?.label ?? 'Admin'}
            </h1>
          </div>
          <Link
            to="/"
            target="_blank"
            className="text-xs text-rose hover:text-rose-dark font-semibold flex items-center gap-1 transition-colors"
          >
            View Shop ↗
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
