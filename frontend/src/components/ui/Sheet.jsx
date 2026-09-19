import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * One overlay primitive with two genuinely different presentations:
 *
 *   phone   - bottom sheet: slides up, full width, rounded top, grab handle,
 *             capped at 92vh so the page behind stays visible. This is what a
 *             native app does; a shrunken centre dialog is what a website does.
 *   desktop - centred dialog with a backdrop.
 *
 * Also handles the things ad-hoc modals kept forgetting: Escape to close,
 * background scroll lock, and a backdrop click that does not fire when the
 * drag started inside the panel.
 */
export default function Sheet({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  footer,
  size = 'md',
  bare = false,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl', xl: 'sm:max-w-5xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-charcoal/60 backdrop-blur-sm sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : undefined}
    >
      <div
        className={`w-full ${widths[size]} bg-cream shadow-lift flex flex-col
                    rounded-t-3xl sm:rounded-3xl border border-gold/40
                    max-h-[92vh] sm:max-h-[88vh]
                    animate-sheetUp sm:animate-riseIn
                    pb-[env(safe-area-inset-bottom,0px)] sm:pb-0`}
      >
        {/* Grab handle: signals "drag/dismiss" on touch, pointless on desktop */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <span className="w-10 h-1 rounded-full bg-gold/50" />
        </div>

        {!bare && (
          <div className="flex items-start justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gold/25 shrink-0">
            <div className="min-w-0">
              {badge && <div className="mb-1">{badge}</div>}
              <h3 className="font-heading font-semibold text-base sm:text-lg text-wine leading-tight">
                {title}
              </h3>
              {subtitle && <p className="text-[11px] text-charcoal-muted mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center
                         text-charcoal-muted hover:bg-sand hover:text-wine transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="overflow-y-auto overscroll-contain flex-1">{children}</div>

        {footer && (
          <div className="px-5 sm:px-6 py-4 border-t border-gold/25 bg-sand/50 shrink-0
                          rounded-b-none sm:rounded-b-3xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
