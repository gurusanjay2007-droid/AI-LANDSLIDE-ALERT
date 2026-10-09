/**
 * AI-Based Landslide Risk Monitoring System
 * Early Warning & Alert Management System
 */

const EarlyWarningSystem = {
  audioContext: null,
  isAudioEnabled: true,
  currentFilter: "ALL",

  // Active Siren Sound state (Simulation Audio)
  activeSirenAudio: {
    isRunning: false,
    intervalId: null,
    oscillator: null,
    lfo: null,
    gainNode: null,
    level: null,
    locationName: null
  },

  init() {
    this.renderAlertFeed("ALL");
    this.setupAudioToggle();
    this.renderSirenTowersGrid();
    this.renderSirenAuditTrail();
    this.bindBroadcastModalEvents();
  },

  setupAudioToggle() {
    const toggleBtn = document.getElementById("btn-toggle-sound");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        this.isAudioEnabled = !this.isAudioEnabled;
        toggleBtn.innerHTML = this.isAudioEnabled ? "🔊 Sound Alerts: ON" : "🔇 Sound Alerts: OFF";
        LandslideApp.showToast(`Emergency audio alerts ${this.isAudioEnabled ? 'Enabled' : 'Muted'}`, "info");
      });
    }
  },

  playAlertChime(level = "HIGH") {
    if (!this.isAudioEnabled) return;
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = level === "CRITICAL" ? "sawtooth" : "sine";
      osc.frequency.setValueAtTime(level === "CRITICAL" ? 880 : 587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(level === "CRITICAL" ? 440 : 440, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  },

  updateTabCounts() {
    const all = LANDSLIDE_APP_DATA.alerts || [];
    const active = all.filter(a => a.status === "ACTIVE" || (a.status !== "RESOLVED" && a.alert_level !== "CRITICAL"));
    const critical = all.filter(a => a.alert_level === "CRITICAL" || a.status === "CRITICAL");
    const resolved = all.filter(a => a.status === "RESOLVED");

    const setEl = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    };

    setEl("count-alerts-all", all.length);
    setEl("count-alerts-active", active.length);
    setEl("count-alerts-critical", critical.length);
    setEl("count-alerts-resolved", resolved.length);

    // Synchronize global alert badge in sidebar navigation
    const navBadge = document.getElementById("nav-alert-badge");
    if (navBadge) {
      navBadge.textContent = active.length + critical.length;
    }
  },

  renderAlertFeed(filter = null) {
    if (filter) {
      this.currentFilter = filter;
    } else {
      filter = this.currentFilter || "ALL";
    }

    const container = document.getElementById("alerts-feed-container");
    if (!container) return;

    // Toggle active tab buttons
    document.querySelectorAll("#alerts-tabs-nav .tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-filter") === filter);
    });

    this.updateTabCounts();

    const allAlerts = LANDSLIDE_APP_DATA.alerts || [];
    let alerts = [...allAlerts];

    if (filter === "ACTIVE") {
      alerts = allAlerts.filter(a => a.status === "ACTIVE" || (a.status !== "RESOLVED" && a.alert_level !== "CRITICAL"));
    } else if (filter === "CRITICAL") {
      alerts = allAlerts.filter(a => a.alert_level === "CRITICAL" || a.status === "CRITICAL");
    } else if (filter === "RESOLVED") {
      alerts = allAlerts.filter(a => a.status === "RESOLVED");
    }

    if (alerts.length === 0) {
      const emptyLabel = filter === "CRITICAL" ? "No Critical Red Alerts Found"
        : filter === "ACTIVE" ? "No Active Warnings Found"
        : filter === "RESOLVED" ? "No Resolved Incidents Recorded"
        : "No Alerts Recorded";

      container.innerHTML = `
        <div class="card" style="text-align: center; color: #64748b; padding: 3rem;">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🛡️</div>
          <h3 style="font-size: 1.1rem; color: #0f172a; margin-bottom: 4px;">${emptyLabel}</h3>
          <p style="font-size: 0.85rem; color: #64748b;">All monitored slope sectors within operational thresholds for this category.</p>
        </div>
      `;
      return;
    }

    const canManageAlerts = typeof LandslideAuth !== "undefined"
      ? LandslideAuth.hasPermission("RESOLVE_ALERTS")
      : (LandslideApp.currentRole === "ADMIN" || LandslideApp.currentRole === "DISASTER_MANAGER");

    const canBroadcast = typeof LandslideAuth !== "undefined"
      ? LandslideAuth.hasPermission("BROADCAST_ALERTS")
      : (LandslideApp.currentRole === "ADMIN" || LandslideApp.currentRole === "DISASTER_MANAGER");

    container.innerHTML = alerts.map(alt => {
      const isResolved = alt.status === "RESOLVED";
      const isCritical = alt.alert_level === "CRITICAL" || alt.status === "CRITICAL";
      const isHigh = alt.alert_level.includes("HIGH");
      const levelClass = isResolved ? "RESOLVED" : (isCritical ? "CRITICAL" : (isHigh ? "HIGH-RISK" : "WARNING"));

      if (isResolved) {
        return `
          <div class="alert-card RESOLVED">
            <div class="alert-card-header">
              <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                <span class="risk-badge LOW" style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0;">
                  ✅ RESOLVED
                </span>
                <h3 class="alert-headline" style="color: #334155;">${alt.headline}</h3>
              </div>
              <div class="alert-meta">
                <span>📍 <b>${alt.location_name}</b> (${alt.district})</span>
                <span style="color:#059669; font-weight:600;">🕒 Resolved ${alt.timestamp}</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
              <div class="alert-body-box" style="background: #f8fafc; border-color: #e2e8f0;">
                <div class="alert-reason-title" style="color: #475569;">Incident Resolution Details:</div>
                <p style="color: #475569;">${alt.trigger_reason}</p>
                <div style="margin-top: 6px; font-weight: 700; color: #059669; font-size: 0.8rem;">
                  Residual Risk: ${alt.risk_probability_pct}% (Stabilized)
                </div>
              </div>

              <div class="alert-action-box" style="background: #f0fdf4; border-color: #bbf7d0;">
                <div style="font-weight: 700; margin-bottom: 0.25rem; color: #166534;">Remediation Completed:</div>
                <p style="color: #166534;">${alt.recommended_action}</p>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; align-items: center;">
              <button class="btn btn-secondary btn-sm" onclick="LandslideApp.selectLocation('${alt.location_id}'); LandslideApp.navigateTo('analysis');">
                Inspect Location Factors →
              </button>
              ${canManageAlerts ? `
                <button class="btn btn-secondary btn-sm" onclick="EarlyWarningSystem.reopenAlert('${alt.id}')" style="color: #b45309; border-color: #fde68a;">
                  ↺ Reopen Alert
                </button>
              ` : `
                <span style="font-size: 0.725rem; color: #94a3b8; align-self: center;">🔒 Reopen restricted to Command</span>
              `}
            </div>
          </div>
        `;
      }

      return `
        <div class="alert-card ${levelClass}">
          <div class="alert-card-header">
            <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <span class="risk-badge ${isCritical ? 'CRITICAL' : (isHigh ? 'HIGH' : 'MODERATE')}">
                ${isCritical ? '🚨 ' : '⚠️ '}${alt.alert_level}
              </span>
              <h3 class="alert-headline">${alt.headline}</h3>
            </div>
            <div class="alert-meta">
              <span>📍 <b>${alt.location_name}</b> (${alt.district})</span>
              <span>🕒 ${alt.timestamp}</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
            <div class="alert-body-box">
              <div class="alert-reason-title">Trigger Diagnosis (AI Machine Learning):</div>
              <p>${alt.trigger_reason}</p>
              <div style="margin-top: 6px; font-weight: 700; color: ${isCritical ? '#991b1b' : '#c2410c'}; font-size: 0.8rem;">
                Calculated Risk Probability: ${alt.risk_probability_pct}%
              </div>
            </div>

            <div class="alert-action-box">
              <div style="font-weight: 700; margin-bottom: 0.25rem;">Mandated Protective Actions:</div>
              <p>${alt.recommended_action}</p>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; align-items: center;">
            <button class="btn btn-secondary btn-sm" onclick="LandslideApp.selectLocation('${alt.location_id}'); LandslideApp.navigateTo('analysis');">
              Inspect Location Factors →
            </button>
            ${canManageAlerts ? `
              <button class="btn btn-secondary btn-sm" onclick="EarlyWarningSystem.resolveAlert('${alt.id}')" style="color: #059669; border-color: #a7f3d0;">
                ✓ Mark Resolved
              </button>
            ` : ''}
            ${canBroadcast ? `
              <button class="btn btn-primary btn-sm" onclick="EarlyWarningSystem.openBroadcastModal('${alt.id}')">
                📡 Broadcast Alert (SMS / Siren)
              </button>
            ` : `
              <button class="btn btn-secondary btn-sm" style="color: #64748b; background: #f8fafc;" onclick="EarlyWarningSystem.openBroadcastModal('${alt.id}')" title="Disaster Manager or Admin clearance required">
                🔒 Broadcast (Command Only)
              </button>
            `}
          </div>
        </div>
      `;
    }).join("");
  },

  resolveAlert(alertId) {
    if (typeof LandslideAuth !== "undefined" && !LandslideAuth.hasPermission("RESOLVE_ALERTS")) {
      LandslideAuth.openOfficialLoginModal("Official Clearance Required: Resolving official bulletins requires Disaster Operations clearance. Please authenticate with official credentials.");
      return;
    }

    const alert = LANDSLIDE_APP_DATA.alerts.find(a => a.id === alertId);
    if (!alert) return;

    alert.status = "RESOLVED";
    alert.timestamp = "Just now";
    LandslideApp.showToast(`Alert ${alert.id} (${alert.location_name}) marked as Resolved.`, "success");
    this.renderAlertFeed();
  },

  reopenAlert(alertId) {
    if (typeof LandslideAuth !== "undefined" && !LandslideAuth.hasPermission("RESOLVE_ALERTS")) {
      LandslideAuth.openOfficialLoginModal("Official Clearance Required: Reopening alerts requires Disaster Operations clearance. Please authenticate with official credentials.");
      return;
    }

    const alert = LANDSLIDE_APP_DATA.alerts.find(a => a.id === alertId);
    if (!alert) return;

    alert.status = alert.alert_level === "CRITICAL" ? "CRITICAL" : "ACTIVE";
    alert.timestamp = "Just now";
    LandslideApp.showToast(`Alert ${alert.id} reopened as Active.`, "info");
    this.renderAlertFeed();
  },

  // Haversine Distance Formula (km)
  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  },

  // Map Risk Category to Civil Defense Siren Acoustic State:
  // LOW -> Siren OFF
  // MODERATE -> Siren OFF
  // HIGH -> Warning Siren (Pulsed 587 Hz)
  // CRITICAL -> Emergency Siren (Continuous Warble 440-880 Hz)
  getSirenStateForRiskLevel(riskLevel) {
    const level = (riskLevel || "LOW").toUpperCase();
    if (level === "CRITICAL") {
      return {
        state: "EMERGENCY_WARBLE",
        label: "Emergency Siren (Continuous Warble)",
        tone: "Continuous 440-880 Hz Klaxon",
        color: "#dc2626",
        badgeClass: "CRITICAL",
        soundActive: true,
        description: "Immediate evacuation ordered. High-intensity multi-tone klaxon."
      };
    }
    if (level === "HIGH" || level === "HIGH-RISK" || level === "WARNING") {
      return {
        state: "WARNING_PULSED",
        label: "Warning Siren (Intermittent Pulse)",
        tone: "Pulsed 587 Hz Alert Chime",
        color: "#f97316",
        badgeClass: "HIGH",
        soundActive: true,
        description: "Heightened vigilance mandated. Intermittent high-pitch acoustic pulses."
      };
    }
    if (level === "MODERATE" || level === "WATCH") {
      return {
        state: "SIREN_OFF",
        label: "Siren OFF (Monitoring Only)",
        tone: "None (Silent)",
        color: "#d97706",
        badgeClass: "MODERATE",
        soundActive: false,
        description: "Advisory monitoring: Acoustic sirens remain silent to prevent public panic."
      };
    }
    // LOW / NORMAL
    return {
      state: "SIREN_OFF",
      label: "Siren OFF (Normal Baseline)",
      tone: "None (Silent)",
      color: "#16a34a",
      badgeClass: "LOW",
      soundActive: false,
      description: "Baseline stable: Sirens inactive."
    };
  },

  // Synthesized Web Audio Siren Engine
  startSirenAudio(riskLevel, locationName = "") {
    if (!this.isAudioEnabled) {
      LandslideApp.showToast("Note: Sound alerts are toggled OFF in header.", "info");
      return;
    }

    const sirenConfig = this.getSirenStateForRiskLevel(riskLevel);
    if (!sirenConfig.soundActive) {
      this.stopActiveSiren();
      return;
    }

    this.stopActiveSiren(); // Stop previous oscillator if playing

    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }

      const ctx = this.audioContext;
      this.activeSirenAudio.isRunning = true;
      this.activeSirenAudio.level = riskLevel;
      this.activeSirenAudio.locationName = locationName;

      this.updateActiveSirenBanner(true, sirenConfig, locationName);

      if (sirenConfig.state === "EMERGENCY_WARBLE") {
        // Continuous klaxon warble (440 to 880 Hz sweep)
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const masterGain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(660, ctx.currentTime);

        lfo.type = "triangle";
        lfo.frequency.setValueAtTime(1.5, ctx.currentTime);
        lfoGain.gain.setValueAtTime(220, ctx.currentTime);

        lfo.connect(osc.frequency);
        osc.connect(masterGain);
        masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
        masterGain.connect(ctx.destination);

        osc.start();
        lfo.start();

        this.activeSirenAudio.oscillator = osc;
        this.activeSirenAudio.lfo = lfo;
        this.activeSirenAudio.gainNode = masterGain;
      } else if (sirenConfig.state === "WARNING_PULSED") {
        // Intermittent pulse (587 Hz, 0.4s beep every 1.2s)
        const playPulse = () => {
          if (!this.activeSirenAudio.isRunning) return;
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);

            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
          } catch (err) {}
        };

        playPulse();
        this.activeSirenAudio.intervalId = setInterval(playPulse, 1200);
      }
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  },

  stopActiveSiren() {
    if (this.activeSirenAudio.intervalId) {
      clearInterval(this.activeSirenAudio.intervalId);
      this.activeSirenAudio.intervalId = null;
    }
    if (this.activeSirenAudio.oscillator) {
      try {
        this.activeSirenAudio.oscillator.stop();
        this.activeSirenAudio.oscillator.disconnect();
      } catch (e) {}
      this.activeSirenAudio.oscillator = null;
    }
    if (this.activeSirenAudio.lfo) {
      try {
        this.activeSirenAudio.lfo.stop();
        this.activeSirenAudio.lfo.disconnect();
      } catch (e) {}
      this.activeSirenAudio.lfo = null;
    }
    this.activeSirenAudio.isRunning = false;
    this.activeSirenAudio.level = null;
    this.activeSirenAudio.locationName = null;

    this.updateActiveSirenBanner(false);
  },

  previewSirenTone() {
    const locSelect = document.getElementById("modal-broadcast-loc-select");
    const selectedLocId = locSelect ? locSelect.value : null;
    const loc = (LANDSLIDE_APP_DATA.locations || []).find(l => l.id === selectedLocId) || LANDSLIDE_APP_DATA.locations[0];
    const riskLevel = loc ? loc.risk_category : "HIGH";

    const sirenConfig = this.getSirenStateForRiskLevel(riskLevel);
    if (!sirenConfig.soundActive) {
      LandslideApp.showToast(`Preview: ${sirenConfig.label} — Sirens remain silent for ${riskLevel} risk level.`, "info");
      return;
    }

    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }
      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (sirenConfig.state === "EMERGENCY_WARBLE") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      }
      LandslideApp.showToast(`[SIMULATION PREVIEW] Sounding test tone: ${sirenConfig.tone}`, "info");
    } catch (e) {
      console.warn("Preview error:", e);
    }
  },

  updateActiveSirenBanner(isActive, sirenConfig = null, locationName = "") {
    const banner = document.getElementById("active-siren-banner");
    if (!banner) return;

    if (isActive && sirenConfig) {
      banner.style.display = "flex";
      const titleEl = document.getElementById("active-siren-banner-title");
      const descEl = document.getElementById("active-siren-banner-desc");
      if (titleEl) titleEl.textContent = `🚨 ACTIVE CIVIL DEFENSE SIREN: ${sirenConfig.label.toUpperCase()}`;
      if (descEl) descEl.textContent = `Acoustic siren actively sounding for ${locationName} [Tone: ${sirenConfig.tone}]. Hardware Mode: SIMULATION.`;
    } else {
      banner.style.display = "none";
    }
  },

  // Render Siren Towers Status Grid into #siren-towers-container
  renderSirenTowersGrid() {
    const container = document.getElementById("siren-towers-container");
    if (!container) return;

    const towers = LANDSLIDE_APP_DATA.sirenTowers || [];
    const loc = (LANDSLIDE_APP_DATA.locations || []).find(l => l.id === LandslideApp.currentLocationId) || LANDSLIDE_APP_DATA.locations[0];

    container.innerHTML = towers.map(t => {
      const isOnline = t.status === "ONLINE";
      const dist = loc ? this.calculateDistanceKm(loc.lat, loc.lng, t.lat, t.lng) : null;

      return `
        <div class="siren-tower-card ${isOnline ? '' : 'offline'}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <div>
              <div style="font-weight: 700; font-size: 0.875rem; color: #0f172a;">${t.name}</div>
              <div style="font-size: 0.725rem; color: #64748b;">${t.id} • ${t.sector}</div>
            </div>
            <span class="sim-tag ${isOnline ? '' : 'warning'}">SIMULATION</span>
          </div>

          <div style="font-size: 0.775rem; margin-bottom: 0.5rem; display: flex; align-items: center;">
            <span class="siren-status-dot ${isOnline ? 'online' : 'offline'}"></span>
            <b>${t.status}</b>
            <span style="color: #64748b; margin-left: 6px;">(${t.sound_output_db} dB)</span>
          </div>

          <div style="font-size: 0.725rem; color: #475569; display: flex; justify-content: space-between; border-top: 1px solid var(--border-light); padding-top: 0.4rem;">
            <span>Coverage: <b>${t.coverage_radius_km} km</b></span>
            <span>Power: <b>${t.power_backup_pct}%</b></span>
          </div>

          ${dist !== null ? `
            <div style="font-size: 0.725rem; color: #1e40af; margin-top: 4px; font-weight: 600;">
              📍 Distance from active site: ${dist} km
            </div>
          ` : ''}

          <div style="font-size: 0.675rem; color: #94a3b8; margin-top: 4px;">
            Ping: ${t.last_ping}
          </div>
        </div>
      `;
    }).join("");
  },

  // Render Siren Dispatch Audit Trail Table into #siren-audit-table-body
  renderSirenAuditTrail() {
    const tbody = document.getElementById("siren-audit-table-body");
    if (!tbody) return;

    const logs = LANDSLIDE_APP_DATA.sirenLogs || [];
    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #94a3b8; padding: 1.5rem;">No siren dispatch records recorded.</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(log => {
      const isCritical = log.risk_level === "CRITICAL";
      const isHigh = log.risk_level === "HIGH";
      return `
        <tr>
          <td><span style="font-family: monospace; font-size: 0.75rem; font-weight: 600; color: #475569;">${log.id}</span></td>
          <td style="font-size: 0.75rem; white-space: nowrap;">${log.timestamp}</td>
          <td><b>${log.location_name}</b></td>
          <td><b>${log.tower_name}</b> <span style="color: #64748b; font-size: 0.7rem;">(${log.distance_km} km away)</span></td>
          <td><span class="risk-badge ${isCritical ? 'CRITICAL' : (isHigh ? 'HIGH' : 'MODERATE')}">${log.risk_level}</span></td>
          <td>
            <div style="font-weight: 600; font-size: 0.775rem;">${log.tone_desc}</div>
            <div style="font-size: 0.7rem; color: #64748b;">Warning Radius: ${log.radius_km} km</div>
          </td>
          <td><span class="sim-tag">SIMULATION</span></td>
          <td style="font-size: 0.7rem; color: #334155;">${log.operator}</td>
        </tr>
      `;
    }).join("");
  },

  // Duplicate Alert Detection (past 15 minutes)
  checkDuplicateAlert(locationId, towerId) {
    const logs = LANDSLIDE_APP_DATA.sirenLogs || [];
    const now = new Date().getTime();
    return logs.find(log => {
      if (log.location_id !== locationId && log.tower_id !== towerId) return false;
      const parsedTime = new Date(log.timestamp).getTime();
      return !isNaN(parsedTime) && (now - parsedTime) < (15 * 60 * 1000);
    });
  },

  openBroadcastModal(alertId) {
    if (typeof LandslideAuth !== "undefined" && !LandslideAuth.hasPermission("BROADCAST_ALERTS")) {
      LandslideAuth.openOfficialLoginModal("Official Clearance Required: Authorizing emergency sirens and CAP SMS broadcasts is restricted to District Disaster Managers & System Admins. Please authenticate with official credentials.");
      return;
    }

    const modal = document.getElementById("broadcast-alert-modal");
    if (!modal) return;

    // Populate Location selector
    const locSelect = document.getElementById("modal-broadcast-loc-select");
    if (locSelect) {
      locSelect.innerHTML = (LANDSLIDE_APP_DATA.locations || []).map(l => `
        <option value="${l.id}">${l.name} (${l.district}) — ${l.risk_category} RISK (${l.risk_probability}%)</option>
      `).join("");
      locSelect.value = LandslideApp.currentLocationId || "LOC-02";
    }

    // Populate Tower selector
    const towerSelect = document.getElementById("modal-broadcast-tower-select");
    if (towerSelect) {
      towerSelect.innerHTML = (LANDSLIDE_APP_DATA.sirenTowers || []).map(t => `
        <option value="${t.id}" ${t.status === "OFFLINE" ? 'style="color:#dc2626;"' : ''}>
          ${t.id}: ${t.name} [${t.status}] (${t.sound_output_db} dB, Range: ${t.coverage_radius_km} km)
        </option>
      `).join("");
      // Default to an online tower
      towerSelect.value = "TWR-02";
    }

    // Update dynamic calculations
    this.updateBroadcastModalCalculations();

    modal.classList.add("open");
  },

  closeBroadcastModal() {
    const modal = document.getElementById("broadcast-alert-modal");
    if (modal) modal.classList.remove("open");
  },

  bindBroadcastModalEvents() {
    const locSelect = document.getElementById("modal-broadcast-loc-select");
    const towerSelect = document.getElementById("modal-broadcast-tower-select");
    const radiusSlider = document.getElementById("modal-broadcast-radius-slider");

    if (locSelect) locSelect.addEventListener("change", () => this.updateBroadcastModalCalculations());
    if (towerSelect) towerSelect.addEventListener("change", () => this.updateBroadcastModalCalculations());
    if (radiusSlider) radiusSlider.addEventListener("input", () => this.updateBroadcastModalCalculations());
  },

  updateBroadcastModalCalculations() {
    const locSelect = document.getElementById("modal-broadcast-loc-select");
    const towerSelect = document.getElementById("modal-broadcast-tower-select");
    const radiusSlider = document.getElementById("modal-broadcast-radius-slider");

    if (!locSelect || !towerSelect) return;

    const locId = locSelect.value;
    const towerId = towerSelect.value;
    const radiusKm = radiusSlider ? parseFloat(radiusSlider.value) : 12;

    const loc = (LANDSLIDE_APP_DATA.locations || []).find(l => l.id === locId) || LANDSLIDE_APP_DATA.locations[0];
    const tower = (LANDSLIDE_APP_DATA.sirenTowers || []).find(t => t.id === towerId) || LANDSLIDE_APP_DATA.sirenTowers[0];

    // Radius value display & Population estimation
    const radiusValEl = document.getElementById("modal-broadcast-radius-val");
    if (radiusValEl) radiusValEl.textContent = `${radiusKm} km`;

    const density = loc ? (loc.population_density || 350) : 350;
    const estimatedPop = Math.round(Math.PI * Math.pow(radiusKm, 2) * (density / 10));
    const popEl = document.getElementById("modal-broadcast-pop-estimate");
    if (popEl) popEl.textContent = `~${estimatedPop.toLocaleString()} residents in alert zone`;

    // Distance calculation
    const distanceKm = (loc && tower) ? this.calculateDistanceKm(loc.lat, loc.lng, tower.lat, tower.lng) : 0;
    const distEl = document.getElementById("modal-broadcast-distance");
    if (distEl) distEl.textContent = `${distanceKm} km`;

    // Tower status badge
    const towerStatusBadge = document.getElementById("modal-broadcast-tower-status");
    const offlineWarningBox = document.getElementById("modal-broadcast-offline-warning");
    const confirmBtn = document.getElementById("modal-broadcast-submit-btn");

    if (tower && tower.status === "OFFLINE") {
      if (towerStatusBadge) {
        towerStatusBadge.textContent = "OFFLINE (Unreachable)";
        towerStatusBadge.className = "risk-badge CRITICAL";
      }
      if (offlineWarningBox) offlineWarningBox.style.display = "block";
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.title = "Selected tower is offline. Switch to an active online repeater.";
      }
    } else {
      if (towerStatusBadge) {
        towerStatusBadge.textContent = "ONLINE (Standby Ready)";
        towerStatusBadge.className = "risk-badge LOW";
      }
      if (offlineWarningBox) offlineWarningBox.style.display = "none";
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.title = "";
      }
    }

    // Siren State evaluated for this location
    const riskLevel = loc ? loc.risk_category : "HIGH";
    const sirenConfig = this.getSirenStateForRiskLevel(riskLevel);

    const sirenStateBadge = document.getElementById("modal-broadcast-siren-state");
    const sirenStateTone = document.getElementById("modal-broadcast-siren-tone");
    const sirenStateDesc = document.getElementById("modal-broadcast-siren-desc");

    if (sirenStateBadge) {
      sirenStateBadge.textContent = sirenConfig.label;
      sirenStateBadge.className = `risk-badge ${sirenConfig.badgeClass}`;
    }
    if (sirenStateTone) sirenStateTone.textContent = sirenConfig.tone;
    if (sirenStateDesc) sirenStateDesc.textContent = sirenConfig.description;

    // Duplicate alert check
    const duplicate = this.checkDuplicateAlert(locId, towerId);
    const duplicateBox = document.getElementById("modal-broadcast-duplicate-warning");
    if (duplicateBox) {
      if (duplicate) {
        duplicateBox.style.display = "block";
        const dupTimeEl = document.getElementById("modal-broadcast-duplicate-time");
        if (dupTimeEl) dupTimeEl.textContent = duplicate.timestamp;
      } else {
        duplicateBox.style.display = "none";
      }
    }
  },

  executeBroadcast() {
    if (typeof LandslideAuth !== "undefined" && !LandslideAuth.hasPermission("BROADCAST_ALERTS")) {
      LandslideApp.showToast("⛔ Unauthorized to execute emergency siren broadcast. Official clearance required.", "error");
      return;
    }

    const locSelect = document.getElementById("modal-broadcast-loc-select");
    const towerSelect = document.getElementById("modal-broadcast-tower-select");
    const radiusSlider = document.getElementById("modal-broadcast-radius-slider");
    const overrideCheckbox = document.getElementById("modal-broadcast-override-dup");

    const locId = locSelect ? locSelect.value : LandslideApp.currentLocationId;
    const towerId = towerSelect ? towerSelect.value : "TWR-02";
    const radiusKm = radiusSlider ? parseFloat(radiusSlider.value) : 12;

    const loc = (LANDSLIDE_APP_DATA.locations || []).find(l => l.id === locId) || LANDSLIDE_APP_DATA.locations[0];
    const tower = (LANDSLIDE_APP_DATA.sirenTowers || []).find(t => t.id === towerId);

    // Validate tower status
    if (!tower) {
      LandslideApp.showToast("Please select a valid siren warning tower.", "error");
      return;
    }
    if (tower.status === "OFFLINE") {
      LandslideApp.showToast(`❌ Dispatch Aborted: Tower ${tower.id} (${tower.name}) is OFFLINE (${tower.last_ping}). Please select an active online repeater.`, "error");
      return;
    }

    // Validate duplicate prevention
    const duplicate = this.checkDuplicateAlert(loc.id, tower.id);
    if (duplicate && (!overrideCheckbox || !overrideCheckbox.checked)) {
      LandslideApp.showToast(`⚠️ Duplicate Dispatch Blocked: ${loc.name} / ${tower.id} was already activated at ${duplicate.timestamp}. Check "Override Duplicate Prevention" to proceed.`, "warning");
      const duplicateBox = document.getElementById("modal-broadcast-duplicate-warning");
      if (duplicateBox) duplicateBox.style.display = "block";
      return;
    }

    const distanceKm = this.calculateDistanceKm(loc.lat, loc.lng, tower.lat, tower.lng);
    const riskLevel = loc.risk_category;
    const sirenConfig = this.getSirenStateForRiskLevel(riskLevel);

    const currentUser = (typeof LandslideAuth !== "undefined" && LandslideAuth.currentUser)
      ? `${LandslideAuth.currentUser.name} (${LandslideAuth.currentUser.email})`
      : "District Disaster Command";

    // Create new Siren Audit Trail Log entry
    const newLogId = `SIR-LOG-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const newLog = {
      id: newLogId,
      timestamp: new Date().toLocaleString(),
      location_id: loc.id,
      location_name: loc.name,
      tower_id: tower.id,
      tower_name: tower.name,
      distance_km: distanceKm,
      radius_km: radiusKm,
      risk_level: riskLevel,
      siren_state: sirenConfig.state,
      tone_desc: sirenConfig.label,
      status: "DISPATCHED_SIMULATED",
      operator: currentUser,
      mode: "SIMULATION"
    };

    LANDSLIDE_APP_DATA.sirenLogs.unshift(newLog);

    // Trigger audio if siren is active for this risk level
    if (sirenConfig.soundActive) {
      this.startSirenAudio(riskLevel, loc.name);
    } else {
      this.stopActiveSiren();
    }

    // Refresh views
    this.renderSirenAuditTrail();
    this.closeBroadcastModal();

    // Reset override checkbox
    if (overrideCheckbox) overrideCheckbox.checked = false;

    // Feedback toast clearly specifying simulation mode
    LandslideApp.showToast(
      `⚠️ [SIMULATION MODE] CAP Alert & Siren Telemetry Dispatched for ${loc.name}! Tower: ${tower.id} (${distanceKm} km). Physical hardware disconnected.`,
      "success"
    );
  }
};
