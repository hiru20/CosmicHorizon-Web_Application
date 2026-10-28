import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Plus, Minus, CheckCircle2, RotateCcw, X, Target } from 'lucide-react';
import Button from '../common/Button';
import { computeTerminator } from './terminator';

const TILE_LAYERS = {
  satellite: {
    name: 'Satellite Earth',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, NASA, USGS, NOAA',
  },
  osmStandard: {
    name: 'World Map',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  topo: {
    name: 'Terrain Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; US National Park Service',
  },
};


const SIGNAL = '#FF5A1F';

// Haversine great-circle distance in km between two [lat, lng] coordinates
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const fmtCoord = (v, pos, neg) => (typeof v === 'number' ? `${Math.abs(v).toFixed(2)}° ${v > 0 ? pos : neg}` : '—');

const MapControlButton = ({ label, onClick, active = false, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    aria-pressed={active || undefined}
    className={`h-9 min-w-9 px-2.5 flex items-center justify-center gap-2 border bg-ink font-mono text-[0.625rem] uppercase tracking-label transition-colors ${
      active ? 'border-signal-line text-signal' : 'border-line-strong text-fg-muted hover:text-fg hover:border-line-bright'
    }`}
  >
    {children}
  </button>
);

const ISSMap = ({ telemetry, trajectory = [] }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const guessMarkerRef = useRef(null);
  const guessLineRef = useRef(null);
  // Presentation-only layers
  const trailFadeRef = useRef(null);
  const terminatorRef = useRef(null);

  const [selectedTile, setSelectedTile] = useState('satellite');
  const [autoCenter, setAutoCenter] = useState(true);

  // "Guess the ISS Location" Mini-Game State
  const [gameMode, setGameMode] = useState(false); // true when mini-game is active
  const [guessCoords, setGuessCoords] = useState(null); // { lat, lng }
  const [gameResult, setGameResult] = useState(null); // { distanceKm, score, rank, actualLat, actualLng }
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('cosmic_iss_highscore') || 0));

  // Keep latest gameMode & gameResult in ref for Leaflet map click listener
  const gameStateRef = useRef({ gameMode: false, revealed: false });
  useEffect(() => {
    gameStateRef.current = { gameMode, revealed: !!gameResult };
  }, [gameMode, gameResult]);

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

    const activeTile = TILE_LAYERS[selectedTile];
    const tileLayer = L.tileLayer(activeTile.url, {
      attribution: activeTile.attribution,
      maxZoom: 19,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // ISS marker: signal-orange point with a thin pulsing ring
    const issIcon = L.divIcon({
      className: 'custom-iss-icon',
      html: `
        <div class="relative w-9 h-9 flex items-center justify-center">
          <span class="absolute w-3 h-3 rounded-full border border-signal animate-pulse-dot"></span>
          <span class="absolute w-7 h-7 rounded-full border border-signal/40"></span>
          <span class="relative w-2.5 h-2.5 bg-signal"></span>
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

    // Base ground track: faint hairline under the fading signal trail
    const polyline = L.polyline(trajectory, {
      color: '#555555',
      weight: 1,
      opacity: 0.7,
      dashArray: '2, 6',
    }).addTo(map);

    // Map click handler for "Guess the ISS Location"
    map.on('click', (e) => {
      if (!gameStateRef.current.gameMode || gameStateRef.current.revealed) return;
      const { lat, lng } = e.latlng;
      const wrappedLng = ((((lng + 180) % 360) + 360) % 360) - 180;
      const roundedLat = Number(lat.toFixed(4));
      const roundedLng = Number(wrappedLng.toFixed(4));

      setGuessCoords({ lat: roundedLat, lng: roundedLng });

      const guessIcon = L.divIcon({
        className: 'custom-guess-icon',
        html: `
          <div class="relative w-8 h-8 flex items-center justify-center">
            <span class="absolute inset-x-0 top-1/2 h-px bg-fg"></span>
            <span class="absolute inset-y-0 left-1/2 w-px bg-fg"></span>
            <span class="relative w-3 h-3 border border-fg bg-ink"></span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (guessMarkerRef.current) {
        guessMarkerRef.current.setLatLng([roundedLat, roundedLng]);
      } else {
        guessMarkerRef.current = L.marker([roundedLat, roundedLng], { icon: guessIcon })
          .addTo(map)
          .bindPopup(
            `<div style="color:#0f172a;font-size:12px;font-weight:bold;">Your Guess<br/>Lat: ${roundedLat}° | Lng: ${roundedLng}°</div>`
          );
      }
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
    polylineRef.current = polyline;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch tile layer when user clicks map style switcher
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const activeTile = TILE_LAYERS[selectedTile];
    tileLayerRef.current.setUrl(activeTile.url);
  }, [selectedTile]);

  // Show/hide actual ISS marker depending on whether user is mid-guess
  useEffect(() => {
    if (!markerRef.current || !polylineRef.current) return;
    const hideIss = gameMode && !gameResult;
    markerRef.current.setOpacity(hideIss ? 0 : 1);
    polylineRef.current.setStyle({ opacity: hideIss ? 0 : 0.7 });
  }, [gameMode, gameResult]);

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

    if (autoCenter && !gameMode) {
      mapInstanceRef.current.panTo(newPos, { animate: true, duration: 1 });
    }

    if (polylineRef.current && trajectory.length > 0) {
      polylineRef.current.setLatLngs(trajectory);
    }
  }, [telemetry, trajectory, autoCenter, gameMode]);

  // Presentation: day/night terminator, refreshed every minute from the clock
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return undefined;
    const polygon = L.polygon(computeTerminator(new Date()), {
      stroke: false,
      fillColor: '#000000',
      fillOpacity: 0.38,
      interactive: false,
    }).addTo(map);
    terminatorRef.current = polygon;
    const id = setInterval(() => polygon.setLatLngs(computeTerminator(new Date())), 60000);
    return () => {
      clearInterval(id);
      polygon.remove();
      terminatorRef.current = null;
    };
  }, []);

  // Presentation: fading signal-orange trail (newest segment brightest); hidden mid-guess
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (!trailFadeRef.current || !map.hasLayer(trailFadeRef.current)) trailFadeRef.current = L.layerGroup().addTo(map);
    const group = trailFadeRef.current;
    group.clearLayers();
    if (gameMode && !gameResult) return;
    const n = trajectory.length;
    for (let i = 1; i < n; i += 1) {
      const [lat1, lng1] = trajectory[i - 1];
      const [lat2, lng2] = trajectory[i];
      if (Math.abs(lng2 - lng1) > 180) continue; // skip antimeridian wrap
      const t = i / (n - 1);
      L.polyline(
        [
          [lat1, lng1],
          [lat2, lng2],
        ],
        { color: SIGNAL, weight: 2, opacity: 0.08 + 0.87 * t * t, interactive: false, lineCap: 'butt' }
      ).addTo(group);
    }
  }, [trajectory, gameMode, gameResult]);

  // Center map manually
  const handleRecenter = () => {
    if (mapInstanceRef.current && telemetry) {
      mapInstanceRef.current.setView([telemetry.latitude, telemetry.longitude], 4, {
        animate: true,
      });
      setAutoCenter(true);
    }
  };

  // Start or reset Guess the ISS Location game
  const startGuessGame = () => {
    setGameMode(true);
    setGuessCoords(null);
    setGameResult(null);
    setAutoCenter(false);

    if (guessMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(guessMarkerRef.current);
      guessMarkerRef.current = null;
    }
    if (guessLineRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(guessLineRef.current);
      guessLineRef.current = null;
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([15, 0], 2, { animate: true });
    }
  };

  // Exit Guess Game and return to live tracking
  const exitGuessGame = () => {
    setGameMode(false);
    setGuessCoords(null);
    setGameResult(null);
    setAutoCenter(true);

    if (guessMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(guessMarkerRef.current);
      guessMarkerRef.current = null;
    }
    if (guessLineRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(guessLineRef.current);
      guessLineRef.current = null;
    }
    if (mapInstanceRef.current && telemetry) {
      mapInstanceRef.current.setView([telemetry.latitude, telemetry.longitude], 3, { animate: true });
    }
  };

  // Check user's guess against actual ISS location
  const handleCheckGuess = () => {
    if (!guessCoords || !telemetry || !mapInstanceRef.current) return;

    const actualLat = Number(telemetry.latitude.toFixed(4));
    const actualLng = Number(telemetry.longitude.toFixed(4));
    const distanceKm = calculateDistanceKm(guessCoords.lat, guessCoords.lng, actualLat, actualLng);

    // Max distance on Earth is ~20,000 km; award 0 - 1,000 pts
    const score = Math.max(0, Math.round(1000 * (1 - distanceKm / 12000)));
    let rank = 'Space Cadet';
    if (distanceKm < 800) rank = 'Orbital Sniper';
    else if (distanceKm < 2500) rank = 'Flight Director';
    else if (distanceKm < 5500) rank = 'Star Navigator';

    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('cosmic_iss_highscore', String(score));
    }

    setGameResult({ distanceKm, score, rank, actualLat, actualLng });

    // Draw line connecting Guess Pin and Actual ISS Position
    const points = [
      [guessCoords.lat, guessCoords.lng],
      [actualLat, actualLng],
    ];
    if (guessLineRef.current) {
      guessLineRef.current.setLatLngs(points);
    } else {
      guessLineRef.current = L.polyline(points, {
        color: '#EDEDED',
        weight: 1,
        dashArray: '4, 6',
      }).addTo(mapInstanceRef.current);
    }

    mapInstanceRef.current.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 4 });
  };

  const issHidden = gameMode && !gameResult;

  return (
    <div className="space-y-px">
      {/* Map Container */}
      <div className={`relative w-full h-[420px] sm:h-[560px] border border-line overflow-hidden`}>
        <div ref={mapContainerRef} className="w-full h-full bg-ink cursor-crosshair" />

        {/* Crosshair + coordinate grid overlay (hidden mid-guess so it can't give the answer away) */}
        <div className="pointer-events-none absolute inset-0 z-[400]" aria-hidden="true">
          {/* edge ticks */}
          <div className="absolute inset-x-0 top-0 h-2 flex justify-between px-px">
            {Array.from({ length: 25 }).map((_, i) => (
              <span key={i} className={`w-px ${i % 4 === 0 ? 'h-2 bg-fg-faint' : 'h-1 bg-line-bright'}`} />
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-2 flex flex-col justify-between py-px">
            {Array.from({ length: 17 }).map((_, i) => (
              <span key={i} className={`h-px ${i % 4 === 0 ? 'w-2 bg-fg-faint' : 'w-1 bg-line-bright'}`} />
            ))}
          </div>
          {!issHidden && (
            <>
              <span className="absolute left-0 right-0 top-1/2 h-px bg-fg/[0.08]" />
              <span className="absolute top-0 bottom-0 left-1/2 w-px bg-fg/[0.08]" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border border-fg/[0.12] rounded-full" />
              {autoCenter && telemetry && (
                <>
                  <span className="absolute left-3 top-1/2 -translate-y-[calc(100%+4px)] font-mono text-[0.625rem] text-fg-muted bg-ink/70 px-1">
                    LAT {fmtCoord(telemetry.latitude, 'N', 'S')}
                  </span>
                  <span className="absolute top-3 left-1/2 translate-x-1.5 font-mono text-[0.625rem] text-fg-muted bg-ink/70 px-1">
                    LON {fmtCoord(telemetry.longitude, 'E', 'W')}
                  </span>
                </>
              )}
            </>
          )}
        </div>

        {/* Map Style Switcher (Top Left) */}
        <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center bg-ink border border-line-strong" role="group" aria-label="Map tiles">
          {Object.entries(TILE_LAYERS).map(([key, layer]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedTile(key)}
              aria-pressed={selectedTile === key}
              className={`h-8 px-2.5 font-mono text-[0.625rem] uppercase tracking-label transition-colors ${
                selectedTile === key ? 'bg-fg text-black' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {layer.name}
            </button>
          ))}
        </div>

        {/* Floating Map Controls */}
        <div className="absolute top-4 right-4 z-[400] flex flex-col items-end gap-1">
          {!gameMode && (
            <MapControlButton label="Recenter and follow ISS" onClick={handleRecenter} active={autoCenter}>
              <Crosshair className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
              <span>Follow</span>
            </MapControlButton>
          )}
          <MapControlButton
            label="Zoom in"
            onClick={() => {
              if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
            }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
          </MapControlButton>
          <MapControlButton
            label="Zoom out"
            onClick={() => {
              if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
            }}
          >
            <Minus className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
          </MapControlButton>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-6 left-4 z-[400] bg-ink/85 border border-line px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.625rem] uppercase tracking-label text-fg-muted">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-signal" aria-hidden="true" />
            ISS
          </span>
          <span className="flex items-center gap-2">
            <span className="w-5 h-px bg-gradient-to-r from-transparent to-signal" aria-hidden="true" />
            Recent path
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-2 bg-ink border border-line-bright" aria-hidden="true" />
            Night
          </span>
          {gameMode && (
            <span className="flex items-center gap-2 text-fg">
              <span className="w-2 h-2 border border-fg" aria-hidden="true" />
              Your guess
            </span>
          )}
        </div>
      </div>

      {/* Guess the ISS Location: exercise panel */}
      <section aria-label="Guess the ISS location game" className="border border-line surface">
        <div className="grid grid-cols-12 gap-6 p-5 sm:p-6 items-center">
          <div className="col-span-12 md:col-span-7 space-y-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="label text-signal flex items-center gap-2">
                <Target className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                Exercise — Locate the station
              </span>
              {highScore > 0 && <span className="label">Best {highScore} pts</span>}
            </div>
            <p className="text-sm text-fg-muted leading-relaxed" aria-live="polite">
              {!gameMode
                ? 'Hide the tracker marker, click anywhere on the world map to guess where the ISS is orbiting right now, and score points!'
                : !gameResult
                ? guessCoords
                  ? `Pin placed at (${guessCoords.lat}°, ${guessCoords.lng}°). Click "Check My Guess" to reveal the ISS!`
                  : 'ISS hidden! Click any spot on the world map below to place your guess pin.'
                : `You were ${gameResult.distanceKm.toLocaleString()} km away from the ISS!`}
            </p>
          </div>

          <div className="col-span-12 md:col-span-5 flex flex-wrap md:justify-end items-center gap-2">
            {!gameMode ? (
              <Button variant="secondary" size="sm" icon={Target} onClick={startGuessGame}>
                Play Guess the ISS
              </Button>
            ) : (
              <>
                {!gameResult && (
                  <Button size="sm" icon={CheckCircle2} disabled={!guessCoords} onClick={handleCheckGuess}>
                    Check My Guess
                  </Button>
                )}
                <Button variant="secondary" size="sm" icon={RotateCcw} onClick={startGuessGame}>
                  {gameResult ? 'Play Again' : 'Reset Pin'}
                </Button>
                <Button variant="ghost" size="sm" icon={X} onClick={exitGuessGame}>
                  Exit Game
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Game Score Results */}
        {gameResult && (
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border-t border-line animate-fade-in">
            <div className="surface p-5">
              <dt className="label">Your guess</dt>
              <dd className="mt-2 telemetry text-sm text-fg">
                {guessCoords.lat}°, {guessCoords.lng}°
              </dd>
            </div>
            <div className="surface p-5">
              <dt className="label">Actual ISS position</dt>
              <dd className="mt-2 telemetry text-sm text-fg">
                {gameResult.actualLat}°, {gameResult.actualLng}°
              </dd>
            </div>
            <div className="surface p-5">
              <dt className="label">Distance</dt>
              <dd className="mt-2 telemetry text-2xl text-fg">
                {gameResult.distanceKm.toLocaleString()}
                <span className="ml-1 text-[0.6875rem] text-fg-muted">KM</span>
              </dd>
            </div>
            <div className="surface p-5">
              <dt className="label">Score &amp; rank</dt>
              <dd className="mt-2 telemetry text-2xl text-signal">
                {gameResult.score}
                <span className="ml-1 text-[0.6875rem] text-fg-muted">PTS</span>
              </dd>
              <dd className="mt-1 font-mono text-[0.6875rem] uppercase tracking-label text-fg">{gameResult.rank}</dd>
            </div>
          </dl>
        )}
      </section>
    </div>
  );
};

export default ISSMap;
