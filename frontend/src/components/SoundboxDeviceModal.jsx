import React, { useState } from 'react';
import { X, Volume2, Wifi, BatteryCharging, Radio, Sparkles } from 'lucide-react';
import { translations, languages } from '../i18n/translations';
import { useDismissable } from '../hooks/useDismissable';

export default function SoundboxDeviceModal({ isOpen, onClose, lang = 'hi' }) {
  const [chimePlaying, setChimePlaying] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [displayText, setDisplayText] = useState("₹ 40.00");

  useDismissable(isOpen, onClose);


  if (!isOpen) return null;

  const currentLangObj = languages.find(l => l.code === lang) || languages[1];
  const voiceMap = translations.en.voiceTranscript;
  const langCodeMap = translations.en.langCodeMap;
  const speechText = voiceMap[lang] || voiceMap.hi;
  const langCode = langCodeMap[lang] || 'hi-IN';

  const paymentPhrases = {
    hi: "Paytm par chalis rupaye prapt hue",
    en: "Forty rupees received on Paytm",
    ta: "Paytm இல் நாற்பது ரூபாய் பெறப்பட்டது",
    te: "Paytm లో నలభై రూపాయలు అందాయి",
    kn: "Paytm ನಲ್ಲಿ ನಲವತ್ತು ರೂಪಾಯಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
    mr: "Paytm वर चाळीस रुपये मिळाले",
    bn: "Paytm এ চল্লিশ টাকা প্রাপ্ত হয়েছে"
  };

  const playPaymentChime = () => {
    setChimePlaying(true);
    setDisplayText("₹ 40.00");
    
    // Web Audio chime simulation
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}

    // Regional voice announcement
    if ('speechSynthesis' in window) {
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance(paymentPhrases[lang] || paymentPhrases.hi);
        u.lang = langCode;
        u.onend = () => setChimePlaying(false);
        window.speechSynthesis.speak(u);
      }, 500);
    } else {
      setTimeout(() => setChimePlaying(false), 2500);
    }
  };

  const playMorningBriefing = () => {
    setVoicePlaying(true);
    setDisplayText("SIGNAL");
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(speechText);
      u.lang = langCode;
      u.rate = 0.95;
      u.onend = () => {
        setVoicePlaying(false);
        setDisplayText("₹ 0.00");
      };
      window.speechSynthesis.speak(u);
    } else {
      setTimeout(() => {
        setVoicePlaying(false);
        setDisplayText("₹ 0.00");
      }, 3500);
    }
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

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={playPaymentChime}
              disabled={chimePlaying}
              className="h-11 px-4 rounded-xl bg-wine hover:bg-wine-dark text-cream text-sm font-semibold shadow-subtle flex items-center justify-center gap-2 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-gold" />
              <span>Chime ({currentLangObj.label})</span>
            </button>

            <button
              onClick={playMorningBriefing}
              disabled={voicePlaying}
              className="h-11 px-4 rounded-xl bg-gold hover:bg-gold-light text-charcoal text-sm font-semibold shadow-subtle flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Briefing ({currentLangObj.label})</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
