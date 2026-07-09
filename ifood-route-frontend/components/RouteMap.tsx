'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { DivIcon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteStop } from '@/lib/api';

interface RouteMapProps {
  stops: RouteStop[];
}

function markerIcon(label: string, isStore: boolean) {
  return new DivIcon({
    className: '',
    html: `<div class="route-marker ${isStore ? 'route-marker--store' : ''}">${label}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

/**
 * Componente invisível (Subcomponente Leaflet) responsável por forçar
 * o recálculo do grid de tiles do mapa quando o container HTML for 
 * redimensionado dinamicamente (ex: expansões de janela e menu).
 */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    const container = map.getContainer();
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [map]);
  return null;
}

export function RouteMap({ stops }: RouteMapProps) {
  if (stops.length === 0) {
    return null;
  }

  const center: LatLngExpression = [stops[0].latitude, stops[0].longitude];
  const path: LatLngExpression[] = stops.map((s) => [s.latitude, s.longitude]);

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      style={{ height: '100%', width: '100%', background: '#11141C' }}
    >
      <MapResizer />
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Polyline
        positions={path}
        pathOptions={{ color: '#F2A93B', weight: 4, opacity: 0.85 }}
      />

      {stops.map((stop, index) => {
        const isStore = index === 0;
        return (
          <Marker
            key={`${stop.label}-${index}`}
            position={[stop.latitude, stop.longitude]}
            icon={markerIcon(isStore ? '🏠' : String(index), isStore)}
          >
            <Popup>
              <span className="font-medium">
                {isStore ? 'Loja (partida)' : `Parada ${index} — ${stop.label}`}
              </span>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
