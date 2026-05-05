import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Cliente, Drone, Produto, UserProfile } from '../types';
import { 
  User, 
  Map as MapIcon, 
  ArrowRight, 
  Calculator, 
  Droplet,
  Save,
  Loader2,
  Users,
  Target,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NewService() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    clienteId: '',
    clienteNome: '',
    areaHectares: 0,
    cultura: 'Soja',
    produtoId: '',
    produtoNome: '',
    dosagem: 2, // L/ha
    droneId: '',
    droneModelo: '',
    operadoresIds: [profile?.uid || ''],
    valorPorHectare: 45,
  });

  // DB Data
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [operadores, setOperadores] = useState<UserProfile[]>([]);

  useEffect(() => {
    const unsubC = onSnapshot(query(collection(db, 'clientes'), orderBy('nome')), (snap) => {
      setClientes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Cliente[]);
    });
    const unsubD = onSnapshot(collection(db, 'drones'), (snap) => {
      setDrones(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Drone[]);
    });
    const unsubP = onSnapshot(collection(db, 'produtos'), (snap) => {
      setProdutos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Produto[]);
    });
    const unsubO = onSnapshot(collection(db, 'users'), (snap) => {
      const all = snap.docs.map(doc => doc.data() as UserProfile);
      setOperadores(all.filter(u => u.role === 'OPERADOR' || u.role === 'CHEFE'));
    });

    return () => { unsubC(); unsubD(); unsubP(); unsubO(); };
  }, []);

  // Calculations (Dynamic)
  const valorTotal = (formData.areaHectares || 0) * (formData.valorPorHectare || 0);
  const quantidadeProdutoTotal = (formData.areaHectares || 0) * (formData.dosagem || 0);
  const comissaoTotal = valorTotal * 0.1; // 10% base

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!formData.clienteId || !formData.areaHectares || !formData.valorPorHectare) {
       alert('Preencha os campos obrigatórios.');
       return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'servicos'), {
        ...formData,
        valorTotal,
        quantidadeProdutoTotal,
        comissaoTotal,
        status: 'CONCLUIDO',
        createdAt: serverTimestamp(),
        dataServico: serverTimestamp()
      });
      navigate('/servicos');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar serviço.');
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = ({ s, icon: Icon, title }: any) => (
    <div className={`flex items-center gap-3 transition-all ${step === s ? 'scale-105' : 'opacity-40 grayscale'}`}>
      <div className={`p-4 rounded-2xl shadow-xl ${step === s ? 'bg-primary-700 text-white shadow-primary-700/30' : 'bg-gray-100 text-gray-400'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="hidden md:block">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Passo {s}</p>
        <h3 className="font-bold text-black">{title}</h3>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-gray-100">
        <StepIndicator s={1} icon={User} title="Identificação" />
        <div className="hidden md:block h-px w-12 bg-gray-200" />
        <StepIndicator s={2} icon={Droplet} title="Especificação" />
        <div className="hidden md:block h-px w-12 bg-gray-200" />
        <StepIndicator s={3} icon={Calculator} title="Finalização" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="card lg:p-10 min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 flex-1">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight mb-2">Cliente e Local</h2>
                    <p className="text-gray-400 font-medium text-sm">Selecione o contratante e a cultura do atendimento.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-3 ml-1 uppercase tracking-widest">Selecionar Cliente</label>
                      <select 
                        className="input-field h-16 text-lg font-bold"
                        value={formData.clienteId}
                        onChange={(e) => {
                          const c = clientes.find(cli => cli.id === e.target.value);
                          setFormData({ ...formData, clienteId: e.target.value, clienteNome: c?.nome || '' });
                        }}
                      >
                        <option value="">Selecione o Cliente / Fazenda</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-black text-gray-700 mb-3 ml-1 uppercase tracking-widest text-primary-700">Área (Hectares) *</label>
                        <input 
                          type="number" className="input-field h-16 text-xl font-black bg-primary-50/50 border-primary-100 focus:bg-white" 
                          placeholder="0.0" value={formData.areaHectares || ''}
                          onChange={(e) => setFormData({ ...formData, areaHectares: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black text-gray-700 mb-3 ml-1 uppercase tracking-widest">Cultura de Campo</label>
                        <select className="input-field h-16 font-bold" value={formData.cultura} onChange={(e) => setFormData({ ...formData, cultura: e.target.value })}>
                          <option value="Soja">Soja</option>
                          <option value="Milho">Milho</option>
                          <option value="Cana">Cana</option>
                          <option value="Algodão">Algodão</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-8">
                    <button 
                      disabled={!formData.clienteId || !formData.areaHectares}
                      onClick={handleNext} 
                      className="btn-primary w-full h-16 text-lg font-black bg-black hover:bg-gray-900 shadow-2xl shadow-black/20 disabled:opacity-30"
                    >
                      Continuar Detalhamento <ArrowRight className="w-6 h-6 ml-2" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 flex-1">
                   <div>
                    <h2 className="text-2xl font-black tracking-tight mb-2">Drone e Produtos</h2>
                    <p className="text-gray-400 font-medium text-sm">Configure a aplicação técnica e o equipamento utilizado.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-black text-gray-700 mb-3 ml-1 uppercase tracking-widest">Insumo Utilizado</label>
                        <select 
                          className="input-field h-16 font-bold"
                          value={formData.produtoId}
                          onChange={(e) => {
                            const p = produtos.find(prod => prod.id === e.target.value);
                            setFormData({ 
                              ...formData, 
                              produtoId: e.target.value, 
                              produtoNome: p?.nome || '',
                              dosagem: p?.dosagemPadrao || 2
                            });
                          }}
                        >
                          <option value="">Selecione o Produto</option>
                          {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-black text-gray-700 mb-3 ml-1 uppercase tracking-widest">Dosagem (L/Hectare)</label>
                        <input 
                          type="number" className="input-field h-16 font-black" 
                          value={formData.dosagem || ''}
                          onChange={(e) => setFormData({ ...formData, dosagem: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-3 ml-1 uppercase tracking-widest">Drone Operacional</label>
                      <select 
                        className="input-field h-16 font-bold"
                        value={formData.droneId}
                        onChange={(e) => {
                          const d = drones.find(dr => dr.id === e.target.value);
                          setFormData({ ...formData, droneId: e.target.value, droneModelo: d?.modelo || '' });
                        }}
                      >
                        <option value="">Selecione a Unidade de Drone</option>
                        {drones.map(d => <option key={d.id} value={d.id}>{d.modelo} - {d.marca}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-auto pt-8">
                    <button onClick={handleBack} className="flex-1 bg-gray-100 h-16 rounded-2xl font-black text-gray-500 hover:bg-gray-200 transition-colors">Voltar</button>
                    <button 
                      disabled={!formData.droneId}
                      onClick={handleNext} 
                      className="btn-primary flex-[2] h-16 text-lg font-black disabled:opacity-30"
                    >
                      Configurar Financeiro <ArrowRight className="w-6 h-6 ml-2" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 flex-1">
                   <div>
                    <h2 className="text-2xl font-black tracking-tight mb-2">Valores e Fechamento</h2>
                    <p className="text-gray-400 font-medium text-sm">Revise o faturamento e as comissões do serviço.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-3 ml-1 uppercase tracking-widest text-primary-700">Valor Contratado por Hectare *</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400">R$</span>
                        <input 
                          type="number" className="input-field h-20 pl-14 text-2xl font-black bg-primary-700 text-white focus:bg-primary-800 border-none" 
                          value={formData.valorPorHectare || ''}
                          onChange={(e) => setFormData({ ...formData, valorPorHectare: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="bg-primary-100 p-2 rounded-xl">
                            <Users className="w-5 h-5 text-primary-700" />
                         </div>
                         <span className="font-bold text-gray-700">Equipe de Operação</span>
                       </div>
                       <span className="bg-primary-700 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter">
                          Comissão 10%
                       </span>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-auto pt-8">
                    <button onClick={handleBack} className="flex-1 bg-gray-100 h-16 rounded-2xl font-black text-gray-500 hover:bg-gray-200 transition-colors text-sm">Revisar Etapas</button>
                    <button 
                      disabled={loading}
                      onClick={handleSubmit} 
                      className="btn-primary flex-[2] h-16 text-lg font-black bg-black hover:bg-gray-900 shadow-2xl shadow-black/40"
                    >
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-6 h-6 mr-2" /> Salvar Serviço
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-[#0a1a0f] text-white border-0 p-8 shadow-2xl">
             <h3 className="text-xl font-black mb-6 tracking-tighter flex items-center gap-3">
               <MapIcon className="w-6 h-6 text-primary-500" /> Resumo do Cálculo
             </h3>

             <div className="space-y-6">
               <div className="flex justify-between items-center group">
                 <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Área Declarada</span>
                 <span className="text-lg font-black text-primary-500">{formData.areaHectares || 0} HA</span>
               </div>
               
               <div className="flex justify-between items-center">
                 <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Uso de Insumo</span>
                 <span className="text-lg font-black">{quantidadeProdutoTotal.toFixed(1)} L</span>
               </div>

               <div className="flex justify-between items-center">
                 <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Valor por HA</span>
                 <span className="text-lg font-black">R$ {formData.valorPorHectare || 0}</span>
               </div>

               <div className="h-px bg-white/5 my-6" />

               <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Faturamento Bruto</p>
                  <h4 className="text-4xl font-black tracking-tighter">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
                  </h4>
               </div>

               <div className="bg-primary-950/40 p-5 rounded-2xl border border-primary-900/40 flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="text-[10px] text-primary-600 font-black uppercase tracking-widest">Comissão</p>
                      <p className="font-black text-primary-500">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(comissaoTotal)}
                      </p>
                    </div>
                  </div>
                  <DollarSign className="w-8 h-8 text-white opacity-10" />
               </div>
             </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 text-amber-800">
             <div className="flex items-center gap-3 mb-2 font-black text-sm uppercase tracking-widest">
               <Users className="w-5 h-5" /> Importante
             </div>
             <p className="text-xs font-medium leading-relaxed opacity-80">
               O status do serviço será automaticamente definido como <span className="font-black">CONCLUÍDO</span>. Certifique-se de que a balsa de apoio já está no local da decolagem.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
