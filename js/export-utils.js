/**
 * AI-Based Landslide Risk Monitoring System
 * Data Export Utilities & Print-Friendly Report Generator
 */

const ExportUtils = {
  downloadCSV() {
    const headers = ["Location ID", "Location Name", "Village", "District", "Latitude", "Longitude", "Elevation (m)", "Slope (deg)", "24h Rain (mm)", "Soil Moisture (%)", "Risk Probability (%)", "Risk Category", "Last Updated"];
    const rows = LANDSLIDE_APP_DATA.locations.map(loc => [
      `"${loc.id}"`,
      `"${loc.name}"`,
      `"${loc.village}"`,
      `"${loc.district}"`,
      loc.lat,
      loc.lng,
      loc.elevation_m,
      loc.slope_deg,
      loc.rainfall_24h_mm,
      loc.soil_moisture_pct,
      loc.risk_probability,
      `"${loc.risk_category}"`,
      `"${loc.last_updated}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `landslide_risk_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    LandslideApp.showToast("Landslide Telemetry CSV Downloaded!", "success");
  },

  printRiskReport(locationId) {
    const loc = LANDSLIDE_APP_DATA.locations.find(l => l.id === locationId) || LANDSLIDE_APP_DATA.locations[0];
    const evalData = LandslideAIEngine.calculate(loc);

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Disaster Risk Assessment Bulletin - ${loc.name}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
          .header { border-bottom: 2px solid #1e40af; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 22px; font-weight: bold; color: #1e40af; }
          .badge { padding: 6px 14px; border-radius: 4px; font-weight: bold; font-size: 14px; text-transform: uppercase; background: ${loc.color}20; color: ${loc.color}; border: 1px solid ${loc.color}; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; }
          .card { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; background: #f8fafc; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 13px; }
          .table th { background: #f1f5f9; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #64748b; }
        </style>
      </head>
        <div class="header">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="logo.png" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;" alt="Logo" />
            <div>
              <div class="title">AI-Based Landslide Risk Assessment Bulletin</div>
              <div style="font-size: 13px; color: #64748b;">Autonomous Early Warning & Disaster Management System</div>
            </div>
          </div>
          <div class="badge">${loc.risk_category} RISK (${loc.risk_probability}%)</div>
        </div>

        <div>
          <h3>Location: ${loc.name}</h3>
          <p><b>Jurisdiction:</b> ${loc.village}, ${loc.district} (${loc.state}) | <b>Coordinates:</b> ${loc.lat}°N, ${loc.lng}°E</p>
          <p><b>Assessment Timestamp:</b> ${new Date().toLocaleString()} | <b>Model Confidence:</b> ${evalData.confidenceScore}%</p>
        </div>

        <div class="grid">
          <div class="card">
            <h4>Live Environmental Telemetry</h4>
            <p>• 24-Hour Rainfall: <b>${loc.rainfall_24h_mm} mm</b></p>
            <p>• 7-Day Cumulative: <b>${loc.rainfall_7d_mm} mm</b></p>
            <p>• Soil Moisture Saturation: <b>${loc.soil_moisture_pct}%</b></p>
            <p>• Pore-Water Pressure: <b>${loc.pore_pressure_kpa} kPa</b></p>
          </div>
          <div class="card">
            <h4>Geotechnical & Topographic Profile</h4>
            <p>• Slope Angle: <b>${loc.slope_deg}°</b></p>
            <p>• Altitude Elevation: <b>${loc.elevation_m} meters MSL</b></p>
            <p>• Regolith Soil Type: <b>${loc.soil_type}</b></p>
            <p>• Bedrock Geology: <b>${loc.geology}</b></p>
          </div>
        </div>

        <h4>AI Multi-Factor Risk Breakdown</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Factor</th>
              <th>Observed Value</th>
              <th>Factor Weight</th>
              <th>Impact Category</th>
            </tr>
          </thead>
          <tbody>
            ${evalData.factorBreakdown.map(f => `
              <tr>
                <td><b>${f.name}</b></td>
                <td>${f.rawValue}</td>
                <td>${f.weightPct}%</td>
                <td>${f.impact}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <h4>AI Diagnostic Reasoning</h4>
        <ul>
          ${evalData.aiExplanations.map(e => `<li>${e}</li>`).join("")}
        </ul>

        <div class="footer">
          <p>Official Demonstration Bulletin. Generated by AI-Based Early Warning & Landslide Risk Monitoring System. Intended for District Disaster Management Authority (DDMA) & Emergency Field Response Teams.</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
};
