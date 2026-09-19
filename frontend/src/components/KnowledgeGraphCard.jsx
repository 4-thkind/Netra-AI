import React, { useEffect, useMemo, useState } from 'react';
import { Brain, RefreshCw, Maximize2 } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter, Pill, Skeleton } from './ui/Card';
import KnowledgeGraphModal from './KnowledgeGraphModal';
import { api } from '../services/api';

/** Node colours by type — the legend doubles as the graph schema. */
const TYPE_STYLE = {
  Merchant: { fill: '#722F37', label: 'Merchant' },
  Cohort: { fill: '#C9A96E', label: 'Cohort' },
  Category: { fill: '#2F6F5E', label: 'Category' },
  Recommendation: { fill: '#8B4049', label: 'Insight' },
  Language: { fill: '#5B6E8C', label: 'Language' },
  Festival: { fill: '#A8642A', label: 'Festival' },
};

/**
 * Cognee merchant knowledge graph, drawn as SVG.
 *
 * Laid out radially rather than with a force simulation: deterministic, no
 * dependency, and it reads clearly on a projector. The centre is always this
 * merchant, so the picture answers "what does Netrā remember about me".
 */
export default function KnowledgeGraphCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const load = () => {
    setLoading(true);
    api.getKnowledgeGraph()
      .then(setData)
      .catch((e) => console.error('knowledge graph:', e))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const layout = useMemo(() => {
    if (!data?.graph?.nodes?.length) return null;
    const W = 320, H = 210, cx = W / 2, cy = H / 2;

    const nodes = data.graph.nodes;
    const me = nodes.find((n) => n.type === 'Merchant' && n.props?.name) || nodes[0];

    // Peers are numerous; showing all 200 is noise. Keep a readable sample.
    const others = nodes.filter((n) => n.id !== me.id);
    const ranked = [...others].sort((a, b) => {
      const w = { Cohort: 0, Recommendation: 1, Category: 2, Language: 3, Festival: 4, Merchant: 5 };
      return (w[a.type] ?? 9) - (w[b.type] ?? 9);
    }).slice(0, 11);

    const placed = { [me.id]: { x: cx, y: cy, node: me } };
    ranked.forEach((n, i) => {
      const angle = (i / ranked.length) * Math.PI * 2 - Math.PI / 2;
      const r = n.type === 'Cohort' ? 58 : 86;
      placed[n.id] = { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r * 0.82, node: n };
    });

    const edges = (data.graph.edges || [])
      .filter((e) => placed[e.source] && placed[e.target])
      .slice(0, 40);

    return { W, H, placed, edges, me };
  }, [data]);

  const stats = data?.graph?.stats;
  const suggestions = data?.cohort_suggestions || [];
  const profile = data?.profile;

  return (
    <>
    <Card>
      <CardHeader
        Icon={Brain}
        title="Merchant Knowledge Graph"
        subtitle="Cognee · persistent memory & cohort mapping"
        badge={
          <button
            onClick={load}
            aria-label="Refresh graph"
            className="w-8 h-8 rounded-lg hover:bg-sand flex items-center justify-center transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-wine ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      <CardBody className="space-y-3">
        {loading && !data && <Skeleton className="h-40" />}

        {layout && (
          <button
            onClick={() => setExpanded(true)}
            aria-label="Open the full knowledge graph explorer"
            className="group relative w-full rounded-xl bg-charcoal/[.04] border border-gold/20
                       overflow-hidden hover:border-gold transition-colors"
          >
            <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-lg
                             bg-wine text-cream text-[10px] font-bold px-2 py-1 opacity-90
                             group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3 h-3" />
              Explore
            </span>
            <svg viewBox={`0 0 ${layout.W} ${layout.H}`} className="w-full h-auto" role="img"
                 aria-label="Merchant knowledge graph">
              {layout.edges.map((e, i) => {
                const a = layout.placed[e.source], b = layout.placed[e.target];
                return (
                  <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                        stroke="#C9A96E" strokeOpacity="0.5" strokeWidth="0.8" />
                );
              })}
              {Object.values(layout.placed).map(({ x, y, node }) => {
                const style = TYPE_STYLE[node.type] || { fill: '#666' };
                const isMe = node.id === layout.me.id;
                return (
                  <g key={node.id}>
                    <circle cx={x} cy={y} r={isMe ? 11 : 6} fill={style.fill}
                            stroke="#FFF8F0" strokeWidth={isMe ? 2.5 : 1.5} />
                    <text x={x} y={y + (isMe ? 24 : 16)} textAnchor="middle"
                          fontSize={isMe ? 8 : 6.5} fill="#2D2D2D" fontWeight={isMe ? 700 : 500}>
                      {String(node.label).slice(0, 18)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </button>
        )}

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(TYPE_STYLE).map(([type, s]) => (
            <span key={type} className="inline-flex items-center gap-1 text-[10px] font-semibold
                                        text-charcoal-muted">
              <span className="w-2 h-2 rounded-full" style={{ background: s.fill }} />
              {s.label}
            </span>
          ))}
        </div>

        {stats && (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-sand/70 border border-gold/20 p-2.5">
              <p className="text-[10px] uppercase font-bold text-wine">Nodes</p>
              <p className="font-heading font-bold text-lg text-charcoal tabular-nums">
                {stats.node_count}
              </p>
            </div>
            <div className="rounded-xl bg-sand/70 border border-gold/20 p-2.5">
              <p className="text-[10px] uppercase font-bold text-wine">Edges</p>
              <p className="font-heading font-bold text-lg text-charcoal tabular-nums">
                {stats.edge_count}
              </p>
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="rounded-xl bg-wine/5 border border-wine/20 p-3">
            <p className="text-[10px] uppercase font-bold tracking-wide text-wine">
              Learned from your cohort
            </p>
            {suggestions.slice(0, 2).map((s) => (
              <p key={s.category} className="text-xs text-charcoal mt-1 leading-snug">
                <strong className="capitalize">{s.category}</strong> — {s.why}
              </p>
            ))}
          </div>
        )}

        {profile && (
          <div className="rounded-xl bg-sand/60 border border-gold/20 p-2.5">
            <p className="text-[10px] uppercase font-bold text-wine">Learned strategy</p>
            <p className="text-xs text-charcoal font-medium mt-0.5">{profile.preferred_strategy}</p>
          </div>
        )}
      </CardBody>

      <CardFooter
        note={profile?.cohort ? `Cohort ${profile.cohort} · ${profile.cohort_peers} peers` : 'Building memory'}
        action={
          profile?.acceptance_rate != null
            ? <Pill tone="emerald">{Math.round(profile.acceptance_rate * 100)}% adopted</Pill>
            : null
        }
      />
    </Card>

    {/* Rendered as a sibling of the Card, not inside it: a card is a
        stacking/overflow context and was swallowing the overlay's events. */}
    <KnowledgeGraphModal isOpen={expanded} onClose={() => setExpanded(false)} />
    </>
  );
}
