/**
 * AI-Based Early Warning & Landslide Risk Monitoring System
 * Landslide AI Assistant - Client Controller & Interactive Engine
 * Module: js/chatbot.js
 */

const LandslideAIChatbot = {
  // Active Language (persisted in localStorage)
  activeLanguage: localStorage.getItem("landslide_chat_language") || "en",
  conversationId: null,
  contextLocationId: "LOC-02", // Default to active sector
  isVoiceActive: false,
  recognition: null,
  isWaitingResponse: false,
  chatHistory: [], // Messages in active session

  // AI Provider Configuration (Google Gemini / OpenAI)
  aiProvider: localStorage.getItem("landslide_ai_provider") || "gemini",
  geminiApiKey: localStorage.getItem("landslide_gemini_api_key") || "",
  openaiApiKey: localStorage.getItem("landslide_openai_api_key") || "",
  geminiModel: localStorage.getItem("landslide_gemini_model") || "gemini-1.5-flash",
  openaiModel: localStorage.getItem("landslide_openai_model") || "gpt-4o-mini",

  // 22 Eighth Schedule Indian Languages + English Metadata
  indianLanguages: {
    en: { name: "English", nativeName: "English (India)", speechCode: "en-IN" },
    hi: { name: "Hindi", nativeName: "हिन्दी (Hindi)", speechCode: "hi-IN" },
    ta: { name: "Tamil", nativeName: "தமிழ் (Tamil)", speechCode: "ta-IN" },
    te: { name: "Telugu", nativeName: "తెలుగు (Telugu)", speechCode: "te-IN" },
    kn: { name: "Kannada", nativeName: "ಕನ್ನಡ (Kannada)", speechCode: "kn-IN" },
    ml: { name: "Malayalam", nativeName: "മലയാളം (Malayalam)", speechCode: "ml-IN" },
    bn: { name: "Bengali", nativeName: "বাংলা (Bengali)", speechCode: "bn-IN" },
    mr: { name: "Marathi", nativeName: "मराठी (Marathi)", speechCode: "mr-IN" },
    gu: { name: "Gujarati", nativeName: "ગુજરાતી (Gujarati)", speechCode: "gu-IN" },
    pa: { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ (Punjabi)", speechCode: "pa-IN" },
    or: { name: "Odia", nativeName: "ଓଡ଼ିଆ (Odia)", speechCode: "or-IN" },
    as: { name: "Assamese", nativeName: "অসমীয়া (Assamese)", speechCode: "as-IN" },
    ur: { name: "Urdu", nativeName: "اردو (Urdu)", speechCode: "ur-IN" },
    ne: { name: "Nepali", nativeName: "नेपाली (Nepali)", speechCode: "ne-NP" },
    kok: { name: "Konkani", nativeName: "कोंकणी (Konkani)", speechCode: "kok-IN" },
    ks: { name: "Kashmiri", nativeName: "كٲشُر (Kashmiri)", speechCode: "ks-IN" },
    doi: { name: "Dogri", nativeName: "डोगरी (Dogri)", speechCode: "doi-IN" },
    sa: { name: "Sanskrit", nativeName: "संस्कृतम् (Sanskrit)", speechCode: "sa-IN" },
    mai: { name: "Maithili", nativeName: "मैथिली (Maithili)", speechCode: "mai-IN" },
    mni: { name: "Manipuri", nativeName: "মৈতৈলোন্ (Manipuri)", speechCode: "mni-IN" },
    sat: { name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ (Santali)", speechCode: "sat-IN" },
    brx: { name: "Bodo", nativeName: "बड़ो (Bodo)", speechCode: "brx-IN" },
    sd: { name: "Sindhi", nativeName: "سنڌي (Sindhi)", speechCode: "sd-IN" }
  },

  // Native Greetings in All Supported Indian Languages
  welcomeMessages: {
    en: "Hello! I'm **Landslide AI Assistant**.\n\nI can help you understand landslide risks, environmental conditions, alerts, locations and recommended safety actions.\n\nWhat would you like to know?",
    hi: "नमस्ते! मैं **Landslide AI Assistant** हूँ।\n\nमैं भूस्खलन के खतरे, बारिश, मिट्टी की नमी, मौसम के पूर्वानुमान, चेतावनी और सुरक्षा उपायों के बारे में आपकी सहायता कर सकता हूँ।\n\nआप क्या जानना चाहते हैं?",
    ta: "வணக்கம்! நான் **Landslide AI Assistant**.\n\nநிலச்சரிவு அபாயங்கள், மழைப்பொழிவு, மண் ஈரப்பதம், பேரிடர் எச்சரிக்கைகள் மற்றும் பாதுகாப்பு வழிமுறைகள் குறித்து உங்களுக்கு உதவ முடியும்.\n\nநீங்கள் என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?",
    te: "నమస్కారం! నేను **Landslide AI Assistant**.\n\nకొండచరియలు విరిగిపడే ప్రమాదం, వర్షపాతం, నేల తేమ, వాతావరణ నివేదికలు, హెచ్చరికలు మరియు భద్రతా చర్యల గురించి మీకు సహాయం చేయగలను.\n\nమీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు?",
    kn: "ನಮಸ್ಕಾರ! ನಾನು **Landslide AI Assistant**.\n\nಭೂಕುಸಿತದ ಅಪಾಯ, ಮಳೆ ಪ್ರಮಾಣ, ಮಣ್ಣಿನ ತೇವಾಂಶ, ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ, ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಸುರಕ್ಷತಾ ಕ್ರಮಗಳ ಬಗ್ಗೆ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.\n\nನೀವು ಏನನ್ನು ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?",
    ml: "നമസ്കാരം! ഞാൻ **Landslide AI Assistant**.\n\nഉരുൾപൊട്ടൽ സാധ്യത, മഴയുടെ അളവ്, മണ്ണിലെ ഈർപ്പം, കാലാവസ്ഥാ റിപ്പോർട്ടുകൾ, അടിയന്തര മുന്നറിയിപ്പുകൾ, സുരക്ഷാ മുൻകരുതലുകൾ എന്നിവയെക്കുറിച്ച് നിങ്ങൾക്ക് വിവരങ്ങൾ നൽകാൻ എനിക്ക് കഴിയും.\n\nനിങ്ങൾക്ക് എന്താണ് അറിയേണ്ടത്?",
    bn: "নমস্কার! আমি **Landslide AI Assistant**।\n\nভূমিধসের ঝুঁকি, বৃষ্টিপাত, মাটির আর্দ্রতা, আবহাওয়া সতর্কতা এবং জীবনরক্ষাকারী সুরক্ষা ব্যবস্থা সম্পর্কে সাহায্য করতে পারি।\n\nআপনি কী জানতে চান?",
    mr: "नमस्कार! मी **Landslide AI Assistant** आहे।\n\nदरड कोसळण्याचा धोका, पर्जन्यमान, मातीचा ओलावा, हवामानाचा अंदाज, इशारे आणि सुरक्षितता उपायांबद्दल मी माहिती देऊ शकतो।\n\nतुम्हाला काय जाणून घ्यायचे आहे?",
    gu: "નમસ્તે! હું **Landslide AI Assistant** છું.\n\nભૂસ્ખલનનું જોખમ, વરસાદ, માટીનો ભેજ, હવામાન ચેતવણીઓ અને સલામતીના પગલાં વિશે હું તમારી મદદ કરી શકું છું.\n\nતમે શું જાણવા માગો છો?",
    pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ **Landslide AI Assistant** ਹਾਂ।\n\nਮੈਂ ਜ਼ਮੀਨ ਖਿਸਕਣ ਦੇ ਖ਼ਤਰੇ, ਮੀਂਹ ਦੀ ਮਾਤਰਾ, ਮਿੱਟੀ ਦੀ ਨਮੀ, ਮੌਸਮ ਸੰਬੰਧੀ ਚੇਤਾਵਨੀਆਂ ਅਤੇ ਸੁਰੱਖਿਆ ਉਪਾਵਾਂ ਬਾਰੇ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।\n\nਤੁਸੀਂ ਕੀ ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ?",
    or: "ନମସ୍କାର! ମୁଁ **Landslide AI Assistant**।\n\nଭୂସ୍ଖଳନ ବିପଦ, ବର୍ଷାର ପରିମାଣ, ମାଟିର ଆର୍ଦ୍ରତା, ପାଣିପାଗ ସତର୍କତା ଏବଂ ସୁରକ୍ଷା ପଦକ୍ଷେପ ସମ୍ପର୍କରେ ମୁଁ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି।\n\nଆପଣ କ'ଣ ଜାଣିବାକୁ ଚାହାଁନ୍ତି?",
    as: "নমস্কাৰ! মই **Landslide AI Assistant**।\n\nভূমিস্খলনৰ আশংকা, বৰষুণৰ পৰিমাণ, মাটিৰ আৰ্দ্ৰতা, বতৰৰ সতৰ্কবাণী আৰু সুৰক্ষা ব্যৱস্থা সম্পৰ্কে সহায় কৰিব পাৰোঁ।\n\nআপুনি কি জানিব বিচাৰে?",
    ur: "آداب! میں **Landslide AI Assistant** ہوں۔\n\nمیں لینڈ سلائیڈنگ کے خطرات، بارش، مٹی کی نمی، ایمرجنسی الرٹس اور حفاظتی تدابیر کے متعلق آپ کی رہنمائی کر سکتا ہوں۔\n\nآپ کیا جاننا چاہتے ہیں؟",
    ne: "नमस्ते! म **Landslide AI Assistant** हुँ।\n\nम पहिरोको जोखिम, वर्षाको मात्रा, माटोको आर्द्रता, मौसमी चेतावनी तथा सुरक्षा उपायहरूका बारेमा तपाईंलाई जानकारी दिन सक्छु।\n\nतपाईं के जान्न चाहनुहुन्छ?",
    kok: "नमस्कार! हांव **Landslide AI Assistant**.\n\nपोंवळी/ल्ह्हान-व्हड हुंवार, पावसाचें प्रमाण, मातीचो ओलसाण, शिटकावण्यो आनी सुरक्षेचे उपाव हांचेविशीं हांव म्हायती दिवंक शकतां.\n\nतुका कितें जाणून घेवंक जाय?",
    ks: "سلام! بؤ چُھس **Landslide AI Assistant**۔\n\nبؤ ہیٚکہٕ پٔسہِ پؠنہٕ کِس خطرَس، رُد کِس مقدار، زمیٖن ہِنٛزِ نَمی تہٕ بچاوُک تدبیٖرَن مُتعلِق رہنُمٲیی کٔرِتھ۔\n\nتۄہہِ کیا چھُو زانُن؟",
    doi: "नमस्ते! मैं **Landslide AI Assistant** आँ।\n\nमैं लैण्डस्लाइड दे खतरे, बरखा, मिट्टी दी नमी, चेतावनियां ते सुरक्षा उपायें बारै जानकारी देई सकना आँ।\n\nतुस केह् जानना चाह्ने ओ?",
    sa: "नमस्ते! अहम् **Landslide AI Assistant** अस्मि।\n\nअहं भूस्खलन-संकटस्य, वृष्टेः, मृत्तिकायाः आद्रतायाः, सुरक्षा-उपायानां च विषये भवते सहाय्यं कर्तुं शक्नोमि।\n\nभवान् किं ज्ञातुम् इच्छति?",
    mai: "प्रणाम! हम **Landslide AI Assistant** छी।\n\nहम भूस्खलनक खतरा, वर्षा, माटिक नमी, चेतावनी आ सुरक्षा उपाएक संबंधमे अहाँक सहायता कऽ सकैत छी।\n\nअहाँ की जनए चाहैत छी?",
    mni: "খোৰুমজৰি! ঐদি **Landslide AI Assistant** নি।\n\nঐনা চীংথক তুকখৎপগী খুদোংথিবা, নোংগী চাং, লৈবাক্কী অশেৎপা, অমসুং ঙাকথোক্নবগী থৌরাংশিংগী মতাংদা মতেং পাংবা ঙমগনি।\n\nনহাক্না করি খঙবা পাম্বগে?",
    sat: "ᱡᱚᱦᱟᱨ! ᱤᱧ ᱫᱚ **Landslide AI Assistant** ᱠᱟᱱᱟᱹᱧ᱾\n\nᱤᱧ ᱫᱚ ᱦᱟᱥᱟ ᱫᱷᱟᱹᱥᱩᱨ ᱵᱚᱛᱚᱨ, ᱫᱟᱜ ᱡᱟᱹᱲᱤ, ᱦᱟᱥᱟ ᱨᱮᱭᱟᱜ ᱚᱫᱽ, ᱟᱨ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱩᱯᱟᱹᱭ ᱠᱚ ᱵᱟᱵᱚᱛ ᱜᱚᱲᱚᱧ ᱮᱢ ᱫᱟᱲᱮᱭᱟᱜᱼᱟ᱾\n\nᱟᱢ ᱪᱮᱫ ᱵᱟᱰᱟᱭ ᱥᱟᱱᱟᱭᱮᱫ ᱢᱮᱭᱟ?",
    brx: "खुलुमबाय! आं **Landslide AI Assistant**।\n\nआं हास्र्लिनायनि खैफोद, अखा, हायाव दै थानाय, सांग्रांथि आरो रैखाथि राहाफोरनि सोमोन्दै नोंखौ मदद खालामनो हागौ।\n\nनों मा मिथिनो लुबैदों?",
    sd: "سلام! مان **Landslide AI Assistant** آهيان.\n\nمان لينڊ سلائيڊنگ جي خطري، برسات، مٽيءَ جي آلاڻ، الرٽس ۽ حفاظتي قدمن بابت اوهان جي مدد ڪري سگهان ٿو.\n\nاوهان ڇا ڄاڻڻ چاهيو ٿا؟"
  },

  // Language Change Confirmation
  langSwitchedMessages: {
    en: "Language switched to **English**. You can now ask questions in English.",
    hi: "भाषा बदलकर **हिन्दी** कर दी गई है। अब आप हिन्दी में प्रश्न पूछ सकते हैं।",
    ta: "மொழி **தமிழ்** என மாற்றப்பட்டது. இப்போது நீங்கள் தமிழில் கேள்விகளை கேட்கலாம்.",
    te: "భాష **తెలుగు**గా మార్చబడింది. ఇప్పుడు మీరు తెలుగులో ప్రశ్నలు అడగవచ్చు.",
    kn: "ಭಾಷೆಯನ್ನು **ಕನ್ನಡ**ಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ. ನೀವು ಈಗ ಕನ್ನಡದಲ್ಲಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು.",
    ml: "ഭാഷ **മലയാളം** ആയി മാറ്റി. ഇപ്പോൾ നിങ്ങൾക്ക് മലയാളത്തിൽ ചോദ്യങ്ങൾ ചോദിക്കാം.",
    bn: "ভাষা পরিবর্তন করে **বাংলা** করা হয়েছে। এখন আপনি বাংলায় প্রশ্ন করতে পারেন।",
    mr: "भाषा बदलून **मराठी** केली गेली आहे. आता तुम्ही मराठीत प्रश्न विचारू शकता.",
    gu: "ભાષા બદલીને **ગુજરાતી** કરવામાં આવી છે. હવે તમે ગુજરાતીમાં પ્રશ્નો પૂછી શકો છો.",
    pa: "ਭਾਸ਼ਾ ਬਦਲ ਕੇ **ਪੰਜਾਬੀ** ਕਰ ਦਿੱਤੀ ਗਈ ਹੈ। ਹੁਣ ਤੁਸੀਂ ਪੰਜਾਬੀ ਵਿੱਚ ਸਵਾਲ ਪੁੱਛ ਸਕਦੇ ਹੋ।",
    or: "ଭାଷା **ଓଡ଼ିଆ**କୁ ପରିବର୍ତ୍ତିତ ହୋଇଛି। ଏବେ ଆପଣ ଓଡ଼ିଆରେ ପ୍ରଶ୍ନ ପଚାରିପାରିବେ।",
    as: "ভাষা সলনি কৰি **অসমীয়া** কৰা হ'ল। এতিয়া আপুনি অসমীয়াত প্ৰশ্ন সুধিব পাৰে।",
    ur: "زبان تبدیل کر کے **اردو** کر دی گئی ہے۔ اب آپ اردو میں سوالات پوچھ سکتے ہیں۔",
    ne: "भाषा परिवर्तन गरी **नेपाली** गरियो। अब तपाईं नेपालीमा प्रश्न सोध्न सक्नुहुन्छ।",
    kok: "भास बदलून **कोंकणी** केल्या. आतां तुमी कोंकणींत प्रस्न विचारूंक शकतात.",
    ks: "زبان بَدلاوتھ کٔرؠ وا **كٲشُر**۔ وۆنؠ ہؠکِو تۄہی كٲشِر پأٹھؠ سوال پُژھِتھ۔",
    doi: "बोली बदली करी **डोगरी** करी दित्ती गेई ऐ। हुण तुस डोगरी च सवाल पुच्छी सकदे ओ।",
    sa: "भाषा परिवर्त्य **संस्कृतम्** कृता। अधुना भवान् संस्कृतेन प्रश्नान् प्रष्टुं शक्नोति।",
    mai: "भाषा बदलि कऽ **मैथिली** कएल गेल। आब अहाँ मैथिलीमे प्रश्न पूछि सकैत छी।",
    mni: "লোন হোংদোক্তুনা **মৈতৈলোন্** ওইরে। হৌজিক নহাক্না মৈতৈলোন্দা ৱাহং হংবা য়ারে।",
    sat: "ᱯᱟᱹᱨᱥᱤ ᱵᱚᱫᱚᱞ ᱠᱟᱛᱮ **ᱥᱟᱱᱛᱟᱲᱤ** ᱦᱩᱭᱮᱱᱟ᱾ ᱱᱤᱛᱚᱜ ᱟᱢ ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮ ᱠᱩᱠᱞᱤ ᱠᱩᱞᱤ ᱫᱟᱲᱮᱭᱟᱜᱼᱟᱢ᱾",
    brx: "रावखौ सोलायनानै **बड़ो** खालामबाय। दा नों बड़ो रावजों सोंलु सोंनो हागौ।",
    sd: "ٻولي مٽائي **سنڌي** ڪئي وئي آهي. هاڻي اوهان سنڌي ۾ سوال پڇي سگهو ٿا."
  },

  // Pre-configured Quick Questions for All 23 Languages
  quickQuestions: {
    en: [
      "What's the current risk?",
      "Why is this area risky?",
      "Check rainfall",
      "Check soil moisture",
      "Check mountain slope",
      "Show high-risk areas",
      "What should I do during a landslide warning?",
      "Emergency helpline numbers"
    ],
    hi: [
      "वर्तमान भूस्खलन खतरा क्या है?",
      "यह क्षेत्र संवेदनशील क्यों है?",
      "बारिश की स्थिति जांचें",
      "मिट्टी की नमी जांचें",
      "पहाड़ी ढलान जांचें",
      "उच्च जोखिम वाले क्षेत्र दिखाएं",
      "भूस्खलन चेतावनी पर क्या करें?",
      "आपातकालीन हेल्पलाइन नंबर"
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
    ],
    te: [
      "ప్రస్తుత కొండచరియల ప్రమాదం ఏమిటి?",
      "ఈ ప్రాంతం ఎందుకు ప్రమాదకరం?",
      "వర్షపాతం వివరాలు చూడండి",
      "నేల తేమను తనిఖీ చేయండి",
      "పర్వత వాలును తనిఖీ చేయండి",
      "అధిక ప్రమాద ప్రాంతాలను చూపించు",
      "హెచ్చరిక ఉన్నప్పుడు ఏమి చేయాలి?",
      "అత్యవసర హెల్ప్‌లైన్ నంబర్లు"
    ],
    kn: [
      "ಪ್ರಸ್ತುತ ಭೂಕುಸಿತದ ಅಪಾಯವೇನು?",
      "ಈ ಪ್ರದೇಶ ಏಕೆ ಅಪಾಯಕಾರಿ?",
      "ಮಳೆಯ ಪ್ರಮಾಣ ಪರಿಶೀಲಿಸಿ",
      "ಮಣ್ಣಿನ ತೇವಾಂಶ ಪರಿಶೀಲಿಸಿ",
      "ಪರ್ವತ ಇಳಿಜಾರು ಪರಿಶೀಲಿಸಿ",
      "ಹೆಚ್ಚಿನ ಅಪಾಯದ ಪ್ರದೇಶಗಳನ್ನು ತೋರಿಸಿ",
      "ಎಚ್ಚರಿಕೆಯ ಸಮಯದಲ್ಲಿ ಏನು ಮಾಡಬೇಕು?",
      "ತುರ್ತು ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆಗಳು"
    ],
    ml: [
      "നിലവിലെ ഉരുൾപൊട്ടൽ സാധ്യത എത്ര?",
      "ഈ പ്രദേശം എന്തുകൊണ്ട് അപകടകരമാണ്?",
      "മഴയുടെ അളവ് പരിശോധിക്കുക",
      "മണ്ണിലെ ഈർപ്പം പരിശോധിക്കുക",
      "മലഞ്ചെരിവ് പരിശോധിക്കുക",
      "ഉയർന്ന അപകടസാധ്യതയുള്ള പ്രദേശങ്ങൾ കാണിക്കുക",
      "ഉരുൾപൊട്ടൽ മുന്നറിയിപ്പ് ഉണ്ടായാൽ എന്ത് ചെയ്യണം?",
      "അടിയന്തര ഹെൽപ്പ്‌ലൈൻ നമ്പറുകൾ"
    ],
    bn: [
      "বর্তমান ভূমিধসের ঝুঁকি কেমন?",
      "এই এলাকাটি ঝুঁকিপূর্ণ কেন?",
      "বৃষ্টিপাতের পরিমাণ দেখুন",
      "মাটির আর্দ্রতা পরীক্ষা করুন",
      "পাহাড়ের ঢাল পরীক্ষা করুন",
      "উচ্চ ঝুঁকির এলাকাগুলি দেখান",
      "ভূমিধসের সতর্কতায় কী করণীয়?",
      "জরুরি হেল্পলাইন নম্বর"
    ],
    mr: [
      "सध्याचा दरड कोसळण्याचा धोका काय?",
      "हा भाग धोकादायक का आहे?",
      "पावसाची स्थिती तपासा",
      "मातीचा ओलावा तपासा",
      "डोंगराळ उतार तपासा",
      "धोकादायक क्षेत्रे दाखवा",
      "इशारा मिळाल्यावर काय करावे?",
      "आपत्कालीन हेल्पलाइन क्रमांक"
    ],
    gu: [
      "હાલનું ભૂસ્ખલન જોખમ શું છે?",
      "આ વિસ્તાર કેમ જોખમી છે?",
      "વરસાદની સ્થિતિ તપાસો",
      "માટીનો ભેજ તપાસો",
      "પર્વતીય ઢોળાવ તપાસો",
      "વધુ જોખમી વિસ્તારો બતાવો",
      "ચેતવણી વખતે શું કરવું?",
      "ઇમરજન્સી હેલ્પલાઇન નંબર"
    ],
    pa: [
      "ਮੌਜੂਦਾ ਜ਼ਮੀਨ ਖਿਸਕਣ ਦਾ ਖ਼ਤਰਾ ਕੀ ਹੈ?",
      "ਇਹ ਖੇਤਰ ਖ਼ਤਰਨਾਕ ਕਿਉਂ ਹੈ?",
      "ਮੀਂਹ ਦੀ ਸਥਿਤੀ ਦੇਖੋ",
      "ਮਿੱਟੀ ਦੀ ਨਮੀ ਦੇਖੋ",
      "ਪਹਾੜੀ ਢਲਾਨ ਦੇਖੋ",
      "ਵੱਧ ਖ਼ਤਰੇ ਵਾਲੇ ਖੇਤਰ ਦਿਖਾਓ",
      "ਚੇਤਾਵਨੀ ਦੌਰਾਨ ਕੀ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?",
      "ਐਮਰਜੈਂਸੀ ਹੈਲਪਲਾਈਨ ਨੰਬਰ"
    ],
    or: [
      "ବର୍ତ୍ତମାନର ଭୂସ୍ଖଳନ ବିପଦ କ'ଣ?",
      "ଏହି ଅଞ୍ଚଳ କାହିଁକି ବିପଦପୂର୍ଣ୍ଣ?",
      "ବର୍ଷାର ପରିମାଣ ଦେଖନ୍ତୁ",
      "ମାଟିର ଆର୍ଦ୍ରତା ଯାଞ୍ଚ କରନ୍ତୁ",
      "ପାହାଡ଼ ଢାଲୁ ଯାଞ୍ଚ କରନ୍ତୁ",
      "ଅଧିକ ବିପଦପୂର୍ଣ୍ଣ ଅଞ୍ଚଳ ଦେଖାନ୍ତୁ",
      "ବିପଦ ସମୟରେ କ'ଣ କରିବା ଉଚିତ୍?",
      "ଜରୁରୀକାଳୀନ ହେଲ୍ପଲାଇନ ନମ୍ବର"
    ],
    as: [
      "বৰ্তমানৰ ভূমিস্খলনৰ আশংকা কি?",
      "এই অঞ্চলটো কিয় বিপজ্জনক?",
      "বৰষুণৰ স্থিতি পৰীক্ষা কৰক",
      "মাটিৰ আৰ্দ্ৰতা পৰীক্ষা কৰক",
      "পাহাৰৰ ঢাল পৰীক্ষা কৰক",
      "অধিক বিপদাপন্ন অঞ্চল দেখুৱাওক",
      "ভূমিস্খলনৰ সতৰ্কতাত কি কৰিব লাগে?",
      "জৰুৰীকালীন হেল্পলাইন নম্বৰ"
    ],
    ur: [
      "موجودہ لینڈ سلائیڈنگ کا خطرہ کیا ہے؟",
      "یہ علاقہ کیوں خطرناک ہے؟",
      "بارش کی تفصیلات دیکھیں",
      "مٹی کی نمی چیک کریں",
      "ڈھلوان کی حالت دیکھیں",
      "ہائی رسک والے علاقے دکھائیں",
      "وارننگ کے دوران کیا کرنا چاہیے؟",
      "ایمرجنسی ہیلپ لائن نمبرز"
    ],
    ne: [
      "वर्तमान पहिरोको जोखिम कति छ?",
      "यो क्षेत्र किन जोखिमपूर्ण छ?",
      "वर्षाको मात्रा हेर्नुहोस्",
      "माटोको आर्द्रता जाँच्नुहोस्",
      "पहाडी भिरालोपन जाँच्नुहोस्",
      "उच्च जोखिम क्षेत्रहरू देखाउनुहोस्",
      "पहिरोको चेतावनीमा के गर्ने?",
      "आपतकालीन हेल्पलाइन नम्बर"
    ],
    kok: [
      "सध्याचो ल्हान-व्हड देंवतेचो धोको कितें?",
      "हो वाठार धोक्याचो कित्याक?",
      "पावसाचें प्रमाण पळयात",
      "मातीची ओलसाण तपासात",
      "डोंगरी देंवतेची स्थिती",
      "धोक्याचे वाठार दाखयात",
      "शिटकावणे वेळार कितें करचें?",
      "आपत्कालीन संपर्क नंबर"
    ],
    ks: [
      "موجودٕ پسہِ پؠنہٕ کِس خطرَس کیا چھُ؟",
      "یہِ علاقہٕ کیازِ چھُ خطرناک؟",
      "رُدُک مقدار وُچھِو",
      "زمیٖنٕچ نمی جانچیو",
      "پہاڑی ڈھلوان وُچھِو",
      "خطرناک علاقہٕ ہاوِو",
      "وارننگ دوران کیا کَرُن؟",
      "ایمرجنسی ہیلپ لائن نمبر"
    ],
    doi: [
      "इस बेले लैण्डस्लाइड दा खतरा केह् ऐ?",
      "एह इलाका कियूँ खतरनाक ऐ?",
      "बरखा दी स्थिति दिक्खो",
      "मिट्टी दी नमी जाचो",
      "पहाड़ी ढलान दिक्खो",
      "खतरे आले इलाके दस्सो",
      "चेतावनी बेले केह् करना चाहिदा?",
      "एमरजेंसी हेल्पलाइन नंबर"
    ],
    sa: [
      "वर्तमान-भूस्खलन-संकटं किम्?",
      "अयम् प्रदेशः किमर्थं संकटमयः?",
      "वृष्टि-प्रमाणं पश्यतु",
      "मृत्तिकायाः आद्रताम् पश्यतु",
      "पर्वतीय-प्रवणतां पश्यतु",
      "अति-संकटापन्न-क्षेत्राणि दर्शयतु",
      "संकट-काले किं करणीयम्?",
      "आपत्कालीन-सम्पर्क-संख्याः"
    ],
    mai: [
      "वर्तमान भूस्खलनक खतरा की अछि?",
      "ई क्षेत्र किएक खतरनाक अछि?",
      "वर्षाक स्थिति देखू",
      "माटिक नमी जाँचू",
      "पहाड़ी ढलान देखू",
      "उच्च जोखिम क्षेत्र देखाउ",
      "चेतावनी काल की करबाक चाही?",
      "आपातकालीन हेल्पलाइन नंबर"
    ],
    mni: [
      "হৌজিক চীংথক তুকখৎপগী খুদোংথিবা করি?",
      "মফমসি করিগী খুদোংথিবগে?",
      "নোংগী চাং য়েংবা",
      "লৈবাক্কী অশেৎপা য়েংবা",
      "চীংগী চিংশাং য়েংবা",
      "খুদোংথিবা মফমশিং উৎপু",
      "চেকশিনৱা মতমদা করি তৌগদগে?",
      "ইমার্জেন্সি হেল্পলাইন নম্বর"
    ],
    sat: [
      "ᱱᱤᱛᱚᱜᱟᱜ ᱦᱟᱥᱟ ᱫᱷᱟᱹᱥᱩᱨ ᱵᱚᱛᱚᱨ ᱪᱮᱫ?",
      "ᱱᱚᱣᱟ ᱡᱟᱭᱜᱟ ᱪᱮᱫᱟᱜ ᱵᱚᱛᱚᱨᱟᱱ?",
      "ᱫᱟᱜ ᱡᱟᱹᱲᱤ ᱧᱮᱞ ᱢᱮ",
      "ᱦᱟᱥᱟ ᱨᱮᱭᱟᱜ ᱚᱫᱽ ᱧᱮᱞ ᱢᱮ",
      "ᱵᱩᱨᱩ ᱰᱷᱟᱞ ᱧᱮᱞ ᱢᱮ",
      "ᱵᱚᱛᱚᱨᱟᱱ ᱡᱟᱭᱜᱟ ᱠᱚ ᱩᱫᱩᱜ ᱢᱮ",
      "ᱵᱚᱛᱚᱨ ᱚᱠᱛᱚ ᱨᱮ ᱪᱮᱫ ᱪᱤᱠᱟᱹᱭᱟ?",
      "ᱟᱯᱚᱛᱠᱟᱞᱤᱱ ᱦᱮᱞᱯᱞᱟᱭᱤᱱ ᱮᱞ"
    ],
    brx: [
      "दानि हास्र्लिनायनि खैफोदा मा?",
      "बे ओनसोलआ मानो खैफोदगोनां?",
      "अखानि बिबां नाय",
      "हानि सिदोबथि नाय",
      "हाजोनि गोख्रोंथि नाय",
      "गिबिखां ओनसोलफोरखौ दिनथि",
      "सांग्रांथिनि समाव मा खालामनांगौ?",
      "जायख्लं हेल्पलाइन नम्बर"
    ],
    sd: [
      "هاڻوڪو لينڊ سلائيڊنگ جو خطرو ڇا آهي؟",
      "هي علائقو ڇو خطرناڪ آهي؟",
      "برسات جي صورتحال ڏسو",
      "مٽيءَ جي آلاڻ چيڪ ڪريو",
      "پهاڙي لاهي ڏسو",
      "خطرناڪ علائقا ڏيکاريو",
      "وارننگ دوران ڇا ڪجي؟",
      "ايمرجنسي هيلپ لائن نمبر"
    ]
  },

  // Helper to dynamically detect Indian language from text or fall back to activeLanguage
  detectLanguage(text) {
    if (!text || typeof text !== "string") return this.activeLanguage || "en";
    const str = text.trim();
    if (!str) return this.activeLanguage || "en";

    // Tamil script
    if (/[\u0B80-\u0BFF]/.test(str)) return "ta";
    // Telugu script
    if (/[\u0C00-\u0C7F]/.test(str)) return "te";
    // Kannada script
    if (/[\u0C80-\u0CFF]/.test(str)) return "kn";
    // Malayalam script
    if (/[\u0D00-\u0D7F]/.test(str)) return "ml";
    // Gujarati script
    if (/[\u0A80-\u0AFF]/.test(str)) return "gu";
    // Gurmukhi (Punjabi) script
    if (/[\u0A00-\u0A7F]/.test(str)) return "pa";
    // Odia script
    if (/[\u0B00-\u0B7F]/.test(str)) return "or";
    // Bengali & Assamese script
    if (/[\u0980-\u09FF]/.test(str)) {
      if (/[\u09F0\u09F1]/.test(str)) return "as";
      return "bn";
    }
    // Arabic script (Urdu / Kashmiri / Sindhi)
    if (/[\u0600-\u06FF]/.test(str)) {
      if (this.activeLanguage === "ks") return "ks";
      if (this.activeLanguage === "sd") return "sd";
      return "ur";
    }
    // Ol Chiki script (Santali)
    if (/[\u1C50-\u1C7F]/.test(str)) return "sat";
    // Meitei Mayek script (Manipuri)
    if (/[\uABC0-\uABFF\uAAE0-\uAAFF]/.test(str)) return "mni";
    // Devanagari script (Hindi, Marathi, Nepali, Sanskrit, Maithili, Dogri, Bodo, Konkani)
    if (/[\u0900-\u097F]/.test(str)) {
      if (["mr", "ne", "sa", "mai", "doi", "brx", "kok"].includes(this.activeLanguage)) {
        return this.activeLanguage;
      }
      return "hi"; // Default Devanagari to Hindi
    }

    return this.activeLanguage || "en";
  },

  getLanguageInfo(lang) {
    return this.indianLanguages[lang] || this.indianLanguages["en"];
  },

  init() {
    this.conversationId = "CHAT-SES-" + Date.now().toString(36);
    // Synchronize all language selectors with activeLanguage
    const selectors = document.querySelectorAll(".chatbot-lang-select");
    selectors.forEach(sel => {
      sel.value = this.activeLanguage;
    });
    this.initSpeechRecognition();
    this.bindEvents();
    this.updateAIStatusBadge();
    this.renderInitialWelcome();
  },

  initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      const speechCode = this.indianLanguages[this.activeLanguage]?.speechCode || "en-IN";
      this.recognition.lang = speechCode;

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
      const speechCode = this.indianLanguages[this.activeLanguage]?.speechCode || "en-IN";
      this.recognition.lang = speechCode;
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
    if (!this.indianLanguages[lang]) lang = "en";
    this.activeLanguage = lang;
    try {
      localStorage.setItem("landslide_chat_language", lang);
    } catch (_) {}

    const selectors = document.querySelectorAll(".chatbot-lang-select");
    selectors.forEach(sel => {
      sel.value = lang;
    });

    if (this.recognition) {
      this.recognition.lang = this.indianLanguages[lang]?.speechCode || "en-IN";
    }

    if (this.chatHistory.length === 0) {
      this.renderInitialWelcome();
    } else {
      const langMeta = this.getLanguageInfo(lang);
      const msg = this.langSwitchedMessages[lang] || `Language switched to **${langMeta.name}** (${langMeta.nativeName}). You can now ask questions in ${langMeta.name}.`;
      this.appendAIMessage({
        message: msg,
        sources: ["System Multilingual Engine"],
        actionButtons: [],
        suggestedQuestions: (this.quickQuestions[lang] || this.quickQuestions["en"]).slice(0, 4)
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
    const lang = this.activeLanguage || "en";
    const langMeta = this.getLanguageInfo(lang);
    const welcomeText = this.welcomeMessages[lang] || this.welcomeMessages["en"];

    const initialData = {
      message: welcomeText,
      sources: ["Landslide Knowledge Base", `${langMeta.name} Intelligence Feed`],
      actionButtons: [
        { label: "🗺️ View Live Map", action: "VIEW_MAP" },
        { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" }
      ],
      suggestedQuestions: (this.quickQuestions[lang] || this.quickQuestions["en"]).slice(0, 8),
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

    // 1. Check if user has connected Gemini or OpenAI API Key
    const hasGeminiKey = this.aiProvider === "gemini" && !!this.geminiApiKey;
    const hasOpenAIKey = this.aiProvider === "openai" && !!this.openaiApiKey;

    if (hasGeminiKey) {
      try {
        const geminiResponse = await this.callGeminiAPI(userText);
        this.hideTypingIndicator();
        this.appendAIMessage(geminiResponse);
        return;
      } catch (geminiErr) {
        console.warn("Google Gemini API call encountered error, activating local adaptive engine:", geminiErr);
        if (typeof LandslideApp !== "undefined" && LandslideApp.showToast) {
          LandslideApp.showToast("Gemini API error (using local engine): " + geminiErr.message, "warning");
        }
      } finally {
        this.isWaitingResponse = false;
      }
    } else if (hasOpenAIKey) {
      try {
        const openaiResponse = await this.callOpenAIAPI(userText);
        this.hideTypingIndicator();
        this.appendAIMessage(openaiResponse);
        return;
      } catch (openaiErr) {
        console.warn("OpenAI API call encountered error, activating local adaptive engine:", openaiErr);
        if (typeof LandslideApp !== "undefined" && LandslideApp.showToast) {
          LandslideApp.showToast("OpenAI API error (using local engine): " + openaiErr.message, "warning");
        }
      } finally {
        this.isWaitingResponse = false;
      }
    }

    // 2. High-Fidelity Client-Side Fallback Engine (Offline Knowledge Engine)
    setTimeout(() => {
      this.hideTypingIndicator();
      const clientResponse = this.generateClientSideResponse(userText);
      this.appendAIMessage(clientResponse);
      this.isWaitingResponse = false;
    }, 250);
  },

  /**
   * Google Gemini API Integration (Free Tier)
   */
  async callGeminiAPI(userText) {
    const locations = (typeof LANDSLIDE_APP_DATA !== "undefined" && LANDSLIDE_APP_DATA.locations)
      ? LANDSLIDE_APP_DATA.locations
      : [];
    const alerts = (typeof LANDSLIDE_APP_DATA !== "undefined" && LANDSLIDE_APP_DATA.alerts)
      ? LANDSLIDE_APP_DATA.alerts
      : [];

    const locSummary = locations.map(l =>
      `- ${l.name} (${l.district}, ${l.state}): Risk ${l.risk_category} (${l.risk_probability}%), Rain 24h: ${l.rainfall_24h_mm}mm, Soil Saturation: ${l.soil_moisture_pct}%, Slope: ${l.slope_deg || l.slope_degrees}°`
    ).join("\n");

    const alertSummary = alerts.map(a =>
      `- [${a.level || 'WARNING'}] ${a.location || a.location_name}: ${a.action || a.recommended_action}`
    ).join("\n");

    const effectiveLang = this.detectLanguage(userText);
    const langMeta = this.getLanguageInfo(effectiveLang);
    const langInstruction = effectiveLang === "en"
      ? "Reply in English."
      : `Reply fluently, naturally, accurately, and authoritatively in ${langMeta.name} (${langMeta.nativeName}). Use authentic ${langMeta.name} script and standard geotechnical and disaster management vocabulary suitable for Indian residents.`;

    const systemPrompt = `You are the authoritative AI Landslide Early Warning & Geotechnical Assistant for the Western Ghats and Himalayan mountain ranges in India.
Current live monitoring system status:
- ${locations.length} Active Stations Monitored
- Peak Monitored Risk Zone: Coonoor Ghat Corridor (87.2% CRITICAL) and Wayanad Chooralmala Ridge (92.4% CRITICAL)

Live Sector Telemetry:
${locSummary}

Active Emergency Alerts:
${alertSummary}

Emergency Hotlines:
- 112: National Unified Emergency
- 1077: District Disaster Management Authority (DEOC Toll-Free)
- 1070: State Disaster Management Control Room
- 108: Emergency Ambulance
- 011-24363260: National Disaster Response Force (NDRF)

Instructions:
1. Answer the user's question directly, accurately, and relevantly.
2. Ground explanations in real-world geotechnical science (soil saturation, pore-water pressure, shear stress, slope stability, InSAR satellite displacement, and weather radar).
3. If the user asks about landslides, road conditions, safety, or emergency preparedness, provide life-saving, authoritative advice using the live telemetry.
4. If the user asks general questions outside landslide science (e.g. general science, geography, weather, computing, general knowledge), answer them directly, intelligently, and helpfully, and optionally connect back to mountain environmental safety where suitable.
5. Format your response cleanly using GitHub-flavored markdown with bold headers and bullet points.
6. ${langInstruction}
Keep answers comprehensive yet concise (around 2 to 4 concise paragraphs or bulleted points).`;

    const model = this.geminiModel || "gemini-1.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiApiKey.trim()}`;

    const bodyPayload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemPrompt}\n\nUser Question: ${userText}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1200
      }
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyPayload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gemini API returned HTTP ${res.status}`);
    }

    const json = await res.json();
    const replyText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      throw new Error("Empty response received from Gemini API");
    }

    const lowerResp = replyText.toLowerCase();
    const actionButtons = [];
    if (lowerResp.includes("map") || lowerResp.includes("sector") || lowerResp.includes("location") || lowerResp.includes("area") || lowerResp.includes("coonoor") || lowerResp.includes("wayanad")) {
      actionButtons.push({ label: "🗺️ View Live Risk Map", action: "VIEW_MAP" });
    }
    if (lowerResp.includes("alert") || lowerResp.includes("warning") || lowerResp.includes("evacuat")) {
      actionButtons.push({ label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" });
    }
    if (lowerResp.includes("rain") || lowerResp.includes("soil") || lowerResp.includes("telemetry") || lowerResp.includes("moisture")) {
      actionButtons.push({ label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" });
    }
    if (lowerResp.includes("crack") || lowerResp.includes("report") || lowerResp.includes("photo")) {
      actionButtons.push({ label: "📢 Submit Citizen Report", action: "SUBMIT_REPORT" });
    }
    if (actionButtons.length === 0) {
      actionButtons.push({ label: "🗺️ View Live Risk Map", action: "VIEW_MAP" });
      actionButtons.push({ label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" });
    }

    return {
      message: replyText,
      intent: "GEMINI_GENERATIVE_AI",
      sources: [`Google ${model} (Live Generative AI)`, "Live Geotechnical Telemetry"],
      actionButtons: actionButtons.slice(0, 3),
      suggestedQuestions: (this.quickQuestions[effectiveLang] || this.quickQuestions["en"]).slice(0, 4),
      isDemoMode: false,
      modelUsed: model
    };
  },

  /**
   * OpenAI API Integration (ChatGPT / GPT-4o-mini)
   */
  async callOpenAIAPI(userText) {
    const locations = (typeof LANDSLIDE_APP_DATA !== "undefined" && LANDSLIDE_APP_DATA.locations)
      ? LANDSLIDE_APP_DATA.locations
      : [];

    const effectiveLang = this.detectLanguage(userText);
    const langMeta = this.getLanguageInfo(effectiveLang);
    const model = this.openaiModel || "gpt-4o-mini";
    const langInstruction = effectiveLang === "en"
      ? "Reply in English."
      : `Reply fluently, naturally, accurately, and authoritatively in ${langMeta.name} (${langMeta.nativeName}) using authentic script and terminology.`;

    const systemPrompt = `You are the authoritative AI Landslide Early Warning Assistant for Western Ghats and Himalayan regions in India.
Answer ANY question the user asks accurately, politely, and relevantly.
Ground your explanations in geotechnical engineering, weather radar, and satellite InSAR telemetry where applicable.
${langInstruction}
Use clean markdown formatting with bullet points.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.openaiApiKey.trim()}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userText }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `OpenAI API returned HTTP ${res.status}`);
    }

    const json = await res.json();
    const replyText = json?.choices?.[0]?.message?.content;

    return {
      message: replyText,
      intent: "OPENAI_GENERATIVE_AI",
      sources: [`OpenAI ${model} (Live Generative AI)`, "Live Geotechnical Telemetry"],
      actionButtons: [
        { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" },
        { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" }
      ],
      suggestedQuestions: (this.quickQuestions[effectiveLang] || this.quickQuestions["en"]).slice(0, 4),
      isDemoMode: false,
      modelUsed: model
    };
  },

  updateAIStatusBadge() {
    const badgeEl = document.getElementById("ai-provider-badge-btn");
    const labelEl = document.getElementById("ai-provider-label");

    if (!badgeEl || !labelEl) return;

    if (this.aiProvider === "gemini" && this.geminiApiKey) {
      badgeEl.classList.add("connected");
      labelEl.textContent = `✨ Gemini Active (${this.geminiModel})`;
      badgeEl.title = `Connected to Google ${this.geminiModel}. Click to change settings.`;
    } else if (this.aiProvider === "openai" && this.openaiApiKey) {
      badgeEl.classList.add("connected");
      labelEl.textContent = `🟢 OpenAI Active (${this.openaiModel})`;
      badgeEl.title = `Connected to OpenAI ${this.openaiModel}. Click to change settings.`;
    } else {
      badgeEl.classList.remove("connected");
      labelEl.textContent = "⚡ Free Gemini AI";
      badgeEl.title = "Click to connect free Google Gemini or OpenAI API key";
    }
  },

  openAISettingsModal() {
    const modal = document.getElementById("ai-provider-modal");
    if (!modal) return;

    const geminiInput = document.getElementById("gemini-api-key-input");
    if (geminiInput) geminiInput.value = this.geminiApiKey;

    const openaiInput = document.getElementById("openai-api-key-input");
    if (openaiInput) openaiInput.value = this.openaiApiKey;

    const geminiSelect = document.getElementById("gemini-model-select");
    if (geminiSelect) geminiSelect.value = this.geminiModel || "gemini-1.5-flash";

    const openaiSelect = document.getElementById("openai-model-select");
    if (openaiSelect) openaiSelect.value = this.openaiModel || "gpt-4o-mini";

    this.switchProviderTab(this.aiProvider || "gemini");

    const statusBox = document.getElementById("ai-conn-test-status");
    if (statusBox) statusBox.style.display = "none";

    modal.classList.add("open");
  },

  closeAISettingsModal() {
    const modal = document.getElementById("ai-provider-modal");
    if (modal) modal.classList.remove("open");
  },

  switchProviderTab(provider) {
    this.aiProvider = provider;
    const tabGemini = document.getElementById("tab-gemini");
    const tabOpenai = document.getElementById("tab-openai");
    const secGemini = document.getElementById("gemini-settings-section");
    const secOpenai = document.getElementById("openai-settings-section");

    if (provider === "gemini") {
      if (tabGemini) tabGemini.classList.add("active");
      if (tabOpenai) tabOpenai.classList.remove("active");
      if (secGemini) secGemini.style.display = "block";
      if (secOpenai) secOpenai.style.display = "none";
    } else {
      if (tabGemini) tabGemini.classList.remove("active");
      if (tabOpenai) tabOpenai.classList.add("active");
      if (secGemini) secGemini.style.display = "none";
      if (secOpenai) secOpenai.style.display = "block";
    }
  },

  toggleKeyVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
  },

  saveAISettings() {
    const geminiInput = document.getElementById("gemini-api-key-input");
    const openaiInput = document.getElementById("openai-api-key-input");
    const geminiSelect = document.getElementById("gemini-model-select");
    const openaiSelect = document.getElementById("openai-model-select");

    this.geminiApiKey = (geminiInput?.value || "").trim();
    this.openaiApiKey = (openaiInput?.value || "").trim();
    this.geminiModel = geminiSelect?.value || "gemini-1.5-flash";
    this.openaiModel = openaiSelect?.value || "gpt-4o-mini";

    localStorage.setItem("landslide_ai_provider", this.aiProvider);
    localStorage.setItem("landslide_gemini_api_key", this.geminiApiKey);
    localStorage.setItem("landslide_openai_api_key", this.openaiApiKey);
    localStorage.setItem("landslide_gemini_model", this.geminiModel);
    localStorage.setItem("landslide_openai_model", this.openaiModel);

    this.updateAIStatusBadge();
    this.closeAISettingsModal();

    if (typeof LandslideApp !== "undefined" && LandslideApp.showToast) {
      if ((this.aiProvider === "gemini" && this.geminiApiKey) || (this.aiProvider === "openai" && this.openaiApiKey)) {
        LandslideApp.showToast(`Connected to ${this.aiProvider === "gemini" ? "Google Gemini" : "OpenAI"}!`, "success");
      } else {
        LandslideApp.showToast("Settings saved. Using offline knowledge engine.", "info");
      }
    }
  },

  async testAIConnection() {
    const statusBox = document.getElementById("ai-conn-test-status");
    if (!statusBox) return;

    statusBox.style.display = "block";
    statusBox.innerHTML = '<span style="color:#0284c7;">⏳ Testing connection to AI endpoint...</span>';

    const geminiInput = document.getElementById("gemini-api-key-input");
    const openaiInput = document.getElementById("openai-api-key-input");
    const key = this.aiProvider === "gemini" ? (geminiInput?.value || "").trim() : (openaiInput?.value || "").trim();

    if (!key) {
      statusBox.innerHTML = '<span style="color:#dc2626;">❌ Please enter an API key first.</span>';
      return;
    }

    try {
      if (this.aiProvider === "gemini") {
        const model = document.getElementById("gemini-model-select")?.value || "gemini-1.5-flash";
        const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "Respond with 'OK' only." }] }]
          })
        });
        if (!testRes.ok) {
          const err = await testRes.json().catch(() => ({}));
          throw new Error(err?.error?.message || `HTTP ${testRes.status}`);
        }
        statusBox.innerHTML = `<span style="color:#16a34a; font-weight:700;">✅ Success! Google Gemini ${model} is connected and ready.</span>`;
      } else {
        const model = document.getElementById("openai-model-select")?.value || "gpt-4o-mini";
        const testRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 5
          })
        });
        if (!testRes.ok) {
          const err = await testRes.json().catch(() => ({}));
          throw new Error(err?.error?.message || `HTTP ${testRes.status}`);
        }
        statusBox.innerHTML = `<span style="color:#16a34a; font-weight:700;">✅ Success! OpenAI ${model} is connected and ready.</span>`;
      }
    } catch (testErr) {
      statusBox.innerHTML = `<span style="color:#dc2626; font-weight:700;">❌ Connection failed: ${testErr.message}</span>`;
    }
  },

  clearAISettings() {
    this.geminiApiKey = "";
    this.openaiApiKey = "";
    localStorage.removeItem("landslide_gemini_api_key");
    localStorage.removeItem("landslide_openai_api_key");

    const geminiInput = document.getElementById("gemini-api-key-input");
    if (geminiInput) geminiInput.value = "";
    const openaiInput = document.getElementById("openai-api-key-input");
    if (openaiInput) openaiInput.value = "";

    const statusBox = document.getElementById("ai-conn-test-status");
    if (statusBox) {
      statusBox.style.display = "block";
      statusBox.innerHTML = '<span style="color:#64748b;">Keys cleared. Chatbot is running on the local knowledge engine.</span>';
    }

    this.updateAIStatusBadge();
    if (typeof LandslideApp !== "undefined" && LandslideApp.showToast) {
      LandslideApp.showToast("API keys cleared. Switched to offline engine.", "info");
    }
  },

  generateClientSideResponse(userText) {
    const textLower = userText.toLowerCase().trim();
    const effectiveLang = this.detectLanguage(userText);
    const isTa = effectiveLang === "ta";
    const langMeta = this.getLanguageInfo(effectiveLang);

    // Guardrail against credential extraction
    if (textLower.includes("api key") || textLower.includes("password") || textLower.includes("secret") || textLower.includes("system prompt")) {
      return {
        message: isTa
          ? "நான் ரகசிய கணினி சான்றுகள் அல்லது கடவுச்சொற்களை வழங்க முடியாது. நிலச்சரிவு மற்றும் வானிலை தரவுகள் பற்றி கேளுங்கள்."
          : "I can't provide credentials, environment variables, or private system information. Please ask about landslide risk and environmental telemetry.",
        intent: "INJECTION_PROBE",
        sources: ["Security Guardrails"],
        actionButtons: [],
        suggestedQuestions: (this.quickQuestions[effectiveLang] || this.quickQuestions["en"]).slice(0, 3),
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

    // Common regional aliases & Tamil transcriptions
    if (!explicitLoc) {
      if (textLower.includes("ooty") || textLower.includes("ஊட்டி") || textLower.includes("doddabetta")) {
        explicitLoc = locations.find(l => l.id === "LOC-01");
      } else if (textLower.includes("coonoor") || textLower.includes("குன்னூர்")) {
        explicitLoc = locations.find(l => l.id === "LOC-02");
      } else if (textLower.includes("wayanad") || textLower.includes("வயநாடு") || textLower.includes("chooralmala") || textLower.includes("meppadi")) {
        explicitLoc = locations.find(l => l.id === "LOC-03");
      } else if (textLower.includes("kotagiri") || textLower.includes("கோத்தகிரி")) {
        explicitLoc = locations.find(l => l.id === "LOC-04");
      } else if (textLower.includes("munnar") || textLower.includes("மூணார்") || textLower.includes("idukki")) {
        explicitLoc = locations.find(l => l.id === "LOC-05");
      } else if (textLower.includes("kodaikanal") || textLower.includes("கொடைக்கானல்")) {
        explicitLoc = locations.find(l => l.id === "LOC-06");
      } else if (textLower.includes("joshimath") || textLower.includes("chamoli") || textLower.includes("ஜோஷிமத்")) {
        explicitLoc = locations.find(l => l.id === "LOC-07");
      } else if (textLower.includes("shimla") || textLower.includes("சிம்லா")) {
        explicitLoc = locations.find(l => l.id === "LOC-08");
      } else if (textLower.includes("darjeeling") || textLower.includes("டார்ஜிலிங்")) {
        explicitLoc = locations.find(l => l.id === "LOC-09");
      }
    }

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

      // 6. Location Travel / Driving Query
      if (textLower.includes("travel") || textLower.includes("driving") || textLower.includes("safe to go") || textLower.includes("visit") || textLower.includes("road") || textLower.includes("பயணம்") || textLower.includes("சாலை")) {
        const isHazardous = riskProb >= 60 || riskCat === "CRITICAL" || riskCat === "HIGH";
        const travelMsg = isTa
          ? `🚗 **பயண & சாலை ஆலோசனை - ${locName} (${targetLoc.district}):**\n\n• **தற்போதைய அபாய நிலை:** **${riskCat} (${riskProb}%)**\n• **24h மழைப்பொழிவு:** **${rain} mm**\n• **சாய்வு கோணம்:** **${slope}°**\n• **பாதை மதிப்பீடு:** ${isHazardous ? '⚠️ **பயணத்தை தவிர்க்கவும்!** கனமழை மற்றும் நிலப்பரப்பு செறிவு காரணமாக இந்த மலைப்பாதையில் பாறை சரிவு மற்றும் நிலச்சரிவு ஏற்படும் வாய்ப்பு அதிகம் உள்ளது.' : '✅ பாதை தற்போது இயல்பாக உள்ளது. இருப்பினும் இரவு நேர மலைப்பாதை பயணத்தை தவிர்க்கவும்.'}\n\nஉள்ளூர் மாவட்ட நிர்வாகம் மற்றும் நெடுஞ்சாலைத்துறையின் வழிகாட்டுதல்களைப் பின்பற்றவும்.`
          : `🚗 **Travel & Route Passability Advisory - ${locName} (${targetLoc.district}):**\n\n• **Current Hazard Level:** **${riskCat} (${riskProb}%)**\n• **24-Hour Rainfall:** **${rain} mm**\n• **Slope Steepness:** **${slope}°**\n• **Advisory:** ${isHazardous ? '⚠️ **AVOID NON-ESSENTIAL TRAVEL!** High soil saturation and steep cuts present elevated risks of debris flows, rockfalls, and road subsidence along this corridor.' : '✅ Corridor is currently passable with routine mountain driving precautions. Night transit is discouraged during rain.'}\n\nPlease monitor local police road alerts and DDMA warnings before departing.`;

        return {
          message: travelMsg,
          intent: "LOCATION_TRAVEL",
          location: targetLoc,
          risk: { probability: riskProb, level: riskCat },
          sources: ["District Disaster Management Authority (DDMA)", "State Highway Patrol"],
          actionButtons: [
            { label: "🗺️ View on Map", action: "VIEW_MAP", target: targetLoc.id, lat: targetLoc.lat || targetLoc.latitude, lng: targetLoc.lng || targetLoc.longitude },
            { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" },
            { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT", target: targetLoc.id }
          ],
          suggestedQuestions: [`Why is ${targetLoc.village || locName} risky?`, `Rainfall in ${targetLoc.district}`, "What should I do during a warning?"],
          isDemoMode: true
        };
      }

      // 7. Default Location Overview & Status
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

    // -------------------------------------------------------------
    // TOPICAL KNOWLEDGE MODULES & INTELLIGENT EXPERT ENGINE
    // -------------------------------------------------------------

    // 13. Greetings, Identity & System Introduction
    const isGreeting = textLower.match(/\b(hi|hello|hey|vanakkam|namaste|greetings)\b/) ||
      textLower.includes("வணக்கம்") ||
      textLower.includes("who are you") ||
      textLower.includes("what can you do") ||
      textLower.includes("what are you") ||
      textLower.includes("help me") ||
      textLower.includes("features") ||
      textLower.includes("introduce") ||
      textLower.includes("யார் நீ") ||
      textLower.includes("உதவி");

    if (isGreeting && !textLower.includes("risk") && !textLower.includes("rain") && !textLower.includes("soil")) {
      const greetMsg = isTa
        ? `👋 **வணக்கம்! நான் நிலச்சரிவு முன்னெச்சரிக்கை AI உதவியாளர் (Landslide AI Assistant).**\n\nநான் நிகழ்நேர செயற்கைக்கோள் தரவுகள் (Sentinel-1 InSAR), வானிலை ரேடார் (IMD Telemetry), மற்றும் கள சென்சார்கள் மூலம் நிலச்சரிவு அபாயங்களை பகுப்பாய்வு செய்கிறேன்.\n\n**நீங்கள் என்னிடம் கேட்கக்கூடியவை:**\n• **நேரலை அபாய நிலவரம்:** *"Coonoor அபாயம் என்ன?"* அல்லது *"Rainfall in Wayanad"*\n• **அறிவியல் விளக்கங்கள்:** *"நிலச்சரிவு வகைகள் யாவை?"*, *"நிலச்சரிவுக்கான காரணங்கள் என்ன?"*\n• **முன்னெச்சரிக்கை அறிகுறிகள்:** *"நிலச்சரிவு ஏற்படுவதற்கான அறிகுறிகள் யாவை?"*\n• **பாதுகாப்பு & பயணம்:** *"அவசர உதவி எண்கள் என்ன?"*, *"மலைப்பாதையில் பாதுகாப்பாக பயணிப்பது எப்படி?"*\n• **தொழில்நுட்பம்:** *"AI மாதிரி எவ்வாறு கணிக்கிறது?"*, *"InSAR என்றால் என்ன?"*\n\nஉங்களுக்கு என்ன தகவல் தேவை என்று தட்டச்சு செய்யுங்கள்!`
        : `👋 **Hello! I am your Landslide Early Warning & Geotechnical AI Assistant.**\n\nI provide real-time hazard assessments, geospatial analysis, and slope safety guidance powered by **Sentinel-1 InSAR satellite telemetry, IMD Doppler precipitation feeds, and deep ensemble ML models**.\n\n**Here is what you can ask me:**\n• **Live Sector Status:** *"What is the risk in Coonoor?"*, *"Rainfall in Wayanad"*, or *"Is Ooty safe?"*\n• **Science & Geology:** *"What causes landslides?"*, *"Types of landslides"*, *"What is pore-water pressure?"*\n• **Early Precursors:** *"What are the warning signs before a landslide?"*\n• **Safety & Travel:** *"Emergency kit checklist"*, *"Helpline contacts"*, *"Is it safe to drive on ghat roads?"*\n• **Mitigation & Tech:** *"Can trees prevent landslides?"*, *"How does your AI predict slope failure?"*\n\nHow can I help protect or inform you today?`;

      return {
        message: greetMsg,
        intent: "GREETING",
        sources: ["Autonomous Early Warning System v2.4"],
        actionButtons: [
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" },
          { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" },
          { label: "🧠 Open AI Prediction Model", action: "VIEW_PREDICTION" }
        ],
        suggestedQuestions: [
          "What is the current risk?",
          "What causes a landslide?",
          "What are the warning signs?",
          "Emergency kit checklist"
        ],
        isDemoMode: true
      };
    }

    // 14. Definition & Fundamentals of Landslides
    if (textLower.includes("what is a landslide") || textLower.includes("what are landslides") || textLower.includes("define landslide") || textLower.includes("meaning of landslide") || textLower.includes("நிலச்சரிவு என்றால் என்ன") || textLower.includes("நிலச்சரிவு விளக்கம்")) {
      const defMsg = isTa
        ? `⛰️ **நிலச்சரிவு (Landslide) என்றால் என்ன?**\n\n**நிலச்சரிவு** என்பது ஈர்ப்பு விசையின் கீழ் பாறைகள், மண், இடிபாடுகள் மற்றும் நிலப்பரப்பு செங்குத்தான சரிவுகளில் இருந்து கீழ்நோக்கி நகரும் ஒரு தீவிர புவியியல் நிகழ்வாகும்.\n\n**அடிப்படை புவியியல் தத்துவம்:**\n• ஒரு மலையடுக்கு நிலையாக இருக்க அதன் **வெட்டு வலிமை (Shear Strength)**, ஈர்ப்பு விசையால் உருவாகும் **வெட்டு அழுத்தத்தை (Shear Stress)** விட அதிகமாக இருக்க வேண்டும்.\n• கனமழை நீரானது மண்ணிற்குள் ஊடுருவி **துளை நீர் அழுத்தத்தை (Pore-Water Pressure)** உயர்த்தும் போது, மண் துகள்களுக்கு இடையேயான பிணைப்பு உடைந்து நிலப்பரப்பு திடீரென சரிந்து விழுகிறது.\n\nநிலச்சரிவுகள் சில வினாடிகளிலேயே அதிவேகத்தில் நகர்ந்து கிராமங்களையும் சாலைகளையும் மூழ்கடிக்கும் ஆற்றல் கொண்டவை.`
        : `⛰️ **What is a Landslide? (Geotechnical Definition)**\n\nA **landslide** is defined as the downward and outward movement of slope-forming materials—including rock, soil, artificial fill, or a combination of these—under the direct influence of **gravity**.\n\n**The Mechanics of Slope Stability:**\n• Every mountain slope exists in a balance between **driving forces** (gravitational shear stress pulling downward) and **resisting forces** (shear strength from soil cohesion and internal friction).\n• Failure occurs when the **Factor of Safety (FoS)** drops below **1.0**—most commonly when torrential rainwater infiltrates the ground, raising subterranean **pore-water pressure** and reducing effective friction along bedrock slip surfaces.\n\nLandslides encompass rockfalls, deep rotational slumps, and devastating high-velocity debris flows.`;

      return {
        message: defMsg,
        intent: "LANDSLIDE_DEFINITION",
        sources: ["Geological Survey of India (GSI)", "USGS Landslide Hazards Program"],
        actionButtons: [
          { label: "🧠 Open AI Prediction Model", action: "VIEW_PREDICTION" },
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" }
        ],
        suggestedQuestions: ["What causes a landslide?", "Types of landslides", "What are the warning signs?"],
        isDemoMode: true
      };
    }

    // 15. Landslide Causes & Trigger Mechanisms
    if (textLower.includes("cause") || textLower.includes("trigger") || textLower.includes("why do landslides occur") || textLower.includes("why do landslides happen") || textLower.includes("reason for landslide") || textLower.includes("காரணம்") || textLower.includes("ஏன் ஏற்படுகிறது")) {
      const causesMsg = isTa
        ? `⚠️ **நிலச்சரிவு ஏற்படுவதற்கான முக்கிய காரணங்கள்:**\n\nநிலச்சரிவுகள் இயற்கை மற்றும் மனித தலையீடுகளின் கூட்டு அழுத்தத்தால் உருவாகின்றன:\n\n1. **தொடர் கனமழை & ஊடுருவல் (முக்கிய காரணம்):**\nநீண்ட நேரம் பெய்யும் பருவமழை மண்ணின் துளைகளில் நீரை நிரப்பி துளை நீர் அழுத்தத்தை (Pore Pressure) உயர்த்துகிறது. இதனால் மண்ணின் பிணைப்பு முற்றிலும் அழிகிறது.\n\n2. **செங்குத்தான நிலப்பரப்பு சாய்வு (>30°):**\n30 டிகிரிக்கு அதிகமான சாய்வு கொண்ட மலைப்பகுதிகளில் ஈர்ப்பு விசை அழுத்தம் எப்போதும் அதிகமாக இருக்கும்.\n\n3. **மண் மற்றும் பாறை வானிலையாதல் (Weathering):**\nசிதைந்த சார்னோகைட் (Charnockite) மற்றும் நீஸ்பாறை (Gneiss) அடுக்குகளுக்குள் களிமண் வழுக்கும் தளங்கள் ஏற்படுகின்றன.\n\n4. **மனித செயல்பாடுகள்:**\n• சாலைகளுக்காக மலையடிவாரத்தை செங்குத்தாக வெட்டுதல் (Toe Excavation)\n• காடழிப்பு மற்றும் மரங்களை வெட்டுவதால் வேர் பிணைப்பு இழப்பு\n• முறையற்ற வடிகால்கள் மூலம் மலைச்சரிவில் கழிவுநீரை பாய்ச்சுதல்\n• கனரக கட்டிடங்களின் சுமை அழுத்தம்\n\n5. **நிலநடுக்க அதிர்வுகள்:** பூகம்ப அதிர்வுகள் பலவீனமான சரிவுகளை உடனடியாக தகர்க்கின்றன.`
        : `⚠️ **Primary Causes and Trigger Mechanisms of Landslides:**\n\nSlope failures occur through a combination of preparatory factors and sudden environmental triggers:\n\n1. **Intense & Prolonged Precipitation (Primary Trigger):**\nTorrential rainfall infiltrates the regolith, eliminating soil suction and raising groundwater pore pressure, which liquefies unstable overburden.\n\n2. **Steep Slope Geomorphology (>30° Gradient):**\nHigh-angle escarpments generate massive gravitational shear stress along natural dip planes.\n\n3. **Geological Discontinuities & Weathering:**\nFractured charnockite/gneiss bedrock, relict joint planes, and weak kaolinite/montmorillonite clay slip interfaces.\n\n4. **Anthropogenic Slope Destabilization:**\n• **Unengineered Toe Cutting:** Removing the stabilizing foot of a slope for roads or building terraces\n• **Deforestation:** Loss of root mechanical anchoring and transpiration dewatering\n• **Uncontrolled Surface Runoff:** Discharging road drainage directly onto unstable hill flanks\n• **Overloading:** Heavy masonry construction on fragile slope crests\n\n5. **Seismic Shaking & Ground Vibrations:** Dynamic seismic loading triggering immediate slope liquefaction.`;

      return {
        message: causesMsg,
        intent: "LANDSLIDE_CAUSES",
        sources: ["National Institute of Disaster Management (NIDM)", "Geological Survey of India"],
        actionButtons: [
          { label: "🧠 Open AI Prediction Model", action: "VIEW_PREDICTION" },
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" },
          { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" }
        ],
        suggestedQuestions: ["Types of landslides", "Can trees prevent landslides?", "What are the warning signs?"],
        isDemoMode: true
      };
    }

    // 16. Types of Landslides & Classification
    if (textLower.includes("type") || textLower.includes("classification") || textLower.includes("debris flow") || textLower.includes("rockfall") || textLower.includes("mudflow") || textLower.includes("mudslide") || textLower.includes("slump") || textLower.includes("creep") || textLower.includes("translational") || textLower.includes("வகைகள்")) {
      const typesMsg = isTa
        ? `🔬 **நிலச்சரிவுகளின் முக்கிய வகைகள் (Varnes Classification):**\n\nநகரும் வேகம் மற்றும் நகரும் பொருளின் அடிப்படையில் நிலச்சரிவுகள் வகைப்படுத்தப்படுகின்றன:\n\n1. **இடிபாட்டுப் பாய்ச்சல் (Debris Flow / Mudflow):**\nநீர், மண், மரங்கள் மற்றும் ராட்சத பாறைகள் கலந்து அதிவேகமாக (30–60 km/h) சீறிப்பாயும் திரவப் பாய்ச்சல் (உதாரணம்: வயநாடு 2024). இது மிகவும் கொடூரமானது.\n\n2. **பாறை வீழ்ச்சி (Rockfall):**\nசெங்குத்தான பாறை முகடுகளில் இருந்து பாறாங்கற்கள் உடைந்து உருண்டு விழும் நிகழ்வு. மலைப்பாதைகளில் அடிக்கடி ஏற்படுகிறது.\n\n3. **சுழல் சரிவு (Rotational Slump):**\nகரண்டி வடிவிலான குழிந்த வளைவில் மண் தொகுதி மெதுவாக கீழ்நோக்கி சரிந்து பின்னோக்கி சாய்வது.\n\n4. **தள நகர்வு சரிவு (Translational Slide):**\nதட்டையான பாறை வெடிப்பு தளத்தின் மீது மண் அடுக்கு அப்படியே சரியும் நிகழ்வு.\n\n5. **மண் நகர்வு (Soil Creep):**\nகண்களுக்கு உடனடியாகத் தெரியாத, ஆண்டுக்கு சில மில்லிமீட்டர்கள் மட்டுமே நிகழும் அதிமெதுவான நகர்வு. மரம் மற்றும் மின்கம்பங்கள் சாய்வதன் மூலம் அறியலாம்.`
        : `🔬 **Classification & Types of Landslides (Varnes Kinematic System):**\n\nLandslides are classified by the type of material (rock, debris, or earth) and the style of movement:\n\n1. **Debris Flows & Mudflows:**\nExtremely rapid to catastrophic (>10 m/s) channelized slurries of saturated sediment, boulders, and timber (e.g., Chooralmala-Mundakkai 2024). They travel kilometers and destroy everything in their path.\n\n2. **Rockfalls & Topples:**\nAbrupt detachment and free-falling, bouncing, or rolling of bedrock fragments down sheer cliffs and highway rock-cuts.\n\n3. **Rotational Slumps:**\nDownward and outward movement along a concave-upward curved rupture surface, typically causing backward rotation of the displaced soil block.\n\n4. **Translational Planar Slides:**\nRapid mass movement along a pre-existing flat structural plane, fault, or foliation surface.\n\n5. **Soil Creep:**\nExtremely slow, continuous downslope movement of topsoil over years, characterized by curved tree trunks (pistol-butt) and tilted fence lines.`;

      return {
        message: typesMsg,
        intent: "LANDSLIDE_TYPES",
        sources: ["International Consortium on Landslides (ICL)", "USGS"],
        actionButtons: [
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" },
          { label: "🧠 Open AI Prediction Model", action: "VIEW_PREDICTION" }
        ],
        suggestedQuestions: ["What causes a landslide?", "What are the warning signs?", "How to prevent landslides?"],
        isDemoMode: true
      };
    }

    // 17. Precursor Warning Signs & Early Indicators
    if (textLower.includes("warning sign") || textLower.includes("precursor") || textLower.includes("indicators") || textLower.includes("early sign") || textLower.includes("signs before") || textLower.includes("how to know") || textLower.includes("signals") || textLower.includes("அறிகுறிகள்") || textLower.includes("முன்னறிவிப்பு")) {
      const signsMsg = isTa
        ? `🚨 **நிலச்சரிவு ஏற்படுவதற்கான முக்கிய முன்னறிவிப்பு அறிகுறிகள்:**\n\nநிலச்சரிவு ஏற்படுவதற்கு சில மணி நேரங்கள் அல்லது நாட்களுக்கு முன் இயற்கையான சில மாற்றங்கள் தோன்றும்:\n\n• **புதிய நில விரிசல்கள் (Tension Cracks):** தார் சாலைகள், வீடுகளின் தளங்கள், சுவர்கள் அல்லது மலை உச்சிகளில் புதிய விரிசல்கள் தோன்றுவது அல்லது விரிவடைவது.\n• **மலையடிவாரத்தில் நிலம் புடைத்தல் (Toe Bulging):** சரிவின் அடிவாரத்தில் நிலம் அல்லது தார்ச்சாலை மேல்நோக்கி உப்பி புடைப்பது.\n• **மின்கம்பங்கள் மற்றும் மரங்கள் சாய்தல்:** மின்கம்பங்கள், மரங்கள் அல்லது தடுப்புச் சுவர்கள் மலையை நோக்கி அல்லது கீழ்நோக்கி சாய்வது.\n• **திடீர் சேற்று நீர் ஊற்றுகள்:** இதற்கு முன் நீர் வராத உலர்ந்த பகுதிகளில் திடீரென சேற்றுடன் கூடிய நீரூற்றுகள் பீறிட்டு வருவது.\n• **ஆற்று நீர் மட்டத்தில் திடீர் மாற்றம்:** மலை ஓடைகளில் நீர் திடீரென வற்றிப்போதல் (மேலே மண் அடைத்ததற்கான அடையாளம்) அல்லது திடீரென சேறு கலந்த வெள்ளமாக மாறுவது.\n• **விசித்திரமான சத்தங்கள்:** பூமியின் அடியில் இருந்து மரங்கள் முறியும் சத்தம் அல்லது இடி போன்ற நில அதிர்வு முழக்கம் கேட்பது.\n• **கதவுகள் மற்றும் ஜன்னல்கள் அடைத்துக்கொள்ளுதல்:** வீட்டின் அஸ்திவாரம் நகர்வதால் கதவு, ஜன்னல்களை அடைக்கவோ திறக்கவோ முடியாமல் போவது.\n\n⚠️ *இந்த அறிகுறிகளை கண்டால் ஒரு நிமிடம் கூட தாமதிக்காமல் மேடான பாதுகாப்பான இடத்திற்கு வெளியேறவும்!*`
        : `🚨 **Crucial Warning Signs & Precursor Indicators of Slope Failure:**\n\nMountain slopes rarely fail without detectable physical precursors. Watch for these life-saving indicators:\n\n• **Tension Cracks & Fissures:** Fresh or rapidly widening cracks appearing in paved roads, foundations, retaining walls, or on the crown of the slope.\n• **Slope Toe Bulging:** Noticeable upward bulging or heaving of asphalt and soil at the base of cut slopes.\n• **Tilting Structures & Trees:** Utility poles, telephone posts, boundary fences, or trees visibly leaning downhill or curving.\n• **Sudden Hydrological Anomalies:** Springs, seeps, or wet spots emerging in places that have always been dry; sudden clouding or mud in spring water.\n• **Anomalous Stream Flow Changes:** A sudden drop or disappearance in stream water levels indicates an upstream debris damming—often followed by a sudden catastrophic flood surge.\n• **Subterranean Rumbling:** Deep cracking sounds of tree roots snapping or subterranean grinding/rumbling audible from the hillside.\n• **Sticking Doors & Windows:** Structural framing distortion caused by differential soil subsidence under foundations.\n\n⚠️ *If you observe multiple indicators, evacuate immediately to safe high ground and notify authorities via Citizen Reporting!*`;

      return {
        message: signsMsg,
        intent: "WARNING_SIGNS",
        sources: ["NDMA Precursor Identification Protocol", "Geological Survey of India"],
        actionButtons: [
          { label: "📢 Submit Citizen Report", action: "SUBMIT_REPORT" },
          { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" },
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" }
        ],
        suggestedQuestions: ["What should I do during a landslide warning?", "Emergency kit checklist", "Emergency helpline numbers"],
        isDemoMode: true
      };
    }

    // 18. Mitigation, Prevention & Slope Stabilization
    if (textLower.includes("prevent") || textLower.includes("mitigat") || textLower.includes("stabiliz") || textLower.includes("retaining wall") || textLower.includes("gabion") || textLower.includes("soil nail") || textLower.includes("rock bolt") || textLower.includes("stop landslide") || textLower.includes("தடுப்பது எப்படி") || textLower.includes("தடுப்பு")) {
      const prevMsg = isTa
        ? `🛡️ **நிலச்சரிவு தடுப்பு மற்றும் சரிவு உறுதிப்படுத்தல் முறைகள் (Mitigation Engineering):**\n\nபுவித்தொழில்நுட்பப் பொறியியல் (Geotechnical Engineering) மூலம் நிலச்சரிவு அபாயங்களை கணிசமாகக் குறைக்கலாம்:\n\n1. **முறையான வடிகால் அமைப்புகள் (Drainage Systems - மிக முக்கியமானது):**\n• மேல்மட்ட நீர்ப்பிடிப்பு வடிகால்கள் (Catchwater Drains) மூலம் மழைநீரை சரிவில் இருந்து பாதுகாப்பாக வெளியேற்றுதல்.\n• துளையிடப்பட்ட கிடைமட்ட குழாய்கள் (Horizontal Drains) மூலம் நிலத்தடி துளை நீர் அழுத்தத்தைக் குறைத்தல்.\n\n2. **கபியன் சுவர்கள் (Gabion Retaining Walls):**\nகம்பி வலை கூண்டுகளுக்குள் பாறாங்கற்களை அடுக்கி கட்டப்படும் நெகிழ்வான சுவர்கள். இவை நிலத்தின் எடையைத் தாங்குவதோடு நீரை தானாகவே வெளியேற அனுமதிக்கின்றன.\n\n3. **மண் ஆணி பொருத்துதல் மற்றும் பாறை போல்டிங் (Soil Nailing & Rock Bolting):**\nசெங்குத்தான பாறைகளில் எஃகு கம்பிகளை ஆழமாக செலுத்தி சிமெண்ட் குழம்பால் இறுக்கி, மேற்பரப்பில் கான்கிரீட் தெளித்தல் (Shotcrete).\n\n4. **உயிரியல் பொறியியல் (Bio-Engineering):**\nஆழமாக வேரூன்றும் வெட்டிவேர் (Vetiver Grass) போன்ற தாவரங்களை நட்டு மேல்மண் அரிப்பைத் தடுத்தல்.\n\n5. **சரிவு படிநிலை அமைத்தல் (Benching / Terracing):**\nசெங்குத்தான மலைகளை பனிப்பொழிவு/சரிவு அழுத்தத்தைக் குறைக்க படிகளாக மாற்றுதல்.`
        : `🛡️ **Landslide Mitigation & Slope Stabilization Engineering:**\n\nEffective geotechnical mitigation involves structural support, hydrological management, and bio-engineering:\n\n1. **Surface & Sub-Surface Drainage (The Most Critical Measure):**\n• **Catchwater Drains:** Concrete contour trenches intercepting surface runoff before it reaches vulnerable faces.\n• **Perforated Horizontal Drain Pipes:** Drilled 15–30 meters into hillslopes to relieve hydrostatic pore-water pressure.\n\n2. **Flexible Gabion Retaining Walls:**\nHeavy-duty wire mesh cages filled with angular quarry stones. They provide massive retaining counterweight while remaining porous, allowing groundwater to weep freely without hydrostatic buildup.\n\n3. **Soil Nailing & Reinforced Shotcrete:**\nInstalling threaded steel tendon bars deep into stable bedrock, tensioned with bearing plates, and covered with wire mesh and pneumatically sprayed shotcrete.\n\n4. **Bio-Engineering with Deep-Rooting Flora:**\nPlanting dense rows of **Vetiver grass** (*Chrysopogon zizanioides*) whose high-tensile 3–4 meter root network acts as live soil nails, reducing erosion by >90%.\n\n5. **Slope Terracing & Benching:**\nExcavating slopes into progressive flat benches with drainage channels to reduce gravitational driving shear stress.`;

      return {
        message: prevMsg,
        intent: "PREVENTION_MITIGATION",
        sources: ["Central Road Research Institute (CRRI)", "Indian Geotechnical Society (IGS)"],
        actionButtons: [
          { label: "🧠 Open AI Prediction Model", action: "VIEW_PREDICTION" },
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" }
        ],
        suggestedQuestions: ["Can trees prevent landslides?", "What causes a landslide?", "How do sensors work?"],
        isDemoMode: true
      };
    }

    // 19. Trees, Bio-Engineering & Deforestation
    if (textLower.includes("tree") || textLower.includes("vegetation") || textLower.includes("roots") || textLower.includes("vetiver") || textLower.includes("deforestation") || textLower.includes("afforestation") || textLower.includes("மரம்") || textLower.includes("காடழிப்பு")) {
      const treeMsg = isTa
        ? `🌳 **மரங்கள் மற்றும் தாவரங்கள் நிலச்சரிவைத் தடுக்குமா?**\n\n**ஆம், ஆனால் குறிப்பிட்ட வரம்புகளுக்கு உட்பட்டு:**\n\n1. **மரங்களின் நன்மைகள்:**\n• **வேர் பிணைப்பு வலிமை (Root Cohesion):** மரங்களின் அடர்ந்த வேர் அமைப்புகள் மேலோட்டமான மண்ணை (Shallow Soil < 2m) பிணைத்து இழுவிசை வலிமையை (Tensile Strength) வழங்குகின்றன.\n• **மழைநீர் உறிஞ்சுதல் (Hydrological Sponge):** மரங்களின் இலைகள் மழையின் வேகத்தைக் குறைக்கின்றன; வேர்கள் நீரை உறிஞ்சி டிரான்ஸ்பிரேஷன் மூலம் ஆவியாக்குகின்றன.\n• **வெட்டிவேர் (Vetiver):** 3-4 மீட்டர் ஆழம் வரை பாயும் வெட்டிவேர் புல் மண் அரிப்பை முற்றிலுமாகத் தடுக்கிறது.\n\n2. **வரம்புகள் (ஆழமான நிலச்சரிவுகள்):**\n• 5 மீட்டருக்கும் ஆழமான பாறை வெடிப்புகளில் ஏற்படும் நிலச்சரிவுகளை மரங்களின் வேர்களால் தடுத்து நிறுத்த முடியாது.\n• மிக செங்குத்தான சரிவுகளில் (>40°), கனமழையால் மண் உப்பியிருக்கும் போது அதிக எடையுள்ள பெருமரங்கள் கூடுதல் சுமையாக மாறி சரிவை இழுத்துவிடவும் கூடும்.\n\n3. **காடழிப்பின் விளைவு:**\nமலைச்சரிவுகளில் காடுகளை அழிக்கும் போது, அழுகும் வேர் அமைப்புகள் 3-5 ஆண்டுகளில் வலுவிழந்து நிலச்சரிவு நிகழ்வுகளை **300% வரை அதிகரிக்கின்றன**.`
        : `🌳 **Can Trees and Vegetation Prevent Landslides?**\n\n**Yes, with important geotechnical nuances:**\n\n1. **Mechanisms of Protection (Shallow Slopes < 2.5m Depth):**\n• **Mechanical Root Reinforcement:** Taproots and dense lateral root networks anchor topsoil to underlying regolith, adding significant apparent soil cohesion (up to 15–20 kPa).\n• **Hydrological Depressurization:** Canopy interception reduces direct raindrop impact, while evapotranspiration actively sucks moisture out of the vadose zone, keeping the water table low.\n• **Vetiver Grass (Nature's Soil Nail):** Vetiver roots possess a tensile strength of 75 MPa (equivalent to mild steel) and penetrate 3–4 meters vertically without invading crops.\n\n2. **Geotechnical Limitations (Deep-Seated Failures > 5m Depth):**\n• Deep rotational slides shear far below tree root depths (at bedrock interfaces).\n• On saturated slopes steeper than 40°, mature heavy trees can add surcharge weight and wind-leverage forces that exacerbate slope overturning.\n\n3. **The Danger of Deforestation:**\nClear-cutting hill slopes causes decaying root networks within 3–7 years, increasing landslide frequency by **300% to 500%**.`;

      return {
        message: treeMsg,
        intent: "BIO_ENGINEERING",
        sources: ["Forest Survey of India", "Geological Survey of India Bio-Engineering Guild"],
        actionButtons: [
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" },
          { label: "🧠 Open AI Prediction Model", action: "VIEW_PREDICTION" }
        ],
        suggestedQuestions: ["How to prevent landslides?", "What causes a landslide?", "What is the current risk?"],
        isDemoMode: true
      };
    }

    // 20. Emergency Kit & Go-Bag Supplies
    if (textLower.includes("kit") || textLower.includes("go bag") || textLower.includes("go-bag") || textLower.includes("pack") || textLower.includes("supplies") || textLower.includes("checklist") || textLower.includes("backpack") || textLower.includes("survival") || textLower.includes("தயார்நிலை") || textLower.includes("அவசர பை")) {
      const kitMsg = isTa
        ? `🎒 **நிலச்சரிவு அவசர கால பாதுகாப்பு பை (Emergency Go-Bag Checklist):**\n\nமலைப்பகுதிகளில் வசிப்பவர்கள் ஒவ்வொருவரும் 72 மணி நேர அவசர உதவி பையை எப்போதும் தயாராக வைத்திருக்க வேண்டும்:\n\n1. **குடிநீர் & உணவு:**\n• ஒரு நபருக்கு ஒரு நாளைக்கு 3 லிட்டர் குடிநீர் (3 நாட்களுக்கு)\n• கெடாத உலர் உணவுகள், பிஸ்கட், எனர்ஜி பார்கள், ORS பாக்கெட்டுகள்\n\n2. **முதலுதவி & மருந்துகள்:**\n• பஞ்சு, பேண்டேஜ், ஆன்டிசெப்டிக் கிரீம், கிருமிநாசினி, வலி நிவாரணிகள்\n• குடும்ப உறுப்பினர்களின் 7 நாட்களுக்கான தினசரி அத்தியாவசிய மருந்துகள்\n\n3. **வெளிச்சம் & மின்சாரம்:**\n• சக்திவாய்ந்த LED டார்ச் லைட் மற்றும் கூடுதல் பேட்டரிகள்\n• முழுமையாக சார்ஜ் செய்யப்பட்ட பவர் பேங்க் (Power Bank)\n• வானொலிப் பெட்டி (AM/FM Battery Radio)\n\n4. **அடையாள ஆவணங்கள் & பணம்:**\n• ஆதார், நிலப் பட்டா, வங்கி ஆவணங்கள், குடும்ப அட்டை (நீர்புகா கவரில்)\n• அவசரத் தேவைக்கான ரொக்கப் பணம் (ஏடிஎம்கள் செயல்படாது)\n\n5. **பாதுகாப்பு உடைகள் & உபகரணங்கள்:**\n• விசில் (Whistle - இடிபாடுகளில் சிக்கினால் மீட்புக் குழுவை அழைக்க)\n• ரெயின்கோட் / மழை அங்கி, தடிமனான காலணிகள், வேலை கையுறைகள், கதகதப்பான போர்வைகள்.`
        : `🎒 **Landslide Emergency Go-Bag Checklist (72-Hour Survival Kit):**\n\nEvery household in landslide-susceptible hilly sectors should maintain a grab-and-go disaster backpack packed with these essentials:\n\n1. **Hydration & High-Calorie Nutrition:**\n• Water: Minimum 3 liters per person per day (sealed bottles or water purification tablets)\n• High-energy, non-perishable food (granola bars, dried fruits, nut mixes, ready-to-eat pouches)\n\n2. **Medical & Sanitation Supplies:**\n• Comprehensive First Aid Kit (sterile gauze, tourniquet, antiseptic, band-aids, ORS)\n• Minimum 7-day supply of critical personal prescription medications\n• N95 dust masks, hand sanitizer, and moist towelettes\n\n3. **Illumination & Communications:**\n• Heavy-duty waterproof LED flashlight with extra alkaline batteries\n• Hand-crank or battery-powered AM/FM emergency weather radio\n• Fully charged 20,000mAh Power Bank and charging cables\n\n4. **Critical Documents & Liquid Cash:**\n• Waterproof sealed pouch containing Aadhaar/Passport IDs, insurance policies, property deeds\n• Emergency cash in small denominations (ATMs and UPI go offline during landslides)\n\n5. **Personal Safety Gear:**\n• High-decibel survival whistle (vital for signaling search and rescue dogs/teams)\n• Heavy-duty rain poncho, thermal foil emergency blankets, sturdy trekking boots, work gloves.`;

      return {
        message: kitMsg,
        intent: "EMERGENCY_KIT",
        sources: ["NDMA Disaster Preparedness Guild", "Red Cross International"],
        actionButtons: [
          { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" },
          { label: "📢 Submit Citizen Report", action: "SUBMIT_REPORT" }
        ],
        suggestedQuestions: ["Emergency helpline numbers", "What should I do during a warning?", "What are the warning signs?"],
        isDemoMode: true
      };
    }

    // 21. Emergency Helplines & Rescue Contacts
    if (textLower.includes("helpline") || textLower.includes("emergency number") || textLower.includes("contact") || textLower.includes("phone number") || textLower.includes("who to call") || textLower.includes("ndrf") || textLower.includes("sdrf") || textLower.includes("control room") || textLower.includes("toll free") || textLower.includes("112") || textLower.includes("1077") || textLower.includes("உதவி எண்")) {
      const helpMsg = isTa
        ? `📞 **அவசர உதவி எண்கள் & மீட்புக் குழு தொடர்பு விபரம் (24x7 Helplines):**\n\nநிலச்சரிவு அல்லது பேரிடர் அவசர காலங்களில் உடனடியாக தொடர்பு கொள்ள வேண்டிய எண்கள்:\n\n• **தேசிய அவசர உதவி எண் (Police, Fire, Ambulance):** **112**\n• **மாவட்ட பேரிடர் கட்டுப்பாட்டு அறை (DDMA Helpline):** **1077** (கட்டணமில்லா எண்)\n• **மாநில பேரிடர் அவசர கட்டுப்பாட்டு மையம் (SDMA):** **1070**\n• **ஆம்புலன்ஸ் அவசர சிகிச்சை:** **108**\n• **தீயணைப்பு & மீட்புப்படை:** **101**\n• **நீலகிரி மாவட்ட கட்டுப்பாட்டு அறை:** **0423-2450034** / **0423-2450035**\n• **வயநாடு மாவட்ட கட்டுப்பாட்டு அறை:** **04936-204151** / **8078409770**\n• **தேசிய பேரிடர் மீட்புப் படை (NDRF HQ Control Room):** **011-24363260** / **9711077372**\n• **மாநில நெடுஞ்சாலை கட்டுப்பாட்டு மையம்:** **1800-425-4422**\n\n⚠️ *அவசர ஆபத்தில் இருக்கும் போது உங்கள் சரியான இருப்பிடம் மற்றும் சூழ்நிலையை தெளிவாக விளக்குங்கள்.*`
        : `📞 **Emergency Disaster Helplines & Rescue Contacts (24/7 Hotlines):**\n\nKeep these emergency numbers on speed dial during severe weather and landslide alerts:\n\n• **Unified National Emergency Response System:** **112** (Police, Fire, Medical, Rescue)\n• **District Disaster Management Authority (DDMA / DEOC):** **1077** (Toll-Free in all districts)\n• **State Emergency Operations Centre (SEOC):** **1070**\n• **Emergency Medical / Ambulance:** **108**\n• **Fire & Mountain Rescue:** **101**\n• **Nilgiris District Emergency Cell (Ooty/Coonoor):** **0423-2450034** / **1077**\n• **Wayanad District Disaster Cell (Kalpetta):** **04936-204151** / **1077**\n• **National Disaster Response Force (NDRF 24x7 Control Room):** **011-24363260** / **9711077372**\n• **State Highways & BRO Landslide Clearance Helpdesk:** **1800-425-4422**\n\n⚠️ *When calling, provide your landmark, GPS coordinates if possible, number of persons stranded, and active road conditions.*`;

      return {
        message: helpMsg,
        intent: "HELPLINES",
        sources: ["NDMA Directory", "State Disaster Management Authorities (TN & Kerala)"],
        actionButtons: [
          { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" },
          { label: "📢 Submit Citizen Report", action: "SUBMIT_REPORT" }
        ],
        suggestedQuestions: ["Emergency kit checklist", "What should I do during a warning?", "What is the current risk?"],
        isDemoMode: true
      };
    }

    // 22. Hill Travel & Ghat Road Driving Safety
    if (textLower.includes("travel") || textLower.includes("driving") || textLower.includes("ghat road") || textLower.includes("drive") || textLower.includes("road trip") || textLower.includes("highway") || textLower.includes("passable") || textLower.includes("visit") || textLower.includes("பயணம்") || textLower.includes("வாகனம்") || textLower.includes("கார்") || textLower.includes("சாலை")) {
      const travelMsg = isTa
        ? `🚗 **மலைப்பாதை & காட் ரோடு (Ghat Road) பயணப் பாதுகாப்பு வழிகாட்டுதல்கள்:**\n\nகனமழை அல்லது ஆரஞ்சு/சிவப்பு எச்சரிக்கை உள்ள காலங்களில் மலைப்பாதைகளில் பயணிப்பது மிகவும் ஆபத்தானது:\n\n1. **இரவு நேரப் பயணத்தை முற்றிலும் தவிர்க்கவும்:**\nஇரவு 8 மணி முதல் காலை 6 மணி வரை மலைப்பாதைகளில் பயணிக்க வேண்டாம். இருளில் திடீரென விழும் பாறைகள் மற்றும் மண் சரிவுகளைக் காண முடியாது.\n\n2. **பாறை முகடுகளின் கீழ் வாகனங்களை நிறுத்த வேண்டாம்:**\nசெங்குத்தான வெட்டுக்கள், அருவிகள் அல்லது வடிகால்களின் கீழ் புகைப்படம் எடுக்கவோ ஓய்வெடுக்கவோ வாகனங்களை ஒருபோதும் நிறுத்தாதீர்கள்.\n\n3. **முன்னோக்கி செல்லும் சாலையை கவனிக்கவும்:**\nதார் சாலையில் புதிய விரிசல்கள், சேறு கலந்த நீர் வழிந்தோடல் அல்லது மேலிருந்து உருண்டு விழும் சிறு கற்களைக் கண்டால் உடனே பின்வாங்கவும்.\n\n4. **முன் செல்லும் வாகனத்துடன் இடைவெளி:**\nவழக்கத்தை விட 4 மடங்கு அதிக இடைவெளியைப் பராமரிக்கவும்.\n\n5. **அதிகாரப்பூர்வ போக்குவரத்து அறிவிப்புகள்:**\nநீலகிரி (NH-67), வயநாடு (Thamarassery Churam), அல்லது மூணார் கேப் ரோடு போன்ற பாதைகளில் மாவட்ட காவல்துறை வழங்கும் நேரலை அறிவுறுத்தல்களைப் பின்பற்றவும்.`
        : `🚗 **Ghat Road & Mountain Travel Safety Advisories:**\n\nNavigating mountainous corridors during active monsoon or Orange/Red Alert periods requires strict precautions:\n\n1. **Strictly Avoid Night Transit (8:00 PM – 6:00 AM):**\nZero visibility of cascading debris, rolling boulders, and unlit washed-out road shoulders makes night driving exceptionally perilous.\n\n2. **Never Park Under Escarpments or Cut Slopes:**\nAvoid pulling over under sheer rock faces, waterfall runoff culverts, or overhangs for sightseeing or photography.\n\n3. **Scan for Precursor Road Hazards:**\nWatch for fresh asphalt fissures, localized road sinking, muddy water sheeting across tarmac, or small pebbles rolling off slopes.\n\n4. **Maintain Ample Vehicle Spacing:**\nKeep at least 4 to 5 vehicle lengths between you and the lead car to permit emergency U-turns or sudden stops if a debris surge occurs.\n\n5. **Consult Official Road Status:**\nCheck District Police and BRO alerts for routes like NH-67 (Coonoor Ghat), Thamarassery Churam (Wayanad), or Gap Road (Munnar) prior to departure.`;

      return {
        message: travelMsg,
        intent: "TRAVEL_ADVISORY",
        sources: ["Highways Department & Traffic Police Protocols", "NDMA Monsoon Travel Guidelines"],
        actionButtons: [
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" },
          { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" }
        ],
        suggestedQuestions: ["What is the current risk?", "Emergency helpline numbers", "What are the warning signs?"],
        isDemoMode: true
      };
    }

    // 23. Scientific Sensors & In-Situ Instrumentation
    if (textLower.includes("sensor") || textLower.includes("piezometer") || textLower.includes("tiltmeter") || textLower.includes("tdr") || textLower.includes("extensometer") || textLower.includes("rain gauge") || textLower.includes("doppler") || textLower.includes("telemetry") || textLower.includes("instrument") || textLower.includes("சென்சார்") || textLower.includes("கருவிகள்")) {
      const sensorMsg = isTa
        ? `📡 **நிலச்சரிவு கண்காணிப்பில் பயன்படுத்தப்படும் அதிநவீன சென்சார்கள்:**\n\nஎங்கள் அமைப்பில் களத்தில் நிறுவப்பட்டுள்ள அதிநவீன IoT சென்சார்கள் நிகழ்நேர எச்சரிக்கைகளை வழங்குகின்றன:\n\n1. **பைசோமீட்டர்கள் (Vibrating Wire Piezometers):**\nஆழ்துளை கிணறுகளில் 10-30 மீட்டர் ஆழத்தில் பொருத்தப்பட்டு, நிலத்தடி நீரின் துளை நீர் அழுத்தத்தை (Pore-Water Pressure) துல்லியமாக அளவிடுகின்றன.\n\n2. **TDR மண் ஈரப்பதம் சென்சார்கள் (Time-Domain Reflectometry):**\nமண்ணின் வெவ்வேறு அடுக்குகளில் (0.5m, 1m, 2m) மின்காந்த அலைகள் மூலம் நீர் செறிவை (Soil Saturation) கணக்கிடுகின்றன.\n\n3. **டில்ட்மீட்டர்கள் & இன்க்ளினோமீட்டர்கள் (Biaxial Inclinometers):**\nமலைச்சரிவின் சாய்வுக் கோணத்தில் ஏற்படும் மில்லிமீட்டர் அளவிலான மாற்றங்களை 0.001° துல்லியத்தில் கண்டறிகின்றன.\n\n4. **தானியங்கி வானிலை நிலையங்கள் (Automatic Weather Stations - AWS):**\nடேட்டா லாக்கர் மூலம் 24 மணி நேர தொடர் மழைப்பொழிவு மற்றும் மழையின் தீவிரத்தை (Rainfall Rate) நொடிக்கு நொடி பதிவு செய்கின்றன.\n\n5. **டூப்ளர் வானிலை ரேடார் (Doppler Radar):**\nமேகக்கூட்டங்களின் அடர்த்தி மற்றும் அடுத்த சில மணி நேரங்களில் பெய்யவிருக்கும் அதிதீவிர மழையை முன்னரே கணிக்கிறது.`
        : `📡 **In-Situ Geotechnical Sensors & Environmental Telemetry Network:**\n\nOur real-time monitoring infrastructure deploys multi-depth telemetry arrays across vulnerable pilot slopes:\n\n1. **Vibrating Wire Piezometers:**\nInstalled inside boreholes at 10–30m depths to continuously log hydrostatic **pore-water pressure (kPa)** along the critical slip surface.\n\n2. **TDR Soil Moisture Probes (Time-Domain Reflectometry):**\nMeasure volumetric water content by logging the dielectric permittivity of soil across vertical profiles (0.5m, 1.0m, and 2.0m).\n\n3. **Bi-Axial Tiltmeters & In-Place Inclinometers (IPI):**\nDetect sub-millimeter angular deflections (down to 0.001°) in slope geometry and structural retaining walls.\n\n4. **Automated Weather Stations (AWS):**\nTipping-bucket rain gauges logging 15-minute precipitation intensity and rolling 24h / 7d cumulative rainfall.\n\n5. **Subsurface Wire Extensometers & Geophones:**\nMonitor tension crack dilation and high-frequency micro-acoustic emissions caused by shear friction prior to mass failure.`;

      return {
        message: sensorMsg,
        intent: "SENSORS_INSTRUMENTATION",
        sources: ["Geotechnical Sensor Telemetry Array", "IMD Telemetry Network"],
        actionButtons: [
          { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" },
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" }
        ],
        suggestedQuestions: ["Check soil moisture", "Check rainfall", "How does AI predict landslides?"],
        isDemoMode: true
      };
    }

    // 24. Satellites, InSAR & Google Earth Engine
    if (textLower.includes("satellite") || textLower.includes("insar") || textLower.includes("sentinel") || textLower.includes("gee") || textLower.includes("google earth engine") || textLower.includes("remote sensing") || textLower.includes("radar") || textLower.includes("செயற்கைக்கோள்")) {
      const satMsg = isTa
        ? `🛰️ **செயற்கைக்கோள் மற்றும் Google Earth Engine (GEE) கண்காணிப்பு:**\n\nநிலச்சரிவுகளை விண்வெளியில் இருந்து துல்லியமாகக் கண்காணிக்க மேம்பட்ட விண்வெளித் தொழில்நுட்பங்களைப் பயன்படுத்துகிறோம்:\n\n1. **Sentinel-1 InSAR (Synthetic Aperture Radar):**\nESA-வின் சென்டினல்-1 ரேடார் மேகங்களையும் மழையையும் ஊடுருவி, பூமியின் மேற்பரப்பில் நிகழும் **மில்லிமீட்டர் அளவிலான தரை நகர்வுகளை** (Ground Displacement) துல்லியமாகக் கணக்கிடுகிறது.\n\n2. **Google Earth Engine (GEE) கிளவுட் கம்பியூட்டிங்:**\nபெட்டாபைட் அளவிலான பூமி கண்காணிப்புத் தரவுகளை நொடிகளில் பகுப்பாய்வு செய்து, நிலப்பரப்பு சாய்வு (Slope), நீர் வழிந்தோடும் திசை (Flow Accumulation) மற்றும் மண் வறட்சி குறியீடுகளைத் தருகிறது.\n\n3. **NASA SRTM 30m Digital Elevation Model (DEM):**\nமலைகளின் துல்லியமான 3D நிலப்பரப்பு, உயரம் மற்றும் செங்குத்து கோணங்களை வரைபடமாக்குகிறது.\n\n4. **Sentinel-2 NDVI தாவர குறியீடு:**\nமலைச்சரிவுகளில் உள்ள தாவரங்களின் அடர்த்தி, காடழிப்பு மற்றும் நிலச்சரிவு வடுக்களை (Landslide Scars) ஒளியியல் முறையில் கண்காணிக்கிறது.`
        : `🛰️ **Satellite Remote Sensing, InSAR & Google Earth Engine Pipeline:**\n\nOur platform leverages spaceborne Earth observation to monitor vast mountain ranges continuously:\n\n1. **Sentinel-1 C-Band InSAR (Interferometric Synthetic Aperture Radar):**\nEmits microwave radar pulses that penetrate cloud cover and heavy rain. By computing phase interferograms between 12-day orbital revisits, it measures line-of-sight **ground subsidence down to 1–2 millimeters**.\n\n2. **Google Earth Engine (GEE) Cloud Processing:**\nExecutes petabyte-scale geospatial algorithms in real-time, computing topographic wetness indices (TWI), terrain aspect, and hydrological catchment boundaries.\n\n3. **NASA SRTM 30m Digital Elevation Model (DEM):**\nProvides high-resolution morphometric modeling to calculate slope inclination and curvature tensors.\n\n4. **Sentinel-2 Multispectral MSI (NDVI / NDWI):**\nTracks vegetation stress, canopy degradation, and bare soil scarring indicating nascent tension cracks.`;

      return {
        message: satMsg,
        intent: "SATELLITE_INSAR",
        sources: ["ESA Copernicus Sentinel-1 & 2", "Google Earth Engine", "NASA SRTM DEM"],
        actionButtons: [
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" },
          { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" }
        ],
        suggestedQuestions: ["How does AI predict landslides?", "Check slope", "What is the current risk?"],
        isDemoMode: true
      };
    }

    // 25. AI Prediction Models & Machine Learning
    if (textLower.includes("machine learning") || textLower.includes("ai predict") || textLower.includes("algorithm") || textLower.includes("model") || textLower.includes("xgboost") || textLower.includes("lstm") || textLower.includes("neural") || textLower.includes("deep learning") || textLower.includes("எப்படி கணிக்கிறது")) {
      const aiMsg = isTa
        ? `🧠 **எங்கள் AI நிலச்சரிவு கணிப்பு மாதிரி (Machine Learning Architecture):**\n\nஇந்த அமைப்பு **இரு அடுக்கு கூட்டு AI மாதிரி (Dual-Tier Ensemble Pipeline)** மூலம் அபாயத்தை முன்னரே கணிக்கிறது:\n\n1. **XGBoost (நிலப்பரப்பு எளிதில் பாதிக்கப்படும்தன்மை):**\nநிலையான புவியியல் காரணிகளான சாய்வு கோணம் (Slope), பாறை அமைப்பு (Lithology), உயரம் (Elevation), மற்றும் வரலாற்று நிலச்சரிவு வடுக்களை அடிப்படையாகக் கொண்டு பகுப்பாய்வு செய்கிறது.\n\n2. **Bidirectional LSTM (டைம்-சீரிஸ் டைனமிக் தூண்டிகள்):**\nகடந்த 7 நாட்களின் மழைப்பொழிவு, மண்ணின் நீர் செறிவு, மற்றும் துளை நீர் அழுத்தத்தில் ஏற்படும் தொடர் மாற்றங்களை நரம்பியல் நெட்வொர்க் மூலம் ஆய்வு செய்கிறது.\n\n3. **எடை பங்கீட்டு சூத்திரம் (Weighted Susceptibility Index):**\n• 24h & ஒட்டுமொத்த மழைப்பொழிவு: **32%**\n• மண் ஈரப்பதம் & செறிவு: **24%**\n• SRTM DEM சாய்வு செங்குத்து: **18%**\n• நிலவியல் & தாவர அடர்த்தி: **16%**\n• வரலாற்று நிலச்சரிவு பதிவுகள்: **10%**\n\nகள சோதனைகளில் இந்த மாதிரி **94.2% துல்லியத்துடன் (AUC-ROC)** நிலச்சரிவுகளை முன்னறிவித்துள்ளது.`
        : `🧠 **AI Machine Learning Architecture & Geotechnical Predictive Pipeline:**\n\nThe prediction engine employs a calibrated **dual-tier ensemble architecture**:\n\n1. **XGBoost Classifier (Static Spatial Susceptibility):**\nProcesses static geospatial matrices including SRTM slope gradients, lithological shear strength, topographic wetness index (TWI), and distance to historical landslide scars.\n\n2. **Bidirectional LSTM Network (Dynamic Temporal Triggers):**\nIngests 7-day multi-sensor time series (cumulative precipitation curves, TDR moisture dynamics, and piezometer pore pressures) to capture non-linear hydrological lag.\n\n3. **Multi-Factor Risk Weighting Matrix:**\n• **Precipitation Telemetry (24h & 7d):** **32% Weight**\n• **Subsurface Soil Saturation:** **24% Weight**\n• **Terrain Slope Gradient (SRTM DEM):** **18% Weight**\n• **Lithology & NDVI Canopy Cover:** **16% Weight**\n• **Historical Incident Proximity:** **10% Weight**\n\nValidated against GSI landslide inventories with **94.2% AUC-ROC accuracy**.`;

      return {
        message: aiMsg,
        intent: "AI_ARCHITECTURE",
        sources: ["LS-Ensemble v2.4 (XGBoost + Bi-LSTM)", "Geotechnical Validation Benchmark"],
        actionButtons: [
          { label: "🧠 Open AI Prediction Model", action: "VIEW_PREDICTION" },
          { label: "📈 View Risk Trends", action: "VIEW_TRENDS" },
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" }
        ],
        suggestedQuestions: ["Explain the risk score", "What is the current risk?", "What causes a landslide?"],
        isDemoMode: true
      };
    }

    // 26. Pore-Water Pressure & Geomechanics
    if (textLower.includes("pore water") || textLower.includes("pore pressure") || textLower.includes("hydrostatic") || textLower.includes("effective stress") || textLower.includes("துளை நீர் அழுத்தம்")) {
      const poreMsg = isTa
        ? `💧 **துளை நீர் அழுத்தம் (Pore-Water Pressure) மற்றும் அதன் ஆபத்து:**\n\nதுளை நீர் அழுத்தம் என்பது மண்ணின் துகள்களுக்கு இடையே உள்ள இடைவெளியில் (Pores) தேங்கும் நீரினால் உருவாக்கப்படும் அழுத்தமாகும்.\n\n**டெர்சாகி புவித்தொழில்நுட்ப விதி (Terzaghi's Law):**\n• **பயனுள்ள அழுத்தம் = மொத்த அழுத்தம் - துளை நீர் அழுத்தம்** (Effective Stress = Total Stress - Pore Pressure)\n• உலர்ந்த நிலையில் மண் துகள்கள் ஒன்றுடன் ஒன்று உராய்ந்து உறுதியாக இருக்கும்.\n• மழைநீர் மண்ணில் ஊடுருவும் போது துளை நீர் அழுத்தம் உயர்ந்து, மண் துகள்களை விலக்கி தள்ளுகிறது.\n• இதனால் மண்ணின் வெட்டு வலிமை பூஜ்ஜியமாகி, நிலப்பரப்பு திடீரென திரவமாக மாறி (Soil Liquefaction) சரிந்து விழுகிறது.\n\nஅதனால்தான் எங்கள் அமைப்பில் ஆழ்துளை பைசோமீட்டர்கள் மூலம் துளை நீர் அழுத்தம் தொடர்ச்சியாக கண்காணிக்கப்படுகிறது.`
        : `💧 **Understanding Pore-Water Pressure & Slope Liquefaction:**\n\n**Pore-water pressure ($u$)** is the hydrostatic pressure exerted by groundwater within the void spaces between soil grains.\n\n**Terzaghi's Principle of Effective Stress:**\n$$\\sigma' = \\sigma - u$$\n• Where $\\sigma'$ is effective stress (frictional holding strength) and $\\sigma$ is total overburden stress.\n• When rain infiltrates faster than slopes can drain, pore pressure ($u$) spikes upward.\n• As $u$ approaches total stress $\\sigma$, **effective frictional resistance collapses to near-zero**.\n• The saturated soil matrix instantaneously loses shear strength, transforming rigid mountain slopes into viscous, flowing slurry.\n\nThis is why in-situ piezometers are vital—they detect this fatal pressure build-up before any visible ground movement occurs.`;

      return {
        message: poreMsg,
        intent: "PORE_PRESSURE",
        sources: ["Terzaghi Geotechnical Soil Mechanics", "In-Situ Piezometer Network"],
        actionButtons: [
          { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" },
          { label: "🧠 Open AI Prediction Model", action: "VIEW_PREDICTION" }
        ],
        suggestedQuestions: ["Check soil moisture", "What causes a landslide?", "How do sensors work?"],
        isDemoMode: true
      };
    }

    // 27. Monsoon Dynamics & Antecedent Rain
    if (textLower.includes("monsoon") || textLower.includes("antecedent") || textLower.includes("cloudburst") || textLower.includes("rainy season") || textLower.includes("why during monsoon") || textLower.includes("climate change") || textLower.includes("பருவமழை") || textLower.includes("மழைக்காலம்")) {
      const monMsg = isTa
        ? `🌧️ **பருவமழை மற்றும் முன்னோடி மழைப்பொழிவு (Antecedent Rainfall):**\n\nநிலச்சரிவுகள் ஒற்றை மழைப்பொழிவால் மட்டுமே ஏற்படுவதில்லை; அவை **முன்னோடி மழைப்பொழிவின் (Antecedent Moisture)** கூட்டுவிளைவாகும்:\n\n1. **மண் செறிவு நிலை (Field Capacity):**\nபருவமழையின் முதல் 10–15 நாட்களில் பெய்யும் மழை மண்ணின் ஆழமான அடுக்குகளை நனைத்து 100% நீர் செறிவை உருவாக்குகிறது.\n\n2. **தூண்டுதல் புள்ளி (Threshold Trigger):**\nஏற்கனவே நனைந்த மலையில், திடீரென ஒரு நாளில் 100 மி.மீ-க்கு மேல் கனமழை பெய்யும் போது, புதிய நீரால் வெளியேற முடியாமல் நிலப்பரப்பு உடனடியாக சரிந்து விழுகிறது.\n\n3. **மேகவெடிப்பு & தீவிர வானிலை (Cloudbursts):**\nகுறுகிய நேரத்தில் பெய்யும் அதீத மழைப்பொழிவு (Rainfall Intensity > 50 mm/hour) வடிகால்களை மூழ்கடித்து பேரழிவை உருவாக்குகிறது.\n\nஅதனால்தான் எங்கள் அமைப்பு 24 மணி நேர மழையோடு சேர்த்து கடந்த 7 மற்றும் 30 நாட்களின் ஒட்டுமொத்த மழையையும் கணக்கிடுகிறது.`
        : `🌧️ **Monsoon Dynamics & Antecedent Rainfall Saturation:**\n\nCatastrophic landslides are almost never triggered by an isolated rain shower on dry soil. They require **antecedent cumulative saturation**:\n\n1. **Preparatory Soil Saturation Phase:**\nDuring the first 2 to 3 weeks of the monsoon, prolonged continuous rainfall saturates the deep regolith until soil moisture reaches **100% field capacity**.\n\n2. **The Breaking Threshold:**\nOnce the vadose zone is fully saturated, every additional millimeter of precipitation immediately converts into perched water tables and destructive pore-water pressure.\n\n3. **High-Intensity Cloudbursts:**\nWhen an intense convective burst (>50 mm/hr) hits a pre-saturated ridge, instantaneous liquefaction triggers massive debris flows.\n\nOur system computes both **24-hour flash intensity** and **7-day/30-day cumulative precipitation curves** to predict these critical transition points.`;

      return {
        message: monMsg,
        intent: "MONSOON_ANTECEDENT",
        sources: ["India Meteorological Department (IMD)", "GSI Threshold Model"],
        actionButtons: [
          { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" },
          { label: "📈 View Risk Trends", action: "VIEW_TRENDS" }
        ],
        suggestedQuestions: ["Check rainfall", "Check soil moisture", "What causes a landslide?"],
        isDemoMode: true
      };
    }

    // 28. Historical Disasters & Case Studies (Wayanad, Chamoli, Kedarnath)
    if (textLower.includes("wayanad") || textLower.includes("chamoli") || textLower.includes("kedarnath") || textLower.includes("malin") || textLower.includes("chooralmala") || textLower.includes("past disaster") || textLower.includes("historical landslide") || textLower.includes("வரலாறு") || textLower.includes("வயநாடு")) {
      const histMsg = isTa
        ? `📜 **வரலாற்று நிலச்சரிவு நிகழ்வுகள் & முக்கிய பாடங்கள் (Case Studies):**\n\nஇந்தியாவின் முக்கிய வரலாற்று நிலச்சரிவு நிகழ்வுகள் முன் எச்சரிக்கையின் முக்கியத்துவத்தை உணர்த்துகின்றன:\n\n1. **வயநாடு நிலச்சரிவு (ஜூலை 30, 2024 - சூரல்மலா & முண்டக்கை):**\n48 மணி நேரத்தில் பெய்த 570 மி.மீ அதீத கனமழையால், வெள்ளரிமலா மலையிலிருந்து உருவான ராட்சத இடிபாட்டுப் பாய்ச்சல் 6 கி.மீ தொலைவுக்கு பாய்ந்து 400-க்கும் மேற்பட்ட உயிர்களைப் பலிகொண்டது.\n\n2. **சமோலி பேரிடர் (பிப்ரவரி 2021, உத்தராகண்ட்):**\nநந்தாதேவி பனிப்பாறை பாறை வீழ்ச்சியால் உருவான திடீர் வெள்ளம் மற்றும் மண் சரிவு நீர்மின் நிலையங்களை அழித்தது.\n\n3. **மாலின் கிராம சரிவு (ஜூலை 2014, புனே):**\nஅதிகாலை பெய்த கனமழையால் முழு கிராமமும் சில நிமிடங்களில் மண்ணோடு மண்ணாக புதைந்தது.\n\n**கற்றுக்கொண்ட பாடங்கள்:**\n• மக்கள் தூங்கும் நள்ளிரவு அல்லது அதிகாலை நேரங்களிலேயே பெரும்பாலான நிலச்சரிவுகள் ஏற்படுகின்றன.\n• கள சென்சார்கள் மற்றும் AI அடிப்படையிலான 6–12 மணி நேர முன்னறிவிப்பு இருந்தால் மட்டுமே மக்களை பாதுகாப்பாக வெளியேற்ற முடியும்.`
        : `📜 **Historical Disaster Case Studies & Lessons Learned:**\n\nPast catastrophic slope failures underscore the urgent necessity of multi-sensor automated early warning:\n\n1. **Wayanad Disaster (July 30, 2024 - Chooralmala & Mundakkai):**\nOver 570 mm of extreme precipitation in 48 hours saturated the Vellarimala mountain ridge, unleashing a 6-kilometer catastrophic debris flow laden with thousands of boulders that claimed over 400 lives.\n\n2. **Chamoli Rock-Ice Avalanche (February 2021 - Uttarakhand):**\nA detached hanging glacier and rock wedge collapsed from Ronti Peak, triggering devastating debris flows down the Rishiganga and Dhauliganga valleys.\n\n3. **Malin Disaster (July 2014 - Pune, Maharashtra):**\nPre-dawn mudslide buried an entire village while residents slept, caused by heavy rain coupled with unscientific slope flattening for agriculture.\n\n**Key Takeaways:**\n• Most fatalities occur between midnight and dawn.\n• Automated multi-parameter telemetry capable of issuing warnings **6 to 12 hours ahead** is the only reliable way to save lives in mountainous regions.`;

      return {
        message: histMsg,
        intent: "HISTORICAL_CASE_STUDIES",
        sources: ["National Disaster Management Authority (NDMA Archive)", "GSI Disaster Reports"],
        actionButtons: [
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" },
          { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" }
        ],
        suggestedQuestions: ["What causes a landslide?", "What are the warning signs?", "What is the current risk?"],
        isDemoMode: true
      };
    }

    // 29. Citizen Reporting Guidance
    if (textLower.includes("citizen report") || textLower.includes("report landslide") || textLower.includes("submit report") || textLower.includes("crowdsource") || textLower.includes("upload photo") || textLower.includes("how to report") || textLower.includes("புகார்") || textLower.includes("தகவல் தெரிவிக்க")) {
      const repMsg = isTa
        ? `📢 **பொதுமக்கள் நிலச்சரிவு தகவல் தெரிவிப்பது எப்படி (Citizen Reporting Guide):**\n\nநீங்கள் உங்கள் பகுதியில் விரிசல்களையோ அல்லது சரிவு அறிகுறிகளையோ கண்டால், எங்கள் செயலி மூலம் நேரடியாக அதிகாரிகளுக்குத் தெரிவிக்கலாம்:\n\n1. **புகார் அளிக்கும் படிவத்தை திறக்கவும்:** கீழே உள்ள பட்டனை அழுத்தவும்.\n2. **இருப்பிடத்தைத் தேர்ந்தெடுக்கவும்:** GPS தானாகவே உங்கள் அட்சரேகை/தீர்க்கரேகையைப் பதிவு செய்யும்.\n3. **அறிகுறியைத் தேர்ந்தெடுக்கவும்:** புதிய விரிசல் (Tension Crack), பாறை உருளல், அல்லது சேற்று நீர் கசிவு.\n4. **புகைப்படத்தை பதிவேற்றவும்:** நிலத்தின் விரிசலை தெளிவாக படம் பிடித்து பதிவேற்றவும்.\n5. **அதிகாரப்பூர்வ நடவடிக்கை:** உங்கள் அறிக்கை உடனடியாக மாவட்ட கட்டுப்பாட்டு அறைக்கும் (DDMA) கள ஆய்வாளர்களுக்கும் அனுப்பப்படும்.`
        : `📢 **How to Submit a Citizen Landslide Precursor Report:**\n\nCommunity vigilance provides ground-truth validation for satellite telemetry. You can log observations in 3 easy steps:\n\n1. **Open Citizen Reports Form:** Click the action button below.\n2. **Verify Coordinates:** Your device automatically logs current GPS latitude and longitude.\n3. **Select Hazard Category:** Tension crack on road, tilting tree/pole, fresh seepage, or minor rockfall.\n4. **Upload Geo-Tagged Photo:** Capture a clear photo showing the extent of cracking or slope displacement.\n5. **Real-Time Verification:** Verified submissions immediately trigger field inspection dispatches by DDMA engineers.`;

      return {
        message: repMsg,
        intent: "CITIZEN_REPORTING_GUIDE",
        sources: ["Citizen Crowdsourcing Protocol v2.4"],
        actionButtons: [
          { label: "📢 Submit Citizen Report", action: "SUBMIT_REPORT" },
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" }
        ],
        suggestedQuestions: ["What are the warning signs?", "What should I do during a warning?", "What is the current risk?"],
        isDemoMode: true
      };
    }

    // 30. Living & Building on Hill Slopes
    if (textLower.includes("building") || textLower.includes("construction") || textLower.includes("house") || textLower.includes("foundation") || textLower.includes("slope cutting") || textLower.includes("live on hill") || textLower.includes("கட்டுமானம்") || textLower.includes("வீடு கட்ட")) {
      const constMsg = isTa
        ? `🏗️ **மலைப்பகுதிகளில் பாதுகாப்பான வீடு மற்றும் கட்டிடக் கட்டுமானம்:**\n\nமலைச்சரிவுகளில் கட்டிடம் கட்டுவதற்கு முன் கடைபிடிக்க வேண்டிய பாதுகாப்பு விதிகள்:\n\n1. **மண் பரிசோதனை (Geotechnical Soil Investigation):**\nகட்டுமானம் தொடங்கும் முன் ஆழ்துளை மூலம் பாறை ஆழம் மற்றும் வெட்டு வலிமையை பொறியாளர் மூலம் சோதிக்க வேண்டும்.\n\n2. **செங்குத்தாக வெட்டக்கூடாது:**\nமலையடிவாரத்தை 90 டிகிரியில் செங்குத்தாக வெட்டுவது மிகப்பெரிய தவறு. எப்போதும் படிகளாக (Terraced Benching) வெட்ட வேண்டும்.\n\n3. **நீர்வடிகால் ஏற்பாடுகள் (Weep Holes):**\nஅனைத்து தடுப்புச் சுவர்களிலும் நீர் வெளியேறுவதற்கான துளைகளை (Weep Holes) கட்டாயம் அமைக்க வேண்டும்.\n\n4. **கூரை மழைநீர் வடிகால்:**\nவீட்டின் கூரை மழைநீரை சரிவில் அப்படியே பாயவிடாமல், கான்கிரீட் குழாய்கள் மூலம் கீழ் பள்ளத்தாக்கிற்கு பாதுகாப்பாக அனுப்ப வேண்டும்.`
        : `🏗️ **Safe Construction & Living on Mountain Slopes:**\n\nBuilding in hilly terrains requires specialized civil and geotechnical engineering standards:\n\n1. **Mandatory Geotechnical Borehole Testing:**\nAlways conduct subsurface soil boring to establish bedrock depth, shear strength, and groundwater table prior to foundation excavation.\n\n2. **Never Cut Slope Toes Vertically:**\nExcavating vertical cuts destabilizes the entire upslope mass. Always implement stepped terrace profiles with reinforced retaining walls.\n\n3. **Perforated Weep Holes in Retaining Walls:**\nEvery retaining wall must include gravel-backed weep holes every 1.5 meters to prevent destructive hydrostatic pore-water pressure accumulation behind the masonry.\n\n4. **Channeled Stormwater Disposal:**\nNever allow roof or driveway runoff to discharge freely onto down-slope soil. Channel it into engineered masonry drains leading safely to natural valley outlets.`;

      return {
        message: constMsg,
        intent: "SLOPE_CONSTRUCTION",
        sources: ["National Building Code of India (NBC - Hill Architecture)", "CRRI Guidelines"],
        actionButtons: [
          { label: "🧠 Open AI Prediction Model", action: "VIEW_PREDICTION" },
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" }
        ],
        suggestedQuestions: ["How to prevent landslides?", "What causes a landslide?", "What is the current risk?"],
        isDemoMode: true
      };
    }

    // 31. Disaster Comparisons (Earthquake vs Flood vs Landslide)
    if (textLower.includes("earthquake") || textLower.includes("flood") || textLower.includes("tsunami") || textLower.includes("நிலநடுக்கம்") || textLower.includes("வெள்ளம்")) {
      const compMsg = isTa
        ? `🌐 **நிலச்சரிவு, வெள்ளம் மற்றும் நிலநடுக்கம் - வேறுபாடுகள்:**\n\n• **நிலச்சரிவு (Landslide):** ஈர்ப்பு விசை மற்றும் நீர் செறிவினால் மலைச்சரிவுகளில் இருந்து பாறைகள், மண் கீழ்நோக்கி சரிந்து விழுதல்.\n• **திடீர் வெள்ளம் (Flash Flood):** சமவெளி மற்றும் பள்ளத்தாக்குகளில் அதிக நீரினால் ஏற்படும் மூழ்குதல்.\n• **நிலநடுக்கம் (Earthquake):** புவித்தட்டுகள் நகர்வதால் ஏற்படும் நில அதிர்வு; இது பலவீனமான மலைகளில் நிலச்சரிவுகளையும் தூண்டக்கூடும்.\n\nஎங்கள் அமைப்பு குறிப்பாக **மழை மற்றும் நில அமைப்பால் உருவாகும் நிலச்சரிவு அபாயங்களை** முன்கூட்டியே கணிக்க வடிவமைக்கப்பட்டுள்ளது.`
        : `🌐 **Landslides vs. Earthquakes vs. Floods (Hazard Comparison):**\n\n• **Landslides:** Gravitational mass movements of rock, soil, and debris driven by steep gradients, saturation, and reduced shear resistance.\n• **Flash Floods:** Rapid inundation of low-lying floodplains and valleys caused by runoff exceeding hydrological river capacities.\n• **Earthquakes:** Sudden tectonic fault slips generating ground shaking, which can also trigger secondary co-seismic landslides on unstable slopes.\n\nOur system specializes in **rainfall-induced and geotechnical landslide early warning** using real-time satellite telemetry and sensor intelligence.`;

      return {
        message: compMsg,
        intent: "DISASTER_COMPARISON",
        sources: ["NDMA Disaster Typology Index"],
        actionButtons: [
          { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" },
          { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" }
        ],
        suggestedQuestions: ["What causes a landslide?", "What are the warning signs?", "What is the current risk?"],
        isDemoMode: true
      };
    }

    // 32. Current System Risk Overview (Explicitly asked by user)
    const isCurrentRiskQuery = textLower.includes("current risk") ||
      textLower.includes("system risk") ||
      textLower.includes("peak risk") ||
      textLower.includes("overall risk") ||
      textLower.includes("what is the risk") ||
      textLower.includes("status of all") ||
      textLower.includes("risk level") ||
      textLower.includes("தற்போதைய அபாயம்") ||
      textLower.includes("ஒட்டுமொத்த அபாயம்") ||
      textLower === "risk" ||
      textLower === "risk?";

    if (isCurrentRiskQuery) {
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
    }

    // -------------------------------------------------------------
    // 33. ADAPTIVE NATURAL LANGUAGE SYNTHESIZER (For ANY Other Custom Question)
    // -------------------------------------------------------------
    return this.generateAdaptiveResponse(userText, textLower, effectiveLang, locations);
  },

  /**
   * Adaptive Intelligent Response Engine for Open-Ended & General Inquiries
   */
  generateAdaptiveResponse(userText, textLower, effectiveLang, locations) {
    const isTa = effectiveLang === "ta";
    const langMeta = this.getLanguageInfo(effectiveLang);
    const avgRain = Math.round(locations.reduce((acc, l) => acc + (l.rainfall_24h_mm || 0), 0) / Math.max(1, locations.length));
    const avgSoil = Math.round(locations.reduce((acc, l) => acc + (l.soil_moisture_pct || 0), 0) / Math.max(1, locations.length));
    const sortedDesc = [...locations].sort((a, b) => (b.risk_probability || 0) - (a.risk_probability || 0));
    const highestRiskLoc = sortedDesc[0] || { name: "Coonoor Ghat Corridor", district: "Nilgiris", risk_probability: 87.2, risk_category: "CRITICAL" };

    let subjectAnswerEn = "";
    let subjectAnswerTa = "";
    let detectedTopic = "GENERAL";

    // Detect query domain
    if (textLower.includes("weather") || textLower.includes("rain") || textLower.includes("cloud") || textLower.includes("climate") || textLower.includes("storm") || textLower.includes("cyclone")) {
      detectedTopic = "METEOROLOGY";
      subjectAnswerEn = `Weather systems, atmospheric pressure drops, and cyclonic moisture transport directly dictate precipitation intensity over mountain ranges. In our current telemetry, regional average 24-hour rainfall stands at **${avgRain} mm**, which plays an active role in replenishing hydrological pore pressures across steep slopes.`;
      subjectAnswerTa = `வானிலை மாற்றங்கள், வளிமண்டல அழுத்தக் குறைவு மற்றும் பருவமழைக் காற்று ஆகியவை மலைப்பகுதிகளில் தீவிர மழையை உருவாக்குகின்றன. தற்போதைய கண்காணிப்பில் பிராந்திய சராசரி 24 மணி நேர மழை **${avgRain} mm** ஆகப் பதிவாகியுள்ளது.`;
    } else if (textLower.includes("rock") || textLower.includes("soil") || textLower.includes("sand") || textLower.includes("geology") || textLower.includes("mountain") || textLower.includes("earth")) {
      detectedTopic = "GEOLOGY";
      subjectAnswerEn = `Geological formations—particularly fissured charnockite and weathered gneiss regolith in the Western Ghats and Himalayan schists—possess natural fault planes. When subsurface moisture saturation reaches high thresholds (currently averaging **${avgSoil}%**), friction drops along these planes, facilitating down-slope detachment.`;
      subjectAnswerTa = `புவியியல் அமைப்புகள், குறிப்பாக பாறை வெடிப்புகள் மற்றும் சார்னோகைட்/நீஸ்பாறை அடுக்குகள் நிலச்சரிவுக்கான அடித்தளத்தை உருவாக்குகின்றன. தற்போதைய மண் ஈரப்பதம் சராசரியாக **${avgSoil}%** ஆக உள்ளது, இது மண் உராய்வை கணிசமாகக் குறைக்கிறது.`;
    } else if (textLower.includes("water") || textLower.includes("river") || textLower.includes("spring") || textLower.includes("drain") || textLower.includes("stream") || textLower.includes("lake")) {
      detectedTopic = "HYDROLOGY";
      subjectAnswerEn = `Hydrological dynamics are the central trigger of slope instability. Surface runoff pooling, unengineered road runoff discharge, and rising groundwater tables increase pore-water pressures. Maintaining clear natural drainage paths and horizontal weep holes is essential to preventing slope failure.`;
      subjectAnswerTa = `நீர் வடிகால் அமைப்புகள் நிலப்பரப்பு பாதுகாப்பில் மிக முக்கிய பங்கு வகிக்கின்றன. மலைச்சரிவுகளில் நீர் தேங்காமல் பாதுகாப்பாக வெளியேறுவதை உறுதி செய்வதன் மூலம் நிலச்சரிவு அபாயங்களை பெருமளவு தடுக்க முடியும்.`;
    } else if (textLower.includes("safe") || textLower.includes("danger") || textLower.includes("protect") || textLower.includes("live") || textLower.includes("precaution")) {
      detectedTopic = "SAFETY";
      subjectAnswerEn = `Safety in mountain terrains requires staying informed about early warning alerts, recognizing precursor tension cracks, preparing a 72-hour emergency go-bag, and obeying local evacuation directives during heavy rainfall events. Currently, **${highestRiskLoc.name}** is at peak monitored risk (${highestRiskLoc.risk_probability}%).`;
      subjectAnswerTa = `மலைப்பகுதிகளில் பாதுகாப்பாக இருக்க முன்கூட்டியே எச்சரிக்கைகளை அறிந்துகொள்வதும், புதிய விரிசல்கள் மற்றும் தரை மாற்றங்களை கவனிப்பதும் அவசியம். தற்போது **${highestRiskLoc.name}** அதிகபட்ச அபாயத்தில் (${highestRiskLoc.risk_probability}%) உள்ளது.`;
    } else if (textLower.includes("map") || textLower.includes("where") || textLower.includes("location") || textLower.includes("place") || textLower.includes("area")) {
      detectedTopic = "GEOSPATIAL";
      subjectAnswerEn = `Our geospatial early warning engine continuously tracks ${locations.length} designated high-risk mountain sectors spanning the Western Ghats and Himalayan ranges. You can explore their real-time heatmaps, sensor readings, and alert boundaries on the Live Risk Map.`;
      subjectAnswerTa = `எங்கள் நேரலை வரைபடம் மேற்குத் தொடர்ச்சி மலை மற்றும் இமயமலைப் பகுதிகளைச் சேர்ந்த ${locations.length} முக்கிய கண்காணிப்பு நிலையங்களை நிகழ்நேரத்தில் வரைபடமாக்குகிறது.`;
    } else {
      detectedTopic = "INQUIRY";
      subjectAnswerEn = `Thank you for asking about *" ${this.escapeHTML(userText)} "*. As your Landslide Early Warning Assistant, I analyze geotechnical stability, environmental sensor feeds, and disaster mitigation. Currently, regional monitored risk stands with **${highestRiskLoc.name}** at **${highestRiskLoc.risk_category} (${highestRiskLoc.risk_probability}%)**, with an average 24h rainfall of **${avgRain} mm** and soil saturation at **${avgSoil}%**.`;
      subjectAnswerTa = `*" ${this.escapeHTML(userText)} "* குறித்த உங்கள் கேள்விக்கு நன்றி. நிலச்சரிவு முன்னெச்சரிக்கை உதவியாளராக, நான் புவியியல் பாதுகாப்பு, வானிலை மற்றும் சென்சார் தரவுகளை ஆய்வு செய்கிறேன். தற்போது **${highestRiskLoc.name}** அதிக அபாயத்துடன் (${highestRiskLoc.risk_probability}%) கண்காணிக்கப்படுகிறது; சராசரி மழை **${avgRain} mm** மற்றும் மண் ஈரப்பதம் **${avgSoil}%** ஆக உள்ளது.`;
    }

    let message = "";
    if (isTa) {
      message = `💡 **பதில் (AI Assistant Response):**\n\n${subjectAnswerTa}\n\n**தற்போதைய கள நிலவரம்:**\n• சராசரி 24h மழை: **${avgRain} mm**\n• சராசரி மண் ஈரப்பதம்: **${avgSoil}%**\n• உச்ச அபாய பகுதி: **${highestRiskLoc.name} (${highestRiskLoc.risk_probability}%)**\n\nமேலும் விவரங்களை அறிய கீழே உள்ள பொத்தான்களைப் பயன்படுத்தவும் அல்லது குறிப்பிட்ட கேள்விகளைக் கேட்கலாம்.`;
    } else if (effectiveLang === "hi") {
      message = `💡 **AI सहायक उत्तर (AI Assistant Response):**\n\n${subjectAnswerEn}\n\n**वर्तमान पर्यावरणीय स्थिति (Live Telemetry):**\n• **औसत 24 घंटे की बारिश:** **${avgRain} mm**\n• **मिट्टी की औसत नमी:** **${avgSoil}%**\n• **उच्चतम जोखिम वाला क्षेत्र:** **${highestRiskLoc.name} (${highestRiskLoc.risk_probability}%)**\n\nआप किसी भी क्षेत्र, बारिश, मिट्टी की नमी या सुरक्षा उपायों के बारे में और प्रश्न पूछ सकते हैं।`;
    } else if (effectiveLang === "te") {
      message = `💡 **AI సహాయక సమాధానం (AI Assistant Response):**\n\n${subjectAnswerEn}\n\n**ప్రస్తుత వాతావరణ సమాచారం (Live Telemetry):**\n• **సగటు 24 గంటల వర్షపాతం:** **${avgRain} mm**\n• **నేల తేమ శాతం:** **${avgSoil}%**\n• **అత్యధిక ప్రమాదకర ప్రాంతం:** **${highestRiskLoc.name} (${highestRiskLoc.risk_probability}%)**\n\nమీరు ఏ ప్రాంతం లేదా భద్రతా చర్యల గురించైనా మరిన్ని ప్రశ్నలు అడగవచ్చు.`;
    } else if (effectiveLang === "kn") {
      message = `💡 **AI ಸಹಾಯಕ ಪ್ರತಿಕ್ರಿಯೆ (AI Assistant Response):**\n\n${subjectAnswerEn}\n\n**ಪ್ರಸ್ತುತ ಪರಿಸರ ಮಾಹಿತಿ (Live Telemetry):**\n• **ಸರಾಸರಿ 24 ಗಂಟೆಗಳ ಮಳೆ:** **${avgRain} mm**\n• **ಮಣ್ಣಿನ ತೇವಾಂಶ:** **${avgSoil}%**\n• **ಗರಿಷ್ಠ ಅಪಾಯದ ವಲಯ:** **${highestRiskLoc.name} (${highestRiskLoc.risk_probability}%)**\n\nನೀವು ಯಾವುದೇ ಪ್ರದೇಶ ಅಥವಾ ಸುರಕ್ಷತಾ ಕ್ರಮಗಳ ಬಗ್ಗೆ ಹೆಚ್ಚಿನ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು.`;
    } else if (effectiveLang === "ml") {
      message = `💡 **AI അസിസ്റ്റന്റ് മറുപടി (AI Assistant Response):**\n\n${subjectAnswerEn}\n\n**നിലവിലെ കാലാവസ്ഥാ വിവരങ്ങൾ (Live Telemetry):**\n• **ശരാശരി 24 മണിക്കൂർ മഴ:** **${avgRain} mm**\n• **മണ്ണിലെ ഈർപ്പം:** **${avgSoil}%**\n• **ഏറ്റവും ഉയർന്ന അപകട മേഖല:** **${highestRiskLoc.name} (${highestRiskLoc.risk_probability}%)**\n\nഏതെങ്കിലും പ്രദേശം അല്ലെങ്കിൽ സുരക്ഷാ മാർഗ്ഗങ്ങളെക്കുറിച്ച് നിങ്ങൾക്ക് കൂടുതൽ ചോദിക്കാം.`;
    } else if (effectiveLang === "bn") {
      message = `💡 **AI সহকারী উত্তর (AI Assistant Response):**\n\n${subjectAnswerEn}\n\n**বর্তমান পরিবেশগত তথ্য (Live Telemetry):**\n• **গড় ২৪ ঘণ্টার বৃষ্টিপাত:** **${avgRain} mm**\n• **মাটির আর্দ্রতা:** **${avgSoil}%**\n• **সর্বোচ্চ ঝুঁকিপূর্ণ অঞ্চল:** **${highestRiskLoc.name} (${highestRiskLoc.risk_probability}%)**\n\nআপনি নির্দিষ্ট কোনো স্থান বা সুরক্ষা ব্যবস্থা সম্পর্কে আরও জানতে পারেন।`;
    } else if (effectiveLang === "mr") {
      message = `💡 **AI सहाय्यक उत्तर (AI Assistant Response):**\n\n${subjectAnswerEn}\n\n**सध्याची क्षेत्रीय माहिती (Live Telemetry):**\n• **सरासरी २४ तासांचा पाऊस:** **${avgRain} mm**\n• **मातीचा ओलावा:** **${avgSoil}%**\n• **सर्वाधिक धोकादायक क्षेत्र:** **${highestRiskLoc.name} (${highestRiskLoc.risk_probability}%)**\n\nतुम्ही कोणत्याही क्षेत्राविषयी किंवा सुरक्षेविषयी अधिक प्रश्न विचारू शकता.`;
    } else if (effectiveLang !== "en") {
      message = `💡 **AI Assistant (${langMeta.name} - ${langMeta.nativeName}):**\n\n${subjectAnswerEn}\n\n**Live Sector Telemetry:**\n• **Regional Average 24h Rain:** **${avgRain} mm**\n• **Subsurface Soil Saturation:** **${avgSoil}%**\n• **Peak Monitored Risk Zone:** **${highestRiskLoc.name} (${highestRiskLoc.risk_probability}%)**\n\n*(Connect Google Gemini in settings for fluent generative conversational answers in ${langMeta.name})*`;
    } else {
      message = `💡 **AI Assistant Response:**\n\n${subjectAnswerEn}\n\n**Current Live Environmental Telemetry:**\n• **Regional Average 24h Rain:** **${avgRain} mm**\n• **Mean Subsurface Soil Moisture:** **${avgSoil}%**\n• **Highest Monitored Sector:** **${highestRiskLoc.name} (${highestRiskLoc.risk_probability}%)**\n\nFeel free to explore live sensor layers, active bulletins, or ask about any specific location or geotechnical topic!`;
    }

    return {
      message: message,
      intent: `ADAPTIVE_${detectedTopic}`,
      sources: ["Landslide Early Warning Knowledge Base", `${langMeta.name} Regional Telemetry`],
      actionButtons: [
        { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" },
        { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" },
        { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" },
        { label: "🧠 Open AI Prediction Model", action: "VIEW_PREDICTION" }
      ],
      suggestedQuestions: (this.quickQuestions[effectiveLang] || this.quickQuestions["en"]).slice(0, 4),
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
    } else if (action === "VIEW_PREDICTION") {
      LandslideApp.navigateTo("prediction");
    } else if (action === "VIEW_TRENDS") {
      LandslideApp.navigateTo("trends");
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
