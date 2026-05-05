import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Cliente } from '../types';
import { 
  Users, 
  Plus, 
  Search, 
  MapPin, 
  ChevronRight, 
  Loader2, 
  X, 
  Save,
  Building,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Novo Cliente Form
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    cultura: 'Soja',
    telefone: '',
    cpfCnpj: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'clientes'), orderBy('nome', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Cliente[];
      setClientes(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) return;
    
    setSaving(true);
    try {
      await addDoc(collection(db, 'clientes'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setFormData({ nome: '', endereco: '', cultura: 'Soja', telefone: '', cpfCnpj: '' });
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar cliente.');
    } finally {
      setSaving(false);
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.endereco?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar fazenda ou cliente..."
            className="input-field pl-12 h-14"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary w-full md:w-auto h-14 bg-black font-black"
        >
          <Plus className="w-6 h-6" /> Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-3xl animate-pulse" />
          ))
        ) : filteredClientes.length > 0 ? (
          filteredClientes.map((c) => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-0 overflow-hidden group hover:shadow-xl hover:shadow-primary-900/5 transition-all"
            >
              <div className="bg-gray-50 border-b border-gray-100 p-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary-100 p-3 rounded-2xl text-primary-700">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-black leading-tight">{c.nome}</h3>
                    <div className="flex items-center gap-1 text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                      <Target className="w-3 h-3" /> {c.cultura || 'Não definida'}
                    </div>
                  </div>
                </div>
                <button className="text-gray-300 hover:text-primary-700 transition-colors">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                  <MapPin className="w-4 h-4 shrink-0 text-primary-600" />
                  <span className="truncate">{c.endereco || 'São José do Rio Preto, SP'}</span>
                </div>
                <div className="pt-2 border-t border-gray-50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Cadastrado em 2024</span>
                  <span className="text-primary-700">Fazenda Ativa</span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
             <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
               <Users className="w-10 h-10 text-gray-300" />
             </div>
             <p className="text-gray-500 font-bold">Nenhum cliente encontrado.</p>
          </div>
        )}
      </div>

      {/* Modal Novo Cliente */}
      <AnimatePresence>
        {isModalOpen && (
          <>
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] bg-white rounded-3xl overflow-hidden z-[110] shadow-2xl"
             >
               <div className="bg-[#0a1a0f] p-6 text-white flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="bg-primary-600 p-2 rounded-xl">
                    <Plus className="w-5 h-5" />
                   </div>
                   <h2 className="text-xl font-bold">Novo Cliente</h2>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="bg-white/10 p-2 rounded-xl">
                   <X className="w-6 h-6" />
                 </button>
               </div>

               <form onSubmit={handleSave} className="p-6 space-y-4">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Nome da Fazenda / Cliente</label>
                   <input 
                    className="input-field" 
                    placeholder="Ex: Fazenda Boa Vista" 
                    required 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                   />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Cultura Principal</label>
                      <select 
                        className="input-field"
                        value={formData.cultura}
                        onChange={(e) => setFormData({...formData, cultura: e.target.value})}
                      >
                        <option value="Soja">Soja</option>
                        <option value="Milho">Milho</option>
                        <option value="Cana">Cana</option>
                        <option value="Café">Café</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Telefone</label>
                      <input 
                        className="input-field" 
                        placeholder="(00) 00000-0000"
                        value={formData.telefone}
                        onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Endereço / Localização</label>
                    <input 
                      className="input-field" 
                      placeholder="Cidade, UF ou KM da Rodovia"
                      value={formData.endereco}
                      onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                    />
                 </div>

                 <button 
                  disabled={saving}
                  className="btn-primary w-full h-16 bg-primary-700 mt-4 shadow-xl shadow-primary-700/30"
                 >
                   {saving ? (
                     <Loader2 className="w-6 h-6 animate-spin" />
                   ) : (
                     <>
                        <Save className="w-5 h-5" /> Salvar Cliente
                     </>
                   )}
                 </button>
               </form>
             </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
