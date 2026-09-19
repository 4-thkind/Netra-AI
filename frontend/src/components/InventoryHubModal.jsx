import React, { useState, useEffect } from 'react';
import { 
  X, 
  Boxes, 
  Barcode, 
  Sparkles, 
  AlertTriangle, 
  Users, 
  Send, 
  Search, 
  CheckCircle2, 
  CheckCheck,
  ArrowRight,
  TrendingDown,
  Clock,
  ShieldCheck,
  Store,
  Layers,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { api } from '../services/api';
import { soundboxAudio } from '../utils/soundboxAudio';

export default function InventoryHubModal({ isOpen, onClose, lang = 'hi' }) {
  const [activeTab, setActiveTab] = useState('catalog'); // catalog, dead_stock, reorder, cluster_pool
  const [items, setItems] = useState([]);
  const [overview, setOverview] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [clusterPool, setClusterPool] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBarcode, setSelectedBarcode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);
  const [dispatchingId, setDispatchingId] = useState(null);
  const [dispatchedMap, setDispatchedMap] = useState({});
  const [activatedBundleMap, setActivatedBundleMap] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  const loadAllData = async () => {
    try {
      const [itemsData, ovData, bundlesData, alertsData, poolData] = await Promise.all([
        api.getInventoryItems(),
        api.getInventoryOverview(),
        api.getDeadStock(),
        api.getReorderAlerts(),
        api.getClusterPool()
      ]);
      setItems(itemsData || []);
      setOverview(ovData);
      setBundles(bundlesData || []);
      setAlerts(alertsData || []);
      setClusterPool(poolData);
      if (itemsData && itemsData.length > 0) {
        setSelectedBarcode(itemsData[0].barcode);
      }
    } catch (err) {
      console.error('Failed to load inventory hub data:', err);
    }
  };

  if (!isOpen) return null;

  const handleSimulateScan = async (barcode) => {
    const codeToScan = barcode || selectedBarcode;
    if (!codeToScan) return;
    try {
      setScanning(true);
      const res = await api.simulatePosSale(codeToScan, 1);
      setScanMessage(res);
      soundboxAudio.playPosBarcodeCheckout({
        skuName: res.sku_name,
        amount: res.total_sale_amount,
        remainingStock: res.remaining_stock,
        lang: lang
      });
      await loadAllData();
    } catch (err) {
      console.error('POS Scan error:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleDispatchPO = async (itemId) => {
    try {
      setDispatchingId(itemId);
      const res = await api.dispatchInventoryPO(itemId);
      setDispatchedMap(prev => ({ ...prev, [itemId]: res }));
    } catch (err) {
      console.error('Failed to dispatch PO:', err);
    } finally {
      setDispatchingId(null);
    }
  };

  const filteredItems = items.filter(i => 
    i.sku_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.barcode.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 backdrop-blur-xs p-3 sm:p-6 animate-fadeIn">
      <div className="bg-cream w-full max-w-5xl max-h-[92vh] rounded-2xl border border-gold/40 shadow-lift flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-wine text-cream px-6 py-4 flex items-center justify-between border-b border-gold/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold border border-gold/40">
              <Boxes className="w-5 h-5 text-gold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-cream">Paytm POS & Autonomous Inventory Hub</h2>
                <span className="text-[10px] font-mono font-bold bg-gold text-wine px-2 py-0.5 rounded-full">
                  SANJEEV KIRANA STORE
                </span>
              </div>
              <p className="text-xs text-cream/80 mt-0.5">
                Barcode POS Checkout • AI Dead Stock Combos • T-Minus Replenishment • Cluster Wholesale Pool
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-cream/80 hover:text-cream hover:bg-wine-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-sand/60 px-6 pt-3 flex items-center space-x-2 border-b border-gold/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'bg-cream text-wine border-t-2 border-wine shadow-subtle'
                : 'text-charcoal-muted hover:text-charcoal hover:bg-cream/40'
            }`}
          >
            <Barcode className="w-4 h-4" />
            <span>Live Catalog & POS Barcode Scanner</span>
            <span className="text-[10px] bg-sand px-1.5 py-0.2 rounded-full font-mono">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dead_stock')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'dead_stock'
                ? 'bg-cream text-wine border-t-2 border-wine shadow-subtle'
                : 'text-charcoal-muted hover:text-charcoal hover:bg-cream/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>AI Dead Stock Liquidation Studio</span>
            {bundles.length > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded-full">
                ₹{overview?.dead_capital_locked?.toLocaleString('en-IN')} Locked
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reorder')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'reorder'
                ? 'bg-cream text-wine border-t-2 border-wine shadow-subtle'
                : 'text-charcoal-muted hover:text-charcoal hover:bg-cream/40'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>T-Minus Depletion & 1-Tap PO</span>
            {alerts.length > 0 && (
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded-full">
                {alerts.length} Critical
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cluster_pool')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'cluster_pool'
                ? 'bg-cream text-wine border-t-2 border-wine shadow-subtle'
                : 'text-charcoal-muted hover:text-charcoal hover:bg-cream/40'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-700" />
            <span>Cluster Group Buying Pool</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.2 rounded-full">
              +3.8% Margin
            </span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-sand/20">
          {/* TAB 1: Live Catalog & POS Scanner */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              {/* POS Barcode Simulation Widget */}
              <div className="bg-cream rounded-xl p-4 border border-gold/40 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#002E6E]/10 flex items-center justify-center text-[#002E6E] border border-[#002E6E]/20">
                    <Barcode className="w-5 h-5 text-[#002E6E]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-charcoal">Paytm Smart POS Barcode Scanner Simulator</h4>
                    <p className="text-xs text-charcoal-muted">
                      Select an item and simulate an instantaneous counter barcode scan
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={selectedBarcode}
                    onChange={(e) => setSelectedBarcode(e.target.value)}
                    className="h-10 text-xs px-3 rounded-xl border border-gold/40 bg-white focus:outline-none focus:ring-2 focus:ring-wine/20"
                  >
                    {items.map((i) => (
                      <option key={i.id} value={i.barcode}>
                        {i.sku_name} (Stock: {i.current_stock})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleSimulateScan(selectedBarcode)}
                    disabled={scanning}
                    className="h-10 px-4 rounded-xl bg-[#002E6E] hover:bg-[#001D47] text-white text-xs font-semibold
                               flex items-center gap-1.5 shadow-subtle active:scale-[0.98] disabled:opacity-50 transition-colors"
                  >
                    <Barcode className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                    <span>{scanning ? 'Scanning...' : 'Scan Item (Deduct 1)'}</span>
                  </button>
                </div>
              </div>

              {/* Real-time Scan Notification Toast */}
              {scanMessage && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-start gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs flex-1">
                    <div className="flex items-center justify-between font-bold text-emerald-950">
                      <span>Checkout Confirmed: {scanMessage.sku_name}</span>
                      <span>Paid ₹{scanMessage.total_sale_amount}</span>
                    </div>
                    <p className="text-emerald-800 text-[11px] mt-0.5">
                      Barcode: <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">{scanMessage.barcode}</code> • 
                      Remaining Stock: <strong>{scanMessage.remaining_stock}</strong> • 
                      Soundbox Announcement: <em>"{scanMessage.soundbox_announcement}"</em>
                    </p>
                  </div>
                </div>
              )}

              {/* Search and Filter */}
              <div className="relative">
                <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by SKU name, barcode, or category (beverages, dairy, snacks, staples)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 h-10 rounded-xl border border-gold/40 bg-white text-xs text-charcoal
                             focus:outline-none focus:ring-2 focus:ring-wine/20 placeholder:text-charcoal-muted"
                />
              </div>

              {/* SKU Table */}
              <div className="bg-cream rounded-xl border border-gold/30 shadow-subtle overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-sand text-charcoal font-semibold border-b border-gold/30">
                      <tr>
                        <th className="py-2.5 px-3">SKU Name</th>
                        <th className="py-2.5 px-3">Barcode</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Stock / Threshold</th>
                        <th className="py-2.5 px-3">Cost / MRP</th>
                        <th className="py-2.5 px-3">Margin</th>
                        <th className="py-2.5 px-3">Aging</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/15">
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-sand/30 transition-colors">
                          <td className="py-2 px-3 font-semibold text-charcoal">
                            {item.sku_name}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-charcoal-muted">
                            {item.barcode}
                          </td>
                          <td className="py-2 px-3">
                            <span className="capitalize text-[11px] bg-sand px-2 py-0.5 rounded-full">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-medium">
                            <span className={item.current_stock <= item.min_reorder_threshold ? 'text-red-700 font-bold' : 'text-charcoal'}>
                              {item.current_stock}
                            </span>
                            <span className="text-charcoal-muted"> / {item.min_reorder_threshold} {item.unit}</span>
                          </td>
                          <td className="py-2 px-3 text-charcoal">
                            ₹{item.cost_price} / ₹{item.selling_price}
                          </td>
                          <td className="py-2 px-3 text-emerald-700 font-semibold">
                            {item.margin_pct}%
                          </td>
                          <td className="py-2 px-3 text-charcoal-muted font-medium">
                            {item.days_in_inventory} days
                          </td>
                          <td className="py-2 px-3">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              item.velocity_status === 'CRITICAL_LOW'
                                ? 'bg-red-100 text-red-800'
                                : item.velocity_status === 'FAST_MOVING'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.velocity_status === 'SLOW_MOVING'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-sand text-charcoal'
                            }`}>
                              {item.velocity_status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => handleSimulateScan(item.barcode)}
                              disabled={scanning}
                              className="text-[11px] font-semibold text-wine hover:underline inline-flex items-center gap-1"
                            >
                              Scan
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI Dead Stock Liquidation Studio */}
          {activeTab === 'dead_stock' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-amber-950">How AI Dead Stock Liquidation Protects Working Capital</h4>
                  <p className="text-amber-900 mt-1 leading-relaxed">
                    Netrā identifies items sitting on shelves for &gt;21 days with low turnover (such as specialty fasting flours, diet tonics, and slow-moving namkeen) and algorithmically pairs them with high-velocity afternoon drivers (chilled drinks, Maggi) into margin-protective bundle offers before expiration.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bundles.map((b, idx) => {
                  const isActivated = activatedBundleMap[b.slow_item_id];
                  return (
                    <div key={idx} className="bg-cream rounded-xl p-4 border border-gold/40 shadow-subtle flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                            Stagnant: {b.slow_days_aging} Days Aging
                          </span>
                          <span className="text-[10px] text-charcoal-muted">
                            Expires in {b.expiry_days_left} days
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-charcoal mb-2">
                          {b.bundle_title}
                        </h4>

                        <div className="bg-sand/60 rounded-lg p-3 my-2 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-charcoal-muted">
                            <span>Individual MRP Total:</span>
                            <span className="line-through font-mono">₹{b.regular_price}</span>
                          </div>
                          <div className="flex items-center justify-between text-charcoal font-bold">
                            <span>Recommended Combo Price:</span>
                            <span className="text-wine font-mono text-sm">₹{b.bundle_price}</span>
                          </div>
                          <div className="flex items-center justify-between text-emerald-800 text-[11px] font-semibold pt-1 border-t border-gold/20">
                            <span>Preserved Gross Margin:</span>
                            <span>₹{b.preserved_margin_inr} ({b.preserved_margin_pct}%)</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-charcoal-muted mt-2">
                          📍 <strong>Placement:</strong> {b.recommended_placement}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-gold/20 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-700 font-medium">
                          ⚡ Projected liquidation: ~{b.estimated_liquidation_days} days
                        </span>
                        <button
                          onClick={() => setActivatedBundleMap(prev => ({ ...prev, [b.slow_item_id]: true }))}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                            isActivated
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-wine hover:bg-wine-hover text-cream shadow-subtle'
                          }`}
                        >
                          {isActivated ? '✓ Active on Soundbox POS' : 'Activate Combo Offer'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: T-Minus Depletion & 1-Tap WhatsApp PO */}
          {activeTab === 'reorder' && (
            <div className="space-y-4">
              <div className="bg-red-50/70 border border-red-300 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-red-950">T-Minus Automated Stockout Prevention</h4>
                  <p className="text-red-900 mt-1 leading-relaxed">
                    Based on real-time Paytm POS consumption velocity, these items will hit zero stock before the next scheduled distributor cycle. Send pre-filled 1-tap WhatsApp purchase orders directly to wholesale distributors.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {alerts.map((a) => {
                  const isDispatched = dispatchedMap[a.item_id];
                  const isDispatching = dispatchingId === a.item_id;

                  return (
                    <div key={a.item_id} className="bg-cream rounded-xl p-4 border border-gold/40 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-bold text-charcoal">{a.sku_name}</span>
                          <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                            T-Minus {a.depletion_hours_left} Hours Left
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-muted">
                          Current Stock: <strong className="text-red-700">{a.current_stock}</strong> / Safety Threshold: {a.min_threshold} units
                        </p>
                        <div className="bg-sand/60 p-2 rounded-lg mt-2 text-[11px] font-mono text-charcoal">
                          Wholesale Target: {a.wholesaler_name} • Order: {a.suggested_crates} Crates (₹{a.estimated_po_amount})
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isDispatched ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-300">
                            <CheckCheck className="w-4 h-4 text-emerald-700" />
                            <span>WhatsApp PO Sent to Sharmaji</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDispatchPO(a.item_id)}
                            disabled={isDispatching}
                            className="bg-[#075E54] hover:bg-[#128C7E] text-white text-xs font-semibold px-4 py-2 rounded-xl
                                       flex items-center gap-1.5 shadow-subtle transition-all active:scale-[0.98] disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isDispatching ? 'Sending PO...' : '1-Tap WhatsApp PO'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Cluster Wholesale Group Buying Pool */}
          {activeTab === 'cluster_pool' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-emerald-950">Differential Privacy Cluster Wholesale Pool (N = 42)</h4>
                  <p className="text-emerald-900 mt-1 leading-relaxed">
                    Netrā pools anonymized replenishment volume across 42 stores in South Delhi. No individual store inventory or SKU counts are disclosed. Wholesalers grant Tier-1 bulk pricing equivalent to Blinkit and D-Mart.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-cream p-4 rounded-xl border border-gold/30 shadow-subtle">
                  <span className="text-xs text-charcoal-muted">Participating Kiranas</span>
                  <div className="text-xl font-bold text-charcoal mt-1">42 Stores</div>
                  <span className="text-[11px] text-emerald-700 font-semibold">Lajpat Nagar & South Delhi</span>
                </div>
                <div className="bg-cream p-4 rounded-xl border border-gold/30 shadow-subtle">
                  <span className="text-xs text-charcoal-muted">Negotiated Wholesale Lift</span>
                  <div className="text-xl font-bold text-emerald-800 mt-1">+3.8% Gross Margin</div>
                  <span className="text-[11px] text-charcoal-muted">Tier-1 Bulk Rate Direct</span>
                </div>
                <div className="bg-cream p-4 rounded-xl border border-gold/30 shadow-subtle">
                  <span className="text-xs text-charcoal-muted">Estimated Cluster Savings</span>
                  <div className="text-xl font-bold text-charcoal mt-1">₹1,42,000 / yr</div>
                  <span className="text-[11px] text-emerald-700 font-semibold">Consolidated Deliveries</span>
                </div>
              </div>

              <div className="bg-cream rounded-xl border border-gold/30 p-4 shadow-subtle space-y-3">
                <h4 className="font-bold text-xs text-charcoal uppercase tracking-wider">
                  Current Consolidated Wholesale Tenders
                </h4>

                {clusterPool?.current_pooled_tenders?.map((tender, tidx) => (
                  <div key={tidx} className="bg-sand/40 p-3 rounded-xl border border-gold/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-charcoal">{tender.category}: {tender.pooled_sku}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                          {tender.merchant_margin_lift}
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal-muted mt-0.5">
                        Pooled Volume: <strong>{tender.total_pooled_volume}</strong> • Standard Rate: ₹{tender.regular_wholesale_unit_cost} ➔ Negotiated: <strong className="text-emerald-800">₹{tender.negotiated_pooled_unit_cost}</strong>
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-wine bg-wine/10 px-2 py-1 rounded-lg">
                      {tender.dispatch_window}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
