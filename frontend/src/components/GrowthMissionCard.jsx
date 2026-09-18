import React from 'react';
import { Target, Award, ArrowRight } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function GrowthMissionCard({ missions, lang = 'hi' }) {
  const mission = missions?.[0];
  if (!mission) return null;

  const t = translations[lang]?.dashboard || translations.en.dashboard;

  return (
    <div className="bg-cream rounded-2xl border border-gold/30 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-gold/20">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-wine/10 text-wine flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-charcoal">{t.growthMissionTitle}</h3>
              <p className="text-[11px] text-charcoal-muted">{t.growthMissionSub}</p>
            </div>
          </div>

          <span className="text-[10px] font-bold bg-gold text-charcoal px-2 py-0.5 rounded">
            Weekly Sprint
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div className="bg-sand/70 rounded-xl p-3 border border-gold/20">
            <h4 className="font-heading font-bold text-sm text-wine">{mission.title}</h4>
            <p className="text-xs text-charcoal-muted mt-1 leading-snug">{mission.cohort_insight}</p>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[11px] font-semibold text-charcoal mb-1">
                <span>Mission Progress</span>
                <span className="text-wine">{mission.progress}% Complete</span>
              </div>
              <div className="w-full h-2.5 bg-cream rounded-full overflow-hidden border border-gold/30">
                <div 
                  className="h-full bg-wine rounded-full transition-all"
                  style={{ width: `${mission.progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-gold/15 rounded-xl p-3 border border-gold/30 flex items-center space-x-2">
            <Award className="w-5 h-5 text-gold-dark shrink-0" />
            <p className="text-xs font-semibold text-charcoal leading-snug">
              Reward: {mission.reward}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gold/20 flex items-center justify-between text-[11px] text-charcoal-muted">
        <span>{mission.target_days} days remaining</span>
        <span className="text-wine font-semibold cursor-pointer hover:underline flex items-center space-x-1">
          <span>Action Checklist</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
