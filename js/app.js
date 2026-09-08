/**
 * AI-Based Early Warning & Landslide Risk Monitoring System
 * Master Application Controller & Single Page Application Router
 */

const LandslideApp = {
  currentView: "landing",
  currentLocationId: "LOC-02", // Default to Coonoor Ghat Corridor (Critical Demo)
  currentRole: "DISASTER_MANAGER",
  autoRefreshInterval: null,
  countdownSeconds: 300,

  init() {
    this.bindNavigation();
    this.bindRoleSwitcher();
    this.bindSearchAutocomplete();
    this.bindWorkflowInteractions();
    this.bindWhatIfSimulator();
    this.bindLocationSelector();
    this.startLiveSimulationTicker();

    // Check URL hash or default to landing/dashboard
    const hash = window.location.hash.replace("#", "") || "landing";
    this.navigateTo(hash);

    // Initialize sub-modules
    CitizenReporting.init();
    EarlyWarningSystem.init();
  },

  navigateTo(viewName) {
    const validViews = [
      "landing",
      "dashboard",
      "chatbot",
      "map",
      "analysis",
      "environment",
      "prediction",
      "trends",
      "citizen-reports",
      "alerts",
      "history",
      "workflow",
      "admin"
    ];


    if (!validViews.includes(viewName)) {
      viewName = "dashboard";
    }

    this.currentView = viewName;
    window.location.hash = viewName;

    // Toggle view sections
    document.querySelectorAll(".view-section").forEach(sec => {
      sec.style.display = "none";
    });

    const targetSec = document.getElementById(`view-${viewName}`);
    if (targetSec) {
      targetSec.style.display = "block";
    }

    // Update active nav items
    document.querySelectorAll(".nav-item").forEach(item => {
      if (item.getAttribute("data-view") === viewName) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Update active mobile bottom nav buttons
    document.querySelectorAll(".bottom-nav-btn").forEach(bbtn => {
      if (bbtn.getAttribute("data-bview") === viewName) {
        bbtn.classList.add("active");
      } else {
        bbtn.classList.remove("active");
      }
    });

    // Close mobile drawer and backdrop if open
    const sidebar = document.getElementById("main-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (sidebar) sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("active");

    // Trigger view-specific renderers
    this.onViewLoaded(viewName);
    window.scrollTo(0, 0);
  },

  onViewLoaded(viewName) {
    const loc = this.getSelectedLocation();

    if (viewName === "dashboard") {
      this.renderDashboard();
    } else if (viewName === "map") {
      setTimeout(() => {
        LandslideMap.init("leaflet-risk-map");
      }, 50);
    } else if (viewName === "analysis") {
      this.renderLocationAnalysis(loc);
    } else if (viewName === "environment") {
      setTimeout(() => {
        LandslideCharts.initEnvironmentalCharts("24h");
        this.renderEnvironmentalStatus(loc);
      }, 50);
    } else if (viewName === "prediction") {
      this.renderAIPredictionPage(loc);
    } else if (viewName === "trends") {
      this.renderRiskTrendsPage(loc);
    } else if (viewName === "citizen-reports") {
      CitizenReporting.renderReportsTable();
    } else if (viewName === "alerts") {
      EarlyWarningSystem.renderAlertFeed();
    } else if (viewName === "history") {
      this.renderHistoricalPage();
    } else if (viewName === "workflow") {
      this.renderWorkflowVisualizer(1);
    } else if (viewName === "admin") {
      this.renderAdminHealthPage();
    }
  },

  getSelectedLocation() {
    return LANDSLIDE_APP_DATA.locations.find(l => l.id === this.currentLocationId) || LANDSLIDE_APP_DATA.locations[0];
  },

  selectLocation(locationId) {
    this.currentLocationId = locationId;
    if (typeof LandslideAIChatbot !== "undefined") {
      LandslideAIChatbot.contextLocationId = locationId;
    }
    const loc = this.getSelectedLocation();


    // Update header context text
    const headerLocText = document.getElementById("header-location-name");
    if (headerLocText) {
      headerLocText.textContent = `${loc.name} (${loc.district})`;
    }

    // Re-render if on a location-dependent view
    if (this.currentView === "analysis") {
      this.renderLocationAnalysis(loc);
    } else if (this.currentView === "prediction") {
      this.renderAIPredictionPage(loc);
    } else if (this.currentView === "trends") {
      this.renderRiskTrendsPage(loc);
    } else if (this.currentView === "environment") {
      this.renderEnvironmentalStatus(loc);
    }
  },

  renderDashboard() {
    const locations = LANDSLIDE_APP_DATA.locations;
    const critCount = locations.filter(l => l.risk_category === "CRITICAL").length;
    const highCount = locations.filter(l => l.risk_category === "HIGH").length;
    const modCount = locations.filter(l => l.risk_category === "MODERATE").length;
    const lowCount = locations.filter(l => l.risk_category === "LOW").length;
    const activeAlertsCount = LANDSLIDE_APP_DATA.alerts.filter(a => a.status === "ACTIVE" || a.status === "CRITICAL").length;

    // Calculate averages
    const avgRain = Math.round(locations.reduce((acc, l) => acc + l.rainfall_24h_mm, 0) / locations.length);
    const avgSoil = Math.round(locations.reduce((acc, l) => acc + l.soil_moisture_pct, 0) / locations.length);
    const avgSlope = Math.round(locations.reduce((acc, l) => acc + l.slope_deg, 0) / locations.length);

    document.getElementById("kpi-high-risk").textContent = `${critCount + highCount} Zones`;
    document.getElementById("kpi-mod-risk").textContent = `${modCount} Zones`;
    document.getElementById("kpi-low-risk").textContent = `${lowCount} Zones`;
    document.getElementById("kpi-active-alerts").textContent = `${activeAlertsCount}`;
    document.getElementById("kpi-avg-rain").textContent = `${avgRain} mm`;
    document.getElementById("kpi-avg-soil").textContent = `${avgSoil}%`;
    document.getElementById("kpi-avg-slope").textContent = `${avgSlope}°`;

    // Render quick risk table
    const tableBody = document.getElementById("dashboard-zones-table-body");
    if (tableBody) {
      tableBody.innerHTML = locations.map(loc => `
        <tr style="cursor: pointer;" onclick="LandslideApp.selectLocation('${loc.id}'); LandslideApp.navigateTo('analysis');">
          <td><b>${loc.name}</b><br><span style="font-size:0.75rem; color:#64748b;">${loc.village}, ${loc.district}</span></td>
          <td><span class="risk-badge ${loc.risk_category}">${loc.risk_category} (${loc.risk_probability}%)</span></td>
          <td><b>${loc.rainfall_24h_mm} mm</b></td>
          <td><b>${loc.soil_moisture_pct}%</b></td>
          <td>${loc.slope_deg}°</td>
          <td>${loc.elevation_m} m</td>
          <td style="font-size:0.75rem; color:#64748b;">${loc.last_updated}</td>
          <td><button class="btn btn-secondary btn-sm">Analyze →</button></td>
        </tr>
      `).join("");
    }

    // Mini preview map
    setTimeout(() => {
      LandslideMap.init("dashboard-mini-map");
    }, 50);
  },

  renderLocationAnalysis(loc) {
    const evalData = LandslideAIEngine.calculate(loc);

    document.getElementById("analysis-title").textContent = `${loc.name} - Geo-Environmental Analysis`;
    document.getElementById("analysis-district").textContent = `${loc.village}, ${loc.district} (${loc.state})`;
    document.getElementById("analysis-coords").textContent = `Lat: ${loc.lat}°N, Lng: ${loc.lng}°E | Altitude: ${loc.elevation_m}m MSL`;

    // Big Risk Score Indicator
    const scoreVal = document.getElementById("analysis-risk-score");
    const scoreLabel = document.getElementById("analysis-risk-label");
    const scoreCard = document.getElementById("analysis-score-card");

    scoreVal.textContent = `${evalData.riskProbability}%`;
    scoreLabel.textContent = `${loc.risk_category} LANDSLIDE RISK`;
    scoreCard.style.borderLeft = `8px solid ${loc.color}`;

    // Factor Breakdown Progress Bars
    const factorsContainer = document.getElementById("analysis-factors-list");
    factorsContainer.innerHTML = evalData.factorBreakdown.map(f => `
      <div class="factor-item">
        <div class="factor-header">
          <span><b>${f.name}</b> (${f.rawValue})</span>
          <span style="color: ${f.score > 60 ? '#ef4444' : '#1e40af'}; font-weight: 700;">${f.impact} • ${f.score}%</span>
        </div>
        <div class="factor-bar-bg">
          <div class="factor-bar-fill" style="width: ${f.score}%; background-color: ${f.color};"></div>
        </div>
      </div>
    `).join("");

    // Dynamic AI Explanations
    const expList = document.getElementById("analysis-ai-explanations");
    expList.innerHTML = evalData.aiExplanations.map((exp, idx) => `
      <li style="margin-bottom: 8px; display: flex; gap: 8px; font-size: 0.875rem;">
        <span style="font-weight: 800; color: #1e40af;">${idx + 1}.</span>
        <span>${exp}</span>
      </li>
    `).join("");

    // Geotechnical specs
    document.getElementById("spec-soil-type").textContent = loc.soil_type;
    document.getElementById("spec-geology").textContent = loc.geology;
    document.getElementById("spec-slope").textContent = `${loc.slope_deg}° Inclination`;
    document.getElementById("spec-pore-pressure").textContent = `${loc.pore_pressure_kpa} kPa`;
    document.getElementById("spec-vibration").textContent = `${loc.ground_vibration_mms} mm/s`;
    document.getElementById("spec-history-count").textContent = `${loc.historical_incidents} Events`;
  },

  renderEnvironmentalStatus(loc) {
    document.getElementById("env-loc-name").textContent = loc.name;
    document.getElementById("env-rain-val").textContent = `${loc.rainfall_24h_mm} mm`;
    document.getElementById("env-soil-val").textContent = `${loc.soil_moisture_pct}%`;
    document.getElementById("env-pore-val").textContent = `${loc.pore_pressure_kpa} kPa`;
    document.getElementById("env-vibe-val").textContent = `${loc.ground_vibration_mms} mm/s`;
  },

  renderAIPredictionPage(loc) {
    const evalData = LandslideAIEngine.calculate(loc);

    document.getElementById("pred-score-val").textContent = `${evalData.riskProbability}%`;
    document.getElementById("pred-category-val").textContent = loc.risk_category;
    document.getElementById("pred-confidence-val").textContent = `${evalData.confidenceScore}%`;

    // Render Radar
    setTimeout(() => {
      LandslideCharts.renderAIFactorRadar(loc);
    }, 50);

    // Explanations
    const expBox = document.getElementById("pred-explanation-box");
    expBox.innerHTML = `
      <h4 style="margin-bottom: 10px; color: #0f172a; font-size: 1rem;">Why is ${loc.name} classified as ${loc.risk_category} Risk?</h4>
      <ul style="list-style: none; padding: 0;">
        ${evalData.aiExplanations.map(e => `
          <li style="margin-bottom: 8px; display: flex; gap: 8px;">
            <span style="color: #1e40af; font-weight: bold;">✔</span>
            <span style="font-size: 0.875rem; color: #334155;">${e}</span>
          </li>
        `).join("")}
      </ul>
    `;
  },

  renderRiskTrendsPage(loc) {
    document.getElementById("trend-location-name").textContent = `${loc.name} (${loc.district})`;
    const evalData = LandslideAIEngine.calculate(loc);
    const traj = evalData.trendTrajectory;

    document.getElementById("trend-val-past").textContent = `${traj.past_24h}%`;
    document.getElementById("trend-val-now").textContent = `${traj.current}%`;
    document.getElementById("trend-val-6h").textContent = `${traj.forecast_6h}%`;
    document.getElementById("trend-val-24h").textContent = `${traj.forecast_24h}%`;
    document.getElementById("trend-val-7d").textContent = `${traj.forecast_7d}%`;

    const trendIndicator = document.getElementById("trend-increasing-badge");
    if (evalData.isIncreasing) {
      trendIndicator.style.display = "inline-flex";
    } else {
      trendIndicator.style.display = "none";
    }

    setTimeout(() => {
      LandslideCharts.renderRiskTrendsChart(loc);
    }, 50);
  },

  renderHistoricalPage() {
    const list = LANDSLIDE_APP_DATA.historicalIncidents;
    const tableBody = document.getElementById("history-table-body");
    if (tableBody) {
      tableBody.innerHTML = list.map(item => `
        <tr>
          <td><b>${item.date}</b></td>
          <td><b>${item.location}</b></td>
          <td>${item.district}</td>
          <td><span class="risk-badge ${item.severity === 'CATASTROPHIC' ? 'CRITICAL' : 'HIGH'}">${item.severity}</span></td>
          <td><b>${item.rain_24h} mm</b></td>
          <td><span style="color: ${item.fatalities > 0 ? '#ef4444' : '#64748b'}; font-weight: bold;">${item.fatalities}</span></td>
          <td style="font-size: 0.8rem; color: #334155;">${item.damage}</td>
        </tr>
      `).join("");
    }

    setTimeout(() => {
      LandslideCharts.renderHistoricalCharts();
    }, 50);
  },

  renderWorkflowVisualizer(selectedStep = 1) {
    const container = document.getElementById("workflow-steps-container");
    if (!container) return;

    const stages = LANDSLIDE_APP_DATA.workflowStages;
    container.innerHTML = stages.map(st => `
      <div class="workflow-node ${st.step === selectedStep ? 'selected' : ''}" onclick="LandslideApp.renderWorkflowVisualizer(${st.step})">
        <div class="workflow-node-number">${st.step}</div>
        <div style="flex: 1;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: #0284c7; font-weight: 700;">${st.subtitle}</div>
          <h4 style="font-size: 1.05rem; font-weight: 700; color: #0f172a;">${st.title}</h4>
          <p style="font-size: 0.85rem; color: #475569; margin-top: 4px;">${st.desc}</p>
          <div style="margin-top: 6px; font-size: 0.75rem; color: #1e40af; font-weight: 600;">Core Tech: ${st.tech}</div>
        </div>
      </div>
      ${st.step < 7 ? '<div class="workflow-arrow-connector">↓</div>' : ''}
    `).join("");

    // Details panel for active step
    const current = stages.find(s => s.step === selectedStep) || stages[0];
    const detailBox = document.getElementById("workflow-detail-display");
    if (detailBox) {
      detailBox.innerHTML = `
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 1.5rem; border-radius: 12px;">
          <div style="font-size: 0.8rem; color: #1e40af; font-weight: 800; text-transform: uppercase;">Step ${current.step} Active Architecture Focus</div>
          <h3 style="font-size: 1.3rem; font-weight: 800; color: #0f172a; margin: 4px 0 10px 0;">${current.title}</h3>
          <p style="font-size: 0.95rem; color: #334155; line-height: 1.6;">${current.desc}</p>
          <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #bfdbfe; font-size: 0.85rem; color: #1e3a8a;">
            <b>Integration Interface:</b> ${current.tech}
          </div>
        </div>
      `;
    }
  },

  renderAdminHealthPage() {
    const list = LANDSLIDE_APP_DATA.dataSources;
    const container = document.getElementById("admin-datasources-grid");
    if (container) {
      container.innerHTML = list.map(ds => `
        <div class="card" style="border-top: 4px solid #10b981;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase;">${ds.type}</span>
            <span style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 9999px; font-size: 0.7rem; font-weight: 700;">${ds.status}</span>
          </div>
          <h4 style="font-size: 1rem; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${ds.name}</h4>
          <p style="font-size: 0.8rem; color: #475569; margin-bottom: 12px;">${ds.detail}</p>
          <div style="font-size: 0.75rem; color: #1e40af; font-weight: 600;">Response Latency: ${ds.latency}</div>
        </div>
      `).join("");
    }
  },

  bindNavigation() {
    document.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const view = item.getAttribute("data-view");
        this.navigateTo(view);
      });
    });

    document.querySelectorAll(".bottom-nav-btn[data-bview]").forEach(bbtn => {
      bbtn.addEventListener("click", (e) => {
        e.preventDefault();
        const view = bbtn.getAttribute("data-bview");
        this.navigateTo(view);
      });
    });

    const hamburger = document.getElementById("hamburger-btn");
    const mobileMenuTrigger = document.getElementById("mobile-menu-trigger");
    const sidebar = document.getElementById("main-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");

    const toggleSidebar = () => {
      if (sidebar) {
        const isOpen = sidebar.classList.toggle("open");
        if (backdrop) {
          backdrop.classList.toggle("active", isOpen);
        }
      }
    };

    if (hamburger) hamburger.addEventListener("click", toggleSidebar);
    if (mobileMenuTrigger) mobileMenuTrigger.addEventListener("click", toggleSidebar);
    if (backdrop) backdrop.addEventListener("click", () => {
      if (sidebar) sidebar.classList.remove("open");
      backdrop.classList.remove("active");
    });
  },

  bindRoleSwitcher() {
    const select = document.getElementById("global-role-select");
    if (select) {
      select.addEventListener("change", (e) => {
        this.currentRole = e.target.value;
        this.showToast(`Active User Role Switched to: ${this.currentRole}`, "info");
        if (this.currentView === "citizen-reports") {
          CitizenReporting.renderReportsTable();
        }
      });
    }
  },

  bindSearchAutocomplete() {
    const searchInput = document.getElementById("global-location-search");
    const resultsBox = document.getElementById("search-results-dropdown");
    if (!searchInput || !resultsBox) return;

    const handleGlobalSearch = (queryText) => {
      const q = (queryText || searchInput.value).trim();
      if (!q) return;
      resultsBox.style.display = "none";
      
      // Navigate to Map and execute search
      this.navigateTo('map');
      setTimeout(() => {
        if (typeof LandslideMap !== "undefined" && LandslideMap.searchLocation) {
          const mapInput = document.getElementById("map-search-input");
          if (mapInput) mapInput.value = q;
          LandslideMap.searchLocation(q);
        }
      }, 150);
    };

    // Trigger search on Enter key press
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleGlobalSearch();
      }
    });

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        resultsBox.style.display = "none";
        return;
      }

      const matches = LANDSLIDE_APP_DATA.locations.filter(l =>
        l.name.toLowerCase().includes(query) ||
        l.village.toLowerCase().includes(query) ||
        l.district.toLowerCase().includes(query) ||
        l.state.toLowerCase().includes(query)
      );

      let html = "";

      if (matches.length > 0) {
        html += matches.map(m => `
          <div style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'" onclick="LandslideApp.selectLocation('${m.id}'); LandslideApp.navigateTo('analysis'); document.getElementById('search-results-dropdown').style.display='none';">
            <div style="font-weight: 700; font-size: 0.85rem; color: #0f172a;">📍 ${m.name}</div>
            <div style="font-size: 0.75rem; color: #64748b;">${m.village}, ${m.district} • <span class="risk-badge ${m.risk_category}" style="font-size:0.65rem; padding: 1px 4px;">${m.risk_category}</span></div>
          </div>
        `).join("");
      }

      // Always show global map search option for any location worldwide
      html += `
        <div style="padding: 10px 12px; background: #eff6ff; cursor: pointer; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #dbeafe;" onclick="LandslideApp.navigateTo('map'); setTimeout(() => { LandslideMap.searchLocation('${query.replace(/'/g, "\\'")}'); }, 150); document.getElementById('search-results-dropdown').style.display='none';">
          <div>
            <div style="font-weight: 700; font-size: 0.825rem; color: #1e40af;">🔍 Search "${query}" on Global Map</div>
            <div style="font-size: 0.725rem; color: #3b82f6;">Fly to location with GIS Satellite telemetry</div>
          </div>
          <span style="font-size: 0.8rem; font-weight: 700; color: #1e40af;">Go →</span>
        </div>
      `;

      resultsBox.innerHTML = html;
      resultsBox.style.display = "block";
    });

    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !resultsBox.contains(e.target)) {
        resultsBox.style.display = "none";
      }
    });
  },

  bindWorkflowInteractions() {
    // Stage interactions in visualizer
  },

  bindWhatIfSimulator() {
    const rainSlider = document.getElementById("sim-rain-slider");
    const soilSlider = document.getElementById("sim-soil-slider");
    const slopeSlider = document.getElementById("sim-slope-slider");

    if (!rainSlider) return;

    const updateSim = () => {
      const rain = parseFloat(rainSlider.value);
      const soil = parseFloat(soilSlider.value);
      const slope = parseFloat(slopeSlider.value);

      document.getElementById("sim-rain-val").textContent = `${rain} mm`;
      document.getElementById("sim-soil-val").textContent = `${soil}%`;
      document.getElementById("sim-slope-val").textContent = `${slope}°`;

      const simResult = LandslideAIEngine.calculate({
        rainfall_24h_mm: rain,
        soil_moisture_pct: soil,
        slope_deg: slope,
        elevation_m: 1600,
        historical_score: 50
      });

      const simScore = document.getElementById("sim-predicted-score");
      const simCat = document.getElementById("sim-predicted-cat");

      if (simScore && simCat) {
        simScore.textContent = `${simResult.riskProbability}%`;
        simCat.textContent = simResult.classification.category;
        simCat.className = `risk-badge ${simResult.classification.category}`;
      }
    };

    [rainSlider, soilSlider, slopeSlider].forEach(slider => {
      if (slider) slider.addEventListener("input", updateSim);
    });
  },

  bindLocationSelector() {
    const selector = document.getElementById("global-location-select");
    if (selector) {
      selector.innerHTML = LANDSLIDE_APP_DATA.locations.map(l => `
        <option value="${l.id}">${l.name} (${l.district}) - ${l.risk_category}</option>
      `).join("");

      selector.value = this.currentLocationId;
      selector.addEventListener("change", (e) => {
        this.selectLocation(e.target.value);
      });
    }
  },

  startLiveSimulationTicker() {
    setInterval(() => {
      this.countdownSeconds -= 1;
      if (this.countdownSeconds <= 0) {
        this.countdownSeconds = 300;
        this.refreshLiveData();
      }

      const countdownEl = document.getElementById("refresh-countdown");
      if (countdownEl) {
        const mins = Math.floor(this.countdownSeconds / 60);
        const secs = this.countdownSeconds % 60;
        countdownEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }
    }, 1000);
  },

  refreshLiveData() {
    // Slightly fluctuate rain & soil moisture to simulate incoming GEE telemetry feed
    LANDSLIDE_APP_DATA.locations.forEach(loc => {
      const rainDelta = (Math.random() * 4 - 1.8);
      loc.rainfall_24h_mm = Math.max(10, Math.round((loc.rainfall_24h_mm + rainDelta) * 10) / 10);

      const soilDelta = (Math.random() * 2 - 0.8);
      loc.soil_moisture_pct = Math.max(20, Math.min(99, Math.round((loc.soil_moisture_pct + soilDelta) * 10) / 10));

      const evaluation = LandslideAIEngine.calculate(loc);
      loc.risk_probability = evaluation.riskProbability;
      loc.risk_category = evaluation.classification.category;
      loc.color = evaluation.classification.color;
      loc.last_updated = "Just now";
    });

    this.onViewLoaded(this.currentView);
    if (riskMap) {
      LandslideMap.renderLocationMarkers();
      LandslideMap.renderHeatmapSim();
    }
    this.showToast("Sensor Telemetry & GEE Satellite Data Updated!", "success");
  },

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.style.borderLeftColor = type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#1e40af";
    toast.innerHTML = `
      <span style="font-size: 1.1rem;">${type === "success" ? "✅" : type === "error" ? "🚨" : "ℹ️"}</span>
      <span style="font-weight: 500; color: #0f172a;">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  LandslideApp.init();
});
