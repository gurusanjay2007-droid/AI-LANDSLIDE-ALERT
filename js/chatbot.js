/**
 * AI-Based Early Warning & Landslide Risk Monitoring System
 * Landslide AI Assistant - Client Controller & Interactive Engine
 * Module: js/chatbot.js
 */

const LandslideAIChatbot = {
  activeLanguage: "en", // "en" or "ta"
  conversationId: null,
  contextLocationId: "LOC-02", // Default to active sector
  isVoiceActive: false,
  recognition: null,
  isWaitingResponse: false,
  chatHistory: [], // Messages in active session

  // Pre-configured Quick Questions
  quickQuestions: {
    en: [
      "What's the current risk?",
      "Why is this area risky?",
      "Check rainfall",
      "Check soil moisture",
      "Check mountain slope",
      "Show high-risk areas",
      "What should I do during a landslide warning?",
      "Explain the risk score"
    ],
    ta: [
      "தற்போதைய நிலச்சரிவு அபாயம் என்ன?",
      "இந்த பகுதி ஏன் அபாயகரமானது?",
      "மழைப்பொழிவை சரிபார்க்கவும்",
      "மண் ஈரப்பதத்தை சரிபார்க்கவும்",
      "மலைச்சரிவை சரிபார்க்கவும்",
      "அதிக அபாய பகுதிகளைக் காட்டு",
      "எச்சரிக்கையின் போது என்ன செய்ய வேண்டும்?",
      "அபாய மதிப்பெண்ணை விளக்குங்கள்"
    ]
  },

  init() {
    this.conversationId = "CHAT-SES-" + Date.now().toString(36);
    this.initSpeechRecognition();
    this.bindEvents();
    this.renderInitialWelcome();
  },

  initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.activeLanguage === "ta" ? "ta-IN" : "en-US";

      this.recognition.onstart = () => {
        this.isVoiceActive = true;
        this.updateMicUI(true);
      };

      this.recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        const inputEls = [
          document.getElementById("chat-input-text"),
          document.getElementById("floating-chat-input-text")
        ];
        inputEls.forEach(el => {
          if (el) el.value = transcript;
        });
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        this.stopVoiceInput();
      };

      this.recognition.onend = () => {
        this.stopVoiceInput();
      };
    }
  },

  toggleVoiceInput() {
    if (!this.recognition) {
      if (typeof LandslideApp !== "undefined" && LandslideApp.showToast) {
        LandslideApp.showToast("Voice input is not supported in this browser. Please type your question.", "info");
      }
      return;
    }

    if (this.isVoiceActive) {
      this.recognition.stop();
    } else {
      this.recognition.lang = this.activeLanguage === "ta" ? "ta-IN" : "en-US";
      try {
        this.recognition.start();
      } catch (err) {
        console.warn("Recognition start failed:", err);
      }
    }
  },

  stopVoiceInput() {
    this.isVoiceActive = false;
    this.updateMicUI(false);
  },

  updateMicUI(isListening) {
    const micBtns = document.querySelectorAll(".chat-mic-btn");
    micBtns.forEach(btn => {
      if (isListening) {
        btn.classList.add("listening");
        btn.setAttribute("title", "Listening... Speak your question");
      } else {
        btn.classList.remove("listening");
        btn.setAttribute("title", "Click to speak question");
      }
    });
  },

  setLanguage(lang) {
    this.activeLanguage = lang;
    const selectors = document.querySelectorAll(".chatbot-lang-select");
    selectors.forEach(sel => {
      sel.value = lang;
    });

    if (this.chatHistory.length === 0) {
      this.renderInitialWelcome();
    } else {
      const msg = lang === "ta"
        ? "மொழி **தமிழ்** என மாற்றப்பட்டது. இப்போது நீங்கள் தமிழில் கேள்விகளை கேட்கலாம்."
        : "Language switched to **English**. You can now ask questions in English.";
      this.appendAIMessage({
        message: msg,
        sources: ["System"],
        actionButtons: [],
        suggestedQuestions: this.quickQuestions[lang].slice(0, 4)
      });
    }
  },

  bindEvents() {
    // Dedicated View Form Submission
    const mainForm = document.getElementById("chatbot-main-form");
    if (mainForm) {
      mainForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("chat-input-text");
        if (input && input.value.trim()) {
          this.handleUserSubmit(input.value.trim());
          input.value = "";
        }
      });
    }

    // Floating Widget Form Submission
    const floatForm = document.getElementById("floating-chat-form");
    if (floatForm) {
      floatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("floating-chat-input-text");
        if (input && input.value.trim()) {
          this.handleUserSubmit(input.value.trim());
          input.value = "";
        }
      });
    }
  },

  renderInitialWelcome() {
    const isTa = this.activeLanguage === "ta";
    const welcomeText = isTa
      ? "வணக்கம்! நான் **Landslide AI Assistant**.\n\nநிலச்சரிவு அபாயங்கள், மழைப்பொழிவு, மண் ஈரப்பதம், பேரிடர் எச்சரிக்கைகள் மற்றும் பாதுகாப்பு வழிமுறைகள் குறித்து உங்களுக்கு உதவ முடியும்.\n\nநீங்கள் என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?"
      : "Hello! I'm **Landslide AI Assistant**.\n\nI can help you understand landslide risks, environmental conditions, alerts, locations and recommended safety actions.\n\nWhat would you like to know?";

    const initialData = {
      message: welcomeText,
      sources: ["Landslide Knowledge Base"],
      actionButtons: [
        { label: "🗺️ View Live Map", action: "VIEW_MAP" },
        { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" }
      ],
      suggestedQuestions: this.quickQuestions[this.activeLanguage],
      isWelcome: true
    };

    const containers = [
      document.getElementById("chatbot-messages-container"),
      document.getElementById("floating-messages-container")
    ];

    containers.forEach(c => {
      if (c) c.innerHTML = "";
    });

    this.chatHistory = [];
    this.appendAIMessage(initialData);
  },

  async handleUserSubmit(userText) {
    if (!userText || this.isWaitingResponse) return;

    // Append User Message to UI
    this.appendUserMessage(userText);
    this.isWaitingResponse = true;
    this.showTypingIndicator();

    // Get current focused location ID from LandslideApp if present
    if (typeof LandslideApp !== "undefined" && LandslideApp.currentLocationId) {
      this.contextLocationId = LandslideApp.currentLocationId;
    }

    const payload = {
      message: userText,
      location: {
        id: this.contextLocationId
      },
      conversationId: this.conversationId,
      language: this.activeLanguage
    };

    try {
      // 1. Try Backend API Request
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        this.hideTypingIndicator();
        this.appendAIMessage(data);
        if (data.location && data.location.id) {
          this.contextLocationId = data.location.id;
        }
        return;
      }
      throw new Error(`Server returned ${response.status}`);
    } catch (apiErr) {
      console.warn("Backend API unavailable, executing client-side AI inference engine:", apiErr);
      // 2. High-Fidelity Client-Side Fallback Engine (Demo Mode)
      setTimeout(() => {
        this.hideTypingIndicator();
        const clientResponse = this.generateClientSideResponse(userText);
        this.appendAIMessage(clientResponse);
      }, 350);
    } finally {
      this.isWaitingResponse = false;
    }
  },

  generateClientSideResponse(userText) {
    const textLower = userText.toLowerCase().trim();
    const isTa = this.activeLanguage === "ta" || /[\u0B80-\u0BFF]/.test(userText);

    // Guardrail against credential extraction
    if (textLower.includes("api key") || textLower.includes("password") || textLower.includes("secret") || textLower.includes("system prompt")) {
      return {
        message: isTa
          ? "நான் ரகசிய கணினி சான்றுகள் அல்லது கடவுச்சொற்களை வழங்க முடியாது. நிலச்சரிவு மற்றும் வானிலை தரவுகள் பற்றி கேளுங்கள்."
          : "I can't provide credentials, environment variables, or private system information. Please ask about landslide risk and environmental telemetry.",
        intent: "INJECTION_PROBE",
        sources: ["Security Guardrails"],
        actionButtons: [],
        suggestedQuestions: this.quickQuestions[isTa ? "ta" : "en"].slice(0, 3),
        isDemoMode: true
      };
    }

    const locations = (typeof LANDSLIDE_APP_DATA !== "undefined" && LANDSLIDE_APP_DATA.locations)
      ? LANDSLIDE_APP_DATA.locations
      : [];

    // 1. Check if user explicitly asked for a specific location
    let explicitLoc = locations.find(l =>
      textLower.includes(l.name.toLowerCase()) ||
      textLower.includes(l.village.toLowerCase()) ||
      textLower.includes(l.district.toLowerCase()) ||
      (l.state && textLower.includes(l.state.toLowerCase().split(",")[0])) ||
      textLower.includes(l.id.toLowerCase())
    );

    // If user says "this area", "here", "my area", use active context location
    const refersToCurrentArea = textLower.includes("this area") || textLower.includes("here") || textLower.includes("my village") || textLower.includes("my area") || textLower.includes("இந்த பகுதி") || textLower.includes("இங்கு");
    
    let targetLoc = explicitLoc || (refersToCurrentArea ? locations.find(l => l.id === this.contextLocationId) : null);

    if (targetLoc) {
      this.contextLocationId = targetLoc.id;
    }

    // -------------------------------------------------------------
    // A. LOCATION-SPECIFIC QUERIES (When a location is explicitly named or referred to)
    // -------------------------------------------------------------
    if (targetLoc) {
      const locName = targetLoc.name;
      const rain = targetLoc.rainfall_24h_mm || 140;
      const rain7d = targetLoc.rainfall_7d_mm || "N/A";
      const soil = targetLoc.soil_moisture_pct || 80;
      const slope = targetLoc.slope_deg || targetLoc.slope_degrees || 35;
      const elev = targetLoc.elevation_m || 1800;
      const riskProb = targetLoc.risk_probability || 87.2;
      const riskCat = targetLoc.risk_category || "HIGH";
      const hist = targetLoc.historical_incidents || 14;
      const soilType = targetLoc.soil_type || "Lateritic Red Loam";
      const temp = targetLoc.temperature_c || 18.0;
      const humidity = targetLoc.humidity_pct || 90;
      const pore = targetLoc.pore_pressure_kpa || "N/A";

      // 1. Location-specific Rainfall Query
      if (textLower.includes("rain") || textLower.includes("மழை")) {
        const msg = isTa
          ? `🌧️ **மழைப்பொழிவு விவரம் - ${locName} (${targetLoc.district}):**\n\n• **24 மணி நேர மழை:** **${rain} mm** (${rain > 150 ? 'அதி தீவிர கனமழை' : rain > 80 ? 'கனமழை' : 'மிதமான மழை'})\n• **7 நாள் மொத்த மழை:** **${rain7d} mm**\n• **நிலப்பரப்பு சாய்வு:** **${slope}°**\n• **துளை நீர் அழுத்தம்:** **${pore} kPa**\n\n${rain > 100 ? '⚠️ 100 mm க்கும் அதிகமான தொடர்மழை நிலப்பரப்பில் சரிவு அழுத்தத்தை தீவிரமாக உயர்த்துகிறது.' : 'தற்போதைய மழைப்பொழிவு இயல்பு நிலைக்குள் உள்ளது.'}`
          : `🌧️ **Rainfall Telemetry - ${locName} (${targetLoc.district}):**\n\n• **24-Hour Rainfall:** **${rain} mm** (${rain > 150 ? 'Extremely Heavy' : rain > 80 ? 'Heavy Rainfall' : 'Moderate'})\n• **7-Day Cumulative:** **${rain7d} mm**\n• **Terrain Slope:** **${slope}°**\n• **Pore-Water Pressure:** **${pore} kPa**\n\n${rain > 100 ? '⚠️ Persistent rainfall exceeding 100 mm dramatically elevates topsoil pore-water pressure and shear instability.' : 'Precipitation is currently within manageable drainage capacity.'}`;

        return {
          message: msg,
          intent: "LOCATION_RAINFALL",
          location: targetLoc,
          risk: { probability: riskProb, level: riskCat },
          sources: ["IMD Automated Radar", "In-Situ Rain Gauges"],
          actionButtons: [
            { label: "🗺️ View on Map", action: "VIEW_MAP", target: targetLoc.id, lat: targetLoc.lat || targetLoc.latitude, lng: targetLoc.lng || targetLoc.longitude },
            { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT", target: targetLoc.id }
          ],
          suggestedQuestions: [`Soil moisture in ${targetLoc.district}`, `Why is ${targetLoc.village || locName} risky?`, "Show safe areas"],
          isDemoMode: true
        };
      }

      // 2. Location-specific Soil Moisture Query
      if (textLower.includes("soil") || textLower.includes("moisture") || textLower.includes("மண்") || textLower.includes("ஈரப்பதம்")) {
        const msg = isTa
          ? `💧 **மண் ஈரப்பதம் மற்றும் செறிவு - ${locName} (${targetLoc.district}):**\n\n• **மண் ஈரப்பதம்:** **${soil}%** (${soil > 80 ? 'அதி தீவிர செறிவு' : soil > 65 ? 'அதிகம்' : 'பாதுகாப்பானது'})\n• **மண் வகை:** **${soilType}**\n• **துளை நீர் அழுத்தம்:** **${pore} kPa**\n• **உயரம்:** **${elev} m**\n\n${soil > 80 ? '⚠️ அதிக மண் ஈரப்பதம் மண் பிணைப்பை பலவீனப்படுத்தி திரவமாக்கல் (Liquefaction) அபாயத்தை உருவாக்குகிறது.' : 'மண் வடிகால் அமைப்பு சீராக இயங்குகிறது.'}`
          : `💧 **Soil Moisture Telemetry - ${locName} (${targetLoc.district}):**\n\n• **Subsurface Soil Saturation:** **${soil}%** (${soil > 80 ? 'Critical Saturation' : soil > 65 ? 'Elevated' : 'Stable'})\n• **Soil Classification:** **${soilType}**\n• **Pore-Water Pressure:** **${pore} kPa**\n• **Elevation:** **${elev} m**\n\n${soil > 80 ? '⚠️ Critical soil saturation drastically reduces effective shear strength along bedrock slip planes.' : 'Subsurface drainage is currently stable and within baseline limits.'}`;

        return {
          message: msg,
          intent: "LOCATION_SOIL",
          location: targetLoc,
          risk: { probability: riskProb, level: riskCat },
          sources: ["NASA SMAP Soil Probes", "TDR In-Situ Telemetry"],
          actionButtons: [
            { label: "🗺️ View on Map", action: "VIEW_MAP", target: targetLoc.id, lat: targetLoc.lat || targetLoc.latitude, lng: targetLoc.lng || targetLoc.longitude },
            { label: "🔍 Analyze Location", action: "ANALYZE_LOC", target: targetLoc.id }
          ],
          suggestedQuestions: [`Check rainfall in ${targetLoc.district}`, `Why is ${targetLoc.village || locName} risky?`, "What is the current risk?"],
          isDemoMode: true
        };
      }

      // 3. Location-specific Slope & Elevation Query
      if (textLower.includes("slope") || textLower.includes("steep") || textLower.includes("elevation") || textLower.includes("altitude") || textLower.includes("சாய்வு") || textLower.includes("உயரம்")) {
        const msg = isTa
          ? `⛰️ **நிலப்பரப்பு மற்றும் சாய்வு விவரம் - ${locName} (${targetLoc.district}):**\n\n• **சாய்வு கோணம்:** **${slope}°** (${slope > 35 ? 'செங்குத்தான மலைச்சரிவு' : 'மிதமான சரிவு'})\n• **உயரம் (DEM):** **${elev} m**\n• **மண் வகை:** **${soilType}**\n• **முந்தைய நிலச்சரிவுகள்:** **${hist} நிகழ்வுகள்**\n\n30° க்கும் அதிகமான சாய்வு ஈர்ப்பு விசை அழுத்தத்தை அதிகப்படுத்தி நிலச்சரிவு வாய்ப்பை கூட்டுகிறது.`
          : `⛰️ **Topography & Elevation Profile - ${locName} (${targetLoc.district}):**\n\n• **Slope Incline:** **${slope}°** (${slope > 35 ? 'Steep Mountainous Face' : 'Moderate Incline'})\n• **Elevation (SRTM DEM):** **${elev} m**\n• **Soil Matrix:** **${soilType}**\n• **Historical Landslide Density:** **${hist} recorded scars**\n\nSteep gradients above 30° experience intense gravitational shear stress under wet conditions.`;

        return {
          message: msg,
          intent: "LOCATION_TOPOGRAPHY",
          location: targetLoc,
          risk: { probability: riskProb, level: riskCat },
          sources: ["SRTM 30m Digital Elevation Model (NASA)", "Geological Survey of India"],
          actionButtons: [
            { label: "🗺️ View on Map", action: "VIEW_MAP", target: targetLoc.id, lat: targetLoc.lat || targetLoc.latitude, lng: targetLoc.lng || targetLoc.longitude },
            { label: "🔍 Analyze Location", action: "ANALYZE_LOC", target: targetLoc.id }
          ],
          suggestedQuestions: [`Check rainfall in ${targetLoc.district}`, `Is ${targetLoc.village || locName} safe?`, "Show high-risk areas"],
          isDemoMode: true
        };
      }

      // 4. Location-specific Weather / Temperature / Geology Query
      if (textLower.includes("temp") || textLower.includes("weather") || textLower.includes("geology") || textLower.includes("வானிலை") || textLower.includes("வெப்பநிலை")) {
        const msg = isTa
          ? `🌡️ **சுற்றுச்சூழல் & நிலவியல் - ${locName} (${targetLoc.district}):**\n\n• **வெப்பநிலை:** **${temp}°C**\n• **ஈரப்பதம்:** **${humidity}%**\n• **மண் வகை:** **${soilType}**\n• **24h மழை:** **${rain} mm**\n• **மண் ஈரப்பதம்:** **${soil}%**`
          : `🌡️ **Environmental & Geological Telemetry - ${locName} (${targetLoc.district}):**\n\n• **Ambient Temperature:** **${temp}°C**\n• **Relative Humidity:** **${humidity}%**\n• **Lithology / Soil Profile:** **${soilType}**\n• **24h Rainfall:** **${rain} mm**\n• **Soil Moisture:** **${soil}%**`;

        return {
          message: msg,
          intent: "LOCATION_ENVIRONMENT",
          location: targetLoc,
          risk: { probability: riskProb, level: riskCat },
          sources: ["Environmental Telemetry Sensors", "IMD Station Network"],
          actionButtons: [
            { label: "🗺️ View on Map", action: "VIEW_MAP", target: targetLoc.id, lat: targetLoc.lat || targetLoc.latitude, lng: targetLoc.lng || targetLoc.longitude },
            { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT", target: targetLoc.id }
          ],
          suggestedQuestions: [`Check rainfall in ${targetLoc.district}`, "Show safe areas", "What is the current risk?"],
          isDemoMode: true
        };
      }

      // 5. Why is this area risky / Factors
      if (textLower.includes("why") || textLower.includes("factors") || textLower.includes("cause") || textLower.includes("ஏன்") || textLower.includes("காரணம்")) {
        const msg = isTa
          ? `📍 **${locName} (${targetLoc.district})**\n\nஇந்த பகுதி அபாயத்திற்கான முக்கிய காரணங்கள்:\n\n• **கனமழை:** கடந்த 24 மணி நேரத்தில் **${rain} mm** மழை பதிவாகியுள்ளது.\n• **மண் ஈரப்பதம்:** மண் நிறைவுத்தன்மை **${soil}%** ஆக உயர்ந்துள்ளது.\n• **செங்குத்தான சாய்வு:** நிலப்பரப்பு **${slope}°** சாய்வு கொண்டுள்ளதால் ஈர்ப்பு விசை அழுத்தம் அதிகம்.\n• **வரலாற்று பதிவுகள்:** முந்தைய ${hist} நிலச்சரிவு நிகழ்வுகள் பதிவாகியுள்ளன.\n\nகணக்கிடப்பட்ட அபாய நிகழ்தகவு: **${riskProb}% (${riskCat})**.`
          : `📍 **Why ${locName} is Risky:**\n\nThe risk is high mainly because of persistent heavy rainfall (**${rain} mm**), elevated soil moisture (**${soil}%**), and steep terrain (**${slope}°** slope). Historical landslide activity (${hist} recorded scars) also contributes to the model score.\n\n**Current Model Probability:** **${riskProb}% (${riskCat})**`;

        return {
          message: msg,
          intent: "RISK_FACTORS",
          risk: { probability: riskProb, level: riskCat },
          location: targetLoc,
          sources: ["Sentinel-1 InSAR & DEM", "IMD Doppler Radar", "LS-Ensemble AI Model"],
          actionButtons: [
            { label: "🗺️ View on Map", action: "VIEW_MAP", target: targetLoc.id, lat: targetLoc.lat || targetLoc.latitude, lng: targetLoc.lng || targetLoc.longitude },
            { label: "🔍 Analyze This Location", action: "ANALYZE_LOC", target: targetLoc.id },
            { label: "📢 Submit Citizen Report", action: "SUBMIT_REPORT" }
          ],
          explanationCard: {
            title: `WHY THIS AREA IS RISKY: ${locName}`,
            rainfall: { label: "Rainfall", value: `${rain} mm`, level: rain > 100 ? "High" : "Moderate" },
            soil: { label: "Soil Moisture", value: `${soil}%`, level: soil > 75 ? "Critical" : "Moderate" },
            slope: { label: "Slope Steepness", value: `${slope}°`, level: slope > 30 ? "Steep" : "Moderate" },
            history: { label: "Historical Scars", value: `${hist} scars`, level: "High" },
            risk_score: `${riskProb}%`,
            category: riskCat
          },
          suggestedQuestions: [
            `Check rainfall in ${targetLoc.district}`,
            "What should I do during a landslide warning?",
            "Show high-risk areas"
          ],
          isDemoMode: true
        };
      }

      // 6. Default Location Overview & Status
      const msg = isTa
        ? `📍 **${locName} (${targetLoc.district})** பகுதி நிலச்சரிவு அபாய மதிப்பீடு:\n\nஅபாய நிலை: **${riskCat}** (${riskProb}%)\n\n• 24 மணி நேர மழை: **${rain} mm**\n• மண் ஈரப்பதம்: **${soil}%**\n• நிலப்பரப்பு சாய்வு: **${slope}°**\n• உயரம்: **${elev} m**\n• மண் வகை: **${soilType}**\n\n**பரிந்துரை:** ${riskProb > 60 ? 'உடனடி எச்சரிக்கையுடன் இருக்கவும்; உள்ளூர் பேரிடர் மேலாண்மை வழிகாட்டுதல்களைப் பின்பற்றவும்.' : 'தற்போதைய நிலை பாதுகாப்பாக உள்ளது.'}`
        : `📍 **${locName} (${targetLoc.district})** currently has a **${riskCat}** landslide risk.\n\n**Risk probability:** **${riskProb}%**\n**Rainfall (24h):** ${rain} mm\n**Soil moisture:** ${soil}%\n**Slope:** ${slope}°\n**Elevation:** ${elev} m\n**Soil Type:** ${soilType}\n\n**Recommendation:** ${riskProb > 60 ? 'Exercise elevated caution. Avoid travel through steep ghat sections and follow local emergency guidance.' : 'Conditions are currently within stable baseline parameters.'}`;

      return {
        message: msg,
        intent: "LOCATION_RISK",
        risk: { probability: riskProb, level: riskCat },
        location: targetLoc,
        sources: ["Sentinel-1 InSAR Telemetry", "LS-Ensemble AI Model"],
        actionButtons: [
          { label: "🗺️ View on Map", action: "VIEW_MAP", target: targetLoc.id, lat: targetLoc.lat || targetLoc.latitude, lng: targetLoc.lng || targetLoc.longitude },
          { label: "🔍 Analyze Location", action: "ANALYZE_LOC", target: targetLoc.id },
          { label: "📢 Submit Citizen Report", action: "SUBMIT_REPORT" }
        ],
        suggestedQuestions: [
          `Why is ${targetLoc.village || targetLoc.district} risky?`,
          `Check rainfall in ${targetLoc.district}`,
          "Show high-risk areas"
        ],
        isDemoMode: true
      };
    }

    // -------------------------------------------------------------
    // B. GENERAL / SYSTEM-WIDE QUESTIONS (No specific location targeted)
    // -------------------------------------------------------------

    // 1. List All Monitored Locations
    if (textLower.includes("all locations") || textLower.includes("list locations") || textLower.includes("show locations") || textLower.includes("what locations") || textLower.includes("எல்லா பகுதிகள்")) {
      const bullets = locations.map(s => {
        return `• **${s.name}** (${s.district}, ${s.state}) - **${s.risk_category || 'MODERATE'}** (${s.risk_probability || 50}%) | Rain: ${s.rainfall_24h_mm} mm | Soil: ${s.soil_moisture_pct}%`;
      }).join("\n");

      const msg = isTa
        ? `📍 **கண்காணிக்கப்படும் அனைத்து ${locations.length} பகுதிகள்:**\n\n${bullets}\n\nகுறிப்பிட்ட பகுதியின் விவரத்தை அறிய அதன் பெயரைத் தட்டச்சு செய்யவும்.`
        : `📍 **All Monitored Early Warning Stations (${locations.length} Stations Active):**\n\n${bullets}\n\nYou can ask about any individual station (e.g. *"What is the risk in Kotagiri?"* or *"Rainfall in Darjeeling"*).`;

      return {
        message: msg,
        intent: "LIST_LOCATIONS",
        sources: ["Geospatial Monitoring Database"],
        actionButtons: [
          { label: "🗺️ Open Live Risk Map", action: "VIEW_MAP" },
          { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" }
        ],
        suggestedQuestions: ["Show high-risk areas", "Show areas with less rainfall", "What is the current risk?"],
        isDemoMode: true
      };
    }

    // 2. Low / Less / Minimum Rainfall Query
    const isLowRainQuery = (textLower.includes("less") || textLower.includes("low") || textLower.includes("lowest") || textLower.includes("least") || textLower.includes("minimum") || textLower.includes("safe rain") || textLower.includes("குறைந்த") || textLower.includes("குறைவான")) && (textLower.includes("rain") || textLower.includes("மழை"));

    if (isLowRainQuery) {
      const sortedByRainAsc = [...locations].sort((a, b) => (a.rainfall_24h_mm || 0) - (b.rainfall_24h_mm || 0));
      const lowSectors = sortedByRainAsc.slice(0, 4);
      
      const bullets = lowSectors.map(s => 
        `• **${s.name} (${s.district})**: **${s.rainfall_24h_mm} mm** (${s.risk_category} - ${s.risk_probability}%)`
      ).join("\n");

      const msg = isTa
        ? `🌧️ **குறைந்த மழை பதிவான பகுதிகள் (Lowest Rainfall Sectors):**\n\n${bullets}\n\nஇந்த பகுதிகளில் மழைப்பொழிவு 70 mm வரம்பிற்குள் உள்ளதால் மண் நிறைவுத்தன்மை மற்றும் உடனடி சரிவு அபாயம் குறைவாக உள்ளது.`
        : `🌧️ **Lowest / Safe Rainfall Sectors (24h Cumulative):**\n\n${bullets}\n\n**Analysis:** In these sectors, cumulative precipitation remains well below critical infiltration thresholds (100 mm), maintaining lower pore-water pressure and stable slope conditions.`;

      return {
        message: msg,
        intent: "RAINFALL_LOW",
        sources: ["IMD Automated Weather Radar & In-Situ Rain Gauges"],
        actionButtons: [
          { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" },
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" }
        ],
        suggestedQuestions: ["Check highest rainfall", "Show safe areas", "What is the current risk?"],
        isDemoMode: true
      };
    }

    // 3. General or High Rainfall Query
    if (textLower.includes("rain") || textLower.includes("மழை")) {
      const sortedByRainDesc = [...locations].sort((a, b) => (b.rainfall_24h_mm || 0) - (a.rainfall_24h_mm || 0));
      const avgRain = Math.round(locations.reduce((acc, l) => acc + (l.rainfall_24h_mm || 0), 0) / Math.max(1, locations.length));
      const topRainSectors = sortedByRainDesc.slice(0, 4);
      const lowRainSectors = [...locations].sort((a, b) => (a.rainfall_24h_mm || 0) - (b.rainfall_24h_mm || 0)).slice(0, 3);

      const highBullets = topRainSectors.map(s => `• **${s.name} (${s.district})**: **${s.rainfall_24h_mm} mm** (${s.rainfall_24h_mm > 150 ? 'Extreme' : 'Heavy'})`).join("\n");
      const lowBullets = lowRainSectors.map(s => `• **${s.name} (${s.district})**: **${s.rainfall_24h_mm} mm**`).join("\n");

      const msg = isTa
        ? `🌧️ **அமைப்பின் நேரலை மழைப்பொழிவு விவரம்:**\n\nகண்காணிக்கப்படும் அனைத்து நிலையங்களின் சராசரி 24 மணி நேர மழைப்பொழிவு: **${avgRain} mm**.\n\n**அதிக மழை பதிவான பகுதிகள்:**\n${highBullets}\n\n**குறைந்த மழை பதிவான பகுதிகள்:**\n${lowBullets}`
        : `🌧️ **System-Wide 24h Rainfall Telemetry:**\n\nThe current regional average rainfall across monitored stations is **${avgRain} mm**.\n\n**Highest Recorded Rainfall Readings:**\n${highBullets}\n\n**Lowest Recorded Rainfall:**\n${lowBullets}\n\nPersistent rainfall above 100 mm dramatically elevates topsoil pore-water pressure.`;

      return {
        message: msg,
        intent: "RAINFALL",
        sources: ["IMD Automated Weather Radar & In-Situ Rain Gauges"],
        actionButtons: [
          { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" },
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" }
        ],
        suggestedQuestions: ["Show areas with less rainfall", "Check soil moisture", "What is the current risk?"],
        isDemoMode: true
      };
    }

    // 4. Low Soil Moisture Query
    const isLowSoilQuery = (textLower.includes("less") || textLower.includes("low") || textLower.includes("lowest") || textLower.includes("least") || textLower.includes("dry") || textLower.includes("குறைந்த")) && (textLower.includes("soil") || textLower.includes("moisture") || textLower.includes("மண்") || textLower.includes("ஈரப்பதம்"));

    if (isLowSoilQuery) {
      const sortedBySoilAsc = [...locations].sort((a, b) => (a.soil_moisture_pct || 0) - (b.soil_moisture_pct || 0));
      const lowSoilSectors = sortedBySoilAsc.slice(0, 4);
      const bullets = lowSoilSectors.map(s => `• **${s.name} (${s.district})**: **${s.soil_moisture_pct}%** (${s.soil_type || 'Loam'})`).join("\n");

      const msg = isTa
        ? `💧 **குறைந்த மண் ஈரப்பதம் உள்ள பகுதிகள் (Lowest Soil Moisture Zones):**\n\n${bullets}\n\nஇந்த பகுதிகளில் மண் நிறைவுத்தன்மை 60% க்கும் குறைவாக உள்ளதால் மண் பிணைப்பு பாதுகாப்பான நிலையில் உள்ளது.`
        : `💧 **Lowest Subsurface Soil Saturation Zones:**\n\n${bullets}\n\n**Analysis:** Subsurface soil saturation below 60% maintains stable inter-particle cohesion and low pore pressure.`;

      return {
        message: msg,
        intent: "SOIL_MOISTURE_LOW",
        sources: ["NASA SMAP Telemetry & In-Situ TDR Soil Probes"],
        actionButtons: [
          { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" },
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" }
        ],
        suggestedQuestions: ["Show safe areas", "Check rainfall", "What is the current risk?"],
        isDemoMode: true
      };
    }

    // 5. General Soil Moisture Question
    if (textLower.includes("soil") || textLower.includes("moisture") || textLower.includes("மண்") || textLower.includes("ஈரப்பதம்")) {
      const avgSoil = Math.round(locations.reduce((acc, l) => acc + (l.soil_moisture_pct || 0), 0) / Math.max(1, locations.length));
      const sortedSoilDesc = [...locations].sort((a, b) => (b.soil_moisture_pct || 0) - (a.soil_moisture_pct || 0));
      const highSoilSectors = sortedSoilDesc.slice(0, 4);
      const lowSoilSectors = [...locations].sort((a, b) => (a.soil_moisture_pct || 0) - (b.soil_moisture_pct || 0)).slice(0, 3);

      const highSoilBullets = highSoilSectors.map(s => `• **${s.name} (${s.district})**: **${s.soil_moisture_pct}%** (${s.soil_moisture_pct > 80 ? 'Critical' : 'High'})`).join("\n");
      const lowSoilBullets = lowSoilSectors.map(s => `• **${s.name} (${s.district})**: **${s.soil_moisture_pct}%**`).join("\n");

      const msg = isTa
        ? `💧 **அமைப்பின் மண் ஈரப்பதம் மற்றும் செறிவு நிலை:**\n\nகண்காணிக்கப்படும் பகுதிகளின் சராசரி மண் ஈரப்பதம்: **${avgSoil}%**.\n\n**அதி தீவிர செறிவுள்ள பகுதிகள் (>80% Saturation):**\n${highSoilBullets}\n\n**குறைந்த செறிவுள்ள பகுதிகள்:**\n${lowSoilBullets}`
        : `💧 **Subsurface Soil Moisture Saturation Across Monitored Sectors:**\n\nThe regional average soil moisture is currently **${avgSoil}%**.\n\n**Critically Saturated Zones (>80% Saturation):**\n${highSoilBullets}\n\n**Lowest Saturation Zones:**\n${lowSoilBullets}`;

      return {
        message: msg,
        intent: "SOIL_MOISTURE",
        sources: ["NASA SMAP Telemetry & In-Situ TDR Soil Probes"],
        actionButtons: [
          { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" },
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" }
        ],
        suggestedQuestions: ["Show areas with less rainfall", "What is the current risk?", "Show high-risk areas"],
        isDemoMode: true
      };
    }

    // 6. Safe / Low Risk Areas Query
    const isSafeAreasQuery = textLower.includes("safe") || textLower.includes("low risk") || textLower.includes("least risk") || textLower.includes("safest") || textLower.includes("பாதுகாப்பான");

    if (isSafeAreasQuery && !textLower.includes("warning")) {
      const sortedByRiskAsc = [...locations].sort((a, b) => (a.risk_probability || 0) - (b.risk_probability || 0));
      const safeSectors = sortedByRiskAsc.slice(0, 4);
      const bullets = safeSectors.map(s => `• **${s.name} (${s.district})**: **${s.risk_category} (${s.risk_probability}%)** - Rain: ${s.rainfall_24h_mm} mm, Slope: ${s.slope_deg || s.slope_degrees}°`).join("\n");

      const msg = isTa
        ? `🛡️ **குறைந்த / மிதமான அபாயமுள்ள பாதுகாப்பான பகுதிகள்:**\n\n${bullets}\n\nஇந்த பகுதிகளில் குறைந்த மழைப்பொழிவு மற்றும் மிதமான சாய்வு உள்ளதால் இயல்பு நிலை தொடர்கிறது.`
        : `🛡️ **Currently Identified Low & Moderate Risk Sectors:**\n\n${bullets}\n\n**Summary:** These zones exhibit low-to-moderate slope gradients, well-drained soil profiles, and 24h rainfall well within baseline thresholds.`;

      return {
        message: msg,
        intent: "SAFE_AREAS",
        sources: ["Live Geospatial Susceptibility Model"],
        actionButtons: [
          { label: "🗺️ Open Live Risk Map", action: "VIEW_MAP" },
          { label: "📊 Open Dashboard", action: "VIEW_DASHBOARD" }
        ],
        suggestedQuestions: ["Show high-risk areas", "Check rainfall", "Explain the risk score"],
        isDemoMode: true
      };
    }

    // 7. High Risk Areas Question
    if (textLower.includes("high-risk") || textLower.includes("critical") || textLower.includes("zones") || textLower.includes("high risk") || textLower.includes("dangerous") || textLower.includes("which areas") || textLower.includes("அபாய பகுதிகள்") || textLower.includes("எந்த பகுதி")) {
      const sortedByRiskDesc = [...locations].sort((a, b) => (b.risk_probability || 0) - (a.risk_probability || 0));
      const criticalOrHigh = sortedByRiskDesc.filter(l => l.risk_category === "CRITICAL" || l.risk_category === "HIGH" || l.risk_probability >= 60);
      const topCriticalList = (criticalOrHigh.length > 0 ? criticalOrHigh : sortedByRiskDesc).slice(0, 5);
      
      const bullets = topCriticalList.map(s => 
        `• **${s.name} (${s.district})**: **${s.risk_category} (${s.risk_probability}%)** - Rain: ${s.rainfall_24h_mm} mm, Slope: ${s.slope_deg || s.slope_degrees}°`
      ).join("\n");

      const msg = isTa
        ? `⚠️ **தற்போது அமைப்பில் கண்டறியப்பட்ட தீவிர அபாய மண்டலங்கள் (${criticalOrHigh.length} பகுதிகள்):**\n\n${bullets}\n\nநேரலை வரைபடத்தில் இவற்றின் எல்லைகளை விரிவாகப் பார்வையிடலாம்.`
        : `⚠️ Currently, the early warning system identifies **${criticalOrHigh.length} high & critical-risk zones** across monitored sectors:\n\n${bullets}\n\nYou can open the Live Risk Map to view their real-time spatial heatmaps and perimeter alerts.`;

      return {
        message: msg,
        intent: "HIGH_RISK_AREAS",
        sources: ["Live Geospatial Aggregator & Early Warning Engine"],
        actionButtons: [
          { label: "🗺️ Open Live Risk Map", action: "VIEW_MAP" },
          { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" }
        ],
        suggestedQuestions: ["Why is this area risky?", "What should I do during a warning?", "Check rainfall"],
        isDemoMode: true
      };
    }

    // 8. Alerts Question
    if (textLower.includes("alert") || textLower.includes("warning") || textLower.includes("bulletin") || textLower.includes("எச்சரிக்கை")) {
      const activeAlerts = (typeof LANDSLIDE_APP_DATA !== "undefined" && LANDSLIDE_APP_DATA.alerts) ? LANDSLIDE_APP_DATA.alerts : [];
      const alertBullets = activeAlerts.slice(0, 3).map((a, idx) => 
        `${idx + 1}. **${a.level || a.alert_level || 'WARNING'}: ${a.location || a.location_name}**\n• Trigger: ${a.trigger || a.trigger_reason || 'Elevated saturation'}\n• Action: ${a.action || a.recommended_action || 'Follow local authorities'}`
      ).join("\n\n");

      const msg = isTa
        ? `🚨 **செயலில் உள்ள பேரிடர் எச்சரிக்கைகள் (${activeAlerts.length} எச்சரிக்கைகள்):**\n\n${alertBullets}\n\nஉள்ளூர் பேரிடர் மேலாண்மை வழிகாட்டுதல்களை உடனே பின்பற்றவும்.`
        : `🚨 **Active Early Warning Disaster Bulletins (${activeAlerts.length} Active):**\n\n${alertBullets}\n\nPlease follow instructions issued by District Disaster Management Authorities.`;

      return {
        message: msg,
        intent: "ALERTS",
        sources: ["NDMA Common Alerting Protocol (CAP-IN v1.2)"],
        actionButtons: [
          { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" },
          { label: "🗺️ View on Map", action: "VIEW_MAP" }
        ],
        suggestedQuestions: ["What's the current risk?", "Show high-risk areas", "What should I do during a landslide warning?"],
        isDemoMode: true
      };
    }

    // 9. Safety / Emergency / Cracks Question
    if (textLower.includes("crack") || textLower.includes("danger") || textLower.includes("evacuate") || textLower.includes("safety") || textLower.includes("what should i do") || textLower.includes("பாதுகாப்பு") || textLower.includes("விரிசல்") || textLower.includes("ஆபத்து")) {
      const msg = isTa
        ? `🛡️ **முக்கிய நிலச்சரிவு பாதுகாப்பு நெறிமுறைகள்:**\n\n1. **உடனடி நடவடிக்கை:** நீங்கள் உடனடி ஆபத்தில் இருந்தாலோ அல்லது நிலத்தில் புதிய விரிசல்கள் கண்டாலோ, உடனடியாக செங்குத்தான சரிவுகளில் இருந்து விலகி பாதுகாப்பான உயரமான இடத்திற்குச் செல்லவும்.\n2. **அதிகாரப்பூர்வ உத்தரவுகள்:** மாவட்ட நிர்வாகம் மற்றும் NDRF/SDRF வழிகாட்டுதல்களைப் பின்பற்றவும்.\n3. **பயணங்களை தவிர்க்கவும்:** சிவப்பு எச்சரிக்கை (Red Alert) உள்ள பகுதிகளில் மலைப்பாதை (Ghat Road) பயணங்களை தவிர்க்கவும்.\n4. **அவதானிப்பை தெரிவிக்க:** நீங்கள் விரிசல்களைக் கண்டால் 'Citizen Reporting' மூலம் புகைப்படத்துடன் தகவல் தெரிவிக்கலாம்.\n\n⚠️ *அவசர உதவிக்கு 112 அல்லது மாநில பேரிடர் கட்டுப்பாட்டு அறையை அழைக்கவும். இந்த AI உதவியாளர் அவசர மீட்புப் படையினருக்கு மாற்றாகாது.*`
        : `🛡️ **If a landslide warning is issued or you are in an affected zone:**\n\n1. **Immediate Safety:** If you are in immediate danger or observe fresh ground cracks or sudden muddy water from slopes, move to a safer location away from steep slopes and follow instructions from local emergency authorities.\n2. **Avoid Travel:** Do not drive or walk through steep mountain passes, ghat corridors, or over flooded culverts.\n3. **Stay Informed:** Monitor official radio broadcasts and district disaster warning bulletins.\n4. **Log Precursor Signs:** You can log photos and observations via our Citizen Reporting module.\n\n⚠️ *Important: In an emergency, dial 112 immediately. This system provides advisory intelligence and does not replace emergency responders.*`;

      return {
        message: msg,
        intent: "SAFETY",
        sources: ["National Disaster Management Authority (NDMA Guidelines)"],
        actionButtons: [
          { label: "📢 Submit Citizen Report", action: "SUBMIT_REPORT" },
          { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" }
        ],
        suggestedQuestions: ["What's the current risk?", "Show high-risk areas", "Explain the risk score"],
        isDemoMode: true
      };
    }

    // 10. General Mountain Slope Telemetry Query
    if (textLower.includes("slope") || textLower.includes("steep") || textLower.includes("gradient") || textLower.includes("சாய்வு") || textLower.includes("மலைச்சரிவு")) {
      const avgSlope = Math.round((locations.reduce((acc, l) => acc + (l.slope_deg || l.slope_degrees || 0), 0) / Math.max(1, locations.length)) * 10) / 10;
      const sortedSlopeDesc = [...locations].sort((a, b) => (b.slope_deg || b.slope_degrees || 0) - (a.slope_deg || a.slope_degrees || 0));
      const topSteep = sortedSlopeDesc.slice(0, 4);
      const gentleSlopes = [...locations].sort((a, b) => (a.slope_deg || a.slope_degrees || 0) - (b.slope_deg || b.slope_degrees || 0)).slice(0, 3);

      const steepBullets = topSteep.map(s => `• **${s.name} (${s.district})**: **${s.slope_deg || s.slope_degrees}°** (${(s.slope_deg || s.slope_degrees) > 38 ? 'Extreme Escarpment' : 'Steep Face'})`).join("\n");
      const gentleBullets = gentleSlopes.map(s => `• **${s.name} (${s.district})**: **${s.slope_deg || s.slope_degrees}°** (Gentle/Moderate)`).join("\n");

      const msg = isTa
        ? `⛰️ **அமைப்பின் நிலப்பரப்பு சாய்வு கோணங்கள் (Slope Telemetry):**\n\nகண்காணிக்கப்படும் அனைத்து நிலையங்களின் சராசரி சாய்வு கோணம்: **${avgSlope}°**.\n\n**அதி தீவிர செங்குத்தான சரிவுகள் (>35°):**\n${steepBullets}\n\n**குறைவான / மிதமான சாய்வுள்ள பகுதிகள் (<30°):**\n${gentleBullets}\n\n30° க்கும் அதிகமான சாய்வு கொண்ட மலைப்பகுதிகளில் மழை நீர் ஊடுருவும் போது ஈர்ப்பு விசை அழுத்தம் அதிகரிக்கிறது.`
        : `⛰️ **System-Wide Mountain Slope Telemetry (NASA SRTM DEM):**\n\nThe regional average slope across monitored stations is **${avgSlope}°**.\n\n**Steepest Mountain Slopes (>35° Incline):**\n${steepBullets}\n\n**Gentlest / Stable Slope Zones (<30°):**\n${gentleBullets}\n\nTerrain gradients exceeding 30° significantly amplify gravitational shear stresses when saturated by monsoon rains.`;

      return {
        message: msg,
        intent: "SLOPE",
        sources: ["SRTM 30m Digital Elevation Model (NASA)", "Geological Survey of India"],
        actionButtons: [
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" },
          { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" }
        ],
        suggestedQuestions: ["Check rainfall", "Show high-risk areas", "What is the current risk?"],
        isDemoMode: true
      };
    }

    // 11. General Elevation Query
    if (textLower.includes("elevation") || textLower.includes("altitude") || textLower.includes("height") || textLower.includes("உயரம்")) {
      const sortedElev = [...locations].sort((a, b) => (b.elevation_m || 0) - (a.elevation_m || 0));
      const elevBullets = sortedElev.slice(0, 5).map(s => `• **${s.name} (${s.district})**: **${s.elevation_m} m** (Slope: ${s.slope_deg || s.slope_degrees}°)`).join("\n");

      const msg = isTa
        ? `📍 **கண்காணிக்கப்படும் உயரமான பகுதிகள் (Top Elevations):**\n\n${elevBullets}`
        : `📍 **Highest Elevation Monitored Sectors (SRTM DEM):**\n\n${elevBullets}`;

      return {
        message: msg,
        intent: "ELEVATION",
        sources: ["SRTM 30m Digital Elevation Model (NASA)"],
        actionButtons: [
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" },
          { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" }
        ],
        suggestedQuestions: ["Check slope", "Check rainfall", "What is the current risk?"],
        isDemoMode: true
      };
    }

    // 12. Explain Risk Score Question
    if (textLower.includes("explain") || textLower.includes("mean") || textLower.includes("score") || textLower.includes("விளக்கம்") || textLower.includes("மதிப்பெண்")) {
      const msg = isTa
        ? `📊 **அபாய மதிப்பெண் விளக்கம் (Model Risk Score):**\n\nஇந்த அமைப்பில் அபாய மதிப்பெண் (0-100%) என்பது மாதிரி அடிப்படையிலான ஒரு கணக்கீடு ஆகும்:\n\n• **24h மழைப்பொழிவு (32% எடை):** நீரின் அளவு மற்றும் ஊடுருவல்\n• **மண் ஈரப்பதம் (24% எடை):** மண்ணின் நீர் செறிவு மற்றும் துளை நீர் அழுத்தம்\n• **நிலப்பரப்பு சாய்வு (18% எடை):** SRTM DEM மூலம் கணக்கிடப்பட்ட சாய்வு கோணம்\n• **உயரம் மற்றும் நிலவியல் (16% எடை):** பாறை அமைப்பு மற்றும் NDVI தாவர அடர்த்தி\n• **வரலாற்று நிகழ்வுகள் (10% எடை):** முந்தைய நிலச்சரிவு பதிவுகள்\n\n80% க்கும் அதிகமான மதிப்பெண் **CRITICAL** அபாயத்தைக் குறிக்கிறது, இது நிலச்சரிவு ஏற்படுவதற்கான அதிக வாய்ப்பைக் காட்டுகிறது.`
        : `📊 **Risk Score Explanation & Methodology:**\n\nA landslide risk score (e.g. 87%) indicates a **CRITICAL** hazard classification in this monitoring system.\n\nIt is a model-based estimate derived from weighted multi-source parameters:\n• **24h & Cumulative Rainfall (32% weight)**: Infiltration and percolation\n• **Subsurface Soil Moisture (24% weight)**: Saturation degree and pore-water pressure\n• **Slope Steepness from SRTM DEM (18% weight)**: Gravitational shear stress\n• **Historical Incident Density (10% weight)**: Past landslide scar frequency\n• **Geology & NDVI Vegetation Index (16% weight)**\n\n*Note: The score reflects calculated physical susceptibility and environmental triggers, not an absolute certainty of failure.*`;

      return {
        message: msg,
        intent: "EXPLAIN_SCORE",
        sources: ["LS-Ensemble Geotechnical Weighting Matrix"],
        actionButtons: [
          { label: "🧠 Open AI Prediction Model", action: "VIEW_PREDICTION" },
          { label: "🗺️ View on Map", action: "VIEW_MAP" }
        ],
        suggestedQuestions: ["What's the current risk?", "Show high-risk areas", "Check rainfall"],
        isDemoMode: true
      };
    }

    // 11. General Current Risk Overview (System-Wide - Dynamically computed from database)
    const sortedByRisk = [...locations].sort((a, b) => (b.risk_probability || 0) - (a.risk_probability || 0));
    const topZones = sortedByRisk.slice(0, 4);
    const critCount = locations.filter(l => l.risk_category === "CRITICAL" || l.risk_probability >= 80).length;
    const highCount = locations.filter(l => l.risk_category === "HIGH" || (l.risk_probability >= 60 && l.risk_probability < 80)).length;
    const peakProb = sortedByRisk[0]?.risk_probability || 87.2;

    const topBullets = topZones.map(s => 
      `• **${s.name} (${s.district})**: **${s.risk_category} (${s.risk_probability}%)** - Rain: ${s.rainfall_24h_mm} mm`
    ).join("\n");

    const overallMsg = isTa
      ? `The current system risk level is **HIGH**, with a peak risk probability of **${peakProb}%** across monitored sectors.\n\nதற்போது **${critCount + highCount} தீவிர அபாய பகுதிகள்** கண்காணிக்கப்பட்டு வருகின்றன.\n\n**முக்கிய அபாய பகுதிகள்:**\n${topBullets}\n\nகுறிப்பிட்ட கிராமம் அல்லது மாவட்டத்தின் நிலையை அறிய *'What is the risk in Kotagiri?'* அல்லது *'Rainfall in Wayanad'* என்று கேட்கலாம்.`
      : `The current system risk level is **HIGH**, with an overall calculated peak risk probability of **${peakProb}%** across monitored zones.\n\nCurrently, the system monitors **${critCount} Critical** and **${highCount} High Risk** zones.\n\n**Top Vulnerable Sectors:**\n${topBullets}\n\nYou can ask about a specific sector (e.g. *"What is the risk in Kotagiri?"* or *"Rainfall in Wayanad"*) or explore the Live Risk Map.`;

    return {
      message: overallMsg,
      intent: "CURRENT_RISK",
      risk: { probability: peakProb, level: "HIGH" },
      sources: ["Sentinel-1 InSAR & IMD Telemetry", "LS-Ensemble AI Model"],
      actionButtons: [
        { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" },
        { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" },
        { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" }
      ],
      suggestedQuestions: [
        "Show areas with less rainfall",
        "Check soil moisture",
        "Show high-risk areas",
        "What should I do during a landslide warning?"
      ],
      isDemoMode: true
    };


    return {
      message: overallMsg,
      intent: "CURRENT_RISK",
      risk: { probability: 87.2, level: "HIGH" },
      sources: ["Sentinel-1 InSAR & IMD Telemetry", "LS-Ensemble AI Model"],
      actionButtons: [
        { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" },
        { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" },
        { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" }
      ],
      suggestedQuestions: [
        "Why is this area risky?",
        "Check rainfall",
        "Check soil moisture",
        "Show high-risk areas",
        "What should I do during a landslide warning?"
      ],
      isDemoMode: true
    };
  },


  appendUserMessage(text) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userRow = document.createElement("div");
    userRow.className = "chat-msg-row user";
    userRow.innerHTML = `
      <div class="msg-avatar">👤</div>
      <div>
        <div class="msg-content-bubble">${this.escapeHTML(text)}</div>
        <span class="msg-timestamp">${timeStr}</span>
      </div>
    `;

    this.appendToAllChatContainers(userRow);
    this.chatHistory.push({ sender: "user", text, time: timeStr });
  },

  appendAIMessage(data) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const aiRow = document.createElement("div");
    aiRow.className = "chat-msg-row ai";

    let formattedText = this.formatMarkdown(data.message || "");

    // Explanation card HTML if provided
    let explanationHtml = "";
    if (data.explanationCard) {
      const card = data.explanationCard;
      explanationHtml = `
        <div class="ai-explanation-card">
          <div class="ai-explanation-title">
            <span>${this.escapeHTML(card.title || "AI RISK FACTOR ANALYSIS")}</span>
            <span class="risk-badge ${card.category || 'HIGH'}" style="font-size:0.65rem;">${card.risk_score || ''}</span>
          </div>
          <div class="ai-factors-grid">
            <div class="ai-factor-item">
              <div class="ai-factor-label">🌧️ Rainfall (24h)</div>
              <div class="ai-factor-val"><span>${card.rainfall?.value || 'N/A'}</span> <span style="color:#ef4444; font-size:0.7rem;">${card.rainfall?.level || ''}</span></div>
            </div>
            <div class="ai-factor-item">
              <div class="ai-factor-label">💧 Soil Moisture</div>
              <div class="ai-factor-val"><span>${card.soil?.value || 'N/A'}</span> <span style="color:#ef4444; font-size:0.7rem;">${card.soil?.level || ''}</span></div>
            </div>
            <div class="ai-factor-item">
              <div class="ai-factor-label">⛰️ Slope Gradient</div>
              <div class="ai-factor-val"><span>${card.slope?.value || 'N/A'}</span> <span style="color:#f59e0b; font-size:0.7rem;">${card.slope?.level || ''}</span></div>
            </div>
            <div class="ai-factor-item">
              <div class="ai-factor-label">📍 Historical Scars</div>
              <div class="ai-factor-val"><span>${card.history?.value || 'N/A'}</span> <span style="color:#475569; font-size:0.7rem;">${card.history?.level || ''}</span></div>
            </div>
          </div>
        </div>
      `;
    }

    // Action buttons HTML
    let actionButtonsHtml = "";
    if (data.actionButtons && data.actionButtons.length > 0) {
      const btnTags = data.actionButtons.map(btn => {
        return `<button class="chat-action-btn" onclick="LandslideAIChatbot.handleActionClick('${btn.action}', '${btn.target || ''}', ${btn.lat || 'null'}, ${btn.lng || 'null'})">${btn.label}</button>`;
      }).join("");
      actionButtonsHtml = `<div class="chat-action-buttons">${btnTags}</div>`;
    }

    // Suggested Questions Chips
    let suggestionsHtml = "";
    if (data.suggestedQuestions && data.suggestedQuestions.length > 0) {
      const chips = data.suggestedQuestions.map(q => {
        return `<button class="quick-q-btn" onclick="LandslideAIChatbot.handleQuickQuestion('${this.escapeQuotes(q)}')">${q}</button>`;
      }).join("");
      suggestionsHtml = `
        <div style="margin-top: 0.85rem; font-size: 0.725rem; font-weight: 700; color: #64748b;">Suggested Questions:</div>
        <div class="quick-questions-wrapper">${chips}</div>
      `;
    }

    // Sources tag
    let sourcesTag = "";
    if (data.sources && data.sources.length > 0) {
      sourcesTag = `<div style="font-size:0.65rem; color:#94a3b8; margin-top:6px;">Sources: ${data.sources.join(" • ")} ${data.isDemoMode ? '<span class="demo-mode-badge" style="font-size:0.6rem; padding:1px 5px; margin-left:4px;">Demo AI Mode</span>' : ''}</div>`;
    }

    aiRow.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div style="width: 100%;">
        <div class="msg-content-bubble">
          ${formattedText}
          ${explanationHtml}
          ${actionButtonsHtml}
          ${sourcesTag}
          ${suggestionsHtml}
        </div>
        <span class="msg-timestamp">${timeStr}</span>
      </div>
    `;

    this.appendToAllChatContainers(aiRow);
    this.chatHistory.push({ sender: "ai", data, time: timeStr });
  },

  showTypingIndicator() {
    const containers = [
      document.getElementById("chatbot-messages-container"),
      document.getElementById("floating-messages-container")
    ];

    containers.forEach(c => {
      if (!c) return;
      let ind = c.querySelector(".ai-typing-row");
      if (!ind) {
        ind = document.createElement("div");
        ind.className = "chat-msg-row ai ai-typing-row";
        ind.innerHTML = `
          <div class="msg-avatar">🤖</div>
          <div class="msg-content-bubble">
            <div class="ai-typing-indicator">
              <div class="ai-typing-dot"></div>
              <div class="ai-typing-dot"></div>
              <div class="ai-typing-dot"></div>
            </div>
          </div>
        `;
        c.appendChild(ind);
        c.scrollTop = c.scrollHeight;
      }
    });
  },

  hideTypingIndicator() {
    document.querySelectorAll(".ai-typing-row").forEach(el => el.remove());
  },

  appendToAllChatContainers(element) {
    const containers = [
      document.getElementById("chatbot-messages-container"),
      document.getElementById("floating-messages-container")
    ];

    containers.forEach(c => {
      if (c) {
        c.appendChild(element.cloneNode(true));
        c.scrollTop = c.scrollHeight;
      }
    });
  },

  handleQuickQuestion(questionText) {
    this.handleUserSubmit(questionText);
  },

  handleActionClick(action, targetId, lat, lng) {
    if (typeof LandslideApp === "undefined") return;

    if (action === "VIEW_MAP") {
      LandslideApp.navigateTo("map");
      if (lat && lng && typeof LandslideMap !== "undefined" && LandslideMap.flyToLocation) {
        setTimeout(() => {
          LandslideMap.flyToLocation(lat, lng, 14);
        }, 150);
      } else if (targetId && typeof LandslideMap !== "undefined" && LandslideMap.selectPresetLocation) {
        setTimeout(() => {
          LandslideMap.selectPresetLocation(targetId);
        }, 150);
      }
    } else if (action === "ANALYZE_LOC") {
      if (targetId) {
        LandslideApp.currentLocationId = targetId;
      }
      LandslideApp.navigateTo("analysis");
    } else if (action === "VIEW_ENVIRONMENT") {
      LandslideApp.navigateTo("environment");
    } else if (action === "VIEW_ALERTS") {
      LandslideApp.navigateTo("alerts");
    } else if (action === "SUBMIT_REPORT") {
      LandslideApp.navigateTo("citizen-reports");
      setTimeout(() => {
        const formEl = document.getElementById("citizen-report-form");
        if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else if (action === "VIEW_DASHBOARD") {
      LandslideApp.navigateTo("dashboard");
    }

    // If on mobile or floating drawer, close floating drawer
    this.closeFloatingDrawer();
  },

  toggleFloatingDrawer() {
    const drawer = document.getElementById("floating-chat-drawer");
    if (drawer) {
      drawer.classList.toggle("open");
      if (drawer.classList.contains("open")) {
        const input = document.getElementById("floating-chat-input-text");
        if (input) input.focus();
        const container = document.getElementById("floating-messages-container");
        if (container) container.scrollTop = container.scrollHeight;
      }
    }
  },

  openFloatingDrawer() {
    const drawer = document.getElementById("floating-chat-drawer");
    if (drawer) {
      drawer.classList.add("open");
      const input = document.getElementById("floating-chat-input-text");
      if (input) input.focus();
      const container = document.getElementById("floating-messages-container");
      if (container) container.scrollTop = container.scrollHeight;
    }
  },

  closeFloatingDrawer() {
    const drawer = document.getElementById("floating-chat-drawer");
    if (drawer) {
      drawer.classList.remove("open");
    }
  },

  clearChat() {
    this.renderInitialWelcome();
    if (typeof LandslideApp !== "undefined" && LandslideApp.showToast) {
      LandslideApp.showToast("Conversation cleared.", "info");
    }
  },

  escapeHTML(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  escapeQuotes(str) {
    if (!str) return "";
    return str.replace(/'/g, "\\'");
  },

  formatMarkdown(text) {
    if (!text) return "";
    let html = this.escapeHTML(text);
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Bullet points
    html = html.replace(/^• (.*?)$/gm, '<li style="margin-left:14px;">$1</li>');
    html = html.replace(/^[0-9]+\. (.*?)$/gm, '<li style="margin-left:14px; list-style-type: decimal;">$1</li>');
    // Newlines
    html = html.replace(/\n\n/g, '<div style="margin-bottom: 8px;"></div>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }
};

// Auto-initialize when DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => LandslideAIChatbot.init());
} else {
  LandslideAIChatbot.init();
}
