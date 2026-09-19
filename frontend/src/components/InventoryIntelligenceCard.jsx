import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Barcode, 
  AlertTriangle, 
  Sparkles, 
  ArrowUpRight, 
  ShoppingBag, 
  Users, 
  CheckCircle2, 
  Volume2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function InventoryIntelligenceCard({ onOpenHub, lang = 'hi' }) {
  const [overview, setOverview] = useState(null);
  const [reorderAlerts, setReorderAlerts] = useState([]);
  const [deadStock, setDeadStock] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [ovData, alertsData, deadData] = await Promise.all([
        api.getInventoryOverview(),
        api.getReorderAlerts(),
        api.getDeadStock()
      ]);
      setOverview(ovData);
      setReorderAlerts(alertsData || []);
      setDeadStock(deadData || []);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleSimulateScan = async () => {
    try {
      setScanning(true);
      // Simulate scanning Frooti or top alert item
      const barcodeToScan = reorderAlerts[0]?.barcode || "8901719101015";
      const res = await api.simulatePosSale(barcodeToScan, 1);
      setLastScan(res);
      // Refresh metrics after scan
      await fetchInventoryData();
    } catch (err) {
      console.error('POS scan simulation failed:', err);
    } finally {
      setTimeout(() => setScanning(false), 500);
    }
  };

  const topCriticalItem = reorderAlerts[0];
  const topBundle = deadStock[0];

  return (
    <div className="bg-cream rounded-2xl p-5 border border-gold/30 shadow-subtle flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-wine/10 flex items-center justify-center text-wine border border-wine/20">
              <Boxes className="w-5 h-5 text-wine" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-charcoal">Paytm POS & Autonomous Inventory</h3>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  Live Barcode Sync
                </span>
              </div>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Real-time checkout reconciliation, dead capital liquidation & cluster group wholesale
              </p>
            </div>
          </div>
          <button
            onClick={fetchInventoryData}
            disabled={loading}
            className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-sand/60 transition-colors"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* 3 Core Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
          {/* Dead Capital Locked */}
          <div className="bg-sand/60 p-3 rounded-xl border border-gold/20">
            <div className="flex items-center justify-between text-xs text-charcoal-muted mb-1">
              <span className="font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Dead Capital Locked
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-1.5 py-0.2 rounded">
                &gt;21 Days Aging
              </span>
            </div>
            <div className="text-lg font-bold text-charcoal">
              ₹{overview ? overview.dead_capital_locked.toLocaleString('en-IN') : '18,450'}
            </div>
            <p className="text-[11px] text-charcoal-muted mt-0.5">
              {deadStock.length} SKUs eligible for AI combos
            </p>
          </div>

          {/* T-Minus Stockout Warning */}
          <div className="bg-sand/60 p-3 rounded-xl border border-gold/20">
            <div className="flex items-center justify-between text-xs text-charcoal-muted mb-1">
              <span className="font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                Stockout Alert
              </span>
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded">
                T-Minus
              </span>
            </div>
            <div className="text-sm font-bold text-red-700 truncate">
              {topCriticalItem ? `${topCriticalItem.sku_name.split(' ')[0]} (${topCriticalItem.current_stock} left)` : 'Frooti 200ml (4 left)'}
            </div>
            <p className="text-[11px] text-charcoal-muted mt-0.5">
              Depletion in ~{topCriticalItem ? topCriticalItem.depletion_hours_left : 3.5} hrs • 1-Tap PO Ready
            </p>
          </div>

          {/* Cluster Wholesale Buying */}
          <div className="bg-sand/60 p-3 rounded-xl border border-gold/20">
            <div className="flex items-center justify-between text-xs text-charcoal-muted mb-1">
              <span className="font-medium flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                Cluster Wholesale
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.2 rounded">
                N = 42 Stores
              </span>
            </div>
            <div className="text-lg font-bold text-emerald-800">
              +{overview ? overview.cluster_group_discount_pct : '3.8'}% Gross Margin
            </div>
            <p className="text-[11px] text-charcoal-muted mt-0.5">
              Differential Privacy Tier-1 Pricing
            </p>
          </div>
        </div>

        {/* Real-time POS Checkout Feedback banner */}
        {lastScan && (
          <div className="mb-3 bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between font-semibold text-emerald-950">
                <span>Paytm Smart POS Scan: {lastScan.sku_name}</span>
                <span className="font-mono text-emerald-800">₹{lastScan.total_sale_amount}</span>
              </div>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Stock automatically decremented to <strong>{lastScan.remaining_stock} units</strong>.
                {lastScan.reorder_triggered && ' ⚠️ Depletion threshold reached.'}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-mono mt-1">
                <Volume2 className="w-3 h-3" />
                <span>Soundbox: "{lastScan.soundbox_announcement}"</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-gold/20">
        <button
          onClick={handleSimulateScan}
          disabled={scanning}
          className="flex-1 flex items-center justify-center gap-2 bg-[#002E6E] hover:bg-[#001D47] text-white
                     py-2 px-3 rounded-xl text-xs font-semibold shadow-subtle transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Barcode className={`w-4 h-4 ${scanning ? 'animate-pulse' : ''}`} />
          <span>{scanning ? 'Processing POS Scan...' : '⚡ Simulate Paytm POS Barcode Scan'}</span>
        </button>

        <button
          onClick={onOpenHub}
          className="flex items-center justify-center gap-1.5 bg-wine hover:bg-wine-hover text-cream
                     py-2 px-3 rounded-xl text-xs font-semibold shadow-subtle transition-all active:scale-[0.98]"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Manage Inventory & AI Combos</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
