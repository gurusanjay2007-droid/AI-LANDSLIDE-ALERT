/**
 * AI-Based Landslide Risk Monitoring System
 * Early Warning & Alert Management System
 */

const EarlyWarningSystem = {
  audioContext: null,
  isAudioEnabled: true,
  currentFilter: "ALL",

  init() {
    this.renderAlertFeed("ALL");
    this.setupAudioToggle();
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

  openBroadcastModal(alertId) {
    if (typeof LandslideAuth !== "undefined" && !LandslideAuth.hasPermission("BROADCAST_ALERTS")) {
      LandslideAuth.openOfficialLoginModal("Official Clearance Required: Authorizing emergency sirens and CAP SMS broadcasts is restricted to District Disaster Managers & System Admins. Please authenticate with official credentials.");
      return;
    }

    const alert = LANDSLIDE_APP_DATA.alerts.find(a => a.id === alertId) || LANDSLIDE_APP_DATA.alerts[0];
    const modal = document.getElementById("broadcast-alert-modal");
    if (!modal) return;

    document.getElementById("modal-broadcast-target").textContent = `${alert.location_name} (Radius 12 km)`;
    document.getElementById("modal-broadcast-headline").textContent = alert.headline;
    document.getElementById("modal-broadcast-action").textContent = alert.recommended_action;

    modal.classList.add("open");
  },

  closeBroadcastModal() {
    const modal = document.getElementById("broadcast-alert-modal");
    if (modal) modal.classList.remove("open");
  },

  executeBroadcast() {
    if (typeof LandslideAuth !== "undefined" && !LandslideAuth.hasPermission("BROADCAST_ALERTS")) {
      LandslideApp.showToast("⛔ Unauthorized to execute emergency siren broadcast.", "error");
      return;
    }

    this.playAlertChime("CRITICAL");
    this.closeBroadcastModal();
    LandslideApp.showToast("CAP Broadcast Dispatched via SMS Gateway & Local Siren System!", "success");
  }
};
