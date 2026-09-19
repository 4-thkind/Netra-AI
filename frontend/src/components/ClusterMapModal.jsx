import React, { useState } from 'react';
import { X, ShieldAlert, ShieldCheck, MapPin, Store, EyeOff, CheckCircle2 } from 'lucide-react';
import { translations } from '../i18n/translations';
import { useDismissable } from '../hooks/useDismissable';

export default function ClusterMapModal({ isOpen, onClose, lang = 'en' }) {
  const [storeCount, setStoreCount] = useState(4); // Start with 4-merchant dilemma
  const [selectedStore, setSelectedStore] = useState(null);

  const t = translations[lang]?.clusterMapModal || translations.en.clusterMapModal;

  useDismissable(isOpen, onClose);

  if (!isOpen) return null;

  const isSuppressed = storeCount < 10;
  const radiusKm = storeCount < 6 ? 1.0 : storeCount < 16 ? 3.0 : 5.0;

  const sampleStores = [
    { name: "Gupta General Store", category: "Daily Groceries", status: "Privacy Shielded" },
    { name: "Verma Daily Needs", category: "Dairy & Staples", status: "Zero PII Exposure" },
    { name: "Aggarwal Super Mart", category: "FMCG & Snacks", status: "k-Anonymity Protected" },
    { name: "Sharmaji Provisions", category: "Spices & Oils", status: "Differentially Private" }
  ];

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
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold">Interactive Privacy & Geospatial Visualizer</span>
            <h3 className="font-heading font-bold text-lg text-cream">{t.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-wine-light text-cream transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          {/* 3 Quick Scenario Buttons */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => handleScenario(4)}
              className={`p-2 rounded-xl border text-center font-bold transition-all ${
                storeCount === 4
                  ? 'bg-red-700 text-white border-red-800 shadow-sm'
                  : 'bg-sand hover:bg-gold/20 text-charcoal border-gold/30'
              }`}
            >
              <span className="block text-[10px] uppercase font-bold">Scenario 1</span>
              <span>4 Stores (1 km)</span>
              <span className="block text-[9px] opacity-80">Suppressed (N&lt;10)</span>
            </button>

            <button
              onClick={() => handleScenario(14)}
              className={`p-2 rounded-xl border text-center font-bold transition-all ${
                storeCount === 14
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                  : 'bg-sand hover:bg-gold/20 text-charcoal border-gold/30'
              }`}
            >
              <span className="block text-[10px] uppercase font-bold">Scenario 2</span>
              <span>14 Stores (3 km)</span>
              <span className="block text-[9px] opacity-80">Threshold Met</span>
            </button>

            <button
              onClick={() => handleScenario(25)}
              className={`p-2 rounded-xl border text-center font-bold transition-all ${
                storeCount === 25
                  ? 'bg-wine text-cream border-wine-dark shadow-sm'
                  : 'bg-sand hover:bg-gold/20 text-charcoal border-gold/30'
              }`}
            >
              <span className="block text-[10px] uppercase font-bold">Scenario 3</span>
              <span>25 Stores (5 km)</span>
              <span className="block text-[9px] opacity-80">Macro Network</span>
            </button>
          </div>

          {/* Slider to interactively test merchant density */}
          <div className="bg-sand p-3.5 rounded-2xl border border-gold/30">
            <div className="flex justify-between items-center text-xs font-semibold text-charcoal">
              <span>{t.sliderLabel}:</span>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cream border border-gold/40">
                  k = {storeCount}
                </span>
                <span className="font-bold text-wine text-sm">{storeCount} Kirana Stores</span>
              </div>
            </div>
            <input
              type="range"
              min="2"
              max="25"
              value={storeCount}
              onChange={(e) => {
                setStoreCount(parseInt(e.target.value));
                setSelectedStore(null);
              }}
              className="w-full mt-2 accent-wine"
            />
            <div className="flex justify-between text-[10px] text-charcoal-muted mt-1">
              <span>2 Stores (Snooping Danger)</span>
              <span className="font-bold text-wine">Threshold = 10 Stores</span>
              <span>25 Stores (Safe Network DP)</span>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full h-64 bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden flex items-center justify-center">
            
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-15 pointer-events-none">
              {[...Array(36)].map((_, i) => (
                <div key={i} className="border border-slate-600"></div>
              ))}
            </div>

            {/* Expanding radius circle */}
            <div
              style={{
                width: `${radiusKm * 60}px`,
                height: `${radiusKm * 60}px`,
              }}
              className={`rounded-full border-2 transition-all duration-500 flex items-center justify-center relative ${
                isSuppressed
                  ? 'border-red-500 bg-red-500/15 animate-pulse'
                  : 'border-emerald-400 bg-emerald-400/15'
              }`}
            >
              <span className="text-[10px] font-mono font-bold text-white bg-black/70 px-2 py-0.5 rounded shadow">
                Radius: {radiusKm} km
              </span>
            </div>

            {/* Central Store Pin (Ramesh) */}
            <div className="absolute flex flex-col items-center z-10 cursor-pointer">
              <MapPin className="w-7 h-7 text-gold animate-bounce drop-shadow" />
              <span className="text-[10px] font-bold text-cream bg-wine px-2 py-0.5 rounded shadow mt-0.5 border border-gold/40">
                Ramesh Kirana (You)
              </span>
            </div>

            {/* Neighboring merchant store dots */}
            {[...Array(Math.min(22, storeCount))].map((_, i) => {
              const angle = (i / storeCount) * 2 * Math.PI;
              const dist = 35 + (i % 3) * 28;
              const x = Math.cos(angle) * dist;
              const y = Math.sin(angle) * dist;
              const sample = sampleStores[i % sampleStores.length];
              const isSelected = selectedStore === sample.name;

              return (
                <div
                  key={i}
                  onClick={() => setSelectedStore(sample.name)}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className={`absolute w-3.5 h-3.5 rounded-full cursor-pointer transition-transform hover:scale-150 flex items-center justify-center ${
                    isSelected ? 'bg-gold ring-2 ring-cream' : 'bg-sky-400 shadow-glow'
                  }`}
                  title={`${sample.name} (${sample.status})`}
                >
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-full"></span>
                </div>
              );
            })}

            {/* Overlay Status Badge */}
            <div className="absolute top-3 left-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1.5 shadow ${
                isSuppressed
                  ? 'bg-red-950 text-red-300 border border-red-500'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500'
              }`}>
                {isSuppressed ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>{t.shieldSuppressed}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.shieldActive}</span>
                  </>
                )}
              </span>
            </div>

            {/* Selected Store Tooltip Box */}
            {selectedStore && (
              <div className="absolute bottom-3 right-3 bg-cream/95 text-charcoal p-2.5 rounded-xl border border-gold/50 shadow-xl text-xs max-w-xs animate-slideDown">
                <div className="flex items-center justify-between gap-2 border-b border-gold/30 pb-1">
                  <span className="font-bold text-wine">{selectedStore}</span>
                  <EyeOff className="w-3.5 h-3.5 text-wine" />
                </div>
                <p className="text-[10px] text-charcoal-muted mt-1 leading-snug">
                  🔒 <strong>Zero Competitor Snooping:</strong> Individual prices and transaction history are mathematically omitted under Section 25.
                </p>
              </div>
            )}
          </div>

          {/* Explanation Text */}
          <div className="p-3.5 rounded-xl bg-sand/80 text-xs text-charcoal leading-relaxed border border-gold/30">
            {isSuppressed ? (
              <p>
                🚨 <strong>The 4-Merchant Dilemma Triggered:</strong> In a micro-cluster with only {storeCount} stores within {radiusKm}km, publishing an average allows a merchant to mathematically subtract their own sales and reverse-engineer a competitor's revenue. Netrā enforces <strong>Small-Cohort Suppression ($N &lt; 10$)</strong> to protect merchant privacy.
              </p>
            ) : (
              <p>
                ✅ <strong>Cohort Privacy Invariant Satisfied:</strong> With {storeCount} stores ($N \ge 10$), Netrā activates Laplace/Gaussian differential privacy noise and emits aggregate percentiles ($P_{25} - \text{Median} - P_{75}$). Zero competitor PII is exposed.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
