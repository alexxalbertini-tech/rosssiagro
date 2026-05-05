import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Droplet, PlusCircle, Users, DollarSign } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { name: 'Home', icon: LayoutDashboard, path: '/' },
    { name: 'Serviços', icon: Droplet, path: '/servicos' },
    { name: 'Novo', icon: PlusCircle, path: '/novo-servico', highlight: true },
    { name: 'Clientes', icon: Users, path: '/clientes' },
    { name: 'Financeiro', icon: DollarSign, path: '/financeiro' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex items-center justify-around px-2 pb-safe-offset-2 h-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `
            flex flex-col items-center justify-center gap-1 transition-all duration-200
            ${item.highlight ? 'relative -top-4' : ''}
            ${isActive ? 'text-primary-700' : 'text-gray-400'}
          `}
        >
          {item.highlight ? (
            <div className="bg-primary-700 p-4 rounded-full shadow-lg shadow-primary-700/40 text-white">
              <item.icon className="w-6 h-6" />
            </div>
          ) : (
            <>
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
