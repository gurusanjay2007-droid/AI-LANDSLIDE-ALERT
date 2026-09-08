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

    const districtSelect = document.getElementById("citizen-district-select") || form.elements["district"];
    if (districtSelect) {
      districtSelect.addEventListener("change", (e) => {
        this.updateCoordinatesForDistrict(e.target.value);
      });
    }
  },

  updateCoordinatesForDistrict(district) {
    const latInput = document.getElementById("report-latitude");
    const lngInput = document.getElementById("report-longitude");
    const statusText = document.getElementById("gps-status-indicator");
    if (!latInput || !lngInput) return;

    // Preset lookup table for global and domestic districts
    const globalCoords = {
      "Nilgiris": [11.3912, 76.7112],
      "Wayanad": [11.5432, 76.1245],
      "Idukki": [9.8512, 77.0125],
      "Chamoli": [30.4125, 79.3312],
      "Shimla": [31.1048, 77.1734],
      "Rudraprayag": [30.2844, 78.9811],
      "Uttarkashi": [30.7268, 78.4354],
      "Darjeeling": [27.0360, 88.2627],
      "Kalimpong": [27.0594, 88.4695],
      "Gangtok": [27.3389, 88.6065],
      "Mangan": [27.5042, 88.5284],
      "Kodagu": [12.4244, 75.7382],
      "Chikkamagaluru": [13.3161, 75.7720],
      "Raigad": [18.5158, 73.1812],
      "Ratnagiri": [16.9902, 73.3120],
      "Pune": [18.5204, 73.8567],
      "Kathmandu (Nepal)": [27.7172, 85.3240],
      "Pokhara / Kaski (Nepal)": [28.2096, 83.9856],
      "Sindhupalchok (Nepal)": [27.9542, 85.6942],
      "Solukhumbu (Nepal)": [27.7025, 86.7128],
      "Nagano (Japan)": [36.6513, 138.1810],
      "Shizuoka (Japan)": [34.9756, 138.3828],
      "Hiroshima (Japan)": [34.3853, 132.4553],
      "Kumamoto (Japan)": [32.8031, 130.7079],
      "Cianjur / West Java (Indonesia)": [-6.8227, 107.1394],
      "Banjarnegara / Central Java (Indonesia)": [-7.3987, 109.6974],
      "Benguet (Philippines)": [16.4674, 120.6869],
      "Southern Leyte (Philippines)": [10.3396, 124.9818],
      "Sichuan (China)": [30.6586, 104.0648],
      "Yunnan (China)": [25.0453, 102.7097],
      "Ratnapura (Sri Lanka)": [6.6828, 80.4034],
      "Kandy (Sri Lanka)": [7.2906, 80.6337],
      "Swat Valley (Pakistan)": [35.2227, 72.4258],
      "Hunza (Pakistan)": [36.3167, 74.6500],
      "Nantou (Taiwan)": [23.9609, 120.9719],
      "Lao Cai / Sa Pa (Vietnam)": [22.3364, 103.8438],
      "Cameron Highlands (Malaysia)": [4.4721, 101.3806],
      "Valais (Switzerland)": [46.1905, 7.5449],
      "Bernese Oberland (Switzerland)": [46.6863, 7.8632],
      "Campania / Ischia (Italy)": [40.7303, 13.8967],
      "Liguria / Cinque Terre (Italy)": [44.1461, 9.6439],
      "Tyrol (Austria)": [47.2692, 11.4041],
      "Auvergne-Rhone-Alpes (France)": [45.9237, 6.8694],
      "Vestland (Norway)": [60.3913, 5.3221],
      "Rize (Turkey)": [41.0201, 40.5234],
      "Los Angeles County CA (USA)": [34.0522, -118.2437],
      "Santa Barbara CA (USA)": [34.4208, -119.6982],
      "Snohomish County WA (USA)": [48.0330, -121.9213],
      "Fraser Valley BC (Canada)": [49.2000, -121.7667],
      "Oaxaca Sierra (Mexico)": [17.0732, -96.7266],
      "Medellin / Antioquia (Colombia)": [6.2442, -75.5812],
      "Mocoa / Putumayo (Colombia)": [1.1495, -76.6465],
      "Petropolis / Rio de Janeiro (Brazil)": [-22.5050, -43.1789],
      "Sao Sebastiao / Sao Paulo (Brazil)": [-23.7600, -45.4097],
      "Ancash / Yungay (Peru)": [-9.1394, -77.7444],
      "Cusco / Sacred Valley (Peru)": [-13.5319, -71.9675],
      "Santiago Cordillera (Chile)": [-33.4489, -70.6693],
      "Quito / Pichincha (Ecuador)": [-0.1807, -78.4678],
      "Rubavu / Western Province (Rwanda)": [-1.6763, 29.2603],
      "Bududa / Mount Elgon (Uganda)": [1.0094, 34.3315],
      "West Pokot (Kenya)": [1.2333, 35.1167],
      "South Kivu / Kalehe (DR Congo)": [-2.0833, 28.9000],
      "Gofa Zone (Ethiopia)": [6.3333, 36.8333],
      "Durban / KwaZulu-Natal (South Africa)": [-29.8587, 31.0218],
      "Freetown / Regent (Sierra Leone)": [8.4412, -13.2081],
      "Hawke's Bay (New Zealand)": [-39.5109, 176.8488],
      "Enga Province (Papua New Guinea)": [-5.4833, 143.5167],
      "Wollongong / Illawarra (Australia)": [-34.4278, 150.8931],
      "Mazandaran (Iran)": [36.5659, 53.0586],
      "Gorno-Badakhshan (Tajikistan)": [38.4167, 72.8333]
    };

    if (globalCoords[district]) {
      const [lat, lng] = globalCoords[district];
      latInput.value = lat.toFixed(4);
      lngInput.value = lng.toFixed(4);
      if (statusText) statusText.textContent = `📍 Centered on ${district} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      return;
    }

    // Check if matched in preset locations
    const matchedLoc = (typeof LANDSLIDE_APP_DATA !== "undefined" && LANDSLIDE_APP_DATA.locations)
      ? LANDSLIDE_APP_DATA.locations.find(l => l.district.toLowerCase() === district.toLowerCase())
      : null;

    if (matchedLoc) {
      latInput.value = matchedLoc.lat.toFixed(4);
      lngInput.value = matchedLoc.lng.toFixed(4);
      if (statusText) statusText.textContent = `📍 Centered on ${district} (${matchedLoc.name})`;
    } else {
      if (statusText) statusText.textContent = `📍 District: ${district}`;
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
