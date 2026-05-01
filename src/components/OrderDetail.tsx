import { Pedido, StatusPedido } from '../types';
import { motion } from 'motion/react';
import { X, Phone, MapPin, CheckCircle2, Package, ExternalLink, MessageCircle, Pizza, Info, CupSoda, XCircle } from 'lucide-react';
import { cn, formatarBRL } from '../lib/utils';

interface OrderDetailProps {
  pedido: Pedido;
  onClose: () => void;
  onUpdateStatus: (id: string, status: StatusPedido) => void;
}

export function OrderDetail({ pedido, onClose, onUpdateStatus }: OrderDetailProps) {
  const abrirWhatsApp = () => {
    if (!pedido.telefone) return;
    const fone = pedido.telefone.length >= 12 ? pedido.telefone : `55${pedido.telefone}`;
    window.open(`https://wa.me/${fone}`, '_blank');
  };

  const abrirMapa = () => {
    const query = encodeURIComponent(pedido.endereco);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
      />
      
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-start mb-6 shrink-0">
          <div className="min-w-0 pr-4">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1">Pedido #{pedido.numeroPedido}</span>
            <h2 className="text-xl font-black text-gray-900 leading-tight truncate">{pedido.nome}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 active:bg-gray-200 transition-colors shrink-0">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pb-6 pr-1 no-scrollbar">
          {/* Sessão de Status */}
          <div className="grid grid-cols-4 gap-1.5 px-0.5">
            {(['PENDENTE', 'EM_ENTREGA', 'ENTREGUE', 'CANCELADO'] as StatusPedido[]).map(s => (
              <button
                key={s}
                onClick={() => onUpdateStatus(pedido.id, s)}
                className={cn(
                  "flex flex-col items-center p-2 rounded-xl border transition-all",
                  pedido.status === s 
                    ? (s === 'CANCELADO' ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-100" : "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100")
                    : "bg-white border-gray-100 text-gray-400"
                )}
              >
                {s === 'PENDENTE' && <ClockIcon className="w-4 h-4 mb-1" />}
                {s === 'EM_ENTREGA' && <Package className="w-4 h-4 mb-1" />}
                {s === 'ENTREGUE' && <CheckCircle2 className="w-4 h-4 mb-1" />}
                {s === 'CANCELADO' && <XCircle className="w-4 h-4 mb-1" />}
                <span className="text-[9px] font-black uppercase text-center leading-tight">
                  {s === 'EM_ENTREGA' ? 'ROTA' : s.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Endereço</label>
                  <p className="text-sm font-semibold text-gray-800">{pedido.endereco}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Telefone</label>
                  <p className="text-sm font-semibold text-gray-800">{pedido.telefone || 'Não informado'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Tipo</label>
                <span className="px-2 py-1 bg-white rounded-lg text-[10px] font-bold border border-gray-100">{pedido.tipo}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Pagamento</label>
                <p className={cn(
                  "font-bold text-gray-800 uppercase leading-tight break-words",
                  pedido.pagamento && pedido.pagamento.length > 20 ? "text-[10px]" : "text-sm"
                )}>{pedido.pagamento || 'S/ Info'}</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">Total</label>
              <p className="text-2xl font-black text-blue-600">{formatarBRL(pedido.valor)}</p>
            </div>

            {/* Itens do Pedido */}
            <div className="space-y-3">
              {(pedido.sabores || pedido.itens || pedido.refrigerante) && (
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Itens do Pedido</h4>
              )}
              
              {pedido.sabores && (
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Pizza className="w-4 h-4 text-orange-500" />
                    <label className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Sabores da Pizza</label>
                  </div>
                  <p className="text-sm font-bold text-orange-900 whitespace-pre-line leading-tight">{pedido.sabores}</p>
                </div>
              )}

              {pedido.itens && (
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-indigo-500" />
                    <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Adicionais / Ajustes</label>
                  </div>
                  <p className="text-sm font-bold text-indigo-900 whitespace-pre-line leading-tight">{pedido.itens}</p>
                </div>
              )}

              {pedido.refrigerante && (
                <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CupSoda className="w-4 h-4 text-cyan-500" />
                    <label className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">Bebida</label>
                  </div>
                  <p className="text-sm font-bold text-cyan-900 whitespace-pre-line leading-tight">{pedido.refrigerante}</p>
                </div>
              )}
            </div>

            {pedido.observacoes && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-amber-500" />
                  <label className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Observações</label>
                </div>
                <p className="text-xs font-medium text-amber-800 leading-relaxed whitespace-pre-line">{pedido.observacoes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-100 bg-white shrink-0">
          <button
            onClick={abrirWhatsApp}
            disabled={!pedido.telefone}
            className="flex items-center justify-center gap-2 py-4 bg-green-500 text-white rounded-2xl font-bold active:scale-95 transition-all text-sm shadow-lg shadow-green-100 disabled:opacity-50"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </button>
          <button
            onClick={abrirMapa}
            className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold active:scale-95 transition-all text-sm shadow-lg shadow-blue-100"
          >
            <ExternalLink className="w-5 h-5" />
            Ver Mapa
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
