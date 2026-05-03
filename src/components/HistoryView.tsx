import { Pedido } from '../types';
import { formatarBRL, cn } from '../lib/utils';
import { CheckCircle2, XCircle, Package, Calendar } from 'lucide-react';

interface HistoryViewProps {
  pedidos: Pedido[];
}

export function HistoryView({ pedidos }: HistoryViewProps) {
  const concluidos = pedidos.filter(p => p.status === 'ENTREGUE' || p.status === 'CANCELADO');
  const entregues = concluidos.filter(p => p.status === 'ENTREGUE');
  const totalFaturado = entregues.reduce((acc, p) => acc + p.valor, 0);

  return (
    <div className="p-4 space-y-6 pb-6">
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-50 rounded-xl text-green-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">Resumo de Hoje</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Relatório de entregas</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Entregas</span>
            <p className="text-2xl font-brand text-green-600">{entregues.length}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Faturado</span>
            <p className="text-2xl font-brand text-zinc-950">{formatarBRL(totalFaturado)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Lista de Finalizados</h3>
        
        {concluidos.length === 0 ? (
          <div className="py-12 text-center text-gray-400 italic text-sm">
            Nenhum pedido finalizado ainda.
          </div>
        ) : (
          concluidos.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-xl shrink-0",
                p.status === 'ENTREGUE' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}>
                {p.status === 'ENTREGUE' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-900 truncate text-sm">{p.nome}</h4>
                  <span className="text-[10px] font-black text-gray-400">#{p.numeroPedido}</span>
                </div>
                <p className="text-[10px] text-gray-400 truncate">{p.endereco}</p>
              </div>
              <div className="text-sm font-brand text-zinc-950">
                {formatarBRL(p.valor)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
