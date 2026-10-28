import React, { useRef } from 'react';

/**
 * Dashboard section switcher: a numbered left rail on lg, a mono tab strip on smaller screens.
 * Purely presentational: the parent owns `activeTab`.
 */
const DashboardTabs = ({ tabs, activeTab, onChange }) => {
  const tabRefs = useRef({});

  // Arrow-key navigation between tabs (WAI-ARIA tabs pattern)
  const handleKeyDown = (e, index) => {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    let next = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % tabs.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    const nextId = tabs[next].id;
    onChange(nextId);
    tabRefs.current[nextId]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Dashboard sections"
      className="flex lg:flex-col overflow-x-auto scrollbar-none border-y border-line lg:border-y-0 lg:border-t -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            type="button"
            role="tab"
            id={`dashboard-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`dashboard-panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`group relative flex items-baseline gap-3 flex-shrink-0 h-12 lg:h-auto lg:py-4 pr-5 lg:pr-0 lg:pl-4 lg:border-b border-line font-mono text-[0.6875rem] uppercase tracking-label whitespace-nowrap transition-colors ${
              isActive ? 'text-fg' : 'text-fg-muted hover:text-fg'
            } items-center lg:items-baseline`}
          >
            {/* Active marker: left rule on lg, underline on the strip */}
            <span
              className={`absolute bg-signal transition-transform duration-300 ease-out origin-left lg:origin-top left-0 right-5 bottom-0 h-px lg:right-auto lg:top-0 lg:bottom-0 lg:h-auto lg:w-px ${
                isActive ? 'scale-100' : 'scale-0'
              }`}
              aria-hidden="true"
            />
            <span className={isActive ? 'text-signal' : 'text-fg-faint group-hover:text-fg-muted'}>{tab.index}</span>
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && <span className="lg:ml-auto tabular-nums text-fg-faint">{String(tab.count).padStart(2, '0')}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default DashboardTabs;
