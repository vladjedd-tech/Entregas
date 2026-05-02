import { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Pedido } from '../types';
import { calcularDistancia } from '../services/geoService';
import { getRoadRoute } from '../services/routingService';
import { Navigation2, MapPin, Crosshair } from 'lucide-react';
import { cn } from '../lib/utils';

interface MapViewProps {
  pedidos: Pedido[];
  posicaoAtual: { lat: number; lng: number } | null;
  onSelectPedido: (pedido: Pedido) => void;
}

// Corrigindo ícones padrão do Leaflet (Prevenindo erros de asset)
const createIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const icons = {
  PENDENTE: createIcon('#f59e0b'), // Amarelo
  EM_ENTREGA: createIcon('#3b82f6'), // Azul
  ENTREGUE: createIcon('#10b981'), // Verde
  USER: createIcon('#ef4444'), // Vermelho (Usuário)
};

function MapController({ 
  posicaoAtual, 
  proximoPedido, 
  shouldFocus 
}: { 
  posicaoAtual: { lat: number; lng: number } | null; 
  proximoPedido: Pedido | null;
  shouldFocus: boolean;
}) {
  const map = useMap();
  
  useEffect(() => {
    map.invalidateSize();
    if (shouldFocus && posicaoAtual) {
      const bounds = L.latLngBounds([[posicaoAtual.lat, posicaoAtual.lng]]);
      
      if (proximoPedido?.latitude && proximoPedido?.longitude) {
        bounds.extend([proximoPedido.latitude, proximoPedido.longitude]);
      }

      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 16 });
    }
  }, [map, posicaoAtual, proximoPedido, shouldFocus]);

  return null;
}

export function MapView({ pedidos, posicaoAtual, onSelectPedido }: MapViewProps) {
  const defaultCenter: [number, number] = [-26.2238, -52.6719]; // Pato Branco center
  const [roadPath, setRoadPath] = useState<[number, number][]>([]);
  const [isRouting, setIsRouting] = useState(false);
  const [autoFocus, setAutoFocus] = useState(true);

  const pedidosEmRota = useMemo(() => 
    pedidos.filter(p => p.latitude && p.longitude && p.status === 'EM_ENTREGA'),
  [pedidos]);

  // Identifica o PRÓXIMO pedido (usando vizinho mais próximo da posição atual)
  const proximoPedido = useMemo(() => {
    if (pedidosEmRota.length === 0 || !posicaoAtual) return null;
    
    let minDistance = Infinity;
    let closest = pedidosEmRota[0];

    pedidosEmRota.forEach(p => {
      const d = calcularDistancia(posicaoAtual.lat, posicaoAtual.lng, p.latitude!, p.longitude!);
      if (d < minDistance) {
        minDistance = d;
        closest = p;
      }
    });

    return closest;
  }, [pedidosEmRota, posicaoAtual]);

  // Calcular pontos de parada ordenados (Greedy por linha reta como base)
  const waypoints = useMemo(() => {
    if (pedidosEmRota.length < 1) return [];

    const points: { lat: number; lng: number }[] = [];
    if (posicaoAtual) points.push({ lat: posicaoAtual.lat, lng: posicaoAtual.lng });

    let currentLat = posicaoAtual?.lat || pedidosEmRota[0].latitude!;
    let currentLng = posicaoAtual?.lng || pedidosEmRota[0].longitude!;
    const items = [...pedidosEmRota];
    
    while (items.length > 0) {
      let closestIdx = 0;
      let minDistance = Infinity;
      for (let i = 0; i < items.length; i++) {
        const dist = calcularDistancia(currentLat, currentLng, items[i].latitude!, items[i].longitude!);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }
      }
      const [next] = items.splice(closestIdx, 1);
      points.push({ lat: next.latitude!, lng: next.longitude! });
      currentLat = next.latitude!;
      currentLng = next.longitude!;
    }
    
    return points;
  }, [pedidosEmRota, posicaoAtual]);

  // Efeito para buscar a rota real nas ruas
  useEffect(() => {
    if (waypoints.length < 2) {
      setRoadPath([]);
      return;
    }

    let isMounted = true;
    const fetchRoute = async () => {
      setIsRouting(true);
      const path = await getRoadRoute(waypoints);
      if (isMounted) {
        setRoadPath(path.map(p => [p.lat, p.lng]));
        setIsRouting(false);
      }
    };

    fetchRoute();
    return () => { isMounted = false; };
  }, [waypoints]);

  return (
    <div 
      className="w-full h-full relative" 
      onMouseDown={() => setAutoFocus(false)}
      onTouchStart={() => setAutoFocus(false)}
    >
      <MapContainer
        center={defaultCenter}
        zoom={14}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController 
          posicaoAtual={posicaoAtual} 
          proximoPedido={proximoPedido} 
          shouldFocus={autoFocus} 
        />

        {posicaoAtual && (
          <Marker position={[posicaoAtual.lat, posicaoAtual.lng]} icon={icons.USER}>
            <Popup>Minha Localização</Popup>
          </Marker>
        )}

        {pedidosEmRota.map(p => (
          <Marker 
            key={p.id} 
            position={[p.latitude!, p.longitude!]} 
            icon={icons.EM_ENTREGA}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold text-sm mb-1">{p.nome}</p>
                <p className="text-[10px] text-gray-500 mb-2">{p.endereco}</p>
                <button 
                  onClick={() => onSelectPedido(p)}
                  className="w-full py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg"
                >
                  Ver Detalhes
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {roadPath.length > 1 && (
          <Polyline 
            positions={roadPath} 
            color="#3b82f6" 
            weight={5} 
            opacity={0.8}
            dashArray="1, 12"
            lineCap="round"
          />
        )}
      </MapContainer>

      {isRouting && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[40] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-blue-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Calculando Trajeto Real...</span>
        </div>
      )}

      <div className="absolute bottom-6 right-6 z-[40] flex flex-col gap-2">
        <button
          onClick={() => setAutoFocus(true)}
          className={cn(
            "p-4 rounded-2xl shadow-xl border flex items-center justify-center transition-all active:scale-95",
            autoFocus 
              ? "bg-blue-600 border-blue-500 text-white" 
              : "bg-white/90 backdrop-blur border-gray-100 text-gray-600 hover:bg-white"
          )}
        >
          <Crosshair className={cn("w-6 h-6", autoFocus && "animate-pulse")} />
        </button>

        <div className="bg-white/90 backdrop-blur p-3 rounded-2xl shadow-lg border border-gray-100 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-[10px] font-bold text-gray-600">Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-[10px] font-bold text-gray-600">Em Rota</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold text-gray-600">Entregue</span>
          </div>
        </div>
      </div>
    </div>
  );
}
