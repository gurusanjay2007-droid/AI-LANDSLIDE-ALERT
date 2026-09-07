/**
 * AI-Based Landslide Risk Monitoring System
 * Chart.js Visualizations & Timeseries Telemetry Engines
 */

const LandslideCharts = {
  instances: {},

  initEnvironmentalCharts(timeframe = "24h") {
    this.renderRainfallChart(timeframe);
    this.renderSoilMoistureChart(timeframe);
    this.renderAtmosphericChart(timeframe);
  },

  destroyChart(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  },

  renderRainfallChart(timeframe = "24h") {
    const ctx = document.getElementById("chart-rainfall");
    if (!ctx) return;
    this.destroyChart("rainfall");

    let labels, dataHourly, dataCumulative;
    if (timeframe === "24h") {
      labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"];
      dataHourly = [12, 28, 45, 62, 38, 55, 48];
      dataCumulative = [12, 40, 85, 147, 185, 240, 288];
    } else if (timeframe === "7d") {
      labels = ["Day -6", "Day -5", "Day -4", "Day -3", "Day -2", "Yesterday", "Today"];
      dataHourly = [45, 62, 98, 142, 178, 162, 185];
      dataCumulative = [45, 107, 205, 347, 525, 687, 872];
    } else {
      labels = ["Wk 1", "Wk 2", "Wk 3", "Wk 4"];
      dataHourly = [180, 240, 420, 310];
      dataCumulative = [180, 420, 840, 1150];
    }

    this.instances["rainfall"] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Precipitation (mm)",
            data: dataHourly,
            backgroundColor: "#3b82f6",
            borderRadius: 4,
            yAxisID: "y"
          },
          {
            label: "Cumulative (mm)",
            data: dataCumulative,
            type: "line",
            borderColor: "#1e40af",
            borderWidth: 2,
            pointBackgroundColor: "#1e40af",
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
            title: { display: true, text: "Precipitation (mm)" },
            grid: { color: "#f1f5f9" }
          },
          y1: {
            position: "right",
            title: { display: true, text: "Cumulative Total (mm)" },
            grid: { drawOnChartArea: false }
          },
          x: { grid: { display: false } }
        }
      }
    });
  },

  renderSoilMoistureChart(timeframe = "24h") {
    const ctx = document.getElementById("chart-soil-moisture");
    if (!ctx) return;
    this.destroyChart("soil");

    const labels = ["T-18h", "T-15h", "T-12h", "T-9h", "T-6h", "T-3h", "Current"];
    this.instances["soil"] = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Topsoil Saturation (0-10cm) %",
            data: [52, 58, 67, 75, 82, 88, 91.5],
            borderColor: "#0284c7",
            backgroundColor: "rgba(2, 132, 199, 0.1)",
            fill: true,
            tension: 0.4
          },
          {
            label: "Pore-Water Pressure (kPa)",
            data: [18, 22, 31, 42, 53, 61, 64.8],
            borderColor: "#d97706",
            borderDash: [5, 5],
            fill: false,
            tension: 0.4
          },
          {
            label: "Critical Instability Threshold",
            data: [75, 75, 75, 75, 75, 75, 75],
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

  renderAtmosphericChart(timeframe = "24h") {
    const ctx = document.getElementById("chart-atmospheric");
    if (!ctx) return;
    this.destroyChart("atmospheric");

    this.instances["atmospheric"] = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"],
        datasets: [
          {
            label: "Relative Humidity (%)",
            data: [88, 92, 95, 98, 97, 96, 98],
            borderColor: "#06b6d4",
            tension: 0.3
          },
          {
            label: "Ambient Temp (°C)",
            data: [15, 14, 16, 19, 18, 17, 16.8],
            borderColor: "#f97316",
            tension: 0.3
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

    const evalData = LandslideAIEngine.calculate(location);
    const traj = evalData.trendTrajectory;

    this.instances["riskTrend"] = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Past 24h", "Past 12h", "Current (Now)", "Forecast +6h", "Forecast +24h", "Forecast +7d"],
        datasets: [
          {
            label: "AI Landslide Risk Probability (%)",
            data: [traj.past_24h, Math.round((traj.past_24h + traj.current)/2), traj.current, traj.forecast_6h, traj.forecast_24h, traj.forecast_7d],
            borderColor: location.color,
            backgroundColor: `${location.color}15`,
            fill: true,
            borderWidth: 3,
            pointBackgroundColor: location.color,
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
