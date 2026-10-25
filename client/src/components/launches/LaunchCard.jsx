import React from 'react';
import { Rocket, MapPin, Calendar, Bookmark, BookmarkCheck, ExternalLink, Info } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import Badge from '../common/Badge';

const LaunchCard = ({ launch, isInWatchlist, onToggleWatchlist, onSelectDetails }) => {
  const getStatusVariant = (statusName) => {
    const s = (statusName || '').toLowerCase();
    if (s.includes('go')) return 'go';
    if (s.includes('tbd')) return 'tbd';
    if (s.includes('hold')) return 'hold';
    return 'default';
  };

  const formattedDate = launch.net
    ? new Date(launch.net).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Date TBD';

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 glass-panel-hover flex flex-col justify-between group">
      {/* Top Banner / Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={launch.image || 'https://images.unsplash.com/photo-1517976487502-53b7c2fb2b6a?w=800'}
          alt={launch.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1517976487502-53b7c2fb2b6a?w=800';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-space-card via-space-card/40 to-transparent" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <Badge variant={getStatusVariant(launch.status?.name)}>
            {launch.status?.name || 'Pending'}
          </Badge>

          {/* Watchlist Toggle */}
          <button
            onClick={() => onToggleWatchlist(launch)}
            className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-lg ${
              isInWatchlist
                ? 'bg-cyan-500 text-black shadow-glow-cyan'
                : 'bg-black/50 text-slate-300 hover:text-white hover:bg-black/70'
            }`}
            title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            {isInWatchlist ? (
              <BookmarkCheck className="w-4 h-4 fill-black" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Launch Provider Agency */}
        <div className="absolute bottom-2 left-4 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
          {launch.launch_service_provider?.name || 'Space Provider'}
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-100 group-hover:text-cyan-300 transition line-clamp-1">
            {launch.name}
          </h3>

          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {launch.mission?.description || 'Payload deployment and space exploration mission.'}
          </p>
        </div>

        {/* Metadata info */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Rocket className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="truncate">{launch.rocket?.configuration?.full_name || 'Rocket Launcher'}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
            <span className="truncate">{launch.pad?.location?.name || 'Spaceport Pad'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Live Countdown Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <CountdownTimer targetDate={launch.net} />

          <button
            onClick={() => onSelectDetails(launch)}
            className="flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-cyan-400 transition"
          >
            <span>Details</span>
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LaunchCard;
