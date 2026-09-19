import { getMockResponse } from "./mockFallback";

const API_BASE = `${import.meta.env.VITE_API_BASE ?? ""}/api/v1`;

export async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem("netra_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

    // Cloudflare Pages / SPA fallback detection:
    // If the server returned HTML (due to SPA /* -> /index.html rewrite) or 404/5xx,
    // fallback to autonomous in-browser Netrā intelligence.
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      console.info(`[NETRĀ] Autonomous Edge Mode: ${endpoint}`);
      return getMockResponse(endpoint, options);
    }

    if (!res.ok) {
      console.warn(`[NETRĀ] Server returned ${res.status} on ${endpoint}, falling back to edge mock`);
      return getMockResponse(endpoint, options);
    }

    return await res.json();
  } catch (err) {
    console.info(`[NETRĀ] Offline/Static Edge Mode on ${endpoint}:`, err.message);
    return getMockResponse(endpoint, options);
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
  generateLlmRecommendation: (cat = "snacks", lang = "en") => 
    fetchWithAuth(`/recommendations/generate-llm?category=${cat}&lang=${lang}`, { method: "POST" }),
  recordAction: (recId, action, notes) => 
    fetchWithAuth(`/recommendations/${recId}/action`, {
      method: "POST",
      body: JSON.stringify({ action, notes })
    }),


  // Merchant Underwriting & Copilot
  getCreditStatement: () => fetchWithAuth("/merchant/credit-statement"),
  chatCopilot: (query, lang = "hi") =>
    fetchWithAuth("/recommendations/chat-copilot", {
      method: "POST",
      body: JSON.stringify({ query, lang })
    }),

  // Merchant WhatsApp connection (delivery via n8n)
  updateContact: (phone) =>
    fetchWithAuth("/merchant/contact", { method: "PATCH", body: JSON.stringify({ phone }) }),
  sendWhatsApp: (kind = "insight", message = null, lang = null) =>
    fetchWithAuth("/merchant/whatsapp/send", {
      method: "POST",
      body: JSON.stringify({ kind, message, lang }),
    }),
  getKnowledgeGraph: () => fetchWithAuth("/merchant/knowledge-graph"),
  getDeliveries: () => fetchWithAuth("/n8n/deliveries"),

  // n8n Workflows
  getN8nInfo: () => fetchWithAuth("/n8n/info"),
  triggerN8nEod: () => fetchWithAuth("/n8n/trigger/eod", { method: "POST" }),
  triggerN8nFestival: () => fetchWithAuth("/n8n/trigger/festival", { method: "POST" }),
  triggerN8nPrivacySentinel: (cohortSize = 4) => fetchWithAuth(`/n8n/trigger/privacy-sentinel?cohort_size=${cohortSize}`, { method: "POST" }),

  // Privacy & Security
  getPrivacyPolicy: () => fetchWithAuth("/privacy/policy"),
  getPrivacyBudget: () => fetchWithAuth("/privacy/budget"),
  getAuditEvents: () => fetchWithAuth("/security/audit-events"),
  runAttackSimulation: (payload) => 
    fetchWithAuth("/simulator/run", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  // Inventory Intelligence & Paytm POS Billing
  getInventoryOverview: () => fetchWithAuth("/inventory/overview"),
  getInventoryItems: () => fetchWithAuth("/inventory/items"),
  getDeadStock: () => fetchWithAuth("/inventory/dead-stock"),
  getReorderAlerts: () => fetchWithAuth("/inventory/reorder-alerts"),
  getClusterPool: () => fetchWithAuth("/inventory/cluster-pool"),
  simulatePosSale: (barcode, quantity = 1) =>
    fetchWithAuth("/inventory/simulate-pos-sale", {
      method: "POST",
      body: JSON.stringify({ barcode, quantity })
    }),
  dispatchInventoryPO: (itemId, crates = null) =>
    fetchWithAuth("/inventory/dispatch-po", {
      method: "POST",
      body: JSON.stringify({ item_id: itemId, crates })
    }),
};
