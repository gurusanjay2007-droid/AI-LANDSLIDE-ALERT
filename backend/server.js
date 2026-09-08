/**
 * AI-Based Early Warning & Landslide Risk Monitoring System
 * Node.js / Express Backend Server
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory data store matching Python backend and client dataset
const locations = [
  {
    id: "LOC-01",
    name: "Emerald Valley & Doddabetta Slopes",
    village: "Emerald Village",
    district: "Nilgiris",
    state: "Tamil Nadu",
    latitude: 11.3912,
    longitude: 76.7112,
    elevation_m: 2180,
    slope_degrees: 36.5,
    soil_type: "Lateritic Red Loam",
    vegetation_ndvi: 0.58,
    historical_incidents: 14,
    rainfall_24h_mm: 148.5,
    rainfall_7d_mm: 385.0,
    soil_moisture_pct: 82.4,
    temperature_c: 17.2,
    humidity_pct: 94,
    last_updated: "2 mins ago"
  },
  {
    id: "LOC-02",
    name: "Coonoor Ghat Corridor (NH-67)",
    village: "Marapalam Settlement",
    district: "Nilgiris",
    state: "Tamil Nadu",
    latitude: 11.3530,
    longitude: 76.7959,
    elevation_m: 1850,
    slope_degrees: 39.0,
    soil_type: "Clayey Gneiss Regolith",
    vegetation_ndvi: 0.42,
    historical_incidents: 22,
    rainfall_24h_mm: 162.0,
    rainfall_7d_mm: 412.0,
    soil_moisture_pct: 88.0,
    temperature_c: 19.1,
    humidity_pct: 96,
    last_updated: "Just now"
  },
  {
    id: "LOC-03",
    name: "Meppadi - Chooralmala Ridge",
    village: "Chooralmala",
    district: "Wayanad",
    state: "Kerala",
    latitude: 11.5432,
    longitude: 76.1245,
    elevation_m: 1240,
    slope_degrees: 41.2,
    soil_type: "Porous Forest Loam over Granulite",
    vegetation_ndvi: 0.65,
    historical_incidents: 19,
    rainfall_24h_mm: 210.0,
    rainfall_7d_mm: 520.0,
    soil_moisture_pct: 91.5,
    temperature_c: 21.0,
    humidity_pct: 98,
    last_updated: "1 min ago"
  },
  {
    id: "LOC-04",
    name: "Kotagiri Tea Terraces",
    village: "Kotagiri Rural",
    district: "Nilgiris",
    state: "Tamil Nadu",
    latitude: 11.4200,
    longitude: 76.8600,
    elevation_m: 1793,
    slope_degrees: 24.5,
    soil_type: "Humic Mountain Soil",
    vegetation_ndvi: 0.72,
    historical_incidents: 6,
    rainfall_24h_mm: 64.0,
    rainfall_7d_mm: 140.0,
    soil_moisture_pct: 54.0,
    temperature_c: 18.5,
    humidity_pct: 78,
    last_updated: "8 mins ago"
  },
  {
    id: "LOC-05",
    name: "Munnar Gap Road Pass",
    village: "Devikulam Sector",
    district: "Idukki",
    state: "Kerala",
    latitude: 10.0889,
    longitude: 77.0595,
    elevation_m: 1530,
    slope_degrees: 34.0,
    soil_type: "Fissured Charnockite Rock/Soil",
    vegetation_ndvi: 0.51,
    historical_incidents: 11,
    rainfall_24h_mm: 98.0,
    rainfall_7d_mm: 245.0,
    soil_moisture_pct: 71.2,
    temperature_c: 16.8,
    humidity_pct: 89,
    last_updated: "5 mins ago"
  },
  {
    id: "LOC-06",
    name: "Kodaikanal Ghat Section",
    village: "Pannaikadu",
    district: "Dindigul",
    state: "Tamil Nadu",
    latitude: 10.2381,
    longitude: 77.4892,
    elevation_m: 1420,
    slope_degrees: 22.0,
    soil_type: "Sandy Clay Loam",
    vegetation_ndvi: 0.61,
    historical_incidents: 4,
    rainfall_24h_mm: 28.0,
    rainfall_7d_mm: 72.0,
    soil_moisture_pct: 36.5,
    temperature_c: 20.4,
    humidity_pct: 65,
    last_updated: "15 mins ago"
  },
  {
    id: "LOC-07",
    name: "Chamoli Valley Himalayan Flank",
    village: "Joshimath Sector B",
    district: "Chamoli",
    state: "Uttarakhand",
    latitude: 30.5564,
    longitude: 79.5667,
    elevation_m: 1890,
    slope_degrees: 38.0,
    soil_type: "Glacial Moraine Till",
    vegetation_ndvi: 0.38,
    historical_incidents: 26,
    rainfall_24h_mm: 135.0,
    rainfall_7d_mm: 310.0,
    soil_moisture_pct: 84.0,
    temperature_c: 11.2,
    humidity_pct: 91,
    last_updated: "10 mins ago"
  },
  {
    id: "LOC-08",
    name: "Shimla Bypass Ridge",
    village: "Dhalli Outskirts",
    district: "Shimla",
    state: "Himachal Pradesh",
    latitude: 31.1048,
    longitude: 77.1734,
    elevation_m: 2205,
    slope_degrees: 29.5,
    soil_type: "Phyllite & Schist Debris",
    vegetation_ndvi: 0.55,
    historical_incidents: 8,
    rainfall_24h_mm: 45.0,
    rainfall_7d_mm: 98.0,
    soil_moisture_pct: 48.0,
    temperature_c: 14.0,
    humidity_pct: 72,
    last_updated: "18 mins ago"
  },
  {
    id: "LOC-09",
    name: "Darjeeling Tea Slopes (Paglajhora)",
    village: "Kurseong Sector",
    district: "Darjeeling",
    state: "West Bengal",
    latitude: 26.9048,
    longitude: 88.2721,
    elevation_m: 1450,
    slope_degrees: 37.0,
    soil_type: "Silty Phyllite Regolith",
    vegetation_ndvi: 0.62,
    historical_incidents: 21,
    rainfall_24h_mm: 178.0,
    rainfall_7d_mm: 460.0,
    soil_moisture_pct: 89.2,
    temperature_c: 15.5,
    humidity_pct: 95,
    last_updated: "4 mins ago"
  },
  {
    id: "LOC-10",
    name: "Shimla Central Ridge & Mall Road",
    village: "Central Ridge",
    district: "Shimla",
    state: "Himachal Pradesh",
    latitude: 31.1044,
    longitude: 77.1743,
    elevation_m: 2276,
    slope_degrees: 27.0,
    soil_type: "Schistose Bedrock with Fill",
    vegetation_ndvi: 0.48,
    historical_incidents: 5,
    rainfall_24h_mm: 52.0,
    rainfall_7d_mm: 115.0,
    soil_moisture_pct: 51.0,
    temperature_c: 13.8,
    humidity_pct: 70,
    last_updated: "20 mins ago"
  }
];

const alerts = [
  {
    id: "ALT-2026-091",
    location_id: "LOC-03",
    location_name: "Chooralmala, Meppadi Ridge (Wayanad)",
    district: "Wayanad",
    alert_level: "CRITICAL",
    risk_probability_pct: 92.4,
    headline: "CRITICAL RED ALERT: Imminent Debris Flow & Landslide Hazard",
    trigger_reason: "Cumulative 24h precipitation (210 mm) triggered extreme soil saturation (91.5%) on 41.2° steep slope.",
    recommended_action: "Immediate evacuation of downslope settlements. Close valley route traffic and mobilize NDRF/SDRF teams.",
    status: "CRITICAL",
    issued_at: new Date().toISOString()
  },
  {
    id: "ALT-2026-088",
    location_id: "LOC-02",
    location_name: "Coonoor Ghat Corridor (NH-67)",
    district: "Nilgiris",
    alert_level: "CRITICAL",
    risk_probability_pct: 87.2,
    headline: "HIGH RISK WARNING: Road Cut Slumping & Rockfall Vulnerability",
    trigger_reason: "Persistent rain (162 mm) causing lateral soil thrust and seepage on 39° slope.",
    recommended_action: "Restrict heavy vehicular movement on NH-67 Ghat section. Deploy geotechnical inspection teams.",
    status: "ACTIVE",
    issued_at: new Date().toISOString()
  },
  {
    id: "ALT-2026-085",
    location_id: "LOC-07",
    location_name: "Chamoli Valley Himalayan Flank",
    district: "Chamoli",
    alert_level: "CRITICAL",
    risk_probability_pct: 82.5,
    headline: "CRITICAL ALERT: Glacial Till Destabilization & Rock Slope Creep",
    trigger_reason: "135 mm rainfall combined with 84% moraine till saturation on 38° Himalayan slope.",
    recommended_action: "Halt all construction and riverbed quarrying. Evacuate roadside dwellings.",
    status: "ACTIVE",
    issued_at: new Date().toISOString()
  },
  {
    id: "ALT-2026-082",
    location_id: "LOC-01",
    location_name: "Emerald Valley & Doddabetta Slopes",
    district: "Nilgiris",
    alert_level: "HIGH RISK",
    risk_probability_pct: 78.6,
    headline: "HIGH RISK ADVISORY: Tea Estate Terrace Erosion & Soil Liquefaction",
    trigger_reason: "148.5 mm rainfall and high pore-water pressure (46.2 kPa) on 36.5° slope.",
    recommended_action: "Alert estate workers, clear drainage blockages, keep emergency transport ready.",
    status: "ACTIVE",
    issued_at: new Date().toISOString()
  }
];

// Helper risk calculation
function calculateSimpleRisk(rain, soil, slope) {
  let score = (rain * 0.32) + (soil * 0.40) + (slope * 0.80);
  score = Math.min(99.4, Math.max(5.0, score));
  let category = "LOW";
  let color = "#10b981";
  if (score > 80) { category = "CRITICAL"; color = "#991b1b"; }
  else if (score > 60) { category = "HIGH"; color = "#ef4444"; }
  else if (score > 30) { category = "MODERATE"; color = "#f59e0b"; }
  return { probability: Math.round(score * 10) / 10, category, color };
}

// Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    timestamp: new Date().toISOString(),
    services: ['Google Earth Engine', 'IMD Radar', 'SMAP Soil Moisture', 'AI Inference Engine']
  });
});

app.get('/api/risk', (req, res) => {
  const zones = locations.map(l => {
    const risk = calculateSimpleRisk(l.rainfall_24h_mm, l.soil_moisture_pct, l.slope_degrees);
    return {
      ...l,
      risk_probability: risk.probability,
      risk_category: risk.category,
      color: risk.color
    };
  });
  res.json({ count: zones.length, zones });
});

app.get('/api/risk/:id', (req, res) => {
  const zone = locations.find(z => z.id === req.params.id);
  if (!zone) return res.status(404).json({ error: 'Location not found' });
  const risk = calculateSimpleRisk(zone.rainfall_24h_mm, zone.soil_moisture_pct, zone.slope_degrees);
  res.json({ location: zone, prediction: { risk_probability: risk.probability, risk_category: risk.category, color_code: risk.color } });
});

app.get('/api/alerts', (req, res) => {
  res.json({ count: alerts.length, alerts });
});

app.get('/api/environment', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    total_monitored_stations: locations.length,
    telemetry: locations
  });
});

app.get('/api/rainfall', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    readings: locations.map(l => ({ location_name: l.name, rainfall_24h_mm: l.rainfall_24h_mm }))
  });
});

app.get('/api/soil-moisture', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    readings: locations.map(l => ({ location_name: l.name, soil_moisture_pct: l.soil_moisture_pct }))
  });
});

// Intelligent Database-Grounded Chat Endpoint
app.post('/api/chat', (req, res) => {
  const { message, location, language = 'en' } = req.body;
  const msgLower = (message || '').toLowerCase();
  const isTa = language === 'ta' || /[\u0B80-\u0BFF]/.test(message || '');

  // 1. Prompt Injection Defense
  if (msgLower.includes('api key') || msgLower.includes('password') || msgLower.includes('secret') || msgLower.includes('system prompt')) {
    return res.json({
      message: isTa ? "நான் ரகசிய கணினி சான்றுகளை பகிர முடியாது. நிலச்சரிவு மற்றும் வானிலை தரவுகள் பற்றி கேளுங்கள்." : "I cannot provide credentials, environment variables, or private system keys. Please ask about landslide risk and telemetry.",
      intent: "INJECTION_PROBE",
      sources: ["Security Guardrails"],
      actionButtons: [],
      suggestedQuestions: ["What is the current risk?", "Check rainfall", "Show high-risk areas"],
      isDemoMode: true
    });
  }

  // 2. Identify Location if explicitly requested or referenced
  let explicitLoc = locations.find(l =>
    msgLower.includes(l.name.toLowerCase()) ||
    msgLower.includes(l.village.toLowerCase()) ||
    msgLower.includes(l.district.toLowerCase()) ||
    (l.state && msgLower.includes(l.state.toLowerCase().split(",")[0])) ||
    msgLower.includes(l.id.toLowerCase())
  );

  const refersToCurrentArea = msgLower.includes("this area") || msgLower.includes("here") || msgLower.includes("my village") || msgLower.includes("my area") || msgLower.includes("இந்த பகுதி") || msgLower.includes("இங்கு");
  const targetLoc = explicitLoc || (refersToCurrentArea && location && location.id ? locations.find(l => l.id === location.id) : null);

  // 3. Location-Specific Query Handlers
  if (targetLoc) {
    const risk = calculateSimpleRisk(targetLoc.rainfall_24h_mm, targetLoc.soil_moisture_pct, targetLoc.slope_degrees);

    // Rainfall Query for Location
    if (msgLower.includes("rain") || msgLower.includes("மழை")) {
      const msg = isTa
        ? `🌧️ **மழைப்பொழிவு விவரம் - ${targetLoc.name} (${targetLoc.district}):**\n\nகடந்த 24 மணி நேரத்தில் பதிவான மழை: **${targetLoc.rainfall_24h_mm} mm**\nமழை நிலை: **${targetLoc.rainfall_24h_mm > 150 ? 'அதி தீவிர கனமழை' : targetLoc.rainfall_24h_mm > 80 ? 'கனமழை' : 'மிதமான மழை'}**\n7 நாள் மொத்த மழை: **${targetLoc.rainfall_7d_mm || 'N/A'} mm**\n\nமண் நீர் நிறைவுத்தன்மை மற்றும் சரிவு அழுத்தம் தொடர்ந்து கண்காணிக்கப்படுகிறது.`
        : `🌧️ **Rainfall Telemetry - ${targetLoc.name} (${targetLoc.district}):**\n\n• **24-Hour Rainfall:** **${targetLoc.rainfall_24h_mm} mm** (${targetLoc.rainfall_24h_mm > 150 ? 'Extremely Heavy' : targetLoc.rainfall_24h_mm > 80 ? 'Heavy Rainfall' : 'Moderate'})\n• **7-Day Cumulative:** **${targetLoc.rainfall_7d_mm || 'N/A'} mm**\n• **Terrain Slope:** **${targetLoc.slope_degrees}°**\n\nPersistent rainfall above 100 mm dramatically elevates topsoil pore-water pressure.`;

      return res.json({
        message: msg,
        intent: "LOCATION_RAINFALL",
        location: targetLoc,
        risk: { probability: risk.probability, level: risk.category },
        sources: ["IMD Automated Radar", "In-Situ Rain Gauges"],
        actionButtons: [
          { label: "🗺️ View on Map", action: "VIEW_MAP", target: targetLoc.id, lat: targetLoc.latitude, lng: targetLoc.longitude },
          { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT", target: targetLoc.id }
        ],
        suggestedQuestions: [`Soil moisture in ${targetLoc.district}`, `Why is ${targetLoc.village} risky?`, "Show safe areas"],
        isDemoMode: true
      });
    }

    // Soil Moisture Query for Location
    if (msgLower.includes("soil") || msgLower.includes("moisture") || msgLower.includes("மண்") || msgLower.includes("ஈரப்பதம்")) {
      const msg = isTa
        ? `💧 **மண் ஈரப்பதம் மற்றும் செறிவு - ${targetLoc.name} (${targetLoc.district}):**\n\n• மண் ஈரப்பதம்: **${targetLoc.soil_moisture_pct}%**\n• மண் வகை: **${targetLoc.soil_type}**\n• சாய்வு கோணம்: **${targetLoc.slope_degrees}°**\n\n${targetLoc.soil_moisture_pct > 80 ? '⚠️ மண் அதிக நீர் நிறைவு பெற்றுள்ளதால் நிலச்சரிவு வாய்ப்பு அதிகம்.' : 'மண் ஈரப்பதம் தற்போது பாதுகாப்பான வரம்பில் உள்ளது.'}`
        : `💧 **Soil Moisture Telemetry - ${targetLoc.name} (${targetLoc.district}):**\n\n• **Subsurface Soil Saturation:** **${targetLoc.soil_moisture_pct}%** (${targetLoc.soil_moisture_pct > 80 ? 'Critical Saturation' : targetLoc.soil_moisture_pct > 65 ? 'Elevated' : 'Stable'})\n• **Soil Classification:** ${targetLoc.soil_type}\n• **Elevation:** ${targetLoc.elevation_m} m\n\n${targetLoc.soil_moisture_pct > 80 ? '⚠️ Elevated pore-water pressure reduces soil shear strength significantly.' : 'Subsurface drainage is currently functioning normally.'}`;

      return res.json({
        message: msg,
        intent: "LOCATION_SOIL",
        location: targetLoc,
        risk: { probability: risk.probability, level: risk.category },
        sources: ["NASA SMAP Soil Probes", "TDR In-Situ Telemetry"],
        actionButtons: [
          { label: "🗺️ View on Map", action: "VIEW_MAP", target: targetLoc.id, lat: targetLoc.latitude, lng: targetLoc.longitude },
          { label: "🔍 Analyze Location", action: "ANALYZE_LOC", target: targetLoc.id }
        ],
        suggestedQuestions: [`Check rainfall in ${targetLoc.district}`, `Why is ${targetLoc.village} risky?`, "What is the current risk?"],
        isDemoMode: true
      });
    }

    // Slope & Elevation Query for Location
    if (msgLower.includes("slope") || msgLower.includes("steep") || msgLower.includes("elevation") || msgLower.includes("சாய்வு") || msgLower.includes("உயரம்")) {
      const msg = isTa
        ? `⛰️ **நிலப்பரப்பு மற்றும் சாய்வு விவரம் - ${targetLoc.name} (${targetLoc.district}):**\n\n• **சாய்வு கோணம்:** **${targetLoc.slope_degrees}°** (${targetLoc.slope_degrees > 35 ? 'செங்குத்தான மலைச்சரிவு (Steep)' : 'மிதமான சரிவு'})\n• **உயரம் (DEM):** **${targetLoc.elevation_m} m**\n• **மண் வகை:** **${targetLoc.soil_type}**\n• **முந்தைய நிலச்சரிவுகள்:** **${targetLoc.historical_incidents} நிகழ்வுகள்**\n\n30° க்கும் அதிகமான சாய்வு ஈர்ப்பு விசை அழுத்தத்தை அதிகப்படுத்தி நிலச்சரிவு வாய்ப்பை கூட்டுகிறது.`
        : `⛰️ **Topography & Slope Profile - ${targetLoc.name} (${targetLoc.district}):**\n\n• **Slope Incline:** **${targetLoc.slope_degrees}°** (${targetLoc.slope_degrees > 35 ? 'Steep Mountainous Face (>35°)' : 'Moderate Incline'})\n• **Elevation (SRTM DEM):** **${targetLoc.elevation_m} m**\n• **Soil Matrix:** **${targetLoc.soil_type}**\n• **Historical Landslides:** **${targetLoc.historical_incidents} recorded events**\n\nSteep gradients above 30° experience intense gravitational shear stress under wet conditions.`;

      return res.json({
        message: msg,
        intent: "LOCATION_TOPOGRAPHY",
        location: targetLoc,
        risk: { probability: risk.probability, level: risk.category },
        sources: ["SRTM 30m Digital Elevation Model (NASA)", "Geological Survey of India"],
        actionButtons: [
          { label: "🗺️ View on Map", action: "VIEW_MAP", target: targetLoc.id, lat: targetLoc.latitude, lng: targetLoc.longitude },
          { label: "🔍 Analyze Location", action: "ANALYZE_LOC", target: targetLoc.id }
        ],
        suggestedQuestions: [`Check rainfall in ${targetLoc.district}`, `Why is ${targetLoc.village} risky?`, "Show high-risk areas"],
        isDemoMode: true
      });
    }

    // Risk Factors / Why Risky Query
    if (msgLower.includes("why") || msgLower.includes("cause") || msgLower.includes("factor") || msgLower.includes("ஏன்") || msgLower.includes("காரணம்")) {
      const msg = isTa
        ? `📍 **${targetLoc.name} (${targetLoc.district})** அபாயக் காரணிகள்:\n\n• **மழைப்பொழிவு:** கடந்த 24 மணி நேரத்தில் **${targetLoc.rainfall_24h_mm} mm** மழை பதிவாகியுள்ளது.\n• **மண் ஈரப்பதம்:** **${targetLoc.soil_moisture_pct}%** நிறைவுத்தன்மை.\n• **சாய்வு:** **${targetLoc.slope_degrees}°** செங்குத்தான நிலப்பரப்பு.\n• **முந்தைய நிகழ்வுகள்:** ${targetLoc.historical_incidents} வரலாற்று நிலச்சரிவு பதிவுகள்.\n\nகணக்கிடப்பட்ட அபாய நிகழ்தகவு: **${risk.probability}% (${risk.category})**.`
        : `📍 **Why ${targetLoc.name} is Risky:**\n\nThe risk is rated **${risk.category} (${risk.probability}%)** due to high rainfall (**${targetLoc.rainfall_24h_mm} mm**), heavy soil moisture saturation (**${targetLoc.soil_moisture_pct}%**), and steep mountainous slope (**${targetLoc.slope_degrees}°**). Historical incidents (${targetLoc.historical_incidents} recorded events) also contribute to the physical susceptibility model.`;

      return res.json({
        message: msg,
        intent: "RISK_FACTORS",
        risk: { probability: risk.probability, level: risk.category },
        location: targetLoc,
        sources: ["Sentinel-1 InSAR & DEM", "IMD Radar", "LS-Ensemble AI Model"],
        actionButtons: [
          { label: "🗺️ View on Map", action: "VIEW_MAP", target: targetLoc.id, lat: targetLoc.latitude, lng: targetLoc.longitude },
          { label: "🔍 Analyze Location", action: "ANALYZE_LOC", target: targetLoc.id },
          { label: "📢 Submit Citizen Report", action: "SUBMIT_REPORT" }
        ],
        explanationCard: {
          title: `WHY THIS AREA IS RISKY: ${targetLoc.name}`,
          rainfall: { label: "Rainfall", value: `${targetLoc.rainfall_24h_mm} mm`, level: targetLoc.rainfall_24h_mm > 100 ? "High" : "Moderate" },
          soil: { label: "Soil Moisture", value: `${targetLoc.soil_moisture_pct}%`, level: targetLoc.soil_moisture_pct > 80 ? "Critical" : "Moderate" },
          slope: { label: "Slope", value: `${targetLoc.slope_degrees}°`, level: targetLoc.slope_degrees > 30 ? "Steep" : "Moderate" },
          history: { label: "Historical Scars", value: `${targetLoc.historical_incidents} scars`, level: "High" },
          risk_score: `${risk.probability}%`,
          category: risk.category
        },
        suggestedQuestions: [`Rainfall in ${targetLoc.district}`, "Show safe areas", "What should I do during a warning?"],
        isDemoMode: true
      });
    }

    // Default Location Overview
    const msg = isTa
      ? `📍 **${targetLoc.name} (${targetLoc.district})**\n\nதற்போதைய நிலச்சரிவு அபாய நிலை: **${risk.category}** (${risk.probability}%)\n\n• 24 மணி நேர மழை: **${targetLoc.rainfall_24h_mm} mm**\n• மண் ஈரப்பதம்: **${targetLoc.soil_moisture_pct}%**\n• நிலப்பரப்பு சாய்வு: **${targetLoc.slope_degrees}°**\n• உயரம்: **${targetLoc.elevation_m} m**\n• மண் வகை: **${targetLoc.soil_type}**\n\n**பரிந்துரை:** ${risk.probability > 60 ? 'உடனடி எச்சரிக்கையுடன் இருக்கவும்; உள்ளூர் பேரிடர் மேலாண்மை வழிகாட்டுதல்களைப் பின்பற்றவும்.' : 'தற்போதைய நிலை பாதுகாப்பாக உள்ளது.'}`
      : `📍 **${targetLoc.name} (${targetLoc.district})**\n\nThe current system risk level is **${risk.category}**, with a calculated risk probability of **${risk.probability}%**.\n\n**Latest Sensor Telemetry:**\n• 24h Rainfall: **${targetLoc.rainfall_24h_mm} mm**\n• Soil Moisture: **${targetLoc.soil_moisture_pct}%**\n• Slope Steepness: **${targetLoc.slope_degrees}°**\n• Elevation: **${targetLoc.elevation_m} m**\n• Soil Profile: **${targetLoc.soil_type}**\n\n**Recommendation:** ${risk.probability > 60 ? 'Exercise elevated caution and follow local disaster management instructions.' : 'Conditions are currently within safe baseline parameters.'}`;

    return res.json({
      message: msg,
      intent: "LOCATION_RISK",
      risk: { probability: risk.probability, level: risk.category, color: risk.color },
      location: targetLoc,
      sources: ["Environmental Telemetry", "LS-Ensemble AI Model"],
      actionButtons: [
        { label: "🗺️ View on Map", action: "VIEW_MAP", target: targetLoc.id, lat: targetLoc.latitude, lng: targetLoc.longitude },
        { label: "🔍 Analyze Location", action: "ANALYZE_LOC", target: targetLoc.id },
        { label: "📢 Submit Citizen Report", action: "SUBMIT_REPORT" }
      ],
      suggestedQuestions: [`Why is ${targetLoc.village} risky?`, `Check rainfall in ${targetLoc.district}`, "Show high-risk areas"],
      isDemoMode: true
    });
  }

  // 4. System-Wide Multi-Location Database Queries

  // Low Rainfall Query
  const isLowRain = (msgLower.includes("less") || msgLower.includes("low") || msgLower.includes("lowest") || msgLower.includes("least") || msgLower.includes("minimum") || msgLower.includes("safe rain") || msgLower.includes("குறைந்த") || msgLower.includes("குறைவான")) && (msgLower.includes("rain") || msgLower.includes("மழை"));
  if (isLowRain) {
    const sorted = [...locations].sort((a, b) => a.rainfall_24h_mm - b.rainfall_24h_mm);
    const lowList = sorted.slice(0, 4);
    const bullets = lowList.map(s => `• **${s.name} (${s.district})**: **${s.rainfall_24h_mm} mm** (Slope: ${s.slope_degrees}°)`).join("\n");

    const msg = isTa
      ? `🌧️ **குறைந்த மழை பதிவான பகுதிகள் (Lowest Rainfall Sectors):**\n\n${bullets}\n\nஇந்த பகுதிகளில் மழைப்பொழிவு 70 mm வரம்பிற்குள் உள்ளதால் உடனடி சரிவு அபாயம் குறைவாக உள்ளது.`
      : `🌧️ **Lowest / Safe Rainfall Sectors (24h Cumulative):**\n\n${bullets}\n\n**Analysis:** In these sectors, cumulative precipitation remains well below critical infiltration thresholds (100 mm), maintaining lower pore-water pressure and stable slope conditions.`;

    return res.json({
      message: msg,
      intent: "RAINFALL_LOW",
      sources: ["IMD Automated Radar", "In-Situ Rain Gauges"],
      actionButtons: [
        { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" },
        { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" }
      ],
      suggestedQuestions: ["Show safe areas", "Check highest rainfall", "What is the current risk?"],
      isDemoMode: true
    });
  }

  // General or High Rainfall Query
  if (msgLower.includes("rain") || msgLower.includes("மழை")) {
    const sortedDesc = [...locations].sort((a, b) => b.rainfall_24h_mm - a.rainfall_24h_mm);
    const avgRain = Math.round(locations.reduce((acc, l) => acc + l.rainfall_24h_mm, 0) / locations.length);
    const top4 = sortedDesc.slice(0, 4);
    const low3 = sortedDesc.slice(-3).reverse();

    const highBullets = top4.map(s => `• **${s.name} (${s.district})**: **${s.rainfall_24h_mm} mm** (${s.rainfall_24h_mm > 150 ? 'Extreme' : 'Heavy'})`).join("\n");
    const lowBullets = low3.map(s => `• **${s.name} (${s.district})**: **${s.rainfall_24h_mm} mm**`).join("\n");

    const msg = isTa
      ? `🌧️ **அமைப்பின் நேரலை மழைப்பொழிவு விவரம்:**\n\nகண்காணிக்கப்படும் அனைத்து நிலையங்களின் சராசரி 24 மணி நேர மழை: **${avgRain} mm**.\n\n**அதிக மழை பதிவான பகுதிகள்:**\n${highBullets}\n\n**குறைந்த மழை பதிவான பகுதிகள்:**\n${lowBullets}`
      : `🌧️ **System-Wide 24h Rainfall Telemetry:**\n\nThe current regional average rainfall across monitored stations is **${avgRain} mm**.\n\n**Highest Recorded Rainfall Readings:**\n${highBullets}\n\n**Lowest Recorded Rainfall:**\n${lowBullets}\n\nPersistent rainfall above 100 mm dramatically elevates topsoil pore-water pressure.`;

    return res.json({
      message: msg,
      intent: "RAINFALL",
      sources: ["IMD Automated Radar", "In-Situ Rain Gauges"],
      actionButtons: [
        { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" },
        { label: "🗺️ View Live Risk Map", action: "VIEW_MAP" }
      ],
      suggestedQuestions: ["Show areas with less rainfall", "Check soil moisture", "What is the current risk?"],
      isDemoMode: true
    });
  }

  // Safe Areas Query
  if ((msgLower.includes("safe") || msgLower.includes("low risk") || msgLower.includes("safest") || msgLower.includes("பாதுகாப்பான")) && !msgLower.includes("warning")) {
    const scored = locations.map(l => ({ ...l, ...calculateSimpleRisk(l.rainfall_24h_mm, l.soil_moisture_pct, l.slope_degrees) }));
    const sortedSafe = scored.sort((a, b) => a.probability - b.probability);
    const safeList = sortedSafe.slice(0, 4);
    const bullets = safeList.map(s => `• **${s.name} (${s.district})**: **${s.category} (${s.probability}%)** - Rain: ${s.rainfall_24h_mm} mm, Slope: ${s.slope_degrees}°`).join("\n");

    const msg = isTa
      ? `🛡️ **குறைந்த / மிதமான அபாயமுள்ள பாதுகாப்பான பகுதிகள்:**\n\n${bullets}\n\nஇந்த பகுதிகளில் குறைந்த மழைப்பொழிவு மற்றும் மிதமான சாய்வு உள்ளதால் இயல்பு நிலை தொடர்கிறது.`
      : `🛡️ **Currently Identified Low & Moderate Risk Sectors:**\n\n${bullets}\n\n**Summary:** These zones exhibit low-to-moderate slope gradients, well-drained soil profiles, and 24h rainfall well within baseline thresholds.`;

    return res.json({
      message: msg,
      intent: "SAFE_AREAS",
      sources: ["Live Geospatial Susceptibility Model"],
      actionButtons: [
        { label: "🗺️ Open Live Risk Map", action: "VIEW_MAP" },
        { label: "📊 Open Dashboard", action: "VIEW_DASHBOARD" }
      ],
      suggestedQuestions: ["Show high-risk areas", "Check rainfall", "Explain the risk score"],
      isDemoMode: true
    });
  }

  // High Risk Areas Query
  if (msgLower.includes("high-risk") || msgLower.includes("critical") || msgLower.includes("high risk") || msgLower.includes("dangerous") || msgLower.includes("அபாய பகுதிகள்")) {
    const scored = locations.map(l => ({ ...l, ...calculateSimpleRisk(l.rainfall_24h_mm, l.soil_moisture_pct, l.slope_degrees) }));
    const sortedDesc = scored.sort((a, b) => b.probability - a.probability);
    const criticalList = sortedDesc.filter(l => l.category === "CRITICAL" || l.category === "HIGH" || l.probability >= 60);
    const topCrit = (criticalList.length > 0 ? criticalList : sortedDesc).slice(0, 5);
    const bullets = topCrit.map(s => `• **${s.name} (${s.district})**: **${s.category} (${s.probability}%)** - Rain: ${s.rainfall_24h_mm} mm, Slope: ${s.slope_degrees}°`).join("\n");

    const msg = isTa
      ? `⚠️ **தற்போது அமைப்பில் கண்டறியப்பட்ட தீவிர அபாய மண்டலங்கள் (${criticalList.length} பகுதிகள்):**\n\n${bullets}\n\nநேரலை வரைபடத்தில் இவற்றின் எல்லைகளை விரிவாகப் பார்வையிடலாம்.`
      : `⚠️ Currently, the early warning system identifies **${criticalList.length} high & critical-risk zones** across monitored sectors:\n\n${bullets}\n\nYou can open the Live Risk Map to view their real-time spatial heatmaps and perimeter alerts.`;

    return res.json({
      message: msg,
      intent: "HIGH_RISK_AREAS",
      sources: ["Live Geospatial Aggregator & Early Warning Engine"],
      actionButtons: [
        { label: "🗺️ Open Live Risk Map", action: "VIEW_MAP" },
        { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" }
      ],
      suggestedQuestions: ["Why is this area risky?", "What should I do during a warning?", "Check rainfall"],
      isDemoMode: true
    });
  }

  // List All Monitored Locations Query
  if (msgLower.includes("all locations") || msgLower.includes("list locations") || msgLower.includes("show locations") || msgLower.includes("what locations") || msgLower.includes("எல்லா பகுதிகள்")) {
    const bullets = locations.map(s => {
      const risk = calculateSimpleRisk(s.rainfall_24h_mm, s.soil_moisture_pct, s.slope_degrees);
      return `• **${s.name}** (${s.district}, ${s.state}) - **${risk.category}** (${risk.probability}%) | Rain: ${s.rainfall_24h_mm} mm | Soil: ${s.soil_moisture_pct}%`;
    }).join("\n");

    const msg = isTa
      ? `📍 **கண்காணிக்கப்படும் அனைத்து ${locations.length} பகுதிகள்:**\n\n${bullets}\n\nகுறிப்பிட்ட பகுதியின் விவரத்தை அறிய அதன் பெயரைத் தட்டச்சு செய்யவும்.`
      : `📍 **All Monitored Early Warning Stations (${locations.length} Stations Active):**\n\n${bullets}\n\nYou can ask about any individual station (e.g. *"What is the risk in Kotagiri?"* or *"Rainfall in Darjeeling"*).`;

    return res.json({
      message: msg,
      intent: "LIST_LOCATIONS",
      sources: ["Geospatial Monitoring Database"],
      actionButtons: [
        { label: "🗺️ Open Live Risk Map", action: "VIEW_MAP" },
        { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" }
      ],
      suggestedQuestions: ["Show high-risk areas", "Show areas with less rainfall", "What is the current risk?"],
      isDemoMode: true
    });
  }

  // Alerts Query
  if (msgLower.includes("alert") || msgLower.includes("warning") || msgLower.includes("bulletin") || msgLower.includes("எச்சரிக்கை")) {
    const alertBullets = alerts.map((a, idx) =>
      `${idx + 1}. **${a.alert_level}: ${a.location_name}**\n• Trigger: ${a.trigger_reason}\n• Action: ${a.recommended_action}`
    ).join("\n\n");

    const msg = isTa
      ? `🚨 **செயலில் உள்ள பேரிடர் எச்சரிக்கைகள் (${alerts.length} எச்சரிக்கைகள்):**\n\n${alertBullets}\n\nஉள்ளூர் பேரிடர் மேலாண்மை வழிகாட்டுதல்களை உடனே பின்பற்றவும்.`
      : `🚨 **Active Early Warning Disaster Bulletins (${alerts.length} Active):**\n\n${alertBullets}\n\nPlease follow instructions issued by District Disaster Management Authorities.`;

    return res.json({
      message: msg,
      intent: "ALERTS",
      sources: ["NDMA Common Alerting Protocol (CAP-IN v1.2)"],
      actionButtons: [
        { label: "⚠️ View Active Alerts", action: "VIEW_ALERTS" },
        { label: "🗺️ View on Map", action: "VIEW_MAP" }
      ],
      suggestedQuestions: ["What's the current risk?", "Show high-risk areas", "What should I do during a landslide warning?"],
      isDemoMode: true
    });
  }

  // General Mountain Slope Query
  if (msgLower.includes("slope") || msgLower.includes("steep") || msgLower.includes("gradient") || msgLower.includes("சாய்வு") || msgLower.includes("மலைச்சரிவு")) {
    const avgSlope = Math.round((locations.reduce((acc, l) => acc + l.slope_degrees, 0) / locations.length) * 10) / 10;
    const sortedSlope = [...locations].sort((a, b) => b.slope_degrees - a.slope_degrees);
    const steepBullets = sortedSlope.slice(0, 4).map(s => `• **${s.name} (${s.district})**: **${s.slope_degrees}°** (${s.slope_degrees > 38 ? 'Extreme Escarpment' : 'Steep Mountain Face'})`).join("\n");
    const gentleBullets = sortedSlope.slice(-3).reverse().map(s => `• **${s.name} (${s.district})**: **${s.slope_degrees}°** (Gentle/Moderate)`).join("\n");

    const msg = isTa
      ? `⛰️ **அமைப்பின் நிலப்பரப்பு சாய்வு கோணங்கள் (Slope Telemetry):**\n\nகண்காணிக்கப்படும் பகுதிகளின் சராசரி சாய்வு கோணம்: **${avgSlope}°**.\n\n**அதி தீவிர செங்குத்தான சரிவுகள் (>35°):**\n${steepBullets}\n\n**குறைவான / மிதமான சாய்வுள்ள பகுதிகள் (<30°):**\n${gentleBullets}\n\n30° க்கும் அதிகமான சாய்வு கொண்ட பகுதிகளில் மழை நீர் ஊடுருவும் போது ஈர்ப்பு விசை அழுத்தம் தீவிரமடைகிறது.`
      : `⛰️ **System-Wide Mountain Slope Telemetry (NASA SRTM DEM):**\n\nThe regional average slope across monitored stations is **${avgSlope}°**.\n\n**Steepest Mountain Slopes (>35° Incline):**\n${steepBullets}\n\n**Gentlest / Stable Slope Zones (<30°):**\n${gentleBullets}\n\nTerrain gradients exceeding 30° significantly amplify gravitational shear stresses when saturated by monsoon rains.`;

    return res.json({
      message: msg,
      intent: "SLOPE",
      sources: ["SRTM 30m Digital Elevation Model (NASA)", "Geological Survey of India"],
      actionButtons: [
        { label: "🗺️ View on Map", action: "VIEW_MAP" },
        { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" }
      ],
      suggestedQuestions: ["Check rainfall", "Show high-risk areas", "What is the current risk?"],
      isDemoMode: true
    });
  }

  // General Elevation Query
  if (msgLower.includes("elevation") || msgLower.includes("altitude") || msgLower.includes("height") || msgLower.includes("உயரம்")) {
    const sortedElev = [...locations].sort((a, b) => b.elevation_m - a.elevation_m);
    const elevBullets = sortedElev.slice(0, 5).map(s => `• **${s.name} (${s.district})**: **${s.elevation_m} m** (Slope: ${s.slope_degrees}°)`).join("\n");

    const msg = isTa
      ? `📍 **கண்காணிக்கப்படும் உயரமான பகுதிகள் (Top Elevations):**\n\n${elevBullets}`
      : `📍 **Highest Elevation Monitored Sectors (SRTM DEM):**\n\n${elevBullets}`;

    return res.json({
      message: msg,
      intent: "ELEVATION",
      sources: ["SRTM 30m Digital Elevation Model (NASA)"],
      actionButtons: [
        { label: "🗺️ View on Map", action: "VIEW_MAP" },
        { label: "📡 View Environmental Data", action: "VIEW_ENVIRONMENT" }
      ],
      suggestedQuestions: ["Check slope", "Check rainfall", "What is the current risk?"],
      isDemoMode: true
    });
  }

  // General Current Risk System Summary (Default)
  const scoredAll = locations.map(l => ({ ...l, ...calculateSimpleRisk(l.rainfall_24h_mm, l.soil_moisture_pct, l.slope_degrees) }));
  const sortedByRisk = scoredAll.sort((a, b) => b.probability - a.probability);
  const topZones = sortedByRisk.slice(0, 4);
  const critCount = scoredAll.filter(l => l.category === "CRITICAL" || l.probability >= 80).length;
  const highCount = scoredAll.filter(l => l.category === "HIGH" || (l.probability >= 60 && l.probability < 80)).length;
  const peakProb = sortedByRisk[0]?.probability || 87.2;

  const topBullets = topZones.map(s => `• **${s.name} (${s.district})**: **${s.category} (${s.probability}%)** - Rain: ${s.rainfall_24h_mm} mm`).join("\n");

  const overallMsg = isTa
    ? `The current system risk level is **HIGH**, with a peak calculated risk probability of **${peakProb}%** across monitored sectors.\n\nதற்போது **${critCount} அதிதீவிர (Critical)** மற்றும் **${highCount} அதிக (High)** அபாய பகுதிகள் கண்காணிக்கப்பட்டு வருகின்றன.\n\n**முக்கிய அபாய பகுதிகள்:**\n${topBullets}\n\nகுறிப்பிட்ட கிராமம் அல்லது மாவட்டத்தின் நிலையை அறிய *'What is the risk in Kotagiri?'* அல்லது *'Rainfall in Wayanad'* என்று கேட்கலாம்.`
    : `The current system risk level is **HIGH**, with an overall calculated peak risk probability of **${peakProb}%** across monitored zones.\n\nCurrently, the system monitors **${critCount} Critical** and **${highCount} High Risk** zones.\n\n**Top Vulnerable Sectors:**\n${topBullets}\n\nYou can ask about a specific sector (e.g. *"What is the risk in Kotagiri?"* or *"Rainfall in Wayanad"*) or explore the Live Risk Map.`;

  res.json({
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
  });
});

app.listen(PORT, () => {
  console.log(`Landslide Early Warning Node.js Server running on port ${PORT}`);
});
