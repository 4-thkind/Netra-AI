import React, { useState } from 'react';
import { Volume2, Sparkles } from 'lucide-react';
import { translations } from '../i18n/translations';

export default function SoundboxPlayer({ lang = 'hi' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [spoken, setSpoken] = useState(false);

  const t = translations[lang]?.dashboard || translations.en.dashboard;
  const voiceMap = translations.en.voiceTranscript;
  const langCodeMap = translations.en.langCodeMap;

  const currentSpeechText = voiceMap[lang] || voiceMap.hi;
  const currentLangCode = langCodeMap[lang] || 'hi-IN';

  const handlePlayVoice = () => {
    setIsPlaying(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentSpeechText);
      utterance.lang = currentLangCode;
      utterance.rate = 0.95;
      utterance.onend = () => {
        setIsPlaying(false);
        setSpoken(true);
      };
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setIsPlaying(false);
        setSpoken(true);
      }, 3000);
    }
  };

  return (
    <div className="bg-sand rounded-xl p-4 border border-gold/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-start space-x-3">
        <div className="w-9 h-9 rounded-lg bg-wine text-gold flex items-center justify-center shrink-0 mt-0.5">
          <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse text-gold-light' : ''}`} />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-wine">{t.soundboxTitle}</span>
            <span className="text-[10px] bg-wine/10 text-wine font-semibold px-2 py-0.2 rounded">Sarvam Indic TTS</span>
          </div>
          <p className="text-sm font-medium text-charcoal mt-0.5 line-clamp-1">
            {t.soundboxSnippet}
          </p>
        </div>
      </div>

      <button
        onClick={handlePlayVoice}
        disabled={isPlaying}
        className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all shrink-0 ${
          isPlaying
            ? 'bg-wine-light text-cream animate-pulse'
            : 'bg-wine hover:bg-wine-dark text-cream shadow-sm hover:shadow'
        }`}
      >
        {isPlaying ? (
          <>
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>{t.playingBriefing}</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-gold" />
            <span>{spoken ? t.replayBriefing : t.playBriefing}</span>
          </>
        )}
      </button>
    </div>
  );
}
