import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, CreditCard, Settings, LogOut, Receipt, ChevronRight,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Usuários', icon: Users },
  { path: '/plans', label: 'Planos', icon: CreditCard },
  { path: '/payments', label: 'Pagamentos', icon: Receipt },
  { path: '/config', label: 'Configurações', icon: Settings },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-primary-500">Finanças Admin</h1>
          <p className="text-sm text-gray-500 mt-1">{user?.name}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
