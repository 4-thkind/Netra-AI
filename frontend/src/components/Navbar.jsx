import React, { useState } from 'react';
import { Eye, ShieldCheck, Activity, Terminal, Workflow, Radio, MessageSquare, Map, Globe, ChevronDown } from 'lucide-react';
import { languages, translations } from '../i18n/translations';

export default function Navbar({
  activeTab,
  setActiveTab,
  merchant,
  lang,
  setLang,
  onOpenSoundbox,
  onOpenWhatsApp,
  onOpenClusterMap
}) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const t = translations[lang]?.nav || translations.en.nav;

  const currentLangObj = languages.find(l => l.code === lang) || languages[0];

  return (
    <header className="sticky top-0 z-40 bg-wine text-cream shadow-md border-b border-wine-light">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 rounded-full bg-cream flex items-center justify-center shadow-inner border border-gold shrink-0">
            <Eye className="w-5 h-5 text-wine" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-heading font-bold text-lg sm:text-xl tracking-wider text-cream">NETRĀ</span>
              <span className="text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.2 rounded bg-gold text-charcoal">
                Paytm
              </span>
            </div>
            <p className="text-[10px] text-gold-light tracking-tight font-medium hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <nav className="hidden lg:flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-cream text-wine shadow-sm' 
                : 'text-cream hover:bg-wine-light'
            }`}
          >
            {t.copilot}
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
              activeTab === 'privacy' 
                ? 'bg-cream text-wine shadow-sm' 
                : 'text-cream hover:bg-wine-light'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            <span>{t.privacy}</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
              activeTab === 'security' 
                ? 'bg-cream text-wine shadow-sm' 
                : 'text-cream hover:bg-wine-light'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-gold" />
            <span>{t.sentinel}</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1 transition-all border ${
              activeTab === 'simulator'
                ? 'bg-gold text-charcoal border-cream shadow-sm'
                : 'bg-wine-dark text-gold border-gold/40 hover:border-gold'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{t.simulator}</span>
          </button>
        </nav>

        {/* Right Action Icons & Hardware Triggers */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">

          {/* Soundbox Hardware Trigger */}
          <button
            onClick={onOpenSoundbox}
            title="Open Paytm Soundbox 4.0 Physical Device Mock"
            className="p-2 rounded-lg bg-wine-light hover:bg-cream hover:text-wine text-cream text-xs font-semibold transition-all border border-wine/40"
          >
            <Radio className="w-4 h-4 text-gold" />
          </button>

          {/* WhatsApp Kirana Trigger */}
          <button
            onClick={onOpenWhatsApp}
            title="Open WhatsApp Merchant Simulator"
            className="p-2 rounded-lg bg-wine-light hover:bg-cream hover:text-wine text-cream text-xs font-semibold transition-all border border-wine/40"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Cluster Map Visualizer Trigger */}
          <button
            onClick={onOpenClusterMap}
            title="Open Hyperlocal Cluster Map"
            className="p-2 rounded-lg bg-wine-light hover:bg-cream hover:text-wine text-cream text-xs font-semibold transition-all border border-wine/40"
          >
            <Map className="w-4 h-4 text-sky-400" />
          </button>

          {/* Regional Language Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="px-2.5 py-1.5 rounded-lg bg-wine-dark text-gold text-xs font-bold border border-gold/40 hover:border-gold flex items-center space-x-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-gold-light" />
              <span>{currentLangObj.label}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-cream text-charcoal rounded-xl shadow-xl border border-gold/40 py-1 z-50 animate-fadeIn">
                <div className="px-3 py-1 text-[9px] font-bold uppercase text-charcoal-muted border-b border-gold/20">
                  Select Language
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                      lang === l.code ? 'bg-wine text-cream font-bold' : 'hover:bg-sand text-charcoal'
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="text-[10px] opacity-70">{l.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
