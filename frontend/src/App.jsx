import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import PrivacyCenter from './pages/PrivacyCenter';
import SecuritySentinel from './pages/SecuritySentinel';
import AttackSimulator from './pages/AttackSimulator';
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

  // Modals state
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
      .catch((err) => console.error('Failed to initialize demo session:', err));
  }, []);

  return (
    <div className="min-h-screen bg-cream flex flex-col selection:bg-wine selection:text-white">
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

      {/* Real-time Paytm Transaction Ticker Bar */}
      <div className="bg-sand border-b border-gold/30 px-4 py-1.5 text-center overflow-hidden">
        <div className="flex items-center justify-center space-x-3 text-[11px] text-charcoal font-medium animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span><strong>{tTicker.liveStream}</strong> {tTicker.sampleTxn}</span>
          <span className="hidden sm:inline text-gold">|</span>
          <span className="hidden sm:inline text-wine font-semibold">{tTicker.shieldStatus}</span>
        </div>
      </div>

      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <Dashboard
            merchant={merchant}
            onSelectInsight={setActiveInsight}
            activeInsight={activeInsight}
            onCloseInsight={() => setActiveInsight(null)}
            lang={lang}
          />
        )}
        {activeTab === 'privacy' && <PrivacyCenter lang={lang} />}
        {activeTab === 'security' && <SecuritySentinel lang={lang} />}
        {activeTab === 'simulator' && (
          <AttackSimulator
            lang={lang}
            onNavigateToSentinel={() => setActiveTab('security')}
          />
        )}
      </main>

      {/* Interactive Modals */}
      <SoundboxDeviceModal isOpen={soundboxOpen} onClose={() => setSoundboxOpen(false)} lang={lang} />
      <WhatsAppSimulatorModal isOpen={whatsAppOpen} onClose={() => setWhatsAppOpen(false)} lang={lang} />
      <ClusterMapModal isOpen={clusterMapOpen} onClose={() => setClusterMapOpen(false)} lang={lang} />

      {/* Footer */}
      <footer className="bg-sand border-t border-gold/30 py-5 text-center text-xs text-charcoal-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium">
            NETRĀ • AI Growth Copilot for Indian Kirana Merchants • Paytm Hackathon 2026
          </p>
          <div className="flex items-center space-x-3 text-[11px] text-wine font-semibold">
            <span>Primary Invariant: Network Intelligence Without Merchant Exposure</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
