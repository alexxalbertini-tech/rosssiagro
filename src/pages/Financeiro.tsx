import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Servico } from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Table as TableIcon,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Financeiro() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [stats, setStats] = useState({
    receitaBruta: 0,
    custosEstimados: 0,
    comissoesPagar: 0,
    lucroLiquido: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'servicos'), orderBy('dataServico', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Servico[];
      setServicos(data);

      const faturamento = data.reduce((acc, s) => acc + (s.valorTotal || 0), 0);
      const comissoes = data.reduce((acc, s) => acc + (s.comissaoTotal || 0), 0);
      const custos = faturamento * 0.3; // Estimativa de 30% de custos operacionais

      setStats({
        receitaBruta: faturamento,
        custosEstimados: custos,
        comissoesPagar: comissoes,
        lucroLiquido: faturamento - custos - comissoes
      });
    });
    return unsubscribe;
  }, []);

  const formatBRL = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8">
      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card bg-black text-white border-0">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-primary-700/20 p-2.5 rounded-xl">
              <DollarSign className="w-6 h-6 text-primary-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">Mês Atual</span>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Receita Bruta</p>
          <h3 className="text-2xl font-black">{formatBRL(stats.receitaBruta)}</h3>
          <div className="mt-4 flex items-center gap-1 text-green-400 text-xs font-bold">
            <ArrowUpRight className="w-3 h-3" /> +12.5% em relação ao mês anterior
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-red-50 p-2.5 rounded-xl">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Custos Operacionais</p>
          <h3 className="text-2xl font-black text-black">{formatBRL(stats.custosEstimados)}</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">Inclui balsa, diesel e manutenção (est.)</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-2.5 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Comissões Pagas</p>
          <h3 className="text-2xl font-black text-black">{formatBRL(stats.comissoesPagar)}</h3>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-2">10% Sobre Volume</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card bg-primary-700 text-white border-0">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <PieChart className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-primary-200 text-xs font-bold uppercase tracking-wider mb-1">Lucro Líquido</p>
          <h3 className="text-2xl font-black">{formatBRL(stats.lucroLiquido)}</h3>
          <div className="mt-4 bg-white/10 px-3 py-1.5 rounded-lg inline-block text-[10px] font-black uppercase tracking-widest">
            Altíssimo Desempenho
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Transaction Table */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <TableIcon className="w-6 h-6 text-primary-700" /> Histórico Financeiro
            </h2>
            <button className="flex items-center gap-2 text-primary-700 font-black text-sm">
               <Filter className="w-4 h-4" /> Filtrar Por Data
            </button>
          </div>

          <div className="space-y-3">
            {servicos.map((s) => (
              <div key={s.id} className="card p-5 hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-4">
                   <div className="bg-white border border-gray-100 p-3 rounded-2xl group-hover:border-primary-100 transition-colors shadow-sm">
                      <Calendar className="w-6 h-6 text-gray-400 group-hover:text-primary-700" />
                   </div>
                   <div>
                     <h4 className="font-black text-black leading-tight">{s.clienteNome}</h4>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Ref: #{s.id?.slice(-4)} • {s.cultura}</p>
                   </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-black text-black">{formatBRL(s.valorTotal)}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full mt-1">
                    Pago
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Summary */}
        <div className="w-full lg:w-80 space-y-6">
           <h2 className="text-2x font-black tracking-tight">DRE Resumido</h2>
           <div className="card space-y-5 bg-[#0a1a0f] text-white border-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">Receita</span>
                  <span className="font-black">{formatBRL(stats.receitaBruta)}</span>
                </div>
                 <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">Custos Prod.</span>
                  <span className="font-black text-red-500">-{formatBRL(stats.custosEstimados)}</span>
                </div>
                 <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">Comissões</span>
                  <span className="font-black text-red-500">-{formatBRL(stats.comissoesPagar)}</span>
                </div>
              </div>
              <div className="pt-5 border-t border-white/10 flex justify-between items-center">
                <span className="font-black text-lg text-primary-500 italic">EBITDA</span>
                <span className="text-2xl font-black">{formatBRL(stats.lucroLiquido)}</span>
              </div>
              <div className="bg-primary-950/40 p-4 rounded-xl text-[10px] text-primary-400 font-medium leading-relaxed italic border border-primary-900/40">
                Observação: Os custos apresentados são baseados em médias operacionais (diesel, balsa, desgaste).
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
