import { useEffect, useRef } from 'react';
import { getGoogleMapsDirectionsUrl, getOsmDirectionsUrl, formatCoordinates } from '../utils/maps';
import { L } from '../utils/leafletSetup';

interface DeliveryMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  showRouteLinks?: boolean;
}

export function DeliveryMap({
  latitude,
  longitude,
  title = 'Punto de entrega',
  showRouteLinks = true,
}: DeliveryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 16,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    L.marker([latitude, longitude]).addTo(map);

    return () => {
      map.remove();
    };
  }, [latitude, longitude]);

  return (
    <div className="delivery-map">
      <p className="label">{title}</p>
      <div
        ref={containerRef}
        className="delivery-map__canvas"
        role="img"
        aria-label={`Mapa con la ubicación de entrega en ${formatCoordinates(latitude, longitude)}`}
      />
      <p className="delivery-map__coords">{formatCoordinates(latitude, longitude)}</p>
      {showRouteLinks && (
        <div className="delivery-map__links">
          <a
            href={getGoogleMapsDirectionsUrl(latitude, longitude)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--ghost btn--sm"
          >
            Abrir ruta en Google Maps
          </a>
          <a
            href={getOsmDirectionsUrl(latitude, longitude)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--ghost btn--sm"
          >
            Abrir ruta en OpenStreetMap
          </a>
        </div>
      )}
    </div>
  );
}
