import { CoordenadasCache } from '../types';

const CACHE_KEY = 'entregas_geo_cache';

function getCache(): CoordenadasCache {
  const data = localStorage.getItem(CACHE_KEY);
  return data ? JSON.parse(data) : {};
}

function setCache(cache: CoordenadasCache) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export async function geocodificarEndereco(endereco: string): Promise<{ lat: number; lng: number } | null> {
  const cache = getCache();
  
  if (cache[endereco]) {
    return cache[endereco];
  }

  try {
    // Nominatim requer um delay entre requisições e um User-Agent
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'pt-BR',
      }
    });

    if (!response.ok) throw new Error('Falha na geocodificação');

    const data = await response.json();

    if (data && data.length > 0) {
      const coords = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };

      // Atualizar cache
      const updatedCache = { ...cache, [endereco]: coords };
      setCache(updatedCache);

      return coords;
    }
  } catch (error) {
    console.error('Erro ao geocodificar:', endereco, error);
  }

  return null;
}

export function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
