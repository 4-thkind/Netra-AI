import React from 'react';
import { Sparkles, ShoppingBag, Clock } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function FestivalCard({ festival, lang = 'hi' }) {
  if (!festival) return null;

  const t = translations[lang]?.dashboard || translations.en.dashboard;

  return (
    <div className="bg-cream rounded-2xl border border-gold/30 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-gold/20">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold/20 text-charcoal flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gold-dark" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-charcoal">{t.festivalTitle}</h3>
              <p className="text-[11px] text-charcoal-muted">{t.festivalSub}</p>
            </div>
          </div>

          <span className="text-[10px] font-bold bg-wine text-cream px-2 py-0.5 rounded flex items-center space-x-1">
            <Clock className="w-3 h-3 text-gold" />
            <span>In {festival.days_remaining} Days</span>
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div className="bg-sand/70 rounded-xl p-3 border border-gold/20">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-sm text-wine">{festival.festival_name}</span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded">
                {festival.impact_level}
              </span>
            </div>

            <p className="text-xs text-charcoal-muted mt-1">Recommended Stock Preparation:</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {festival.recommended_stock.map((item, idx) => (
                <span key={idx} className="text-[11px] bg-cream px-2 py-0.5 rounded border border-gold/30 text-charcoal font-medium">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-sand/50 rounded-xl p-3 border border-gold/20">
            <h4 className="text-[11px] uppercase font-bold text-wine tracking-wider">Suggested Kit Offer</h4>
            <p className="text-xs font-semibold text-charcoal mt-0.5">{festival.suggested_offer}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gold/20 flex items-center justify-between text-[11px] text-charcoal-muted">
        <span>Auto-synced with n8n T-14 alert</span>
        <button className="text-wine font-semibold text-xs hover:underline flex items-center space-x-1">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Distributor PO Ready</span>
        </button>
      </div>
    </div>
  );
}
