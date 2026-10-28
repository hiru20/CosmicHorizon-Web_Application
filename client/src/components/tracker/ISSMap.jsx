import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Layers, ZoomIn, ZoomOut, Gamepad2, CheckCircle2, RotateCcw, Trophy, MapPin, X } from 'lucide-react';

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

const ISSMap = ({ telemetry, trajectory = [] }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const guessMarkerRef = useRef(null);
  const guessLineRef = useRef(null);

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

    const polyline = L.polyline(trajectory, {
      color: '#38bdf8',
      weight: 2.5,
      opacity: 0.7,
      dashArray: '5, 8',
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
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: rgba(244, 63, 94, 0.85); border: 2.5px solid #ffffff; box-shadow: 0 0 12px #f43f5e;"></div>
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
        color: '#f59e0b',
        weight: 3,
        dashArray: '6, 6',
      }).addTo(mapInstanceRef.current);
    }

    mapInstanceRef.current.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 4 });
  };

  return (
    <div className="space-y-4">
      {/* Guess the ISS Location Mini-Game Banner */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-white">Guess the ISS Location Challenge</h3>
              {highScore > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Trophy className="w-3 h-3" /> Best: {highScore} pts
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {!gameMode
                ? 'Hide the tracker marker, click anywhere on the world map to guess where the ISS is orbiting right now, and score points!'
                : !gameResult
                ? guessCoords
                  ? `Pin placed at (${guessCoords.lat}°, ${guessCoords.lng}°). Click "Check My Guess" to reveal the ISS!`
                  : 'ISS hidden! Click any spot on the world map below to place your red guess pin.'
                : `You were ${gameResult.distanceKm.toLocaleString()} km away from the ISS!`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!gameMode ? (
            <button
              type="button"
              onClick={startGuessGame}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg hover:opacity-95 transition"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Play Guess the ISS</span>
            </button>
          ) : (
            <>
              {!gameResult && (
                <button
                  type="button"
                  disabled={!guessCoords}
                  onClick={handleCheckGuess}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 shadow-glow-cyan hover:bg-cyan-400 disabled:opacity-40 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Check My Guess</span>
                </button>
              )}
              <button
                type="button"
                onClick={startGuessGame}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{gameResult ? 'Play Again' : 'Reset Pin'}</span>
              </button>
              <button
                type="button"
                onClick={exitGuessGame}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Exit Game</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Game Score Results Card */}
      {gameResult && (
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/40 bg-amber-950/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Your Guess</span>
            <span className="font-mono font-bold text-rose-300">
              {guessCoords.lat}°, {guessCoords.lng}°
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Actual ISS Position</span>
            <span className="font-mono font-bold text-cyan-300">
              {gameResult.actualLat}°, {gameResult.actualLng}°
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Distance Between Points</span>
            <span className="font-mono font-bold text-white text-sm">
              {gameResult.distanceKm.toLocaleString()} km
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Score &amp; Rank</span>
            <span className="font-mono font-black text-amber-400 text-sm">
              {gameResult.score} pts • {gameResult.rank}
            </span>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="relative w-full h-[420px] sm:h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <div ref={mapContainerRef} className="w-full h-full bg-space-darkest cursor-crosshair" />

        {/* Map Style Switcher (Top Left) */}
        <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-900/85 border border-slate-700 backdrop-blur-md shadow-lg">
          <Layers className="w-3.5 h-3.5 text-cyan-400 ml-2 mr-0.5 hidden sm:inline" />
          {Object.entries(TILE_LAYERS).map(([key, layer]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedTile(key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedTile === key
                  ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {layer.name}
            </button>
          ))}
        </div>

        {/* Floating Map Controls */}
        <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
          {!gameMode && (
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
          )}

          <button
            onClick={() => {
              if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
            }}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-300 border border-slate-700 hover:text-white shadow-lg backdrop-blur-md transition self-end"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
            }}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-300 border border-slate-700 hover:text-white shadow-lg backdrop-blur-md transition self-end"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[400] glass-panel px-3.5 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-glow-cyan"></span>
            <span className="text-slate-200 font-medium">ISS Position</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-sky-400"></span>
            <span>Recent Orbital Path</span>
          </div>
          {gameMode && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white"></span>
              <span className="text-rose-300 font-medium">Your Guess Pin</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ISSMap;
