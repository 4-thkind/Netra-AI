import React from 'react';
import { Compass, ChevronRight, Map } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter, Pill, LinkButton, Skeleton } from './ui/Card';
import { translations } from '../i18n/translations';

export default function TradeRadarCard({ signals = [], onSelectSignal, onOpenClusterMap, lang = 'hi' }) {
  const t = translations[lang]?.dashboard || translations.en.dashboard;

  const tone = (v) => (v > 0.14 ? 'amber' : v > 0.07 ? 'gold' : 'sky');

  return (
    <Card>
      <CardHeader
        Icon={Compass}
        title={t.tradeRadarTitle}
        subtitle={t.tradeRadarSub}
        badge={<Pill tone="emerald">Live cluster</Pill>}
      />

      <CardBody className="space-y-2">
        {signals.length === 0 && (
          <>
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </>
        )}

        {signals.slice(0, 3).map((sig) => (
          <button
            key={sig.category}
            onClick={() => onSelectSignal?.(sig)}
            className="w-full text-left p-3 rounded-xl bg-sand/60 hover:bg-sand active:bg-sand-dark/60
                       border border-gold/20 flex items-center gap-3 transition-colors group"
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-xs text-charcoal capitalize">{sig.category}</span>
                <Pill tone={tone(sig.market_velocity)}>
                  +{Math.round(sig.market_velocity * 100)}% momentum
                </Pill>
              </span>
              <span className="block text-[11px] text-charcoal-muted mt-1 line-clamp-2 sm:line-clamp-1">
                {sig.recommendation}
              </span>
            </span>
            {/* Always visible on touch - a hover-only affordance is invisible
                on a phone, which is where most of this demo gets seen. */}
            <ChevronRight className="w-4 h-4 text-wine shrink-0 opacity-60 lg:opacity-0
                                     lg:group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </CardBody>

      <CardFooter
        note={`${signals.length} categories tracked`}
        action={
          <LinkButton onClick={onOpenClusterMap} Icon={Map}>
            View cluster map
          </LinkButton>
        }
      />
    </Card>
  );
}
