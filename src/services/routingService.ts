/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface LatLng {
  lat: number;
  lng: number;
}

export async function getRoadRoute(points: LatLng[]): Promise<LatLng[]> {
  if (points.length < 2) return points;

  // Formato: {longitude},{latitude};{longitude},{latitude}
  const coordinates = points.map(p => `${p.lng},${p.lat}`).join(';');
  
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // OSRM retorna [lng, lat] em cada ponto do GeoJSON
      return route.geometry.coordinates.map((coord: [number, number]) => ({
        lat: coord[1],
        lng: coord[0]
      }));
    }
  } catch (error) {
    console.error('Falha ao buscar rota OSRM:', error);
  }

  // Fallback: Retorna os pontos originais (linha reta)
  return points;
}

export async function getRoadDistance(origin: LatLng, dest: LatLng): Promise<number> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=false`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      return data.routes[0].distance / 1000; // Converte metros para km
    }
  } catch (error) {
    // Fallback
  }
  
  return -1;
}

export async function getDistanceMatrix(points: LatLng[]): Promise<number[][] | null> {
  if (points.length < 2) return null;

  const coordinates = points.map(p => `${p.lng},${p.lat}`).join(';');
  try {
    const url = `https://router.project-osrm.org/table/v1/driving/${coordinates}?annotations=distance`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.code === 'Ok' && data.distances) {
      return data.distances.map(row => row.map(d => d / 1000)); // km
    }
  } catch (error) {
    console.error('Falha ao buscar matriz OSRM:', error);
  }
  return null;
}
