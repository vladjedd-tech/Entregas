/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Pedido, StatusPedido } from './types';
import { geocodificarEndereco } from './services/geoService';
import { BottomNav } from './components/BottomNav';
import { ImportForm } from './components/ImportForm';
import { OrderList } from './components/OrderList';
import { OrderDetail } from './components/OrderDetail';
import { RouteView } from './components/RouteView';
import { MapView } from './components/MapView';
import { HistoryView } from './components/HistoryView';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [pedidos, setPedidos] = useState<Pedido[]>(() => {
    const salvo = localStorage.getItem('entregas_pedidos');
    return salvo ? JSON.parse(salvo) : [];
  });
  const [abaAtiva, setAbaAtiva] = useState<string>('pedidos');
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);
  const [posicaoAtual, setPosicaoAtual] = useState<{ lat: number; lng: number } | null>(null);

  // Persistência
  useEffect(() => {
    localStorage.setItem('entregas_pedidos', JSON.stringify(pedidos));
  }, [pedidos]);

  // Geolocalização do usuário
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setPosicaoAtual({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.error('Erro ao pegar GPS:', err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Geocodificação automática de pedidos pendentes
  useEffect(() => {
    const pedidosSemGeo = pedidos.filter(p => !p.geocodificado && p.endereco);
    if (pedidosSemGeo.length > 0) {
      const processarProximo = async () => {
        const p = pedidosSemGeo[0];
        const coords = await geocodificarEndereco(p.endereco);
        setPedidos(prev => prev.map(item => 
          item.id === p.id 
            ? { ...item, latitude: coords?.lat, longitude: coords?.lng, geocodificado: true } 
            : item
        ));
      };
      
      // Delay pequeno para respeitar limites do Nominatim
      const timer = setTimeout(processarProximo, 1200);
      return () => clearTimeout(timer);
    }
  }, [pedidos]);

  const adicionarPedidos = (novos: Pedido[]) => {
    setPedidos(prev => [...novos, ...prev]);
    setAbaAtiva('pedidos');
  };

  const atualizarStatus = (id: string, novoStatus: StatusPedido) => {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: novoStatus } : p));
    if (pedidoSelecionado?.id === id) {
      setPedidoSelecionado(prev => prev ? { ...prev, status: novoStatus } : null);
    }
  };

  const [confirmandoLimpeza, setConfirmandoLimpeza] = useState(false);
  const [confirmandoHistorico, setConfirmandoHistorico] = useState(false);

  const limparPedidosAtivos = () => {
    if (!confirmandoLimpeza) {
      setConfirmandoLimpeza(true);
      setTimeout(() => setConfirmandoLimpeza(false), 3000);
      return;
    }
    setPedidos(prev => prev.filter(p => p.status === 'ENTREGUE' || p.status === 'CANCELADO'));
    setConfirmandoLimpeza(false);
  };

  const limparHistorico = () => {
    if (!confirmandoHistorico) {
      setConfirmandoHistorico(true);
      setTimeout(() => setConfirmandoHistorico(false), 3000);
      return;
    }
    setPedidos(prev => prev.filter(p => p.status !== 'ENTREGUE' && p.status !== 'CANCELADO'));
    setConfirmandoHistorico(false);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50 pb-[70px]">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Entregas PB</h1>
        
        {abaAtiva === 'pedidos' && pedidos.some(p => p.status !== 'ENTREGUE' && p.status !== 'CANCELADO') && (
          <button 
            onClick={limparPedidosAtivos}
            className={cn(
              "text-[10px] font-black px-3 py-1.5 rounded-lg active:scale-95 transition-all uppercase whitespace-nowrap",
              confirmandoLimpeza 
                ? "bg-red-600 text-white animate-pulse" 
                : "bg-red-50 text-red-600"
            )}
          >
            {confirmandoLimpeza ? 'Confirmar?' : 'Limpar Pedidos'}
          </button>
        )}

        {abaAtiva === 'historico' && pedidos.some(p => p.status === 'ENTREGUE' || p.status === 'CANCELADO') && (
          <button 
            onClick={limparHistorico}
            className={cn(
              "text-[10px] font-black px-3 py-1.5 rounded-lg active:scale-95 transition-all uppercase whitespace-nowrap",
              confirmandoHistorico 
                ? "bg-red-600 text-white animate-pulse" 
                : "bg-gray-100 text-gray-600"
            )}
          >
            {confirmandoHistorico ? 'Apagar TUDO?' : 'Limpar Histórico'}
          </button>
        )}
      </header>

      <main className="flex-1 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {abaAtiva === 'importar' && (
            <motion.div
              key="importar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4"
            >
              <ImportForm onImport={adicionarPedidos} />
            </motion.div>
          )}

          {abaAtiva === 'pedidos' && (
            <motion.div
              key="pedidos"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <OrderList 
                pedidos={pedidos} 
                onSelect={setPedidoSelecionado}
                onUpdateStatus={atualizarStatus}
              />
            </motion.div>
          )}

          {abaAtiva === 'rota' && (
            <motion.div
              key="rota"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <RouteView 
                pedidos={pedidos} 
                posicaoAtual={posicaoAtual}
                onSelect={setPedidoSelecionado}
                onUpdateStatus={atualizarStatus}
              />
            </motion.div>
          )}

          {abaAtiva === 'mapa' && (
            <motion.div
              key="mapa"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[calc(100vh-135px)]"
            >
              <MapView 
                pedidos={pedidos} 
                posicaoAtual={posicaoAtual}
                onSelectPedido={setPedidoSelecionado}
              />
            </motion.div>
          )}

          {abaAtiva === 'historico' && (
            <motion.div
              key="historico"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <HistoryView pedidos={pedidos} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />

      <AnimatePresence>
        {pedidoSelecionado && (
          <OrderDetail 
            pedido={pedidoSelecionado} 
            onClose={() => setPedidoSelecionado(null)}
            onUpdateStatus={atualizarStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
