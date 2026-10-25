import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Layers, ZoomIn, ZoomOut } from 'lucide-react';

const TILE_LAYERS = {
  cartoDark: {
    name: 'Deep Space Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  osmStandard: {
    name: 'Standard Geographic',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
};

const ISSMap = ({ telemetry, trajectory = [] }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const [selectedTile, setSelectedTile] = useState('cartoDark');
  const [autoCenter, setAutoCenter] = useState(true);

  // Initialize Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = telemetry?.latitude || 0;
    const initialLng = telemetry?.longitude || 0;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 3,
      minZoom: 2,
      maxZoom: 9,
      zoomControl: false,
      worldCopyJump: true,
    });

    // Add Carto Dark Layer
    const activeTile = TILE_LAYERS[selectedTile];
    const tileLayer = L.tileLayer(activeTile.url, {
      attribution: activeTile.attribution,
      maxZoom: 19,
    }).addTo(map);

    // Custom Glowing ISS DivIcon
    const issIcon = L.divIcon({
      className: 'custom-iss-icon',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(6, 182, 212, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: rgba(56, 189, 248, 0.4); border: 2px solid #22d3ee; box-shadow: 0 0 15px #06b6d4;"></div>
          <svg style="width: 18px; height: 18px; color: #ffffff; z-index: 10;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" fill="#ffffff"/>
            <path d="M4 12h3M17 12h3M12 4v3M12 17v3M7.5 7.5l2 2M14.5 14.5l2 2M7.5 16.5l2-2M14.5 9.5l2-2"/>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker([initialLat, initialLng], { icon: issIcon }).addTo(map);
    marker.bindPopup(
      `<div style="color: #0f172a; font-size: 12px; font-weight: bold;">
        ISS Telemetry Marker<br/>
        Lat: ${initialLat}° | Lng: ${initialLng}°
      </div>`
    );

    // Polyline trajectory
    const polyline = L.polyline(trajectory, {
      color: '#38bdf8',
      weight: 2.5,
      opacity: 0.7,
      dashArray: '5, 8',
    }).addTo(map);

    mapInstanceRef.current = map;
    markerRef.current = marker;
    polylineRef.current = polyline;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update marker position and polyline when telemetry changes
  useEffect(() => {
    if (!telemetry || !markerRef.current || !mapInstanceRef.current) return;

    const newPos = [telemetry.latitude, telemetry.longitude];
    markerRef.current.setLatLng(newPos);

    markerRef.current.setPopupContent(`
      <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; line-height: 1.4;">
        <strong style="color: #0284c7;">International Space Station</strong><br/>
        <strong>Lat:</strong> ${telemetry.latitude}°<br/>
        <strong>Lng:</strong> ${telemetry.longitude}°<br/>
        <strong>Altitude:</strong> ${telemetry.altitude} km<br/>
        <strong>Velocity:</strong> ${Math.round(telemetry.velocity).toLocaleString()} km/h
      </div>
    `);

    if (autoCenter) {
      mapInstanceRef.current.panTo(newPos, { animate: true, duration: 1 });
    }

    // Update trajectory polyline
    if (polylineRef.current && trajectory.length > 0) {
      polylineRef.current.setLatLngs(trajectory);
    }
  }, [telemetry, trajectory, autoCenter]);

  // Center map manually
  const handleRecenter = () => {
    if (mapInstanceRef.current && telemetry) {
      mapInstanceRef.current.setView([telemetry.latitude, telemetry.longitude], 4, {
        animate: true,
      });
      setAutoCenter(true);
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Map Target Container */}
      <div ref={mapContainerRef} className="w-full h-full bg-space-darkest" />

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shadow-lg backdrop-blur-md border transition ${
            autoCenter
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-glow-cyan'
              : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white'
          }`}
          title="Recenter and follow ISS"
        >
          <Crosshair className="w-4 h-4" />
          <span>Follow ISS</span>
        </button>

        <button
          onClick={() => {
            if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
          }}
          className="p-2 rounded-xl bg-slate-900/80 text-slate-300 border border-slate-700 hover:text-white shadow-lg backdrop-blur-md transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
          }}
          className="p-2 rounded-xl bg-slate-900/80 text-slate-300 border border-slate-700 hover:text-white shadow-lg backdrop-blur-md transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] glass-panel px-3.5 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-glow-cyan"></span>
          <span className="text-slate-200 font-medium">ISS Position</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 border-t border-dashed border-sky-400"></span>
          <span>Recent Orbital Path</span>
        </div>
      </div>
    </div>
  );
};

export default ISSMap;
