import React, { useState, useEffect, useCallback } from 'react';
import { spaceService } from '../services/spaceService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import LaunchFilter from '../components/launches/LaunchFilter';
import LaunchCard from '../components/launches/LaunchCard';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { Rocket, Bookmark, Check, Calendar, MapPin, Orbit, Radio, AlertCircle } from 'lucide-react';

const LaunchesPage = () => {
  const { isAuthenticated } = useAuth();
  const { notifySuccess, notifyError, notifyInfo } = useNotification();

  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchlistIds, setWatchlistIds] = useState(new Set());

  // Filter states
  const [search, setSearch] = useState('');
  const [agency, setAgency] = useState('all');
  const [status, setStatus] = useState('all');

  // Modal detail
  const [selectedLaunch, setSelectedLaunch] = useState(null);

  // Fetch launches
  const fetchLaunches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await spaceService.getUpcomingLaunches({
        search,
        agency: agency === 'all' ? undefined : agency,
        status: status === 'all' ? undefined : status,
      });
      setLaunches(data.launches || []);
    } catch (error) {
      console.error('Error fetching launches:', error);
      notifyError('Failed to fetch rocket launches');
    } finally {
      setLoading(false);
    }
  }, [search, agency, status, notifyError]);

  // Fetch User Watchlist IDs
  const fetchWatchlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWatchlistIds(new Set());
      return;
    }
    try {
      const items = await userService.getWatchlist();
      const ids = new Set((items || []).map((i) => String(i.launchId)));
      setWatchlistIds(ids);
    } catch (error) {
      console.warn('Could not sync user watchlist:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // Debounced search / filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLaunches();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchLaunches]);

  // Toggle Watchlist handler
  const handleToggleWatchlist = async (launch) => {
    if (!isAuthenticated) {
      notifyInfo('Please log in or register to add missions to your Watchlist.');
      return;
    }

    const launchIdStr = String(launch.id);
    const isInWatchlist = watchlistIds.has(launchIdStr);

    try {
      if (isInWatchlist) {
        await userService.removeFromWatchlist(launchIdStr);
        setWatchlistIds((prev) => {
          const next = new Set(prev);
          next.delete(launchIdStr);
          return next;
        });
        notifySuccess(`Removed "${launch.name}" from your Watchlist`);
      } else {
        await userService.addToWatchlist({
          launchId: launchIdStr,
          launchName: launch.name,
          launchDate: launch.net || new Date().toISOString(),
          agency: launch.launch_service_provider?.name || 'Space Agency',
          rocket: launch.rocket?.configuration?.full_name || 'Rocket',
          padLocation: launch.pad?.location?.name || '',
          status: launch.status?.name || 'Go',
          image: launch.image || '',
        });
        setWatchlistIds((prev) => new Set([...prev, launchIdStr]));
        notifySuccess(`Added "${launch.name}" to your Watchlist!`);
      }
    } catch (error) {
      notifyError(error.message || 'Failed to update Watchlist');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Rocket className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Upcoming Rocket Launches
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            Global orbital manifest and countdown schedules from SpaceX, NASA, Rocket Lab, ULA, and world spaceports
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>Manifest Active: {launches.length} Missions</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <LaunchFilter
        search={search}
        setSearch={setSearch}
        agency={agency}
        setAgency={setAgency}
        status={status}
        setStatus={setStatus}
      />

      {/* Launch Cards Grid */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-12 border border-slate-800">
          <Loader message="Scanning worldwide launch pads and countdown clocks..." />
        </div>
      ) : launches.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 border border-slate-800 text-center space-y-3">
          <Rocket className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No matching launches found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Try adjusting your search keywords, agency filter, or status criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {launches.map((launch) => (
            <LaunchCard
              key={launch.id}
              launch={launch}
              isInWatchlist={watchlistIds.has(String(launch.id))}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectDetails={(l) => setSelectedLaunch(l)}
            />
          ))}
        </div>
      )}

      {/* Launch Details Modal */}
      <Modal
        isOpen={!!selectedLaunch}
        onClose={() => setSelectedLaunch(null)}
        title={selectedLaunch?.name || 'Mission Telemetry'}
      >
        {selectedLaunch && (
          <div className="space-y-6">
            <div className="relative h-60 w-full rounded-xl overflow-hidden border border-slate-800">
              <img
                src={selectedLaunch.image || 'https://images.unsplash.com/photo-1517976487502-53b7c2fb2b6a?w=800'}
                alt={selectedLaunch.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge variant="go">{selectedLaunch.status?.name || 'Scheduled'}</Badge>
                {selectedLaunch.webcast_live && (
                  <Badge variant="live" className="flex items-center gap-1">
                    <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span>Live Webcast</span>
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
                Mission Overview
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedLaunch.mission?.description || 'Classified orbital insertion or payload deployment.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
              <div className="glass-panel p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Launch Provider</span>
                <span className="font-semibold text-slate-100">
                  {selectedLaunch.launch_service_provider?.name} ({selectedLaunch.launch_service_provider?.country_code})
                </span>
              </div>

              <div className="glass-panel p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Launch Vehicle</span>
                <span className="font-semibold text-slate-100">
                  {selectedLaunch.rocket?.configuration?.full_name}
                </span>
              </div>

              <div className="glass-panel p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Target Orbit</span>
                <span className="font-semibold text-slate-100">
                  {selectedLaunch.mission?.orbit?.name || 'Low Earth Orbit (LEO)'}
                </span>
              </div>

              <div className="glass-panel p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-3">
                <span className="text-slate-400 block mb-1">Launch Pad Site</span>
                <span className="font-semibold text-slate-100">
                  {selectedLaunch.pad?.name} — {selectedLaunch.pad?.location?.name}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => handleToggleWatchlist(selectedLaunch)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  watchlistIds.has(String(selectedLaunch.id))
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-cyan-500 text-black shadow-glow-cyan hover:bg-cyan-400'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>
                  {watchlistIds.has(String(selectedLaunch.id))
                    ? 'Remove from Watchlist'
                    : 'Add to My Watchlist'}
                </span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LaunchesPage;
