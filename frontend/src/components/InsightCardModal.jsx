import React from 'react';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import Sheet from './ui/Sheet';
import { Pill } from './ui/Card';
import { translations } from '../i18n/translations';

export default function InsightCardModal({ insight, onClose, onAction, lang = 'hi' }) {
  const t = translations[lang]?.insightModal || translations.en.insightModal;
  const def = t.defaultInsight || translations.en.insightModal.defaultInsight;

  if (!insight) return null;

  const isDefault = !insight.is_custom && (insight.id === 'hero_insight' || !insight.what);
  const title  = isDefault ? def.title : insight.title;
  const what   = isDefault ? def.what : insight.what;
  const why    = isDefault ? def.why : insight.why;
  const soWhat = isDefault ? def.so_what : insight.so_what;
  const action = isDefault ? def.expected_action : insight.expected_action;

  const fire = (verdict) => { onAction?.(insight.id, verdict); onClose?.(); };

  return (
    <Sheet
      isOpen={!!insight}
      onClose={onClose}
      title={title}
      badge={<Pill tone="gold">{t.badge}</Pill>}
      size="md"
      footer={
        // Stacked and full-width on a phone so both actions are thumb-sized;
        // side by side on desktop.
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
          <button
            onClick={() => fire('dismiss')}
            className="h-11 sm:h-9 px-4 rounded-xl text-xs font-semibold text-charcoal-muted
                       hover:text-charcoal hover:bg-sand transition-colors"
          >
            {t.dismissBtn}
          </button>
          <button
            onClick={() => fire('accepted')}
            className="h-11 sm:h-9 px-5 rounded-xl bg-wine hover:bg-wine-dark text-cream text-xs
                       font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <CheckCircle className="w-4 h-4 text-gold" />
            <span>{t.actionBtn}</span>
          </button>
        </div>
      }
    >
      <div className="p-5 space-y-3">
        {[
          [t.whatTitle, what],
          [t.whyTitle, why],
          [t.soWhatTitle, soWhat],
        ].map(([heading, body]) => (
          <section key={heading} className="bg-sand/60 rounded-xl p-3.5 border border-gold/20">
            <h4 className="text-[10px] font-bold text-wine uppercase tracking-wider">{heading}</h4>
            <p className="text-[13px] sm:text-sm font-medium text-charcoal mt-1 leading-relaxed">{body}</p>
          </section>
        ))}

        <section className="bg-wine/5 rounded-xl p-4 border border-wine/20">
          <h4 className="text-[10px] font-bold text-wine uppercase tracking-wider flex flex-wrap items-center gap-2">
            <span>{t.actionTitle}</span>
            <Pill tone="wine">{t.safeGuidance}</Pill>
          </h4>
          <p className="text-[13px] sm:text-sm font-semibold text-charcoal mt-1.5 leading-relaxed">{action}</p>
        </section>

        <p className="flex items-start gap-2 text-[11px] text-charcoal-muted pt-0.5">
          <ShieldCheck className="w-4 h-4 text-wine shrink-0 mt-px" />
          <span>{t.privacyShield}</span>
        </p>
      </div>
    </Sheet>
  );
}
