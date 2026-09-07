/**
 * AI-Based Landslide Risk Monitoring System
 * Core Dataset & GeoJSON Structures
 */

const LANDSLIDE_APP_DATA = {
  systemInfo: {
    title: "AI-Based Early Warning & Landslide Risk Monitoring System",
    version: "2.4.0",
    engine: "Google Earth Engine & PyTorch Ensemble",
    lastRefreshed: new Date().toLocaleTimeString(),
    demoMode: true,
    region: "Western Ghats & Himalayan Pilot Sectors (Tamil Nadu, Kerala, Uttarakhand, HP)"
  },

  // Locations with comprehensive geo-environmental parameters
  locations: [
    {
      id: "LOC-01",
      name: "Emerald Valley & Doddabetta Slopes",
      village: "Emerald Village",
      district: "Nilgiris",
      state: "Tamil Nadu",
      lat: 11.3912,
      lng: 76.7112,
      elevation_m: 2180,
      slope_deg: 36.5,
      soil_type: "Lateritic Red Loam",
      geology: "Fissured Charnockite / Hornblende-Biotite Gneiss",
      vegetation_ndvi: 0.58,
      population_density: 420,
      rainfall_24h_mm: 148.5,
      rainfall_7d_mm: 385.0,
      soil_moisture_pct: 82.4,
      pore_pressure_kpa: 46.2,
      temperature_c: 17.2,
      humidity_pct: 94,
      ground_vibration_mms: 0.18,
      historical_incidents: 14,
      risk_probability: 78.6,
      risk_category: "HIGH",
      color: "#ef4444",
      last_updated: "2 mins ago"
    },
    {
      id: "LOC-02",
      name: "Coonoor Ghat Corridor (NH-67)",
      village: "Marapalam Settlement",
      district: "Nilgiris",
      state: "Tamil Nadu",
      lat: 11.3530,
      lng: 76.7959,
      elevation_m: 1850,
      slope_deg: 39.0,
      soil_type: "Clayey Gneiss Regolith",
      geology: "Highly Weathered Quartz-Feldspathic Gneiss",
      vegetation_ndvi: 0.42,
      population_density: 310,
      rainfall_24h_mm: 162.0,
      rainfall_7d_mm: 412.0,
      soil_moisture_pct: 88.0,
      pore_pressure_kpa: 58.6,
      temperature_c: 19.1,
      humidity_pct: 96,
      ground_vibration_mms: 0.42,
      historical_incidents: 22,
      risk_probability: 87.2,
      risk_category: "CRITICAL",
      color: "#991b1b",
      last_updated: "Just now"
    },
    {
      id: "LOC-03",
      name: "Meppadi - Chooralmala Ridge",
      village: "Chooralmala",
      district: "Wayanad",
      state: "Kerala",
      lat: 11.5432,
      lng: 76.1245,
      elevation_m: 1240,
      slope_deg: 41.2,
      soil_type: "Porous Forest Loam over Granulite",
      geology: "Sheared Granulite Belt with Quartz Intrusions",
      vegetation_ndvi: 0.65,
      population_density: 280,
      rainfall_24h_mm: 210.0,
      rainfall_7d_mm: 520.0,
      soil_moisture_pct: 91.5,
      pore_pressure_kpa: 64.8,
      temperature_c: 21.0,
      humidity_pct: 98,
      ground_vibration_mms: 0.68,
      historical_incidents: 19,
      risk_probability: 92.4,
      risk_category: "CRITICAL",
      color: "#991b1b",
      last_updated: "1 min ago"
    },
    {
      id: "LOC-04",
      name: "Kotagiri Tea Terraces",
      village: "Kotagiri Rural",
      district: "Nilgiris",
      state: "Tamil Nadu",
      lat: 11.4200,
      lng: 76.8600,
      elevation_m: 1793,
      slope_deg: 24.5,
      soil_type: "Humic Mountain Soil",
      geology: "Moderately Weathered Charnockite",
      vegetation_ndvi: 0.72,
      population_density: 380,
      rainfall_24h_mm: 64.0,
      rainfall_7d_mm: 140.0,
      soil_moisture_pct: 54.0,
      pore_pressure_kpa: 22.0,
      temperature_c: 18.5,
      humidity_pct: 78,
      ground_vibration_mms: 0.05,
      historical_incidents: 6,
      risk_probability: 44.8,
      risk_category: "MODERATE",
      color: "#f59e0b",
      last_updated: "8 mins ago"
    },
    {
      id: "LOC-05",
      name: "Munnar Gap Road Pass",
      village: "Devikulam Sector",
      district: "Idukki",
      state: "Kerala",
      lat: 10.0889,
      lng: 77.0595,
      elevation_m: 1530,
      slope_deg: 34.0,
      soil_type: "Fissured Charnockite Rock/Soil",
      geology: "Jointed Gneissic Escarpment",
      vegetation_ndvi: 0.51,
      population_density: 220,
      rainfall_24h_mm: 98.0,
      rainfall_7d_mm: 245.0,
      soil_moisture_pct: 71.2,
      pore_pressure_kpa: 38.0,
      temperature_c: 16.8,
      humidity_pct: 89,
      ground_vibration_mms: 0.22,
      historical_incidents: 11,
      risk_probability: 64.1,
      risk_category: "HIGH",
      color: "#ef4444",
      last_updated: "5 mins ago"
    },
    {
      id: "LOC-06",
      name: "Kodaikanal Ghat Section",
      village: "Pannaikadu",
      district: "Dindigul",
      state: "Tamil Nadu",
      lat: 10.2381,
      lng: 77.4892,
      elevation_m: 1420,
      slope_deg: 22.0,
      soil_type: "Sandy Clay Loam",
      geology: "Granite Gneiss Massive",
      vegetation_ndvi: 0.61,
      population_density: 340,
      rainfall_24h_mm: 28.0,
      rainfall_7d_mm: 72.0,
      soil_moisture_pct: 36.5,
      pore_pressure_kpa: 14.5,
      temperature_c: 20.4,
      humidity_pct: 65,
      ground_vibration_mms: 0.02,
      historical_incidents: 4,
      risk_probability: 24.2,
      risk_category: "LOW",
      color: "#10b981",
      last_updated: "15 mins ago"
    },
    {
      id: "LOC-07",
      name: "Chamoli Valley Himalayan Flank",
      village: "Joshimath Sector B",
      district: "Chamoli",
      state: "Uttarakhand",
      lat: 30.5564,
      lng: 79.5667,
      elevation_m: 1890,
      slope_deg: 38.0,
      soil_type: "Glacial Moraine Till",
      geology: "Central Crystallines (Schist, Quartzite)",
      vegetation_ndvi: 0.38,
      population_density: 190,
      rainfall_24h_mm: 135.0,
      rainfall_7d_mm: 310.0,
      soil_moisture_pct: 84.0,
      pore_pressure_kpa: 52.0,
      temperature_c: 11.2,
      humidity_pct: 91,
      ground_vibration_mms: 0.35,
      historical_incidents: 26,
      risk_probability: 82.5,
      risk_category: "CRITICAL",
      color: "#991b1b",
      last_updated: "10 mins ago"
    },
    {
      id: "LOC-08",
      name: "Shimla Bypass Ridge",
      village: "Dhalli Outskirts",
      district: "Shimla",
      state: "Himachal Pradesh",
      lat: 31.1048,
      lng: 77.1734,
      elevation_m: 2205,
      slope_deg: 29.5,
      soil_type: "Phyllite & Schist Debris",
      geology: "Jutogh Group Metasediments",
      vegetation_ndvi: 0.55,
      population_density: 510,
      rainfall_24h_mm: 45.0,
      rainfall_7d_mm: 98.0,
      soil_moisture_pct: 48.0,
      pore_pressure_kpa: 19.5,
      temperature_c: 14.0,
      humidity_pct: 72,
      ground_vibration_mms: 0.04,
      historical_incidents: 8,
      risk_probability: 38.4,
      risk_category: "MODERATE",
      color: "#f59e0b",
      last_updated: "18 mins ago"
    }
  ],

  // Risk Polygons for GIS visual hazard extents
  riskPolygons: [
    {
      name: "Nilgiris High Hazard Zone Alpha",
      risk_category: "CRITICAL",
      coords: [
        [11.38, 76.70],
        [11.41, 76.72],
        [11.39, 76.81],
        [11.33, 76.78],
        [11.34, 76.69]
      ]
    },
    {
      name: "Wayanad Escarpment Red Polygon",
      risk_category: "CRITICAL",
      coords: [
        [11.52, 76.10],
        [11.56, 76.11],
        [11.55, 76.15],
        [11.51, 76.14]
      ]
    },
    {
      name: "Idukki Gap Road Yellow Sector",
      risk_category: "HIGH",
      coords: [
        [10.07, 77.03],
        [10.11, 77.06],
        [10.09, 77.08],
        [10.05, 77.05]
      ]
    }
  ],

  // Early Warning Alerts
  alerts: [
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
      timestamp: "10 mins ago"
    },
    {
      id: "ALT-2026-088",
      location_id: "LOC-02",
      location_name: "Coonoor Ghat Corridor (NH-67)",
      district: "Nilgiris",
      alert_level: "HIGH RISK",
      risk_probability_pct: 87.2,
      headline: "HIGH RISK WARNING: Road Cut Slumping & Rockfall Vulnerability",
      trigger_reason: "Persistent rain (162 mm) causing lateral soil thrust and seepage on 39° slope.",
      recommended_action: "Restrict heavy vehicular movement on NH-67 Ghat section. Deploy geotechnical highway inspection teams.",
      status: "ACTIVE",
      timestamp: "25 mins ago"
    },
    {
      id: "ALT-2026-085",
      location_id: "LOC-01",
      location_name: "Emerald Valley & Doddabetta Slopes",
      district: "Nilgiris",
      alert_level: "HIGH RISK",
      risk_probability_pct: 78.6,
      headline: "HIGH RISK WATCH: Soil Creep & Drainage Overflow Detected",
      trigger_reason: "Soil moisture at 82.4% with continuing rainfall bands forecast over Doddabetta catchment.",
      recommended_action: "Clear culverts, inspect retaining walls, and alert local village panchayat emergency monitors.",
      status: "ACTIVE",
      timestamp: "45 mins ago"
    },
    {
      id: "ALT-2026-082",
      location_id: "LOC-05",
      location_name: "Munnar Gap Road Pass",
      district: "Idukki",
      alert_level: "WARNING",
      risk_probability_pct: 64.1,
      headline: "WARNING: Potential Rock Displacement along Cliff Face",
      trigger_reason: "Rainfall reaching 98mm on fractured rocky terrain with high joints density.",
      recommended_action: "Erect cautionary warning signage, speed reduction limits, and monitor rockfall mesh netting.",
      status: "ACTIVE",
      timestamp: "2 hours ago"
    },
    {
      id: "ALT-2026-077",
      location_id: "LOC-04",
      location_name: "Kotagiri Tea Terraces",
      district: "Nilgiris",
      alert_level: "WATCH",
      risk_probability_pct: 44.8,
      headline: "WATCH: Moderate Runoff Flow on Agricultural Terraces",
      trigger_reason: "Localized showers with moderate soil dampening.",
      recommended_action: "Maintain drainage trenches along boundary paths.",
      status: "RESOLVED",
      timestamp: "6 hours ago"
    }
  ],

  // Citizen Reports
  citizenReports: [
    {
      id: "CIT-8021",
      reporter_name: "R. Vignesh",
      contact_info: "+91 98401 23456",
      location_name: "Marapalam 3rd Hairpin Bend",
      district: "Nilgiris",
      lat: 11.3551,
      lng: 76.7972,
      report_type: "Ground cracks",
      description: "Noticed 3-inch wide tensile ground cracks running parallel across the upper road shoulder after morning downpour.",
      photo_url: "assets/demo_cracks.jpg",
      status: "Verified",
      risk_level: "HIGH",
      timestamp: "35 mins ago"
    },
    {
      id: "CIT-8022",
      reporter_name: "A. Joseph",
      contact_info: "+91 94470 65432",
      location_name: "Chooralmala Tea Estate Block 4",
      district: "Wayanad",
      lat: 11.5410,
      lng: 76.1260,
      report_type: "Soil movement",
      description: "Mud water flowing with gravel down the stream embankment; leaning eucalyptus trees observed on hillcrest.",
      photo_url: "assets/demo_mudflow.jpg",
      status: "Verified",
      risk_level: "CRITICAL",
      timestamp: "1 hour ago"
    },
    {
      id: "CIT-8023",
      reporter_name: "S. Rajeshwari",
      contact_info: "+91 97890 11223",
      location_name: "Kotagiri Valley Edge",
      district: "Nilgiris",
      lat: 11.4230,
      lng: 76.8620,
      report_type: "Water accumulation",
      description: "Drainage ditch blocked with sediment causing heavy runoff pooling on steep terrace boundary.",
      photo_url: "assets/demo_drainage.jpg",
      status: "Under Review",
      risk_level: "MODERATE",
      timestamp: "3 hours ago"
    },
    {
      id: "CIT-8024",
      reporter_name: "K. Mohan Kumar",
      contact_info: "+91 94888 77665",
      location_name: "Ooty - Pykara Road Km 14",
      district: "Nilgiris",
      lat: 11.4510,
      lng: 76.6210,
      report_type: "Rockfall",
      description: "Small boulders dislodged from road cut onto outer lane; traffic partially obstructed.",
      photo_url: "assets/demo_rockfall.jpg",
      status: "Verified",
      risk_level: "HIGH",
      timestamp: "5 hours ago"
    }
  ],

  // Historical Landslide Incidents Inventory (2018 - 2025)
  historicalIncidents: [
    { id: "HIS-01", date: "2024-07-30", location: "Meppadi Chooralmala", district: "Wayanad", severity: "CATASTROPHIC", rain_24h: 382, fatalities: 231, damage: "Entire residential settlement and bridge washed away by massive debris flow" },
    { id: "HIS-02", date: "2024-08-12", location: "Marapalam NH-67", district: "Nilgiris", severity: "SEVERE", rain_24h: 215, fatalities: 0, damage: "Highway breached for 60 meters, road connectivity severed for 5 days" },
    { id: "HIS-03", date: "2023-09-18", location: "Joshimath Sector B", district: "Chamoli", severity: "SEVERE", rain_24h: 175, fatalities: 0, damage: "Subsidence and deep rotational slumps affecting 45 structures" },
    { id: "HIS-04", date: "2022-08-04", location: "Gap Road Devikulam", district: "Idukki", severity: "SEVERE", rain_24h: 198, fatalities: 2, damage: "Rockfall debris crushed construction equipment and retaining wall" },
    { id: "HIS-05", date: "2021-11-10", location: "Emerald Valley", district: "Nilgiris", severity: "MODERATE", rain_24h: 140, fatalities: 0, damage: "Tea plantation terrace failure, 2 agricultural pump sheds buried" },
    { id: "HIS-06", date: "2020-08-07", location: "Pettimudi Rajamala", district: "Idukki", severity: "CATASTROPHIC", rain_24h: 310, fatalities: 66, damage: "Tea estate labour quarters engulfed in nocturnal slope collapse" },
    { id: "HIS-07", date: "2019-08-08", location: "Kavalappara", district: "Malappuram", severity: "CATASTROPHIC", rain_24h: 290, fatalities: 59, damage: "Spontaneous liquefaction flow down hill flank" },
    { id: "HIS-08", date: "2018-08-16", location: "Coonoor Railway Ghat Line", district: "Nilgiris", severity: "MODERATE", rain_24h: 165, fatalities: 0, damage: "UNESCO Heritage Mountain Railway track suspended mid-air due to embankment wash" }
  ],

  // Google Earth Engine & Sensor Subsystem Telemetry Feeds
  dataSources: [
    { name: "Google Earth Engine (GEE)", status: "CONNECTED", type: "Satellite Pipeline", latency: "42 ms", detail: "Sentinel-1 InSAR + SRTM 30m DEM + MODIS/Landsat" },
    { name: "IMD Doppler Radar & AWS Network", status: "CONNECTED", type: "Weather Telemetry", latency: "38 ms", detail: "Real-time precipitation radar & 15-min automated rain gauges" },
    { name: "NASA SMAP & In-Situ TDR Probes", status: "CONNECTED", type: "Soil Moisture", latency: "55 ms", detail: "Topsoil (0-10cm) & Root-zone (10-100cm) volumetric water content" },
    { name: "AI Inference Engine (LS-Ensemble)", status: "CONNECTED", type: "ML Core", latency: "12 ms", detail: "Multi-factor weighted susceptibility + SHAP explanation generator" },
    { name: "GSI Landslide Hazard Database", status: "CONNECTED", type: "Historical DB", latency: "18 ms", detail: "Geological Survey of India historical landslide inventory archive" },
    { name: "CAP Disaster Alerting Gateway", status: "CONNECTED", type: "Public Warning", latency: "25 ms", detail: "Common Alerting Protocol (CAP) SMS, WhatsApp, and Local Sirens" }
  ],

  // System Workflow Stages (Based on reference infographic)
  workflowStages: [
    {
      step: 1,
      title: "Satellite & Geospatial Data",
      subtitle: "Multi-mission Remote Sensing",
      desc: "Ingests real-time earth observation data including Sentinel-1 Synthetic Aperture Radar (InSAR for ground deformation), Sentinel-2 optical imagery (NDVI vegetation index), NASA SRTM DEM (slope & elevation), and NASA GPM precipitation data.",
      tech: "ESA Copernicus, NASA Earthdata, ALOS PALSAR",
      icon: "satellite"
    },
    {
      step: 2,
      title: "Google Earth Engine Integration",
      subtitle: "Cloud-Scale Geospatial Computing",
      desc: "Executes distributed spatial raster transformations, computes topographic relief factors, extracts hydrologic drainage basins, and performs time-series InSAR coherence loss analysis in the cloud without local processing overhead.",
      tech: "Google Earth Engine Python API, Earth Engine Catalog",
      icon: "cloud"
    },
    {
      step: 3,
      title: "Current Environmental Data",
      subtitle: "Real-Time Ground Sensor Telemetry",
      desc: "Streams live telemetry from in-situ automated weather stations (AWS), TDR subsurface soil moisture sensors, vibrating-wire piezometers (pore-water pressure), and borehole tiltmeters deployed across critical slopes.",
      tech: "IMD AWS Network, IoT Sensor Gateways, LoRaWAN",
      icon: "radio"
    },
    {
      step: 4,
      title: "AI / Machine Learning Engine",
      subtitle: "Multi-Factor Landslide Susceptibility Scoring",
      desc: "Processes normalized environmental and geological weights through an ensemble AI model (Random Forest, XGBoost & LSTM) to calculate instant risk probabilities, model confidence scores, and multi-factor impact breakdowns.",
      tech: "PyTorch, Scikit-learn, SHAP Explainability Engine",
      icon: "cpu"
    },
    {
      step: 5,
      title: "Landslide Risk Prediction",
      subtitle: "Dynamic Probability & Trend Forecasting",
      desc: "Classifies risk into standardized color-coded brackets (0-30% Low, 31-60% Moderate, 61-80% High, 81-100% Critical) and forecasts short-term (+6h, +24h) and medium-term (+7d) risk trajectories based on meteorological forecast models.",
      tech: "Susceptibility Indexing, Dynamic Hydrological Modeling",
      icon: "trending-up"
    },
    {
      step: 6,
      title: "Interactive Dynamic Risk Map",
      subtitle: "Geographic Information System (GIS)",
      desc: "Visualizes live hazard zones, radar precipitation overlays, citizen-submitted reports, slope contours, and satellite base layers on an interactive GIS map with real-time inspection panels.",
      tech: "Leaflet GIS, OpenTopoMap, Esri Satellite, GeoJSON",
      icon: "map"
    },
    {
      step: 7,
      title: "Early Warning & Action",
      subtitle: "Targeted Evacuation & Disaster Response",
      desc: "Automatically triggers location-specific alerts (Info, Watch, Warning, High Risk, Critical) with actionable safety protocols dispatched via SMS, sirens, district emergency operation centers (DEOC), and mobile apps.",
      tech: "Common Alerting Protocol (CAP), NDMA / SDMA Gateway",
      icon: "alert-triangle"
    }
  ]
};
