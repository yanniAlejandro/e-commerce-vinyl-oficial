import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../../shared/api/client';
import { DeliveryMap } from '../../shared/components/DeliveryMap';
import { Spinner } from '../../shared/components/Spinner';

interface WarehouseSettings {
  warehouse_name: string;
  warehouse_address: string;
  warehouse_latitude: number;
  warehouse_longitude: number;
}

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<WarehouseSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void (async () => {
      const data = await apiRequest<WarehouseSettings>('/admin/settings/warehouse');
      setSettings(data);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const data = await apiRequest<WarehouseSettings>('/admin/settings/warehouse', {
        method: 'PATCH',
        body: JSON.stringify(settings),
      });
      setSettings(data);
      setMessage('Almacén actualizado correctamente');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return <Spinner label="Cargando configuración..." />;

  return (
    <div className="container admin-page">
      <header className="page-header">
        <p className="label">Admin · qtb</p>
        <h1>Configuración del almacén</h1>
        <p>Ubicación fija de recogida para mensajeros en La Habana</p>
      </header>

      <div className="admin-form" ref={mapRef}>
        <label className="label" htmlFor="warehouse-name">Nombre del almacén</label>
        <input
          id="warehouse-name"
          value={settings.warehouse_name}
          onChange={(e) => setSettings({ ...settings, warehouse_name: e.target.value })}
        />

        <label className="label" htmlFor="warehouse-address">Dirección</label>
        <input
          id="warehouse-address"
          value={settings.warehouse_address}
          onChange={(e) => setSettings({ ...settings, warehouse_address: e.target.value })}
        />

        <div className="admin-form__row">
          <div>
            <label className="label" htmlFor="warehouse-lat">Latitud</label>
            <input
              id="warehouse-lat"
              type="number"
              step="any"
              value={settings.warehouse_latitude}
              onChange={(e) =>
                setSettings({ ...settings, warehouse_latitude: parseFloat(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="label" htmlFor="warehouse-lng">Longitud</label>
            <input
              id="warehouse-lng"
              type="number"
              step="any"
              value={settings.warehouse_longitude}
              onChange={(e) =>
                setSettings({ ...settings, warehouse_longitude: parseFloat(e.target.value) })
              }
            />
          </div>
        </div>

        <DeliveryMap
          latitude={settings.warehouse_latitude}
          longitude={settings.warehouse_longitude}
          title="Ubicación del almacén"
          showRouteLinks={false}
        />

        <button type="button" className="btn btn--primary" disabled={saving} onClick={() => void save()}>
          {saving ? 'Guardando...' : 'Guardar almacén'}
        </button>
        {message && <p className="admin-form__message">{message}</p>}
      </div>
    </div>
  );
}
