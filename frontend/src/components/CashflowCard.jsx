import React from 'react';
import { Calendar, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function CashflowCard({ cashflow, lang = 'hi' }) {
  if (!cashflow) return null;

  const t = translations[lang]?.dashboard || translations.en.dashboard;

  return (
    <div className="bg-cream rounded-2xl border border-gold/30 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-gold/20">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-wine/10 text-wine flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-charcoal">{t.cashflowTitle}</h3>
              <p className="text-[11px] text-charcoal-muted">{t.cashflowSub}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-charcoal-muted">7-Day Projected</span>
            <p className="font-heading font-bold text-base text-wine">₹{Math.round(cashflow.total_projected_7d).toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* 7-Day Bar Chart representation */}
        <div className="mt-4">
          <div className="grid grid-cols-7 gap-1.5 items-end h-24 pt-2">
            {cashflow.days.map((d, i) => {
              const heightPercent = Math.min(100, Math.max(25, (d.projected_inflow / 14000) * 100));
              const isWarning = d.risk_level === 'warning';
              return (
                <div key={i} className="flex flex-col items-center justify-end h-full">
                  <span className="text-[9px] font-semibold text-charcoal-muted mb-1">
                    ₹{Math.round(d.projected_inflow / 1000)}k
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      isWarning ? 'bg-amber-400' : 'bg-wine'
                    }`}
                    title={`${d.day_name}: ₹${d.projected_inflow}`}
                  />
                  <span className="text-[10px] font-medium text-charcoal mt-1">{d.day_name.slice(0, 3)}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 p-2.5 rounded-xl bg-sand/70 border border-gold/20 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-charcoal font-medium leading-snug">
              {cashflow.recommended_action}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gold/20 flex items-center justify-between text-[11px] text-charcoal-muted">
        <span>Based solely on your historical UPI sales</span>
        <span className="text-wine font-semibold cursor-pointer hover:underline">Distributor Schedule</span>
      </div>
    </div>
  );
}
