/**
 * AI-Based Landslide Risk Monitoring System
 * Citizen Hazard Reporting & Crowd-Sourced Field Verification Module
 */

const CitizenReporting = {
  init() {
    this.bindFormEvents();
    this.renderReportsTable();
  },

  bindFormEvents() {
    const form = document.getElementById("citizen-report-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmit(form);
    });

    const gpsBtn = document.getElementById("btn-use-my-gps");
    if (gpsBtn) {
      gpsBtn.addEventListener("click", () => {
        this.fetchCurrentGPS();
      });
    }

    const photoInput = document.getElementById("report-photo-input");
    if (photoInput) {
      photoInput.addEventListener("change", (e) => {
        this.handlePhotoPreview(e);
      });
    }
  },

  fetchCurrentGPS() {
    const latInput = document.getElementById("report-latitude");
    const lngInput = document.getElementById("report-longitude");
    const statusText = document.getElementById("gps-status-indicator");

    if (!navigator.geolocation) {
      if (statusText) statusText.textContent = "Geolocation not supported by browser. Using Nilgiris coordinates.";
      latInput.value = "11.3912";
      lngInput.value = "76.7112";
      return;
    }

    if (statusText) statusText.textContent = "Acquiring GPS fix...";

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latInput.value = pos.coords.latitude.toFixed(6);
        lngInput.value = pos.coords.longitude.toFixed(6);
        if (statusText) statusText.textContent = `📍 GPS Fixed: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (±${Math.round(pos.coords.accuracy)}m)`;
        LandslideApp.showToast("GPS coordinates acquired successfully!", "success");
      },
      (err) => {
        // Fallback for simulation / mock demo
        latInput.value = "11.3530";
        lngInput.value = "76.7959";
        if (statusText) statusText.textContent = "📍 Using Demo Coordinates (Marapalam, Nilgiris)";
        LandslideApp.showToast("Using demo sector coordinates (Marapalam)", "info");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  },

  handlePhotoPreview(e) {
    const file = e.target.files[0];
    const previewContainer = document.getElementById("photo-preview-box");
    if (!previewContainer) return;

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        previewContainer.innerHTML = `
          <div style="position: relative; display: inline-block;">
            <img src="${event.target.result}" style="max-height: 120px; border-radius: 8px; border: 1px solid #cbd5e1;" />
            <button type="button" onclick="document.getElementById('report-photo-input').value=''; document.getElementById('photo-preview-box').innerHTML='';" style="position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 11px; cursor: pointer;">✕</button>
          </div>
        `;
      };
      reader.readAsDataURL(file);
    }
  },

  handleFormSubmit(form) {
    const reporterName = form.elements["reporter_name"].value;
    const contact = form.elements["contact_info"].value;
    const locationName = form.elements["location_name"].value;
    const district = form.elements["district"].value;
    const lat = parseFloat(form.elements["latitude"].value) || 11.3912;
    const lng = parseFloat(form.elements["longitude"].value) || 76.7112;
    const reportType = form.elements["report_type"].value;
    const description = form.elements["description"].value;

    const newReport = {
      id: `CIT-${8020 + LANDSLIDE_APP_DATA.citizenReports.length + 1}`,
      reporter_name: reporterName,
      contact_info: contact || "Anonymous",
      location_name: locationName,
      district: district,
      lat: lat,
      lng: lng,
      report_type: reportType,
      description: description,
      status: "Pending",
      risk_level: reportType.includes("Landslide") || reportType.includes("cracks") ? "HIGH" : "MODERATE",
      timestamp: "Just now"
    };

    LANDSLIDE_APP_DATA.citizenReports.unshift(newReport);
    form.reset();
    document.getElementById("photo-preview-box").innerHTML = "";
    document.getElementById("gps-status-indicator").textContent = "";

    this.renderReportsTable();
    LandslideMap.renderCitizenMarkers();
    LandslideApp.showToast(`Report ${newReport.id} successfully submitted! Dispatched to Field Engineers.`, "success");
  },

  renderReportsTable(filterStatus = "ALL") {
    const tableBody = document.getElementById("citizen-reports-table-body");
    if (!tableBody) return;

    let list = LANDSLIDE_APP_DATA.citizenReports;
    if (filterStatus !== "ALL") {
      list = list.filter(r => r.status.toLowerCase() === filterStatus.toLowerCase());
    }

    if (list.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #64748b; padding: 2rem;">No citizen hazard reports matching selected filter.</td></tr>`;
      return;
    }

    tableBody.innerHTML = list.map(rep => {
      const statusBadge = rep.status === "Verified" ? "background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;" :
                          rep.status === "Pending" ? "background: #fffbeb; color: #92400e; border: 1px solid #fde68a;" :
                          "background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;";

      const isAdmin = LandslideApp.currentRole === "ADMIN" || LandslideApp.currentRole === "DISASTER_MANAGER";

      return `
        <tr>
          <td><b style="color: #1e40af;">${rep.id}</b></td>
          <td>
            <div><b>${rep.location_name}</b></div>
            <div style="font-size: 0.75rem; color: #64748b;">${rep.lat.toFixed(4)}, ${rep.lng.toFixed(4)} (${rep.district})</div>
          </td>
          <td><span class="risk-badge ${rep.risk_level}">${rep.report_type}</span></td>
          <td style="max-width: 260px; font-size: 0.8rem; color: #334155;">${rep.description}</td>
          <td style="font-size: 0.775rem; color: #64748b;">${rep.timestamp}</td>
          <td><span style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; ${statusBadge}">${rep.status}</span></td>
          <td>
            ${isAdmin ? `
              <div style="display: flex; gap: 4px;">
                <button class="btn btn-secondary btn-sm" onclick="CitizenReporting.updateStatus('${rep.id}', 'Verified')">✓ Verify</button>
                <button class="btn btn-secondary btn-sm" onclick="CitizenReporting.updateStatus('${rep.id}', 'Rejected')">✕ Reject</button>
              </div>
            ` : `
              <span style="font-size: 0.75rem; color: #94a3b8;">Restricted (Admin only)</span>
            `}
          </td>
        </tr>
      `;
    }).join("");
  },

  updateStatus(reportId, newStatus) {
    const rep = LANDSLIDE_APP_DATA.citizenReports.find(r => r.id === reportId);
    if (rep) {
      rep.status = newStatus;
      this.renderReportsTable();
      LandslideApp.showToast(`Report ${reportId} marked as ${newStatus}`, "info");
    }
  }
};
