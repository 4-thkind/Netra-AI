import React, { useState } from 'react';
import { X, Volume2, Wifi, BatteryCharging, Radio, Sparkles, Barcode, Bell } from 'lucide-react';
import { translations, languages } from '../i18n/translations';
import { useDismissable } from '../hooks/useDismissable';
import { soundboxAudio } from '../utils/soundboxAudio';

export default function SoundboxDeviceModal({ isOpen, onClose, lang = 'hi' }) {
  const [chimePlaying, setChimePlaying] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(40);
  const [displayText, setDisplayText] = useState("₹ 40.00");

  useDismissable(isOpen, onClose);

  if (!isOpen) return null;

  const currentLangObj = languages.find(l => l.code === lang) || languages[1];
  const voiceMap = translations.en.voiceTranscript;
  const speechText = voiceMap[lang] || voiceMap.hi;

  const playPaymentAnnouncement = (amount = selectedAmount) => {
    setChimePlaying(true);
    setDisplayText(`₹ ${amount}.00`);

    soundboxAudio.playPaymentAnnouncement({
      amount: amount,
      lang: lang,
      onStart: () => setChimePlaying(true),
      onEnd: () => {
        setChimePlaying(false);
      }
    });
  };

  const playChimeOnly = () => {
    setChimePlaying(true);
    setDisplayText("CHIME");
    soundboxAudio.playPaytmChime(() => {
      setChimePlaying(false);
      setDisplayText(`₹ ${selectedAmount}.00`);
    });
  };

  const playMorningBriefing = () => {
    setVoicePlaying(true);
    setDisplayText("SIGNAL");
    soundboxAudio.playVoiceBriefing({
      text: speechText,
      lang: lang,
      onStart: () => setVoicePlaying(true),
      onEnd: () => {
        setVoicePlaying(false);
        setDisplayText("₹ 0.00");
      }
    });
  };

  const playBarcodeCheckoutDemo = () => {
    setChimePlaying(true);
    setDisplayText("SCAN");
    soundboxAudio.playPosBarcodeCheckout({
      skuName: 'Frooti 200ml',
      amount: 20,
      remainingStock: 3,
      lang: lang,
      onEnd: () => {
        setChimePlaying(false);
        setDisplayText("₹ 20.00");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 backdrop-blur-sm p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="bg-cream rounded-2xl max-w-md w-full border border-gold/40 shadow-lift overflow-hidden animate-riseIn">
        
        {/* Header */}
        <div className="bg-wine text-cream px-5 py-3.5 flex items-center justify-between border-b border-gold/30">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-gold" />
            <h3 className="font-heading font-semibold text-sm text-cream">Paytm Soundbox 4.0 Interactive Mock</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-wine-light text-cream transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Physical Soundbox Visual Replica */}
        <div className="p-6 flex flex-col items-center">
          
          <div className="w-64 bg-slate-900 rounded-3xl p-5 shadow-elevated border-4 border-slate-700 flex flex-col items-center relative">
            
            {/* Paytm Logo Bar */}
            <div className="w-full flex items-center justify-between px-2 text-slate-400 text-[10px] font-semibold">
              <div className="flex items-center space-x-1 text-sky-400 font-bold tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span>
                <span>Paytm</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[9px] bg-slate-800 text-gold px-1.5 py-0.2 rounded uppercase font-bold">
                  {currentLangObj.label}
                </span>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* LED Screen */}
            <div className="w-full bg-black/90 border-2 border-slate-800 rounded-xl p-4 mt-3 text-center shadow-inner">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">DIGITAL DISPLAY</span>
              <div className="text-2xl font-mono font-black text-amber-400 tracking-wider mt-1 animate-pulse">
                {displayText}
              </div>
            </div>

            {/* Speaker Grille */}
            <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 mt-4 flex items-center justify-center relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-radial from-slate-700 to-slate-900 opacity-60"></div>
              
              <Volume2 className={`w-12 h-12 text-sky-400 relative z-10 transition-transform ${
                chimePlaying || voicePlaying ? 'scale-125 animate-bounce text-amber-400' : 'opacity-70'
              }`} />

              {(chimePlaying || voicePlaying) && (
                <div className="absolute inset-0 rounded-full border-4 border-sky-400 animate-ping opacity-75"></div>
              )}
            </div>

            <p className="text-[10px] text-slate-500 font-semibold tracking-wider mt-3 uppercase">
              Sarvam Indic Voice ({currentLangObj.label})
            </p>
          </div>

          {/* Quick Amount Selector */}
          <div className="w-full mt-5">
            <span className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider block mb-1.5 text-center">
              Test Payment Value
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[20, 40, 150, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setDisplayText(`₹ ${amt}.00`);
                  }}
                  className={`h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                    selectedAmount === amt
                      ? 'bg-wine text-cream shadow-xs border border-gold/40'
                      : 'bg-sand hover:bg-sand/80 text-charcoal border border-gold/20'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-2.5 mt-3">
            <button
              onClick={() => playPaymentAnnouncement(selectedAmount)}
              disabled={chimePlaying || voicePlaying}
              className="h-11 px-3 rounded-xl bg-wine hover:bg-wine-dark text-cream text-xs font-semibold shadow-subtle
                         flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Volume2 className="w-4 h-4 text-gold shrink-0" />
              <span>Paytm Payment Sound</span>
            </button>

            <button
              onClick={playMorningBriefing}
              disabled={voicePlaying || chimePlaying}
              className="h-11 px-3 rounded-xl bg-gold hover:bg-gold-light text-charcoal text-xs font-semibold shadow-subtle
                         flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 shrink-0 text-charcoal" />
              <span>Daily AI Briefing</span>
            </button>
          </div>

          {/* Secondary Utility Controls */}
          <div className="w-full grid grid-cols-2 gap-2.5 mt-2">
            <button
              onClick={playChimeOnly}
              disabled={chimePlaying || voicePlaying}
              className="h-9 px-3 rounded-xl bg-sand/70 hover:bg-sand text-charcoal text-[11px] font-semibold
                         border border-gold/30 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Bell className="w-3.5 h-3.5 text-amber-700" />
              <span>Chime Only</span>
            </button>

            <button
              onClick={playBarcodeCheckoutDemo}
              disabled={chimePlaying || voicePlaying}
              className="h-9 px-3 rounded-xl bg-[#002E6E]/10 hover:bg-[#002E6E]/20 text-[#002E6E] text-[11px] font-semibold
                         border border-[#002E6E]/30 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Barcode className="w-3.5 h-3.5 text-[#002E6E]" />
              <span>POS Barcode Audio</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
