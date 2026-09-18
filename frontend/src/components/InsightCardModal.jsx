import React from 'react';
import { X, CheckCircle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function InsightCardModal({ insight, onClose, onAction, lang = 'hi' }) {
  if (!insight) return null;

  const t = translations[lang]?.insightModal || translations.en.insightModal;
  const def = t.defaultInsight || translations.en.insightModal.defaultInsight;

  const isDefaultInsight = !insight.is_custom && (insight.id === 'hero_insight' || !insight.what);
  const title = isDefaultInsight ? def.title : insight.title;
  const what = isDefaultInsight ? def.what : insight.what;
  const why = isDefaultInsight ? def.why : insight.why;
  const soWhat = isDefaultInsight ? def.so_what : insight.so_what;
  const action = isDefaultInsight ? def.expected_action : insight.expected_action;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-sm p-4">
      <div className="bg-cream rounded-2xl max-w-xl w-full border border-gold/40 shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="bg-wine text-cream px-6 py-4 flex items-center justify-between border-b border-gold/30">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-gold">{t.badge}</span>
            <h3 className="text-lg font-heading font-bold text-cream leading-tight">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-wine-light text-cream/80 hover:text-cream">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Part Structure (Section 31 of Spec) */}
        <div className="p-6 space-y-4">
          
          {/* WHAT */}
          <div className="bg-sand/60 rounded-xl p-3.5 border border-gold/20">
            <h4 className="text-xs font-bold text-wine uppercase tracking-wider">{t.whatTitle}</h4>
            <p className="text-sm font-medium text-charcoal mt-1">{what}</p>
          </div>

          {/* WHY */}
          <div className="bg-sand/60 rounded-xl p-3.5 border border-gold/20">
            <h4 className="text-xs font-bold text-wine uppercase tracking-wider">{t.whyTitle}</h4>
            <p className="text-sm font-medium text-charcoal mt-1">{why}</p>
          </div>

          {/* SO WHAT */}
          <div className="bg-sand/60 rounded-xl p-3.5 border border-gold/20">
            <h4 className="text-xs font-bold text-wine uppercase tracking-wider">{t.soWhatTitle}</h4>
            <p className="text-sm font-medium text-charcoal mt-1">{soWhat}</p>
          </div>

          {/* ACTION */}
          <div className="bg-wine/5 rounded-xl p-4 border border-wine/20">
            <h4 className="text-xs font-bold text-wine uppercase tracking-wider flex items-center space-x-1.5">
              <span>{t.actionTitle}</span>
              <span className="text-[10px] bg-wine text-cream px-2 py-0.5 rounded">{t.safeGuidance}</span>
            </h4>
            <p className="text-sm font-semibold text-charcoal mt-1">{action}</p>
          </div>


          {/* Privacy Footnote */}
          <div className="flex items-center space-x-2 text-[11px] text-charcoal-muted pt-1">
            <ShieldCheck className="w-4 h-4 text-wine shrink-0" />
            <span>{t.privacyShield}</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-sand px-6 py-3.5 border-t border-gold/30 flex items-center justify-between">
          <button
            onClick={() => {
              onAction(insight.id, 'dismiss');
              onClose();
            }}
            className="text-xs font-medium text-charcoal-muted hover:text-charcoal px-3 py-1.5"
          >
            {t.dismissBtn}
          </button>
          
          <button
            onClick={() => {
              onAction(insight.id, 'accepted');
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-wine hover:bg-wine-dark text-cream text-xs font-semibold shadow-sm flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4 text-gold" />
            <span>{t.actionBtn}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

