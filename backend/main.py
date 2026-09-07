"""
AI-Based Early Warning & Landslide Risk Monitoring System
FastAPI Backend Application (REST API Service)
"""

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

from ml_model import model_service, classify_risk

app = FastAPI(
    title="Landslide Early Warning & Risk Monitoring API",
    description="Backend API service for satellite telemetry, Google Earth Engine integration, AI risk prediction, and early disaster warning.",
    version="2.4.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Mock Data Store for Prototype / Demonstration Mode
# ------------------------------------------------------------------------------
MOCK_LOCATIONS = [
    {
        "id": "LOC-01",
        "name": "Emerald Valley & Doddabetta Slopes",
        "village": "Emerald Village",
        "district": "Nilgiris",
        "state": "Tamil Nadu",
        "latitude": 11.3912,
        "longitude": 76.7112,
        "elevation_m": 2180,
        "slope_degrees": 36.5,
        "soil_type": "Lateritic Red Loam",
        "vegetation_ndvi": 0.58,
        "historical_incidents": 14,
        "rainfall_24h_mm": 148.5,
        "soil_moisture_pct": 82.4,
        "temperature_c": 17.2,
        "humidity_pct": 94,
        "last_updated": "3 minutes ago"
    },
    {
        "id": "LOC-02",
        "name": "Coonoor Ghat Corridor (NH-67)",
        "village": "Marapalam Settlement",
        "district": "Nilgiris",
        "state": "Tamil Nadu",
        "latitude": 11.3530,
        "longitude": 76.7959,
        "elevation_m": 1850,
        "slope_degrees": 39.0,
        "soil_type": "Clayey Gneiss Regolith",
        "vegetation_ndvi": 0.42,
        "historical_incidents": 22,
        "rainfall_24h_mm": 162.0,
        "soil_moisture_pct": 88.0,
        "temperature_c": 19.1,
        "humidity_pct": 96,
        "last_updated": "5 minutes ago"
    },
    {
        "id": "LOC-03",
        "name": "Meppadi - Chooralmala Ridge",
        "village": "Chooralmala",
        "district": "Wayanad",
        "state": "Kerala",
        "latitude": 11.5432,
        "longitude": 76.1245,
        "elevation_m": 1240,
        "slope_degrees": 41.2,
        "soil_type": "Porous Forest Loam over Granulite",
        "vegetation_ndvi": 0.65,
        "historical_incidents": 19,
        "rainfall_24h_mm": 210.0,
        "soil_moisture_pct": 91.5,
        "temperature_c": 21.0,
        "humidity_pct": 98,
        "last_updated": "Just now"
    },
    {
        "id": "LOC-04",
        "name": "Kotagiri Tea Terraces",
        "village": "Kotagiri Rural",
        "district": "Nilgiris",
        "state": "Tamil Nadu",
        "latitude": 11.4200,
        "longitude": 76.8600,
        "elevation_m": 1793,
        "slope_degrees": 24.5,
        "soil_type": "Humic Mountain Soil",
        "vegetation_ndvi": 0.72,
        "historical_incidents": 6,
        "rainfall_24h_mm": 64.0,
        "soil_moisture_pct": 54.0,
        "temperature_c": 18.5,
        "humidity_pct": 78,
        "last_updated": "12 minutes ago"
    },
    {
        "id": "LOC-05",
        "name": "Munnar Gap Road Pass",
        "village": "Devikulam Sector",
        "district": "Idukki",
        "state": "Kerala",
        "latitude": 10.0889,
        "longitude": 77.0595,
        "elevation_m": 1530,
        "slope_degrees": 34.0,
        "soil_type": "Fissured Charnockite Rock/Soil",
        "vegetation_ndvi": 0.51,
        "historical_incidents": 11,
        "rainfall_24h_mm": 98.0,
        "soil_moisture_pct": 71.2,
        "temperature_c": 16.8,
        "humidity_pct": 89,
        "last_updated": "8 minutes ago"
    },
    {
        "id": "LOC-06",
        "name": "Kodaikanal Ghat Section",
        "village": "Pannaikadu",
        "district": "Dindigul",
        "state": "Tamil Nadu",
        "latitude": 10.2381,
        "longitude": 77.4892,
        "elevation_m": 1420,
        "slope_degrees": 22.0,
        "soil_type": "Sandy Clay Loam",
        "vegetation_ndvi": 0.61,
        "historical_incidents": 4,
        "rainfall_24h_mm": 28.0,
        "soil_moisture_pct": 36.5,
        "temperature_c": 20.4,
        "humidity_pct": 65,
        "last_updated": "15 minutes ago"
    },
    {
        "id": "LOC-07",
        "name": "Chamoli Valley Himalayan Flank",
        "village": "Joshimath Sector B",
        "district": "Chamoli",
        "state": "Uttarakhand",
        "latitude": 30.5564,
        "longitude": 79.5667,
        "elevation_m": 1890,
        "slope_degrees": 38.0,
        "soil_type": "Glacial Moraine Till",
        "vegetation_ndvi": 0.38,
        "historical_incidents": 26,
        "rainfall_24h_mm": 135.0,
        "soil_moisture_pct": 84.0,
        "temperature_c": 11.2,
        "humidity_pct": 91,
        "last_updated": "10 minutes ago"
    },
    {
        "id": "LOC-08",
        "name": "Shimla Bypass Ridge",
        "village": "Dhalli Outskirts",
        "district": "Shimla",
        "state": "Himachal Pradesh",
        "latitude": 31.1048,
        "longitude": 77.1734,
        "elevation_m": 2205,
        "slope_degrees": 29.5,
        "soil_type": "Phyllite & Schist Debris",
        "vegetation_ndvi": 0.55,
        "historical_incidents": 8,
        "rainfall_24h_mm": 45.0,
        "soil_moisture_pct": 48.0,
        "temperature_c": 14.0,
        "humidity_pct": 72,
        "last_updated": "20 minutes ago"
    }
]

# Initial in-memory alerts
MOCK_ALERTS = [
    {
        "id": "ALT-2026-091",
        "location_id": "LOC-03",
        "location_name": "Chooralmala, Meppadi Ridge (Wayanad)",
        "district": "Wayanad",
        "alert_level": "CRITICAL",
        "risk_probability_pct": 92.4,
        "headline": "CRITICAL RED ALERT: Imminent Debris Flow & Landslide Hazard",
        "trigger_reason": "Cumulative 24h precipitation (210 mm) triggered extreme soil saturation (91.5%) on 41° steep slope.",
        "recommended_action": "Immediate evacuation of downslope settlements. Close valley route traffic and mobilize NDRF/SDRF teams.",
        "status": "CRITICAL",
        "issued_at": datetime.now().isoformat()
    },
    {
        "id": "ALT-2026-088",
        "location_id": "LOC-02",
        "location_name": "Coonoor Ghat Corridor (NH-67)",
        "district": "Nilgiris",
        "alert_level": "HIGH RISK",
        "risk_probability_pct": 87.2,
        "headline": "HIGH RISK WARNING: Road Cut Slumping & Rockfall Vulnerability",
        "trigger_reason": "Persistent rain (162 mm) causing lateral soil thrust and seepage on 39° slope.",
        "recommended_action": "Restrict heavy vehicular movement on NH-67 Ghat section. Deploy geotechnical inspection teams.",
        "status": "ACTIVE",
        "issued_at": datetime.now().isoformat()
    },
    {
        "id": "ALT-2026-085",
        "location_id": "LOC-01",
        "location_name": "Emerald Valley & Doddabetta Slopes",
        "district": "Nilgiris",
        "alert_level": "HIGH RISK",
        "risk_probability_pct": 78.6,
        "headline": "HIGH RISK WATCH: Soil Creep & Drainage Overflow",
        "trigger_reason": "Soil moisture at 82.4% with continuing rainfall bands forecast over Doddabetta catchment.",
        "recommended_action": "Clear culverts, inspect retaining walls, and alert local village panchayat monitors.",
        "status": "ACTIVE",
        "issued_at": datetime.now().isoformat()
    },
    {
        "id": "ALT-2026-082",
        "location_id": "LOC-05",
        "location_name": "Munnar Gap Road Pass",
        "district": "Idukki",
        "alert_level": "WARNING",
        "risk_probability_pct": 64.1,
        "headline": "WARNING: Potential Rock Displacement along Cliff Face",
        "trigger_reason": "Rainfall reaching 98mm on fractured rocky terrain.",
        "recommended_action": "Erect cautionary signage and monitor rock mesh netting.",
        "status": "ACTIVE",
        "issued_at": datetime.now().isoformat()
    }
]

# Initial Citizen Reports
MOCK_REPORTS = [
    {
        "id": "CIT-8021",
        "reporter_name": "R. Vignesh",
        "contact_info": "+91 98401 23456",
        "location_name": "Marapalam 3rd Hairpin Bend",
        "district": "Nilgiris",
        "latitude": 11.3551,
        "longitude": 76.7972,
        "report_type": "Ground cracks",
        "description": "Noticed 3-inch wide tensile ground cracks running parallel across the upper road shoulder after morning downpour.",
        "photo_url": "assets/demo_cracks.jpg",
        "status": "Verified",
        "assigned_risk_level": "HIGH",
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "CIT-8022",
        "reporter_name": "A. Joseph",
        "contact_info": "+91 94470 65432",
        "location_name": "Chooralmala Tea Estate Block 4",
        "district": "Wayanad",
        "latitude": 11.5410,
        "longitude": 76.1260,
        "report_type": "Soil movement",
        "description": "Mud water flowing with gravel down the stream embankment; leaning eucalyptus trees observed.",
        "photo_url": "assets/demo_mudflow.jpg",
        "status": "Verified",
        "assigned_risk_level": "CRITICAL",
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "CIT-8023",
        "reporter_name": "S. Rajeshwari",
        "contact_info": "+91 97890 11223",
        "location_name": "Kotagiri Valley Edge",
        "district": "Nilgiris",
        "latitude": 11.4230,
        "longitude": 76.8620,
        "report_type": "Water accumulation",
        "description": "Drainage ditch blocked with sediment causing runoff pooling on steep terrace boundary.",
        "photo_url": "assets/demo_drainage.jpg",
        "status": "Pending",
        "assigned_risk_level": "MODERATE",
        "created_at": datetime.now().isoformat()
    }
]

# ------------------------------------------------------------------------------
# Pydantic Request/Response Models
# ------------------------------------------------------------------------------
class CitizenReportCreate(BaseModel):
    reporter_name: str
    contact_info: Optional[str] = None
    location_name: str
    district: Optional[str] = "Nilgiris"
    latitude: float
    longitude: float
    report_type: str
    description: str
    photo_url: Optional[str] = None

class PredictionRequest(BaseModel):
    rainfall_24h: float = Field(..., ge=0, le=500)
    soil_moisture_pct: float = Field(..., ge=0, le=100)
    slope_degrees: float = Field(..., ge=0, le=90)
    elevation_m: float = Field(default=1500, ge=0, le=9000)
    historical_incidents_score: float = Field(default=50, ge=0, le=100)
    terrain_geology_score: float = Field(default=50, ge=0, le=100)
    forecast_rain_trend: Optional[str] = "steady"

class AlertCreate(BaseModel):
    location_name: str
    district: str
    alert_level: str
    risk_probability_pct: float
    headline: str
    trigger_reason: str
    recommended_action: str


# ------------------------------------------------------------------------------
# API Endpoints
# ------------------------------------------------------------------------------

@app.get("/")
def read_root():
    return {
        "system": "AI-Based Early Warning & Landslide Risk Monitoring System",
        "version": "2.4.0",
        "status": "ONLINE",
        "theme": "White Professional Modern",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def get_system_health():
    """Returns operational status of data sources and subsystems."""
    return {
        "system_status": "OPERATIONAL",
        "timestamp": datetime.now().isoformat(),
        "services": [
            {"name": "Google Earth Engine API", "status": "CONNECTED", "latency_ms": 42, "description": "Sentinel-1 InSAR & DEM pipeline"},
            {"name": "Weather & IMD Telemetry", "status": "CONNECTED", "latency_ms": 38, "description": "Doppler radar & automatic weather stations"},
            {"name": "Soil Moisture Sensors (SMAP)", "status": "CONNECTED", "latency_ms": 55, "description": "Satellite & in-situ TDR moisture probes"},
            {"name": "AI Prediction Engine", "status": "CONNECTED", "latency_ms": 12, "description": "LS-Ensemble-v2.4 scoring model"},
            {"name": "Historical Landslide Database", "status": "CONNECTED", "latency_ms": 18, "description": "Geological Survey of India inventory"},
            {"name": "CAP Early Warning Gateway", "status": "CONNECTED", "latency_ms": 25, "description": "Common Alerting Protocol SMS/Siren broadcast"}
        ]
    }

@app.get("/api/risk")
def get_all_risk_zones():
    """Calculates live risk for all monitored demo locations."""
    results = []
    for loc in MOCK_LOCATIONS:
        prediction = model_service.calculate_risk({
            "rainfall_24h": loc["rainfall_24h_mm"],
            "soil_moisture_pct": loc["soil_moisture_pct"],
            "slope_degrees": loc["slope_degrees"],
            "elevation_m": loc["elevation_m"],
            "historical_incidents_score": loc["historical_incidents"] * 4,
            "terrain_geology_score": 55
        })
        results.append({
            **loc,
            "prediction": prediction
        })
    return {
        "count": len(results),
        "zones": results,
        "summary": {
            "critical_count": sum(1 for z in results if z["prediction"]["risk_category"] == "CRITICAL"),
            "high_count": sum(1 for z in results if z["prediction"]["risk_category"] == "HIGH"),
            "moderate_count": sum(1 for z in results if z["prediction"]["risk_category"] == "MODERATE"),
            "low_count": sum(1 for z in results if z["prediction"]["risk_category"] == "LOW"),
            "active_alerts": len([a for a in MOCK_ALERTS if a["status"] in ["ACTIVE", "CRITICAL"]])
        }
    }

@app.get("/api/risk/{location_id}")
def get_location_risk(location_id: str):
    """Fetches risk assessment and AI explanation for a specific location."""
    loc = next((l for l in MOCK_LOCATIONS if l["id"] == location_id), None)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")

    prediction = model_service.calculate_risk({
        "rainfall_24h": loc["rainfall_24h_mm"],
        "soil_moisture_pct": loc["soil_moisture_pct"],
        "slope_degrees": loc["slope_degrees"],
        "elevation_m": loc["elevation_m"],
        "historical_incidents_score": loc["historical_incidents"] * 4,
        "terrain_geology_score": 55
    })
    return {
        "location": loc,
        "prediction": prediction
    }

@app.post("/api/prediction")
def run_custom_prediction(req: PredictionRequest):
    """Executes real-time AI risk inference for arbitrary input parameters (What-If Simulator)."""
    prediction = model_service.calculate_risk({
        "rainfall_24h": req.rainfall_24h,
        "soil_moisture_pct": req.soil_moisture_pct,
        "slope_degrees": req.slope_degrees,
        "elevation_m": req.elevation_m,
        "historical_incidents_score": req.historical_incidents_score,
        "terrain_geology_score": req.terrain_geology_score,
        "forecast_rain_trend": req.forecast_rain_trend
    })
    return prediction

@app.get("/api/alerts")
def get_alerts(status_filter: Optional[str] = Query(None)):
    """Lists early warning alerts with optional filtering."""
    if status_filter and status_filter.upper() != "ALL":
        filtered = [a for a in MOCK_ALERTS if a["status"].upper() == status_filter.upper()]
        return {"count": len(filtered), "alerts": filtered}
    return {"count": len(MOCK_ALERTS), "alerts": MOCK_ALERTS}

@app.post("/api/alerts")
def create_alert(alert: AlertCreate):
    """Manually broadcasts a new disaster warning alert."""
    new_alert = {
        "id": f"ALT-2026-{len(MOCK_ALERTS)+101}",
        "location_id": "CUSTOM",
        "location_name": alert.location_name,
        "district": alert.district,
        "alert_level": alert.alert_level,
        "risk_probability_pct": alert.risk_probability_pct,
        "headline": alert.headline,
        "trigger_reason": alert.trigger_reason,
        "recommended_action": alert.recommended_action,
        "status": "ACTIVE",
        "issued_at": datetime.now().isoformat()
    }
    MOCK_ALERTS.insert(0, new_alert)
    return {"status": "SUCCESS", "alert": new_alert}

@app.get("/api/reports")
def get_citizen_reports(status: Optional[str] = Query(None)):
    """Retrieves all crowd-sourced citizen landslide observation reports."""
    if status and status.lower() != "all":
        filtered = [r for r in MOCK_REPORTS if r["status"].lower() == status.lower()]
        return {"count": len(filtered), "reports": filtered}
    return {"count": len(MOCK_REPORTS), "reports": MOCK_REPORTS}

@app.post("/api/reports", status_code=status.HTTP_201_CREATED)
def submit_citizen_report(report: CitizenReportCreate):
    """Submits a new citizen hazard report."""
    new_report = {
        "id": f"CIT-{8020 + len(MOCK_REPORTS) + 1}",
        "reporter_name": report.reporter_name,
        "contact_info": report.contact_info or "Anonymous Citizen",
        "location_name": report.location_name,
        "district": report.district or "Nilgiris",
        "latitude": report.latitude,
        "longitude": report.longitude,
        "report_type": report.report_type,
        "description": report.description,
        "photo_url": report.photo_url or "assets/demo_report_photo.jpg",
        "status": "Pending",
        "assigned_risk_level": "HIGH" if "landslide" in report.report_type.lower() or "cracks" in report.report_type.lower() else "MODERATE",
        "created_at": datetime.now().isoformat()
    }
    MOCK_REPORTS.insert(0, new_report)
    return {"status": "SUBMITTED", "report": new_report}

@app.patch("/api/reports/{report_id}/verify")
def verify_citizen_report(report_id: str, new_status: str = Query("Verified")):
    """Allows disaster managers to verify or reject citizen reports."""
    report = next((r for r in MOCK_REPORTS if r["id"] == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report["status"] = new_status
    return {"status": "UPDATED", "report": report}

@app.get("/api/history")
def get_historical_landslide_data():
    """Returns retrospective landslide disaster inventory."""
    return {
        "total_recorded_events": 142,
        "timespan": "2018 - 2025",
        "high_risk_hotspots": ["Nilgiris Ghats", "Wayanad Escarpment", "Idukki Ridge", "Chamoli Flank", "Darjeeling Hills"],
        "incidents_by_year": [
            {"year": "2018", "incidents": 18, "avg_rainfall_mm": 240},
            {"year": "2019", "incidents": 26, "avg_rainfall_mm": 310},
            {"year": "2020", "incidents": 14, "avg_rainfall_mm": 190},
            {"year": "2021", "incidents": 21, "avg_rainfall_mm": 275},
            {"year": "2022", "incidents": 19, "avg_rainfall_mm": 230},
            {"year": "2023", "incidents": 24, "avg_rainfall_mm": 295},
            {"year": "2024", "incidents": 38, "avg_rainfall_mm": 380},
            {"year": "2025", "incidents": 22, "avg_rainfall_mm": 260}
        ],
        "district_distribution": [
            {"district": "Nilgiris (TN)", "count": 48},
            {"district": "Wayanad (KL)", "count": 39},
            {"district": "Idukki (KL)", "count": 27},
            {"district": "Chamoli (UK)", "count": 16},
            {"district": "Shimla (HP)", "count": 12}
        ]
    }
