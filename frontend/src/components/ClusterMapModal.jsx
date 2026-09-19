import React, { useState } from 'react';
import { X, ShieldAlert, ShieldCheck, MapPin, Store, EyeOff, CheckCircle2 } from 'lucide-react';
import { translations } from '../i18n/translations';
import { useDismissable } from '../hooks/useDismissable';

const SAMPLE_KIRANAS = [
  { name: "Gupta General Store", category: "Daily Groceries", status: "Privacy Shielded" },
  { name: "Verma Daily Needs", category: "Dairy & Staples", status: "Zero PII Exposure" },
  { name: "Aggarwal Super Mart", category: "FMCG & Snacks", status: "k-Anonymity Protected" },
  { name: "Sharmaji Provisions", category: "Spices & Oils", status: "Differentially Private" },
  { name: "Patel Brothers Kirana", category: "Grains & Pulses", status: "Shield Active" },
  { name: "Singhania Daily Mart", category: "Beverages & Dairy", status: "DP Noise Added" },
  { name: "Bansal Departmental", category: "Packaged Foods", status: "k-Anonymity Protected" },
  { name: "Choudhary Store", category: "Personal Care", status: "Privacy Shielded" },
  { name: "Mittal Kirana Store", category: "Edible Oils", status: "Differentially Private" },
  { name: "Rajdhani Provision Store", category: "Flour & Grains", status: "Shield Active" },
  { name: "Krishna Super Store", category: "Snacks & Cold Drinks", status: "Cohort Protected" },
  { name: "Laxmi Daily Needs", category: "Household Essentials", status: "Zero PII Exposure" },
  { name: "Om Sai Kirana", category: "Dairy Products", status: "Privacy Shielded" },
  { name: "Balaji Traders", category: "Wholesale Staples", status: "DP Noise Added" },
  { name: "Shree Ram Store", category: "Tea & Spices", status: "k-Anonymity Protected" },
  { name: "Ganesh Provision Store", category: "Daily Groceries", status: "Cohort Protected" },
  { name: "Jain Super Mart", category: "Organic Staples", status: "Shield Active" },
  { name: "Mahalaxmi Kirana", category: "Packaged Snacks", status: "Zero PII Exposure" },
  { name: "Apex Kirana Point", category: "Beverages", status: "Privacy Shielded" },
  { name: "Vikas General Store", category: "Soaps & Detergents", status: "Differentially Private" },
  { name: "Pooja Daily Needs", category: "Flour & Atta", status: "Cohort Protected" },
  { name: "Shiv Shakti Traders", category: "Dry Fruits & Spices", status: "Shield Active" },
  { name: "New Delhi Mart", category: "FMCG Groceries", status: "k-Anonymity Protected" },
  { name: "Kalyan Kirana Store", category: "Dairy & Confectionery", status: "Zero PII Exposure" },
  { name: "Rameshwar General Store", category: "Staples & Pulses", status: "Privacy Shielded" }
];

export default function ClusterMapModal({ isOpen, onClose, lang = 'en' }) {
  const [storeCount, setStoreCount] = useState(4); // Start with 4-merchant dilemma
  const [selectedStore, setSelectedStore] = useState(null);

  const t = translations[lang]?.clusterMapModal || translations.en?.clusterMapModal || {
    title: "Hyperlocal Cluster Privacy Visualizer",
    subtitle: "Demonstrating dynamic radius expansion (1km ➔ 3km ➔ 5km) and small-cohort suppression",
    sliderLabel: "Simulated Merchant Density (N)",
    shieldActive: "Shield Active: Cohort Protected",
    shieldSuppressed: "Signal Suppressed: Insufficient Density (N < 10)"
  };

  useDismissable(isOpen, onClose);

  if (!isOpen) return null;

  const safeCount = Math.max(2, Math.min(25, Math.round(Number(storeCount)) || 4));
  const isSuppressed = safeCount < 10;
  const radiusKm = safeCount < 6 ? 1.0 : safeCount < 16 ? 3.0 : 5.0;

  // Visual radius circle sizing in pixels (fits cleanly within 256px container)
  const radiusPx = safeCount < 6 ? 90 : safeCount < 16 ? 150 : 210;

  const handleScenario = (count) => {
    setStoreCount(count);
    setSelectedStore(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-charcoal/70 backdrop-blur-sm sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="bg-cream w-full sm:max-w-2xl border border-gold/40 shadow-lift overflow-y-auto
                      rounded-t-3xl sm:rounded-3xl max-h-[92vh] sm:max-h-[90vh]
                      pb-[env(safe-area-inset-bottom,0px)] sm:pb-0
                      animate-sheetUp sm:animate-riseIn">
        
        {/* Header */}
        <div className="bg-wine text-cream px-6 py-4 flex items-center justify-between border-b border-gold/30">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gold">
              Interactive Privacy & Geospatial Visualizer
            </span>
            <h3 className="font-heading font-semibold text-lg text-cream leading-tight">
              {t.title || "Hyperlocal Cluster Privacy Visualizer"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-wine-light text-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          {/* 3 Quick Scenario Buttons */}
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <button
              onClick={() => handleScenario(4)}
              className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                safeCount === 4
                  ? 'bg-red-700 text-white border-red-800 shadow-sm ring-1 ring-red-400'
                  : 'bg-sand hover:bg-gold/20 text-charcoal border-gold/30'
              }`}
            >
              <span className="block text-[10px] uppercase font-semibold">Scenario 1</span>
              <span className="font-bold">4 Stores (1 km)</span>
              <span className="block text-[9px] opacity-90 font-medium">Suppressed (N &lt; 10)</span>
            </button>

            <button
              onClick={() => handleScenario(14)}
              className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                safeCount === 14
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm ring-1 ring-emerald-400'
                  : 'bg-sand hover:bg-gold/20 text-charcoal border-gold/30'
              }`}
            >
              <span className="block text-[10px] uppercase font-bold">Scenario 2</span>
              <span>14 Stores (3 km)</span>
              <span className="block text-[9px] opacity-90 font-medium">Threshold Met</span>
            </button>

            <button
              onClick={() => handleScenario(25)}
              className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                safeCount === 25
                  ? 'bg-wine text-cream border-wine-dark shadow-sm ring-1 ring-gold'
                  : 'bg-sand hover:bg-gold/20 text-charcoal border-gold/30'
              }`}
            >
              <span className="block text-[10px] uppercase font-bold">Scenario 3</span>
              <span>25 Stores (5 km)</span>
              <span className="block text-[9px] opacity-90 font-medium">Macro Network</span>
            </button>
          </div>

          {/* Slider to interactively test merchant density */}
          <div className="bg-sand p-3.5 rounded-2xl border border-gold/30">
            <div className="flex justify-between items-center text-xs font-semibold text-charcoal">
              <span>{t.sliderLabel || "Simulated Merchant Density (N)"}:</span>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cream border border-gold/40">
                  k = {safeCount}
                </span>
                <span className="font-bold text-wine text-sm">{safeCount} Kirana Stores</span>
              </div>
            </div>
            <input
              type="range"
              min="2"
              max="25"
              step="1"
              value={safeCount}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  setStoreCount(val);
                  setSelectedStore(null);
                }
              }}
              className="w-full mt-2 accent-wine cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-charcoal-muted mt-1 font-medium">
              <span>2 Stores (Snooping Danger)</span>
              <span className="font-bold text-wine">Threshold = 10 Stores</span>
              <span>25 Stores (Safe Network DP)</span>
            </div>
          </div>

          {/* Radar Simulation Canvas */}
          <div className="relative w-full h-64 bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden flex items-center justify-center select-none">
            
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-15 pointer-events-none">
              {[...Array(36)].map((_, i) => (
                <div key={i} className="border border-slate-600"></div>
              ))}
            </div>

            {/* Concentric Radar Rings */}
            <div className="absolute w-[90px] h-[90px] rounded-full border border-slate-800/80 pointer-events-none" />
            <div className="absolute w-[150px] h-[150px] rounded-full border border-slate-800/80 pointer-events-none" />
            <div className="absolute w-[210px] h-[210px] rounded-full border border-slate-800/80 pointer-events-none" />

            {/* Dynamic Expanding Radius Circle (Always Centered) */}
            <div
              style={{
                width: `${radiusPx}px`,
                height: `${radiusPx}px`,
              }}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-300 pointer-events-none flex items-center justify-center ${
                isSuppressed
                  ? 'border-red-500 bg-red-500/10 animate-pulse'
                  : 'border-emerald-400 bg-emerald-400/10'
              }`}
            >
              <span className="absolute bottom-2 text-[9px] font-mono font-bold text-white bg-black/80 px-1.5 py-0.5 rounded border border-slate-700 shadow">
                Radius: {radiusKm} km
              </span>
            </div>

            {/* Central Store Pin (Sanjeev) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 pointer-events-none">
              <MapPin className="w-6 h-6 text-gold drop-shadow-md animate-bounce" />
              <span className="text-[9px] font-bold text-cream bg-wine px-1.5 py-0.5 rounded shadow mt-0.5 border border-gold/40 whitespace-nowrap">
                Sanjeev Kirana (You)
              </span>
            </div>

            {/* Neighboring merchant store dots */}
            {Array.from({ length: Math.min(22, safeCount) }, (_, i) => {
              const angle = (i / safeCount) * 2 * Math.PI;
              const dist = 32 + (i % 3) * 26;
              const x = Math.cos(angle) * dist;
              const y = Math.sin(angle) * dist;
              const sample = SAMPLE_KIRANAS[i % SAMPLE_KIRANAS.length];
              const isSelected = selectedStore?.name === sample.name;

              return (
                <button
                  key={`store-dot-${i}`}
                  type="button"
                  onClick={() => setSelectedStore(sample)}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className={`absolute w-3.5 h-3.5 rounded-full cursor-pointer transition-all hover:scale-150 flex items-center justify-center z-20 focus:outline-none ${
                    isSelected
                      ? 'bg-gold ring-2 ring-cream scale-125'
                      : isSuppressed
                      ? 'bg-red-400 shadow-sm'
                      : 'bg-sky-400 shadow-sm'
                  }`}
                  title={`${sample.name} (${sample.status})`}
                >
                  <span className="w-1.5 h-1.5 bg-slate-950 rounded-full"></span>
                </button>
              );
            })}

            {/* Overlay Status Badge */}
            <div className="absolute top-3 left-3 z-20">
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1.5 shadow-md ${
                isSuppressed
                  ? 'bg-red-950/90 text-red-300 border border-red-500'
                  : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500'
              }`}>
                {isSuppressed ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>{t.shieldSuppressed || "Signal Suppressed: Insufficient Density (N < 10)"}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.shieldActive || "Shield Active: Cohort Protected"}</span>
                  </>
                )}
              </span>
            </div>

            {/* Selected Store Tooltip Box */}
            {selectedStore && (
              <div className="absolute bottom-3 right-3 z-30 bg-cream text-charcoal p-3 rounded-xl border border-gold/50 shadow-lift text-xs max-w-xs animate-riseIn">
                <div className="flex items-center justify-between gap-2 border-b border-gold/30 pb-1">
                  <span className="font-bold text-wine">{selectedStore.name}</span>
                  <button
                    onClick={() => setSelectedStore(null)}
                    className="text-charcoal-muted hover:text-wine"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-charcoal-muted mt-1 leading-snug">
                  🔒 <strong>Zero Competitor Snooping:</strong> Individual prices and transaction history for {selectedStore.name} are mathematically omitted under Section 25.
                </p>
                <div className="mt-1.5 flex items-center justify-between text-[9px] font-semibold text-wine">
                  <span>Category: {selectedStore.category}</span>
                  <span className="bg-sand px-1.5 py-0.5 rounded border border-gold/20">{selectedStore.status}</span>
                </div>
              </div>
            )}
          </div>

          {/* Explanation Card */}
          <div className="p-3.5 rounded-xl bg-sand/80 text-xs text-charcoal leading-relaxed border border-gold/30">
            {isSuppressed ? (
              <p>
                🚨 <strong>The 4-Merchant Dilemma Triggered:</strong> In a micro-cluster with only {safeCount} stores within {radiusKm} km, publishing an average allows a merchant to mathematically subtract their own sales and reverse-engineer a competitor's revenue. Netrā strictly enforces <strong>Small-Cohort Suppression (N &lt; 10)</strong> to protect merchant privacy.
              </p>
            ) : (
              <p>
                ✅ <strong>Cohort Privacy Invariant Satisfied:</strong> With {safeCount} stores (N ≥ 10), Netrā activates Laplace/Gaussian differential privacy noise and emits aggregate percentiles (P25 – Median – P75). Zero competitor PII is exposed.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
