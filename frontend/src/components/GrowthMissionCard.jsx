import React, { useState } from 'react';
import { Target, Award, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter, Pill, Skeleton } from './ui/Card';
import { translations } from '../i18n/translations';

export default function GrowthMissionCard({ missions = [], lang = 'hi' }) {
  const t = translations[lang]?.dashboard || translations.en.dashboard;
  // The old card rendered missions[0] only and silently dropped the rest.
  const [idx, setIdx] = useState(0);
  const [openGoal, setOpenGoal] = useState(false);
  const mission = missions[idx];

  if (!mission) {
    return (
      <Card>
        <CardHeader Icon={Target} title={t.growthMissionTitle} subtitle={t.growthMissionSub} />
        <CardBody className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-12" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        Icon={Target}
        title={t.growthMissionTitle}
        subtitle={t.growthMissionSub}
        badge={<Pill tone="gold">Weekly sprint</Pill>}
      />

      <CardBody className="space-y-3">
        {/* Mission switcher - only when the network actually sent more than one */}
        {missions.length > 1 && (
          <div className="flex gap-1 p-1 bg-sand rounded-xl">
            {missions.map((m, i) => (
              <button
                key={m.id}
                onClick={() => { setIdx(i); setOpenGoal(false); }}
                className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-colors
                            ${i === idx ? 'bg-wine text-cream shadow-sm' : 'text-charcoal-muted hover:text-charcoal'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        <div className="rounded-xl bg-sand/70 border border-gold/20 p-3">
          <h4 className="font-heading font-bold text-sm text-wine">{mission.title}</h4>
          <p className="text-[11px] text-charcoal-muted mt-1 leading-snug">{mission.cohort_insight}</p>

          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-semibold text-charcoal mb-1">
              <span>Progress</span>
              <span className="text-wine tabular-nums">{mission.progress}%</span>
            </div>
            <div
              className="w-full h-2.5 bg-cream rounded-full overflow-hidden border border-gold/30"
              role="progressbar"
              aria-valuenow={mission.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-gradient-to-r from-wine to-wine-light rounded-full transition-[width] duration-500"
                style={{ width: `${mission.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gold/15 border border-gold/30 p-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-gold-dark shrink-0" />
          <p className="text-[11px] sm:text-xs font-semibold text-charcoal leading-snug">
            {mission.reward}
          </p>
        </div>

        {/* Was a fake-clickable span labelled "Action Checklist". Now a real
            disclosure showing the mission goal the API already returns. */}
        <div className="rounded-xl border border-gold/25 overflow-hidden">
          <button
            onClick={() => setOpenGoal((v) => !v)}
            aria-expanded={openGoal}
            className="w-full px-3 h-9 flex items-center justify-between text-[11px] font-bold
                       text-wine bg-cream hover:bg-sand/70 transition-colors"
          >
            <span>This week's action</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openGoal ? 'rotate-180' : ''}`} />
          </button>
          {openGoal && (
            <p className="px-3 py-2.5 text-xs text-charcoal bg-sand/60 border-t border-gold/20 leading-relaxed">
              {mission.goal}
            </p>
          )}
        </div>
      </CardBody>

      <CardFooter note={`${mission.target_days} days remaining in sprint`} />
    </Card>
  );
}
