import React from 'react';
import { Search, Filter, Rocket, Building2 } from 'lucide-react';

const AGENCIES = [
  { value: 'all', label: 'All Agencies' },
  { value: 'SpaceX', label: 'SpaceX' },
  { value: 'NASA', label: 'NASA' },
  { value: 'Rocket Lab', label: 'Rocket Lab' },
  { value: 'United Launch Alliance', label: 'ULA' },
  { value: 'Arianespace', label: 'Arianespace' },
  { value: 'ISRO', label: 'ISRO' },
];

const STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Go', label: 'Go for Launch' },
  { value: 'TBD', label: 'TBD / Pending' },
  { value: 'Hold', label: 'On Hold' },
];

const LaunchFilter = ({
  search,
  setSearch,
  agency,
  setAgency,
  status,
  setStatus,
  onReset,
}) => {
  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search missions, rockets, or payloads..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          />
        </div>

        {/* Agency Filter */}
        <div className="sm:col-span-3 relative">
          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={agency}
            onChange={(e) => setAgency(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition appearance-none cursor-pointer"
          >
            {AGENCIES.map((ag) => (
              <option key={ag.value} value={ag.value} className="bg-slate-900 text-slate-100">
                {ag.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3 relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition appearance-none cursor-pointer"
          >
            {STATUSES.map((st) => (
              <option key={st.value} value={st.value} className="bg-slate-900 text-slate-100">
                {st.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchFilter;
