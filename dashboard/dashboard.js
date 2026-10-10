// ZTNA Security Command Center Controller
// BE Project Stage - I | Team #8

document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const dashRiskScore = document.getElementById("dashRiskScore");
  const dashGaugeFill = document.getElementById("dashGaugeFill");
  const dashRiskVerdict = document.getElementById("dashRiskVerdict");
  const dashConfidence = document.getElementById("dashConfidence");

  const featTimeVal = document.getElementById("featTimeVal");
  const featTimeBar = document.getElementById("featTimeBar");
  const featGeoVal = document.getElementById("featGeoVal");
  const featGeoBar = document.getElementById("featGeoBar");
  const featDevVal = document.getElementById("featDevVal");
  const featDevBar = document.getElementById("featDevBar");
  const featVelVal = document.getElementById("featVelVal");
  const featVelBar = document.getElementById("featVelBar");
  const featEntropyVal = document.getElementById("featEntropyVal");
  const featEntropyBar = document.getElementById("featEntropyBar");

  const flagsList = document.getElementById("flagsList");

  const postureOsText = document.getElementById("postureOsText");
  const postureOsBadge = document.getElementById("postureOsBadge");
  const postureEncText = document.getElementById("postureEncText");
  const postureEncBadge = document.getElementById("postureEncBadge");
  const postureAvText = document.getElementById("postureAvText");
  const postureAvBadge = document.getElementById("postureAvBadge");
  const postureCertText = document.getElementById("postureCertText");
  const postureCertBadge = document.getElementById("postureCertBadge");
  const postureGeoText = document.getElementById("postureGeoText");
  const postureGeoBadge = document.getElementById("postureGeoBadge");

  const simOffHours = document.getElementById("simOffHours");
  const simGeoDrift = document.getElementById("simGeoDrift");
  const simBurst = document.getElementById("simBurst");
  const simCompromise = document.getElementById("simCompromise");

  const btnAutoAttack = document.getElementById("btnAutoAttack");
  const btnResetTrust = document.getElementById("btnResetTrust");
  const btnScanPostureFull = document.getElementById("btnScanPostureFull");

  const dashUserName = document.getElementById("dashUserName");
  const dashUserEmail = document.getElementById("dashUserEmail");
  const dashRoleSelect = document.getElementById("dashRoleSelect");
  const dashSessionId = document.getElementById("dashSessionId");

  const logsTableBody = document.getElementById("logsTableBody");
  const logFilterInput = document.getElementById("logFilterInput");
  const btnExportLogs = document.getElementById("btnExportLogs");
  const btnClearLogs = document.getElementById("btnClearLogs");

  let currentLogs = [];

  function loadState() {
    chrome.runtime.sendMessage({ action: "GET_STATE" }, (res) => {
      if (res && res.state) {
        renderState(res.state);
      }
    });
  }

  function renderState(state) {
    const { user, posture, risk, simulation, logs } = state;
    currentLogs = logs || [];

    // 1. Identity
    dashUserName.textContent = user.name;
    dashUserEmail.textContent = user.email;
    dashRoleSelect.value = user.role;
    dashSessionId.textContent = user.sessionId;

    // 2. Risk Score & Circular SVG Gauge (circumference = 264)
    const score = risk.score;
    dashRiskScore.textContent = score;
    const maxCirc = 264;
    const offset = maxCirc - ((score / 100) * maxCirc);
    dashGaugeFill.style.strokeDashoffset = offset;

    if (risk.level === "HIGH") {
      dashGaugeFill.style.stroke = "var(--red)";
      dashGaugeFill.style.filter = "drop-shadow(0 0 8px var(--red-glow))";
      dashRiskVerdict.className = "verdict-banner high";
      dashRiskVerdict.textContent = "CRITICAL RISK — ACCESS QUARANTINED";
    } else if (risk.level === "MEDIUM") {
      dashGaugeFill.style.stroke = "var(--amber)";
      dashGaugeFill.style.filter = "drop-shadow(0 0 8px var(--amber-glow))";
      dashRiskVerdict.className = "verdict-banner medium";
      dashRiskVerdict.textContent = "ELEVATED RISK — STEP-UP MFA REQUIRED";
    } else {
      dashGaugeFill.style.stroke = "var(--green)";
      dashGaugeFill.style.filter = "drop-shadow(0 0 8px var(--green-glow))";
      dashRiskVerdict.className = "verdict-banner low";
      dashRiskVerdict.textContent = "LOW RISK — TRUSTED SESSION";
    }

    dashConfidence.textContent = `${(risk.confidence * 100).toFixed(1)}%`;

    // 3. Feature Breakdown
    const f = risk.factors;
    updateFeatureBar(featTimeVal, featTimeBar, f.timeAnomaly);
    updateFeatureBar(featGeoVal, featGeoBar, f.locationAnomaly);
    updateFeatureBar(featDevVal, featDevBar, f.deviceHealthRisk);
    updateFeatureBar(featVelVal, featVelBar, f.requestVelocity);
    updateFeatureBar(featEntropyVal, featEntropyBar, f.behaviorEntropy);

    // 4. Anomaly Flags
    if (risk.anomalyFlags && risk.anomalyFlags.length > 0) {
      flagsList.innerHTML = risk.anomalyFlags
        .map(flag => `<span class="flag-chip">⚠️ ${escapeHtml(flag)}</span>`)
        .join("");
    } else {
      flagsList.innerHTML = '<span class="no-flags">✓ No contextual or behavioral anomalies detected</span>';
    }

    // 5. Posture Info
    postureOsText.textContent = posture.os;
    setRowBadge(postureOsBadge, posture.status === "COMPLIANT", "VERIFIED", "NON-COMPLIANT");

    postureEncText.textContent = posture.diskEncryption ? "AES-XTS 256-bit Full Volume (BitLocker)" : "Disabled / Missing Encryption";
    setRowBadge(postureEncBadge, posture.diskEncryption, "COMPLIANT", "FAIL");

    postureAvText.textContent = posture.antivirus ? "Defender EDR (Signatures Current)" : "EDR Terminated / Outdated";
    setRowBadge(postureAvBadge, posture.antivirus, "RUNNING", "FAIL");

    postureCertText.textContent = posture.mTLSCert;
    setRowBadge(postureCertBadge, !simulation.compromisedDevice, "VALID", "REVOKED");

    postureGeoText.textContent = `${risk.location.city}, ${risk.location.country} (${risk.location.ip})`;
    setRowBadge(postureGeoBadge, risk.location.trustedSubnet, "TRUSTED", "ANOMALY");

    // 6. Simulation Toggles
    simOffHours.checked = !!simulation.offHours;
    simGeoDrift.checked = !!simulation.geoDrift;
    simBurst.checked = !!simulation.rapidBurst;
    simCompromise.checked = !!simulation.compromisedDevice;

    // 7. Render Logs
    renderLogs(currentLogs, logFilterInput.value);
  }

  function updateFeatureBar(valEl, barEl, score) {
    valEl.textContent = `${score}%`;
    barEl.style.width = `${Math.min(100, score * 2)}%`;
    if (score >= 30) {
      barEl.style.background = "linear-gradient(90deg, #FF6D00, #FF1744)";
    } else if (score >= 15) {
      barEl.style.background = "linear-gradient(90deg, #00E5FF, #FFAB00)";
    } else {
      barEl.style.background = "linear-gradient(90deg, #00E5FF, #2979FF)";
    }
  }

  function setRowBadge(el, isPass, passText, failText) {
    if (isPass) {
      el.className = "col-badge pass";
      el.textContent = passText;
    } else {
      el.className = "col-badge fail";
      el.textContent = failText;
    }
  }

  function renderLogs(logs, filterText = "") {
    const q = filterText.toLowerCase();
    const filtered = logs.filter(item => {
      if (!q) return true;
      return (
        item.event.toLowerCase().includes(q) ||
        item.actor.toLowerCase().includes(q) ||
        item.resource.toLowerCase().includes(q) ||
        item.decision.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q)
      );
    });

    if (filtered.length === 0) {
      logsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">No matching audit logs found.</td></tr>`;
      return;
    }

    logsTableBody.innerHTML = filtered.slice().reverse().map(log => {
      let badgeCls = "compliant";
      if (log.decision === "GRANTED") badgeCls = "granted";
      else if (log.decision === "BLOCKED" || log.decision === "ANOMALY_INJECTED") badgeCls = "blocked";
      else if (log.decision.includes("STEP_UP")) badgeCls = "step-up";

      return `
        <tr>
          <td><code>${log.timestamp}</code></td>
          <td><strong>${escapeHtml(log.event)}</strong></td>
          <td>${escapeHtml(log.actor)}</td>
          <td>${escapeHtml(log.resource)}</td>
          <td><span style="font-weight:700; color:${getRiskColor(log.riskScore)}">${log.riskScore}</span></td>
          <td><span class="badge-decision ${badgeCls}">${escapeHtml(log.decision)}</span></td>
          <td style="color:var(--text-secondary); max-width:320px;">${escapeHtml(log.detail)}</td>
        </tr>
      `;
    }).join("");
  }

  function getRiskColor(score) {
    if (score >= 70) return "var(--red)";
    if (score >= 35) return "var(--amber)";
    return "var(--green)";
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Simulation Toggle Handlers
  simOffHours.addEventListener("change", (e) => {
    chrome.runtime.sendMessage({ action: "SET_SIMULATION_FLAG", flag: "offHours", value: e.target.checked }, (res) => {
      if (res && res.state) renderState(res.state);
    });
  });

  simGeoDrift.addEventListener("change", (e) => {
    chrome.runtime.sendMessage({ action: "SET_SIMULATION_FLAG", flag: "geoDrift", value: e.target.checked }, (res) => {
      if (res && res.state) renderState(res.state);
    });
  });

  simBurst.addEventListener("change", (e) => {
    chrome.runtime.sendMessage({ action: "SET_SIMULATION_FLAG", flag: "rapidBurst", value: e.target.checked }, (res) => {
      if (res && res.state) renderState(res.state);
    });
  });

  simCompromise.addEventListener("change", (e) => {
    chrome.runtime.sendMessage({ action: "SET_SIMULATION_FLAG", flag: "compromisedDevice", value: e.target.checked }, (res) => {
      if (res && res.state) {
        chrome.runtime.sendMessage({ action: "RUN_POSTURE_SCAN" }, (res2) => {
          if (res2 && res2.state) renderState(res2.state);
        });
      }
    });
  });

  // Automated Attack Demo Sequence for Examiners
  btnAutoAttack.addEventListener("click", async () => {
    btnAutoAttack.disabled = true;
    btnAutoAttack.textContent = "🚨 Attack Demo In Progress...";

    // Step 1: Trigger Off-Hours
    await sendAsync({ action: "SET_SIMULATION_FLAG", flag: "offHours", value: true });
    loadState();

    setTimeout(async () => {
      // Step 2: Trigger Geo Drift (elevates risk to medium)
      await sendAsync({ action: "SET_SIMULATION_FLAG", flag: "geoDrift", value: true });
      loadState();

      setTimeout(async () => {
        // Step 3: Trigger High Request Burst + Compromised Device (elevates risk to Critical > 70)
        await sendAsync({ action: "SET_SIMULATION_FLAG", flag: "rapidBurst", value: true });
        await sendAsync({ action: "SET_SIMULATION_FLAG", flag: "compromisedDevice", value: true });
        await sendAsync({ action: "RUN_POSTURE_SCAN" });
        loadState();

        btnAutoAttack.disabled = false;
        btnAutoAttack.textContent = "🔥 Run Automated Attack Demo";
      }, 1200);
    }, 1200);
  });

  btnResetTrust.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "RESET_ALL" }, (res) => {
      if (res && res.state) renderState(res.state);
    });
  });

  btnScanPostureFull.addEventListener("click", () => {
    btnScanPostureFull.disabled = true;
    btnScanPostureFull.textContent = "Scanning...";
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: "RUN_POSTURE_SCAN" }, (res) => {
        btnScanPostureFull.disabled = false;
        btnScanPostureFull.textContent = "⚡ Re-Scan Posture";
        if (res && res.state) renderState(res.state);
      });
    }, 400);
  });

  dashRoleSelect.addEventListener("change", (e) => {
    chrome.runtime.sendMessage({ action: "SET_USER_ROLE", role: e.target.value }, (res) => {
      if (res && res.state) renderState(res.state);
    });
  });

  // Resource Access Test Buttons
  document.querySelectorAll(".btn-access").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const resType = e.target.getAttribute("data-res");
      let page = "internal_portal.html";
      if (resType === "db") page = "prod_database.html";
      if (resType === "hr") page = "hr_portal.html";

      chrome.tabs.create({ url: chrome.runtime.getURL(`mock_resources/${page}`) });
    });
  });

  // Log Filtering & Export
  logFilterInput.addEventListener("input", (e) => {
    renderLogs(currentLogs, e.target.value);
  });

  btnClearLogs.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "CLEAR_LOGS" }, (res) => {
      if (res && res.state) renderState(res.state);
    });
  });

  btnExportLogs.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ztna_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  function sendAsync(msg) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(msg, (res) => resolve(res));
    });
  }

  // Storage listener
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.ztna_state) {
      renderState(changes.ztna_state.newValue);
    }
  });

  loadState();
});
