import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../firebase';
import { 
  Leaf, 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Menu, 
  X, 
  LogOut, 
  Settings, 
  Droplet,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import InstallBanner from './InstallBanner';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['DONO', 'CHEFE', 'OPERADOR'] },
    { name: 'Novo Serviço', icon: PlusCircle, path: '/servicos/novo', roles: ['DONO', 'CHEFE'] },
    { name: 'Serviços', icon: Droplet, path: '/servicos', roles: ['DONO', 'CHEFE', 'OPERADOR'] },
    { name: 'Clientes', icon: Users, path: '/clientes', roles: ['DONO', 'CHEFE'] },
    { name: 'Financeiro', icon: DollarSign, path: '/financeiro', roles: ['DONO'] },
    { name: 'Configurações', icon: Settings, path: '/configuracoes', roles: ['DONO', 'CHEFE', 'OPERADOR'] },
  ];

  const filteredNavItems = navItems.filter(item => profile && item.roles.includes(profile.role));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-black text-white p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-primary-600 p-2 rounded-xl">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter">ROSSIAGRO</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                location.pathname === item.path 
                  ? 'bg-primary-700 text-white shadow-lg shadow-primary-900/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 p-2">
            <div className="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center font-black text-primary-200">
              {profile?.displayName?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold truncate">{profile?.displayName}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{profile?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Topbar - Mobile */}
        <header className="lg:hidden bg-white border-b border-gray-100 p-4 sticky top-0 z-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary-700" />
            <h1 className="text-xl font-black tracking-tighter">ROSSIAGRO</h1>
          </div>
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 bg-gray-50 rounded-xl"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
        
        <InstallBanner />
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white z-[70] p-6 lg:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Leaf className="w-8 h-8 text-primary-700" />
                  <h1 className="text-2xl font-black tracking-tighter">ROSSIAGRO</h1>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-50 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-2">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-xl font-black text-lg transition-all ${
                      location.pathname === item.path 
                        ? 'bg-primary-700 text-white' 
                        : 'text-gray-500 hover:text-black hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="absolute bottom-8 left-6 right-6 pt-6 border-t border-gray-100">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-4 w-full rounded-xl font-black text-xl text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-6 h-6" />
                  Sair da Conta
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
