import React from 'react';
import { Compass, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function TradeRadarCard({ signals, onSelectSignal, lang = 'hi' }) {
  const t = translations[lang]?.dashboard || translations.en.dashboard;

  return (
    <div className="bg-cream rounded-2xl border border-gold/30 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-gold/20">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-wine/10 text-wine flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-charcoal">{t.tradeRadarTitle}</h3>
              <p className="text-[11px] text-charcoal-muted">{t.tradeRadarSub}</p>
            </div>
          </div>

          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
            Live South Delhi Cluster
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {signals.slice(0, 3).map((sig, idx) => (
            <div
              key={idx}
              onClick={() => onSelectSignal(sig)}
              className="p-3 rounded-xl bg-sand/60 hover:bg-sand transition-all border border-gold/20 cursor-pointer flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-xs text-charcoal capitalize">{sig.category}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    sig.market_velocity > 0.10 ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    +{Math.round(sig.market_velocity * 100)}% Momentum
                  </span>
                </div>
                <p className="text-xs text-charcoal-muted mt-0.5 line-clamp-1">{sig.recommendation}</p>
              </div>

              <ArrowUpRight className="w-4 h-4 text-wine opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gold/20 flex items-center justify-between text-[11px] text-charcoal-muted">
        <span>Identified 3 category gaps</span>
        <span className="text-wine font-semibold cursor-pointer hover:underline">View Radar Map</span>
      </div>
    </div>
  );
}
