import os

files = {}

files["frontend/src/index.css"] = '''@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --wine: #722F37;
  --cream: #FFF8F0;
  --gold: #C9A96E;
  --charcoal: #2D2D2D;
  --muted-wine: #8B4049;
  --soft-sand: #F5EDE3;
}

body {
  background-color: #FFF8F0;
  color: #2D2D2D;
  font-family: 'Inter', sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Poppins', sans-serif;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #F5EDE3;
}
::-webkit-scrollbar-thumb {
  background: #C9A96E;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #722F37;
}
'''

files["frontend/src/services/api.js"] = '''const API_BASE = "http://127.0.0.1:8000/api/v1";

export async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem("netra_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP Error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  getDemoToken: () => fetchWithAuth("/auth/demo-token"),
  
  // Merchant
  getProfile: () => fetchWithAuth("/merchant/me"),
  getVoiceSignal: () => fetchWithAuth("/merchant/voice-signal"),
  simulateSoundboxPayment: () => fetchWithAuth("/merchant/simulate-payment", { method: "POST" }),

  // Insights
  getTradeRadar: () => fetchWithAuth("/insights/trade-radar"),
  getPricePulse: (cat = "snacks") => fetchWithAuth(`/insights/price-pulse?category=${cat}`),
  getCashflow: () => fetchWithAuth("/insights/cashflow"),
  getFestivals: () => fetchWithAuth("/insights/festival"),
  getGrowthMissions: () => fetchWithAuth("/insights/growth-missions"),

  // Recommendations
  getRecommendations: () => fetchWithAuth("/recommendations"),
  recordAction: (recId, action, notes) => 
    fetchWithAuth(`/recommendations/${recId}/action`, {
      method: "POST",
      body: JSON.stringify({ action, notes })
    }),

  // Privacy & Security
  getPrivacyPolicy: () => fetchWithAuth("/privacy/policy"),
  getPrivacyBudget: () => fetchWithAuth("/privacy/budget"),
  getAuditEvents: () => fetchWithAuth("/security/audit-events"),
  runAttackSimulation: (payload) => 
    fetchWithAuth("/simulator/run", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
};
'''

files["frontend/src/components/Navbar.jsx"] = '''import React from 'react';
import { Eye, ShieldCheck, Activity, Terminal, RefreshCw } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, merchant, onSimulatePayment }) {
  return (
    <header className="sticky top-0 z-40 bg-wine text-cream shadow-md border-b border-wine-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center shadow-inner border border-gold">
            <Eye className="w-6 h-6 text-wine" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-bold text-xl tracking-wider text-cream">NETRĀ</span>
              <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-gold text-charcoal">
                Paytm Copilot
              </span>
            </div>
            <p className="text-[11px] text-gold-light tracking-tight font-medium">Network Intelligence • Zero Competitor Exposure</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-cream text-wine font-semibold shadow-sm' 
                : 'text-cream hover:bg-wine-light'
            }`}
          >
            Merchant Copilot
          </button>
          
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-all ${
              activeTab === 'privacy' 
                ? 'bg-cream text-wine font-semibold shadow-sm' 
                : 'text-cream hover:bg-wine-light'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-gold" />
            <span>Privacy Center</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-all ${
              activeTab === 'security' 
                ? 'bg-cream text-wine font-semibold shadow-sm' 
                : 'text-cream hover:bg-wine-light'
            }`}
          >
            <Activity className="w-4 h-4 text-gold" />
            <span>Audit Sentinel</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 transition-all border ${
              activeTab === 'simulator'
                ? 'bg-gold text-charcoal border-cream shadow-sm'
                : 'bg-wine-dark text-gold border-gold/40 hover:border-gold'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Attack Simulator</span>
          </button>
        </nav>

        {/* Right Info & Live Payment Trigger */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onSimulatePayment}
            title="Simulate incoming Paytm UPI Soundbox payment"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-wine-light hover:bg-gold hover:text-charcoal text-cream text-xs font-medium transition-all border border-wine/40"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Test Soundbox UPI</span>
          </button>

          <div className="text-right hidden lg:block border-l border-wine-light/50 pl-3">
            <p className="text-xs font-semibold text-cream leading-tight">{merchant?.name || "Ramesh Kumar"}</p>
            <p className="text-[10px] text-gold-light">{merchant?.cluster_id ? "Lajpat Nagar Market" : "South Delhi"}</p>
          </div>
        </div>

      </div>
    </header>
  );
}
'''

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"Wrote {path}")
