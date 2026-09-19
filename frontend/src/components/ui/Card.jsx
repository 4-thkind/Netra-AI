import React from 'react';

/**
 * Shared card shell for every intelligence module.
 *
 * Every dashboard card previously repeated the same 6 utility classes and its
 * own header markup, which is why they had drifted apart. One shell keeps the
 * wine/gold/sand system consistent and makes the mobile variants trivial.
 */
export function Card({ className = '', children, ...rest }) {
  return (
    <div
      className={`bg-cream rounded-2xl border border-gold/30 shadow-card
                  flex flex-col ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ Icon, title, subtitle, badge, tone = 'wine' }) {
  const tones = {
    wine: 'bg-wine/10 text-wine',
    gold: 'bg-gold/20 text-gold-dark',
    emerald: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="flex items-start justify-between gap-2 px-4 sm:px-5 pt-4 sm:pt-5 pb-3
                    border-b border-gold/20">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <span className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${tones[tone]}`}>
            <Icon className="w-[18px] h-[18px]" />
          </span>
        )}
        <span className="min-w-0">
          <h3 className="font-heading font-bold text-[15px] sm:text-base text-charcoal truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-charcoal-muted truncate">{subtitle}</p>
          )}
        </span>
      </div>
      {badge && <div className="shrink-0">{badge}</div>}
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={`px-4 sm:px-5 py-4 flex-1 ${className}`}>{children}</div>;
}

/**
 * Card footer. `action` renders a real button; a footer must never contain
 * something that merely looks tappable.
 */
export function CardFooter({ note, action }) {
  return (
    <div className="px-4 sm:px-5 py-3 border-t border-gold/20 flex items-center justify-between gap-3">
      {note && <span className="text-[11px] text-charcoal-muted min-w-0 truncate">{note}</span>}
      {action}
    </div>
  );
}

export function Pill({ tone = 'neutral', children, className = '' }) {
  const tones = {
    neutral: 'bg-sand text-charcoal-muted border-gold/30',
    wine: 'bg-wine text-cream border-wine',
    gold: 'bg-gold/20 text-charcoal border-gold/40',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    sky: 'bg-sky-100 text-sky-800 border-sky-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide
                      px-2 py-0.5 rounded-full border ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** Text link styled as a button. Requires onClick - no decorative links. */
export function LinkButton({ onClick, children, Icon, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`text-wine font-semibold text-xs inline-flex items-center gap-1 shrink-0
                  hover:text-wine-dark hover:underline underline-offset-2 transition-colors ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{children}</span>
    </button>
  );
}

/** Loading placeholder that keeps layout height stable while data arrives. */
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`rounded-xl bg-gradient-to-r from-sand via-cream to-sand bg-[length:200%_100%]
                  animate-pulse ${className}`}
    />
  );
}
