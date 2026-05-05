import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Servico } from '../types';
import { 
  Droplet, 
  Calendar, 
  Map as MapIcon, 
  CheckCircle2, 
  Clock, 
  Search,
  Filter,
  ChevronRight,
  User,
  MoreVertical
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'servicos'), orderBy('dataServico', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Servico[];
      setServicos(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredServicos = servicos.filter(s => 
    s.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cultura.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou cultura..."
            className="input-field pl-12 h-14"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-white border border-gray-200 px-6 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5" /> Filtros
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-3xl animate-pulse" />)
        ) : filteredServicos.length > 0 ? (
          filteredServicos.map((s) => (
            <motion.div 
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-0 overflow-hidden group hover:shadow-xl transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center">
                <div className={`w-full md:w-3 ${s.status === 'CONCLUIDO' ? 'bg-primary-600' : 'bg-yellow-500'}`} />
                
                <div className="flex-1 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${s.status === 'CONCLUIDO' ? 'bg-primary-50 text-primary-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      <Droplet className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-black">{s.clienteNome}</h4>
                      <div className="flex items-center gap-3 mt-1 underline-offset-4">
                        <span className="text-xs font-black uppercase text-gray-400 tracking-widest">{s.cultura}</span>
                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                        <span className="text-xs font-black uppercase text-primary-700 tracking-widest">{s.areaHectares} Hectares</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:flex items-center gap-4 md:gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Data</span>
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(s.dataServico?.seconds * 1000).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total</span>
                      <div className="font-black text-black">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.valorTotal)}
                      </div>
                    </div>

                    <div className="hidden lg:flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</span>
                      <div className={`flex items-center gap-1.5 font-black text-xs uppercase px-2 py-1 rounded-full ${
                        s.status === 'CONCLUIDO' ? 'text-primary-700 bg-primary-50' : 'text-yellow-700 bg-yellow-50'
                      }`}>
                         {s.status === 'CONCLUIDO' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                         {s.status}
                      </div>
                    </div>

                    <button className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black transition-colors">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="card text-center py-20 bg-white">
            <MapIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">Nenhum serviço registrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
