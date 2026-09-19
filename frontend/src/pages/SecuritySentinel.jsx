import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle2, RefreshCw, AlertTriangle, ShieldCheck, Filter, Search } from 'lucide-react';
import { api } from '../services/api';
import { translations } from '../i18n/translations';

export default function SecuritySentinel({ lang = 'en' }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const t = translations[lang]?.securitySentinel || translations.en.securitySentinel;

  useEffect(() => {
    loadEvents();
    // Auto-poll every 4 seconds to catch live attack simulations or privacy triggers
    const timer = setInterval(() => {
      loadEvents(true);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const loadEvents = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.getAuditEvents();
      setEvents(res.events || []);
    } catch (e) {
      console.error('Failed to load audit events:', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const totalBlocked = events.filter(e => e.status === 'BLOCKED').length;
  const totalSuppressed = events.filter(e => e.status === 'SUPPRESSED').length;
  const totalSafe = events.filter(e => e.status !== 'BLOCKED' && e.status !== 'SUPPRESSED').length;

  const filteredEvents = events.filter(e => {
    if (activeFilter === 'BLOCKED' && e.status !== 'BLOCKED') return false;
    if (activeFilter === 'SUPPRESSED' && e.status !== 'SUPPRESSED') return false;
    if (activeFilter === 'SAFE' && (e.status === 'BLOCKED' || e.status === 'SUPPRESSED')) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchType = e.event_type?.toLowerCase().includes(q);
      const matchStatus = e.status?.toLowerCase().includes(q);
      const matchDetails = typeof e.details === 'object' ? JSON.stringify(e.details).toLowerCase().includes(q) : String(e.details || '').toLowerCase().includes(q);
      return matchType || matchStatus || matchDetails;
    }
    return true;
  });

  const renderDetails = (details) => {
    if (!details || (typeof details === 'object' && Object.keys(details).length === 0)) {
      return <span className="text-charcoal-muted italic">No extra parameters</span>;
    }
    if (typeof details === 'string') {
      return <span>{details}</span>;
    }
    if (typeof details === 'object') {
      return (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {Object.entries(details).map(([key, val]) => (
            <span
              key={key}
              className="inline-flex items-center text-[11px] bg-sand/70 border border-gold/30 rounded px-2 py-0.5 font-mono"
            >
              <strong className="text-wine mr-1 font-semibold">{key.replace(/_/g, ' ')}:</strong>
              <span className="text-charcoal">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
            </span>
          ))}
        </div>
      );
    }
    return <span>{String(details)}</span>;
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold/30 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-wine text-xs font-bold uppercase tracking-widest">
            <Activity className="w-5 h-5 text-gold animate-pulse" />
            <span>{t.badge}</span>
          </div>
          <h1 className="font-heading font-bold text-[22px] sm:text-3xl text-wine mt-1 leading-tight">
            {t.title}
          </h1>
          <p className="text-sm text-charcoal font-medium mt-0.5">
            {t.subtitle}
          </p>
        </div>

        <button
          onClick={() => loadEvents(false)}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-wine hover:bg-wine-dark text-cream text-xs font-semibold flex items-center space-x-2 shrink-0 self-start sm:self-auto shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : t.refreshBtn}</span>
        </button>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-cream p-4 rounded-xl border border-gold/30 shadow-xs hover:border-gold transition-all">
          <span className="text-[11px] font-semibold text-charcoal-muted uppercase">{t.kpiSuppression}</span>
          <p className="font-heading font-bold text-xl sm:text-2xl text-wine mt-1">
            {totalSuppressed > 0 ? `${totalSuppressed} Shielded` : 'Active'}
          </p>
          <span className="text-[10px] text-emerald-700 font-medium">{t.kpiSuppressionSub}</span>
        </div>
        <div className="bg-cream p-4 rounded-xl border border-gold/30 shadow-xs hover:border-gold transition-all">
          <span className="text-[11px] font-semibold text-charcoal-muted uppercase">{t.kpiBlocked}</span>
          <p className="font-heading font-bold text-xl sm:text-2xl text-red-700 mt-1">
            {totalBlocked > 0 ? `${totalBlocked} Neutralised` : 'Active'}
          </p>
          <span className="text-[10px] text-emerald-700 font-medium">{t.kpiBlockedSub}</span>
        </div>
        <div className="bg-cream p-4 rounded-xl border border-gold/30 shadow-xs hover:border-gold transition-all">
          <span className="text-[11px] font-semibold text-charcoal-muted uppercase">{t.kpiBudget}</span>
          <p className="font-heading font-bold text-xl sm:text-2xl text-wine mt-1">100%</p>
          <span className="text-[10px] text-charcoal-muted font-medium">{t.kpiBudgetSub}</span>
        </div>
        <div className="bg-cream p-4 rounded-xl border border-gold/30 shadow-xs hover:border-gold transition-all">
          <span className="text-[11px] font-semibold text-charcoal-muted uppercase">{t.kpiHealth}</span>
          <p className="font-heading font-bold text-xl sm:text-2xl text-emerald-700 mt-1">Pass</p>
          <span className="text-[10px] text-emerald-700 font-medium">{t.kpiHealthSub}</span>
        </div>
      </div>

      {/* Audit Stream Table & Controls */}
      <div className="bg-cream rounded-2xl border border-gold/30 shadow-sm overflow-hidden">
        
        {/* Stream Controls Header */}
        <div className="bg-sand/80 px-6 py-4 border-b border-gold/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-bold text-sm text-charcoal">{t.streamTitle}</h3>
            <p className="text-[11px] text-charcoal-muted">{t.streamSub}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center bg-sand p-1 rounded-lg border border-gold/30 text-xs">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  activeFilter === 'ALL' ? 'bg-wine text-cream shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                All ({events.length})
              </button>
              <button
                onClick={() => setActiveFilter('BLOCKED')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  activeFilter === 'BLOCKED' ? 'bg-red-700 text-white shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                Blocked ({totalBlocked})
              </button>
              <button
                onClick={() => setActiveFilter('SUPPRESSED')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  activeFilter === 'SUPPRESSED' ? 'bg-amber-700 text-white shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                Suppressed ({totalSuppressed})
              </button>
              <button
                onClick={() => setActiveFilter('SAFE')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  activeFilter === 'SAFE' ? 'bg-emerald-700 text-white shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                Normal ({totalSafe})
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-charcoal-muted absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search audit logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs rounded-lg bg-cream border border-gold/40 text-charcoal focus:outline-none focus:ring-1 focus:ring-wine w-44"
              />
            </div>
          </div>
        </div>

        {/* Stream List */}
        <div className="divide-y divide-gold/20 max-h-[560px] overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-charcoal-muted text-xs">
              {events.length === 0 ? t.emptyState : 'No events match the selected filter.'}
            </div>
          ) : (
            filteredEvents.map((e, idx) => {
              const isBlocked = e.status === 'BLOCKED';
              const isSuppressed = e.status === 'SUPPRESSED';

              return (
                <div key={e.id || idx} className="p-4 hover:bg-sand/30 transition-colors flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isBlocked
                        ? 'bg-red-100 text-red-800'
                        : isSuppressed
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isBlocked ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : isSuppressed ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-heading font-bold text-xs text-charcoal">{e.event_type}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isBlocked ? 'bg-red-100 text-red-800 border border-red-200' :
                          isSuppressed ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                          'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {e.status}
                        </span>
                        {e.merchant_id && (
                          <span className="text-[9px] font-mono text-charcoal-muted bg-sand px-1.5 py-0.2 rounded">
                            {e.merchant_id}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-1 text-xs text-charcoal">
                        {renderDetails(e.details)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-charcoal-muted font-mono block">
                      {e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : 'Just now'}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold mt-1 inline-block ${
                      isBlocked ? 'bg-red-50 text-red-800' :
                      isSuppressed ? 'bg-amber-50 text-amber-800' : 'bg-sand text-wine'
                    }`}>
                      {e.severity || (isBlocked ? 'HIGH' : isSuppressed ? 'MEDIUM' : 'INFO')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
