const API_BASE = "http://127.0.0.1:8000/api/v1";

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
};
