import React, { useState, useEffect } from 'react';
import { Tag, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter, Skeleton } from './ui/Card';
import { api } from '../services/api';
import { translations } from '../i18n/translations';

const CATEGORIES = ['snacks', 'beverages', 'staples'];

const LABELS = {
  snacks:    { en: 'Snacks', hi: 'स्नैक्स', ta: 'தின்பண்டம்', te: 'స్నాక్స్', kn: 'ತಿಂಡಿ', mr: 'स्नॅक्स', bn: 'স্ন্যাক্স' },
  beverages: { en: 'Drinks', hi: 'पेय', ta: 'பானம்', te: 'పానీయాలు', kn: 'ಪಾನೀಯ', mr: 'पेये', bn: 'পানীয়' },
  staples:   { en: 'Staples', hi: 'किराना', ta: 'மளிகை', te: 'ధాన్యాలు', kn: 'ದಿನಸಿ', mr: 'किराणा', bn: 'নিত্যপণ্য' },
};

export default function PricePulseCard({ lang = 'hi' }) {
  const [category, setCategory] = useState('snacks');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const t = translations[lang]?.dashboard || translations.en.dashboard;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.getPricePulse(category)
      .then((res) => { if (alive) setData(res); })
      .catch((err) => console.error('Price pulse failed:', err))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };   // ignore a stale response after a fast tab switch
  }, [category]);

  // The marker used to sit at a hardcoded left:72% no matter what the API
  // returned. Place it on the real P25..P75 scale instead, clamped so an
  // out-of-range ticket still renders inside the track.
  const markerPct = (() => {
    if (!data) return 50;
    const { category_benchmark_p25: lo, category_benchmark_p75: hi, merchant_median_atv: me } = data;
    if (![lo, hi, me].every((n) => typeof n === 'number') || hi <= lo) return 50;
    return Math.min(94, Math.max(6, 25 + ((me - lo) / (hi - lo)) * 50));
  })();

  const above = data && data.merchant_median_atv > data.category_benchmark_p75;

  return (
    <Card>
      <CardHeader
        Icon={Tag}
        title={t.pricePulseTitle}
        subtitle={t.pricePulseSub}
        badge={
          <div className="flex gap-0.5 p-0.5 bg-sand rounded-lg">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors
                            ${category === cat ? 'bg-wine text-cream shadow-sm' : 'text-charcoal-muted hover:text-charcoal'}`}
              >
                {LABELS[cat]?.[lang] || cat}
              </button>
            ))}
          </div>
        }
      />

      <CardBody className="space-y-3">
        {loading && !data && (<><Skeleton className="h-24" /><Skeleton className="h-14" /></>)}

        {data?.suppressed && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800">
              Insight suppressed
            </p>
            <p className="text-xs text-amber-900 mt-1 leading-snug">{data.message}</p>
          </div>
        )}

        {data && !data.suppressed && (
          <>
            <div className="rounded-xl bg-sand/70 border border-gold/20 p-3">
              <div className="flex justify-between text-[11px] font-semibold text-charcoal tabular-nums">
                <span>P25 ₹{Math.round(data.category_benchmark_p25)}</span>
                <span className="text-wine font-bold">Median ₹{Math.round(data.category_benchmark_median)}</span>
                <span>P75 ₹{Math.round(data.category_benchmark_p75)}</span>
              </div>

              {/* Interquartile band with the merchant's own position marked */}
              <div className="relative w-full h-3.5 bg-cream rounded-full mt-2.5 border border-gold/30">
                <div className="absolute inset-y-0 bg-gold/35 rounded-full" style={{ left: '25%', width: '50%' }} />
                <div className="absolute inset-y-0 w-0.5 bg-wine/70" style={{ left: '50%' }} />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full
                             bg-wine border-2 border-cream shadow transition-[left] duration-500"
                  style={{ left: `${markerPct}%` }}
                />
              </div>

              <p className="text-[10px] text-charcoal-muted text-center mt-2">
                Your ticket <strong className="text-wine">₹{Math.round(data.merchant_median_atv)}</strong>
                {above ? ' — above the local range' : ' — within the local range'}
              </p>
            </div>

            <div className="rounded-xl bg-sand/50 border border-gold/20 p-3">
              <h4 className="text-[10px] uppercase font-bold text-wine tracking-wider">Strategy guidance</h4>
              <p className="text-xs font-semibold text-charcoal mt-0.5 leading-snug">
                {data.recommended_action}
              </p>
            </div>
          </>
        )}
      </CardBody>

      <CardFooter
        note={
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-wine shrink-0" />
            <span className="truncate">
              {data?.competition_safety_note || 'Individual store prices strictly shielded.'}
            </span>
          </span>
        }
      />
    </Card>
  );
}
