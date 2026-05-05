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
  DollarSign,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import InstallBanner from './InstallBanner';
import BottomNav from './BottomNav';

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
    { name: 'Novo Serviço', icon: PlusCircle, path: '/novo-servico', roles: ['DONO', 'CHEFE'] },
    { name: 'Serviços', icon: Droplet, path: '/servicos', roles: ['DONO', 'CHEFE', 'OPERADOR'] },
    { name: 'Clientes', icon: Users, path: '/clientes', roles: ['DONO', 'CHEFE'] },
    { name: 'Financeiro', icon: DollarSign, path: '/financeiro', roles: ['DONO'] },
    { name: 'Configurações', icon: '/configuracoes', roles: ['DONO', 'CHEFE', 'OPERADOR'], isPlaceholder: true },
  ];

  const filteredNavItems = navItems.filter(item => profile && item.roles.includes(profile.role));

  const pageTitle = navItems.find(n => n.path === location.pathname)?.name || 'ROSSIAGRO';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#0a1a0f] text-white p-6 sticky top-0 h-screen shrink-0">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-primary-600 p-2.5 rounded-2xl shadow-lg shadow-primary-900/20">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">ROSSIAGRO</h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-500 mt-1">Sistemas Agrícolas</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.isPlaceholder ? '#' : item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all relative group ${
                location.pathname === item.path 
                  ? 'bg-primary-700 text-white shadow-xl shadow-primary-950/40' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-white' : 'text-primary-800'}`} />
              {item.name}
              {location.pathname === item.path && (
                <motion.div layoutId="activeNav" className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="bg-white/5 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-primary-800 flex items-center justify-center font-black text-white text-sm">
                {profile?.displayName?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold truncate text-sm">{profile?.displayName}</p>
                <p className="text-[10px] text-primary-500 font-black uppercase tracking-widest">{profile?.role}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3.5 w-full rounded-2xl font-bold text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col pb-24 lg:pb-0">
        {/* Topbar - Mobile & Header Info */}
        <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-40 flex items-center justify-between lg:px-8 lg:py-6 lg:bg-transparent lg:border-none">
          <div className="flex items-center gap-3">
            <div className="lg:hidden bg-primary-600 p-1.5 rounded-xl">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl lg:text-3xl font-black tracking-tighter text-black">
              {pageTitle === 'ROSSIAGRO' ? (
                <>
                  <span className="lg:hidden">ROSSIAGRO</span>
                  <span className="hidden lg:inline text-gray-400 font-medium">Dashboard</span>
                </>
              ) : pageTitle}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">Operação Ativa</span>
            </div>
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 bg-gray-50 rounded-xl"
            >
              <Menu className="w-6 h-6 text-black" />
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 lg:p-12 max-w-[1400px]">
          {children}
        </div>
        
        <InstallBanner />
        <BottomNav />
      </main>

      {/* Mobile Sidebar Overlay */}
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
              className="fixed right-0 top-0 bottom-0 w-80 bg-white z-[70] p-6 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-700 p-2 rounded-xl">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-black tracking-tighter">ROSSIAGRO</h1>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-50 rounded-xl">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-1.5 flex-1 overflow-y-auto pr-2">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.isPlaceholder ? '#' : item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-lg transition-all ${
                      location.pathname === item.path 
                        ? 'bg-primary-700 text-white shadow-lg' 
                        : 'text-gray-500 hover:text-black hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`w-6 h-6 ${location.pathname === item.path ? 'text-white' : 'text-primary-700'}`} />
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-4">
                   <div className="w-12 h-12 rounded-full bg-primary-700 flex items-center justify-center font-black text-white text-lg">
                    {profile?.displayName?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-black text-black leading-none">{profile?.displayName}</p>
                    <p className="text-[10px] text-primary-700 font-bold uppercase tracking-widest mt-1">{profile?.role}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-4 px-5 py-5 w-full rounded-2xl font-black text-xl text-red-600 hover:bg-red-50 transition-all group"
                >
                  <LogOut className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                  Sair do Aplicativo
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
