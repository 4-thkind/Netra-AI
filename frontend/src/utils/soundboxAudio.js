/**
 * Paytm Soundbox Authentic Acoustic Engine
 * ----------------------------------------
 * 1. Multi-harmonic polyphonic chime synthesizer with physical speaker enclosure EQ.
 * 2. High-precision POS laser barcode scanner beep.
 * 3. Native Indic Speech dispatcher tuned to Paytm's iconic voice cadence.
 */

// Number-to-words for Hindi payments so TTS pronounces naturally
const HINDI_NUMBERS = {
  10: 'दस',
  20: 'बीस',
  30: 'तीस',
  40: 'चालीस',
  50: 'पचास',
  60: 'साठ',
  70: 'सत्तर',
  80: 'अस्सी',
  90: 'नब्बे',
  100: 'एक सौ',
  150: 'एक सौ पचास',
  200: 'दो सौ',
  500: 'पाँच सौ',
  1000: 'एक हज़ार'
};

class SoundboxAudioEngine {
  constructor() {
    this.audioCtx = null;
  }

  getAudioContext() {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Barcode scanner laser beep (e.g. Zebra / Honeywell scanner on Paytm Smart POS)
   * High frequency short chirp at 2850 Hz for 65ms
   */
  playScannerBeep() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2850, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.065);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.07);
    } catch (e) {
      console.warn('Scanner beep error:', e);
    }
  }

  /**
   * Signature Paytm Soundbox 2-Tone Melodic Chime
   * Tone 1: D5 (~587.33 Hz) at t = 0
   * Tone 2: A5 (~880.00 Hz) at t = 0.16s
   * Enhanced with metallic 2nd & 3rd harmonics + soundbox acoustic speaker curve.
   */
  playPaytmChime(onComplete = null) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) {
        if (onComplete) onComplete();
        return;
      }

      const now = ctx.currentTime;

      // Speaker cabinet filter: slight high-pass + mid-peak to emulate small 3W speaker
      const filter = ctx.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.setValueAtTime(2200, now);
      filter.Q.setValueAtTime(1.2, now);
      filter.gain.setValueAtTime(3.0, now);
      filter.connect(ctx.destination);

      const notes = [
        // Note 1: D5 (First strike)
        { freq: 587.33, startTime: now, duration: 0.22, volume: 0.32 },
        { freq: 1174.66, startTime: now, duration: 0.15, volume: 0.12 }, // 2nd harmonic
        { freq: 1762.00, startTime: now, duration: 0.08, volume: 0.06 }, // 3rd harmonic sparkle

        // Note 2: A5 (Ascending resolved strike)
        { freq: 880.00, startTime: now + 0.15, duration: 0.45, volume: 0.38 },
        { freq: 1760.00, startTime: now + 0.15, duration: 0.30, volume: 0.16 }, // 2nd harmonic
        { freq: 2640.00, startTime: now + 0.15, duration: 0.18, volume: 0.08 }  // 3rd harmonic
      ];

      notes.forEach(({ freq, startTime, duration, volume }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Triangle wave carries warm metallic body similar to physical Glockenspiel
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(filter);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });

      if (onComplete) {
        setTimeout(onComplete, 650);
      }
    } catch (e) {
      console.warn('Paytm chime synthesis error:', e);
      if (onComplete) onComplete();
    }
  }

  /**
   * Helper to pick the best regional Indic voice available in user's browser.
   */
  findBestVoice(langCode = 'hi-IN') {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const prefix = langCode.split('-')[0].toLowerCase();

    // Prefer Indian female voices for authentic soundbox delivery
    const preferred = voices.find(v => 
      v.lang.toLowerCase().startsWith(prefix) && 
      (v.name.toLowerCase().includes('female') || 
       v.name.toLowerCase().includes('lekha') || 
       v.name.toLowerCase().includes('swara') ||
       v.name.toLowerCase().includes('google'))
    );

    if (preferred) return preferred;

    // Fallback to any matching language code
    return voices.find(v => v.lang.toLowerCase().startsWith(prefix)) || null;
  }

  /**
   * Format payment announcement string across all 7 supported languages
   */
  getPaymentPhrase(amount, lang = 'hi') {
    const numWord = HINDI_NUMBERS[amount] || amount;

    const phrases = {
      hi: `पेटीएम पर ${numWord} रुपये प्राप्त हुए`,
      en: `${amount} rupees received on Paytm`,
      ta: `Paytm இல் ${amount} ரூபாய் பெறப்பட்டது`,
      te: `Paytm లో ${amount} రూపాయలు అందాయి`,
      kn: `Paytm ನಲ್ಲಿ ${amount} ರೂಪಾಯಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ`,
      mr: `Paytm वर ${amount} रुपये मिळाले`,
      bn: `Paytm এ ${amount} টাকা প্রাপ্ত হয়েছে`
    };

    return phrases[lang] || phrases.hi;
  }

  /**
   * Full Payment Event: Signature Chime followed by crisp Indic voiceover
   */
  playPaymentAnnouncement({
    amount = 40,
    lang = 'hi',
    onStart = null,
    onEnd = null
  }) {
    if (onStart) onStart();

    // Play chime first
    this.playPaytmChime(() => {
      if (!('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        return;
      }

      window.speechSynthesis.cancel();
      const text = this.getPaymentPhrase(amount, lang);
      const utterance = new SpeechSynthesisUtterance(text);

      const langMap = {
        hi: 'hi-IN',
        en: 'en-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        kn: 'kn-IN',
        mr: 'mr-IN',
        bn: 'bn-IN'
      };

      utterance.lang = langMap[lang] || 'hi-IN';
      utterance.rate = 0.96; // Slightly slower, clean cadence
      utterance.pitch = 1.08; // Crisp voiceover pitch

      const voice = this.findBestVoice(utterance.lang);
      if (voice) utterance.voice = voice;

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Morning Voice Briefing & Strategic Netrā Audio Signal
   * Chime + Indic LLM briefing
   */
  playVoiceBriefing({
    text,
    lang = 'hi',
    onStart = null,
    onEnd = null
  }) {
    if (onStart) onStart();

    this.playPaytmChime(() => {
      if (!('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      const langMap = {
        hi: 'hi-IN',
        en: 'en-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        kn: 'kn-IN',
        mr: 'mr-IN',
        bn: 'bn-IN'
      };

      utterance.lang = langMap[lang] || 'hi-IN';
      utterance.rate = 0.94;
      utterance.pitch = 1.05;

      const voice = this.findBestVoice(utterance.lang);
      if (voice) utterance.voice = voice;

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Real-time POS Barcode Scan Checkout audio:
   * Beep -> Chime -> Confirmation announcement
   */
  playPosBarcodeCheckout({
    skuName = 'Frooti 200ml',
    amount = 20,
    remainingStock = 3,
    lang = 'hi',
    onEnd = null
  }) {
    // 1. Play scanner laser beep
    this.playScannerBeep();

    // 2. Play chime after 120ms
    setTimeout(() => {
      this.playPaytmChime(() => {
        if (!('speechSynthesis' in window)) {
          if (onEnd) onEnd();
          return;
        }

        const cleanSku = skuName.split(' ')[0];
        const text = lang === 'en'
          ? `${amount} rupees received on Paytm. Remaining ${cleanSku} stock: ${remainingStock} units.`
          : `पेटीएम पर ${amount} रुपये प्राप्त हुए। ${cleanSku} का स्टॉक ${remainingStock} बचा है।`;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
        utterance.rate = 0.98;
        utterance.pitch = 1.06;

        const voice = this.findBestVoice(utterance.lang);
        if (voice) utterance.voice = voice;

        utterance.onend = () => {
          if (onEnd) onEnd();
        };
        utterance.onerror = () => {
          if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
      });
    }, 120);
  }
}

export const soundboxAudio = new SoundboxAudioEngine();
