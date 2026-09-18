import React, { useState, useEffect } from 'react';
import { Tag, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import { translations } from '../i18n/translations';

export default function PricePulseCard({ lang = 'hi' }) {
  const [category, setCategory] = useState('snacks');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const t = translations[lang]?.dashboard || translations.en.dashboard;

  useEffect(() => {
    loadCategoryPrice(category);
  }, [category]);

  const loadCategoryPrice = async (cat) => {
    setLoading(true);
    try {
      const res = await api.getPricePulse(cat);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categoryLabels = {
    snacks: { en: 'Snacks', hi: 'स्नैक्स', ta: 'தின்பண்டங்கள்', te: 'స్నాక్స్', kn: 'ತಿಂಡಿಗಳು', mr: 'स्नॅक्स', bn: 'স্ন্যাক্স' },
    beverages: { en: 'Beverages', hi: 'पेय पदार्थ', ta: 'பானங்கள்', te: 'పానీయాలు', kn: 'ಪಾನೀಯಗಳು', mr: 'पेये', bn: 'পানীয়' },
    staples: { en: 'Staples', hi: 'अनाज/किराना', ta: 'மளிகை', te: 'ధాన్యాలు', kn: 'ದವಸ-ಧಾನ್ಯ', mr: 'धान्य/किराणा', bn: 'নিত্যপণ্য' }
  };

  return (
    <div className="bg-cream rounded-2xl border border-gold/30 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-gold/20">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-wine/10 text-wine flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-charcoal">{t.pricePulseTitle}</h3>
              <p className="text-[11px] text-charcoal-muted">{t.pricePulseSub}</p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-1 bg-sand p-1 rounded-lg">
            {['snacks', 'beverages', 'staples'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize transition-all ${
                  category === cat ? 'bg-wine text-cream shadow-xs' : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                {categoryLabels[cat]?.[lang] || cat}
              </button>
            ))}
          </div>
        </div>


        {data && (
          <div className="mt-4 space-y-3">
            {/* Benchmark distribution bar */}
            <div className="bg-sand/70 rounded-xl p-3 border border-gold/20">
              <div className="flex justify-between text-xs text-charcoal font-medium">
                <span>Category P25: ₹{Math.round(data.category_benchmark_p25)}</span>
                <span className="font-bold text-wine">Market Median: ₹{Math.round(data.category_benchmark_median)}</span>
                <span>Category P75: ₹{Math.round(data.category_benchmark_p75)}</span>
              </div>

              {/* Graphical distribution visual */}
              <div className="relative w-full h-3 bg-cream rounded-full mt-2 overflow-hidden border border-gold/30">
                <div 
                  className="absolute top-0 bottom-0 bg-gold/40"
                  style={{ left: '25%', width: '50%' }}
                  title="Interquartile Range"
                />
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-wine"
                  style={{ left: '50%' }}
                  title="Cluster Median"
                />
                <div 
                  className="absolute top-0 bottom-0 w-2.5 h-2.5 rounded-full bg-wine border-2 border-cream top-0.25 shadow"
                  style={{ left: '72%' }}
                  title="Your Store Average Ticket"
                />
              </div>
              <p className="text-[10px] text-charcoal-muted text-center mt-1.5">
                ● Your Store Ticket (₹{Math.round(data.merchant_median_atv)}) vs Broader Category Distribution
              </p>
            </div>

            {/* Recommended Action */}
            <div className="bg-sand/50 rounded-xl p-3 border border-gold/20">
              <h4 className="text-[11px] uppercase font-bold text-wine tracking-wider">Strategy Guidance</h4>
              <p className="text-xs font-semibold text-charcoal mt-0.5">{data.recommended_action}</p>
            </div>
          </div>
        )}
      </div>

      {/* Strict competition safety banner */}
      <div className="mt-4 pt-3 border-t border-gold/20 flex items-center space-x-1.5 text-[10px] text-charcoal-muted">
        <ShieldAlert className="w-3.5 h-3.5 text-wine shrink-0" />
        <span>{data?.competition_safety_note || "Aggregated over 42 stores. Individual store prices strictly shielded."}</span>
      </div>
    </div>
  );
}
