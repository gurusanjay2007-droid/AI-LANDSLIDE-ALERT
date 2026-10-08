/**
 * AI-Based Early Warning & Landslide Risk Monitoring System
 * Authentication & Role-Based Access Control (RBAC) Module
 */

const LandslideAuth = {
  // 4 Official System User Profiles
  USERS: {
    DISASTER_MANAGER: {
      id: "USR-001",
      role: "DISASTER_MANAGER",
      roleLabel: "Disaster Manager",
      shortLabel: "Disaster Mgr",
      badgeColor: "#1e40af", // Indigo Blue
      badgeBg: "#dbeafe",
      fullName: "Col. Rajesh Nair",
      title: "Operations Commander, District Disaster Management Authority (DDMA)",
      district: "Nilgiris & Western Ghats Zone",
      email: "commander.nair@ddma.gov.in",
      phone: "+91 94432 10100",
      avatarEmoji: "🎖️",
      password: "manager123",
      clearanceLevel: "Level 4 - Command & Control",
      permissions: [
        "BROADCAST_ALERTS",
        "RESOLVE_ALERTS",
        "VERIFY_CITIZEN_REPORTS",
        "ISSUE_BULLETINS",
        "EVACUATION_COORDINATION",
        "VIEW_ALL_TELEMETRY",
        "RUN_AI_SIMULATOR"
      ],
      description: "Authorized to issue state-level emergency sirens, broadcast CAP SMS advisories, coordinate evacuations, and sign disaster response bulletins."
    },
    ADMIN: {
      id: "USR-002",
      role: "ADMIN",
      roleLabel: "System Administrator",
      shortLabel: "Admin",
      badgeColor: "#6b21a8", // Purple
      badgeBg: "#f3e8ff",
      fullName: "Dr. K. S. Sharma",
      title: "Lead Geoinformatics & GEE Infrastructure Administrator",
      district: "National Geospatial Operations Hub",
      email: "admin.sharma@landslide-alert.gov.in",
      phone: "+91 98840 99881",
      avatarEmoji: "⚙️",
      password: "admin123",
      clearanceLevel: "Level 5 - Root Institutional Admin",
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
      description: "Unrestricted institutional superuser: Google Earth Engine cloud pipelines, Doppler radar handshakes, sensor hardware calibrations, and system overrides."
    },
    ANALYST: {
      id: "USR-003",
      role: "ANALYST",
      roleLabel: "Field Analyst",
      shortLabel: "Field Analyst",
      badgeColor: "#d97706", // Amber
      badgeBg: "#fef3c7",
      fullName: "Pooja Venkat, M.Sc.",
      title: "Senior Geotechnical Risk Analyst, Geological Survey of India",
      district: "Nilgiris & Wayanad Field Sectors",
      email: "pooja.analyst@gsi.gov.in",
      phone: "+91 97500 44211",
      avatarEmoji: "🔬",
      password: "analyst123",
      clearanceLevel: "Level 3 - Geotechnical Diagnostics",
      permissions: [
        "VIEW_ALL_TELEMETRY",
        "RUN_AI_SIMULATOR",
        "INSPECT_GEOTECHNICAL_DATA",
        "DOWNLOAD_CSV_BULLETINS",
        "LOG_TECHNICAL_ASSESSMENT"
      ],
      description: "Performs multi-mission satellite InSAR analysis, runs AI What-If stress test simulations, and inspects pore-water pressure telemetry."
    },
    CITIZEN: {
      id: "USR-004",
      role: "CITIZEN",
      roleLabel: "Citizen / Resident",
      shortLabel: "Citizen",
      badgeColor: "#059669", // Emerald
      badgeBg: "#d1fae5",
      fullName: "Ananya Ramesh",
      title: "Nilgiris Community Resident & Hill Watch Volunteer",
      district: "Coonoor Valley, Nilgiris",
      email: "ananya.citizen@gmail.com",
      phone: "+91 98421 77334",
      avatarEmoji: "👤",
      password: "citizen123",
      clearanceLevel: "Level 1 - Public Resident Portal",
      permissions: [
        "SUBMIT_CITIZEN_REPORT",
        "VIEW_PUBLIC_MAP",
        "VIEW_EARLY_WARNINGS",
        "USE_AI_CHATBOT",
        "CALL_EMERGENCY_HELPLINES"
      ],
      description: "Community resident portal: Submit crowd-sourced slope hazard sightings with GPS photos, check local danger ratings, and receive evacuation notices."
    }
  },

  currentUser: null,

  init() {
    // 1. Load active user from localStorage or default to DISASTER_MANAGER
    const savedRole = localStorage.getItem("landslide_active_role");
    if (savedRole && this.USERS[savedRole]) {
      this.currentUser = this.USERS[savedRole];
    } else {
      this.currentUser = this.USERS.DISASTER_MANAGER;
    }

    // Synchronize LandslideApp.currentRole
    if (typeof LandslideApp !== "undefined") {
      LandslideApp.currentRole = this.currentUser.role;
    }

    // 2. Render Header Capsule and synchronize dropdown
    this.renderHeaderCapsule();
    this.syncRoleSelectDropdown();
    this.updateNavigationRestrictions();
    this.populateCitizenReportDefaults();

    // 3. Render Modal Content
    this.renderRoleCards();

    console.log(`[LandslideAuth] Initialized as ${this.currentUser.roleLabel} (${this.currentUser.fullName})`);
  },

  getCurrentUser() {
    return this.currentUser || this.USERS.DISASTER_MANAGER;
  },

  hasPermission(permissionName) {
    const user = this.getCurrentUser();
    return user.permissions.includes(permissionName) || user.permissions.includes("FULL_ADMIN_ACCESS");
  },

  canAccessView(viewName) {
    const role = this.getCurrentUser().role;
    if (role === "ADMIN") return true;

    if (viewName === "admin") {
      return role === "ADMIN" || role === "DISASTER_MANAGER";
    }

    return true;
  },

  loginAsRole(roleKey, notify = true) {
    if (!this.USERS[roleKey]) {
      console.error(`Invalid role: ${roleKey}`);
      return false;
    }

    const previousRole = this.currentUser.role;
    this.currentUser = this.USERS[roleKey];
    localStorage.setItem("landslide_active_role", roleKey);

    if (typeof LandslideApp !== "undefined") {
      LandslideApp.currentRole = roleKey;
    }

    this.renderHeaderCapsule();
    this.syncRoleSelectDropdown();
    this.updateNavigationRestrictions();
    this.populateCitizenReportDefaults();
    this.renderRoleCards();

    // Re-render views that depend on roles
    if (typeof CitizenReporting !== "undefined" && typeof CitizenReporting.renderReportsTable === "function") {
      CitizenReporting.renderReportsTable();
    }
    if (typeof EarlyWarningSystem !== "undefined" && typeof EarlyWarningSystem.renderAlertFeed === "function") {
      EarlyWarningSystem.renderAlertFeed();
    }

    // If currently on a view that is restricted for this new role, redirect to dashboard
    if (!this.canAccessView(LandslideApp.currentView)) {
      LandslideApp.navigateTo("dashboard");
      LandslideApp.showToast(`Switched to ${this.currentUser.roleLabel}. Redirected to Dashboard.`, "warning");
    } else if (notify) {
      LandslideApp.showToast(`Logged in as ${this.currentUser.fullName} (${this.currentUser.roleLabel})`, "success");
    }

    this.closeLoginModal();
    return true;
  },

  loginWithCredentials(email, password, roleKey) {
    // If role provided directly, check against that role
    let targetUser = null;

    if (roleKey && this.USERS[roleKey]) {
      targetUser = this.USERS[roleKey];
    } else {
      // Find matching user by email
      targetUser = Object.values(this.USERS).find(
        u => u.email.toLowerCase() === email.trim().toLowerCase()
      );
    }

    if (!targetUser) {
      this.showLoginError("Account not found. Please select a valid institutional role or email.");
      return false;
    }

    if (password && password !== targetUser.password && password !== "demo" && password !== "123456") {
      this.showLoginError(`Invalid password for ${targetUser.email}. Demo password is: ${targetUser.password}`);
      return false;
    }

    this.clearLoginError();
    this.loginAsRole(targetUser.role, true);
    return true;
  },

  logout() {
    // Default to Public Citizen mode on sign out
    this.loginAsRole("CITIZEN", false);
    LandslideApp.showToast("Signed out. Active mode set to Citizen (Public Resident).", "info");
  },

  renderHeaderCapsule() {
    const user = this.getCurrentUser();
    
    const avatarEl = document.getElementById("header-user-avatar");
    const nameEl = document.getElementById("header-user-name");
    const roleEl = document.getElementById("header-user-role-badge");

    if (avatarEl) avatarEl.textContent = user.avatarEmoji;
    if (nameEl) nameEl.textContent = user.fullName.split(" ")[0] + (user.fullName.split(" ")[1] ? " " + user.fullName.split(" ")[1] : "");
    if (roleEl) {
      roleEl.textContent = user.shortLabel.toUpperCase();
      roleEl.style.backgroundColor = user.badgeBg;
      roleEl.style.color = user.badgeColor;
      roleEl.style.borderColor = user.badgeColor + "40";
    }
  },

  syncRoleSelectDropdown() {
    const select = document.getElementById("global-role-select");
    if (select && select.value !== this.currentUser.role) {
      select.value = this.currentUser.role;
    }
  },

  updateNavigationRestrictions() {
    const user = this.getCurrentUser();
    const isCitizen = user.role === "CITIZEN";
    const isAnalyst = user.role === "ANALYST";

    // Admin nav item lock badge
    const adminNavItem = document.querySelector('.nav-item[data-view="admin"]');
    if (adminNavItem) {
      const lockBadge = adminNavItem.querySelector(".nav-lock-badge");
      if (isCitizen) {
        if (!lockBadge) {
          const span = document.createElement("span");
          span.className = "nav-lock-badge";
          span.style.cssText = "margin-left: auto; font-size: 0.7rem; background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 9999px; font-weight: 700;";
          span.textContent = "🔒 Staff";
          adminNavItem.appendChild(span);
        }
      } else if (lockBadge) {
        lockBadge.remove();
      }
    }

    // Check if the current view should show an unauthorized message
    this.enforceViewPermission(LandslideApp.currentView);
  },

  enforceViewPermission(viewName) {
    const user = this.getCurrentUser();
    const adminBanner = document.getElementById("admin-permission-guard-banner");

    if (viewName === "admin" && user.role === "CITIZEN") {
      if (adminBanner) adminBanner.style.display = "block";
      const adminControls = document.getElementById("admin-interactive-controls-container");
      if (adminControls) adminControls.style.display = "none";
    } else {
      if (adminBanner) adminBanner.style.display = "none";
      const adminControls = document.getElementById("admin-interactive-controls-container");
      if (adminControls) adminControls.style.display = "block";
    }
  },

  populateCitizenReportDefaults() {
    const user = this.getCurrentUser();
    const nameInput = document.getElementById("report-name");
    const contactInput = document.getElementById("report-contact");

    if (nameInput && (!nameInput.value || nameInput.getAttribute("data-autofilled") === "true")) {
      nameInput.value = user.fullName;
      nameInput.setAttribute("data-autofilled", "true");
    }
    if (contactInput && (!contactInput.value || contactInput.getAttribute("data-autofilled") === "true")) {
      contactInput.value = `${user.phone} (${user.email})`;
      contactInput.setAttribute("data-autofilled", "true");
    }
  },

  renderRoleCards() {
    const container = document.getElementById("auth-role-cards-grid");
    if (!container) return;

    const currentRole = this.currentUser.role;

    container.innerHTML = Object.values(this.USERS).map(u => {
      const isActive = u.role === currentRole;
      const permChips = u.permissions.slice(0, 3).map(p => {
        const friendly = p.replace(/_/g, " ").toLowerCase();
        return `<span style="display:inline-block; font-size:0.7rem; background:#f1f5f9; color:#475569; padding:2px 7px; border-radius:4px; font-weight:600;">✓ ${friendly}</span>`;
      }).join(" ");

      return `
        <div class="auth-role-card ${isActive ? 'active-role-card' : ''}" style="
          border: 2px solid ${isActive ? u.badgeColor : 'var(--border-light)'};
          background: ${isActive ? '#ffffff' : '#ffffff'};
          border-radius: 12px;
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          box-shadow: ${isActive ? '0 4px 14px rgba(30,64,175,0.12)' : 'var(--shadow-sm)'};
          transition: all 0.2s ease;
        ">
          ${isActive ? `
            <div style="position: absolute; top: -10px; right: 12px; background: ${u.badgeColor}; color: white; font-size: 0.675rem; font-weight: 800; padding: 2px 9px; border-radius: 9999px; letter-spacing: 0.04em;">
              ACTIVE SESSION
            </div>
          ` : ''}

          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <div style="font-size: 1.75rem; width: 44px; height: 44px; border-radius: 10px; background: ${u.badgeBg}; display: flex; align-items: center; justify-content: center;">
                ${u.avatarEmoji}
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0;">${u.fullName}</h4>
                </div>
                <div style="display: inline-block; font-size: 0.7rem; font-weight: 700; color: ${u.badgeColor}; background: ${u.badgeBg}; padding: 1px 7px; border-radius: 9999px; margin-top: 3px;">
                  ${u.roleLabel}
                </div>
              </div>
            </div>

            <p style="font-size: 0.775rem; color: #475569; line-height: 1.35; margin: 6px 0 8px 0;">
              ${u.title}
            </p>

            <div style="font-size: 0.725rem; color: #64748b; margin-bottom: 8px;">
              <div>📧 <b>Email:</b> ${u.email}</div>
              <div>🔑 <b>Password:</b> <code style="background:#f1f5f9; padding:1px 4px; border-radius:4px; font-weight:700;">${u.password}</code></div>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px;">
              ${permChips}
            </div>
          </div>

          <button 
            type="button" 
            class="btn ${isActive ? 'btn-secondary' : 'btn-primary'} btn-sm" 
            style="width: 100%; font-weight: 700; ${isActive ? 'border-color: ' + u.badgeColor + '; color: ' + u.badgeColor + ';' : 'background-color: ' + u.badgeColor + ';'}"
            onclick="LandslideAuth.loginAsRole('${u.role}')"
          >
            ${isActive ? '✓ Currently Active' : '⚡ Quick Login as ' + u.shortLabel}
          </button>
        </div>
      `;
    }).join("");
  },

  openLoginModal() {
    const modal = document.getElementById("auth-login-modal");
    if (!modal) return;
    this.renderRoleCards();
    this.clearLoginError();
    modal.classList.add("open");
  },

  closeLoginModal() {
    const modal = document.getElementById("auth-login-modal");
    if (modal) modal.classList.remove("open");
  },

  switchTab(tabName) {
    const tab1Btn = document.getElementById("auth-tab-quick");
    const tab2Btn = document.getElementById("auth-tab-form");
    const sec1 = document.getElementById("auth-section-quick");
    const sec2 = document.getElementById("auth-section-form");

    if (tabName === "quick") {
      if (tab1Btn) tab1Btn.classList.add("active");
      if (tab2Btn) tab2Btn.classList.remove("active");
      if (sec1) sec1.style.display = "block";
      if (sec2) sec2.style.display = "none";
    } else {
      if (tab1Btn) tab1Btn.classList.remove("active");
      if (tab2Btn) tab2Btn.classList.add("active");
      if (sec1) sec1.style.display = "none";
      if (sec2) sec2.style.display = "block";
    }
  },

  fillLoginForm(roleKey) {
    const u = this.USERS[roleKey];
    if (!u) return;

    this.switchTab("form");
    const emailInput = document.getElementById("auth-login-email");
    const passInput = document.getElementById("auth-login-password");
    const roleSelect = document.getElementById("auth-login-role");

    if (emailInput) emailInput.value = u.email;
    if (passInput) passInput.value = u.password;
    if (roleSelect) roleSelect.value = u.role;
  },

  handleFormSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    const email = document.getElementById("auth-login-email")?.value || "";
    const pass = document.getElementById("auth-login-password")?.value || "";
    const role = document.getElementById("auth-login-role")?.value || "";

    return this.loginWithCredentials(email, pass, role);
  },

  showLoginError(msg) {
    const errBox = document.getElementById("auth-login-error-msg");
    if (errBox) {
      errBox.textContent = msg;
      errBox.style.display = "block";
    } else {
      alert(msg);
    }
  },

  clearLoginError() {
    const errBox = document.getElementById("auth-login-error-msg");
    if (errBox) {
      errBox.textContent = "";
      errBox.style.display = "none";
    }
  }
};

// Auto-initialize when DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => LandslideAuth.init());
} else {
  LandslideAuth.init();
}
