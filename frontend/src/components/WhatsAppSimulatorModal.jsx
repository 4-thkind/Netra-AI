import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Send, Sparkles, CheckCheck, ShoppingBag, ShieldAlert, Bot } from 'lucide-react';
import { api } from '../services/api';
import { translations } from '../i18n/translations';

export default function WhatsAppSimulatorModal({ isOpen, onClose, lang = 'hi' }) {
  const t = translations[lang]?.whatsAppModal || translations.en.whatsAppModal;
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      sender: 'netra',
      time: '10:01 PM',
      text: "🌙 *नमस्ते रमेश जी (Netrā Live Copilot)*\n\n📊 *आज की डिजिटल बिक्री:* ₹14,280 (38 UPI भुगतानों में)\n💰 *अगले 7 दिनों का अनुमानित कैश:* ₹78,400\n\n⚠️ *रणनीतिक सलाह:* शनिवार को अधिक ग्राहक आएंगे। थोक सप्लायर का ₹15,000 का भुगतान शनिवार दोपहर को करें।"
    },
    {
      sender: 'netra',
      time: '10:02 PM',
      text: "🪔 *नवरात्रि पर्व तैयारी (T-9 दिन शेष)*\n\nआपके क्षेत्र में कुट्टू आटा, शुद्ध घी और साबूदाना की मांग 35% बढ़ रही है। क्या आप थोक वितरक से कोटेशन मंगाना चाहते हैं?",
      quickActions: ["हाँ, कोटेशन मंगाएं", "कल सुबह याद दिलाएं"]
    }
  ]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const sendMessageToCopilot = async (textToSend) => {
    const query = textToSend || replyText;
    if (!query.trim() || loading) return;

    const userMsg = {
      sender: 'ramesh',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setReplyText("");
    setLoading(true);

    try {
      const res = await api.chatCopilot(query, lang);
      const isBlocked = res.status === 'blocked';

      const botMsg = {
        sender: 'netra',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: res.response || "क्षमा करें, संदेश संसाधित करने में समस्या आई।",
        isBlocked: isBlocked,
        reason: res.reason
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Copilot API error:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'netra',
          time: 'Just now',
          text: "⚠️ कनेक्शन त्रुटि। कृपया पुनः प्रयास करें।"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDistributorPO = () => {
    const poMsg = "📋 *Purchase Order to Sharmaji Wholesalers:*\n• 2 Crates Amul Taaza Milk (₹1,200)\n• 1 Box Frooti 200ml (₹480)\n• 25kg Kuttu Atta (₹1,500)\n*Total: ₹3,180 (Pay on Delivery)*";
    setMessages(prev => [
      ...prev,
      { sender: 'ramesh', time: 'Just now', text: poMsg }
    ]);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'netra',
          time: 'Just now',
          text: `✅ *${t.poSuccess}*\nऑर्डर की पुष्टि हो गई है। डिलीवरी शुक्रवार सुबह 9 बजे निर्धारित है।`
        }
      ]);
    }, 800);
  };

  const samplePrompts = [
    { label: "📈 Top selling items today", query: "What are the fastest selling categories in my cluster today?" },
    { label: "💰 7-day cash flow recap", query: "What are my 7-day cash flow predictions and distributor settlements?" },
    { label: "🪔 Upcoming festival demand", query: "What items should I stock for upcoming festivals?" },
    { label: "🦹 Test competitor price probe", query: "What is competitor Gupta General Store charging for cold drinks?" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 backdrop-blur-sm p-4">
      <div className="bg-[#EFEAE2] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col h-[650px] border-4 border-slate-700 animate-fadeIn">
        
        {/* WhatsApp Top Bar */}
        <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-charcoal font-bold text-xs shadow">
              नेत्र
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h4 className="font-semibold text-sm leading-tight">{t.title}</h4>
                <span className="text-[9px] bg-emerald-700 text-cream px-1.5 py-0.2 rounded font-mono font-bold">AI</span>
              </div>
              <p className="text-[10px] text-emerald-200">Official Paytm Verified Business • Live Copilot</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-emerald-800 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action shortcut banner: 1-Tap Distributor PO */}
        <div className="bg-emerald-100/90 px-3 py-2 border-b border-emerald-300 flex items-center justify-between">
          <span className="text-[11px] text-emerald-950 font-semibold flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
            <span>B2B Distributor Integration:</span>
          </span>
          <button
            onClick={handleDistributorPO}
            className="text-[10.5px] font-bold bg-[#075E54] hover:bg-emerald-800 text-white px-2.5 py-1 rounded-full shadow-xs transition-colors"
          >
            {t.distributorPO}
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#E5DDD5]">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.sender === 'ramesh' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[88%] p-3 rounded-2xl text-xs shadow-xs ${
                m.sender === 'ramesh' 
                  ? 'bg-[#DCF8C6] text-charcoal rounded-tr-none' 
                  : m.isBlocked
                  ? 'bg-red-50 text-charcoal border border-red-300 rounded-tl-none'
                  : 'bg-white text-charcoal rounded-tl-none'
              }`}>
                {m.isBlocked && (
                  <div className="flex items-center space-x-1.5 text-red-700 font-bold text-[11px] mb-1.5 pb-1 border-b border-red-200">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>Adversarial Query Blocked by Sentinel</span>
                  </div>
                )}
                
                <div className="whitespace-pre-line leading-relaxed">{m.text}</div>
                
                <div className="flex items-center justify-end space-x-1 mt-1 text-[9px] text-slate-500">
                  <span>{m.time}</span>
                  {m.sender === 'ramesh' && <CheckCheck className="w-3 h-3 text-sky-500" />}
                </div>
              </div>

              {m.quickActions && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.quickActions.map((qa, qidx) => (
                    <button
                      key={qidx}
                      onClick={() => sendMessageToCopilot(qa)}
                      className="text-[11px] font-semibold bg-white hover:bg-slate-100 text-emerald-800 px-3 py-1 rounded-full shadow-xs border border-emerald-600/30"
                    >
                      {qa}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-charcoal-muted bg-white/80 w-fit px-3 py-1.5 rounded-full shadow-xs animate-pulse">
              <Bot className="w-3.5 h-3.5 text-emerald-700" />
              <span>नेत्र AI विचार कर रहा है...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Test Prompt Pills for Judges */}
        <div className="bg-[#EFEAE2] px-3 py-1.5 border-t border-slate-300 overflow-x-auto">
          <div className="flex items-center space-x-1.5 whitespace-nowrap">
            <span className="text-[10px] font-bold text-slate-600 uppercase">Test Prompts:</span>
            {samplePrompts.map((p, pidx) => (
              <button
                key={pidx}
                onClick={() => sendMessageToCopilot(p.query)}
                disabled={loading}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                  p.label.includes('competitor')
                    ? 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
                    : 'bg-white text-emerald-900 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="bg-[#F0F0F0] px-3 py-2 flex items-center space-x-2 border-t border-slate-300">
          <input
            type="text"
            placeholder="Type your message to Netrā AI Copilot..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessageToCopilot()}
            disabled={loading}
            className="flex-1 px-3 py-1.5 text-xs rounded-full bg-white border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessageToCopilot()}
            disabled={loading || !replyText.trim()}
            className="w-8 h-8 rounded-full bg-[#075E54] hover:bg-[#128C7E] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
