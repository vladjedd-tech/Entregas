import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Pedido } from '../types';
import { calcularDistancia } from '../services/geoService';

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

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

export function MapView({ pedidos, posicaoAtual, onSelectPedido }: MapViewProps) {
  const defaultCenter: [number, number] = [-26.2238, -52.6719]; // Pato Branco center

  const pedidosGeocodificados = useMemo(() => 
    pedidos.filter(p => p.latitude && p.longitude && p.status === 'EM_ENTREGA'),
  [pedidos]);

  // Calcular rota azul (Polyline)
  const rotaCoords = useMemo(() => {
    const emEntrega = pedidos.filter(p => p.status === 'EM_ENTREGA' && p.latitude && p.longitude);
    if (emEntrega.length < 1) return [];

    const coords: [number, number][] = [];
    if (posicaoAtual) coords.push([posicaoAtual.lat, posicaoAtual.lng]);

    // Ordenar similar ao RouteView
    let currentLat = posicaoAtual?.lat || emEntrega[0].latitude!;
    let currentLng = posicaoAtual?.lng || emEntrega[0].longitude!;
    const items = [...emEntrega];
    
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
      coords.push([next.latitude!, next.longitude!]);
      currentLat = next.latitude!;
      currentLng = next.longitude!;
    }
    
    return coords;
  }, [pedidos, posicaoAtual]);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={posicaoAtual ? [posicaoAtual.lat, posicaoAtual.lng] : defaultCenter}
        zoom={14}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizer />

        {posicaoAtual && (
          <Marker position={[posicaoAtual.lat, posicaoAtual.lng]} icon={icons.USER}>
            <Popup>Minha Localização</Popup>
          </Marker>
        )}

        {pedidosGeocodificados.map(p => (
          <Marker 
            key={p.id} 
            position={[p.latitude!, p.longitude!]} 
            icon={icons[p.status]}
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

        {rotaCoords.length > 1 && (
          <Polyline 
            positions={rotaCoords} 
            color="#3b82f6" 
            weight={4} 
            opacity={0.6}
            dashArray="10, 10"
          />
        )}
      </MapContainer>

      <div className="absolute bottom-6 right-6 z-[40] flex flex-col gap-2">
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
