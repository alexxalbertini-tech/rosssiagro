import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function seedInitialData() {
  const clientsSnap = await getDocs(collection(db, 'clientes'));
  if (clientsSnap.empty) {
    const clients = [
      { nome: 'Fazenda Santa Maria', cpfCnpj: '12.345.678/0001-90', telefone: '(11) 99999-9999', endereco: 'Rodovia SP-310, Km 200' },
      { nome: 'Agropecuária Vale Verde', cpfCnpj: '98.765.432/0001-10', telefone: '(16) 88888-8888', endereco: 'Estrada Municipal, Lote 45' }
    ];
    for (const c of clients) await addDoc(collection(db, 'clientes'), c);
  }

  const dronesSnap = await getDocs(collection(db, 'drones'));
  if (dronesSnap.empty) {
    const drones = [
      { modelo: 'Agras T40', marca: 'DJI', capacidadeTanque: 40, autonomia: 15, ativo: true },
      { modelo: 'Agras T30', marca: 'DJI', capacidadeTanque: 30, autonomia: 12, ativo: true }
    ];
    for (const d of drones) await addDoc(collection(db, 'drones'), d);
  }

  const productsSnap = await getDocs(collection(db, 'produtos'));
  if (productsSnap.empty) {
    const products = [
      { nome: 'Herbicida Roundup', culturaSugestao: 'Soja', dosagemPadrao: 2, unidade: 'L' },
      { nome: 'Inseticida Decis', culturaSugestao: 'Milho', dosagemPadrao: 0.5, unidade: 'L' },
      { nome: 'Fungicida Priori', culturaSugestao: 'Cana', dosagemPadrao: 1, unidade: 'L' }
    ];
    for (const p of products) await addDoc(collection(db, 'produtos'), p);
  }
}
