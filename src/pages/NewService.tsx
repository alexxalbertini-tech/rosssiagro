import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Cliente, Drone, Produto } from '../types';
import { 
  Leaf, 
  User, 
  Map as MapIcon, 
  ArrowRight, 
  CheckCircle2, 
  Calculator, 
  Droplet,
  Save,
  AlertTriangle,
  Loader2,
  Users
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
    dosagem: 0,
    droneId: '',
    droneModelo: '',
    operadoresIds: [profile?.uid || ''],
    valorPorHectare: 45, // Default/Average value
  });

  // DB Data
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const cSnap = await getDocs(collection(db, 'clientes'));
      const dSnap = await getDocs(collection(db, 'drones'));
      const pSnap = await getDocs(collection(db, 'produtos'));

      setClientes(cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Cliente[]);
      setDrones(dSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Drone[]);
      setProdutos(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Produto[]);
    };
    fetchData();
  }, []);

  const culturas = ['Soja', 'Milho', 'Cana', 'Café', 'Citros', 'Pastagem'];

  // Calculations
  const valorTotal = formData.areaHectares * formData.valorPorHectare;
  const quantidadeProdutoTotal = formData.areaHectares * formData.dosagem;
  const comissaoTotal = valorTotal * 0.1; // 10% default commission

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'servicos'), {
        ...formData,
        valorTotal,
        quantidadeProdutoTotal,
        comissaoTotal,
        status: 'PENDENTE',
        createdAt: serverTimestamp(),
        dataServico: serverTimestamp()
      });
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar serviço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIcon = (s: number, icon: any) => (
    <div className={`p-3 rounded-2xl ${step === s ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-400'}`}>
      {icon}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Novo Serviço</h1>
          <p className="text-gray-500 font-medium whitespace-nowrap">Etapa {step} de 3</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all ${step === i ? 'w-8 bg-primary-700' : 'w-2 bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="card">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-2">
                {renderStepIcon(1, <User className="w-6 h-6" />)}
                <h2 className="text-xl font-bold">Cliente e Área</h2>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Selecionar Cliente</label>
                <select 
                  className="input-field"
                  value={formData.clienteId}
                  onChange={(e) => {
                    const c = clientes.find(cli => cli.id === e.target.value);
                    setFormData({ ...formData, clienteId: e.target.value, clienteNome: c?.nome || '' });
                  }}
                >
                  <option value="">Selecione...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  <option value="new">+ Novo Cliente (em breve)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Área (Hectares)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="0.00"
                    value={formData.areaHectares || ''}
                    onChange={(e) => setFormData({ ...formData, areaHectares: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Cultura</label>
                  <select 
                    className="input-field"
                    value={formData.cultura}
                    onChange={(e) => setFormData({ ...formData, cultura: e.target.value })}
                  >
                    {culturas.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <button 
                disabled={!formData.clienteId || !formData.areaHectares}
                onClick={handleNext} 
                className="btn-primary w-full h-14 disabled:opacity-50"
              >
                Próximo Passo <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-2">
                {renderStepIcon(2, <Droplet className="w-6 h-6" />)}
                <h2 className="text-xl font-bold">Produto e Drone</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Produto</label>
                  <select 
                    className="input-field"
                    value={formData.produtoId}
                    onChange={(e) => {
                      const p = produtos.find(prod => prod.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        produtoId: e.target.value, 
                        produtoNome: p?.nome || '',
                        dosagem: p?.dosagemPadrao || 0
                      });
                    }}
                  >
                    <option value="">Selecione...</option>
                    {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Dosagem (L/ha)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={formData.dosagem || ''}
                    onChange={(e) => setFormData({ ...formData, dosagem: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Drone Utilizado</label>
                <select 
                  className="input-field"
                  value={formData.droneId}
                  onChange={(e) => {
                    const d = drones.find(dr => dr.id === e.target.value);
                    setFormData({ ...formData, droneId: e.target.value, droneModelo: d?.modelo || '' });
                  }}
                >
                  <option value="">Selecione...</option>
                  {drones.map(d => <option key={d.id} value={d.id}>{d.modelo} ({d.marca})</option>)}
                </select>
              </div>

              <div className="flex gap-4">
                <button onClick={handleBack} className="flex-1 bg-gray-100 h-14 rounded-xl font-bold">Voltar</button>
                <button 
                  disabled={!formData.produtoId || !formData.droneId}
                  onClick={handleNext} 
                  className="btn-primary flex-[2] h-14 disabled:opacity-50"
                >
                  Configurar Valor <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-2">
                {renderStepIcon(3, <Calculator className="w-6 h-6" />)}
                <h2 className="text-xl font-bold">Revisão e Valores</h2>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">Investimento/ha</span>
                  <span className="font-bold">R$ {formData.valorPorHectare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">Total Hectares</span>
                  <span className="font-bold">{formData.areaHectares} ha</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-black italic">Valor Total</span>
                  <span className="text-2xl font-black text-primary-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
                  </span>
                </div>
              </div>

              <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-primary-700" />
                  <h4 className="font-bold text-primary-900">Operadores e Comissão</h4>
                </div>
                <div className="flex justify-between items-center font-bold text-primary-800">
                  <span>Comissão Total Estimada</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(comissaoTotal)}</span>
                </div>
                <p className="text-xs text-primary-400 mt-2 font-medium">Equivalente a 10% do valor total do serviço para a equipe.</p>
              </div>

              <div className="flex gap-4">
                <button onClick={handleBack} className="flex-1 bg-gray-100 h-14 rounded-xl font-bold">Voltar</button>
                <button 
                  disabled={loading}
                  onClick={handleSubmit} 
                  className="btn-primary flex-[2] h-14 bg-black hover:bg-gray-900"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" /> Finalizar Registro
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 bg-yellow-50 border border-yellow-100 rounded-3xl flex gap-4">
        <AlertTriangle className="w-8 h-8 text-yellow-600 shrink-0" />
        <div>
          <p className="font-bold text-yellow-800">Informação Importante</p>
          <p className="text-sm text-yellow-700 font-medium">Certifique-se de validar as coordenadas da área com GPS antes de iniciar a decolagem do drone.</p>
        </div>
      </div>
    </div>
  );
}
