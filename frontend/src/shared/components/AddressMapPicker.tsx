import { useEffect, useRef, useState } from 'react';
import { geocodeAddress } from '../utils/geocoding';
import { formatCoordinates } from '../utils/maps';
import { L } from '../utils/leafletSetup';

const DEFAULT_CENTER = { latitude: 23.1136, longitude: -82.3666 };

interface AddressMapPickerProps {
  latitude: number | null;
  longitude: number | null;
  addressQuery: string;
  onChange: (coords: { latitude: number; longitude: number }) => void;
}

export function AddressMapPicker({
  latitude,
  longitude,
  addressQuery,
  onChange,
}: AddressMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');

  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialLat = latitude ?? DEFAULT_CENTER.latitude;
    const initialLng = longitude ?? DEFAULT_CENTER.longitude;

    const map = L.map(containerRef.current, {
      center: [initialLat, initialLng],
      zoom: latitude != null ? 16 : 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);

    const emitCoords = (lat: number, lng: number) => {
      onChangeRef.current({ latitude: lat, longitude: lng });
    };

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      emitCoords(pos.lat, pos.lng);
    });

    map.on('click', (event) => {
      marker.setLatLng(event.latlng);
      emitCoords(event.latlng.lat, event.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [latitude, longitude]);

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    const current = marker.getLatLng();
    if (
      Math.abs(current.lat - latitude) < 0.00001 &&
      Math.abs(current.lng - longitude) < 0.00001
    ) {
      return;
    }

    marker.setLatLng([latitude, longitude]);
    map.setView([latitude, longitude], Math.max(map.getZoom(), 15));
  }, [latitude, longitude]);

  const handleGeocode = async () => {
    setGeocoding(true);
    setGeocodeError('');
    try {
      const result = await geocodeAddress(addressQuery);
      if (!result) {
        setGeocodeError('No encontramos esa dirección. Ajusta el pin en el mapa.');
        return;
      }
      onChange(result);
    } catch {
      setGeocodeError('Error al buscar la dirección. Intenta de nuevo.');
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <div className="address-map-picker">
      <div className="address-map-picker__header">
        <div>
          <p className="label">Ubicación de entrega</p>
          <p className="address-map-picker__hint">
            Haz clic en el mapa o arrastra el marcador hasta tu puerta.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => void handleGeocode()}
          disabled={geocoding || addressQuery.trim().length < 5}
        >
          {geocoding ? 'Buscando...' : 'Ubicar dirección'}
        </button>
      </div>

      {geocodeError && (
        <p className="error-msg" role="alert">
          {geocodeError}
        </p>
      )}

      <div
        ref={containerRef}
        className="address-map-picker__map"
        role="application"
        aria-label="Mapa para seleccionar la ubicación de entrega"
      />

      {latitude != null && longitude != null ? (
        <p className="address-map-picker__coords" aria-live="polite">
          Coordenadas: {formatCoordinates(latitude, longitude)}
        </p>
      ) : (
        <p className="address-map-picker__coords address-map-picker__coords--empty">
          Selecciona un punto en el mapa para confirmar la entrega.
        </p>
      )}
    </div>
  );
}
