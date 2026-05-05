import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Servico } from '../types';
import { 
  BarChart3, 
  Droplet, 
  Map as MapIcon, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  Leaf,
  Target,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

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
    const servicosRef = collection(db, 'servicos');
    let q;
    
    if (isAdmin || profile?.role === 'CHEFE') {
      q = query(servicosRef, orderBy('dataServico', 'desc'), limit(5));
    } else {
      q = query(
        servicosRef, 
        where('operadoresIds', 'array-contains', profile?.uid), 
        orderBy('dataServico', 'desc'), 
        limit(5)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Servico[];
      setServicos(data);
      setLoading(false);
    });

    if (isAdmin || profile?.role === 'CHEFE') {
      getDocs(collection(db, 'servicos')).then(snapshot => {
        const allServicos = snapshot.docs.map(doc => doc.data() as Servico);
        const totalHectares = allServicos.reduce((acc, s) => acc + (s.areaHectares || 0), 0);
        const totalFaturado = allServicos.reduce((acc, s) => acc + (s.valorTotal || 0), 0);
        const totalServicos = allServicos.length;
        
        setStats({
          totalHectares,
          totalFaturado,
          lucroEstimado: totalFaturado * 0.4,
          totalServicos
        });
      });
    }

    return unsubscribe;
  }, [profile, isAdmin]);

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex flex-col justify-between min-h-[160px] p-7 group hover:border-primary-500/30 transition-all cursor-default"
    >
      <div className="flex justify-between items-start">
        <div className={`${color} p-3 rounded-2xl text-white shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
           <div className="flex items-center gap-1 text-green-600 text-xs font-black bg-green-50 px-2 py-1 rounded-full">
            <ArrowUpRight className="w-3 h-3" /> {trend}
           </div>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-black mb-1">{value}</h3>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-10">
      {/* Hero Stats */}
      {(isAdmin || profile?.role === 'CHEFE') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Área Total Pulverizada" 
            value={`${stats.totalHectares.toFixed(1)} ha`} 
            color="bg-primary-700" 
            icon={MapIcon}
            trend="12%"
          />
          <StatCard 
            title="Receita Operacional" 
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.totalFaturado)} 
            color="bg-black" 
            icon={DollarSign}
            trend="8%"
          />
          <StatCard 
            title="Ordens de Serviço" 
            value={stats.totalServicos} 
            color="bg-primary-600" 
            icon={Target}
          />
          <StatCard 
            title="Resultado Estimado" 
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.lucroEstimado)} 
            color="bg-emerald-700" 
            icon={BarChart3}
            trend="5%"
          />
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
               <Clock className="w-6 h-6 text-primary-700" /> Atividades Recentes
            </h2>
            <Link to="/servicos" className="text-primary-700 font-black text-sm hover:underline">Ver Histórico</Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-3xl animate-pulse" />)}
              </div>
            ) : servicos.length > 0 ? (
              servicos.map((s) => (
                <motion.div 
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card p-0 overflow-hidden group hover:shadow-xl transition-all border-none bg-white"
                >
                  <div className="flex">
                    <div className="w-2 bg-primary-700" />
                    <div className="flex-1 p-6 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-gray-50 flex items-center justify-center rounded-2xl text-gray-400 group-hover:text-primary-700 group-hover:bg-primary-50 transition-colors">
                           <Droplet className="w-6 h-6" />
                         </div>
                         <div>
                           <h4 className="font-black text-lg leading-tight">{s.clienteNome}</h4>
                           <div className="flex items-center gap-3 mt-1 underline-offset-4">
                              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{s.cultura}</span>
                              <span className="w-1 h-1 bg-gray-200 rounded-full" />
                              <span className="text-[10px] font-black uppercase text-primary-700 tracking-widest">{s.areaHectares} ha</span>
                           </div>
                         </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xl font-black text-black">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.valorTotal)}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mt-1">
                          Ref: #{s.id?.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="card py-20 text-center border-dashed border-2">
                <Target className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">Nenhuma atividade registrada.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight mb-6">Ações Rápidas</h2>
            <div className="grid grid-cols-1 gap-4">
              <Link to="/novo-servico" className="btn-primary w-full h-18 text-lg font-black bg-primary-700 shadow-xl shadow-primary-950/20">
                <Leaf className="w-6 h-6" /> Novo Atendimento
              </Link>
              <Link to="/clientes" className="bg-black hover:bg-gray-900 text-white font-black text-lg h-18 px-6 rounded-2xl flex items-center gap-4 transition-all shadow-lg transform hover:-translate-y-1">
                <Users className="w-6 h-6" /> Gestão de Clientes
              </Link>
              <Link to="/financeiro" className="bg-white border-2 border-gray-100 hover:border-primary-100 text-black font-black text-lg h-18 px-6 rounded-2xl flex items-center gap-4 transition-all shadow-sm">
                <DollarSign className="w-6 h-6 text-primary-700" /> Fluxo Financeiro
              </Link>
            </div>
          </div>

          <div className="bg-[#0a1a0f] rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
             <div className="relative z-10 space-y-4">
                <div className="bg-primary-600 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter">Pronto para o Campo?</h3>
                <p className="text-primary-400 text-sm font-medium leading-relaxed">
                  Lembre-se de sincronizar o cache do mapa antes de iniciar operações em áreas sem cobertura de rede.
                </p>
                <div className="h-1 w-20 bg-primary-600 rounded-full mt-6" />
             </div>
             {/* Abstract Drone Shape */}
             <div className="absolute -bottom-10 -right-10 opacity-10">
               <Leaf className="w-60 h-60" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
