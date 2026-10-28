import React, { useState, useEffect, useMemo } from 'react';
import { spaceService } from '../../services/spaceService';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Panel from '../common/Panel';
import Stat from '../common/Stat';
import Skeleton, { SkeletonRows } from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import NeoScaleStrip from './NeoScaleStrip';
import NeoSizeBars from './NeoSizeBars';
import NeoOrbitDiagram from './NeoOrbitDiagram';
import { missKm, missLd, velocityKmh, avgDiameterKm, formatLd } from './neoMath';
import { ArrowUp, ArrowDown, ArrowUpDown, Check, GitCompare, X } from 'lucide-react';

// Client-side view controls over the already-fetched list (display only)
const SORT_COLUMNS = [
  { key: 'name', label: 'Object', value: (a) => String(a.name || '') },
  { key: 'diameter', label: 'Diameter', value: avgDiameterKm },
  { key: 'miss', label: 'Miss distance', value: missKm },
  { key: 'velocity', label: 'Velocity', value: velocityKmh },
];

const HAZARD_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'hazardous', label: 'Hazardous' },
  { key: 'nominal', label: 'Nominal' },
];

const NeoRadar = () => {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);

  // Asteroid Comparison Tool State (up to 2 asteroids)
  const [selectedIds, setSelectedIds] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // View-only sort & filter state
  const [sortKey, setSortKey] = useState('miss');
  const [sortDir, setSortDir] = useState('asc');
  const [hazardFilter, setHazardFilter] = useState('all');

  useEffect(() => {
    const fetchNeo = async () => {
      setLoading(true);
      try {
        const data = await spaceService.getNeoAsteroids();
        setAsteroids(data.asteroids || []);
      } catch (error) {
        console.error('NEO error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNeo();
  }, []);

  const toggleSelectAsteroid = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        // Replace the oldest selection with the new one
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const selectedAsteroids = selectedIds
    .map((id) => asteroids.find((a) => a.id === id))
    .filter(Boolean);

  // Helper to extract numeric metrics from an asteroid object
  const getMetrics = (ast) => {
    const approach = ast?.close_approach_data?.[0];
    const minDia = Number(ast?.estimated_diameter?.kilometers?.estimated_diameter_min || 0.1);
    const maxDia = Number(ast?.estimated_diameter?.kilometers?.estimated_diameter_max || 0.3);
    const avgDia = (minDia + maxDia) / 2;
    const velocity = Number(approach?.relative_velocity?.kilometers_per_hour || 0);
    const missDist = Number(approach?.miss_distance?.kilometers || 0);
    return {
      minDia,
      maxDia,
      avgDia,
      velocity,
      missDist,
      approachDate: approach?.close_approach_date || 'N/A',
      isHazard: !!ast?.is_potentially_hazardous_asteroid,
      magnitude: ast?.absolute_magnitude_h ?? 'N/A',
    };
  };

  // Sorted + filtered view of the fetched list (the list itself is never mutated)
  const view = useMemo(() => {
    const col = SORT_COLUMNS.find((c) => c.key === sortKey) || SORT_COLUMNS[2];
    const filtered = asteroids.filter((a) =>
      hazardFilter === 'all' ? true : hazardFilter === 'hazardous' ? a.is_potentially_hazardous_asteroid : !a.is_potentially_hazardous_asteroid
    );
    const sorted = [...filtered].sort((a, b) => {
      const va = col.value(a);
      const vb = col.value(b);
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [asteroids, sortKey, sortDir, hazardFilter]);

  const handleSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'name' || key === 'miss' ? 'asc' : 'desc');
    }
  };

  const hazardousCount = asteroids.filter((a) => a.is_potentially_hazardous_asteroid).length;
  const closest = asteroids.length ? Math.min(...asteroids.map(missLd)) : null;
  const fastest = asteroids.length ? Math.max(...asteroids.map(velocityKmh)) : null;

  const renderSortHeader = (col, className = "") => {
    const active = sortKey === col.key;
    const Icon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
    return (
      <th scope="col" aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} className={`py-3 font-normal ${className}`}>
        <button
          type="button"
          onClick={() => handleSort(col.key)}
          className={`inline-flex items-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-label transition-colors ${
            active ? 'text-signal' : 'text-fg-muted hover:text-fg'
          }`}
        >
          {col.label}
          <Icon className="w-3 h-3" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </th>
    );
  };

  const renderCompareToggle = (ast, compact = false) => {
    const isSelected = selectedIds.includes(ast.id);
    return (
      <button
        type="button"
        onClick={() => toggleSelectAsteroid(ast.id)}
        aria-pressed={isSelected}
        aria-label={`${isSelected ? 'Deselect' : 'Select'} ${ast.name} for comparison`}
        className={`inline-flex items-center gap-1.5 h-7 px-2.5 border font-mono text-[0.625rem] uppercase tracking-label transition-colors ${
          isSelected ? 'bg-signal border-signal text-black' : 'border-line-strong text-fg-muted hover:text-fg hover:border-fg-muted'
        }`}
      >
        {isSelected ? <Check className="w-3 h-3" strokeWidth={1.5} /> : <GitCompare className="w-3 h-3" strokeWidth={1.5} />}
        {!compact && <span>{isSelected ? 'Selected' : 'Compare'}</span>}
      </button>
    );
  };

  return (
    <div className="space-y-10">
      {/* Instrument readout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-line divide-x divide-line [&>*:nth-child(n+3)]:border-t lg:[&>*:nth-child(n+3)]:border-t-0">
        <Stat className="p-5" label="Tracked bodies" value={loading ? '—' : String(asteroids.length).padStart(2, '0')} size="lg" />
        <Stat className="p-5" label="Potentially hazardous" value={loading ? '—' : String(hazardousCount).padStart(2, '0')} size="lg" accent={hazardousCount > 0} />
        <Stat className="p-5" label="Closest pass" value={loading || closest === null ? '—' : formatLd(closest)} unit="LD" size="lg" />
        <Stat
          className="p-5"
          label="Fastest"
          value={loading || fastest === null ? '—' : Math.round(fastest).toLocaleString()}
          unit="km/h"
          size="lg"
        />
      </div>

      {loading ? (
        <div className="space-y-6" role="status" aria-label="Scanning planetary radar vectors and orbital approach trajectories">
          <Skeleton className="h-44 w-full" />
          <div className="grid grid-cols-12 gap-6">
            <Skeleton className="col-span-12 lg:col-span-7 h-64" />
            <Skeleton className="col-span-12 lg:col-span-5 h-64" />
          </div>
          <SkeletonRows rows={6} cols={6} />
        </div>
      ) : asteroids.length === 0 ? (
        <EmptyState code="NEOWS · EMPTY WINDOW" title="No asteroid approaches registered for this window." />
      ) : (
        <>
          {/* Bento of visualisations */}
          <div className="grid grid-cols-12 gap-px bg-line border border-line">
            <Panel tone="base" className="col-span-12 border-0" index="A" title="Distance from Earth" meta={`${view.length} objects`}>
              <NeoScaleStrip asteroids={view} selectedIds={selectedIds} onToggle={toggleSelectAsteroid} />
            </Panel>
            <Panel tone="base" className="col-span-12 lg:col-span-7 border-0" index="B" title="Size comparison" meta="Mean est. diameter">
              <NeoSizeBars asteroids={view} selectedIds={selectedIds} />
            </Panel>
            <Panel tone="base" className="col-span-12 lg:col-span-5 border-0" index="C" title="Proximity">
              <NeoOrbitDiagram asteroids={view} selectedIds={selectedIds} />
            </Panel>
          </div>

          {/* Table controls + comparison bar */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="label block mb-2" id="hazard-filter-label">
                Hazard class
              </span>
              <div className="flex border border-line-strong w-max" role="group" aria-labelledby="hazard-filter-label">
                {HAZARD_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    aria-pressed={hazardFilter === f.key}
                    onClick={() => setHazardFilter(f.key)}
                    className={`h-9 px-4 font-mono text-[0.6875rem] uppercase tracking-label border-r border-line-strong last:border-r-0 transition-colors ${
                      hazardFilter === f.key ? 'bg-fg text-black' : 'text-fg-muted hover:text-fg'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <span className="font-mono text-[0.6875rem] uppercase tracking-label text-fg-muted">
                Compare <span className="text-fg">{selectedAsteroids.length}</span>/2
              </span>
              {selectedAsteroids.map((a) => (
                <span key={a.id} className="inline-flex items-center gap-2 h-7 pl-2.5 pr-1 border border-signal-line font-mono text-[0.6875rem] text-signal">
                  {a.name}
                  <button
                    type="button"
                    onClick={() => toggleSelectAsteroid(a.id)}
                    aria-label={`Remove ${a.name} from comparison`}
                    className="h-5 w-5 flex items-center justify-center text-fg-muted hover:text-fg"
                  >
                    <X className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                </span>
              ))}
              {selectedAsteroids.length > 0 && (
                <Button variant="ghost" size="xs" onClick={() => setSelectedIds([])} title="Clear selection">
                  Clear
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                icon={GitCompare}
                disabled={selectedAsteroids.length < 2}
                onClick={() => setIsCompareOpen(true)}
              >
                Compare side by side
              </Button>
            </div>
          </div>

          {/* Sortable table (desktop) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-y border-line">
              <caption className="sr-only">Near-Earth objects, sortable by column</caption>
              <thead className="border-b border-line">
                <tr>
                  {renderSortHeader(SORT_COLUMNS[0], "pr-4")}
                  <th scope="col" className="py-3 pr-4 font-mono text-[0.625rem] uppercase tracking-label text-fg-muted font-normal">
                    Approach
                  </th>
                  {renderSortHeader(SORT_COLUMNS[1], "pr-4 text-right")}
                  {renderSortHeader(SORT_COLUMNS[2], "pr-4 text-right")}
                  {renderSortHeader(SORT_COLUMNS[3], "pr-4 text-right")}
                  <th scope="col" className="py-3 pr-4 font-mono text-[0.625rem] uppercase tracking-label text-fg-muted font-normal">
                    Class
                  </th>
                  <th scope="col" className="py-3 text-right font-mono text-[0.625rem] uppercase tracking-label text-fg-muted font-normal">
                    <span className="sr-only">Compare</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {view.map((ast) => {
                  const m = getMetrics(ast);
                  const isSelected = selectedIds.includes(ast.id);
                  return (
                    <tr key={ast.id} className={`group transition-colors ${isSelected ? 'bg-signal-dim' : 'hover:bg-ink-800'}`}>
                      <td className="py-3.5 pr-4">
                        <div className="font-mono text-sm text-fg">{ast.name}</div>
                        <div className="font-mono text-[0.625rem] text-fg-faint mt-0.5">
                          ID {ast.id} · H {ast.absolute_magnitude_h}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 telemetry text-xs text-fg-muted">{m.approachDate}</td>
                      <td className="py-3.5 pr-4 telemetry text-xs text-fg text-right whitespace-nowrap">
                        {m.minDia.toFixed(2)}–{m.maxDia.toFixed(2)} <span className="text-fg-faint">km</span>
                      </td>
                      <td className="py-3.5 pr-4 telemetry text-xs text-right whitespace-nowrap">
                        <span className="text-fg">{Math.round(m.missDist).toLocaleString()}</span> <span className="text-fg-faint">km</span>
                        <div className="text-[0.625rem] text-fg-muted">{formatLd(m.missDist / 384400)} LD</div>
                      </td>
                      <td className="py-3.5 pr-4 telemetry text-xs text-fg text-right whitespace-nowrap">
                        {Math.round(m.velocity).toLocaleString()} <span className="text-fg-faint">km/h</span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <Badge variant={m.isHazard ? 'danger' : 'neutral'}>{m.isHazard ? 'Hazardous' : 'Nominal'}</Badge>
                      </td>
                      <td className="py-3.5 text-right">
                        {renderCompareToggle(ast)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Ruled entries (mobile) */}
          <div className="md:hidden">
            <div className="flex items-center gap-3 mb-3 overflow-x-auto scrollbar-none">
              <span className="label flex-shrink-0">Sort</span>
              {SORT_COLUMNS.map((col) => (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => handleSort(col.key)}
                  aria-pressed={sortKey === col.key}
                  className={`flex-shrink-0 h-7 px-2.5 border font-mono text-[0.625rem] uppercase tracking-label ${
                    sortKey === col.key ? 'border-signal-line text-signal' : 'border-line-strong text-fg-muted'
                  }`}
                >
                  {col.label}
                  {sortKey === col.key && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </button>
              ))}
            </div>
            <ul className="border-y border-line divide-y divide-line">
              {view.map((ast) => {
                const m = getMetrics(ast);
                return (
                  <li key={ast.id} className={`py-4 ${selectedIds.includes(ast.id) ? 'bg-signal-dim -mx-4 px-4' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-sm text-fg truncate">{ast.name}</div>
                        <div className="font-mono text-[0.625rem] text-fg-faint mt-0.5">Approach {m.approachDate}</div>
                      </div>
                      <Badge variant={m.isHazard ? 'danger' : 'neutral'}>{m.isHazard ? 'Hazardous' : 'Nominal'}</Badge>
                    </div>
                    <dl className="mt-3 grid grid-cols-3 gap-3">
                      <div>
                        <dt className="label text-fg-faint">Dia</dt>
                        <dd className="telemetry text-xs text-fg mt-0.5">{m.avgDia.toFixed(2)} km</dd>
                      </div>
                      <div>
                        <dt className="label text-fg-faint">Miss</dt>
                        <dd className="telemetry text-xs text-fg mt-0.5">{formatLd(m.missDist / 384400)} LD</dd>
                      </div>
                      <div>
                        <dt className="label text-fg-faint">Vel</dt>
                        <dd className="telemetry text-xs text-fg mt-0.5">{Math.round(m.velocity / 1000)}k km/h</dd>
                      </div>
                    </dl>
                    <div className="mt-3">
                      {renderCompareToggle(ast)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}

      {/* Side-by-Side Asteroid Comparison Modal */}
      <Modal
        isOpen={isCompareOpen && selectedAsteroids.length === 2}
        onClose={() => setIsCompareOpen(false)}
        title="Side-by-side comparison"
        maxWidth="max-w-3xl"
      >
        {selectedAsteroids.length === 2 && (() => {
          const [a1, a2] = selectedAsteroids;
          const m1 = getMetrics(a1);
          const m2 = getMetrics(a2);
          const maxDiaRef = Math.max(m1.maxDia, m2.maxDia, 0.1);
          const maxVelRef = Math.max(m1.velocity, m2.velocity, 1);
          const maxDistRef = Math.max(m1.missDist, m2.missDist, 1);

          const rows = [
            {
              label: 'Estimated diameter',
              v1: `${m1.minDia.toFixed(2)}–${m1.maxDia.toFixed(2)} km`,
              v2: `${m2.minDia.toFixed(2)}–${m2.maxDia.toFixed(2)} km`,
              p1: m1.maxDia / maxDiaRef,
              p2: m2.maxDia / maxDiaRef,
            },
            {
              label: 'Relative velocity',
              v1: `${Math.round(m1.velocity).toLocaleString()} km/h`,
              v2: `${Math.round(m2.velocity).toLocaleString()} km/h`,
              p1: m1.velocity / maxVelRef,
              p2: m2.velocity / maxVelRef,
            },
            {
              label: 'Miss distance',
              v1: `${Math.round(m1.missDist).toLocaleString()} km · ${(m1.missDist / 384400).toFixed(1)}× Moon`,
              v2: `${Math.round(m2.missDist).toLocaleString()} km · ${(m2.missDist / 384400).toFixed(1)}× Moon`,
              p1: m1.missDist / maxDistRef,
              p2: m2.missDist / maxDistRef,
            },
          ];

          return (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-px bg-line border border-line">
                {[
                  { ast: a1, m: m1 },
                  { ast: a2, m: m2 },
                ].map(({ ast, m }) => (
                  <div key={ast.id} className="bg-ink-900 p-4 space-y-2">
                    <div className="font-mono text-base text-fg break-words">{ast.name}</div>
                    <div className="font-mono text-[0.625rem] text-fg-faint">NEO ID {ast.id}</div>
                    <Badge variant={m.isHazard ? 'danger' : 'neutral'}>{m.isHazard ? 'Hazardous' : 'Nominal'}</Badge>
                  </div>
                ))}
              </div>

              <div className="border-t border-line divide-y divide-line">
                {rows.map((r) => (
                  <div key={r.label} className="py-4">
                    <div className="label text-fg-faint mb-3">{r.label}</div>
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { v: r.v1, p: r.p1, accent: true },
                        { v: r.v2, p: r.p2, accent: false },
                      ].map((c, i) => (
                        <div key={i}>
                          <div className={`telemetry text-sm ${c.accent ? 'text-signal' : 'text-fg'}`}>{c.v}</div>
                          <div className="mt-2 h-1 bg-ink-700">
                            <div className={`h-full origin-left animate-draw-x ${c.accent ? 'bg-signal' : 'bg-fg-muted'}`} style={{ width: `${Math.max(4, c.p * 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="py-4 grid grid-cols-2 gap-6">
                  {[m1, m2].map((m, i) => (
                    <div key={i}>
                      <div className="label text-fg-faint mb-1">Approach · Magnitude</div>
                      <div className="telemetry text-sm text-fg">
                        {m.approachDate} · H {m.magnitude}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default NeoRadar;
