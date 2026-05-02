import { CoordenadasCache } from '../types';

const CACHE_KEY = 'entregas_geo_cache';

function getCache(): CoordenadasCache {
  const data = localStorage.getItem(CACHE_KEY);
  return data ? JSON.parse(data) : {};
}

function setCache(cache: CoordenadasCache) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export async function geocodificarEndereco(enderecoOriginal: string): Promise<{ lat: number; lng: number } | null> {
  const cache = getCache();
  
  if (cache[enderecoOriginal]) {
    return cache[enderecoOriginal];
  }

  // 1. Extração do Endereço Essencial (Rua + Número)
  const extrairEnderecoPuro = (txt: string) => {
    // 1. Pega apenas o que vem antes da primeira vírgula ou traço (geralmente Rua e Número)
    let base = txt.split(/[,\-]/)[0].trim();
    
    // 2. Limpeza de termos de complemento que poluem a busca
    base = base
      .replace(/(?:apto|apartamento|sala|bloco|bl|fundo|casa|sobrado|lote|lt|qd|quadra|esquina|km|sala|fundos|loja)\.?\s*\d*[a-z0-9]*/gi, '')
      .replace(/[.\(\)]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return base;
  };

  const enderecoPuro = extrairEnderecoPuro(enderecoOriginal);
  const anchorLat = -26.2268;
  const anchorLng = -52.6713;
  const cidadeEstado = "Pato Branco, PR";

  // Motor 1: Photon (Extremamente tolerante a erros de digitação)
  const buscarPhoton = async (q: string) => {
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=1&lat=${anchorLat}&lon=${anchorLng}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data?.features?.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        return { lat, lng };
      }
      return null;
    } catch { return null; }
  };

  // Motor 2: Nominatim (Base de dados oficial do OSM)
  const buscarNominatim = async (q: string) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=br`;
      const response = await fetch(url, { 
        headers: { 'User-Agent': 'Logistica_PatoBranco_v7', 'Accept-Language': 'pt-BR' } 
      });
      const data = await response.json();
      if (data?.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch { return null; }
  };

  const tentarTodos = async (q: string) => {
    let res = await buscarPhoton(q);
    if (!res) res = await buscarNominatim(q);
    return res;
  };

  try {
    console.log(`Geocodificando: "${enderecoOriginal}" -> Base: "${enderecoPuro}"`);

    // Tenta 1: "Rua Nome 123, Pato Branco, PR"
    let coords = await tentarTodos(`${enderecoPuro}, ${cidadeEstado}`);

    // Tenta 2: Se falhar, tenta apenas a rua (remove números do final) - para pegar o meio da rua
    if (!coords) {
      const soRua = enderecoPuro.replace(/\d+$/, '').trim();
      if (soRua !== enderecoPuro && soRua.length > 3) {
        coords = await tentarTodos(`${soRua}, ${cidadeEstado}`);
      }
    }

    // Tenta 3: Se ainda falhar, tenta o original sanitizado (caso o usuário tenha colocado a cidade de forma estranha)
    if (!coords) {
      coords = await tentarTodos(`${enderecoPuro}`);
    }

    // Fallback: Se NADA der certo, coloca no centro de Pato Branco para aparacer na lista/mapa
    if (!coords) {
      console.warn(`GPS não localizou: ${enderecoOriginal}. Usando centro da cidade.`);
      coords = { lat: anchorLat, lng: anchorLng };
    }

    if (coords) {
      const updatedCache = { ...cache, [enderecoOriginal]: coords };
      setCache(updatedCache);
      return coords;
    }
  } catch (error) {
    console.error('Falha crítica no GPS:', error);
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
