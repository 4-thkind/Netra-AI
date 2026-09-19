import React, { useState } from 'react';
import { Sparkles, ShoppingBag, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter, Pill, Skeleton } from './ui/Card';
import { api } from '../services/api';
import { translations } from '../i18n/translations';

export default function FestivalCard({ festival, lang = 'hi' }) {
  const t = translations[lang]?.dashboard || translations.en.dashboard;
  const [state, setState] = useState('idle'); // idle | sending | sent
  const [execId, setExecId] = useState(null);

  if (!festival) {
    return (
      <Card>
        <CardHeader Icon={Sparkles} tone="gold" title={t.festivalTitle} subtitle={t.festivalSub} />
        <CardBody className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-12" />
        </CardBody>
      </Card>
    );
  }

  // Previously a button with no handler. It now fires the real n8n festival
  // workflow (POST /n8n/trigger/festival) and reports the execution id.
  const raisePO = async () => {
    setState('sending');
    try {
      const res = await api.triggerN8nFestival();
      setExecId(res.execution_id);
      setState('sent');
    } catch (e) {
      console.error('Festival PO trigger failed:', e);
      setState('idle');
    }
  };

  return (
    <Card>
      <CardHeader
        Icon={Sparkles}
        tone="gold"
        title={t.festivalTitle}
        subtitle={t.festivalSub}
        badge={
          <Pill tone="wine">
            <Clock className="w-3 h-3" />
            T–{festival.days_remaining}d
          </Pill>
        }
      />

      <CardBody className="space-y-3">
        <div className="rounded-xl bg-sand/70 border border-gold/20 p-3">
          <div className="flex items-start justify-between gap-2">
            <span className="font-heading font-semibold text-sm text-wine">{festival.festival_name}</span>
            <Pill tone="emerald" className="shrink-0">{festival.impact_level}</Pill>
          </div>

          <p className="text-[11px] text-charcoal-muted mt-2">Recommended stock preparation</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {festival.recommended_stock?.map((item) => (
              <span key={item} className="text-[11px] bg-cream px-2 py-0.5 rounded-lg
                                          border border-gold/30 text-charcoal font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-sand/50 border border-gold/20 p-3">
          <h4 className="text-[10px] uppercase font-semibold text-wine tracking-wider">Suggested kit offer</h4>
          <p className="text-xs font-semibold text-charcoal mt-0.5">{festival.suggested_offer}</p>
        </div>

        <button
          onClick={raisePO}
          disabled={state !== 'idle'}
          className={`w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2
                      border transition-colors shadow-subtle disabled:cursor-default
                      ${state === 'sent'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-wine text-cream border-gold/30 hover:bg-wine-dark'}`}
        >
          {state === 'idle' && (<><ShoppingBag className="w-4 h-4 text-gold" />Raise 1-tap distributor PO</>)}
          {state === 'sending' && (<><Loader2 className="w-4 h-4 animate-spin" />Dispatching via n8n…</>)}
          {state === 'sent' && (<><CheckCircle2 className="w-4 h-4" />PO tender dispatched</>)}
        </button>
      </CardBody>

      <CardFooter
        note={execId ? `n8n execution ${execId}` : 'Auto-synced with n8n T-14 alert'}
      />
    </Card>
  );
}
