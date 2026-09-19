import React, { useEffect, useRef, useState } from 'react';
import {
  Eye, ShieldCheck, Activity, Terminal, Workflow,
  Radio, MessageSquare, Map, Globe, ChevronDown, Check,
} from 'lucide-react';
import { languages, translations } from '../i18n/translations';

export const TABS = [
  { id: 'dashboard', key: 'copilot', Icon: Eye },
  { id: 'n8n', key: 'n8n', Icon: Workflow },
  { id: 'privacy', key: 'privacy', Icon: ShieldCheck },
  { id: 'security', key: 'sentinel', Icon: Activity },
  { id: 'simulator', key: 'simulator', Icon: Terminal },
];

/** Short labels for the bottom tab bar, where full names never fit. */
const SHORT = {
  dashboard: 'Copilot',
  n8n: 'n8n',
  privacy: 'Privacy',
  security: 'Audit',
  simulator: 'Attack',
};

function LanguageMenu({ lang, setLang, compact = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = languages.find((l) => l.code === lang) || languages[0];

  // Close on outside click / Escape - a dropdown that traps the page is the
  // fastest way to make a demo feel broken.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        className="h-9 lg:h-10 px-2 lg:px-3 rounded-xl bg-wine-dark/70 text-gold text-xs lg:text-[13px] font-bold border border-gold/40
                   hover:border-gold hover:bg-wine-dark flex items-center gap-1.5 transition-colors"
      >
        <Globe className="w-3.5 h-3.5 text-gold-light shrink-0" />
        <span className={compact ? 'hidden' : 'hidden xl:inline'}>{current.label}</span>
        <span className={compact ? '' : 'xl:hidden'}>{current.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-cream text-charcoal rounded-xl shadow-lift
                        border border-gold/40 p-1.5 z-50 animate-riseIn overflow-hidden">
          <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-charcoal-light">
            Soundbox Language
          </p>
          <div className="space-y-0.5">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                className={`w-full h-10 text-left px-3 rounded-md text-xs font-medium flex items-center justify-between
                            transition-colors ${lang === l.code ? 'bg-wine text-cream font-semibold' : 'hover:bg-sand text-charcoal'}`}
              >
                <span>{l.label}</span>
                {lang === l.code
                  ? <Check className="w-3.5 h-3.5 text-gold" />
                  : <span className="text-[10px] opacity-50">{l.code.toUpperCase()}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar({
  activeTab, setActiveTab, merchant, lang, setLang,
  onOpenSoundbox, onOpenWhatsApp, onOpenClusterMap,
}) {
  const t = translations[lang]?.nav || translations.en.nav;

  const deviceButtons = [
    { onClick: onOpenSoundbox, label: 'Paytm Soundbox', Icon: Radio, tint: 'text-gold' },
    { onClick: onOpenWhatsApp, label: 'WhatsApp Copilot', Icon: MessageSquare, tint: 'text-emerald-400' },
    { onClick: onOpenClusterMap, label: 'Cluster Map', Icon: Map, tint: 'text-sky-400' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-wine text-cream shadow-[0_1px_0_rgba(201,169,110,.35)]">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 h-16 lg:h-[72px] flex items-center gap-3 lg:gap-5">

        {/* Brand */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 min-w-0 shrink-0 text-left"
        >
          <span className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-cream flex items-center justify-center
                           border border-gold shrink-0 shadow-inner">
            <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-wine" />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-xl lg:text-2xl tracking-wide text-cream">NETRĀ</span>
              <span className="text-[9px] uppercase tracking-widest font-bold px-1.5 py-px rounded
                               bg-gold text-charcoal shrink-0">Paytm</span>
            </span>
            <span className="hidden lg:block text-[11px] text-gold-light font-medium truncate">
              {t.tagline}
            </span>
          </span>
        </button>

        {/* Desktop nav - full labels, generous targets */}
        <nav className="hidden lg:flex items-center gap-1 mx-auto">
          {TABS.map(({ id, key, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                aria-current={active ? 'page' : undefined}
                className={`h-10 px-4 rounded-xl text-[13px] font-semibold flex items-center gap-2
                            transition-colors ${active
                              ? 'bg-cream text-wine shadow-sm'
                              : 'text-cream/90 hover:bg-wine-light hover:text-cream'}`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-wine' : 'text-gold'}`} />
                <span>{t[key]}</span>
              </button>
            );
          })}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-1.5 ml-auto lg:ml-0 shrink-0">
          {/* Channel simulators: icon-only everywhere, labelled by title/aria */}
          {deviceButtons.map(({ onClick, label, Icon, tint }) => (
            <button
              key={label}
              onClick={onClick}
              title={label}
              aria-label={label}
              className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-wine-light/70 hover:bg-cream hover:text-wine
                         border border-gold/30 flex items-center justify-center transition-colors"
            >
              <Icon className={`w-4 h-4 lg:w-[18px] lg:h-[18px] ${tint}`} />
            </button>
          ))}
          <LanguageMenu lang={lang} setLang={setLang} />
        </div>
      </div>

      {/* Merchant strip - desktop only; on mobile this lives in the dashboard header */}
      {merchant && (
        <div className="hidden lg:block bg-wine-dark/40 border-t border-gold/20">
          <div className="max-w-[1600px] mx-auto px-8 py-1.5 flex items-center gap-2.5 text-xs text-cream/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-semibold text-cream">{merchant.name}</span>
            <span className="text-gold/60">•</span>
            <span>{merchant.cluster_id?.replace(/_/g, ' ')}</span>
            <span className="text-gold/60">•</span>
            <span>Soundbox {merchant.soundbox_id || 'SBX-DL-4019-V4'}</span>
          </div>
        </div>
      )}
    </header>
  );
}

/**
 * Fixed bottom tab bar - the mobile navigation pattern users already know from
 * every app on their phone. Replaces the horizontally-scrolling strip, which
 * hid tabs off-screen and had no notion of "where am I".
 */
export function MobileTabBar({ activeTab, setActiveTab, lang }) {
  const t = translations[lang]?.nav || translations.en.nav;

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/95 backdrop-blur border-t border-gold/40
                 shadow-tabbar pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Main navigation"
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ id, key, Icon }) => {
          const active = activeTab === id;
          return (
            <li key={id}>
              <button
                onClick={() => setActiveTab(id)}
                aria-current={active ? 'page' : undefined}
                className="w-full h-16 flex flex-col items-center justify-center gap-1 relative"
              >
                {/* Active indicator sits at the top edge, like iOS/Android tabs */}
                <span className={`absolute top-0 h-0.5 w-8 rounded-full transition-colors
                                  ${active ? 'bg-wine' : 'bg-transparent'}`} />
                <Icon className={`w-5 h-5 transition-colors ${active ? 'text-wine' : 'text-charcoal-light'}`} />
                <span className={`text-[10px] leading-none font-semibold transition-colors
                                  ${active ? 'text-wine' : 'text-charcoal-light'}`}>
                  {SHORT[id] || t[key]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
