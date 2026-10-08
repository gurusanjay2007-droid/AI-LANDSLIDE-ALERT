/**
 * AI-Based Early Warning & Landslide Risk Monitoring System
 * Official Government & Departmental Personnel Authentication Portal
 * 
 * Access to operational command, sirens, GEE pipeline configurations,
 * and report verifications is restricted strictly to verified officials
 * logging in with their official email and password.
 */

const LandslideAuth = {
  // 1. Authorized Official Accounts Directory
  OFFICIAL_ACCOUNTS: [
    {
      id: "OFF-001",
      role: "DISASTER_MANAGER",
      roleLabel: "Disaster Operations Manager",
      shortLabel: "Disaster Mgr",
      badgeName: "DISASTER MGR",
      badgeColor: "#1e40af", // Indigo
      badgeBg: "#dbeafe",
      fullName: "Col. Rajesh Nair",
      department: "District Disaster Management Authority (DDMA)",
      district: "Nilgiris & Western Ghats Sector",
      email: "commander.nair@ddma.gov.in",
      password: "manager123",
      avatarEmoji: "🎖️",
      clearance: "Level 4 - Operational Command",
      permissions: [
        "BROADCAST_ALERTS",
        "RESOLVE_ALERTS",
        "VERIFY_CITIZEN_REPORTS",
        "ISSUE_BULLETINS",
        "EVACUATION_COORDINATION",
        "VIEW_ALL_TELEMETRY",
        "RUN_AI_SIMULATOR"
      ],
      description: "Authorized to issue state-level early warning sirens, dispatch CAP SMS bulletins, verify hazard reports, and coordinate evacuations."
    },
    {
      id: "OFF-002",
      role: "ADMIN",
      roleLabel: "System & GEE Infrastructure Admin",
      shortLabel: "System Admin",
      badgeName: "SYSTEM ADMIN",
      badgeColor: "#6b21a8", // Purple
      badgeBg: "#f3e8ff",
      fullName: "Dr. K. S. Sharma",
      department: "National Geoinformatics & Earth Engine Operations",
      district: "National Geospatial Operations Hub",
      email: "admin.sharma@landslide-alert.gov.in",
      password: "admin123",
      avatarEmoji: "⚙️",
      clearance: "Level 5 - Root Institutional Admin",
      permissions: [
        "FULL_ADMIN_ACCESS",
        "MANAGE_GEE_PIPELINE",
        "SYSTEM_HEALTH_RESTART",
        "USER_MANAGEMENT",
        "BROADCAST_ALERTS",
        "RESOLVE_ALERTS",
        "VERIFY_CITIZEN_REPORTS",
        "VIEW_ALL_TELEMETRY",
        "RUN_AI_SIMULATOR"
      ],
      description: "Unrestricted institutional administration: Google Earth Engine Sentinel-1 InSAR ingest, IMD Doppler radars, and hardware calibrations."
    },
    {
      id: "OFF-003",
      role: "ANALYST",
      roleLabel: "Senior Geotechnical Risk Analyst",
      shortLabel: "Field Analyst",
      badgeName: "FIELD ANALYST",
      badgeColor: "#d97706", // Amber
      badgeBg: "#fef3c7",
      fullName: "Pooja Venkat, M.Sc.",
      department: "Geological Survey of India (GSI)",
      district: "Nilgiris & Wayanad Field Stations",
      email: "pooja.analyst@gsi.gov.in",
      password: "analyst123",
      avatarEmoji: "🔬",
      clearance: "Level 3 - Geotechnical Diagnostics",
      permissions: [
        "VIEW_ALL_TELEMETRY",
        "RUN_AI_SIMULATOR",
        "INSPECT_GEOTECHNICAL_DATA",
        "DOWNLOAD_CSV_BULLETINS",
        "LOG_TECHNICAL_ASSESSMENT"
      ],
      description: "Conducts multi-mission satellite InSAR interferometry, executes AI susceptibility stress testing, and analyzes subsurface pore-water pressures."
    }
  ],

  // 2. Default Public Resident Profile (Unauthenticated visitors)
  PUBLIC_PROFILE: {
    id: "PUB-000",
    role: "CITIZEN",
    roleLabel: "Citizen / Public Resident",
    shortLabel: "Citizen",
    badgeName: "PUBLIC",
    badgeColor: "#059669",
    badgeBg: "#d1fae5",
    fullName: "Public Resident",
    department: "Community Safety Network",
    district: "Western Ghats Mountain Community",
    email: "",
    avatarEmoji: "👤",
    clearance: "Level 1 - Public Portal",
    permissions: [
      "SUBMIT_CITIZEN_REPORT",
      "VIEW_PUBLIC_MAP",
      "VIEW_EARLY_WARNINGS",
      "USE_AI_CHATBOT",
      "CALL_EMERGENCY_HELPLINES"
    ],
    description: "Public resident portal for monitoring local hill sector danger levels, submitting crowd-sourced hazard sightings, and receiving warnings."
  },

  currentOfficial: null,

  init() {
    // Check if an official is already authenticated in this browser session
    const savedOfficialEmail = localStorage.getItem("landslide_authenticated_official");
    if (savedOfficialEmail) {
      const matched = this.OFFICIAL_ACCOUNTS.find(
        o => o.email.toLowerCase() === savedOfficialEmail.trim().toLowerCase()
      );
      if (matched) {
        this.currentOfficial = matched;
      } else {
        this.currentOfficial = null;
        localStorage.removeItem("landslide_authenticated_official");
      }
    } else {
      this.currentOfficial = null;
    }

    // Sync app role
    if (typeof LandslideApp !== "undefined") {
      LandslideApp.currentRole = this.getCurrentUser().role;
    }

    this.updateUI();
    this.renderDirectoryChips();
    console.log(`[LandslideAuth] Initialized. Active mode: ${this.isOfficialLoggedIn() ? 'OFFICIAL (' + this.currentOfficial.fullName + ')' : 'PUBLIC RESIDENT'}`);
  },

  isOfficialLoggedIn() {
    return this.currentOfficial !== null;
  },

  getCurrentUser() {
    return this.currentOfficial || this.PUBLIC_PROFILE;
  },

  hasPermission(permissionName) {
    const user = this.getCurrentUser();
    return user.permissions.includes(permissionName) || user.permissions.includes("FULL_ADMIN_ACCESS");
  },

  canAccessView(viewName) {
    if (viewName === "admin") {
      return this.hasPermission("MANAGE_GEE_PIPELINE") || this.hasPermission("FULL_ADMIN_ACCESS");
    }
    return true;
  },

  loginOfficialWithCredentials(email, password) {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if (!cleanEmail || !cleanPass) {
      this.showLoginError("Please enter both your official email and password.");
      return false;
    }

    const official = this.OFFICIAL_ACCOUNTS.find(
      o => o.email.toLowerCase() === cleanEmail
    );

    if (!official) {
      this.showLoginError("Access Denied: Unrecognized official email address. Only authorized departmental personnel with registered credentials can log in.");
      return false;
    }

    if (official.password !== cleanPass) {
      this.showLoginError(`Access Denied: Incorrect password for ${official.email}. Please verify your credentials.`);
      return false;
    }

    // Authentication Success
    this.currentOfficial = official;
    localStorage.setItem("landslide_authenticated_official", official.email);

    if (typeof LandslideApp !== "undefined") {
      LandslideApp.currentRole = official.role;
    }

    this.clearLoginError();
    this.closeOfficialLoginModal();
    this.updateUI();

    LandslideApp.showToast(`Official Session Activated: Welcome, ${official.fullName} (${official.roleLabel})`, "success");

    // Refresh views that reflect official roles
    if (typeof CitizenReporting !== "undefined" && typeof CitizenReporting.renderReportsTable === "function") {
      CitizenReporting.renderReportsTable();
    }
    if (typeof EarlyWarningSystem !== "undefined" && typeof EarlyWarningSystem.renderAlertFeed === "function") {
      EarlyWarningSystem.renderAlertFeed();
    }

    return true;
  },

  logoutOfficial() {
    const prevName = this.currentOfficial ? this.currentOfficial.fullName : "Official";
    this.currentOfficial = null;
    localStorage.removeItem("landslide_authenticated_official");

    if (typeof LandslideApp !== "undefined") {
      LandslideApp.currentRole = "CITIZEN";
    }

    this.updateUI();
    LandslideApp.showToast(`Official session terminated for ${prevName}. Reverted to Public Resident mode.`, "info");

    if (typeof CitizenReporting !== "undefined" && typeof CitizenReporting.renderReportsTable === "function") {
      CitizenReporting.renderReportsTable();
    }
    if (typeof EarlyWarningSystem !== "undefined" && typeof EarlyWarningSystem.renderAlertFeed === "function") {
      EarlyWarningSystem.renderAlertFeed();
    }

    if (typeof LandslideApp !== "undefined" && LandslideApp.currentView === "admin") {
      LandslideApp.navigateTo("dashboard");
    }
  },

  updateUI() {
    const isOfficial = this.isOfficialLoggedIn();
    const publicBadge = document.getElementById("header-public-badge");
    const officialPill = document.getElementById("header-official-pill");

    if (publicBadge && officialPill) {
      if (isOfficial) {
        publicBadge.style.display = "none";
        officialPill.style.display = "flex";

        const off = this.currentOfficial;
        const avatarEl = document.getElementById("header-user-avatar");
        const nameEl = document.getElementById("header-user-name");
        const roleEl = document.getElementById("header-user-role-badge");

        if (avatarEl) avatarEl.textContent = off.avatarEmoji;
        if (nameEl) nameEl.textContent = off.fullName;
        if (roleEl) {
          roleEl.textContent = off.badgeName;
          roleEl.style.backgroundColor = off.badgeBg;
          roleEl.style.color = off.badgeColor;
          roleEl.style.borderColor = off.badgeColor + "40";
        }
      } else {
        publicBadge.style.display = "flex";
        officialPill.style.display = "none";
      }
    }

    // Update navigation lock badges
    this.updateNavigationRestrictions();
    this.enforceViewPermission(typeof LandslideApp !== "undefined" ? LandslideApp.currentView : "dashboard");
  },

  updateNavigationRestrictions() {
    const isOfficial = this.isOfficialLoggedIn();
    const adminNavItem = document.querySelector('.nav-item[data-view="admin"]');

    if (adminNavItem) {
      const lockBadge = adminNavItem.querySelector(".nav-lock-badge");
      if (!isOfficial) {
        if (!lockBadge) {
          const span = document.createElement("span");
          span.className = "nav-lock-badge";
          span.style.cssText = "margin-left: auto; font-size: 0.675rem; background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 9999px; font-weight: 700;";
          span.textContent = "🔒 Officials";
          adminNavItem.appendChild(span);
        }
      } else if (lockBadge) {
        lockBadge.remove();
      }
    }
  },

  enforceViewPermission(viewName) {
    const isOfficial = this.isOfficialLoggedIn();
    const adminBanner = document.getElementById("admin-permission-guard-banner");
    const adminControls = document.getElementById("admin-interactive-controls-container");

    if (viewName === "admin") {
      if (!isOfficial) {
        if (adminBanner) adminBanner.style.display = "block";
        if (adminControls) adminControls.style.display = "none";
      } else {
        if (adminBanner) adminBanner.style.display = "none";
        if (adminControls) adminControls.style.display = "block";
      }
    }
  },

  openOfficialLoginModal(reasonMessage = null) {
    const modal = document.getElementById("official-login-modal");
    if (!modal) return;

    this.clearLoginError();

    const reasonEl = document.getElementById("official-login-reason-prompt");
    if (reasonEl) {
      if (reasonMessage) {
        reasonEl.textContent = reasonMessage;
        reasonEl.style.display = "block";
      } else {
        reasonEl.style.display = "none";
      }
    }

    modal.classList.add("open");

    // Auto-focus email field
    setTimeout(() => {
      const emailInput = document.getElementById("official-login-email");
      if (emailInput) emailInput.focus();
    }, 100);
  },

  closeOfficialLoginModal() {
    const modal = document.getElementById("official-login-modal");
    if (modal) modal.classList.remove("open");
  },

  openOfficialProfileModal() {
    if (!this.isOfficialLoggedIn()) {
      this.openOfficialLoginModal();
      return;
    }
    const off = this.currentOfficial;
    LandslideApp.showToast(`Logged in as: ${off.fullName} • ${off.department} (${off.clearance})`, "info");
  },

  fillOfficialCredentials(email, password) {
    const emailInput = document.getElementById("official-login-email");
    const passInput = document.getElementById("official-login-password");

    if (emailInput) emailInput.value = email;
    if (passInput) passInput.value = password;

    this.clearLoginError();
  },

  renderDirectoryChips() {
    const container = document.getElementById("official-demo-accounts-chips");
    if (!container) return;

    container.innerHTML = this.OFFICIAL_ACCOUNTS.map(o => `
      <div 
        class="official-account-chip" 
        onclick="LandslideAuth.fillOfficialCredentials('${o.email}', '${o.password}')"
        title="Click to fill ${o.email} / ${o.password}"
        style="
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-left: 3px solid ${o.badgeColor};
          padding: 0.6rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        "
      >
        <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
          <span style="font-size: 1.25rem;">${o.avatarEmoji}</span>
          <div style="min-width: 0;">
            <div style="font-size: 0.8rem; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${o.fullName}
            </div>
            <div style="font-size: 0.7rem; color: #64748b;">
              ${o.shortLabel} • <span style="font-family: monospace; color: #334155;">${o.email}</span>
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.7rem; padding: 2px 7px; white-space: nowrap;">
          Fill ⬇️
        </button>
      </div>
    `).join("");
  },

  handleLoginSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    const email = document.getElementById("official-login-email")?.value;
    const pass = document.getElementById("official-login-password")?.value;

    return this.loginOfficialWithCredentials(email, pass);
  },

  showLoginError(msg) {
    const errBox = document.getElementById("official-login-error-msg");
    if (errBox) {
      errBox.textContent = msg;
      errBox.style.display = "block";
    } else {
      alert(msg);
    }
  },

  clearLoginError() {
    const errBox = document.getElementById("official-login-error-msg");
    if (errBox) {
      errBox.textContent = "";
      errBox.style.display = "none";
    }
  }
};

// Initialize on DOM load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => LandslideAuth.init());
} else {
  LandslideAuth.init();
}
