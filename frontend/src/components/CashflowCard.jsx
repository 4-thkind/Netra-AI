import React, { useState } from 'react';
import { Calendar, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter, Pill, LinkButton, Skeleton } from './ui/Card';
import { translations } from '../i18n/translations';

const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function CashflowCard({ cashflow, lang = 'hi', onOpenDetail }) {
  const t = translations[lang]?.dashboard || translations.en.dashboard;
  const [picked, setPicked] = useState(null);

  if (!cashflow) {
    return (
      <Card>
        <CardHeader Icon={Calendar} title={t.cashflowTitle} subtitle={t.cashflowSub} />
        <CardBody className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-28" />
        </CardBody>
      </Card>
    );
  }

  const days = cashflow.days || [];
  const peak = Math.max(...days.map((d) => d.projected_inflow), 1);
  const active = picked !== null ? days[picked] : null;

  return (
    <Card>
      <CardHeader
        Icon={Calendar}
        title={t.cashflowTitle}
        subtitle={t.cashflowSub}
        badge={
          <div className="text-right">
            <span className="block text-[10px] uppercase font-semibold text-charcoal-light">7-day</span>
            <span className="font-heading font-bold text-base text-wine">
              {inr(cashflow.total_projected_7d)}
            </span>
          </div>
        }
      />

      <CardBody>
        {/* Bars are buttons so a phone user can tap to read an exact value -
            a `title` tooltip never appears on touch. */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 items-end h-28">
          {days.map((d, i) => {
            const h = Math.max(18, (d.projected_inflow / peak) * 100);
            const warn = d.risk_level === 'warning';
            const on = picked === i;
            return (
              <button
                key={i}
                onClick={() => setPicked(on ? null : i)}
                aria-label={`${d.day_name}: ${inr(d.projected_inflow)}`}
                className="h-full flex flex-col items-center justify-end gap-1 group"
              >
                <span className={`text-[9px] font-bold tabular-nums transition-colors
                                  ${on ? 'text-wine' : 'text-charcoal-light'}`}>
                  {Math.round(d.projected_inflow / 1000)}k
                </span>
                <span
                  style={{ height: `${h}%` }}
                  className={`w-full rounded-t-md transition-all
                              ${warn ? 'bg-amber-400' : on ? 'bg-wine' : 'bg-wine/75'}
                              ${on ? 'ring-2 ring-gold ring-offset-1 ring-offset-cream' : ''}
                              group-hover:bg-wine`}
                />
                <span className={`text-[10px] font-semibold ${on ? 'text-wine' : 'text-charcoal-muted'}`}>
                  {d.day_name.slice(0, 3)}
                </span>
              </button>
            );
          })}
        </div>

        {active ? (
          <div className="mt-3 p-3 rounded-xl bg-wine text-cream border border-gold/30 animate-riseIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">{active.day_name}</span>
              <Pill tone={active.risk_level === 'warning' ? 'amber' : 'gold'}>
                {active.risk_level}
              </Pill>
            </div>
            <p className="font-heading font-bold text-lg mt-0.5">{inr(active.projected_inflow)}</p>
            <p className="text-[11px] text-sand mt-0.5">
              Confidence band {inr(active.confidence_low)} – {inr(active.confidence_high)}
            </p>
          </div>
        ) : (
          <div className="mt-3 p-3 rounded-xl bg-sand/70 border border-gold/20 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-px" />
            <p className="text-[11px] sm:text-xs text-charcoal font-medium leading-snug">
              {cashflow.recommended_action}
            </p>
          </div>
        )}
      </CardBody>

      <CardFooter
        note={
          // Surface the model card: a money forecast should say how it was made.
          cashflow.model?.is_fitted
            ? `Fitted on ${cashflow.model.fitted_on_days}d · R²=${cashflow.model.r_squared} · peak ${cashflow.model.peak_day}`
            : 'From your own UPI history only'
        }
        action={
          <LinkButton onClick={onOpenDetail} Icon={TrendingUp}>
            Full forecast
          </LinkButton>
        }
      />
    </Card>
  );
}
