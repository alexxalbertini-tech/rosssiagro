export type UserRole = 'DONO' | 'CHEFE' | 'OPERADOR';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: any;
}

export interface Cliente {
  id?: string;
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  endereco?: string;
  createdAt: any;
}

export interface Drone {
  id?: string;
  modelo: string;
  marca: string;
  capacidadeTanque: number; // litros
  autonomia?: number; // minutos
  ativo: boolean;
}

export interface Produto {
  id?: string;
  nome: string;
  culturaSugestao?: string;
  dosagemPadrao: number; // L/ha ou kg/ha
  unidade: 'L' | 'KG';
}

export interface Servico {
  id?: string;
  clienteId: string;
  clienteNome: string;
  areaHectares: number;
  cultura: string;
  produtoId: string;
  produtoNome: string;
  dosagem: number;
  droneId: string;
  droneModelo: string;
  operadoresIds: string[];
  valorPorHectare: number;
  valorTotal: number;
  quantidadeProdutoTotal: number;
  status: 'PENDENTE' | 'CONCLUIDO';
  dataServico: any;
  comissaoTotal: number;
  coordenadas?: { lat: number; lng: number }[];
  createdAt: any;
}

export interface Comissao {
  id?: string;
  servicoId: string;
  operadorId: string;
  valor: number;
  pago: boolean;
  data: any;
}
