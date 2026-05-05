import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Servico } from '../types';
import { 
  BarChart3, 
  Droplet, 
  Map as MapIcon, 
  History, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  Leaf
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { profile, isAdmin } = useAuth();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHectares: 0,
    totalFaturado: 0,
    lucroEstimado: 0,
    totalServicos: 0
  });

  useEffect(() => {
    // If not admin/boss, only show their services
    const servicosRef = collection(db, 'servicos');
    let q;
    
    if (isAdmin || profile?.role === 'CHEFE') {
      q = query(servicosRef, orderBy('createdAt', 'desc'), limit(5));
    } else {
      q = query(
        servicosRef, 
        where('operadoresIds', 'array-contains', profile?.uid), 
        orderBy('createdAt', 'desc'), 
        limit(5)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Servico[];
      setServicos(data);
      setLoading(false);
    });

    // Stats (only for admin/boss)
    if (isAdmin || profile?.role === 'CHEFE') {
      getDocs(collection(db, 'servicos')).then(snapshot => {
        const allServicos = snapshot.docs.map(doc => doc.data() as Servico);
        const totalHectares = allServicos.reduce((acc, s) => acc + (s.areaHectares || 0), 0);
        const totalFaturado = allServicos.reduce((acc, s) => acc + (s.valorTotal || 0), 0);
        const totalServicos = allServicos.length;
        
        setStats({
          totalHectares,
          totalFaturado,
          lucroEstimado: totalFaturado * 0.4, // Estimation
          totalServicos
        });
      });
    }

    return unsubscribe;
  }, [profile, isAdmin]);

  const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card flex items-center gap-4"
    >
      <div className={`${color} p-4 rounded-2xl`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black">{value}</h3>
        {subValue && <p className="text-xs text-gray-400 font-medium">{subValue}</p>}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Olá, {profile?.displayName}!</h1>
          <p className="text-gray-500 font-medium">Benvindo ao painel ROSSIAGRO.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-full border border-gray-100 flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Sistema Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      {(isAdmin || profile?.role === 'CHEFE') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Hectares" 
            value={`${stats.totalHectares.toFixed(1)} ha`} 
            color="bg-primary-600" 
            icon={MapIcon}
            subValue="Área total pulverizada"
          />
          <StatCard 
            title="Faturamento" 
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalFaturado)} 
            color="bg-black" 
            icon={DollarSign}
            subValue="Receita bruta total"
          />
          <StatCard 
            title="Serviços" 
            value={stats.totalServicos} 
            color="bg-blue-600" 
            icon={CheckCircle2}
            subValue="Ordens finalizadas"
          />
          <StatCard 
            title="Lucro Est." 
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.lucroEstimado)} 
            color="bg-emerald-600" 
            icon={BarChart3}
            subValue="40% sobre faturamento"
          />
        </div>
      )}

      {/* Recents and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight">Serviços Recentes</h2>
            <button className="text-primary-700 font-bold flex items-center gap-1 hover:gap-2 transition-all">
              Ver todos <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl w-full"></div>)}
              </div>
            ) : servicos.length > 0 ? (
              servicos.map((s) => (
                <motion.div 
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card group hover:border-primary-200 transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 group-hover:bg-primary-50 p-3 rounded-xl transition-colors">
                      <Droplet className="w-6 h-6 text-gray-500 group-hover:text-primary-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{s.clienteNome}</h4>
                      <p className="text-sm text-gray-400 font-medium">{s.cultura} • {s.areaHectares} ha</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                      s.status === 'CONCLUIDO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {s.status}
                    </span>
                    <p className="text-lg font-black mt-1">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.valorTotal)}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="card text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-bold">Nenhum serviço registrado ainda.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black tracking-tight">Ações Rápidas</h2>
          <div className="grid grid-cols-1 gap-4">
            <button className="btn-primary w-full h-16 justify-start px-6 font-black text-lg">
              <Droplet className="w-6 h-6" /> Novo Serviço
            </button>
            <button className="bg-black hover:bg-gray-900 text-white font-black text-lg h-16 px-6 rounded-xl flex items-center gap-3 transition-colors">
              <Users className="w-6 h-6" /> Clientes
            </button>
            <button className="bg-white border-2 border-gray-100 hover:border-gray-200 text-black font-black text-lg h-16 px-6 rounded-xl flex items-center gap-3 transition-colors">
              <MapIcon className="w-6 h-6" /> Mapa de Áreas
            </button>
          </div>

          <div className="bg-primary-950 rounded-3xl p-6 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-bold text-xl mb-1">Dica Pro</h3>
              <p className="text-primary-200 text-sm font-medium">
                Sincronize seus dados antes de sair para o campo para garantir acesso offline completo.
              </p>
            </div>
            <Leaf className="absolute -bottom-8 -right-8 w-32 h-32 text-primary-900 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
