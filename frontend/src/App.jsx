import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import Navbar, { MobileTabBar } from './components/Navbar';
import Dashboard from './pages/Dashboard';
import PrivacyCenter from './pages/PrivacyCenter';
import SecuritySentinel from './pages/SecuritySentinel';
import AttackSimulator from './pages/AttackSimulator';
import N8nHub from './pages/N8nHub';
import SoundboxDeviceModal from './components/SoundboxDeviceModal';
import WhatsAppSimulatorModal from './components/WhatsAppSimulatorModal';
import ClusterMapModal from './components/ClusterMapModal';
import { api } from './services/api';
import { translations } from './i18n/translations';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lang, setLang] = useState('en');
  const [merchant, setMerchant] = useState(null);
  const [activeInsight, setActiveInsight] = useState(null);
  const [bootError, setBootError] = useState(null);

  const [soundboxOpen, setSoundboxOpen] = useState(false);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [clusterMapOpen, setClusterMapOpen] = useState(false);

  const tTicker = translations[lang]?.ticker || translations.en.ticker;

  useEffect(() => {
    api.getDemoToken()
      .then((data) => {
        localStorage.setItem('netra_token', data.access_token);
        return api.getProfile();
      })
      .then(setMerchant)
      .catch((err) => {
        console.error('Failed to initialize demo session:', err);
        setBootError('Cannot reach the Netrā API. Is the backend running on port 8000?');
      });
  }, []);

  // Jumping tabs should always land at the top of the new page.
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [activeTab]);

  return (
    <div className="min-h-screen bg-cream flex flex-col selection:bg-wine selection:text-cream">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        merchant={merchant}
        lang={lang}
        setLang={setLang}
        onOpenSoundbox={() => setSoundboxOpen(true)}
        onOpenWhatsApp={() => setWhatsAppOpen(true)}
        onOpenClusterMap={() => setClusterMapOpen(true)}
      />

      {/* Live Paytm transaction ticker. Marquee on phones (no room to centre
          three items), static and centred from sm up. */}
      <div className="bg-sand border-b border-gold/30 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 py-1.5 flex items-center justify-center gap-2.5
                        text-[11px] text-charcoal font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
          <span className="truncate">
            <strong className="text-wine">{tTicker.liveStream}</strong> {tTicker.sampleTxn}
          </span>
          <span className="hidden sm:inline text-gold/70">|</span>
          <span className="hidden sm:inline text-wine font-semibold shrink-0">{tTicker.shieldStatus}</span>
        </div>
      </div>

      {bootError && (
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
          <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-900">
            {bootError}
          </p>
        </div>
      )}

      {/* pb-tabbar keeps content clear of the fixed mobile tab bar. */}
      <main className="flex-1 pb-tabbar lg:pb-0">
        {activeTab === 'dashboard' && (
          <Dashboard
            merchant={merchant}
            onSelectInsight={setActiveInsight}
            activeInsight={activeInsight}
            onCloseInsight={() => setActiveInsight(null)}
            lang={lang}
            onOpenSoundbox={() => setSoundboxOpen(true)}
            onOpenWhatsApp={() => setWhatsAppOpen(true)}
            onOpenClusterMap={() => setClusterMapOpen(true)}
          />
        )}
        {activeTab === 'n8n' && <N8nHub lang={lang} />}
        {activeTab === 'privacy' && (
          <PrivacyCenter lang={lang} onOpenClusterMap={() => setClusterMapOpen(true)} />
        )}
        {activeTab === 'security' && <SecuritySentinel lang={lang} />}
        {activeTab === 'simulator' && (
          <AttackSimulator lang={lang} onNavigateToSentinel={() => setActiveTab('security')} />
        )}
      </main>

      <SoundboxDeviceModal isOpen={soundboxOpen} onClose={() => setSoundboxOpen(false)} lang={lang} />
      <WhatsAppSimulatorModal isOpen={whatsAppOpen} onClose={() => setWhatsAppOpen(false)} lang={lang} />
      <ClusterMapModal isOpen={clusterMapOpen} onClose={() => setClusterMapOpen(false)} lang={lang} />

      {/* Desktop footer. On mobile the tab bar owns the bottom of the screen. */}
      <footer className="hidden lg:block bg-sand border-t border-gold/30 py-5 text-xs text-charcoal-muted">
        <div className="max-w-[1600px] mx-auto px-8 flex items-center justify-between gap-3">
          <p className="font-medium">
            NETRĀ • AI Growth Copilot for Indian Kirana Merchants • Paytm Build for India 2026
          </p>
          <p className="flex items-center gap-1.5 text-wine font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-dark" />
            Network intelligence without merchant exposure
          </p>
        </div>
      </footer>

      <MobileTabBar activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} />
    </div>
  );
}
