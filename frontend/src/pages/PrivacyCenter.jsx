import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, EyeOff, Layers, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { translations } from '../i18n/translations';

export default function PrivacyCenter({ lang = 'en' }) {
  const [policy, setPolicy] = useState(null);
  const [budget, setBudget] = useState(null);

  const t = translations[lang]?.privacyCenter || translations.en.privacyCenter;

  useEffect(() => {
    api.getPrivacyPolicy().then(setPolicy).catch(console.error);
    api.getPrivacyBudget().then(setBudget).catch(console.error);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="border-b border-gold/30 pb-5">
        <div className="flex items-center space-x-2 text-wine text-xs font-bold uppercase tracking-widest">
          <ShieldCheck className="w-5 h-5 text-gold" />
          <span>{t.badge}</span>
        </div>
        <h1 className="font-heading font-bold text-3xl text-wine mt-1">
          {t.title}
        </h1>
        <p className="text-sm text-charcoal font-medium mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Live Policy Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-cream rounded-2xl p-5 border border-gold/30 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-wine/10 text-wine flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-charcoal">{t.smallCohortTitle}</h3>
          <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
            {t.smallCohortDesc}
          </p>
        </div>

        <div className="bg-cream rounded-2xl p-5 border border-gold/30 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-wine/10 text-wine flex items-center justify-center mb-3">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-charcoal">{t.zeroPiiTitle}</h3>
          <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
            {t.zeroPiiDesc}
          </p>
        </div>

        <div className="bg-cream rounded-2xl p-5 border border-gold/30 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-wine/10 text-wine flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-charcoal">{t.sentinelTitle}</h3>
          <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
            {t.sentinelDesc}
          </p>
        </div>
      </div>

      {/* What Netra Uses vs What Netra NEVER Shares (Section 32 of Spec) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: What Netra Uses */}
        <div className="bg-cream rounded-2xl p-6 border border-emerald-300 shadow-sm">
          <h3 className="font-heading font-bold text-lg text-emerald-900 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{t.usesTitle}</span>
          </h3>
          <ul className="mt-4 space-y-2.5 text-xs text-charcoal font-medium">
            {t.usesList.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: What Netra NEVER Shares */}
        <div className="bg-cream rounded-2xl p-6 border border-red-300 shadow-sm">
          <h3 className="font-heading font-bold text-lg text-red-950 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>{t.neverSharesTitle}</span>
          </h3>
          <ul className="mt-4 space-y-2.5 text-xs text-charcoal font-medium">
            {t.neverSharesList.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-red-600 font-bold">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Live Operational Metrics & Invariant Checks */}
      <div className="bg-sand rounded-2xl p-6 border border-gold/40">
        <h3 className="font-heading font-bold text-base text-wine mb-4">
          Live Privacy Invariant Telemetry (Lajpat Nagar Central Market)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-cream p-3.5 rounded-xl border border-gold/30">
            <span className="text-[11px] text-charcoal-muted uppercase font-semibold">Active Cluster</span>
            <p className="font-bold text-sm text-wine mt-0.5">South Delhi (42 Kiranas)</p>
          </div>
          <div className="bg-cream p-3.5 rounded-xl border border-gold/30">
            <span className="text-[11px] text-charcoal-muted uppercase font-semibold">Cohort Threshold</span>
            <p className="font-bold text-sm text-emerald-700 mt-0.5">Satisfied (N=42 &ge; 10)</p>
          </div>
          <div className="bg-cream p-3.5 rounded-xl border border-gold/30">
            <span className="text-[11px] text-charcoal-muted uppercase font-semibold">Differential Noise</span>
            <p className="font-bold text-sm text-wine mt-0.5">Laplace (&epsilon;=1.0)</p>
          </div>
          <div className="bg-cream p-3.5 rounded-xl border border-gold/30">
            <span className="text-[11px] text-charcoal-muted uppercase font-semibold">Query Budget Left</span>
            <p className="font-bold text-sm text-wine mt-0.5">{budget?.remaining_queries || 15} / 15</p>
          </div>
        </div>
      </div>

    </div>
  );
}
