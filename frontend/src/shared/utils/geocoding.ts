export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(query: string): Promise<GeoCoordinates | null> {
  const trimmed = query.trim();
  if (trimmed.length < 5) return null;

  const params = new URLSearchParams({
    q: trimmed,
    format: 'json',
    limit: '1',
    countrycodes: 'es',
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'es',
      'User-Agent': 'qtb-vinyl-shop/1.0 (checkout geocoding)',
    },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { lat: string; lon: string }[];
  if (!data.length) return null;

  return {
    latitude: Number.parseFloat(data[0].lat),
    longitude: Number.parseFloat(data[0].lon),
  };
}
