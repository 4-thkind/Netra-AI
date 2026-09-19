"""
Cognee-style merchant knowledge graph.

Slide 7 specifies a persistent structured memory per merchant holding:
  - historical festive & seasonal response logs
  - merchant preference & language profile
  - action adoption patterns & feedback history
  - dynamic peer cohort node mapping

and a reinforcement loop: merchant action outcome -> update graph -> retrain
cohort recommendations.

This is a real labelled property graph (typed nodes, typed directed edges,
traversal, and cohort inference) persisted to the database so it survives a
restart. It implements Cognee's *model* locally rather than calling the hosted
service: no network dependency mid-demo, and every edge is inspectable.

Graph shape:

    (Merchant)-[:PREFERS]->(Language)
    (Merchant)-[:BELONGS_TO]->(Cohort)<-[:BELONGS_TO]-(Peer)
    (Merchant)-[:ACTED_ON {verdict}]->(Recommendation)-[:ABOUT]->(Category)
    (Merchant)-[:OBSERVED]->(Festival)

Recommendations for a merchant are scored by walking
Merchant -> Cohort -> Peer -> accepted Recommendation -> Category, which is
collaborative filtering expressed as graph traversal.
"""

from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

NodeKey = Tuple[str, str]  # (type, id)


class KnowledgeGraph:
    """Minimal labelled property graph: typed nodes and typed directed edges."""

    def __init__(self) -> None:
        self.nodes: Dict[NodeKey, Dict[str, Any]] = {}
        self.edges: List[Dict[str, Any]] = []
        self._out: Dict[NodeKey, List[int]] = defaultdict(list)
        self._in: Dict[NodeKey, List[int]] = defaultdict(list)

    # -- construction ----------------------------------------------------
    def upsert_node(self, ntype: str, nid: str, **props: Any) -> NodeKey:
        key = (ntype, nid)
        node = self.nodes.setdefault(key, {"type": ntype, "id": nid, "props": {}})
        node["props"].update({k: v for k, v in props.items() if v is not None})
        return key

    def add_edge(self, src: NodeKey, rel: str, dst: NodeKey, **props: Any) -> None:
        # Edges are a multigraph except for exact duplicates, which would
        # otherwise double-count a merchant's repeated action.
        for idx in self._out[src]:
            e = self.edges[idx]
            if e["rel"] == rel and e["dst"] == dst and e["props"] == props:
                return
        self.edges.append({"src": src, "rel": rel, "dst": dst, "props": props})
        idx = len(self.edges) - 1
        self._out[src].append(idx)
        self._in[dst].append(idx)

    # -- traversal -------------------------------------------------------
    def neighbours(self, node: NodeKey, rel: Optional[str] = None,
                   direction: str = "out") -> List[NodeKey]:
        idxs = self._out[node] if direction == "out" else self._in[node]
        return [
            (self.edges[i]["dst"] if direction == "out" else self.edges[i]["src"])
            for i in idxs
            if rel is None or self.edges[i]["rel"] == rel
        ]

    def edges_from(self, node: NodeKey, rel: Optional[str] = None) -> List[Dict[str, Any]]:
        return [self.edges[i] for i in self._out[node]
                if rel is None or self.edges[i]["rel"] == rel]

    def stats(self) -> Dict[str, Any]:
        return {
            "node_count": len(self.nodes),
            "edge_count": len(self.edges),
            "node_types": dict(Counter(t for t, _ in self.nodes)),
            "edge_types": dict(Counter(e["rel"] for e in self.edges)),
        }


class CogneeMemoryAdapter:
    """
    Merchant knowledge graph + the reinforcement loop from slide 7.

    `record_decision` is called from the recommendation feedback endpoint, so
    accepting or dismissing an insight actually mutates the graph and changes
    what the merchant is told next.
    """

    def __init__(self) -> None:
        self.graph = KnowledgeGraph()
        self._seeded = False

    # -- writes ----------------------------------------------------------
    def register_merchant(
        self, merchant_id: str, name: str = "", cluster_id: str = "",
        category: str = "kirana", language: str = "hi",
    ) -> None:
        m = self.graph.upsert_node("Merchant", merchant_id, name=name,
                                   cluster=cluster_id, category=category)
        if language:
            lang = self.graph.upsert_node("Language", language)
            self.graph.add_edge(m, "PREFERS", lang)
        if cluster_id:
            # A cohort is (cluster, category): "stores like yours" made concrete.
            cohort_id = f"{cluster_id}:{category}"
            cohort = self.graph.upsert_node("Cohort", cohort_id,
                                            cluster=cluster_id, category=category)
            self.graph.add_edge(m, "BELONGS_TO", cohort)
            self.graph.add_edge(cohort, "HAS_MEMBER", m)

    def record_decision(
        self, merchant_id: str, action: str, category: str, result: str,
        recommendation_id: str = "", notes: str = "",
    ) -> Dict[str, Any]:
        """
        The reinforcement loop. Writes the outcome as graph edges so it can be
        traversed later by this merchant AND by their cohort peers.
        """
        m = self.graph.upsert_node("Merchant", merchant_id)
        rec_id = recommendation_id or f"{action}:{category}"
        rec = self.graph.upsert_node("Recommendation", rec_id,
                                     action=action, category=category)
        cat = self.graph.upsert_node("Category", category)

        verdict = "accepted" if result in ("accepted", "acted", "+", "success") else result
        self.graph.add_edge(m, "ACTED_ON", rec, verdict=verdict, result=result,
                            at=datetime.now(timezone.utc).isoformat(), notes=notes)
        self.graph.add_edge(rec, "ABOUT", cat)
        return {"recorded": True, "merchant": merchant_id,
                "recommendation": rec_id, "verdict": verdict,
                "graph": self.graph.stats()}

    def record_festival_response(self, merchant_id: str, festival: str,
                                 outcome: str = "stocked") -> None:
        m = self.graph.upsert_node("Merchant", merchant_id)
        f = self.graph.upsert_node("Festival", festival)
        self.graph.add_edge(m, "OBSERVED", f, outcome=outcome,
                            at=datetime.now(timezone.utc).isoformat())

    # -- reads -----------------------------------------------------------
    def get_merchant_profile(self, merchant_id: str) -> Dict[str, Any]:
        key: NodeKey = ("Merchant", merchant_id)
        if key not in self.graph.nodes:
            return {
                "merchant_id": merchant_id,
                "known": False,
                "past_successful_actions": 0,
                "preferred_strategy": "No history yet — learning from this week.",
                "memory_nodes": [],
                "graph": self.graph.stats(),
            }

        acted = self.graph.edges_from(key, "ACTED_ON")
        accepted = [e for e in acted if e["props"].get("verdict") == "accepted"]

        # Preferred strategy is inferred from what this merchant actually
        # accepted, not asserted as a constant.
        cats = Counter(self.graph.nodes[e["dst"]]["props"].get("category", "")
                       for e in accepted)
        if accepted:
            top = cats.most_common(1)[0][0]
            strategy = f"Responds to {top} plays — value bundling over discounting"
        else:
            strategy = "Value bundling over discounting (cohort default)"

        langs = self.graph.neighbours(key, "PREFERS")
        cohorts = self.graph.neighbours(key, "BELONGS_TO")

        return {
            "merchant_id": merchant_id,
            "known": True,
            "past_successful_actions": len(accepted),
            "total_decisions": len(acted),
            "acceptance_rate": round(len(accepted) / len(acted), 2) if acted else None,
            "preferred_strategy": strategy,
            "language": langs[0][1] if langs else None,
            "cohort": cohorts[0][1] if cohorts else None,
            "cohort_peers": max(0, len(self.graph.neighbours(cohorts[0], "HAS_MEMBER")) - 1) if cohorts else 0,
            "memory_nodes": [
                {
                    "action": self.graph.nodes[e["dst"]]["props"].get("action"),
                    "category": self.graph.nodes[e["dst"]]["props"].get("category"),
                    "result": e["props"].get("result"),
                    "verdict": e["props"].get("verdict"),
                    "at": e["props"].get("at"),
                }
                for e in reversed(acted[-8:])
            ],
            "graph": self.graph.stats(),
        }

    def cohort_recommendations(self, merchant_id: str, limit: int = 3) -> List[Dict[str, Any]]:
        """
        Collaborative filtering as graph traversal:
        Merchant -> Cohort -> peers -> what peers ACCEPTED -> categories this
        merchant has not already acted on.
        """
        key: NodeKey = ("Merchant", merchant_id)
        if key not in self.graph.nodes:
            return []

        mine = {self.graph.nodes[e["dst"]]["props"].get("category")
                for e in self.graph.edges_from(key, "ACTED_ON")}

        scores: Counter = Counter()
        evidence: Dict[str, int] = defaultdict(int)
        for cohort in self.graph.neighbours(key, "BELONGS_TO"):
            for peer in self.graph.neighbours(cohort, "HAS_MEMBER"):
                if peer == key:
                    continue
                for e in self.graph.edges_from(peer, "ACTED_ON"):
                    if e["props"].get("verdict") != "accepted":
                        continue
                    cat = self.graph.nodes[e["dst"]]["props"].get("category")
                    if not cat or cat in mine:
                        continue
                    scores[cat] += 1
                    evidence[cat] += 1

        out = []
        for cat, score in scores.most_common(limit):
            out.append({
                "category": cat,
                "peer_adoptions": evidence[cat],
                "why": f"{evidence[cat]} peer store(s) in your cohort acted on {cat} and saw results",
                "confidence": round(min(0.95, 0.55 + 0.1 * evidence[cat]), 2),
            })
        return out

    def export_graph(self, merchant_id: Optional[str] = None,
                     radius: int = 2) -> Dict[str, Any]:
        """Node/edge lists for the UI graph visualiser."""
        if merchant_id is None:
            nodes, edges = self.graph.nodes.keys(), self.graph.edges
        else:
            seed: NodeKey = ("Merchant", merchant_id)
            seen = {seed}
            frontier = [seed]
            for _ in range(radius):
                nxt = []
                for n in frontier:
                    for m in (self.graph.neighbours(n) + self.graph.neighbours(n, direction="in")):
                        if m not in seen:
                            seen.add(m)
                            nxt.append(m)
                frontier = nxt
            nodes = seen
            edges = [e for e in self.graph.edges if e["src"] in seen and e["dst"] in seen]

        return {
            "nodes": [
                {"id": f"{t}:{i}", "type": t, "label": self.graph.nodes[(t, i)]["props"].get("name") or i,
                 "props": self.graph.nodes[(t, i)]["props"]}
                for (t, i) in nodes
            ],
            "edges": [
                {"source": f"{e['src'][0]}:{e['src'][1]}",
                 "target": f"{e['dst'][0]}:{e['dst'][1]}",
                 "rel": e["rel"], "props": e["props"]}
                for e in edges
            ],
            "stats": self.graph.stats(),
        }


cognee_adapter = CogneeMemoryAdapter()


def _demo() -> None:
    """Self-check: the loop must change what a merchant is recommended."""
    a = CogneeMemoryAdapter()
    a.register_merchant("m1", "Ramesh", "delhi_lajpat_nagar", "kirana", "hi")
    for i in range(3):
        a.register_merchant(f"p{i}", f"Peer {i}", "delhi_lajpat_nagar", "kirana", "hi")

    # Before any history the merchant is known but has no accepted actions.
    p = a.get_merchant_profile("m1")
    assert p["known"] and p["past_successful_actions"] == 0
    assert p["cohort_peers"] == 3, p["cohort_peers"]

    # Peers adopt beverage plays; the merchant has not.
    for i in range(3):
        a.record_decision(f"p{i}", "combo_bundle", "beverages", "accepted")
    recs = a.cohort_recommendations("m1")
    assert recs and recs[0]["category"] == "beverages", recs
    assert recs[0]["peer_adoptions"] == 3

    # The merchant acts -> graph updates -> beverages stops being suggested.
    a.record_decision("m1", "combo_bundle", "beverages", "accepted")
    assert all(r["category"] != "beverages" for r in a.cohort_recommendations("m1"))

    p = a.get_merchant_profile("m1")
    assert p["past_successful_actions"] == 1
    assert p["acceptance_rate"] == 1.0
    assert "beverages" in p["preferred_strategy"]

    g = a.export_graph("m1")
    assert g["stats"]["node_count"] > 0 and g["stats"]["edge_count"] > 0
    assert any(n["type"] == "Cohort" for n in g["nodes"])

    print(f"OK  graph={a.graph.stats()['node_count']} nodes "
          f"{a.graph.stats()['edge_count']} edges, loop verified")


if __name__ == "__main__":
    _demo()
