/**
 * AI-Based Landslide Risk Monitoring System
 * Chart.js Visualizations & Timeseries Telemetry Engines
 */

const LandslideCharts = {
  instances: {},

  initEnvironmentalCharts(timeframe = "24h", loc = null) {
    if (!loc && typeof LandslideApp !== "undefined" && LandslideApp.getSelectedLocation) {
      loc = LandslideApp.getSelectedLocation();
    }
    this.renderRainfallChart(timeframe, loc);
    this.renderSoilMoistureChart(timeframe, loc);
    this.renderAtmosphericChart(timeframe, loc);
  },

  destroyChart(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  },

  renderRainfallChart(timeframe = "24h", loc = null) {
    const ctx = document.getElementById("chart-rainfall");
    if (!ctx) return;
    this.destroyChart("rainfall");
    if (typeof Chart !== "undefined" && Chart.getChart) {
      const existing = Chart.getChart(ctx);
      if (existing) existing.destroy();
    }

    if (!loc && typeof LandslideApp !== "undefined" && LandslideApp.getSelectedLocation) {
      loc = LandslideApp.getSelectedLocation();
    }

    let labels, dataHourly, dataCumulative, yTitle, y1Title;
    const rain24 = loc && loc.rainfall_24h_mm ? loc.rainfall_24h_mm : 162;
    const rain7d = loc && loc.rainfall_7d_mm ? loc.rainfall_7d_mm : 412;
    const rain30d = Math.round(rain7d * 2.8);

    if (timeframe === "24h") {
      labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"];
      const factors = [0.07, 0.14, 0.22, 0.24, 0.15, 0.11, 0.07];
      let running = 0;
      dataHourly = factors.map(f => Math.round(rain24 * f * 10) / 10);
      dataCumulative = dataHourly.map(v => {
        running = Math.round((running + v) * 10) / 10;
        return running;
      });
      dataCumulative[dataCumulative.length - 1] = rain24;
      yTitle = "Hourly Precipitation (mm)";
      y1Title = "24h Cumulative (mm)";
    } else if (timeframe === "7d") {
      labels = ["Day -6", "Day -5", "Day -4", "Day -3", "Day -2", "Yesterday", "Today"];
      const factors = [0.08, 0.11, 0.15, 0.18, 0.22, 0.14, 0.12];
      let running = 0;
      dataHourly = factors.map(f => Math.round(rain7d * f * 10) / 10);
      dataCumulative = dataHourly.map(v => {
        running = Math.round((running + v) * 10) / 10;
        return running;
      });
      dataCumulative[dataCumulative.length - 1] = rain7d;
      yTitle = "Daily Precipitation (mm)";
      y1Title = "7d Cumulative (mm)";
    } else { // 30d
      labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
      const factors = [0.18, 0.25, 0.35, 0.22];
      let running = 0;
      dataHourly = factors.map(f => Math.round(rain30d * f));
      dataCumulative = dataHourly.map(v => {
        running += v;
        return running;
      });
      dataCumulative[dataCumulative.length - 1] = rain30d;
      yTitle = "Weekly Precipitation (mm)";
      y1Title = "30d Cumulative (mm)";
    }

    this.instances["rainfall"] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: timeframe === "30d" ? "Weekly Precipitation (mm)" : (timeframe === "7d" ? "Daily Precipitation (mm)" : "Precipitation (mm)"),
            data: dataHourly,
            backgroundColor: "#3b82f6",
            borderRadius: 4,
            yAxisID: "y"
          },
          {
            label: "Cumulative Total (mm)",
            data: dataCumulative,
            type: "line",
            borderColor: "#1e40af",
            borderWidth: 2.5,
            pointBackgroundColor: "#1e40af",
            pointRadius: 4,
            fill: false,
            tension: 0.3,
            yAxisID: "y1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" }
        },
        scales: {
          y: {
            title: { display: true, text: yTitle },
            grid: { color: "#f1f5f9" }
          },
          y1: {
            position: "right",
            title: { display: true, text: y1Title },
            grid: { drawOnChartArea: false }
          },
          x: { grid: { display: false } }
        }
      }
    });
  },

  renderSoilMoistureChart(timeframe = "24h", loc = null) {
    const ctx = document.getElementById("chart-soil-moisture");
    if (!ctx) return;
    this.destroyChart("soil");
    if (typeof Chart !== "undefined" && Chart.getChart) {
      const existing = Chart.getChart(ctx);
      if (existing) existing.destroy();
    }

    if (!loc && typeof LandslideApp !== "undefined" && LandslideApp.getSelectedLocation) {
      loc = LandslideApp.getSelectedLocation();
    }

    const curSoil = loc && loc.soil_moisture_pct ? loc.soil_moisture_pct : 88;
    const curPore = loc && loc.pore_pressure_kpa ? loc.pore_pressure_kpa : 58.6;

    let labels, dataSoil, dataPore, threshold;

    if (timeframe === "24h") {
      labels = ["T-18h", "T-15h", "T-12h", "T-9h", "T-6h", "T-3h", "Current"];
      dataSoil = [
        Math.max(10, Math.round((curSoil - 36) * 10) / 10),
        Math.max(15, Math.round((curSoil - 30) * 10) / 10),
        Math.max(20, Math.round((curSoil - 21) * 10) / 10),
        Math.max(25, Math.round((curSoil - 13) * 10) / 10),
        Math.max(30, Math.round((curSoil - 6) * 10) / 10),
        Math.max(30, Math.round((curSoil - 1.5) * 10) / 10),
        curSoil
      ];
      dataPore = [
        Math.max(5, Math.round((curPore - 38) * 10) / 10),
        Math.max(8, Math.round((curPore - 34) * 10) / 10),
        Math.max(12, Math.round((curPore - 26) * 10) / 10),
        Math.max(15, Math.round((curPore - 16) * 10) / 10),
        Math.max(18, Math.round((curPore - 8) * 10) / 10),
        Math.max(20, Math.round((curPore - 2) * 10) / 10),
        curPore
      ];
      threshold = [75, 75, 75, 75, 75, 75, 75];
    } else if (timeframe === "7d") {
      labels = ["Day -6", "Day -5", "Day -4", "Day -3", "Day -2", "Yesterday", "Today"];
      dataSoil = [
        Math.max(10, Math.round((curSoil - 42) * 10) / 10),
        Math.max(15, Math.round((curSoil - 35) * 10) / 10),
        Math.max(20, Math.round((curSoil - 26) * 10) / 10),
        Math.max(25, Math.round((curSoil - 18) * 10) / 10),
        Math.max(30, Math.round((curSoil - 11) * 10) / 10),
        Math.max(35, Math.round((curSoil - 4) * 10) / 10),
        curSoil
      ];
      dataPore = [
        Math.max(5, Math.round((curPore - 42) * 10) / 10),
        Math.max(8, Math.round((curPore - 36) * 10) / 10),
        Math.max(12, Math.round((curPore - 28) * 10) / 10),
        Math.max(15, Math.round((curPore - 19) * 10) / 10),
        Math.max(18, Math.round((curPore - 11) * 10) / 10),
        Math.max(20, Math.round((curPore - 4) * 10) / 10),
        curPore
      ];
      threshold = [75, 75, 75, 75, 75, 75, 75];
    } else { // 30d
      labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
      dataSoil = [
        Math.max(10, Math.round((curSoil - 45) * 10) / 10),
        Math.max(18, Math.round((curSoil - 30) * 10) / 10),
        Math.max(25, Math.round((curSoil - 14) * 10) / 10),
        curSoil
      ];
      dataPore = [
        Math.max(5, Math.round((curPore - 44) * 10) / 10),
        Math.max(10, Math.round((curPore - 31) * 10) / 10),
        Math.max(15, Math.round((curPore - 15) * 10) / 10),
        curPore
      ];
      threshold = [75, 75, 75, 75];
    }

    this.instances["soil"] = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Topsoil Saturation (0-10cm) %",
            data: dataSoil,
            borderColor: "#0284c7",
            backgroundColor: "rgba(2, 132, 199, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 4
          },
          {
            label: "Pore-Water Pressure (kPa)",
            data: dataPore,
            borderColor: "#d97706",
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
            pointRadius: 4
          },
          {
            label: "Critical Instability Threshold",
            data: threshold,
            borderColor: "#ef4444",
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "top" } },
        scales: {
          y: {
            title: { display: true, text: "Percentage (%) / kPa" },
            grid: { color: "#f1f5f9" }
          },
          x: { grid: { display: false } }
        }
      }
    });
  },

  renderAtmosphericChart(timeframe = "24h", loc = null) {
    const ctx = document.getElementById("chart-atmospheric");
    if (!ctx) return;
    this.destroyChart("atmospheric");
    if (typeof Chart !== "undefined" && Chart.getChart) {
      const existing = Chart.getChart(ctx);
      if (existing) existing.destroy();
    }

    if (!loc && typeof LandslideApp !== "undefined" && LandslideApp.getSelectedLocation) {
      loc = LandslideApp.getSelectedLocation();
    }

    const curHum = loc && loc.humidity_pct ? loc.humidity_pct : 96;
    const curTemp = loc && loc.temperature_c ? loc.temperature_c : 19.1;

    let labels, dataHum, dataTemp;

    if (timeframe === "24h") {
      labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"];
      dataHum = [
        Math.max(40, curHum - 10),
        Math.max(40, curHum - 6),
        Math.max(40, curHum - 2),
        curHum,
        Math.max(40, curHum - 1),
        Math.max(40, curHum - 2),
        curHum
      ];
      dataTemp = [
        Math.round((curTemp - 3.5) * 10) / 10,
        Math.round((curTemp - 4.2) * 10) / 10,
        Math.round((curTemp - 2.0) * 10) / 10,
        Math.round((curTemp + 1.5) * 10) / 10,
        Math.round((curTemp + 0.5) * 10) / 10,
        Math.round((curTemp - 1.2) * 10) / 10,
        curTemp
      ];
    } else if (timeframe === "7d") {
      labels = ["Day -6", "Day -5", "Day -4", "Day -3", "Day -2", "Yesterday", "Today"];
      dataHum = [
        Math.max(40, curHum - 18),
        Math.max(40, curHum - 15),
        Math.max(40, curHum - 11),
        Math.max(40, curHum - 7),
        Math.max(40, curHum - 4),
        Math.max(40, curHum - 1),
        curHum
      ];
      dataTemp = [
        Math.round((curTemp + 3.2) * 10) / 10,
        Math.round((curTemp + 2.5) * 10) / 10,
        Math.round((curTemp + 1.8) * 10) / 10,
        Math.round((curTemp + 0.8) * 10) / 10,
        Math.round((curTemp + 0.2) * 10) / 10,
        Math.round((curTemp - 0.4) * 10) / 10,
        curTemp
      ];
    } else { // 30d
      labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
      dataHum = [
        Math.max(40, curHum - 22),
        Math.max(40, curHum - 14),
        Math.max(40, curHum - 6),
        curHum
      ];
      dataTemp = [
        Math.round((curTemp + 4.5) * 10) / 10,
        Math.round((curTemp + 3.0) * 10) / 10,
        Math.round((curTemp + 1.2) * 10) / 10,
        curTemp
      ];
    }

    this.instances["atmospheric"] = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Relative Humidity (%)",
            data: dataHum,
            borderColor: "#06b6d4",
            tension: 0.3,
            pointRadius: 4
          },
          {
            label: "Ambient Temp (°C)",
            data: dataTemp,
            borderColor: "#f97316",
            tension: 0.3,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { grid: { color: "#f1f5f9" } },
          x: { grid: { display: false } }
        }
      }
    });
  },

  renderRiskTrendsChart(location) {
    const ctx = document.getElementById("chart-risk-trend-trajectory");
    if (!ctx) return;
    this.destroyChart("riskTrend");
    if (typeof Chart !== "undefined" && Chart.getChart) {
      const existing = Chart.getChart(ctx);
      if (existing) existing.destroy();
    }

    const evalData = LandslideAIEngine.calculate(location);
    const traj = evalData.trendTrajectory;
    const color = location && location.color ? location.color : "#991b1b";

    this.instances["riskTrend"] = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Past 24h", "Past 12h", "Current (Now)", "Forecast +6h", "Forecast +24h", "Forecast +7d"],
        datasets: [
          {
            label: "AI Landslide Risk Probability (%)",
            data: [traj.past_24h, Math.round((traj.past_24h + traj.current)/2), traj.current, traj.forecast_6h, traj.forecast_24h, traj.forecast_7d],
            borderColor: color,
            backgroundColor: `${color}20`,
            fill: true,
            borderWidth: 3,
            pointBackgroundColor: color,
            pointRadius: 6,
            pointHoverRadius: 8,
            tension: 0.3
          },
          {
            label: "Critical Danger Threshold (80%)",
            data: [80, 80, 80, 80, 80, 80],
            borderColor: "#991b1b",
            borderDash: [6, 6],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            title: { display: true, text: "Risk Probability (%)" },
            grid: { color: "#f1f5f9" }
          },
          x: { grid: { display: false } }
        }
      }
    });
  },

  renderAIFactorRadar(location) {
    const ctx = document.getElementById("chart-ai-radar");
    if (!ctx) return;
    this.destroyChart("radar");

    const evalData = LandslideAIEngine.calculate(location);
    const factorScores = evalData.factorBreakdown.map(f => f.score);
    const factorLabels = evalData.factorBreakdown.map(f => f.name);

    this.instances["radar"] = new Chart(ctx, {
      type: "radar",
      data: {
        labels: factorLabels,
        datasets: [
          {
            label: `${location.name} Susceptibility Fingerprint`,
            data: factorScores,
            backgroundColor: "rgba(30, 64, 175, 0.2)",
            borderColor: "#1e40af",
            pointBackgroundColor: "#1e40af",
            borderWidth: 2
          },
          {
            label: "Baseline Regional Average",
            data: [35, 40, 30, 25, 40, 35],
            backgroundColor: "rgba(148, 163, 184, 0.15)",
            borderColor: "#94a3b8",
            borderDash: [4, 4],
            borderWidth: 1.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: "#e2e8f0" },
            grid: { color: "#f1f5f9" },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: { display: false }
          }
        }
      }
    });
  },

  renderHistoricalCharts() {
    const ctxYear = document.getElementById("chart-history-year");
    if (ctxYear) {
      this.destroyChart("historyYear");
      this.instances["historyYear"] = new Chart(ctxYear, {
        type: "bar",
        data: {
          labels: ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
          datasets: [
            {
              label: "Recorded Landslide Incidents",
              data: [18, 26, 14, 21, 19, 24, 38, 22],
              backgroundColor: "#1e40af",
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { title: { display: true, text: "Incident Count" }, grid: { color: "#f1f5f9" } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    const ctxRainCorrelation = document.getElementById("chart-history-correlation");
    if (ctxRainCorrelation) {
      this.destroyChart("historyCorr");
      this.instances["historyCorr"] = new Chart(ctxRainCorrelation, {
        type: "scatter",
        data: {
          datasets: [
            {
              label: "Historical Incidents vs 24h Rainfall",
              data: [
                { x: 140, y: 1 }, { x: 165, y: 2 }, { x: 175, y: 3 }, { x: 198, y: 4 },
                { x: 215, y: 5 }, { x: 290, y: 8 }, { x: 310, y: 12 }, { x: 382, y: 18 }
              ],
              backgroundColor: "#ef4444",
              pointRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: "24-Hour Rainfall (mm)" }, grid: { color: "#f1f5f9" } },
            y: { title: { display: true, text: "Cluster Incident Severity Index" }, grid: { color: "#f1f5f9" } }
          }
        }
      });
    }
  }
};
