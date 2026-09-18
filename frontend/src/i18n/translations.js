export const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', flag: '🇮🇳' },
];

export const translations = {
  en: {
    nav: {
      copilot: "Merchant Copilot",
      n8n: "n8n Workflows",
      privacy: "Privacy Center",
      sentinel: "Audit Sentinel",
      simulator: "Attack Simulator",
      tagline: "Network Intelligence • Zero Competitor Exposure"
    },
    ticker: {
      liveStream: "Paytm Soundbox Live Stream:",
      sampleTxn: "UPI Tx #9102 • ₹40 (Beverage) • South Delhi Cluster • 4s ago",
      shieldStatus: "Privacy Threshold: 42 Stores (Shield Active)"
    },
    dashboard: {
      greeting: "Good morning, Ramesh.",
      storeSubtitle: "Ramesh Kirana Store • Lajpat Nagar Central Market • Delhi",
      todaySignalTag: "TODAY'S HIGHEST VALUE SIGNAL",
      heroHeadline: "Beverage demand is rising +18% in your broader local market.",
      heroBody: "South Delhi aggregates show strong afternoon momentum. Your beverage activity has not increased at the same pace. Review afternoon cold drink inventory before Friday.",
      viewInsightBtn: "View Full Insight Analysis",
      soundboxTitle: "Paytm Soundbox Daily Voice Signal",
      playBriefing: "Play Soundbox Briefing",
      replayBriefing: "Replay Voice Signal",
      playingBriefing: "Playing on Soundbox...",
      soundboxSnippet: '"Hello Ramesh. Cold beverage demand is surging +18% across South Delhi this afternoon..."',
      tradeRadarTitle: "Trade Radar",
      tradeRadarSub: "Hyperlocal Demand Velocity",
      pricePulseTitle: "Price Pulse",
      pricePulseSub: "Market Benchmark Context",
      cashflowTitle: "Cash Flow Prophet",
      cashflowSub: "7-Day Liquidity Forecast",
      festivalTitle: "Festival Engine",
      festivalSub: "Regional Festive Demand Ramp-up",
      growthMissionTitle: "Growth Mission",
      growthMissionSub: "Cohort-Driven Benchmark",
      memoryTitle: "Merchant Memory",
      memorySub: "Cognee Profile & Preferences"
    },
    privacyCenter: {
      badge: "NETRĀ PRIVACY ARCHITECTURE",
      title: "Privacy Center & Boundary Sentinel",
      subtitle: '"Network intelligence without merchant exposure." Enforced at the backend data boundary, not merely through wording.',
      smallCohortTitle: "Small-Cohort Suppression",
      smallCohortDesc: "Minimum cohort: 10 merchants. If density is insufficient, the system automatically expands radius (1km ➔ 3km ➔ 5km) or strictly suppresses the signal.",
      zeroPiiTitle: "Zero Competitor PII",
      zeroPiiDesc: "No code path outputs individual competitor prices, store identities, or exact addresses. Price Pulse provides category benchmarks only.",
      sentinelTitle: "Anti-Reconstruction Sentinel",
      sentinelDesc: "Remaining 24h Query Budget: 15 / 15 queries. Sliding window differencing attacks are actively intercepted.",
      usesTitle: "What Netrā Uses",
      usesList: [
        "Anonymized cluster-level category velocity across 40+ stores",
        "Merchant's own historical UPI transaction volumes and basket sizes",
        "Regional festive calendar patterns and seasonal trends",
        "Coarse micro-market clusters (e.g. South Delhi / Lajpat Nagar)"
      ],
      neverSharesTitle: "What Netrā NEVER Shares",
      neverSharesList: [
        "Another merchant's individual item price or promotional discount",
        "Another store's revenue, transaction count, or customer volume",
        "Competitor shop name, phone number, or exact GPS coordinates",
        "Raw customer phone numbers or customer UPI IDs"
      ]
    },
    securitySentinel: {
      badge: "ADMIN SECURITY DASHBOARD",
      title: "Audit Sentinel & Security Stream",
      subtitle: "Append-only tamper-evident audit logs capturing privacy suppressions, blocked competitor queries, and authentication events.",
      refreshBtn: "Refresh Stream",
      kpiSuppression: "Privacy Suppressions",
      kpiSuppressionSub: "All sub-threshold cohorts shielded",
      kpiBudget: "24h Query Budget",
      kpiBudgetSub: "Anti-reconstruction budget",
      kpiBlocked: "Blocked Attacks",
      kpiBlockedSub: "Zero data leakage incidents",
      kpiHealth: "Boundary Health",
      kpiHealthSub: "Tamper-evident logs active",
      streamTitle: "Live Security Audit Stream",
      streamSub: "Events logged by Privacy Transformation Gateway and Sentinel",
      emptyState: "No audit events recorded yet."
    },
    attackSimulator: {
      badge: "HACKATHON JUDGES INTERACTIVE VERIFICATION SUITE",
      title: "Live Attack Simulator for Judges",
      subtitle: "Test adversarial prompts, snooping queries, and reconstruction attacks against Netrā's privacy sentinel.",
      selectAttackTitle: "Select Attack Vector",
      runBtn: "Run Adversarial Simulation",
      runningBtn: "Simulating Attack...",
      reportTitle: "Sentinel Defense Interception Report",
      blockedBadge: "BLOCKED BY SENTINEL",
      allowedBadge: "SAFE / ALLOWED",
      statusTitle: "HTTP & Gate Status",
      defenseTitle: "Defense Triggered",
      verdictTitle: "Privacy Verdict",
      technicalDetails: "Technical Audit Details",
      attacks: {
        small_cohort: {
          title: "1. The 4-Merchant Dilemma",
          desc: "Query market data in an isolated 1km cluster with only 4 stores. Verifies that Netra triggers suppression instead of exposing individual stores."
        },
        competitor_price: {
          title: "2. Competitor Price Snooping",
          desc: 'Simulates asking: "What is Gupta General Store charging for Maggi noodles nearby?" Verifies immediate competition safety gate rejection.'
        },
        reconstruction_diff: {
          title: "3. Differencing Reconstruction Attack",
          desc: "Adversary queries 1.0 km radius followed by 1.12 km radius to subtract the aggregate and isolate the single store between them. Verifies anti-reconstruction guard interception."
        },
        prompt_injection: {
          title: "4. Price-Fixing Prompt Injection",
          desc: "Adversary prompts LLM to orchestrate collective price coordination across all neighboring kiranas. Verifies AST & regex competition gate rejection."
        }
      }
    },
    insightModal: {
      badge: "Netrā Growth Copilot",
      whatTitle: "1. What is happening?",
      whyTitle: "2. Why is this occurring?",
      soWhatTitle: "3. So what does it mean for your business?",
      actionTitle: "4. Recommended Action",
      safeGuidance: "Safe Guidance",
      privacyShield: "Network aggregated over 40+ South Delhi stores. Competitor pricing strictly shielded.",
      dismissBtn: "Dismiss for Now",
      actionBtn: "Authorize & Take Action",
      defaultInsight: {
        title: "Rising Beverage Demand Momentum",
        what: "Cold beverage demand is surging +18% across the South Delhi cluster this week.",
        why: "Warm afternoon temperatures and peak commercial footfall driving quick cold beverage purchases.",
        so_what: "Your store is currently under-indexing in beverages; merchants offering combos saw an 18% lift in afternoon footfall.",
        expected_action: "Place an order for 2 crates of cold sodas & juices, and create a ₹55 Afternoon Refresh Combo at checkout."
      },
    },
    whatsAppModal: {
      title: "WhatsApp Kirana Copilot Simulator",
      subtitle: "Simulating live automated WhatsApp alerts sent to Ramesh Kumar via n8n",
      distributorPO: "Generate 1-Tap Distributor PO",
      poSuccess: "Purchase Order sent to Sharmaji Wholesalers via WhatsApp!"
    },
    clusterMapModal: {
      title: "Hyperlocal Cluster Privacy Visualizer",
      subtitle: "Demonstrating dynamic radius expansion (1km ➔ 3km ➔ 5km) and small-cohort suppression",
      sliderLabel: "Simulated Merchant Density (N)",
      shieldActive: "Shield Active: Cohort Protected",
      shieldSuppressed: "Signal Suppressed: Insufficient Density (N < 10)"
    },
    voiceTranscript: {
      en: "Hello Ramesh. Cold beverage demand is surging +18% across South Delhi this afternoon. Please review your stock.",
      hi: "नमस्ते रमेश जी। दोपहर के लिए ठंडे पेय पदार्थों की मांग आपके क्षेत्र में 18% बढ़ रही है। स्टॉक की जांच करें।",
      ta: "வணக்கம் ரமேஷ். உங்கள் பகுதியில் மதிய நேரத்தில் குளிர்பானங்களுக்கான தேவை 18% அதிகரித்து வருகிறது. இருப்பை சரிபார்க்கவும்.",
      te: "నమస్కారం రమేష్ గారు. మీ ప్రాంతంలో మధ్యాహ్నం శీతల పానీయాల డిమాండ్ 18% పెరుగుతోంది. స్టాక్‌ను తనిఖీ చేయండి.",
      kn: "ನಮಸ್ಕಾರ ರಮೇಶ್. ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಮಧ್ಯಾಹ್ನ ತಂಪು ಪಾನೀಯಗಳ ಬೇಡಿಕೆ 18% ಹೆಚ್ಚುತ್ತಿದೆ. ದಾಸ್ತಾನು ಪರಿಶೀಲಿಸಿ.",
      mr: "नमस्कार रमेश जी. आपल्या भागात दुपारच्या वेळी थंड पेयांची मागणी १८% वाढत आहे. साठा तपासा.",
      bn: "নমস্কার রমেশ বাবু। আপনার এলাকায় দুপুরে ঠান্ডা পানীয়ের চাহিদা ১৮% বাড়ছে। স্টক পরীক্ষা করুন।"
    },
    langCodeMap: {
      en: "en-IN",
      hi: "hi-IN",
      ta: "ta-IN",
      te: "te-IN",
      kn: "kn-IN",
      mr: "mr-IN",
      bn: "bn-IN"
    }
  },

  hi: {
    nav: {
      copilot: "व्यापारी कोपायलट",
      n8n: "n8n वर्कफ़्लो",
      privacy: "गोपनीयता केंद्र",
      sentinel: "सुरक्षा ऑडिट",
      simulator: "अटैक सिम्युलेटर",
      tagline: "नेटवर्क इंटेलिजेंस • शून्य प्रतिस्पर्धी प्रकटीकरण"
    },
    ticker: {
      liveStream: "पेटीएम साउंडबॉक्स लाइव स्ट्रीम:",
      sampleTxn: "UPI लेन-देन #9102 • ₹40 (पेय पदार्थ) • दक्षिण दिल्ली क्लस्टर • 4 सेकंड पहले",
      shieldStatus: "गोपनीयता सीमा: 42 दुकानें (सुरक्षा शील्ड सक्रिय)"
    },
    dashboard: {
      greeting: "नमस्ते, रमेश जी।",
      storeSubtitle: "रमेश किराना स्टोर • लाजपत नगर सेंट्रल मार्केट • दिल्ली",
      todaySignalTag: "आज का सर्वोच्च व्यापार संकेत",
      heroHeadline: "आपके स्थानीय बाजार में ठंडे पेय पदार्थों की मांग +18% बढ़ रही है।",
      heroBody: "दक्षिण दिल्ली क्लस्टर में दोपहर के समय पेय पदार्थों की मांग में भारी उछाल है। शुक्रवार से पहले कोल्ड ड्रिंक्स और जूस का स्टॉक अवश्य जांचें।",
      viewInsightBtn: "पूर्ण विश्लेषण और कार्यवाही देखें",
      soundboxTitle: "पेटीएम साउंडबॉक्स दैनिक ध्वनि संदेश",
      playBriefing: "साउंडबॉक्स ब्रीफिंग सुनें",
      replayBriefing: "संदेश पुनः सुनें",
      playingBriefing: "साउंडबॉक्स पर चल रहा है...",
      soundboxSnippet: '"नमस्ते रमेश जी। दोपहर के लिए ठंडे पेय पदार्थों की मांग 18% बढ़ रही है..."',
      tradeRadarTitle: "व्यापार रडार",
      tradeRadarSub: "अति-स्थानीय मांग गति",
      pricePulseTitle: "मूल्य पल्स",
      pricePulseSub: "बाजार श्रेणी बेंचमार्क",
      cashflowTitle: "रोकड़ प्रवाह पैगंबर",
      cashflowSub: "7-दिवसीय तरलता पूर्वानुमान",
      festivalTitle: "पर्व इंजन",
      festivalSub: "क्षेत्रीय त्योहारी मांग तैयारी",
      growthMissionTitle: "विकास मिशन",
      growthMissionSub: "समान किराना बेंचमार्क",
      memoryTitle: "व्यापारी स्मृति",
      memorySub: "कॉग्नी प्रोफाइल और प्राथमिकताएं"
    },
    privacyCenter: {
      badge: "नेत्र गोपनीयता वास्तुकला",
      title: "गोपनीयता केंद्र और सीमा प्रहरी",
      subtitle: '"व्यापारी की जानकारी उजागर किए बिना नेटवर्क बुद्धिमत्ता।" डेटा सीमा पर लागू, केवल शब्दों में नहीं।',
      smallCohortTitle: "लघु-समूह दमन (Small-Cohort Suppression)",
      smallCohortDesc: "न्यूनतम समूह: 10 व्यापारी। यदि घनत्व अपर्याप्त है, तो सिस्टम स्वचालित रूप से दायरे का विस्तार करता है (1 किमी ➔ 3 किमी ➔ 5 किमी) अथवा जानकारी को पूरी तरह दबा देता है।",
      zeroPiiTitle: "शून्य प्रतिस्पर्धी व्यक्तिगत डेटा",
      zeroPiiDesc: "कोई भी कोड पथ प्रतिस्पर्धी की व्यक्तिगत कीमतों, दुकान के नाम या सटीक पते को प्रकट नहीं करता। प्राइस पल्स केवल श्रेणी बेंचमार्क प्रदान करता है।",
      sentinelTitle: "पुनर्निर्माण-रोधी प्रहरी (Anti-Reconstruction)",
      sentinelDesc: "शेष 24 घंटे का क्वेरी बजट: 15 / 15 अनुरोध। स्लाइडिंग विंडो घटाव हमलों को सक्रिय रूप से अवरुद्ध किया जाता है।",
      usesTitle: "नेत्र क्या उपयोग करता है",
      usesList: [
        "40+ दुकानों में क्लस्टर-स्तर पर श्रेणी मांग की गति",
        "व्यापारी का स्वयं का ऐतिहासिक यूपीआई लेन-देन और औसत बिल आकार",
        "क्षेत्रीय त्योहारी कैलेंडर पैटर्न और मौसमी रुझान",
        "व्यापक स्थानीय क्षेत्र (जैसे दक्षिण दिल्ली / लाजपत नगर)"
      ],
      neverSharesTitle: "नेत्र कभी क्या साझा नहीं करता",
      neverSharesList: [
        "किसी अन्य व्यापारी की व्यक्तिगत उत्पाद कीमत या छूट",
        "किसी अन्य दुकान का राजस्व, लेन-देन संख्या या ग्राहक संख्या",
        "प्रतिस्पर्धी दुकान का नाम, फोन नंबर या सटीक जीपीएस स्थान",
        "ग्राहकों के फोन नंबर या यूपीआई आईडी"
      ]
    },
    securitySentinel: {
      badge: "प्रशासक सुरक्षा डैशबोर्ड",
      title: "सुरक्षा ऑडिट और घटना लॉग",
      subtitle: "गोपनीयता दमन, रोके गए प्रतिस्पर्धी प्रश्नों और प्रमाणीकरण घटनाओं का अपरिवर्तनीय ऑडिट लॉग।",
      refreshBtn: "रिफ्रेश करें",
      kpiSuppression: "गोपनीयता दमन",
      kpiSuppressionSub: "सभी छोटे समूह सुरक्षित",
      kpiBudget: "24 घंटे क्वेरी बजट",
      kpiBudgetSub: "पुनर्निर्माण-रोधी सीमा",
      kpiBlocked: "रोके गए हमले",
      kpiBlockedSub: "शून्य डेटा रिसाव घटनाएं",
      kpiHealth: "प्रहरी स्वास्थ्य",
      kpiHealthSub: "सुरक्षित ऑडिट सक्रिय",
      streamTitle: "लाइव सुरक्षा ऑडिट स्ट्रीम",
      streamSub: "गोपनीयता गेटवे और प्रहरी द्वारा दर्ज घटनाएं",
      emptyState: "अभी तक कोई सुरक्षा घटना दर्ज नहीं है।"
    },
    attackSimulator: {
      badge: "हैकथॉन जजों के लिए लाइव सत्यापन सूट",
      title: "लाइव सुरक्षा हमला सिम्युलेटर",
      subtitle: "नेत्र के गोपनीयता प्रहरी के खिलाफ प्रतिस्पर्धी जासूसी और डेटा पुनर्निर्माण हमलों का परीक्षण करें।",
      selectAttackTitle: "हमला प्रकार चुनें",
      runBtn: "हमला सिमुलेशन चलाएं",
      runningBtn: "सिमुलेशन जारी है...",
      reportTitle: "प्रहरी रक्षा रिपोर्ट",
      blockedBadge: "प्रहरी द्वारा अवरुद्ध",
      allowedBadge: "सुरक्षित / स्वीकृत",
      statusTitle: "एचटीटीपी और गेट स्थिति",
      defenseTitle: "सक्रिय सुरक्षा उपाय",
      verdictTitle: "गोपनीयता निर्णय",
      technicalDetails: "तकनीकी ऑडिट विवरण",
      attacks: {
        small_cohort: {
          title: "1. 4-व्यापारियों की दुविधा (The 4-Merchant Dilemma)",
          desc: "केवल 4 दुकानों वाले अलग 1 किमी क्लस्टर में बाजार डेटा का अनुरोध करें। पुष्टि करता है कि नेत्र व्यक्तिगत दुकानों को उजागर करने के बजाय डेटा को दबा देता है।"
        },
        competitor_price: {
          title: "2. प्रतिस्पर्धी मूल्य जासूसी",
          desc: 'यह पूछने का अनुकरण करता है: "पास में गुप्ता जनरल स्टोर मैगी के लिए क्या मूल्य ले रहा है?" सुरक्षा गेट द्वारा तत्काल अस्वीकृति की पुष्टि करता है।'
        },
        reconstruction_diff: {
          title: "3. अंतर पुनर्निर्माण हमला (Differencing Attack)",
          desc: "हमलावर 1.0 किमी और फिर 1.12 किमी के दायरे की क्वेरी करके बीच की एकल दुकान के डेटा को घटाकर निकालने का प्रयास करता है। पुनर्निर्माण प्रहरी द्वारा इसे तुरंत रोका जाता है।"
        },
        prompt_injection: {
          title: "4. मूल्य-निर्धारण प्रॉम्प्ट इंजेक्शन",
          desc: "हमलावर एलएलएम से पड़ोसी किराना दुकानों के बीच सामूहिक मूल्य मिलीभगत करवाने का प्रयास करता है। कोड सुरक्षा गेट द्वारा इसे तुरंत अस्वीकार किया जाता है।"
        }
      }
    },
    insightModal: {
      badge: "नेत्र व्यापार विकास कोपायलट",
      whatTitle: "1. बाजार में क्या हो रहा है?",
      whyTitle: "2. यह बदलाव क्यों हो रहा है?",
      soWhatTitle: "3. आपके व्यवसाय और मुनाफे पर क्या प्रभाव पड़ेगा?",
      actionTitle: "4. अनुशंसित व्यापारिक कदम",
      safeGuidance: "सुरक्षित मार्गदर्शन",
      privacyShield: "दक्षिण दिल्ली की 40+ दुकानों का सामूहिक डेटा। व्यक्तिगत प्रतिस्पर्धी मूल्य पूर्णतः सुरक्षित।",
      dismissBtn: "बाद में देखें",
      actionBtn: "स्वीकार करें और कदम उठाएं",
      defaultInsight: {
        title: "ठंडे पेय पदार्थों की बढ़ती मांग का लाभ उठाएं",
        what: "इस सप्ताह दक्षिण दिल्ली क्लस्टर में ठंडे पेय पदार्थों की मांग में +18% की भारी वृद्धि देखी जा रही है।",
        why: "दोपहर के समय बढ़ती गर्मी और स्थानीय बाजार में ग्राहकों की आवाजाही के कारण ठंडे पेय पदार्थों की खरीदारी बढ़ी है।",
        so_what: "आपकी दुकान में इस श्रेणी की बिक्री स्थानीय औसत से कम है; कॉम्बो ऑफर देने वाले व्यापारियों की बिक्री में 18% की वृद्धि हुई है।",
        expected_action: "शीघ्र ही 2 क्रेट ठंडी कोल्ड ड्रिंक्स और जूस का ऑर्डर दें, तथा काउंटर पर ₹55 का 'दोपहर ताज़गी कॉम्बो' प्रदर्शित करें।"
      },
    },
    whatsAppModal: {
      title: "व्हाट्सएप किराना कोपायलट सिम्युलेटर",
      subtitle: "n8n के माध्यम से रमेश कुमार को भेजे जाने वाले स्वचालित संदेशों का लाइव सिमुलेशन",
      distributorPO: "1-टैप में थोक विक्रेता ऑर्डर बनाएं",
      poSuccess: "शर्माजी होलसेलर्स को व्हाट्सएप पर खरीद आदेश (PO) भेजा गया!"
    },
    clusterMapModal: {
      title: "अति-स्थानीय क्लस्टर गोपनीयता दृश्य",
      subtitle: "दायरे का गतिशील विस्तार (1 किमी ➔ 3 किमी ➔ 5 किमी) और छोटे समूहों के दमन का प्रदर्शन",
      sliderLabel: "सिम्युलेटेड व्यापारी घनत्व (N)",
      shieldActive: "सुरक्षा सक्रिय: समूह सुरक्षित",
      shieldSuppressed: "डेटा दबाया गया: अपर्याप्त घनत्व (N < 10)"
    }
  },

  ta: {
    nav: {
      copilot: "வணிகர் வழிகாட்டி",
      n8n: "n8n பணிப்பாய்வு",
      privacy: "தனியுரிமை மையம்",
      sentinel: "பாதுகாப்பு தணிக்கை",
      simulator: "தாக்குதல் சோதனையாளர்",
      tagline: "நெட்வொர்க் நுண்ணறிவு • பூஜ்ஜிய போட்டி வெளிப்பாடு"
    },
    ticker: {
      liveStream: "Paytm சவுண்ட்பாக்ஸ் நேரலை:",
      sampleTxn: "UPI பரிவர்த்தனை #9102 • ₹40 (குளிர்பானம்) • தெற்கு டெல்லி • 4 வினாடிகள் முன்",
      shieldStatus: "தனியுரிமை வரம்பு: 42 கடைகள் (பாதுகாப்பு கவசம் செயலில் உள்ளது)"
    },
    dashboard: {
      greeting: "வணக்கம், ரமேஷ்.",
      storeSubtitle: "ரமேஷ் மளிகைக் கடை • லாஜ்பத் நகர் • டெல்லி",
      todaySignalTag: "இன்றைய மிக முக்கியமான வாய்ப்பு",
      heroHeadline: "உங்கள் பகுதியில் குளிர்பானங்களுக்கான தேவை +18% உயர்ந்துள்ளது.",
      heroBody: "தெற்கு டெல்லி பகுதியில் மதிய நேர குளிர்பான விற்பனை வேகமாக அதிகரித்து வருகிறது. வெள்ளிக்கிழமைக்கு முன் இருப்பை சரிபார்க்கவும்.",
      viewInsightBtn: "முழு பகுப்பாய்வைக் காண்க",
      soundboxTitle: "Paytm சவுண்ட்பாக்ஸ் தினசரி குரல் தகவல்",
      playBriefing: "குரல் அறிவிப்பைக் கேளுங்கள்",
      replayBriefing: "மீண்டும் கேளுங்கள்",
      playingBriefing: "சவுண்ட்பாக்ஸில் ஒலிக்கிறது...",
      soundboxSnippet: '"வணக்கம் ரமேஷ். மதிய நேரத்தில் குளிர்பான தேவை 18% உயர்ந்துள்ளது..."',
      tradeRadarTitle: "வர்த்தக ரேடார்",
      tradeRadarSub: "உள்ளூர் தேவை வேகம்",
      pricePulseTitle: "விலை பல்ஸ்",
      pricePulseSub: "சந்தை அளவுகோல் சூழல்",
      cashflowTitle: "பணப்புழக்க கணிப்பு",
      cashflowSub: "7-நாள் பணப்புழக்க முன்னறிவிப்பு",
      festivalTitle: "பண்டிகை இயந்திரம்",
      festivalSub: "பண்டிகைக் கால விற்பனைத் திட்டம்",
      growthMissionTitle: "வளர்ச்சி இலக்கு",
      growthMissionSub: "சக வணிகர் ஒப்பீடு",
      memoryTitle: "வணிகர் நினைவகம்",
      memorySub: "முந்தைய வெற்றிகரமான முடிவுகள்"
    },
    privacyCenter: {
      badge: "நேத்ரா தனியுரிமை கட்டமைப்பு",
      title: "தனியுரிமை மையம் & எல்லைக் காவலர்",
      subtitle: '"வணிகர் விவரங்களை வெளிப்படுத்தாமல் நெட்வொர்க் நுண்ணறிவு." தரவு எல்லையில் செயல்படுத்தப்படுகிறது.',
      smallCohortTitle: "சிறிய குழு தணிப்பு (Small-Cohort Suppression)",
      smallCohortDesc: "குறைந்தபட்ச வரம்பு: 10 வணிகர்கள். அடர்த்தி போதவில்லை என்றால் கணினி தானாகவே சுற்றளவை விரிவுபடுத்தும் அல்லது தகவலை முடக்கும்.",
      zeroPiiTitle: "போட்டித் தகவல்கள் முற்றிலும் இல்லை",
      zeroPiiDesc: "எந்த நிலையிலும் பிற வணிகர்களின் தனிப்பட்ட விலைகள், பெயர்கள் அல்லது முகவரிகள் பகிரப்படாது.",
      sentinelTitle: "மறுசீரமைப்பு தடுப்புக் காவலர்",
      sentinelDesc: "24 மணி நேர வினவல் வரம்பு: 15 / 15. தொடர் வினவல்கள் மூலம் தரவைத் திருட முயற்சிப்பது தடுக்கப்படுகிறது.",
      usesTitle: "நேத்ரா பயன்படுத்துவது எவை",
      usesList: [
        "40+ கடைகளின் ஒருங்கிணைந்த பிரிவு தேவை வேகம்",
        "வணிகரின் முந்தைய பரிவர்த்தனை அளவுகள்",
        "பிராந்திய பண்டிகை நாட்காட்டி போக்குகள்",
        "பரந்த பகுதி அளவிலான தொகுப்புகள் (எ.கா. தெற்கு டெல்லி)"
      ],
      neverSharesTitle: "நேத்ரா ஒருபோதும் பகிராதவை",
      neverSharesList: [
        "மற்றொரு வணிகரின் தனிப்பட்ட தயாரிப்பு விலை அல்லது தள்ளுபடி",
        "மற்றொரு கடையின் வருவாய் அல்லது வாடிக்கையாளர் எண்ணிக்கை",
        "போட்டியாளர் கடையின் பெயர் அல்லது ஜிபிஎஸ் இருப்பிடம்",
        "வாடிக்கையாளர்களின் தொலைபேசி எண் அல்லது UPI ஐடி"
      ]
    },
    securitySentinel: {
      badge: "பாதுகாப்பு கட்டுப்பாட்டு பலகை",
      title: "பாதுகாப்பு தணிக்கை & நிகழ்வு பதிவுகள்",
      subtitle: "தனியுரிமை முடக்கங்கள் மற்றும் தடுக்கப்பட்ட வினவல்களின் மாற்ற முடியாத தணிக்கை பதிவுகள்.",
      refreshBtn: "புதுப்பிக்கவும்",
      kpiSuppression: "தனியுரிமை பாதுகாப்புகள்",
      kpiSuppressionSub: "அனைத்து சிறிய குழுக்களும் பாதுகாக்கப்பட்டன",
      kpiBudget: "24 மணி நேர வினவல் இருப்பு",
      kpiBudgetSub: "மறுசீரமைப்பு எதிர்ப்பு வரம்பு",
      kpiBlocked: "தடுக்கப்பட்ட தாக்குதல்கள்",
      kpiBlockedSub: "பூஜ்ஜிய தரவு கசிவு",
      kpiHealth: "காவலர் நிலை",
      kpiHealthSub: "தணிக்கை பதிவு செயலில் உள்ளது",
      streamTitle: "நேரலை பாதுகாப்பு தணிக்கை ஓட்டம்",
      streamSub: "தனியுரிமை நுழைவாயில் பதிவு செய்த நிகழ்வுகள்",
      emptyState: "இதுவரை எந்த பாதுகாப்பு நிகழ்வுகளும் இல்லை."
    },
    attackSimulator: {
      badge: "நடுவர்களுக்கான ஊடாடும் சரிபார்ப்பு தளம்",
      title: "நேரடி தாக்குதல் சோதனையாளர்",
      subtitle: "நேத்ராவின் தனியுரிமை காவலருக்கு எதிராக போட்டி உளவு மற்றும் தரவு மறுகட்டமைப்பு முயற்சிகளை சோதிக்கவும்.",
      selectAttackTitle: "தாக்குதல் வகையைத் தேர்ந்தெடுக்கவும்",
      runBtn: "சோதனையை இயக்கவும்",
      runningBtn: "சோதனை நடக்கிறது...",
      reportTitle: "காவலர் பாதுகாப்பு அறிக்கை",
      blockedBadge: "காவலரால் தடுக்கப்பட்டது",
      allowedBadge: "பாதுகாப்பானது / அனுமதிக்கப்பட்டது",
      statusTitle: "HTTP நிலை",
      defenseTitle: "செயல்படுத்தப்பட்ட பாதுகாப்பு",
      verdictTitle: "தனியுரிமை தீர்ப்பு",
      technicalDetails: "தொழில்நுட்ப தணிக்கை விவரங்கள்",
      attacks: {
        small_cohort: {
          title: "1. 4 வணிகர்கள் சிக்கல்",
          desc: "4 கடைகள் மட்டுமே உள்ள தனிமைப்படுத்தப்பட்ட 1 கி.மீ பகுதியில் தரவை வினவுகிறது. கடைகளை வெளிப்படுத்தாமல் கணினி தகவலை முடக்குகிறது."
        },
        competitor_price: {
          title: "2. போட்டியாளர் விலை உளவு",
          desc: '"அருகிலுள்ள குப்தா ஸ்டோரில் மேகி விலை என்ன?" என்ற கேள்வியை சோதிக்கிறது. உடனடியாக நிராகரிக்கப்படுகிறது.'
        },
        reconstruction_diff: {
          title: "3. வேறுபாடு மறுகட்டமைப்பு தாக்குதல்",
          desc: "1.0 கி.மீ மற்றும் 1.12 கி.மீ வினவல்களைக் கழிப்பதன் மூலம் இடையில் உள்ள ஒரு கடையை தனிமைப்படுத்த முயல்வது தடுக்கப்படுகிறது."
        },
        prompt_injection: {
          title: "4. விலை நிர்ணய முறைகேடு முயற்சி",
          desc: "அருகிலுள்ள அனைத்து கடைகளிலும் ஒரே விலையை நிர்ணயிக்க முயற்சிப்பது உடனடியாக நிராகரிக்கப்படுகிறது."
        }
      }
    },
    insightModal: {
      badge: "நேத்ரா வணிக வளர்ச்சி கோபைலட்",
      whatTitle: "1. என்ன நடக்கிறது?",
      whyTitle: "2. இது ஏன் நிகழ்கிறது?",
      soWhatTitle: "3. உங்கள் வணிகத்திற்கு இதன் பொருள் என்ன?",
      actionTitle: "4. பரிந்துரைக்கப்பட்ட நடவடிக்கை",
      safeGuidance: "பாதுகாப்பான வழிகாட்டல்",
      privacyShield: "40+ கடைகளின் கூட்டுத் தகவல். போட்டியாளர் விலைகள் முற்றிலும் பாதுகாக்கப்பட்டுள்ளன.",
      dismissBtn: "இப்போதைக்கு வேண்டாம்",
      actionBtn: "அங்கீகரித்து நடவடிக்கை எடுக்கவும்",
      defaultInsight: {
        title: "குளிர்பான தேவையின் வேகத்தை பயன்படுத்திக் கொள்ளுங்கள்",
        what: "இந்த வாரம் உங்கள் பகுதியில் குளிர்பானங்களுக்கான தேவை +18% அதிகரித்துள்ளது.",
        why: "மதிய நேர வெயில் மற்றும் வாடிக்கையாளர் வருகை காரணமாக குளிர்பான விற்பனை உயர்ந்துள்ளது.",
        so_what: "உங்கள் கடையில் இந்த விற்பனை சராசரியை விட குறைவாக உள்ளது; காம்போ சலுகைகள் வழங்கிய கடைகளில் 18% கூடுதல் வருவாய் கிடைத்துள்ளது.",
        expected_action: "உடனடியாக 2 பெட்டிகள் குளிர்பானங்களை ஆர்டர் செய்து, பில் கவுண்டரில் ₹55 காம்போ பேக்கை காட்சிப்படுத்துங்கள்."
      },
    },
    whatsAppModal: {
      title: "வாட்ஸ்அப் வணிகர் உதவியாளர் சிமுலேட்டர்",
      subtitle: "n8n வழியே ரமேஷிற்கு அனுப்பப்படும் தானியங்கி அறிவிப்புகள்",
      distributorPO: "ஒரே தட்டலில் மொத்த விற்பனை ஆர்டர் உருவாக்கவும்",
      poSuccess: "சர்மாஜி மொத்த விற்பனையாளருக்கு வாட்ஸ்அப் வழியாக ஆர்டர் அனுப்பப்பட்டது!"
    },
    clusterMapModal: {
      title: "உள்ளூர் பகுதி தனியுரிமை வரைபடம்",
      subtitle: "குழு அடர்த்திக்கு ஏற்ப சுற்றளவு தானாக விரிவடைதல் (1கிமீ ➔ 3கிமீ ➔ 5கிமீ)",
      sliderLabel: "மாதிரி வணிகர் அடர்த்தி (N)",
      shieldActive: "பாதுகாப்பு செயலில்: குழு பாதுகாக்கப்பட்டது",
      shieldSuppressed: "தகவல் முடக்கப்பட்டது: போதிய அடர்த்தி இல்லை (N < 10)"
    }
  },

  te: {
    nav: {
      copilot: "వ్యాపారి కోపైలట్",
      n8n: "n8n వర్క్‌ఫ్లో",
      privacy: "గోప్యతా కేంద్రం",
      sentinel: "సెక్యూరిటీ ఆడిట్",
      simulator: "దాడి సిమ్యులేటర్",
      tagline: "నెట్‌వర్క్ ఇంటెలిజెన్స్ • సున్నా పోటీదారు బహిర్గతం"
    },
    ticker: {
      liveStream: "Paytm సౌండ్‌బాక్స్ లైవ్ స్ట్రీమ్:",
      sampleTxn: "UPI లావాదేవీ #9102 • ₹40 (శీతల పానీయం) • దక్షిణ ఢిల్లీ • 4 సెకన్ల క్రితం",
      shieldStatus: "గోప్యతా పరిమితి: 42 దుకాణాలు (రక్షణ కవచం యాక్టివ్‌గా ఉంది)"
    },
    dashboard: {
      greeting: "నమస్కారం, రమేష్ గారు.",
      storeSubtitle: "రమేష్ కిరాణా స్టోర్ • లజపత్ నగర్ సెంట్రల్ మార్కెట్ • ఢిల్లీ",
      todaySignalTag: "నేటి అత్యంత విలువైన వ్యాపార సంకేతం",
      heroHeadline: "మీ స్థానిక మార్కెట్లో శీతల పానీయాల డిమాండ్ +18% పెరుగుతోంది.",
      heroBody: "దక్షిణ ఢిల్లీ క్లస్టర్‌లో మధ్యాహ్న సమయాల్లో పానీయాల అమ్మకాలు వేగంగా పెరుగుతున్నాయి. శుక్రవారానికి ముందే శీతల పానీయాల స్టాక్‌ను తనిఖీ చేయండి.",
      viewInsightBtn: "పూర్తి విశ్లేషణను చూడండి",
      soundboxTitle: "Paytm సౌండ్‌బాక్స్ రోజువారీ వాయిస్ సంకేతం",
      playBriefing: "సౌండ్‌బాక్స్ బ్రీఫింగ్ వినండి",
      replayBriefing: "తిరిగి వినండి",
      playingBriefing: "సౌండ్‌బాక్స్‌లో ప్లే అవుతోంది...",
      soundboxSnippet: '"నమస్కారం రమేష్ గారు. మధ్యాహ్నం శీతల పానీయాల డిమాండ్ 18% పెరుగుతోంది..."',
      tradeRadarTitle: "ట్రేడ్ రాడార్",
      tradeRadarSub: "హైపర్‌లోకల్ డిమాండ్ వేగం",
      pricePulseTitle: "ప్రైస్ పల్స్",
      pricePulseSub: "మార్కెట్ కేటగిరీ బెంచ్‌మార్క్",
      cashflowTitle: "క్యాష్ ఫ్లో ప్రవక్త",
      cashflowSub: "7-రోజుల ద్రవ్యత అంచనా",
      festivalTitle: "పండుగ ఇంజిన్",
      festivalSub: "పండుగ అమ్మకాల సన్నాహాలు",
      growthMissionTitle: "గ్రోత్ మిషన్",
      growthMissionSub: "తోటి వ్యాపారుల పోలిక",
      memoryTitle: "వ్యాపారి జ్ఞాపకశక్తి",
      memorySub: "కాగ్నీ ప్రొఫైల్ & ప్రాధాన్యతలు"
    },
    privacyCenter: {
      badge: "నేత్ర ప్రైవసీ ఆర్కిటెక్చర్",
      title: "గోప్యతా కేంద్రం & సరిహద్దు కాపలాదారు",
      subtitle: '"వ్యాపారి వివరాలను బహిర్గతం చేయకుండా నెట్‌వర్క్ ఇంటెలిజెన్స్." డేటా సరిహద్దు వద్ద కఠినంగా అమలు చేయబడుతుంది.',
      smallCohortTitle: "చిన్న-సమూహ సమాచార నిరోధం (Small-Cohort Suppression)",
      smallCohortDesc: "కనిష్ట పరిమితి: 10 మంది వ్యాపారులు. సాంద్రత సరిపోకపోతే సిస్టమ్ స్వయంచాలకంగా పరిధిని విస్తరిస్తుంది లేదా సమాచారాన్ని నిరోధిస్తుంది.",
      zeroPiiTitle: "పోటీదారు వివరాలు సున్నా",
      zeroPiiDesc: "వ్యక్తిగత పోటీదారుల ధరలు, పేర్లు లేదా చిరునామాలను ఏ కోడ్‌లోనూ బహిర్గతం చేయదు. ప్రైస్ పల్స్ కేవలం వర్గ బెంచ్‌మార్క్‌లను మాత్రమే ఇస్తుంది.",
      sentinelTitle: "రీకన్‌స్ట్రక్షన్ నిరోధక కాపలాదారు",
      sentinelDesc: "24 గంటల ప్రశ్నల బడ్జెట్: 15 / 15. నిరంతర ప్రశ్నల ద్వారా డేటాను తీసే ప్రయత్నాలను అడ్డుకుంటుంది.",
      usesTitle: "నేత్ర ఉపయోగించేవి",
      usesList: [
        "40+ దుకాణాలలో క్లస్టర్-స్థాయి కేటగిరీ వేగం",
        "వ్యాపారి స్వంత చారిత్రక UPI లావాదేవీలు మరియు బిల్లు పరిమాణాలు",
        "ప్రాంతీయ పండుగ క్యాలెండర్ సరళి",
        "విస్తృత స్థానిక మార్కెట్లు (ఉదా. దక్షిణ ఢిల్లీ)"
      ],
      neverSharesTitle: "నేత్ర ఎప్పుడూ పంచుకోనివి",
      neverSharesList: [
        "మరొక వ్యాపారి వ్యక్తిగత వస్తువు ధర లేదా తగ్గింపు",
        "మరొక దుకాణం ఆదాయం లేదా కస్టమర్ల సంఖ్య",
        "పోటీదారు దుకాణం పేరు, ఫోన్ నంబర్ లేదా ఖచ్చితమైన GPS స్థానం",
        "కస్టమర్ల ఫోన్ నంబర్లు లేదా UPI IDలు"
      ]
    },
    securitySentinel: {
      badge: "అడ్మిన్ సెక్యూరిటీ డాష్‌బోర్డ్",
      title: "ఆడిట్ సెంటినెల్ & సెక్యూరిటీ స్ట్రీమ్",
      subtitle: "గోప్యతా నిరోధాలు మరియు బ్లాక్ చేయబడిన ప్రశ్నల మార్చలేని ఆడిట్ లాగ్‌లు.",
      refreshBtn: "రీఫ్రెష్ చేయండి",
      kpiSuppression: "గోప్యతా రక్షణలు",
      kpiSuppressionSub: "అన్ని చిన్న సమూహాలు రక్షించబడ్డాయి",
      kpiBudget: "24 గంటల ప్రశ్న బడ్జెట్",
      kpiBudgetSub: "రీకన్‌స్ట్రక్షన్ వ్యతిరేక పరిమితి",
      kpiBlocked: "బ్లాక్ చేయబడిన దాడులు",
      kpiBlockedSub: "సున్నా డేటా లీకేజీ",
      kpiHealth: "రక్షక స్థితి",
      kpiHealthSub: "ఆడిట్ లాగ్ యాక్టివ్‌గా ఉంది",
      streamTitle: "లైవ్ సెక్యూరిటీ ఆడిట్ స్ట్రీమ్",
      streamSub: "ప్రైవసీ గేట్‌వే నమోదు చేసిన సంఘటనలు",
      emptyState: "ఇంకా ఎటువంటి సెక్యూరిటీ ఈవెంట్లు నమోదు కాలేదు."
    },
    attackSimulator: {
      badge: "హ్యాకథాన్ జడ్జిల ఇంటరాక్టివ్ వెరిఫికేషన్",
      title: "లైవ్ అటాక్ సిమ్యులేటర్",
      subtitle: "నేత్ర ప్రైవసీ సెంటినెల్‌పై పోటీదారుల నిఘా మరియు పునర్నిర్మాణ దాడులను పరీక్షించండి.",
      selectAttackTitle: "దాడి రకాన్ని ఎంచుకోండి",
      runBtn: "సిమ్యులేషన్ ప్రారంభించండి",
      runningBtn: "సిమ్యులేట్ అవుతోంది...",
      reportTitle: "రక్షణ నివేదిక",
      blockedBadge: "సెంటినెల్ ద్వారా బ్లాక్ చేయబడింది",
      allowedBadge: "సురక్షితం / అనుమతించబడింది",
      statusTitle: "HTTP స్థితి",
      defenseTitle: "ప్రేరేపించబడిన రక్షణ",
      verdictTitle: "గోప్యతా తీర్పు",
      technicalDetails: "సాంకేతిక ఆడిట్ వివరాలు",
      attacks: {
        small_cohort: {
          title: "1. నలుగురు వ్యాపారుల సమస్య",
          desc: "కేవలం 4 దుకాణాలు ఉన్న 1 కి.మీ పరిధిలో డేటాను అడుగుతుంది. దుకాణాలను బహిర్గతం చేయకుండా సిస్టమ్ డేటాను తొక్కిపెడుతుంది."
        },
        competitor_price: {
          title: "2. పోటీదారు ధరల నిఘా",
          desc: '"సమీపంలోని గుప్తా స్టోర్ మ్యాగీకి ఎంత ధర తీసుకుంటోంది?" అని ప్రశ్నిస్తుంది. తక్షణమే తిరస్కరించబడుతుంది.'
        },
        reconstruction_diff: {
          title: "3. డిఫరెన్సింగ్ రీకన్‌స్ట్రక్షన్ దాడి",
          desc: "1.0 కి.మీ మరియు 1.12 కి.మీ పరిధి ప్రశ్నలను తీసివేయడం ద్వారా మధ్యలో ఉన్న ఒక దుకాణాన్ని వేరు చేయడానికి చేసే ప్రయత్నం అడ్డుకోబడుతుంది."
        },
        prompt_injection: {
          title: "4. ధరల సమన్వయ కుట్ర దాడి",
          desc: "అన్ని పొరుగు కిరాణా దుకాణాల మధ్య ఉమ్మడి ధరల సమన్వయాన్ని ఏర్పరచడానికి చేసే ప్రయత్నాన్ని భద్రతా ద్వారం తిరస్కరిస్తుంది."
        }
      }
    },
    insightModal: {
      badge: "నేత్ర వ్యాపార వృద్ధి కోపైలట్",
      whatTitle: "1. మార్కెట్లో ఏమి జరుగుతోంది?",
      whyTitle: "2. ఇది ఎందుకు జరుగుతోంది?",
      soWhatTitle: "3. మీ వ్యాపారానికి దీని వల్ల ప్రయోజనం ఏమిటి?",
      actionTitle: "4. సిఫార్సు చేయబడిన చర్య",
      safeGuidance: "సురక్షిత మార్గదర్శకం",
      privacyShield: "40+ దుకాణాల సమిష్టి డేటా. పోటీదారుల ధరలు గోప్యంగా ఉంచబడ్డాయి.",
      dismissBtn: "ఇప్పటికి వద్దు",
      actionBtn: "ఆమోదించి అమలు చేయండి",
      defaultInsight: {
        title: "శీతల పానీయాల పెరుగుతున్న డిమాండ్‌ను సద్వినియోగం చేసుకోండి",
        what: "ఈ వారం మీ ప్రాంతంలో శీతల పానీయాల డిమాండ్ +18% వేగంగా పెరిగింది.",
        why: "మధ్యాహ్న సమయాల్లో ఎండ తీవ్రత మరియు మార్కెట్ రద్దీ కారణంగా శీతల పానీయాల కొనుగోళ్లు పెరిగాయి.",
        so_what: "మీ దుకాణంలో పానీయాల అమ్మకాలు సగటు కంటే తక్కువగా ఉన్నాయి; కాంబో ఆఫర్లు ఇచ్చిన వ్యాపారులకు 18% ఎక్కువ వ్యాపారం లభించింది.",
        expected_action: "వెంటనే 2 క్రేట్ల శీతల పానీయాలను ఆర్డర్ చేయండి మరియు కౌంటర్ వద్ద ₹55 మధ్యాహ్న కాంబోను ప్రదర్శించండి."
      },
    },
    whatsAppModal: {
      title: "వాట్సాప్ కిరాణా కోపైలట్ సిమ్యులేటర్",
      subtitle: "n8n ద్వారా రమేష్ కు పంపబడే ఆటోమేటెడ్ హెచ్చరికలు",
      distributorPO: "1-ట్యాప్‌తో హోల్‌సేలర్ ఆర్డర్ రూపొందించండి",
      poSuccess: "శర్మాజీ హోల్‌సేలర్స్‌కు వాట్సాప్ ద్వారా పర్చేస్ ఆర్డర్ పంపబడింది!"
    },
    clusterMapModal: {
      title: "హైపర్‌లోకల్ క్లస్టర్ గోప్యతా పటము",
      subtitle: "సాంద్రతను బట్టి పరిధి విస్తరణ (1కిమీ ➔ 3కిమీ ➔ 5కిమీ)",
      sliderLabel: "నమూనా వ్యాపారి సాంద్రత (N)",
      shieldActive: "రక్షణ యాక్టివ్: సమూహం రక్షించబడింది",
      shieldSuppressed: "సమాచారం నిరోధించబడింది: తగినంత సాంద్రత లేదు (N < 10)"
    }
  },

  kn: {
    nav: {
      copilot: "ವ್ಯಾಪಾರಿ ಸಹಾಯಕ",
      n8n: "n8n ವರ್ಕ್‌ಫ್ಲೋ",
      privacy: "ಗೌಪ್ಯತಾ ಕೇಂದ್ರ",
      sentinel: "ಭದ್ರತಾ ಆಡಿಟ್",
      simulator: "ದಾಳಿ ಸಿಮ್ಯುಲೇಟರ್",
      tagline: "ನೆಟ್‌ವರ್ಕ್ ಬುದ್ಧಿವಂತಿಕೆ • ಶೂನ್ಯ ಸ್ಪರ್ಧಿ ಬಹಿರಂಗಪಡಿಸುವಿಕೆ"
    },
    ticker: {
      liveStream: "Paytm ಸೌಂಡ್‌ಬಾಕ್ಸ್ ಲೈವ್ ಸ್ಟ್ರೀಮ್:",
      sampleTxn: "UPI ವಹಿವಾಟು #9102 • ₹40 (ತಂಪು ಪಾನೀಯ) • ದಕ್ಷಿಣ ದೆಹಲಿ • 4 ಸೆಕೆಂಡುಗಳ ಹಿಂದೆ",
      shieldStatus: "ಗೌಪ್ಯತಾ ಮಿತಿ: 42 ಅಂಗಡಿಗಳು (ರಕ್ಷಣಾ ಕವಚ ಸಕ್ರಿಯವಾಗಿದೆ)"
    },
    dashboard: {
      greeting: "ನಮಸ್ಕಾರ, ರಮೇಶ್.",
      storeSubtitle: "ರಮೇಶ್ ಕಿರಾಣಿ ಅಂಗಡಿ • ಲಜಪತ್ ನಗರ ಮಾರುಕಟ್ಟೆ • ದೆಹಲಿ",
      todaySignalTag: "ಇಂದಿನ ಪ್ರಮುಖ ವ್ಯಾಪಾರ ಸಂಕೇತ",
      heroHeadline: "ನಿಮ್ಮ ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ತಂಪು ಪಾನೀಯಗಳ ಬೇಡಿಕೆ +18% ಹೆಚ್ಚುತ್ತಿದೆ.",
      heroBody: "ದಕ್ಷಿಣ ದೆಹಲಿಯಲ್ಲಿ ಮಧ್ಯಾಹ್ನದ ವೇಳೆಗೆ ಪಾನೀಯಗಳ ಮಾರಾಟ ಹೆಚ್ಚುತ್ತಿದೆ. ಶುಕ್ರವಾರಕ್ಕೂ ಮುನ್ನ ನಿಮ್ಮ ದಾಸ್ತಾನನ್ನು ಪರಿಶೀಲಿಸಿ.",
      viewInsightBtn: "ಸಂಪೂರ್ಣ ವಿಶ್ಲೇಷಣೆ ವೀಕ್ಷಿಸಿ",
      soundboxTitle: "Paytm ಸೌಂಡ್‌ಬಾಕ್ಸ್ ದೈನಂದಿನ ಧ್ವನಿ ಸಂಕೇತ",
      playBriefing: "ಧ್ವನಿ ಸಂದೇಶ ಆಲಿಸಿ",
      replayBriefing: "ಮತ್ತೊಮ್ಮೆ ಆಲಿಸಿ",
      playingBriefing: "ಸೌಂಡ್‌ಬಾಕ್ಸ್‌ನಲ್ಲಿ ಪ್ಲೇ ಆಗುತ್ತಿದೆ...",
      soundboxSnippet: '"ನಮಸ್ಕಾರ ರಮೇಶ್. ಮಧ್ಯಾಹ್ನ ತಂಪು ಪಾನೀಯಗಳ ಬೇಡಿಕೆ 18% ಹೆಚ್ಚುತ್ತಿದೆ..."',
      tradeRadarTitle: "ವ್ಯಾಪಾರ ರೇಡಾರ್",
      tradeRadarSub: "ಸ್ಥಳೀಯ ಬೇಡಿಕೆ ವೇಗ",
      pricePulseTitle: "ಬೆಲೆ ಸ್ಪಂದನ",
      pricePulseSub: "ಮಾರುಕಟ್ಟೆ ವರ್ಗ ಮಾನದಂಡ",
      cashflowTitle: "ಹಣದ ಹರಿವಿನ ಭವಿಷ್ಯವಾಣಿ",
      cashflowSub: "7-ದಿನಗಳ ನಗದು ಮುನ್ಸೂಚನೆ",
      festivalTitle: "ಹಬ್ಬದ ಎಂಜಿನ್",
      festivalSub: "ಹಬ್ಬದ ಮಾರಾಟ ಸಿದ್ಧತೆ",
      growthMissionTitle: "ಬೆಳವಣಿಗೆ ಗುರಿ",
      growthMissionSub: "ಸಹವರ್ತಿ ಅಂಗಡಿಗಳ ಹೋಲಿಕೆ",
      memoryTitle: "ವ್ಯಾಪಾರಿ ನೆನಪು",
      memorySub: "ಕಾಗ್ನಿ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಆದ್ಯತೆಗಳು"
    },
    privacyCenter: {
      badge: "ನೇತ್ರ ಗೌಪ್ಯತಾ ವಾಸ್ತುಶಿಲ್ಪ",
      title: "ಗೌಪ್ಯತಾ ಕೇಂದ್ರ ಮತ್ತು ಗಡಿ ಕಾವಲುಗಾರ",
      subtitle: '"ಯಾವುದೇ ವ್ಯಾಪಾರಿಯ ವಿವರಗಳನ್ನು ಬಹಿರಂಗಪಡಿಸದೆ ಸಾಮೂಹಿಕ ಬುದ್ಧಿವಂತಿಕೆ." ಡೇಟಾ ಗಡಿಯಲ್ಲಿ ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಜಾರಿಗೊಳಿಸಲಾಗಿದೆ.',
      smallCohortTitle: "ಸಣ್ಣ-ಗುಂಪಿನ ಮಾಹಿತಿ ಮರೆಮಾಚುವಿಕೆ",
      smallCohortDesc: "ಕನಿಷ್ಠ ಮಿತಿ: 10 ವ್ಯಾಪಾರಿಗಳು. ಸಾಂದ್ರತೆ ಕಡಿಮೆಯಿದ್ದರೆ ವ್ಯಾಪ್ತಿಯನ್ನು ವಿಸ್ತರಿಸಲಾಗುತ್ತದೆ ಅಥವಾ ಮಾಹಿತಿಯನ್ನು ಮರೆಮಾಡಲಾಗುತ್ತದೆ.",
      zeroPiiTitle: "ಶೂನ್ಯ ಸ್ಪರ್ಧಿ ವಿವರಗಳು",
      zeroPiiDesc: "ಯಾವುದೇ ಸ್ಪರ್ಧಿಗಳ ವೈಯಕ್ತಿಕ ದರಗಳು, ಹೆಸರುಗಳು ಅಥವಾ ವಿಳಾಸಗಳನ್ನು ಎಂದಿಗೂ ಪ್ರದರ್ಶಿಸುವುದಿಲ್ಲ.",
      sentinelTitle: "ಪುನರ್ನಿರ್ಮಾಣ ವಿರೋಧಿ ಕಾವಲುಗಾರ",
      sentinelDesc: "24 ಗಂಟೆಗಳ ಪ್ರಶ್ನೆ ಮಿತಿ: 15 / 15. ಸರಣಿ ಪ್ರಶ್ನೆಗಳ ಮೂಲಕ ಡೇಟಾ ಕದಿಯುವುದನ್ನು ತಡೆಯುತ್ತದೆ.",
      usesTitle: "ನೇತ್ರ ಬಳಸುವ ಅಂಶಗಳು",
      usesList: [
        "40+ ಅಂಗಡಿಗಳ ಒಟ್ಟು ವರ್ಗ ಬೇಡಿಕೆಯ ವೇಗ",
        "ವ್ಯಾಪಾರಿಯ ಸ್ವಂತ ಹಿಂದಿನ UPI ವಹಿವಾಟುಗಳು",
        "ಪ್ರಾದೇಶಿಕ ಹಬ್ಬದ ಕ್ಯಾಲೆಂಡರ್ ಮಾದರಿಗಳು",
        "ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆ ಕ್ಲಸ್ಟರ್‌ಗಳು (ಉದಾ. ದಕ್ಷಿಣ ದೆಹಲಿ)"
      ],
      neverSharesTitle: "ನೇತ್ರ ಎಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳದ ಅಂಶಗಳು",
      neverSharesList: [
        "ಇನ್ನೊಬ್ಬ ವ್ಯಾಪಾರಿಯ ವೈಯಕ್ತಿಕ ವಸ್ತುವಿನ ಬೆಲೆ ಅಥವಾ ರಿಯಾಯಿತಿ",
        "ಇನ್ನೊಂದು ಅಂಗಡಿಯ ಒಟ್ಟು ಆದಾಯ ಅಥವಾ ಗ್ರಾಹಕರ ಸಂಖ್ಯೆ",
        "ಸ್ಪರ್ಧಿ ಅಂಗಡಿಯ ಹೆಸರು, ಫೋನ್ ಸಂಖ್ಯೆ ಅಥವಾ ನಿಖರ GPS ಸ್ಥಳ",
        "ಗ್ರಾಹಕರ ಫೋನ್ ಸಂಖ್ಯೆಗಳು ಅಥವಾ UPI ಐಡಿಗಳು"
      ]
    },
    securitySentinel: {
      badge: "ನಿರ್ವಾಹಕ ಭದ್ರತಾ ಫಲಕ",
      title: "ಭದ್ರತಾ ಆಡಿಟ್ ಮತ್ತು ಈವೆಂಟ್ ಲಾಗ್",
      subtitle: "ಗೌಪ್ಯತೆ ರಕ್ಷಣೆ ಮತ್ತು ನಿರ್ಬಂಧಿಸಲಾದ ಪ್ರಶ್ನೆಗಳ ಬದಲಾಯಿಸಲಾಗದ ಆಡಿಟ್ ಲಾಗ್‌ಗಳು.",
      refreshBtn: "ನವೀಕರಿಸಿ",
      kpiSuppression: "ಗೌಪ್ಯತಾ ರಕ್ಷಣೆಗಳು",
      kpiSuppressionSub: "ಎಲ್ಲಾ ಸಣ್ಣ ಗುಂಪುಗಳನ್ನು ರಕ್ಷಿಸಲಾಗಿದೆ",
      kpiBudget: "24 ಗಂಟೆಗಳ ಪ್ರಶ್ನೆ ಕೋಟಾ",
      kpiBudgetSub: "ಪುನರ್ನಿರ್ಮಾಣ ವಿರೋಧಿ ಮಿತಿ",
      kpiBlocked: "ತಡೆದ ದಾಳಿಗಳು",
      kpiBlockedSub: "ಶೂನ್ಯ ಡೇಟಾ ಸೋರಿಕೆ",
      kpiHealth: "ಕಾವಲುಗಾರ ಸ್ಥಿತಿ",
      kpiHealthSub: "ಆಡಿಟ್ ಲಾಗ್ ಸಕ್ರಿಯವಾಗಿದೆ",
      streamTitle: "ಲೈವ್ ಭದ್ರತಾ ಆಡಿಟ್ ಸ್ಟ್ರೀಮ್",
      streamSub: "ಗೌಪ್ಯತೆ ಗೇಟ್‌ವೇ ದಾಖಲಿಸಿದ ಘಟನೆಗಳು",
      emptyState: "ಇನ್ನೂ ಯಾವುದೇ ಭದ್ರತಾ ಘಟನೆಗಳು ದಾಖಲಾಗಿಲ್ಲ."
    },
    attackSimulator: {
      badge: "ತೀರ್ಪುಗಾರರ ಸಂವಾದಾತ್ಮಕ ಪರಿಶೀಲನಾ ವೇದಿಕೆ",
      title: "ಲೈವ್ ದಾಳಿ ಸಿಮ್ಯುಲೇಟರ್",
      subtitle: "ನೇತ್ರ ಗೌಪ್ಯತೆ ಕಾವಲುಗಾರನ ಮೇಲೆ ಸ್ಪರ್ಧಿಗಳ ಬೇಹುಗಾರಿಕೆ ಮತ್ತು ಪುನರ್ನಿರ್ಮಾಣ ದಾಳಿಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ.",
      selectAttackTitle: "ದಾಳಿಯ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      runBtn: "ಸಿಮ್ಯುಲೇಶನ್ ಚಲಾಯಿಸಿ",
      runningBtn: "ಪರೀಕ್ಷೆ ನಡೆಯುತ್ತಿದೆ...",
      reportTitle: "ಕಾವಲುಗಾರ ರಕ್ಷಣಾ ವರದಿ",
      blockedBadge: "ಕಾವಲುಗಾರನಿಂದ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ",
      allowedBadge: "ಸುರಕ್ಷಿತ / ಅನುಮತಿಸಲಾಗಿದೆ",
      statusTitle: "HTTP ಸ್ಥಿತಿ",
      defenseTitle: "ಪ್ರಚೋದಿತ ರಕ್ಷಣೆ",
      verdictTitle: "ಗೌಪ್ಯತೆ ತೀರ್ಪು",
      technicalDetails: "ತಾಂತ್ರಿಕ ಆಡಿಟ್ ವಿವರಗಳು",
      attacks: {
        small_cohort: {
          title: "1. 4-ವ್ಯಾಪಾರಿಗಳ ಇಕ್ಕಟ್ಟು",
          desc: "ಕೇವಲ 4 ಅಂಗಡಿಗಳಿರುವ ಪ್ರದೇಶದಲ್ಲಿ ಡೇಟಾವನ್ನು ಕೇಳುತ್ತದೆ. ಅಂಗಡಿಗಳನ್ನು ಬಹಿರಂಗಪಡಿಸದೆ ಸಿಸ್ಟಮ್ ಡೇಟಾವನ್ನು ಮರೆಮಾಡುತ್ತದೆ."
        },
        competitor_price: {
          title: "2. ಸ್ಪರ್ಧಿ ಬೆಲೆ ಬೇಹುಗಾರಿಕೆ",
          desc: '"ಹತ್ತಿರದ ಗುಪ್ತಾ ಸ್ಟೋರ್ ಮ್ಯಾಗಿಗೆ ಎಷ್ಟು ಬೆಲೆ ವಿಧಿಸುತ್ತಿದೆ?" ಎಂದು ಕೇಳುವುದು. ತಕ್ಷಣವೇ ತಿರಸ್ಕರಿಸಲ್ಪಡುತ್ತದೆ.'
        },
        reconstruction_diff: {
          title: "3. ವ್ಯತ್ಯಾಸ ಪುನರ್ನಿರ್ಮಾಣ ದಾಳಿ",
          desc: "1.0 ಕಿಮೀ ಮತ್ತು 1.12 ಕಿಮೀ ವ್ಯಾಪ್ತಿಯ ಪ್ರಶ್ನೆಗಳನ್ನು ಕಳೆಯುವ ಮೂಲಕ ಮಧ್ಯದಲ್ಲಿರುವ ಒಂದು ಅಂಗಡಿಯನ್ನು ಪ್ರತ್ಯೇಕಿಸುವ ಪ್ರಯತ್ನವನ್ನು ತಡೆಯಲಾಗುತ್ತದೆ."
        },
        prompt_injection: {
          title: "4. ಬೆಲೆ ಹೊಂದಾಣಿಕೆ ಸಂಚು",
          desc: "ಎಲ್ಲಾ ನೆರೆಹೊರೆಯ ಅಂಗಡಿಗಳ ನಡುವೆ ಒಟ್ಟಾಗಿ ಬೆಲೆ ನಿಗದಿಪಡಿಸಲು ಮಾಡುವ ಪ್ರಯತ್ನವನ್ನು ಭದ್ರತಾ ಗೇಟ್ ತಿರಸ್ಕರಿಸುತ್ತದೆ."
        }
      }
    },
    insightModal: {
      badge: "ನೇತ್ರ ವ್ಯಾಪಾರ ಬೆಳವಣಿಗೆಯ ಸಹಾಯಕ",
      whatTitle: "1. ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಏನು ನಡೆಯುತ್ತಿದೆ?",
      whyTitle: "2. ಇದು ಏಕೆ ಸಂಭವಿಸುತ್ತಿದೆ?",
      soWhatTitle: "3. ನಿಮ್ಮ ವ್ಯಾಪಾರಕ್ಕೆ ಇದರ ಪರಿಣಾಮವೇನು?",
      actionTitle: "4. ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ",
      safeGuidance: "ಸುರಕ್ಷಿತ ಮಾರ್ಗದರ್ಶನ",
      privacyShield: "40+ ಅಂಗಡಿಗಳ ಒಟ್ಟು ಡೇಟಾ. ಸ್ಪರ್ಧಿಗಳ ಬೆಲೆಗಳನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಮರೆಮಾಡಲಾಗಿದೆ.",
      dismissBtn: "ಸದ್ಯಕ್ಕೆ ಬಿಟ್ಟುಬಿಡಿ",
      actionBtn: "ಅಂಗೀಕರಿಸಿ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ",
      defaultInsight: {
        title: "ತಂಪು ಪಾನೀಯಗಳ ಹೆಚ್ಚುತ್ತಿರುವ ಬೇಡಿಕೆಯನ್ನು ಸದುಪಯೋಗಪಡಿಸಿಕೊಳ್ಳಿ",
        what: "ಈ ವಾರ ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ತಂಪು ಪಾನೀಯಗಳ ಬೇಡಿಕೆ +18% ಹೆಚ್ಚಾಗಿದೆ.",
        why: "ಮಧ್ಯಾಹ್ನದ ಬಿಸಿಲು ಮತ್ತು ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಗ್ರಾಹಕರ ಓಡಾಟದಿಂದಾಗಿ ತಂಪು ಪಾನೀಯಗಳ ಮಾರಾಟ ಹೆಚ್ಚಿದೆ.",
        so_what: "ನಿಮ್ಮ ಅಂಗಡಿಯಲ್ಲಿ ಈ ಮಾರಾಟವು ಸರಾಸರಿಗಿಂತ ಕಡಿಮೆಯಿದೆ; ಕಾಂಬೊ ನೀಡಿದ ಅಂಗಡಿಗಳಲ್ಲಿ 18% ವ್ಯಾಪಾರ ಹೆಚ್ಚಾಗಿದೆ.",
        expected_action: "ತಕ್ಷಣವೇ 2 ಕ್ರೇಟ್ ತಂಪು ಪಾನೀಯಗಳನ್ನು ಆರ್ಡರ್ ಮಾಡಿ ಮತ್ತು ಕೌಂಟರ್‌ನಲ್ಲಿ ₹55 ಕಾಂಬೊ ಆಫರ್ ಪ್ರದರ್ಶಿಸಿ."
      },
    },
    whatsAppModal: {
      title: "ವಾಟ್ಸಾಪ್ ಕಿರಾಣಿ ಸಹಾಯಕ ಸಿಮ್ಯುಲೇಟರ್",
      subtitle: "n8n ಮೂಲಕ ರಮೇಶ್‌ಗೆ ಕಳುಹಿಸಲಾದ ಸ್ವಯಂಚಾಲಿತ ಸಂದೇಶಗಳು",
      distributorPO: "ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಸಗಟು ವ್ಯಾಪಾರಿ ಆರ್ಡರ್ ರಚಿಸಿ",
      poSuccess: "ಶರ್ಮಾಜಿ ಹೋಲ್‌ಸೇಲರ್ಸ್‌ಗೆ ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಖರೀದಿ ಆದೇಶ ಕಳುಹಿಸಲಾಗಿದೆ!"
    },
    clusterMapModal: {
      title: "ಸ್ಥಳೀಯ ಕ್ಲಸ್ಟರ್ ಗೌಪ್ಯತಾ ನಕ್ಷೆ",
      subtitle: "ಸಾಂದ್ರತೆಗೆ ಅನುಗುಣವಾಗಿ ವ್ಯಾಪ್ತಿ ವಿಸ್ತರಣೆ (1ಕಿಮೀ ➔ 3ಕಿಮೀ ➔ 5ಕಿಮೀ)",
      sliderLabel: "ಮಾದರಿ ವ್ಯಾಪಾರಿ ಸಾಂದ್ರತೆ (N)",
      shieldActive: "ರಕ್ಷಣೆ ಸಕ್ರಿಯ: ಗುಂಪು ರಕ್ಷಿತವಾಗಿದೆ",
      shieldSuppressed: "ಮಾಹಿತಿ ಮರೆಮಾಡಲಾಗಿದೆ: ಸಾಕಷ್ಟು ಸಾಂದ್ರತೆಯಿಲ್ಲ (N < 10)"
    }
  },

  mr: {
    nav: {
      copilot: "व्यापारी कोपायलट",
      n8n: "n8n वर्कफ्लो",
      privacy: "गोपनीयता केंद्र",
      sentinel: "सुरक्षा ऑडिट",
      simulator: "हल्ला सिम्युलेटर",
      tagline: "नेटवर्क इंटेलिजन्स • शून्य स्पर्धक प्रकटीकरण"
    },
    ticker: {
      liveStream: "Paytm साऊंडबॉक्स थेट प्रवाह:",
      sampleTxn: "UPI व्यवहार #9102 • ₹40 (पेये) • दक्षिण दिल्ली क्लस्टर • 4 सेकंदांपूर्वी",
      shieldStatus: "गोपनीयता मर्यादा: 42 दुकाने (सुरक्षा कवच सक्रिय)"
    },
    dashboard: {
      greeting: "नमस्कार, रमेश जी.",
      storeSubtitle: "रमेश किराणा स्टोअर • लजपत नगर सेंट्रल मार्केट • दिल्ली",
      todaySignalTag: "आजचा सर्वोच्च व्यवसाय संकेत",
      heroHeadline: "तुमच्या स्थानिक बाजारात थंड पेयांची मागणी +18% वाढत आहे.",
      heroBody: "दक्षिण दिल्ली भागात दुपारच्या वेळी थंड पेयांची मागणी वेगाने वाढत आहे. शुक्रवारपूर्वी आपला साठा तपासून घ्या.",
      viewInsightBtn: "पूर्ण विश्लेषण पहा",
      soundboxTitle: "Paytm साऊंडबॉक्स दैनिक ऑडिओ संदेश",
      playBriefing: "साऊंडबॉक्स संदेश ऐका",
      replayBriefing: "पुन्हा ऐका",
      playingBriefing: "साऊंडबॉक्सवर वाजत आहे...",
      soundboxSnippet: '"नमस्कार रमेश जी. दुपारच्या वेळी थंड पेयांची मागणी १८% वाढत आहे..."',
      tradeRadarTitle: "व्यापार रडार",
      tradeRadarSub: "स्थानिक मागणी गती",
      pricePulseTitle: "किंमत पल्स",
      pricePulseSub: "बाजार श्रेणी बेंचमार्क",
      cashflowTitle: "कॅश फ्लो भविष्यवेत्ता",
      cashflowSub: "7-दिवसीय तरलता अंदाज",
      festivalTitle: "उत्सव इंजिन",
      festivalSub: "सण मागणी तयारी",
      growthMissionTitle: "वाढ मिशन",
      growthMissionSub: "समकक्ष किराणा बेंचमार्क",
      memoryTitle: "व्यापारी स्मृती",
      memorySub: "कॉग्नी प्रोफाइल आणि पसंती"
    },
    privacyCenter: {
      badge: "नेत्र गोपनीयता आर्किटेक्चर",
      title: "गोपनीयता केंद्र आणि सीमा रक्षक",
      subtitle: '"व्यापाऱ्याची खाजगी माहिती उघड न करता नेटवर्क बुद्धिमत्ता." डेटा सीमेवर काटेकोरपणे लागू.',
      smallCohortTitle: "लहान-गट माहिती दमन (Small-Cohort Suppression)",
      smallCohortDesc: "किमान मर्यादा: 10 व्यापारी. घनता अपुरी असल्यास प्रणाली आपोआप त्रिज्या वाढवते किंवा माहिती दडपून ठेवते.",
      zeroPiiTitle: "शून्य स्पर्धक डेटा",
      zeroPiiDesc: "कोणत्याही कोड पाथद्वारे प्रतिस्पर्ध्याच्या वैयक्तिक किमती, दुकानाचे नाव किंवा अचूक पत्ता दाखवला जात नाही.",
      sentinelTitle: "पुनर्बांधणी-विरोधी रक्षक",
      sentinelDesc: "24 तासांचा क्वेरी कोटा: 15 / 15. एकापाठोपाठ प्रश्न विचारून माहिती काढण्याचे प्रयत्न रोखले जातात.",
      usesTitle: "नेत्र काय वापरते",
      usesList: [
        "40+ दुकानांमधील क्लस्टर-स्तरीय श्रेणी मागणी गती",
        "व्यापाऱ्याचे स्वतःचे ऐतिहासिक UPI व्यवहार आणि बिल आकार",
        "प्रादेशिक सण कॅलेंडर आणि हंगामी कल",
        "विस्तृत स्थानिक बाजारपेठा (उदा. दक्षिण दिल्ली)"
      ],
      neverSharesTitle: "नेत्र कधीही काय शेअर करत नाही",
      neverSharesList: [
        "दुसऱ्या व्यापाऱ्याची वैयक्तिक वस्तूची किंमत किंवा सवलत",
        "दुसऱ्या दुकानाचे महसूल किंवा ग्राहकांची संख्या",
        "स्पर्धक दुकानाचे नाव, फोन नंबर किंवा अचूक GPS स्थान",
        "ग्राहकांचे फोन नंबर किंवा UPI आयडी"
      ]
    },
    securitySentinel: {
      badge: "प्रशासक सुरक्षा डॅशबोर्ड",
      title: "सुरक्षा ऑडिट आणि इव्हेंट लॉग",
      subtitle: "गोपनीयता संरक्षण आणि ब्लॉक केलेल्या प्रश्नांचे अपरिवर्तनीय ऑडिट लॉग.",
      refreshBtn: "रिफ्रेश करा",
      kpiSuppression: "गोपनीयता संरक्षण",
      kpiSuppressionSub: "सर्व लहान गट सुरक्षित",
      kpiBudget: "24 तास क्वेरी कोटा",
      kpiBudgetSub: "पुनर्बांधणी-विरोधी मर्यादा",
      kpiBlocked: "अडवलेले हल्ले",
      kpiBlockedSub: "शून्य डेटा गळती",
      kpiHealth: "रक्षक स्थिती",
      kpiHealthSub: "ऑडिट लॉग सक्रिय",
      streamTitle: "थेट सुरक्षा ऑडिट प्रवाह",
      streamSub: "प्रायव्हसी गेटवेने नोंदवलेल्या घटना",
      emptyState: "अद्याप कोणतीही सुरक्षा घटना नोंदवली गेलेली नाही."
    },
    attackSimulator: {
      badge: "परीक्षकांसाठी परस्परसंवादी पडताळणी संच",
      title: "थेट सुरक्षा हल्ला सिम्युलेटर",
      subtitle: "नेत्रच्या प्रायव्हसी सेंटिनेलवर प्रतिस्पर्धी हेरगिरी आणि डेटा पुनर्बांधणी हल्ल्यांची चाचणी घ्या.",
      selectAttackTitle: "हल्ल्याचा प्रकार निवडा",
      runBtn: "हल्ला सिम्युलेशन चालवा",
      runningBtn: "चाचणी सुरू आहे...",
      reportTitle: "रक्षक संरक्षण अहवाल",
      blockedBadge: "सेंटिनेलद्वारे अडवले गेले",
      allowedBadge: "सुरक्षित / मंजूर",
      statusTitle: "HTTP स्थिती",
      defenseTitle: "सक्रिय सुरक्षा उपाय",
      verdictTitle: "गोपनीयता निर्णय",
      technicalDetails: "तांत्रिक ऑडिट तपशील",
      attacks: {
        small_cohort: {
          title: "1. 4-व्यापाऱ्यांचा पेच",
          desc: "फक्त 4 दुकाने असलेल्या भागात डेटा विचारणे. वैयक्तिक दुकाने उघड न करता प्रणाली माहिती दडपून ठेवते याची खात्री करते."
        },
        competitor_price: {
          title: "2. स्पर्धक किंमत हेरगिरी",
          desc: '"जवळच्या गुप्ता स्टोअरमध्ये मॅगीची किंमत काय आहे?" असे विचारणे. तत्काळ नाकारले जाते.'
        },
        reconstruction_diff: {
          title: "3. फरक पुनर्बांधणी हल्ला",
          desc: "1.0 किमी आणि 1.12 किमी त्रिज्या प्रश्न वजा करून मधील एका दुकानाची माहिती काढण्याचा प्रयत्न रोखला जातो."
        },
        prompt_injection: {
          title: "4. किंमत संगनमत कट",
          desc: "शेजारच्या सर्व किराणा दुकानांमध्ये मिळून किंमत ठरवण्याचा प्रयत्न केला असता सुरक्षा गेट तत्काळ नकार देते."
        }
      }
    },
    insightModal: {
      badge: "नेत्र व्यापार वाढीचा कोपायलट",
      whatTitle: "१. बाजारपेठेत काय घडत आहे?",
      whyTitle: "२. हे का घडत आहे?",
      soWhatTitle: "३. आपल्या व्यवसायावर याचा काय परिणाम होईल?",
      actionTitle: "४. सुचवलेली व्यावसायिक कृती",
      safeGuidance: "सुरक्षित मार्गदर्शन",
      privacyShield: "४०+ दुकानांचा एकत्रित डेटा. प्रतिस्पर्ध्यांच्या किमती पूर्णपणे सुरक्षित ठेवल्या आहेत.",
      dismissBtn: "सध्या बाजूला ठेवा",
      actionBtn: "मंजूर करा आणि कृती करा",
      defaultInsight: {
        title: "थंड पेयांच्या वाढत्या मागणीचा फायदा घ्या",
        what: "या आठवड्यात आपल्या भागात थंड पेयांची मागणी +१८% वेगाने वाढत आहे.",
        why: "दुपारच्या उकाड्यामुळे आणि बाजारपेठेतील गर्दीमुळे ग्राहक थंड पेयांची खरेदी करत आहेत.",
        so_what: "आपल्या दुकानातील पेयांची विक्री सरासरीपेक्षा कमी आहे; कॉम्बो ऑफर देणाऱ्या व्यापाऱ्यांच्या विक्रीत १८% वाढ झाली आहे.",
        expected_action: "लगेच २ क्रेट्स कोल्ड्रिंक्स आणि ज्यूस मागवा, आणि काउंटरवर ₹५५ चा 'दुपार रिफ्रेश कॉम्बो' ठेवा."
      },
    },
    whatsAppModal: {
      title: "व्हॉट्सअॅप किराणा कोपायलट सिम्युलेटर",
      subtitle: "n8n द्वारे रमेश यांना पाठवलेल्या स्वयंचलित सूचनांचे थेट अनुकरण",
      distributorPO: "एका टॅपमध्ये घाऊक विक्रेता ऑर्डर तयार करा",
      poSuccess: "शर्माजी होलसेलर्सना व्हॉट्सअॅपवर खरेदी ऑर्डर (PO) पाठवली गेली!"
    },
    clusterMapModal: {
      title: "अति-स्थानिक क्लस्टर गोपनीयता नकाशा",
      subtitle: "घनतेनुसार त्रिज्येचा विस्तार (1किमी ➔ 3किमी ➔ 5किमी)",
      sliderLabel: "नमुना व्यापारी घनता (N)",
      shieldActive: "संरक्षण सक्रिय: गट सुरक्षित",
      shieldSuppressed: "माहिती दडपली: अपुरी घनता (N < 10)"
    }
  },

  bn: {
    nav: {
      copilot: "বণিক কোপাইলট",
      n8n: "n8n ওয়ার্কফ্লো",
      privacy: "গোপনীয়তা কেন্দ্র",
      sentinel: "নিরাপত্তা অডিট",
      simulator: "আক্রমণ সিমুলেটর",
      tagline: "নেটওয়ার্ক বুদ্ধিমত্তা • শূন্য প্রতিযোগী প্রকাশ"
    },
    ticker: {
      liveStream: "Paytm সাউন্ডবক্স লাইভ স্ট্রিম:",
      sampleTxn: "UPI লেনদেন #9102 • ₹40 (পানীয়) • দক্ষিণ দিল্লি ক্লাস্টার • 4 সেকেন্ড আগে",
      shieldStatus: "গোপনীয়তা সীমা: 42টি দোকান (সুরক্ষা শিল্ড সক্রিয়)"
    },
    dashboard: {
      greeting: "নমস্কার, রমেশ বাবু।",
      storeSubtitle: "রমেশ মুদি দোকান • লাজপত নগর সেন্ট্রাল মার্কেট • দিল্লি",
      todaySignalTag: "আজকের সেরা ব্যবসার সুযোগ",
      heroHeadline: "আপনার এলাকায় ঠান্ডা পানীয়ের চাহিদা +18% বৃদ্ধি পাচ্ছে।",
      heroBody: "দক্ষিণ দিল্লিতে দুপুরের দিকে ঠান্ডা পানীয়ের চাহিদা দ্রুত বাড়ছে। শুক্রবারের আগেই কোল্ড ড্রিংকসের স্টক দেখে নিন।",
      viewInsightBtn: "সম্পূর্ণ বিশ্লেষণ দেখুন",
      soundboxTitle: "Paytm সাউন্ডবক্স দৈনিক অডিও বার্তা",
      playBriefing: "সাউন্ডবক্স বার্তা শুনুন",
      replayBriefing: "পুনরায় শুনুন",
      playingBriefing: "সাউন্ডবক্সে বাজছে...",
      soundboxSnippet: '"নমস্কার রমেশ বাবু। দুপুরে ঠান্ডা পানীয়ের চাহিদা ১৮% বাড়ছে..."',
      tradeRadarTitle: "বাণিজ্য রাডার",
      tradeRadarSub: "স্থানীয় চাহিদার গতি",
      pricePulseTitle: "মূল্য পালস",
      pricePulseSub: "বাজার ক্যাটাগরি বেঞ্চমার্ক",
      cashflowTitle: "নগদ প্রবাহ ভবিষ্যদ্বাণী",
      cashflowSub: "7-দিনের নগদ প্রবাহ পূর্বাভাস",
      festivalTitle: "উৎসব ইঞ্জিন",
      festivalSub: "উৎসবের প্রস্তুতি পরিকল্পনা",
      growthMissionTitle: "উন্নতি মিশন",
      growthMissionSub: "অনুরূপ দোকানের সাথে তুলনা",
      memoryTitle: "বণিক স্মৃতি",
      memorySub: "কগনি প্রোফাইল এবং পছন্দসমূহ"
    },
    privacyCenter: {
      badge: "নেত্র গোপনীয়তা স্থাপত্য",
      title: "গোপনীয়তা কেন্দ্র এবং সুরক্ষা প্রহরী",
      subtitle: '"কোনো বণিকের তথ্য ফাঁস না করে নেটওয়ার্ক বুদ্ধিমত্তা।" ডেটা সীমানায় কঠোরভাবে সুরক্ষিত।',
      smallCohortTitle: "ক্ষুদ্র দল তথ্য দমন (Small-Cohort Suppression)",
      smallCohortDesc: "ন্যূনতম সীমা: 10 জন বণিক। ঘনত্ব কম হলে সিস্টেম স্বয়ংক্রিয়ভাবে ব্যাসার্ধ বাড়ায় বা তথ্য গোপন রাখে।",
      zeroPiiTitle: "শূন্য প্রতিযোগী ব্যক্তিগত তথ্য",
      zeroPiiDesc: "অন্যান্য দোকানের ব্যক্তিগত দাম, নাম বা ঠিকানা কখনোই প্রকাশ করা হয় না।",
      sentinelTitle: "পুনর্গঠন-বিরোধী প্রহরী",
      sentinelDesc: "24 ঘণ্টার কোয়েরি কোটা: 15 / 15। ধারাবাহিক অনুসন্ধানের মাধ্যমে তথ্য বের করার চেষ্টা প্রতিহত করা হয়।",
      usesTitle: "নেত্র যা ব্যবহার করে",
      usesList: [
        "40+ দোকানের ক্লাস্টার-স্তরের সম্মিলিত পণ্যের চাহিদা গতি",
        "বণিকের নিজস্ব ঐতিহাসিক UPI লেনদেন এবং বিলের পরিমাণ",
        "আঞ্চলিক উৎসবের ক্যালেন্ডার এবং মরসুমি প্রবণতা",
        "বিস্তৃত স্থানীয় বাজার (যেমন দক্ষিণ দিল্লি)"
      ],
      neverSharesTitle: "নেত্র যা কখনোই ভাগ করে না",
      neverSharesList: [
        "অন্য কোনো দোকানের পণ্যের ব্যক্তিগত দাম বা ডিসকাউন্ট",
        "অন্য দোকানের মোট রাজস্ব বা গ্রাহক সংখ্যা",
        "প্রতিযোগী দোকানের নাম, ফোন নম্বর বা সুনির্দিষ্ট জিপিএস অবস্থান",
        "গ্রাহকদের ফোন নম্বর বা UPI আইডি"
      ]
    },
    securitySentinel: {
      badge: "প্রশাসক নিরাপত্তা ড্যাশবোর্ড",
      title: "নিরাপত্তা অডিট এবং ইভেন্ট লগ",
      subtitle: "গোপনীয়তা সুরক্ষা এবং প্রতিহত করা প্রশ্নের অপরিবর্তনীয় অডিট লগ।",
      refreshBtn: "রিফ্রেশ করুন",
      kpiSuppression: "গোপনীয়তা সুরক্ষা",
      kpiSuppressionSub: "সমস্ত ছোট দল সুরক্ষিত",
      kpiBudget: "24 ঘণ্টার প্রশ্ন কোটা",
      kpiBudgetSub: "পুনর্গঠন-বিরোধী সীমা",
      kpiBlocked: "প্রতিহত আক্রমণ",
      kpiBlockedSub: "শূন্য তথ্য ফাঁসের ঘটনা",
      kpiHealth: "প্রহরীর অবস্থা",
      kpiHealthSub: "অডিট লগ সক্রিয় রয়েছে",
      streamTitle: "লাইভ নিরাপত্তা অডিট স্ট্রিম",
      streamSub: "প্রাইভেসি গেটওয়ে দ্বারা রেকর্ড করা ঘটনাবলী",
      emptyState: "এখনও পর্যন্ত কোনো নিরাপত্তা ঘটনা নথিভুক্ত হয়নি।"
    },
    attackSimulator: {
      badge: "বিচারকদের জন্য ইন্টারেক্টিভ যাচাইকরণ প্ল্যাটফর্ম",
      title: "লাইভ আক্রমণ সিমুলেটর",
      subtitle: "নেত্রর প্রাইভেসি সেন্টিনেলের বিরুদ্ধে প্রতিযোগীদের গোয়েন্দাগিরি এবং ডেটা পুনর্গঠন আক্রমণ পরীক্ষা করুন।",
      selectAttackTitle: "আক্রমণের ধরন নির্বাচন করুন",
      runBtn: "আক্রমণ সিমুলেশন চালান",
      runningBtn: "পরীক্ষা চলছে...",
      reportTitle: "প্রহরী প্রতিরক্ষা রিপোর্ট",
      blockedBadge: "প্রহরী দ্বারা প্রতিহত",
      allowedBadge: "নিরাপদ / অনুমোদিত",
      statusTitle: "HTTP স্থিতি",
      defenseTitle: "সক্রিয় প্রতিরক্ষা",
      verdictTitle: "গোপনীয়তা রায়",
      technicalDetails: "প্রযুক্তিগত অডিট বিশদ",
      attacks: {
        small_cohort: {
          title: "1. 4-বণিকের দ্বন্দ্ব",
          desc: "মাত্র 4টি দোকান সহ একটি বিচ্ছিন্ন 1 কিমি এলাকায় তথ্য জিজ্ঞাসা করে। সিস্টেম ব্যক্তিগত দোকান প্রকাশ না করে তথ্য গোপন রাখে।"
        },
        competitor_price: {
          title: "2. প্রতিযোগীর মূল্য গোয়েন্দাগিরি",
          desc: '"কাছের গুপ্তা স্টোর ম্যাগিতে কত দাম নিচ্ছে?" জিজ্ঞাসা করা সিমুলেট করে। অবিলম্বে প্রত্যাখ্যাত হয়।'
        },
        reconstruction_diff: {
          title: "3. পার্থক্যের পুনর্গঠন আক্রমণ",
          desc: "1.0 কিমি এবং 1.12 কিমি ব্যাসার্ধের প্রশ্ন বিয়োগ করে মাঝখানের একক দোকানটিকে আলাদা করার চেষ্টা রোধ করা হয়।"
        },
        prompt_injection: {
          title: "4. মূল্য সমন্বয় চক্রান্ত",
          desc: "আশেপাশের সমস্ত মুদি দোকানের মধ্যে সমন্বিত মূল্য নির্ধারণের চেষ্টা নিরাপত্তা গেট তৎক্ষণাৎ বাতিল করে।"
        }
      }
    },
    insightModal: {
      badge: "নেত্র ব্যবসায়িক বৃদ্ধির সহকারী",
      whatTitle: "১. বাজারে কী ঘটছে?",
      whyTitle: "২. কেন এটি ঘটছে?",
      soWhatTitle: "৩. আপনার ব্যবসার জন্য এর অর্থ কী?",
      actionTitle: "৪. প্রস্তাবিত পদক্ষেপ",
      safeGuidance: "নিরাপদ নির্দেশিকা",
      privacyShield: "৪০+ দোকানের সমষ্টিগত বিশ্লেষণ। প্রতিযোগী দোকানের মূল্য সম্পূর্ণ সুরক্ষিত।",
      dismissBtn: "এখনই নয়",
      actionBtn: "অনুমোদন করুন ও পদক্ষেপ নিন",
      defaultInsight: {
        title: "ঠান্ডা পানীয়ের ক্রমবর্ধমান চাহিদার সুযোগ নিন",
        what: "এই সপ্তাহে আপনার ক্লাস্টারে ঠান্ডা পানীয়ের চাহিদা +১৮% উল্লেখযোগ্যভাবে বৃদ্ধি পেয়েছে।",
        why: "দুপুরের গরম এবং বাজারে ক্রেতাদের উপস্থিতির কারণে ঠান্ডা পানীয়ের বিক্রি বেড়েছে।",
        so_what: "আপনার দোকানে এই বিভাগে বিক্রি গড়ের তুলনায় কম; কম্বো অফার দেওয়া দোকানগুলোতে ১৮% বেশি বিক্রি হয়েছে।",
        expected_action: "অবিলম্বে ২ ক্রেট ঠান্ডা পানীয়ের অর্ডার দিন এবং কাউন্টারে ₹৫৫ মূল্যের কম্বো অফার প্রদর্শন করুন।"
      },
    },
    whatsAppModal: {
      title: "হোয়াটসঅ্যাপ মুদি সহকারী সিমুলেটর",
      subtitle: "n8n-এর মাধ্যমে রমেশকে পাঠানো স্বয়ংক্রিয় সতর্কতার লাইভ সিমুলেশন",
      distributorPO: "এক ক্লিকে পাইকারি অর্ডারের রসিদ তৈরি করুন",
      poSuccess: "শর্মাজি হোলসেলার্সকে হোয়াটসঅ্যাপে পারচেজ অর্ডার পাঠানো হয়েছে!"
    },
    clusterMapModal: {
      title: "হাইপারলোকাল ক্লাস্টার গোপনীয়তা ম্যাপ",
      subtitle: "ঘনত্ব অনুসারে ব্যাসার্ধের বিস্তার (1কিমি ➔ 3কিমি ➔ 5কিমি)",
      sliderLabel: "নমুনা বণিক ঘনত্ব (N)",
      shieldActive: "সুরক্ষা সক্রিয়: দল সুরক্ষিত",
      shieldSuppressed: "তথ্য স্থগিত: অপর্যাপ্ত ঘনত্ব (N < 10)"
    }
  }
};
