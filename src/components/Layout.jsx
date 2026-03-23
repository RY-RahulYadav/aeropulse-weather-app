import {
  CalendarDays,
  ChevronLeft,
  Compass,
  Home,
  Menu,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import LocationSearch from './LocationSearch';

function getGpsBadge(permissionState, location) {
  if (permissionState === 'granted' && location?.label === 'Detected GPS Location') {
    return { label: 'GPS Active', variant: 'ok' };
  }

  if (permissionState === 'denied') {
    return { label: 'GPS Blocked', variant: 'bad' };
  }

  return { label: 'GPS Detecting', variant: 'neutral' };
}

export default function Layout({
  children,
  location,
  locationError,
  permissionState,
  onRetryLocation,
  onLocationSelect,
  isGpsLoading,
}) {
  const gps = getGpsBadge(permissionState, location);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navClass = ({ isActive }) =>
    [
      'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition',
      isActive
        ? 'bg-cyan-500/15 text-cyan-700 dark:bg-cyan-400/20 dark:text-cyan-200'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
    ].join(' ');

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 gap-4 p-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:p-4">
      <div className="glass flex items-center justify-between rounded-2xl p-3 lg:hidden">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Weather Dashboard</p>
          <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{location?.label ?? 'Detecting location...'}</p>
        </div>
        <button type="button" className="btn-secondary" onClick={() => setMobileNavOpen((value) => !value)}>
          <Menu className="h-4 w-4" />
          Menu
        </button>
      </div>

      {mobileNavOpen ? (
        <div className="glass rounded-2xl p-3 lg:hidden">
          <nav className="space-y-2">
            <NavLink to="/" end className={navClass} onClick={() => setMobileNavOpen(false)}>
              <Home className="h-4 w-4" />
              Current Dashboard
            </NavLink>
            <NavLink to="/historical" className={navClass} onClick={() => setMobileNavOpen(false)}>
              <CalendarDays className="h-4 w-4" />
              Historical Insights
            </NavLink>
          </nav>
        </div>
      ) : null}

      <aside
        className={[
          'glass sticky top-3 hidden h-[calc(100vh-24px)] flex-col rounded-3xl p-3 lg:flex',
          collapsed ? 'w-20' : 'w-72',
        ].join(' ')}
      >
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {collapsed ? null : 'Collapse'}
          </button>
        </div>

        <div className="mb-4 rounded-2xl bg-gradient-to-br from-cyan-400/25 via-indigo-400/20 to-sky-300/20 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">Selection Test</p>
          {!collapsed ? (
            <>
              <h1 className="mt-1 font-display text-3xl leading-none tracking-tight text-slate-900 dark:text-white">AeroPulse</h1>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Premium weather intelligence</p>
            </>
          ) : null}
        </div>

        <nav className="space-y-1">
          <NavLink to="/" end className={navClass}>
            <Home className="h-4 w-4" />
            {collapsed ? null : 'Current Dashboard'}
          </NavLink>
          <NavLink to="/historical" className={navClass}>
            <CalendarDays className="h-4 w-4" />
            {collapsed ? null : 'Historical Insights'}
          </NavLink>
        </nav>

        {!collapsed ? (
          <div className="mt-4 space-y-3 rounded-2xl border border-slate-200/80 bg-white/60 p-3 dark:border-slate-700 dark:bg-slate-900/40">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">GPS</p>
              <span className={`gps-pill gps-pill--${gps.variant}`}>{gps.label}</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200">{location?.label ?? 'Detecting location...'}</p>
            <button type="button" className="btn-secondary w-full" onClick={onRetryLocation}>
              <Compass className="h-4 w-4" />
              Refresh GPS
            </button>
            {locationError ? <p className="text-xs text-rose-600 dark:text-rose-300">{locationError}</p> : null}
          </div>
        ) : null}

        <div className="mt-auto flex justify-center">
          <Link to="https://open-meteo.com/" target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
            Open-Meteo API
          </Link>
        </div>
      </aside>

      <section className="min-w-0 space-y-3">
        <header className="glass relative z-40 overflow-visible rounded-3xl p-3 sm:p-4">
          <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Live Weather Workspace</p>
              <h2 className="mt-1 font-display text-2xl text-slate-900 dark:text-white sm:text-3xl">{location?.label ?? 'Detecting location...'}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {location ? `${location.latitude}, ${location.longitude}` : 'Allow location for personalized forecast'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <LocationSearch onSelect={onLocationSelect} />
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100/70 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
              <Search className="h-4 w-4" />
              {isGpsLoading ? 'Detecting GPS...' : 'Search any location'}
            </div>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass relative z-10 min-w-0 rounded-3xl p-3 sm:p-4"
        >
          {children}
        </motion.main>
      </section>
    </div>
  );
}
