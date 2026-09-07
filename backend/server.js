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

// In-memory data store matching Python backend
const riskData = {
  system: "AI-Based Early Warning & Landslide Risk Monitoring System",
  version: "2.4.0",
  status: "ONLINE",
  zones: [
    {
      id: "LOC-01",
      name: "Emerald Valley & Doddabetta Slopes",
      district: "Nilgiris",
      state: "Tamil Nadu",
      lat: 11.3912,
      lng: 76.7112,
      risk_probability: 78.6,
      risk_category: "HIGH",
      color: "#ef4444",
      rainfall_24h_mm: 148.5,
      soil_moisture_pct: 82.4,
      slope_degrees: 36.5,
      elevation_m: 2180
    },
    {
      id: "LOC-02",
      name: "Coonoor Ghat Corridor (NH-67)",
      district: "Nilgiris",
      state: "Tamil Nadu",
      lat: 11.3530,
      lng: 76.7959,
      risk_probability: 87.2,
      risk_category: "CRITICAL",
      color: "#991b1b",
      rainfall_24h_mm: 162.0,
      soil_moisture_pct: 88.0,
      slope_degrees: 39.0,
      elevation_m: 1850
    },
    {
      id: "LOC-03",
      name: "Meppadi - Chooralmala Ridge",
      district: "Wayanad",
      state: "Kerala",
      lat: 11.5432,
      lng: 76.1245,
      risk_probability: 92.4,
      risk_category: "CRITICAL",
      color: "#991b1b",
      rainfall_24h_mm: 210.0,
      soil_moisture_pct: 91.5,
      slope_degrees: 41.2,
      elevation_m: 1240
    }
  ]
};

// Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    timestamp: new Date().toISOString(),
    services: ['Google Earth Engine', 'IMD Radar', 'SMAP Soil Moisture', 'AI Inference Engine']
  });
});

app.get('/api/risk', (req, res) => {
  res.json(riskData);
});

app.get('/api/risk/:id', (req, res) => {
  const zone = riskData.zones.find(z => z.id === req.params.id);
  if (!zone) return res.status(404).json({ error: 'Location not found' });
  res.json(zone);
});

app.listen(PORT, () => {
  console.log(`Landslide Early Warning Node.js Server running on port ${PORT}`);
});
