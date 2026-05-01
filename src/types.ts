/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StatusPedido = 'PENDENTE' | 'EM_ENTREGA' | 'ENTREGUE' | 'CANCELADO';

export type TipoPedido = 'FAMILIA' | 'CASAL' | 'AVULSO' | 'DESCONHECIDO';

export interface Pedido {
  id: string;
  numeroPedido: string;
  nome: string;
  telefone: string;
  endereco: string;
  latitude?: number;
  longitude?: number;
  tipo: TipoPedido;
  valor: number;
  pagamento: string;
  sabores: string;
  itens: string;
  refrigerante: string;
  observacoes: string;
  status: StatusPedido;
  geocodificado: boolean;
}

export interface CoordenadasCache {
  [endereco: string]: {
    lat: number;
    lng: number;
  };
}
