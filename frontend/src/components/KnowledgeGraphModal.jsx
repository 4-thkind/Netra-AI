import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  Brain,
  RefreshCw,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crosshair,
  Store,
  Users,
  Tag,
  Sparkles,
  Globe,
  Calendar,
  X,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import Sheet from './ui/Sheet';
import { Pill } from './ui/Card';
import { api } from '../services/api';

export const TYPE_CONFIG = {
  Merchant: { fill: '#722F37', label: 'Merchant', icon: Store, border: '#582128', light: '#FAF0F2' },
  Cohort: { fill: '#C9A96E', label: 'Cohort', icon: Users, border: '#A68449', light: '#FAF5EF' },
  Category: { fill: '#2F6F5E', label: 'Category', icon: Tag, border: '#1F4B3F', light: '#EDF7F4' },
  Recommendation: { fill: '#8B4049', label: 'Insight', icon: Sparkles, border: '#602028', light: '#FDF2F4' },
  Language: { fill: '#5B6E8C', label: 'Language', icon: Globe, border: '#3B4E6C', light: '#F0F4F8' },
  Festival: { fill: '#D97706', label: 'Festival', icon: Calendar, border: '#B45309', light: '#FEF3C7' },
};

export default function KnowledgeGraphModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [limit, setLimit] = useState(40);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Zoom & Pan state
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const load = () => {
    setLoading(true);
    api.getKnowledgeGraph()
      .then((d) => {
        setData(d);
        setSelected(null);
      })
      .catch((e) => console.error('knowledge graph:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen && !data) load();
  }, [isOpen]);

  // Reset zoom/pan when data or limit changes
  const resetView = useCallback(() => {
    setTransform({ k: 1, x: 0, y: 0 });
  }, []);

  // Center view on a specific node
  const focusNode = useCallback((node, targetK = 1.4) => {
    if (!node || !layout) return;
    const pos = layout.placed[node.id];
    if (!pos) return;
    const targetX = (layout.W / 2) - (pos.x * targetK);
    const targetY = (layout.H / 2) - (pos.y * targetK);
    setTransform({ k: targetK, x: targetX, y: targetY });
  }, []);

  // Compute Layout with dynamic clustering & collision avoidance
  const layout = useMemo(() => {
    if (!data?.graph?.nodes?.length) return null;
    const W = 880, H = 580, cx = W / 2, cy = H / 2;
    const nodes = data.graph.nodes;

    // Identify main merchant
    const me = nodes.find((n) => n.type === 'Merchant' && n.props?.name) || nodes[0];

    const PRIORITY = { Cohort: 0, Category: 1, Recommendation: 2, Language: 3, Festival: 4, Merchant: 5 };
    const others = nodes
      .filter((n) => n.id !== me.id)
      .sort((a, b) => (PRIORITY[a.type] ?? 9) - (PRIORITY[b.type] ?? 9))
      .slice(0, limit);

    const byType = {};
    others.forEach((n) => { (byType[n.type] ||= []).push(n); });

    const placed = {
      [me.id]: { x: cx, y: cy, node: me, isCenter: true }
    };

    // 1. Cohort & Language close to centre
    if (byType.Cohort?.length) {
      byType.Cohort.forEach((n, i) => {
        const angle = -Math.PI / 3 + (i * 0.4);
        placed[n.id] = { x: cx + Math.cos(angle) * 115, y: cy + Math.sin(angle) * 105, node: n };
      });
    }

    if (byType.Language?.length) {
      byType.Language.forEach((n, i) => {
        const angle = (-3 * Math.PI) / 4 + (i * 0.4);
        placed[n.id] = { x: cx + Math.cos(angle) * 125, y: cy + Math.sin(angle) * 105, node: n };
      });
    }

    // 2. Categories in an arc
    if (byType.Category?.length) {
      const catCount = byType.Category.length;
      byType.Category.forEach((n, i) => {
        const angle = (Math.PI * 0.15) + (i / Math.max(1, catCount)) * (Math.PI * 0.95);
        placed[n.id] = { x: cx + Math.cos(angle) * 180, y: cy + Math.sin(angle) * 145, node: n };
      });
    }

    // 3. Recommendations placed near categories or right arc
    if (byType.Recommendation?.length) {
      const recCount = byType.Recommendation.length;
      byType.Recommendation.forEach((n, i) => {
        const angle = (Math.PI * 0.2) + (i / Math.max(1, recCount)) * (Math.PI * 0.85);
        placed[n.id] = { x: cx + Math.cos(angle) * 245, y: cy + Math.sin(angle) * 190, node: n };
      });
    }

    // 4. Festivals in top arc
    if (byType.Festival?.length) {
      const festCount = byType.Festival.length;
      byType.Festival.forEach((n, i) => {
        const angle = -Math.PI * 0.8 + (i / Math.max(1, festCount)) * (Math.PI * 0.55);
        placed[n.id] = { x: cx + Math.cos(angle) * 210, y: cy + Math.sin(angle) * 165, node: n };
      });
    }

    // 5. Peer Merchants orbit on outer ring with staggered radii to prevent label collision
    if (byType.Merchant?.length) {
      const mList = byType.Merchant;
      const total = mList.length;
      mList.forEach((n, i) => {
        const angle = (i / total) * Math.PI * 2;
        // Alternating radius prevents text overlap
        const rBase = (i % 2 === 0) ? 290 : 335;
        const rx = rBase;
        const ry = rBase * 0.72; // elliptical perspective for better wide-screen fit
        placed[n.id] = { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry, node: n };
      });
    }

    // Build edge list
    const edges = (data.graph.edges || []).filter((e) => placed[e.source] && placed[e.target]);
    return { W, H, placed, edges, me };
  }, [data, limit]);

  // Track edges for the selected node
  const selectedEdges = useMemo(() => {
    if (!selected || !layout) return [];
    return layout.edges.filter((e) => e.source === selected.id || e.target === selected.id);
  }, [selected, layout]);

  // Connected node IDs for instant neighbor lookup
  const connectedNodeIds = useMemo(() => {
    if (!selected) return new Set();
    const s = new Set([selected.id]);
    selectedEdges.forEach((e) => {
      s.add(e.source);
      s.add(e.target);
    });
    return s;
  }, [selected, selectedEdges]);

  // Wheel & 2-finger trackpad/touch zoom handler with strict native zoom prevention
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      // Prevent zooming the whole browser window and prevent scrolling the modal/page
      e.preventDefault();
      e.stopPropagation();

      // Trackpad pinch gesture sets e.ctrlKey = true
      let zoomFactor;
      if (e.ctrlKey) {
        zoomFactor = Math.exp(-e.deltaY * 0.015);
      } else {
        zoomFactor = e.deltaY < 0 ? 1.10 : 0.90;
      }

      setTransform((prev) => {
        const newK = Math.min(Math.max(prev.k * zoomFactor, 0.45), 3.5);
        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Zoom centered directly under the pointer
        const scaleChange = newK / prev.k;
        const newX = mouseX - (mouseX - prev.x) * scaleChange;
        const newY = mouseY - (mouseY - prev.y) * scaleChange;

        return {
          k: newK,
          x: newX,
          y: newY,
        };
      });
    };

    let touchDistStart = null;
    let touchKStart = 1;
    let touchMid = null;

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        touchDistStart = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const rect = el.getBoundingClientRect();
        touchMid = {
          x: (t1.clientX + t2.clientX) / 2 - rect.left,
          y: (t1.clientY + t2.clientY) / 2 - rect.top,
        };
        touchKStart = transform.k;
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2 && touchDistStart && touchMid) {
        e.preventDefault();
        e.stopPropagation();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const factor = dist / touchDistStart;

        setTransform((prev) => {
          const newK = Math.min(Math.max(touchKStart * factor, 0.45), 3.5);
          const scaleChange = newK / prev.k;
          return {
            k: newK,
            x: touchMid.x - (touchMid.x - prev.x) * scaleChange,
            y: touchMid.y - (touchMid.y - prev.y) * scaleChange,
          };
        });
      }
    };

    const onTouchEnd = (e) => {
      if (e.touches.length < 2) {
        touchDistStart = null;
        touchMid = null;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [layout, transform.k]);

  // Pan handlers
  const handleMouseDown = (e) => {
    // Only pan if clicking canvas background (not clicking a node)
    if (e.target.closest('.graph-node')) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    }));
  };

  const handleMouseUp = () => setIsPanning(false);

  const zoomIn = () => {
    setTransform((prev) => ({ ...prev, k: Math.min(prev.k * 1.25, 3.2) }));
  };

  const zoomOut = () => {
    setTransform((prev) => ({ ...prev, k: Math.max(prev.k * 0.8, 0.5) }));
  };

  const stats = data?.graph?.stats;

  // Filtered nodes based on search or type
  const isNodeVisible = (node) => {
    if (!node) return false;
    if (typeFilter !== 'ALL' && node.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLabel = String(node.label || '').toLowerCase().includes(q);
      const matchType = String(node.type || '').toLowerCase().includes(q);
      return matchLabel || matchType;
    }
    return true;
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Merchant Knowledge Graph"
      subtitle="Cognee · persistent memory, dynamic cohort mapping, and reinforcement loops"
      badge={<Pill tone="wine">Cognee Memory Graph</Pill>}
      size="xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-charcoal-muted">
            <Filter className="w-3.5 h-3.5 text-wine" />
            <span className="font-medium">Density:</span>
            {[20, 40, 80].map((n) => (
              <button
                key={n}
                onClick={() => {
                  setLimit(n);
                  setSelected(null);
                  resetView();
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  limit === n
                    ? 'bg-wine text-cream shadow-sm'
                    : 'bg-sand text-charcoal hover:bg-gold/20'
                }`}
              >
                {n} nodes
              </button>
            ))}
            <span className="ml-1 text-charcoal-light">of {stats?.node_count ?? '—'} total</span>
          </div>

          <div className="flex items-center gap-3">
            {selected && (
              <button
                onClick={() => focusNode(selected)}
                className="h-8 px-3 rounded-xl bg-gold/20 hover:bg-gold/30 border border-gold/40
                           text-wine font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <Crosshair className="w-3.5 h-3.5" />
                Focus Selected
              </button>
            )}
            <button
              onClick={load}
              className="h-8 px-3 rounded-xl bg-sand hover:bg-gold/20 border border-gold/30
                         font-bold text-charcoal inline-flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-wine ${loading ? 'animate-spin' : ''}`} />
              Refresh Graph
            </button>
          </div>
        </div>
      }
    >
      <div className="p-4 sm:p-5 space-y-4">
        {/* Filter Bar & Search */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-sand/60 p-2.5 rounded-2xl border border-gold/25">
          {/* Node Type Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-wine text-cream shadow-sm'
                  : 'bg-cream text-charcoal hover:bg-sand'
              }`}
            >
              All Types
            </button>
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
              const Icon = cfg.icon;
              const active = typeFilter === type;
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(active ? 'ALL' : type)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                    active
                      ? 'bg-charcoal text-cream shadow-sm'
                      : 'bg-cream text-charcoal hover:bg-sand border border-gold/20'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: cfg.fill }} />
                  <Icon className="w-3 h-3 text-charcoal-muted" />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[170px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-charcoal-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search store, category…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs rounded-xl bg-cream border border-gold/30
                         text-charcoal focus:outline-none focus:border-wine transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-wine"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {!layout && (
          <div className="text-center py-20 bg-sand/30 rounded-2xl border border-dashed border-gold/30">
            <RefreshCw className={`w-8 h-8 mx-auto text-wine mb-2 ${loading ? 'animate-spin' : ''}`} />
            <p className="text-sm font-semibold text-charcoal">
              {loading ? 'Building Cognee knowledge graph…' : 'No graph data found.'}
            </p>
          </div>
        )}

        {layout && (
          <div className="relative rounded-2xl bg-charcoal/[.03] border border-gold/30 shadow-inner overflow-hidden select-none overscroll-contain">
            {/* Interactive Graph Canvas */}
            <div
              ref={containerRef}
              style={{ touchAction: 'none' }}
              className={`relative w-full h-[460px] sm:h-[520px] touch-none overscroll-contain ${
                isPanning ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onDoubleClick={resetView}
            >
              {/* Background Grid Accent */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <defs>
                  <pattern id="graph-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="#C9A96E" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#graph-grid)" />
              </svg>

              {/* Main Scalable Graph View */}
              <svg
                viewBox={`0 0 ${layout.W} ${layout.H}`}
                className="w-full h-full block pointer-events-auto"
              >
                <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
                  {/* Edges */}
                  {layout.edges.map((e, i) => {
                    const a = layout.placed[e.source], b = layout.placed[e.target];
                    if (!a || !b) return null;

                    const isConnected =
                      selected && (e.source === selected.id || e.target === selected.id);
                    const isDimmed = selected && !isConnected;

                    // Colored edge when accepted or selected
                    const isAccepted = e.props?.verdict === 'accepted';
                    const strokeColor = isConnected
                      ? isAccepted ? '#10B981' : '#722F37'
                      : isAccepted ? '#059669' : '#C9A96E';

                    return (
                      <g key={`edge-${i}`}>
                        <line
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                          stroke={strokeColor}
                          strokeOpacity={isDimmed ? 0.08 : isConnected ? 0.95 : 0.45}
                          strokeWidth={isConnected ? 2.5 : isAccepted ? 1.6 : 1.0}
                          strokeDasharray={e.rel === 'ACTED_ON' && !isConnected ? '4 3' : 'none'}
                        />
                        {/* Edge Label for selected node's edges */}
                        {isConnected && (
                          <text
                            x={(a.x + b.x) / 2}
                            y={(a.y + b.y) / 2 - 4}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="700"
                            fill="#722F37"
                            className="pointer-events-none"
                            style={{ textShadow: '0 0 4px #FFF8F0' }}
                          >
                            {e.rel}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {Object.values(layout.placed).map(({ x, y, node, isCenter }) => {
                    const cfg = TYPE_CONFIG[node.type] || { fill: '#666', border: '#444', label: node.type };
                    const isSel = selected?.id === node.id;
                    const isConnected = connectedNodeIds.has(node.id);
                    const matchesFilter = isNodeVisible(node);

                    // Dimming logic:
                    // If filter active, hide or dim non-matching
                    // If node selected, dim non-neighbors
                    const isDimmed =
                      !matchesFilter || (selected && !isSel && !isConnected);

                    const radius = isCenter ? 17 : isSel ? 13 : isConnected ? 11 : node.type === 'Cohort' ? 12 : 9;

                    return (
                      <g
                        key={node.id}
                        className="graph-node cursor-pointer transition-transform duration-150"
                        opacity={isDimmed ? 0.15 : 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(isSel ? null : node);
                        }}
                      >
                        {/* Outer Glow Halo for Selected or Center Node */}
                        {(isSel || isCenter) && (
                          <circle
                            cx={x}
                            cy={y}
                            r={radius + 7}
                            fill={isSel ? '#722F37' : '#C9A96E'}
                            fillOpacity={0.25}
                            className="animate-pulse"
                          />
                        )}

                        {/* Node Circle */}
                        <circle
                          cx={x}
                          cy={y}
                          r={radius}
                          fill={cfg.fill}
                          stroke={isSel ? '#2D2D2D' : '#FFF8F0'}
                          strokeWidth={isSel ? 3.5 : isCenter ? 2.5 : 1.8}
                          className="hover:scale-125 transition-transform"
                        />

                        {/* Node Title Text */}
                        <text
                          x={x}
                          y={y + radius + 11}
                          textAnchor="middle"
                          fontSize={isCenter || isSel ? 11 : 9}
                          fontWeight={isCenter || isSel ? 800 : isConnected ? 700 : 500}
                          fill="#2D2D2D"
                          className="pointer-events-none select-none"
                          style={{
                            textShadow:
                              '0 1px 2px #FFF8F0, 0 -1px 2px #FFF8F0, 1px 0 2px #FFF8F0, -1px 0 2px #FFF8F0',
                          }}
                        >
                          {String(node.label || node.id).slice(0, isSel || isCenter ? 28 : 16)}
                          {String(node.label || '').length > (isSel || isCenter ? 28 : 16) ? '…' : ''}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Floating Zoom & Canvas Controls */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 bg-cream/90 backdrop-blur-md p-1.5 rounded-2xl border border-gold/30 shadow-lift">
                <button
                  onClick={zoomIn}
                  title="Zoom In"
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-sand text-charcoal transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={zoomOut}
                  title="Zoom Out"
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-sand text-charcoal transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={resetView}
                  title="Reset View"
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-sand text-charcoal transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div className="pt-1 border-t border-gold/30 text-[10px] font-bold text-center text-charcoal-muted tabular-nums">
                  {Math.round(transform.k * 100)}%
                </div>
              </div>

              {/* Floating Node Details Inspector (Overlaid on Right) */}
              {selected ? (
                <div
                  className="absolute top-3 right-3 bottom-3 w-80 sm:w-88 bg-cream/95 backdrop-blur-lg
                             border border-wine/30 rounded-2xl shadow-lift p-4 overflow-y-auto
                             flex flex-col z-20 animate-riseIn"
                >
                  {/* Inspector Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-gold/30 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ background: TYPE_CONFIG[selected.type]?.fill || '#722F37' }}
                      />
                      <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-wine">
                          {selected.type} Details
                        </span>
                        <h4 className="font-heading font-bold text-sm sm:text-base text-charcoal leading-tight">
                          {selected.label || selected.id}
                        </h4>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="p-1 rounded-lg text-charcoal-muted hover:text-wine hover:bg-sand transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Properties Table */}
                  <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-light mb-1.5">
                      Properties
                    </p>
                    {Object.keys(selected.props || {}).length > 0 ? (
                      <div className="grid grid-cols-1 gap-1.5">
                        {Object.entries(selected.props).map(([k, v]) => (
                          <div
                            key={k}
                            className="bg-sand/60 rounded-xl px-2.5 py-1.5 border border-gold/20 flex items-center justify-between text-xs"
                          >
                            <span className="font-semibold text-charcoal-muted capitalize text-[11px]">{k}</span>
                            <span className="font-mono font-bold text-charcoal truncate max-w-[140px]">
                              {String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-charcoal-muted italic">No custom attributes recorded.</p>
                    )}
                  </div>

                  {/* Connected Graph Edges */}
                  <div className="mt-4 flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-light">
                        Connected Nodes ({selectedEdges.length})
                      </p>
                      <span className="text-[10px] text-wine font-medium">Click to navigate</span>
                    </div>

                    <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                      {selectedEdges.map((e, idx) => {
                        const isOut = e.source === selected.id;
                        const otherId = isOut ? e.target : e.source;
                        const otherNode = layout.placed[otherId]?.node;
                        if (!otherNode) return null;

                        const cfg = TYPE_CONFIG[otherNode.type] || { fill: '#666' };
                        const isAccepted = e.props?.verdict === 'accepted';

                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelected(otherNode);
                              focusNode(otherNode);
                            }}
                            className="w-full text-left p-2 rounded-xl bg-sand/40 hover:bg-wine/10 border border-gold/20
                                       hover:border-wine/30 transition-all flex items-center justify-between gap-2 group"
                          >
                            <div className="min-w-0 flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: cfg.fill }}
                              />
                              <div className="truncate">
                                <span className="font-mono text-[10px] font-extrabold text-wine block leading-none">
                                  {isOut ? '→' : '←'} {e.rel}
                                </span>
                                <span className="text-xs font-semibold text-charcoal truncate block">
                                  {otherNode.label || otherNode.id}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {isAccepted && (
                                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                  accepted
                                </span>
                              )}
                              <ChevronRight className="w-3.5 h-3.5 text-charcoal-light group-hover:text-wine group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-2.5 border-t border-gold/25 flex items-center gap-2">
                    <button
                      onClick={() => focusNode(selected, 1.8)}
                      className="flex-1 py-1.5 rounded-xl bg-wine text-cream text-xs font-bold
                                 inline-flex items-center justify-center gap-1.5 hover:bg-wine-dark transition-colors"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      Center & Zoom
                    </button>
                  </div>
                </div>
              ) : (
                /* Hint banner when no node selected */
                <div className="absolute bottom-3 left-3 bg-cream/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gold/30 text-[11px] text-charcoal-muted pointer-events-none">
                  💡 Click any node to open its interactive inspector & connections
                </div>
              )}
            </div>
          </div>
        )}

        {/* Global Graph Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            ['Memory Nodes', stats?.node_count, 'Entities stored in local Cognee graph'],
            ['Relationship Edges', stats?.edge_count, 'Typed traversable connections'],
            ['Cohort Peers', data?.profile?.cohort_peers ?? '—', 'Stores sharing your localized cluster'],
            ['Adopted Actions', data?.profile?.acceptance_rate != null ? `${Math.round(data.profile.acceptance_rate * 100)}%` : '—', 'Insights reinforced into memory'],
          ].map(([title, val, desc]) => (
            <div key={title} className="rounded-2xl bg-sand/60 border border-gold/25 p-3">
              <p className="text-[10px] uppercase font-bold text-wine">{title}</p>
              <p className="font-heading font-bold text-xl text-charcoal tabular-nums mt-0.5">{val ?? '—'}</p>
              <p className="text-[10px] text-charcoal-muted truncate mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        {/* Collaborative Filtering Traversal Preview */}
        {(data?.cohort_suggestions || []).length > 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-wine/5 via-gold/10 to-sand/40 border border-gold/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-wine" />
              <p className="text-xs uppercase font-extrabold tracking-wider text-wine">
                Collaborative Filtering via Graph Traversal
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.cohort_suggestions.map((s) => (
                <div key={s.category} className="bg-cream/80 rounded-xl p-2.5 border border-gold/20 text-xs">
                  <span className="font-bold text-charcoal capitalize">{s.category} Play: </span>
                  <span className="text-charcoal-muted">{s.why}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
