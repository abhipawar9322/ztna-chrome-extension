// AI-Powered ZTNA Extension Popup Logic
// BE Project Stage - I | Team #8

document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");
  const userAvatarEl = document.getElementById("userAvatar");
  const userRoleSelect = document.getElementById("userRoleSelect");

  const riskNumberEl = document.getElementById("riskNumber");
  const gaugeProgress = document.getElementById("gaugeProgress");
  const verdictPill = document.getElementById("verdictPill");

  const postureScorePill = document.getElementById("postureScorePill");
  const statusOSEl = document.getElementById("statusOS");
  const statusEncEl = document.getElementById("statusEnc");
  const statusAVEl = document.getElementById("statusAV");
  const statusCertEl = document.getElementById("statusCert");

  const toggleOffHours = document.getElementById("toggleOffHours");
  const toggleGeoDrift = document.getElementById("toggleGeoDrift");
  const toggleCompromise = document.getElementById("toggleCompromise");

  const btnRunPosture = document.getElementById("btnRunPosture");
  const btnOpenDashboard = document.getElementById("btnOpenDashboard");

  const linkInternalPortal = document.getElementById("linkInternalPortal");
  const linkProdDb = document.getElementById("linkProdDb");
  const linkHrPortal = document.getElementById("linkHrPortal");

  // Fetch initial state
  async function loadState() {
    chrome.runtime.sendMessage({ action: "GET_STATE" }, (response) => {
      if (response && response.state) {
        renderState(response.state);
      }
    });
  }

  function renderState(state) {
    const { user, posture, risk, simulation } = state;

    // 1. Identity
    userNameEl.textContent = user.name;
    userEmailEl.textContent = user.email;
    userAvatarEl.textContent = user.name.split(" ").map(n => n[0]).join("");
    userRoleSelect.value = user.role;

    // 2. Risk Score & Gauge
    const score = risk.score;
    riskNumberEl.textContent = score;

    // Semi-circle arc perimeter is approx 141px
    const maxOffset = 141;
    const progressOffset = maxOffset - ((score / 100) * maxOffset);
    gaugeProgress.style.strokeDashoffset = progressOffset;

    if (risk.level === "HIGH") {
      gaugeProgress.style.stroke = "var(--red-alert)";
      gaugeProgress.style.filter = "drop-shadow(0 0 6px var(--red-glow))";
      verdictPill.className = "verdict-pill high";
      verdictPill.textContent = "CRITICAL RISK • ACCESS QUARANTINED";
    } else if (risk.level === "MEDIUM") {
      gaugeProgress.style.stroke = "var(--orange-warn)";
      gaugeProgress.style.filter = "drop-shadow(0 0 6px var(--orange-glow))";
      verdictPill.className = "verdict-pill medium";
      verdictPill.textContent = "ELEVATED RISK • STEP-UP REQUIRED";
    } else {
      gaugeProgress.style.stroke = "var(--green-safe)";
      gaugeProgress.style.filter = "drop-shadow(0 0 6px var(--green-glow))";
      verdictPill.className = "verdict-pill low";
      verdictPill.textContent = "LOW RISK • ACCESS GRANTED";
    }

    // 3. Posture
    postureScorePill.textContent = `${posture.complianceScore}% Compliant`;
    setPostureBadge(statusOSEl, posture.status === "COMPLIANT");
    setPostureBadge(statusEncEl, posture.diskEncryption);
    setPostureBadge(statusAVEl, posture.antivirus);
    setPostureBadge(statusCertEl, !simulation.compromisedDevice);

    // 4. Simulation Toggles
    toggleOffHours.checked = !!simulation.offHours;
    toggleGeoDrift.checked = !!simulation.geoDrift;
    toggleCompromise.checked = !!simulation.compromisedDevice;
  }

  function setPostureBadge(element, isPass) {
    if (isPass) {
      element.className = "p-status pass";
      element.textContent = "PASS";
    } else {
      element.className = "p-status fail";
      element.textContent = "FAIL";
    }
  }

  // Event Listeners
  userRoleSelect.addEventListener("change", (e) => {
    chrome.runtime.sendMessage({ action: "SET_USER_ROLE", role: e.target.value }, (res) => {
      if (res && res.state) renderState(res.state);
    });
  });

  toggleOffHours.addEventListener("change", (e) => {
    chrome.runtime.sendMessage({ action: "SET_SIMULATION_FLAG", flag: "offHours", value: e.target.checked }, (res) => {
      if (res && res.state) renderState(res.state);
    });
  });

  toggleGeoDrift.addEventListener("change", (e) => {
    chrome.runtime.sendMessage({ action: "SET_SIMULATION_FLAG", flag: "geoDrift", value: e.target.checked }, (res) => {
      if (res && res.state) renderState(res.state);
    });
  });

  toggleCompromise.addEventListener("change", (e) => {
    chrome.runtime.sendMessage({ action: "SET_SIMULATION_FLAG", flag: "compromisedDevice", value: e.target.checked }, (res) => {
      if (res && res.state) {
        // Trigger posture scan re-check
        chrome.runtime.sendMessage({ action: "RUN_POSTURE_SCAN" }, (res2) => {
          if (res2 && res2.state) renderState(res2.state);
        });
      }
    });
  });

  btnRunPosture.addEventListener("click", () => {
    btnRunPosture.disabled = true;
    btnRunPosture.innerHTML = '<span class="btn-icon">⏳</span> Scanning...';
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: "RUN_POSTURE_SCAN" }, (res) => {
        btnRunPosture.disabled = false;
        btnRunPosture.innerHTML = '<span class="btn-icon">⚡</span> Run Posture Scan';
        if (res && res.state) renderState(res.state);
      });
    }, 400);
  });

  btnOpenDashboard.addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard/dashboard.html") });
  });

  // Resource test links
  linkInternalPortal.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL("mock_resources/internal_portal.html") });
  });

  linkProdDb.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL("mock_resources/prod_database.html") });
  });

  linkHrPortal.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL("mock_resources/hr_portal.html") });
  });

  // Listen to background changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.ztna_state) {
      renderState(changes.ztna_state.newValue);
    }
  });

  // Initial load
  loadState();
});
