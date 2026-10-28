import React from 'react';
import { Search } from 'lucide-react';
import Input from '../common/Input';

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
    <div className="grid grid-cols-12 gap-x-8 gap-y-6 items-end" role="search" aria-label="Filter launch manifest">
      {/* Search Input */}
      <Input
        className="col-span-12 md:col-span-6"
        label="Search manifest"
        icon={Search}
        type="text"
        name="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Mission, rocket or payload"
      />

      {/* Agency Filter */}
      <Input as="select" className="col-span-6 md:col-span-3" label="Provider" name="agency" value={agency} onChange={(e) => setAgency(e.target.value)}>
        {AGENCIES.map((ag) => (
          <option key={ag.value} value={ag.value}>
            {ag.label}
          </option>
        ))}
      </Input>

      {/* Status Filter */}
      <Input as="select" className="col-span-6 md:col-span-3" label="Status" name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
        {STATUSES.map((st) => (
          <option key={st.value} value={st.value}>
            {st.label}
          </option>
        ))}
      </Input>
    </div>
  );
};

export default LaunchFilter;
