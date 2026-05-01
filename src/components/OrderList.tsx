import { useState } from 'react';
import { Pedido, StatusPedido } from '../types';
import { cn, formatarBRL } from '../lib/utils';
import { Search, Filter, Phone, MapPin, ChevronRight, Package, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface OrderListProps {
  pedidos: Pedido[];
  onSelect: (pedido: Pedido) => void;
  onUpdateStatus: (id: string, status: StatusPedido) => void;
}

export function OrderList({ pedidos, onSelect, onUpdateStatus }: OrderListProps) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusPedido | 'TODOS'>('TODOS');

  const filtrados = pedidos.filter(p => {
    // Esconde pedidos finalizados desta aba (vão para o Histórico)
    if (p.status === 'ENTREGUE' || p.status === 'CANCELADO') return false;

    const correspondeBusca = 
      p.nome.toLowerCase().includes(busca.toLowerCase()) || 
      p.numeroPedido.toLowerCase().includes(busca.toLowerCase()) ||
      p.endereco.toLowerCase().includes(busca.toLowerCase());
    
    const correspondeStatus = filtroStatus === 'TODOS' || p.status === filtroStatus;
    
    return correspondeBusca && correspondeStatus;
  });

  const getStatusIcon = (status: StatusPedido) => {
    switch (status) {
      case 'PENDENTE': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'EM_ENTREGA': return <Package className="w-4 h-4 text-blue-500" />;
      case 'ENTREGUE': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'CANCELADO': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getBadgeClass = (status: StatusPedido) => {
    switch (status) {
      case 'PENDENTE': return "bg-amber-100 text-amber-700";
      case 'EM_ENTREGA': return "bg-blue-100 text-blue-700";
      case 'ENTREGUE': return "bg-green-100 text-green-700";
      case 'CANCELADO': return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="flex flex-col">
      <div className="sticky top-[53px] z-30 bg-gray-50/90 backdrop-blur-md px-4 py-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou pedido..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(['TODOS', 'PENDENTE', 'EM_ENTREGA'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={cn(
                "whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all border",
                filtroStatus === status 
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                  : "bg-white text-gray-600 border-gray-200"
              )}
            >
              {status === 'TODOS' ? 'Todos Ativos' : (status === 'EM_ENTREGA' ? 'Rota' : status.replace('_', ' '))}
              {status === 'TODOS' ? ` (${pedidos.filter(p => p.status !== 'ENTREGUE' && p.status !== 'CANCELADO').length})` : ` (${pedidos.filter(p => p.status === status).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="px-1 mb-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Lista de Pedidos ({filtrados.length})
          </h3>
        </div>

        {filtrados.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center space-y-3">
            <Package className="w-12 h-12 text-gray-200" />
            <p className="text-gray-400 font-medium">Nenhum pedido encontrado</p>
          </div>
        ) : (
          filtrados.map(p => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="w-full text-left bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all flex items-center gap-3 relative overflow-hidden group"
            >
              <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", 
                p.status === 'PENDENTE' ? 'bg-amber-400' : 
                p.status === 'EM_ENTREGA' ? 'bg-blue-500' : 
                p.status === 'ENTREGUE' ? 'bg-green-500' : 'bg-red-500'
              )} />
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{p.numeroPedido}</span>
                  <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", getBadgeClass(p.status))}>
                    {p.status.replace('_', ' ')}
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 truncate mb-1">{p.nome}</h3>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    <span className="truncate">{p.endereco}</span>
                  </div>
                  
                  {(p.sabores || p.itens) && (
                    <div className="flex items-center gap-1.5 text-[10px] text-blue-500 font-bold truncate">
                      <Package className="w-3 h-3 shrink-0" />
                      <span className="truncate">{p.sabores || p.itens}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="font-bold text-sm text-blue-600">{formatarBRL(p.valor)}</div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1 uppercase font-bold max-w-[150px]">
                      <Phone className="w-3 h-3 text-gray-300 shrink-0" />
                      <span className="truncate">{p.telefone || 'S/ Telefone'}</span>
                      <span className="mx-0.5 text-gray-200">•</span>
                      <span className="text-gray-500 truncate">{p.pagamento || 'S/ Info'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 shrink-0 group-active:translate-x-1 transition-transform" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
