/**
 * AI-Based Landslide Risk Monitoring System
 * Interactive GIS Leaflet Mapping Engine
 */

let riskMap = null;
let markerLayerGroup = null;
let polygonLayerGroup = null;
let incidentLayerGroup = null;
let citizenLayerGroup = null;
let heatmapLayerGroup = null;

const LandslideMap = {
  activeLayers: {
    satellite: false,
    topo: true,
    riskPolygons: true,
    sensors: true,
    incidents: true,
    citizenReports: true,
    heatmap: true
  },

  init(containerId = "leaflet-risk-map") {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (riskMap) {
      riskMap.invalidateSize();
      return;
    }

    // Centered around Nilgiris / Western Ghats demo cluster (11.39, 76.71)
    riskMap = L.map(containerId, {
      center: [11.38, 76.74],
      zoom: 10,
      zoomControl: false
    });

    L.control.zoom({ position: 'topleft' }).addTo(riskMap);

    // Base Layers
    const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: '© OpenTopoMap contributors, SRTM'
    });

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: '© Esri, Maxar, Earthstar Geographics'
    });

    topoLayer.addTo(riskMap);

    this.baseLayers = {
      topo: topoLayer,
      osm: osmLayer,
      satellite: satelliteLayer
    };

    // Layer Groups
    polygonLayerGroup = L.layerGroup().addTo(riskMap);
    markerLayerGroup = L.layerGroup().addTo(riskMap);
    incidentLayerGroup = L.layerGroup().addTo(riskMap);
    citizenLayerGroup = L.layerGroup().addTo(riskMap);
    heatmapLayerGroup = L.layerGroup().addTo(riskMap);

    this.renderRiskPolygons();
    this.renderLocationMarkers();
    this.renderIncidentMarkers();
    this.renderCitizenMarkers();
    this.renderHeatmapSim();
  },

  setBaseLayer(type) {
    if (!riskMap) return;
    Object.values(this.baseLayers).forEach(layer => riskMap.removeLayer(layer));
    if (this.baseLayers[type]) {
      this.baseLayers[type].addTo(riskMap);
    }
  },

  renderRiskPolygons() {
    if (!polygonLayerGroup) return;
    polygonLayerGroup.clearLayers();

    LANDSLIDE_APP_DATA.riskPolygons.forEach(poly => {
      const color = poly.risk_category === "CRITICAL" ? "#991b1b" : "#ef4444";
      const polygon = L.polygon(poly.coords, {
        color: color,
        fillColor: color,
        fillOpacity: 0.28,
        weight: 2,
        dashArray: "4, 6"
      });

      polygon.bindTooltip(`<b>${poly.name}</b><br><span style="color:${color};font-weight:700">${poly.risk_category} RISK ZONE</span>`, {
        sticky: true
      });

      polygon.addTo(polygonLayerGroup);
    });
  },

  renderLocationMarkers() {
    if (!markerLayerGroup) return;
    markerLayerGroup.clearLayers();

    LANDSLIDE_APP_DATA.locations.forEach(loc => {
      const pinClass = loc.risk_category === "CRITICAL" ? "pin-critical" :
                       loc.risk_category === "HIGH" ? "pin-high" :
                       loc.risk_category === "MODERATE" ? "pin-moderate" : "pin-low";

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="custom-risk-pin ${pinClass}" style="width: 32px; height: 32px;">${Math.round(loc.risk_probability)}%</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: icon });

      marker.on('click', () => {
        this.openInspectionDrawer(loc);
      });

      const popupContent = `
        <div style="font-family: inherit; min-width: 220px;">
          <div style="font-weight: 800; font-size: 0.95rem; color: #0f172a; margin-bottom: 2px;">${loc.name}</div>
          <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 8px;">${loc.village}, ${loc.district}</div>
          <div style="background: ${loc.color}15; border: 1px solid ${loc.color}40; color: ${loc.color}; font-weight: 700; font-size: 0.8rem; padding: 4px 8px; border-radius: 6px; text-align: center; margin-bottom: 8px;">
            ${loc.risk_category} RISK: ${loc.risk_probability}%
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.75rem; color: #334155; margin-bottom: 10px;">
            <div>🌧️ Rain: <b>${loc.rainfall_24h_mm} mm</b></div>
            <div>💧 Soil: <b>${loc.soil_moisture_pct}%</b></div>
            <div>📐 Slope: <b>${loc.slope_deg}°</b></div>
            <div>⛰️ Elev: <b>${loc.elevation_m} m</b></div>
          </div>
          <button onclick="LandslideApp.selectLocation('${loc.id}'); LandslideApp.navigateTo('analysis');" style="width: 100%; background: #1e40af; color: white; border: none; padding: 6px; font-weight: 600; font-size: 0.75rem; border-radius: 6px; cursor: pointer;">
            Deep AI Analysis →
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(markerLayerGroup);
    });
  },

  renderIncidentMarkers() {
    if (!incidentLayerGroup) return;
    incidentLayerGroup.clearLayers();

    LANDSLIDE_APP_DATA.historicalIncidents.forEach(inc => {
      // Find approximate coordinates based on district
      const matchedLoc = LANDSLIDE_APP_DATA.locations.find(l => l.district === inc.district) || LANDSLIDE_APP_DATA.locations[0];
      const offsetLat = matchedLoc.lat + (Math.random() * 0.04 - 0.02);
      const offsetLng = matchedLoc.lng + (Math.random() * 0.04 - 0.02);

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background: #6366f1; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.3);">⚠️</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker([offsetLat, offsetLng], { icon: icon });
      marker.bindPopup(`
        <div style="font-size: 0.8rem; min-width: 180px;">
          <b style="color:#6366f1;">Historical Landslide Record</b><br>
          <b>Date:</b> ${inc.date}<br>
          <b>Location:</b> ${inc.location}<br>
          <b>Severity:</b> <span style="color:#ef4444;font-weight:700">${inc.severity}</span><br>
          <b>Prior 24h Rain:</b> ${inc.rain_24h} mm<br>
          <b>Impact:</b> ${inc.damage}
        </div>
      `);
      marker.addTo(incidentLayerGroup);
    });
  },

  renderCitizenMarkers() {
    if (!citizenLayerGroup) return;
    citizenLayerGroup.clearLayers();

    LANDSLIDE_APP_DATA.citizenReports.forEach(rep => {
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background: #0284c7; color: white; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📢</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([rep.lat, rep.lng], { icon: icon });
      marker.bindPopup(`
        <div style="font-size: 0.8rem; min-width: 200px;">
          <div style="font-weight: 700; color: #0284c7; font-size: 0.85rem;">Citizen Hazard Report: ${rep.id}</div>
          <div><b>Type:</b> ${rep.report_type}</div>
          <div><b>Location:</b> ${rep.location_name}</div>
          <div><b>Status:</b> <span style="color:#10b981;font-weight:700;">${rep.status}</span></div>
          <div style="margin-top: 4px; font-style: italic; color: #475569;">"${rep.description}"</div>
        </div>
      `);
      marker.addTo(citizenLayerGroup);
    });
  },

  renderHeatmapSim() {
    if (!heatmapLayerGroup) return;
    heatmapLayerGroup.clearLayers();

    // Simulated radar precipitation isohyet rings around high-risk centers
    LANDSLIDE_APP_DATA.locations.filter(l => l.risk_probability > 60).forEach(loc => {
      const circle = L.circle([loc.lat, loc.lng], {
        radius: 4500,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.12,
        weight: 1
      });
      circle.addTo(heatmapLayerGroup);
    });
  },

  toggleLayer(layerName, isChecked) {
    if (layerName === 'satellite') {
      this.setBaseLayer(isChecked ? 'satellite' : 'topo');
      return;
    }
    const mapLayers = {
      riskPolygons: polygonLayerGroup,
      sensors: markerLayerGroup,
      incidents: incidentLayerGroup,
      citizenReports: citizenLayerGroup,
      heatmap: heatmapLayerGroup
    };

    if (mapLayers[layerName] && riskMap) {
      if (isChecked) {
        riskMap.addLayer(mapLayers[layerName]);
      } else {
        riskMap.removeLayer(mapLayers[layerName]);
      }
    }
  },

  openInspectionDrawer(loc) {
    const drawer = document.getElementById("map-inspection-drawer");
    if (!drawer) return;

    const evaluation = LandslideAIEngine.calculate(loc);

    document.getElementById("drawer-location-name").textContent = loc.name;
    document.getElementById("drawer-village-district").textContent = `${loc.village}, ${loc.district} (${loc.state})`;
    
    const riskBadge = document.getElementById("drawer-risk-badge");
    riskBadge.textContent = `${loc.risk_category} RISK (${loc.risk_probability}%)`;
    riskBadge.className = `risk-badge ${loc.risk_category}`;

    document.getElementById("drawer-rainfall").textContent = `${loc.rainfall_24h_mm} mm`;
    document.getElementById("drawer-soil").textContent = `${loc.soil_moisture_pct}%`;
    document.getElementById("drawer-slope").textContent = `${loc.slope_deg}°`;
    document.getElementById("drawer-elevation").textContent = `${loc.elevation_m} m`;
    document.getElementById("drawer-geology").textContent = loc.soil_type;
    document.getElementById("drawer-confidence").textContent = `${evaluation.confidenceScore}%`;

    const reasonsList = document.getElementById("drawer-reasons-list");
    reasonsList.innerHTML = evaluation.aiExplanations.map(r => `
      <li style="margin-bottom: 6px; display: flex; gap: 8px; align-items: flex-start;">
        <span style="color: ${loc.color}; font-weight: 800;">•</span>
        <span>${r}</span>
      </li>
    `).join("");

    drawer.classList.add("open");
  },

  closeInspectionDrawer() {
    const drawer = document.getElementById("map-inspection-drawer");
    if (drawer) drawer.classList.remove("open");
  },

  flyToLocation(lat, lng, zoom = 13) {
    if (riskMap) {
      riskMap.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  }
};
