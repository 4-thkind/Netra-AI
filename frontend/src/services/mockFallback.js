import rawMockStore from "./mockStore.js";

// In-memory clone so stateful operations like POS scanning or phone updating mutate live
let store = JSON.parse(JSON.stringify(rawMockStore));

export function getMockResponse(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const cleanEndpoint = endpoint.split("?")[0];
  const fullEndpoint = endpoint;

  // 1. Exact match in pre-seeded mock store
  if (method === "GET") {
    if (store[fullEndpoint]) {
      return JSON.parse(JSON.stringify(store[fullEndpoint]));
    }

    // Category query fallback for price pulse
    if (cleanEndpoint === "/insights/price-pulse") {
      const match = store[fullEndpoint] || store["/insights/price-pulse?category=snacks"];
      return JSON.parse(JSON.stringify(match));
    }

    // Fallback for inventory endpoints
    if (cleanEndpoint === "/inventory/items") {
      return JSON.parse(JSON.stringify(store["/inventory/items"] || []));
    }
    if (cleanEndpoint === "/inventory/overview") {
      return JSON.parse(JSON.stringify(store["/inventory/overview"] || {}));
    }
    if (cleanEndpoint === "/inventory/dead-stock") {
      return JSON.parse(JSON.stringify(store["/inventory/dead-stock"] || []));
    }
    if (cleanEndpoint === "/inventory/reorder-alerts") {
      return JSON.parse(JSON.stringify(store["/inventory/reorder-alerts"] || []));
    }
    if (cleanEndpoint === "/inventory/cluster-pool") {
      return JSON.parse(JSON.stringify(store["/inventory/cluster-pool"] || []));
    }

    // Base matches
    if (store[cleanEndpoint]) {
      return JSON.parse(JSON.stringify(store[cleanEndpoint]));
    }
  }

  // 2. Stateful Mutations & POST / PATCH Handlers
  let body = {};
  try {
    if (options.body) {
      body = typeof options.body === "string" ? JSON.parse(options.body) : options.body;
    }
  } catch {
    body = {};
  }

  // Barcode POS scanning
  if (cleanEndpoint === "/inventory/simulate-pos-sale" && method === "POST") {
    const barcode = body.barcode || "8901491101844";
    const qty = body.quantity || 1;
    const items = store["/inventory/items"] || [];
    let item = items.find((i) => i.barcode === barcode);

    if (!item && items.length > 0) {
      item = items[0];
    }

    if (item) {
      item.current_stock = Math.max(0, item.current_stock - qty);
      const revenue = item.selling_price * qty;
      const margin = (item.selling_price - item.cost_price) * qty;

      // Update overview stock value if present
      if (store["/inventory/overview"]) {
        store["/inventory/overview"].total_stock_value = Math.max(
          0,
          store["/inventory/overview"].total_stock_value - item.cost_price * qty
        );
      }

      return {
        item: { ...item },
        transaction: {
          units_sold: qty,
          revenue,
          gross_margin: margin,
          remaining_stock: item.current_stock,
          depletion_status: item.current_stock <= item.reorder_level ? "REORDER_NOW" : "HEALTHY",
        },
        soundbox_alert: `Paytm par ₹${revenue.toFixed(0)} prapt hue`,
      };
    }
  }

  // Dispatch Purchase Order
  if (cleanEndpoint === "/inventory/dispatch-po" && method === "POST") {
    return {
      status: "dispatched",
      po_id: `PO-${Date.now().toString().slice(-6)}`,
      item_id: body.item_id,
      crates: body.crates || 2,
      message: "1-Tap Purchase Order transmitted to Distributor via WhatsApp API",
      timestamp: new Date().toISOString(),
    };
  }

  // Simulate Paytm Soundbox Payment
  if (cleanEndpoint === "/merchant/simulate-payment" && method === "POST") {
    const amount = 150.0;
    return {
      status: "received",
      amount,
      currency: "INR",
      transaction_id: `TXN-PAYTM-${Date.now().toString().slice(-6)}`,
      merchant_name: "Sanjeev Kumar",
      store_name: "Sanjeev Kirana Store",
      timestamp: new Date().toISOString(),
      announcement: `Paytm par ₹${amount} prapt hue`,
    };
  }

  // WhatsApp dispatch via n8n
  if (cleanEndpoint === "/merchant/whatsapp/send" && method === "POST") {
    return {
      status: "dispatched",
      kind: body.kind || "insight",
      recipient: "+91 98102 44921",
      mode: "n8n_automated_delivery",
      timestamp: new Date().toISOString(),
      message: "Briefing sent to merchant WhatsApp via n8n webhook",
    };
  }

  // Update contact phone
  if (cleanEndpoint === "/merchant/contact" && method === "PATCH") {
    const phone = body.phone || "+91 98102 44921";
    if (store["/merchant/me"]) {
      store["/merchant/me"].phone = phone;
    }
    return {
      status: "updated",
      whatsapp_number: phone,
      delivery_mode: "simulated",
    };
  }

  // Copilot Chat
  if (cleanEndpoint === "/recommendations/chat-copilot" && method === "POST") {
    const q = (body.query || "").toLowerCase();
    let reply = "Namaste Sanjeev ji! Netrā cluster intelligence shows strong demand for snacks and dairy this week. Your cashflow buffer is healthy for the next 7 days.";
    if (q.includes("stock") || q.includes("inventory")) {
      reply = "Aapke store mein Lay's Classic Salted aur Haldiram Aloo Bhujia ka stock 2 din mein khatam hone wala hai. Netrā cluster pool ke saath reorder karein 14% discount ke liye!";
    } else if (q.includes("loan") || q.includes("credit")) {
      reply = "Aapka Paytm Soundbox underwriting score 820 hai. ₹1,50,000 ka working capital loan pre-approved hai 1.15% monthly rate par!";
    } else if (q.includes("festival") || q.includes("demand")) {
      reply = "Chaitra Navratri aane wali hai. Kuttu Atta aur Sabudana ka wholesale pool order lagane se ₹3,200 tak ki bachat ho sakti hai.";
    }
    return { reply, context: "Sanjeev Kirana Store (Lajpat Nagar)" };
  }

  // Generate LLM Recommendation
  if (cleanEndpoint === "/recommendations/generate-llm" && method === "POST") {
    return {
      id: `rec_gen_${Date.now()}`,
      category: "snacks",
      title: "Cluster AI: Stock Haldiram Bhujia Bulk",
      rationale: "Nearby cluster merchants report 28% increase in weekend evening footfall. Pool order saves ₹380.",
      impact_score: 92,
      action_type: "ORDER",
    };
  }

  // Record Recommendation Action
  if (cleanEndpoint.startsWith("/recommendations/") && cleanEndpoint.endsWith("/action") && method === "POST") {
    return { status: "recorded", action: body.action, timestamp: new Date().toISOString() };
  }

  // Privacy Simulator
  if (cleanEndpoint === "/simulator/run" && method === "POST") {
    return {
      simulation_id: `SIM-${Date.now().toString().slice(-6)}`,
      status: "SECURE",
      epsilon_consumed: 0.12,
      epsilon_remaining: 1.88,
      risk_level: "ZERO_DISCLOSURE",
      message: "Differential privacy threshold intact. No merchant SKU leakage possible.",
    };
  }

  // n8n Triggers
  if (cleanEndpoint.startsWith("/n8n/trigger/") && method === "POST") {
    const workflow = cleanEndpoint.split("/").pop();
    return {
      status: "triggered",
      workflow,
      workflow_id: `WF-${Date.now().toString().slice(-6)}`,
      execution_time_ms: 142,
    };
  }

  // Fallback default
  return { status: "success", message: "Served via Netrā Autonomous Edge Layer", endpoint };
}
