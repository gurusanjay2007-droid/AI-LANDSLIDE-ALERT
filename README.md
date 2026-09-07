# 🛡️ AI-Based Early Warning & Landslide Risk Monitoring System

[![Version](https://img.shields.io/badge/version-2.4.0-blue.svg)](https://github.com)
[![Theme](https://img.shields.io/badge/theme-Pure%20White%20Professional-brightgreen.svg)](https://github.com)
[![Status](https://img.shields.io/badge/status-Operational-success.svg)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An institutional-grade, AI-powered landslide risk monitoring and early warning web application designed for **disaster management authorities, geotechnical research institutions, district collectors, and emergency response teams (NDRF / SDRF)**.

The system translates multi-mission earth observation datasets into localized, real-time landslide risk assessments, spatial hazard maps, and automated multi-channel early warning advisories.

---

## 📸 System Architecture & 7-Stage Workflow

```
Satellite & Geospatial Data (Sentinel-1 InSAR, SRTM DEM, GPM Rain)
                           ↓
Google Earth Engine (GEE Cloud Geospatial Raster Processing)
                           ↓
Current / Updated Environmental Data (In-situ AWS, TDR Moisture, Piezometers)
                           ↓
AI / Machine Learning (Weighted Geotechnical Susceptibility Scoring)
                           ↓
Landslide Risk Prediction (Classification: 0-30% Low → 81-100% Critical)
                           ↓
Interactive Dynamic Risk Map (Leaflet GIS, Isohyets, Polygons, Scars)
                           ↓
Early Warning & Action (CAP Broadcast, SMS / Sirens, Evacuation Protocols)
```

---

## 🌟 Key Application Features

| Module | Description |
| :--- | :--- |
| **🌐 Interactive Landing Page** | Professional overview featuring the 7-step system workflow diagram, architecture summary, and CTA shortcuts. |
| **📊 Executive Dashboard** | Real-time KPI cards for High/Critical, Moderate, and Low risk zones, active alert feeds, and summary averages. |
| **🗺️ Interactive GIS Risk Map** | Leaflet-based map with Satellite, Topo, and Terrain layers, risk polygon zones, precipitation radar heatmaps, and side inspection drawer. |
| **🔍 Location Risk Analysis** | Detailed geotechnical breakdown for Nilgiris, Wayanad, Idukki, Chamoli, and Shimla sectors with big probability gauges and factor bars. |
| **📡 Environmental Monitoring** | Time-series charts for 24h/7d rainfall, subsurface soil moisture saturation, pore-water pressure, and relative humidity. |
| **🧠 AI Prediction & What-If Simulator** | Susceptibility radar fingerprint, SHAP-like factor contributions, dynamic NLP diagnostic reasoning, and stress-test simulator. |
| **📈 Risk Trends & Forecasts** | Multi-day risk progression curves showing historical trajectory, current status, and +6h / +24h / +7d forecasts. |
| **📢 Citizen Hazard Reporting** | Crowd-sourced hazard reporting with HTML5 GPS geolocation, photo upload preview, and administrative verification. |
| **⚠️ Early Warning & Alerts** | Location-specific warning bulletins with risk diagnostics, evacuation actions, audio synthesis chimes, and CAP SMS/Siren broadcast. |
| **📜 Historical Incident Database** | Retrospective disaster archive (2018–2025) with rainfall correlation scatter plots and damage assessments. |
| **⚙️ Admin & GEE Health Center** | Live connection monitoring for Google Earth Engine, IMD radar, SMAP soil moisture, and AI inference latency. |

---

## 🎨 Design System & Color Standards

- **Theme**: Pure White, Crisp, Clean, and Professional.
- **Background**: `#FFFFFF` / `#F8FAFC`
- **Primary Text**: Navy Blue `#0F172A` / `#1E293B`
- **Accent**: Institutional Blue `#1E40AF` & Ocean Cyan `#0284C7`

### Standard Risk Classification & Color Palette
| Risk Level | Range (%) | Color Code | Status Meaning |
| :--- | :--- | :--- | :--- |
| **LOW** | `0% – 30%` | `#10B981` (Emerald) | Normal operational conditions; slope stable. |
| **MODERATE** | `31% – 60%` | `#F59E0B` (Amber) | Elevated moisture / slope creep; routine vigilance. |
| **HIGH** | `61% – 80%` | `#EF4444` (Coral Red) | Saturated regolith; restrict hillside transit. |
| **CRITICAL** | `81% – 100%` | `#991B1B` (Crimson) | Imminent debris flow hazard; mandatory evacuation. |

---

## 🧠 AI Landslide Susceptibility Mathematical Model

The prototype scoring engine computes a composite **Landslide Susceptibility Index (LSI)** using normalized multi-source inputs:

$$\text{Risk Score} = \sum_{i=1}^{n} (W_i \times S_i)$$

$$\text{Risk Score} = (0.32 \times S_{\text{Rain}}) + (0.24 \times S_{\text{Soil}}) + (0.18 \times S_{\text{Slope}}) + (0.10 \times S_{\text{Hist}}) + (0.08 \times S_{\text{Elev}}) + (0.08 \times S_{\text{Geol}})$$

1. **Precipitation ($S_{\text{Rain}}$, Weight: 32%)**: Sigmoidal scaling around critical 110 mm 24-hour rainfall threshold.
2. **Soil Saturation ($S_{\text{Soil}}$, Weight: 24%)**: Subsurface volumetric water content and pore-water pressure.
3. **Slope Gradient ($S_{\text{Slope}}$, Weight: 18%)**: Digital Elevation Model slope angles $>30^\circ$ receive exponential hazard weight.
4. **Historical Proximity ($S_{\text{Hist}}$, Weight: 10%)**: Spatial distance to documented GSI landslide scars.
5. **Elevation Relief ($S_{\text{Elev}}$, Weight: 8%)**: Relief energy and gravitational potential.
6. **Geology & NDVI ($S_{\text{Geol}}$, Weight: 8%)**: Fissured rock types and vegetation cover stress.

---

## 🚀 Quick Start & Local Execution

### Option A: Direct Web App Execution (Instant Browser Open)
Open `index.html` in any modern web browser or start a local Python HTTP server:

```bash
# In the project root:
python -m http.server 8000
```
Then navigate to: **`http://localhost:8000`**

---

### Option B: Python FastAPI Backend Service
To run the full REST API backend:

```bash
cd backend
pip install fastapi uvicorn pydantic
uvicorn main:app --reload --port 8000
```
- API Root: `http://localhost:8000`
- Interactive Swagger API Docs: `http://localhost:8000/docs`

---

### Option C: Node.js / Express Backend
```bash
cd backend
npm install express cors
node server.js
```

---

## 🗄️ Database Schema (`backend/database.sql`)

The application includes a production-ready PostgreSQL + PostGIS schema:
- `users`: Role-based authentication (Admin, Disaster Manager, Field Analyst, Citizen).
- `locations`: Spatial points with geological metadata.
- `risk_zones`: Hazard boundary polygons.
- `environmental_data`: 15-minute sensor telemetry logs.
- `rainfall_data`: Hourly & cumulative precipitation readings.
- `soil_moisture`: Topsoil (0-10cm) and root-zone moisture values.
- `risk_predictions`: AI model inference results with factor breakdowns and SHAP values.
- `alerts`: Early warning bulletins with CAP-compliant dispatch fields.
- `citizen_reports`: Crowdsourced incident observations with GPS coordinates and photos.
- `landslides`: Historical disaster catalog (2018–2025).

---

## 📂 Project Directory Structure

```
ai-agent/
├── index.html                  # Main responsive single-page web application
├── css/
│   ├── main.css                # Pure white design system, layout & typography tokens
│   ├── components.css          # Cards, alerts, modals, badges, factor bars, workflow stepper
│   └── map.css                 # Leaflet GIS styles, custom radar pulse pins, inspection drawer
├── js/
│   ├── app.js                  # Master SPA router, search autocomplete, live ticker simulator
│   ├── data.js                 # Dataset: monitored zones, alerts, historical landslides, GEE feed
│   ├── map.js                  # Leaflet GIS map engine with Topo, Satellite, & Heatmap overlays
│   ├── charts.js               # Chart.js engines for telemetry, trends, radar, & correlation
│   ├── ai-engine.js            # AI risk scoring, SHAP factor weights, & NLP explanation generator
│   ├── citizen-reports.js      # Citizen reporting, HTML5 GPS geolocation, & status verification
│   ├── alerts.js               # Early warning management, Web Audio synthesizer, & CAP dispatcher
│   └── export-utils.js         # CSV export and printable disaster risk bulletin generator
├── backend/
│   ├── main.py                 # Python FastAPI REST API server
│   ├── ml_model.py             # Python AI/ML Landslide Susceptibility Model
│   ├── server.js               # Node.js Express backend alternative
│   └── database.sql            # PostgreSQL + PostGIS relational database schema
├── .env.example                # Environment variables template
└── README.md                   # Complete system documentation
```

---

## 🛡️ Presentation & Demonstration Guide

1. **Overview & Workflow**: Start at the **Landing Page** and click through the interactive 7-stage workflow visualizer.
2. **Dashboard Overview**: Review the top KPI cards (3 High/Critical Zones, 2 Moderate, 3 Low, 4 Active Alerts).
3. **Interactive GIS Map**: Explore the Leaflet map, toggle layers (Satellite vs Topo), and click **Coonoor Ghat Corridor** or **Chooralmala** to slide open the real-time inspection drawer.
4. **Deep Location Analysis**: Switch to **Location Analysis** to observe the large 87.2% risk indicator and factor breakdown bars.
5. **Dynamic AI Explanations**: Review the natural language diagnostic reasoning explaining why the sector is critical.
6. **What-If Simulator**: Navigate to **AI Prediction** and slide the rainfall slider to 250 mm to observe instant model re-classification.
7. **Citizen Reporting**: Submit a new hazard report using the **"Use My Current GPS"** button, then switch roles in the header to **Admin** to verify or reject submitted reports.
8. **Disaster Warnings**: Open **Alerts & Warnings** and click **"Dispatch Public Siren / SMS"** to test the audio alert chime and CAP transmission simulation.
9. **Export**: Click **"Print Bulletin"** or **"CSV"** in the header to generate instant disaster reports.

---

*Developed for AI Landslide Early Warning & Disaster Mitigation Systems (Prototype Demonstration).*
