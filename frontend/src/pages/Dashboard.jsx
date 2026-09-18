import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import SoundboxPlayer from '../components/SoundboxPlayer';
import TradeRadarCard from '../components/TradeRadarCard';
import PricePulseCard from '../components/PricePulseCard';
import CashflowCard from '../components/CashflowCard';
import FestivalCard from '../components/FestivalCard';
import GrowthMissionCard from '../components/GrowthMissionCard';
import InsightCardModal from '../components/InsightCardModal';
import MerchantCreditStatementModal from '../components/MerchantCreditStatementModal';
import { api } from '../services/api';
import { translations } from '../i18n/translations';

export default function Dashboard({ merchant, onSelectInsight, activeInsight, onCloseInsight, lang = 'hi' }) {
  const [tradeSignals, setTradeSignals] = useState([]);
  const [cashflow, setCashflow] = useState(null);
  const [festival, setFestival] = useState(null);
  const [missions, setMissions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [creditStatementOpen, setCreditStatementOpen] = useState(false);

  const t = translations[lang]?.dashboard || translations.en.dashboard;

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [tr, cf, fest, miss, recs] = await Promise.all([
        api.getTradeRadar().catch(() => ({ signals: [] })),
        api.getCashflow().catch(() => null),
        api.getFestivals().catch(() => ({ upcoming: [] })),
        api.getGrowthMissions().catch(() => ({ missions: [] })),
        api.getRecommendations().catch(() => ({ recommendations: [] }))
      ]);
      setTradeSignals(tr.signals || []);
      setCashflow(cf);
      setFestival(fest.upcoming?.[0] || null);
      setMissions(miss.missions || []);
      setRecommendations(recs.recommendations || []);
    } catch (e) {
      console.error('Error loading dashboard:', e);
    }
  };

  const handleAction = async (recId, action) => {
    try {
      await api.recordAction(recId, action);
      setToastMessage(`Action "${action}" recorded. Cognee memory updated.`);
      setTimeout(() => setToastMessage(null), 4000);
      loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-wine text-cream px-4 py-2.5 rounded-xl shadow-xl border border-gold/40 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-gold" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-wine">
            {t.greeting}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
            {t.storeSubtitle}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCreditStatementOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-wine hover:bg-wine-dark text-cream text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all border border-gold/30"
          >
            <FileText className="w-3.5 h-3.5 text-gold" />
            <span>Credit & P&L Statement</span>
          </button>
          <span className="text-xs bg-wine/10 text-wine font-semibold px-3 py-1 rounded-full border border-wine/20">
            KAGGLE EMPIRICAL DATA
          </span>
        </div>
      </div>

      {/* Soundbox Voice Player with dynamic regional voice */}
      <SoundboxPlayer lang={lang} />

      {/* Hero Signal Card */}
      <div className="bg-wine text-cream rounded-2xl p-6 shadow-md border border-gold/30 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2 text-gold text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>{t.todaySignalTag}</span>
          </div>
          
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-cream mt-2 leading-snug">
            {t.heroHeadline}
          </h2>
          
          <p className="text-sand text-xs sm:text-sm mt-2 leading-relaxed">
            {t.heroBody}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectInsight({
                id: 'hero_insight',
                is_custom: false
              })}
              className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-light text-charcoal font-semibold text-xs transition-all shadow flex items-center space-x-2"
            >
              <span>{t.viewInsightBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>


            <span className="text-[11px] text-gold-light font-medium">
              Confidence: 88% • Network Invariant Safe
            </span>
          </div>
        </div>

        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-wine-light/40 pointer-events-none" />
      </div>

      {/* Core Intelligence Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <TradeRadarCard 
          signals={tradeSignals} 
          lang={lang}
          onSelectSignal={(s) => onSelectInsight({
            id: `tr_${s.category}`,
            title: `${s.category.toUpperCase()} Demand Momentum`,
            what: s.recommendation,
            why: `Cluster velocity is +${Math.round(s.market_velocity*100)}% based on 40+ stores.`,
            so_what: `Your store is currently ${s.merchant_activity_level} in this category.`,
            expected_action: `Expand inventory replenishment for fast-moving SKUs.`,
            confidence: s.opportunity_score
          })}
        />
        <PricePulseCard lang={lang} />
        <CashflowCard cashflow={cashflow} lang={lang} />
        <FestivalCard festival={festival} lang={lang} />
        <GrowthMissionCard missions={missions} lang={lang} />


        {/* Cognee Memory Card */}
        <div className="bg-cream rounded-2xl border border-gold/30 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center space-x-2.5 pb-3 border-b border-gold/20">
              <div className="w-8 h-8 rounded-lg bg-wine/10 text-wine flex items-center justify-center font-bold text-sm">
                🧠
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-charcoal">{t.memoryTitle}</h3>
                <p className="text-[11px] text-charcoal-muted">{t.memorySub}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="p-2.5 rounded-xl bg-sand/60 border border-gold/20 text-xs">
                <span className="font-bold text-wine">Learned Strategy:</span> Value bundling over discounting
              </div>
              <div className="p-2.5 rounded-xl bg-sand/60 border border-gold/20 text-xs">
                <span className="font-bold text-wine">Past Wins:</span> 2 successful combo campaigns recorded
              </div>
              <div className="p-2.5 rounded-xl bg-sand/60 border border-gold/20 text-xs">
                <span className="font-bold text-wine">Active Soundbox Language:</span> {lang.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gold/20 text-[11px] text-charcoal-muted flex justify-between">
            <span>Adaptive Merchant Knowledge</span>
            <span className="text-wine font-semibold">Active</span>
          </div>
        </div>

      </div>

      {/* Insight Modal */}
      <InsightCardModal 
        insight={activeInsight} 
        onClose={onCloseInsight} 
        onAction={handleAction} 
        lang={lang}
      />

      {/* Credit & P&L Statement Underwriting Modal */}
      <MerchantCreditStatementModal
        isOpen={creditStatementOpen}
        onClose={() => setCreditStatementOpen(false)}
        lang={lang}
      />

    </div>
  );
}
