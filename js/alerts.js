/**
 * AI-Based Landslide Risk Monitoring System
 * Early Warning & Alert Management System
 */

const EarlyWarningSystem = {
  audioContext: null,
  isAudioEnabled: true,

  init() {
    this.renderAlertFeed();
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

  renderAlertFeed(filter = "ALL") {
    const container = document.getElementById("alerts-feed-container");
    if (!container) return;

    let alerts = LANDSLIDE_APP_DATA.alerts;
    if (filter === "ACTIVE") {
      alerts = alerts.filter(a => a.status === "ACTIVE" || a.status === "CRITICAL");
    } else if (filter === "CRITICAL") {
      alerts = alerts.filter(a => a.alert_level === "CRITICAL");
    } else if (filter === "RESOLVED") {
      alerts = alerts.filter(a => a.status === "RESOLVED");
    }

    if (alerts.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align: center; color: #64748b; padding: 3rem;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🛡️</div>
          <h3>No Active Alerts Found</h3>
          <p style="font-size: 0.85rem;">All monitored slope zones within operational safety thresholds.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = alerts.map(alt => {
      const isCritical = alt.alert_level === "CRITICAL";
      const isHigh = alt.alert_level === "HIGH RISK";
      const levelClass = alt.alert_level.replace(" ", "-");

      return `
        <div class="alert-card ${levelClass}">
          <div class="alert-card-header">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span class="risk-badge ${isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : 'MODERATE'}">
                ${isCritical ? '🚨 ' : '⚠️ '}${alt.alert_level}
              </span>
              <h3 class="alert-headline">${alt.headline}</h3>
            </div>
            <div class="alert-meta">
              <span>📍 <b>${alt.location_name}</b> (${alt.district})</span>
              <span>🕒 ${alt.timestamp}</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="alert-body-box">
              <div class="alert-reason-title">Trigger Diagnosis (AI Machine Learning):</div>
              <p>${alt.trigger_reason}</p>
              <div style="margin-top: 6px; font-weight: 700; color: #991b1b; font-size: 0.8rem;">
                Calculated Risk Probability: ${alt.risk_probability_pct}%
              </div>
            </div>

            <div class="alert-action-box">
              <div style="font-weight: 700; margin-bottom: 0.25rem;">Mandated Protective Actions:</div>
              <p>${alt.recommended_action}</p>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem;">
            <button class="btn btn-secondary btn-sm" onclick="LandslideApp.selectLocation('${alt.location_id}'); LandslideApp.navigateTo('analysis');">
              Inspect Location Factors →
            </button>
            <button class="btn btn-primary btn-sm" onclick="EarlyWarningSystem.openBroadcastModal('${alt.id}')">
              📡 Broadcast Alert (SMS / Siren)
            </button>
          </div>
        </div>
      `;
    }).join("");
  },

  openBroadcastModal(alertId) {
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
    this.playAlertChime("CRITICAL");
    this.closeBroadcastModal();
    LandslideApp.showToast("CAP Broadcast Dispatched via SMS Gateway & Local Siren System!", "success");
  }
};
