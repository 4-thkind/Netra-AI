import React, { useEffect, useMemo, useState } from 'react';
import { Brain, RefreshCw, Filter } from 'lucide-react';
import Sheet from './ui/Sheet';
import { Pill } from './ui/Card';
import { api } from '../services/api';

export const TYPE_STYLE = {
  Merchant: { fill: '#722F37', label: 'Merchant' },
  Cohort: { fill: '#C9A96E', label: 'Cohort' },
  Category: { fill: '#2F6F5E', label: 'Category' },
  Recommendation: { fill: '#8B4049', label: 'Insight' },
  Language: { fill: '#5B6E8C', label: 'Language' },
  Festival: { fill: '#A8642A', label: 'Festival' },
};

/**
 * Full-screen Cognee graph explorer.
 *
 * The dashboard card shows a small preview; this is the version a judge can
 * actually read — more nodes, selectable, with the selected node's edges and
 * properties listed beside it.
 *
 * Layout is deterministic (concentric rings by node type) rather than a force
 * simulation: no dependency, no jitter between renders, and it stays legible
 * on a projector.
 */
export default function KnowledgeGraphModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [limit, setLimit] = useState(40);

  const load = () => {
    setLoading(true);
    api.getKnowledgeGraph()
      .then((d) => { setData(d); setSelected(null); })
      .catch((e) => console.error('knowledge graph:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (isOpen && !data) load(); }, [isOpen]);

  const layout = useMemo(() => {
    if (!data?.graph?.nodes?.length) return null;
    const W = 760, H = 520, cx = W / 2, cy = H / 2;
    const nodes = data.graph.nodes;

    // Centre on this merchant; everything else orbits by type.
    const me = nodes.find((n) => n.type === 'Merchant' && n.props?.name) || nodes[0];
    const RING = { Cohort: 110, Language: 150, Category: 190, Recommendation: 190, Festival: 225, Merchant: 245 };

    // Take the structurally interesting nodes first. A naive slice returns 40
    // Merchants and the graph looks like one undifferentiated blob.
    const PRIORITY = { Cohort: 0, Category: 1, Recommendation: 2, Language: 3, Festival: 4, Merchant: 5 };
    const others = nodes
      .filter((n) => n.id !== me.id)
      .sort((a, b) => (PRIORITY[a.type] ?? 9) - (PRIORITY[b.type] ?? 9))
      .slice(0, limit);
    const byType = {};
    others.forEach((n) => { (byType[n.type] ||= []).push(n); });

    const placed = { [me.id]: { x: cx, y: cy, node: me } };
    Object.entries(byType).forEach(([type, list]) => {
      const r = RING[type] ?? 210;
      list.forEach((n, i) => {
        // Offset each ring slightly so labels from different types don't stack.
        const angle = (i / list.length) * Math.PI * 2 - Math.PI / 2 + (r % 7) * 0.12;
        placed[n.id] = { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r * 0.66, node: n };
      });
    });

    const edges = (data.graph.edges || []).filter((e) => placed[e.source] && placed[e.target]);
    return { W, H, placed, edges, me };
  }, [data, limit]);

  const selectedEdges = useMemo(() => {
    if (!selected || !layout) return [];
    return layout.edges.filter((e) => e.source === selected.id || e.target === selected.id);
  }, [selected, layout]);

  const stats = data?.graph?.stats;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Merchant Knowledge Graph"
      subtitle="Cognee · persistent memory, cohort mapping and the reinforcement loop"
      badge={<Pill tone="wine">Cognee</Pill>}
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-charcoal-muted">
            <Filter className="w-3.5 h-3.5 text-wine" />
            <span>Showing</span>
            {[20, 40, 80].map((n) => (
              <button
                key={n}
                onClick={() => { setLimit(n); setSelected(null); }}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                  limit === n ? 'bg-wine text-cream' : 'bg-sand text-charcoal hover:bg-gold/20'
                }`}
              >
                {n}
              </button>
            ))}
            <span>of {stats?.node_count ?? '—'} nodes</span>
          </div>
          <button
            onClick={load}
            className="h-9 px-3 rounded-xl bg-sand hover:bg-gold/20 border border-gold/30
                       text-xs font-bold text-charcoal inline-flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-wine ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      }
    >
      <div className="p-4 sm:p-5 space-y-4">
        {!layout && (
          <p className="text-sm text-charcoal-muted text-center py-10">
            {loading ? 'Loading graph…' : 'No graph data yet.'}
          </p>
        )}

        {layout && (
          <>
            {/* SVG draws edges and nodes; the clickable targets are real HTML
                buttons positioned over it in percentage space. React event
                handlers on SVG children proved unreliable here, and a <button>
                is also focusable and keyboard-accessible, which <circle> is not. */}
            <div className="relative rounded-2xl bg-charcoal/[.04] border border-gold/25 overflow-hidden">
              <svg
                viewBox={`0 0 ${layout.W} ${layout.H}`}
                className="w-full h-auto block"
                aria-hidden="true"
              >
                {layout.edges.map((e, i) => {
                  const a = layout.placed[e.source], b = layout.placed[e.target];
                  const on = selected && (e.source === selected.id || e.target === selected.id);
                  return (
                    <line
                      key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke={on ? '#722F37' : '#C9A96E'}
                      strokeOpacity={selected ? (on ? 0.9 : 0.15) : 0.45}
                      strokeWidth={on ? 1.6 : 0.7}
                    />
                  );
                })}
                {Object.values(layout.placed).map(({ x, y, node }) => {
                  const style = TYPE_STYLE[node.type] || { fill: '#666' };
                  const isMe = node.id === layout.me.id;
                  const isSel = selected?.id === node.id;
                  const dim = selected && !isSel &&
                    !selectedEdges.some((e) => e.source === node.id || e.target === node.id);
                  return (
                    <g key={node.id} opacity={dim ? 0.25 : 1}>
                      <circle
                        cx={x} cy={y} r={isMe ? 14 : isSel ? 10 : 7}
                        fill={style.fill} stroke={isSel ? '#2D2D2D' : '#FFF8F0'}
                        strokeWidth={isSel ? 3 : isMe ? 3 : 1.8}
                      />
                      <text
                        x={x} y={y + (isMe ? 28 : 20)} textAnchor="middle"
                        fontSize={isMe ? 11 : 9} fill="#2D2D2D"
                        fontWeight={isMe || isSel ? 700 : 500}
                      >
                        {String(node.label).slice(0, 20)}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {Object.values(layout.placed).map(({ x, y, node }) => {
                const isSel = selected?.id === node.id;
                return (
                  <button
                    key={`hit-${node.id}`}
                    onClick={() => setSelected(isSel ? null : node)}
                    aria-label={`${node.type}: ${node.label}`}
                    title={`${node.type}: ${node.label}`}
                    style={{
                      position: 'absolute',
                      left: `${(x / layout.W) * 100}%`,
                      top: `${(y / layout.H) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 34, height: 34, borderRadius: '50%',
                    }}
                    className="bg-transparent hover:bg-wine/10 focus:outline-none
                               focus-visible:ring-2 focus-visible:ring-wine"
                  />
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {Object.entries(TYPE_STYLE).map(([type, s]) => (
                <span key={type} className="inline-flex items-center gap-1.5 text-[11px]
                                            font-semibold text-charcoal-muted">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }} />
                  {s.label}
                </span>
              ))}
              <span className="text-[11px] text-charcoal-light ml-auto">Tap any node to inspect it</span>
            </div>

            {selected ? (
              <div className="rounded-2xl border border-wine/25 bg-wine/5 p-4 animate-riseIn">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-3 h-3 rounded-full"
                        style={{ background: (TYPE_STYLE[selected.type] || {}).fill }} />
                  <h4 className="font-heading font-bold text-base text-wine">{selected.label}</h4>
                  <Pill tone="gold">{selected.type}</Pill>
                </div>

                {Object.keys(selected.props || {}).length > 0 && (
                  <dl className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(selected.props).map(([k, v]) => (
                      <div key={k} className="rounded-xl bg-cream border border-gold/25 px-2.5 py-1.5">
                        <dt className="text-[9px] uppercase font-bold tracking-wide text-charcoal-light">{k}</dt>
                        <dd className="text-[11px] font-semibold text-charcoal truncate">{String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <p className="text-[10px] uppercase font-bold tracking-wide text-wine mt-3">
                  Connections ({selectedEdges.length})
                </p>
                <ul className="mt-1.5 space-y-1 max-h-40 overflow-y-auto">
                  {selectedEdges.slice(0, 25).map((e, i) => {
                    const out = e.source === selected.id;
                    const other = layout.placed[out ? e.target : e.source]?.node;
                    return (
                      <li key={i} className="text-[11px] text-charcoal flex items-center gap-1.5">
                        <span className="font-mono font-bold text-wine">
                          {out ? '→' : '←'} {e.rel}
                        </span>
                        <span className="truncate">{other?.label}</span>
                        {e.props?.verdict && (
                          <Pill tone={e.props.verdict === 'accepted' ? 'emerald' : 'neutral'}>
                            {e.props.verdict}
                          </Pill>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  ['Nodes', stats?.node_count],
                  ['Edges', stats?.edge_count],
                  ['Cohort peers', data?.profile?.cohort_peers],
                  ['Adopted', data?.profile?.acceptance_rate != null
                    ? `${Math.round(data.profile.acceptance_rate * 100)}%` : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-sand/70 border border-gold/25 p-3">
                    <p className="text-[10px] uppercase font-bold text-wine">{k}</p>
                    <p className="font-heading font-bold text-xl text-charcoal tabular-nums">
                      {v ?? '—'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {(data?.cohort_suggestions || []).length > 0 && (
              <div className="rounded-2xl bg-sand/60 border border-gold/25 p-4">
                <p className="text-[10px] uppercase font-bold tracking-wide text-wine">
                  Learned from your cohort — traversal, not a lookup
                </p>
                {data.cohort_suggestions.map((s) => (
                  <p key={s.category} className="text-xs text-charcoal mt-1.5 leading-snug">
                    <strong className="capitalize">{s.category}</strong> — {s.why}
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Sheet>
  );
}
