// ZTNA Floating Security Indicator Content Script
// Indira College of Engineering & Management | Team #8

(() => {
  // Avoid injecting inside extension pages or iframes
  if (window.location.protocol === "chrome-extension:" || window.top !== window.self) {
    return;
  }

  // Create Root Container
  const root = document.createElement("div");
  root.id = "ztna-pill-root";

  root.innerHTML = `
    <div class="ztna-quick-popover" id="ztnaQuickPop">
      <div class="ztna-pop-title">🛡️ ZTNA Session Context</div>
      <div class="ztna-pop-row"><span>User:</span> <strong id="popUser">AP (Dev)</strong></div>
      <div class="ztna-pop-row"><span>Risk Score:</span> <strong id="popRisk">14 / 100</strong></div>
      <div class="ztna-pop-row"><span>Posture:</span> <strong id="popPosture">Compliant</strong></div>
      <div class="ztna-pop-row"><span>Gateway:</span> <strong>Envoy Proxy</strong></div>
      <button class="ztna-pop-btn" id="btnPopOpenDash">Open Dashboard</button>
    </div>
    <div class="ztna-floating-pill low" id="ztnaPill">
      <span class="ztna-indicator-dot"></span>
      <span>ZTNA</span>
      <span class="ztna-score-tag" id="pillScore">14</span>
    </div>
  `;

  document.body.appendChild(root);

  const pill = document.getElementById("ztnaPill");
  const pillScore = document.getElementById("pillScore");
  const popover = document.getElementById("ztnaQuickPop");
  const popUser = document.getElementById("popUser");
  const popRisk = document.getElementById("popRisk");
  const popPosture = document.getElementById("popPosture");
  const btnPopOpenDash = document.getElementById("btnPopOpenDash");

  function updatePill(state) {
    if (!state) return;
    const { user, posture, risk } = state;
    const score = risk.score;

    pillScore.textContent = score;
    pill.className = `ztna-floating-pill ${risk.level.toLowerCase()}`;

    popUser.textContent = `${user.name.split(" ")[0]} (${user.role})`;
    popRisk.textContent = `${score} / 100 (${risk.level})`;
    popPosture.textContent = posture.status;
  }

  // Fetch initial status
  chrome.runtime.sendMessage({ action: "GET_STATE" }, (res) => {
    if (res && res.state) {
      updatePill(res.state);
    }
  });

  // Toggle popover
  pill.addEventListener("click", (e) => {
    e.stopPropagation();
    popover.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) {
      popover.classList.remove("open");
    }
  });

  btnPopOpenDash.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "OPEN_DASHBOARD" });
    window.open(chrome.runtime.getURL("dashboard/dashboard.html"), "_blank");
  });

  // Storage listener for reactive updates
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.ztna_state) {
      updatePill(changes.ztna_state.newValue);
    }
  });
})();
