import { Pedido, StatusPedido } from '../types';
import { calcularDistancia } from '../services/geoService';
import { getDistanceMatrix } from '../services/routingService';
import { cn } from '../lib/utils';
import { MapPin, Navigation2, CheckCircle2, Package, Clock, Info, Zap } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

interface RouteViewProps {
  pedidos: Pedido[];
  posicaoAtual: { lat: number; lng: number } | null;
  onSelect: (pedido: Pedido) => void;
  onUpdateStatus: (id: string, status: StatusPedido) => void;
}

export function RouteView({ pedidos, posicaoAtual, onSelect, onUpdateStatus }: RouteViewProps) {
  const emEntrega = useMemo(() => pedidos.filter(p => p.status === 'EM_ENTREGA'), [pedidos]);
  const [rotaOrdenada, setRotaOrdenada] = useState<(Pedido & { distancia?: number; road?: boolean })[]>([]);
  const [otimizando, setOtimizando] = useState(false);

  // Efeito para calcular a melhor rota (Primeiro linha reta, depois via ruas)
  useEffect(() => {
    if (!posicaoAtual || emEntrega.length === 0) {
      setRotaOrdenada(emEntrega);
      return;
    }

    let isMounted = true;

    const calcularRota = async () => {
      // 1. Cálculo Rápido (Linha Reta)
      const itemsLinhareta = [...emEntrega];
      let cLat = posicaoAtual.lat;
      let cLng = posicaoAtual.lng;
      const sortedLR: (Pedido & { distancia?: number; road?: boolean })[] = [];

      while (itemsLinhareta.length > 0) {
        let closestIdx = 0;
        let minDistance = Infinity;
        for (let i = 0; i < itemsLinhareta.length; i++) {
          const d = calcularDistancia(cLat, cLng, itemsLinhareta[i].latitude!, itemsLinhareta[i].longitude!);
          if (d < minDistance) { minDistance = d; closestIdx = i; }
        }
        const [next] = itemsLinhareta.splice(closestIdx, 1);
        sortedLR.push({ ...next, distancia: minDistance });
        cLat = next.latitude!; cLng = next.longitude!;
      }
      
      if (isMounted) setRotaOrdenada(sortedLR);

      // 2. Otimização Profunda (Via Ruas / OSRM)
      // Fazemos isso apenas se tivermos uma quantidade razoável de pontos para não sobrecarregar
      if (emEntrega.length > 0 && emEntrega.length <= 25) {
        setOtimizando(true);
        const points = [{ lat: posicaoAtual.lat, lng: posicaoAtual.lng }, ...emEntrega.map(p => ({ lat: p.latitude!, lng: p.longitude! }))];
        const matrix = await getDistanceMatrix(points);

        if (matrix && isMounted) {
          const itemsEstrada = [...emEntrega];
          const sortedRoad: (Pedido & { distancia?: number; road?: boolean })[] = [];
          
          let currentPointIdx = 0; // Índice na matriz (0 é a posição atual)
          const visitedIdxs = new Set([0]);

          while (sortedRoad.length < emEntrega.length) {
            let nextPointIdx = -1;
            let minD = Infinity;

            for (let i = 1; i < points.length; i++) {
              if (!visitedIdxs.has(i)) {
                const d = matrix[currentPointIdx][i];
                if (d < minD) { minD = d; nextPointIdx = i; }
              }
            }

            if (nextPointIdx !== -1) {
              visitedIdxs.add(nextPointIdx);
              // O índice 'i' na matriz corresponde ao item em 'emEntrega' no índice 'i-1'
              const pedido = itemsEstrada[nextPointIdx - 1];
              sortedRoad.push({ ...pedido, distancia: minD, road: true });
              currentPointIdx = nextPointIdx;
            } else {
              break;
            }
          }
          
          if (isMounted && sortedRoad.length === emEntrega.length) {
            setRotaOrdenada(sortedRoad);
          }
        }
        if (isMounted) setOtimizando(false);
      }
    };

    calcularRota();
    return () => { isMounted = false; };
  }, [emEntrega, posicaoAtual]);

  if (pedidos.length > 0 && emEntrega.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center space-y-6 pt-20">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 animate-pulse">
           <Package className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">Roda vazia</h3>
          <p className="text-gray-500 text-sm max-w-[240px] mx-auto">
            Vá na aba <span className="font-bold text-blue-600">Pedidos</span> e marque alguns como "EM ENTREGA" para iniciar sua rota.
          </p>
        </div>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center pt-20">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
           <Info className="w-8 h-8" />
        </div>
        <p className="text-gray-400 font-medium italic">Nenhum pedido importado ainda.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 overflow-hidden">
      <div className="flex justify-between items-center bg-blue-600 p-6 rounded-[32px] text-white shadow-xl shadow-blue-200">
        <div className="min-w-0">
          <h2 className="text-2xl font-black mb-1 truncate">Minha Rota</h2>
          <p className="text-blue-100 text-[10px] font-medium uppercase tracking-widest">{rotaOrdenada.length} entregas pendentes</p>
        </div>
        <div className="p-3 bg-blue-500 rounded-2xl rotate-3 shrink-0">
          <Navigation2 className="w-6 h-6 fill-white" />
        </div>
      </div>

      {!posicaoAtual && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
          <div className="animate-spin text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-amber-700 uppercase">Aguardando sinal do GPS para ordenar por distância...</p>
        </div>
      )}
      
      {otimizando && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 animate-pulse">
          <Zap className="w-5 h-5 text-blue-500 fill-blue-500" />
          <p className="text-[10px] font-bold text-blue-700 uppercase">Otimizando trajeto via ruas (OSRM)...</p>
        </div>
      )}

      <div className="space-y-4">
        {rotaOrdenada.map((p, idx) => (
          <div key={p.id} className="relative">
            {idx < rotaOrdenada.length - 1 && (
              <div className="absolute left-[26px] top-12 bottom-0 w-0.5 border-l-2 border-dashed border-gray-200 z-0" />
            )}
            
            <div className="relative z-10 flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white border-2 border-blue-600 rounded-2xl flex items-center justify-center font-black text-blue-600 text-lg shadow-sm">
                  {idx + 1}
                </div>
              </div>

              <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate" onClick={() => onSelect(p)}>{p.nome}</h3>
                    {p.geocodificado && (!p.latitude || !p.longitude) && (
                      <span className="text-red-500 text-[8px] font-black uppercase mt-0.5">Endereço não localizado</span>
                    )}
                  </div>
                  {p.distancia !== undefined && (
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full transition-colors",
                      p.road ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-500"
                    )}>
                      {p.road && <Zap className="w-2.5 h-2.5 fill-current" />}
                      <span>{p.distancia < 1 ? `${(p.distancia * 1000).toFixed(0)}m` : `${p.distancia.toFixed(1)}km`}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4" onClick={() => onSelect(p)}>
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">{p.endereco}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateStatus(p.id, 'ENTREGUE')}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-green-100"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Entregue
                  </button>
                  <button
                    onClick={() => onSelect(p)}
                    className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold active:scale-95 transition-all"
                  >
                    Detalhes
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
