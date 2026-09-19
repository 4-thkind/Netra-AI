import React, { useState, useEffect } from 'react';
import {
  Sparkles, ArrowRight, CheckCircle2, FileText, Brain,
  Radio, MessageSquare, Map, Database,
} from 'lucide-react';
import SoundboxPlayer from '../components/SoundboxPlayer';
import TradeRadarCard from '../components/TradeRadarCard';
import PricePulseCard from '../components/PricePulseCard';
import CashflowCard from '../components/CashflowCard';
import FestivalCard from '../components/FestivalCard';
import GrowthMissionCard from '../components/GrowthMissionCard';
import InsightCardModal from '../components/InsightCardModal';
import MerchantCreditStatementModal from '../components/MerchantCreditStatementModal';
import WhatsAppConnectCard from '../components/WhatsAppConnectCard';
import KnowledgeGraphCard from '../components/KnowledgeGraphCard';
import { Card, CardHeader, CardBody, CardFooter, Pill } from '../components/ui/Card';
import { api } from '../services/api';
import { translations } from '../i18n/translations';

export default function Dashboard({
  merchant, onSelectInsight, activeInsight, onCloseInsight, lang = 'hi',
  onOpenSoundbox, onOpenWhatsApp, onOpenClusterMap,
}) {
  const [tradeSignals, setTradeSignals] = useState([]);
  const [cashflow, setCashflow] = useState(null);
  const [festival, setFestival] = useState(null);
  const [missions, setMissions] = useState([]);
  const [toast, setToast] = useState(null);
  const [creditOpen, setCreditOpen] = useState(false);

  const t = translations[lang]?.dashboard || translations.en.dashboard;

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [tr, cf, fest, miss] = await Promise.all([
      api.getTradeRadar().catch(() => ({ signals: [] })),
      api.getCashflow().catch(() => null),
      api.getFestivals().catch(() => ({ upcoming: [] })),
      api.getGrowthMissions().catch(() => ({ missions: [] })),
    ]);
    setTradeSignals(tr.signals || []);
    setCashflow(cf);
    setFestival(fest.upcoming?.[0] || null);
    setMissions(miss.missions || []);
  };

  const handleAction = async (recId, action) => {
    try {
      await api.recordAction(recId, action);
      setToast(`Action "${action}" recorded — Cognee memory updated.`);
      setTimeout(() => setToast(null), 3800);
      loadAll();
    } catch (e) {
      console.error(e);
    }
  };

  const openSignal = (s) => onSelectInsight({
    id: `tr_${s.category}`,
    title: `${s.category} demand momentum`,
    what: s.recommendation,
    why: `Cluster velocity is +${Math.round(s.market_velocity * 100)}% across 40+ stores in your micro-market.`,
    so_what: `Your store is currently ${s.merchant_activity_level} in this category.`,
    expected_action: 'Expand replenishment for fast-moving SKUs in this category.',
    confidence: s.opportunity_score,
  });

  /* Channel shortcuts. On desktop these live in the header; on a phone the
     header has no room, so they get a dedicated row where they are reachable
     by thumb. */
  const channels = [
    { label: 'Soundbox', Icon: Radio, onClick: onOpenSoundbox, tone: 'bg-wine text-cream' },
    { label: 'WhatsApp', Icon: MessageSquare, onClick: onOpenWhatsApp, tone: 'bg-emerald-600 text-white' },
    { label: 'Cluster', Icon: Map, onClick: onOpenClusterMap, tone: 'bg-sky-700 text-white' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">

      {toast && (
        <div className="fixed left-4 right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))]
                        lg:left-auto lg:right-6 lg:bottom-6 lg:w-auto z-50
                        bg-wine text-cream px-4 py-3 rounded-2xl shadow-lift border border-gold/40
                        flex items-center gap-2 animate-riseIn">
          <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Greeting. Merchant meta shows here on mobile (the desktop navbar
          carries its own strip, so it is hidden there to avoid repetition). */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading font-bold text-[22px] sm:text-3xl lg:text-4xl text-wine leading-tight">
            {t.greeting}
          </h1>
          <p className="text-[11px] sm:text-sm text-charcoal-muted mt-0.5 lg:hidden">
            {merchant?.name || t.storeSubtitle}
          </p>
          <p className="hidden lg:block text-sm text-charcoal-muted mt-0.5">{t.storeSubtitle}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCreditOpen(true)}
            className="flex-1 sm:flex-none h-11 px-4 rounded-xl bg-wine hover:bg-wine-dark
                       text-cream text-[13px] font-bold flex items-center justify-center gap-1.5
                       border border-gold/30 shadow-sm transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-gold" />
            <span>Credit &amp; P&amp;L</span>
          </button>
          <Pill tone="gold" className="hidden sm:inline-flex h-10 px-3">
            <Database className="w-3 h-3" />
            Kaggle empirical
          </Pill>
        </div>
      </header>

      {/* Mobile-only channel launcher row */}
      <div className="grid grid-cols-3 gap-2 lg:hidden">
        {channels.map(({ label, Icon, onClick, tone }) => (
          <button
            key={label}
            onClick={onClick}
            className={`h-16 rounded-2xl ${tone} flex flex-col items-center justify-center gap-1
                        shadow-card active:scale-[.97] transition-transform`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
          </button>
        ))}
      </div>

      <SoundboxPlayer lang={lang} />

      {/* Hero signal */}
      <section className="bg-wine text-cream rounded-2xl p-5 sm:p-6 lg:p-8 border border-gold/30
                          shadow-card relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-gold text-[10px] sm:text-xs font-bold
                          uppercase tracking-widest">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{t.todaySignalTag}</span>
          </div>

          <h2 className="font-heading font-bold text-lg sm:text-2xl lg:text-[28px] mt-2 leading-snug">
            {t.heroHeadline}
          </h2>
          <p className="text-sand text-xs sm:text-sm lg:text-base mt-2 leading-relaxed">{t.heroBody}</p>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => onSelectInsight({ id: 'hero_insight', is_custom: false })}
              className="h-11 sm:h-10 px-5 rounded-xl bg-gold hover:bg-gold-light text-charcoal
                         font-bold text-xs flex items-center justify-center gap-2 shadow transition-colors"
            >
              <span>{t.viewInsightBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-gold-light font-medium text-center sm:text-left">
              Confidence 88% • Network invariant safe
            </span>
          </div>
        </div>
        <div className="absolute -right-16 -bottom-20 w-56 h-56 rounded-full bg-wine-light/40 pointer-events-none" />
      </section>

      {/* Module grid. Single column on phones (each card is information-dense
          enough to deserve full width), 2 up on tablet, 3 up on desktop. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
        <TradeRadarCard
          signals={tradeSignals}
          lang={lang}
          onSelectSignal={openSignal}
          onOpenClusterMap={onOpenClusterMap}
        />
        <PricePulseCard lang={lang} />
        <CashflowCard
          cashflow={cashflow}
          lang={lang}
          onOpenDetail={() => setCreditOpen(true)}
        />
        <FestivalCard festival={festival} lang={lang} />
        <GrowthMissionCard missions={missions} lang={lang} />

        {/* Cognee knowledge graph, replacing the old static memory card. */}
        <KnowledgeGraphCard />

        {/* Connect a real number: alerts go out through n8n to WhatsApp. */}
        <WhatsAppConnectCard merchant={merchant} />

      </div>

      <InsightCardModal
        insight={activeInsight}
        onClose={onCloseInsight}
        onAction={handleAction}
        lang={lang}
      />
      <MerchantCreditStatementModal
        isOpen={creditOpen}
        onClose={() => setCreditOpen(false)}
        lang={lang}
      />
    </div>
  );
}
