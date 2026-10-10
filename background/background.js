// AI-Powered ZTNA Endpoint Agent - Background Service Worker
// Project: AI-POWERED ZERO TRUST NETWORK ACCESS (ZTNA)
// Indira College of Engineering & Management, Pune (Stage - I)

const DEFAULT_STATE = {
  user: {
    name: "Abhishek Pawar",
    email: "abhishek.pawar@indiraicem.ac.in",
    role: "Developer", // Guest, Employee, Developer, Security Admin
    department: "Computer Engineering / Infrastructure",
    teamId: "Project-ID-8",
    sessionId: "ztna-sess-" + Math.random().toString(36).substring(2, 9),
    isAuthenticated: true,
    mfaVerified: true,
    mfaExpiresAt: Date.now() + 3600000,
    sessionCreated: new Date().toLocaleTimeString(),
  },
  posture: {
    os: "Windows 11 Enterprise (x64)",
    browser: "Chrome 128.0 (Secure Context)",
    screenLock: true,
    diskEncryption: true, // BitLocker Active
    antivirus: true,      // Windows Defender EDR Active
    firewall: true,       // Corporate Domain Profile Active
    mTLSCert: "ICEM-ZTNA-CLIENT-CERT-RSA2048 [VALID]",
    complianceScore: 98,
    lastScanned: new Date().toLocaleTimeString(),
    status: "COMPLIANT"
  },
  risk: {
    score: 14, // 0 - 100
    level: "LOW", // LOW (0-29), MEDIUM (30-69), HIGH (70-100)
    status: "TRUSTED ACCESS",
    confidence: 0.94,
    factors: {
      timeAnomaly: 4,      // Normal working hours
      locationAnomaly: 2,  // Trusted IP (Pune Campus / Safe ISP)
      deviceHealthRisk: 2, // Posture compliant
      requestVelocity: 4,  // Normal rate: 8-15 req/min
      behaviorEntropy: 2   // Known navigation pattern
    },
    location: {
      city: "Pune",
      country: "India",
      ip: "103.112.54.21",
      trustedSubnet: true
    },
    model: "Isolation Forest + Autoencoder (ONNX)",
    anomalyFlags: []
  },
  simulation: {
    offHours: false,
    geoDrift: false,
    rapidBurst: false,
    compromisedDevice: false,
    untrustedNetwork: false
  },
  config: {
    backendMode: "mock", // "mock" or "live"
    backendUrl: "http://localhost:8000/api/v1",
    autoHeartbeatSec: 20,
    enforcementActive: true
  },
  logs: [
    {
      id: "log-1",
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString(),
      event: "IDENTITY_ENROLLMENT",
      actor: "abhishek.pawar@indiraicem.ac.in",
      resource: "SSO Gateway (Keycloak)",
      decision: "GRANTED",
      riskScore: 12,
      detail: "mTLS handshake and OAuth2 JWT validated successfully."
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 180000).toLocaleTimeString(),
      event: "POSTURE_VERIFICATION",
      actor: "Endpoint Agent",
      resource: "Context Engine",
      decision: "COMPLIANT",
      riskScore: 14,
      detail: "Disk encryption verified, firewall active, EDR online (Score: 98/100)."
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
      event: "POLICY_EVALUATION",
      actor: "abhishek.pawar@indiraicem.ac.in",
      resource: "Internal Dev Portal",
      decision: "GRANTED",
      riskScore: 14,
      detail: "OPA Policy rule 'allow_developer_internal' evaluated to TRUE."
    }
  ]
};

// Initialize State on Install
chrome.runtime.onInstalled.addListener(async () => {
  console.log("[ZTNA Agent] Service Worker Installed.");
  const existing = await chrome.storage.local.get(["ztna_state"]);
  if (!existing.ztna_state) {
    await chrome.storage.local.set({ ztna_state: DEFAULT_STATE });
  }
  // Setup heartbeat alarm
  chrome.alarms.create("ztna_heartbeat", { periodInMinutes: 0.5 });
});

// Periodic Heartbeat
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "ztna_heartbeat") {
    await runContinuousEvaluation();
  }
});

// Recalculate Risk based on context & active simulation flags
function computeRisk(sim, posture) {
  let timeAnomaly = sim.offHours ? 38 : 4;
  let locationAnomaly = sim.geoDrift ? 42 : (sim.untrustedNetwork ? 25 : 2);
  let deviceHealthRisk = sim.compromisedDevice ? 45 : (posture.complianceScore < 70 ? 30 : 2);
  let requestVelocity = sim.rapidBurst ? 35 : Math.floor(Math.random() * 4) + 3;
  let behaviorEntropy = sim.geoDrift && sim.offHours ? 25 : 3;

  let totalScore = Math.min(100, timeAnomaly + locationAnomaly + deviceHealthRisk + requestVelocity + behaviorEntropy);
  let level = "LOW";
  let status = "TRUSTED ACCESS";

  let anomalyFlags = [];
  if (sim.offHours) anomalyFlags.push("Temporal Anomaly (Access outside business hours)");
  if (sim.geoDrift) anomalyFlags.push("Impossible Travel / Geolocation Drift detected");
  if (sim.compromisedDevice) anomalyFlags.push("Device Posture Non-Compliant (EDR Disabled / Missing Encryption)");
  if (sim.rapidBurst) anomalyFlags.push("High Request Velocity / Scraping Pattern detected");
  if (sim.untrustedNetwork) anomalyFlags.push("Insecure / Public Wi-Fi Subnet detected");

  if (totalScore >= 70) {
    level = "HIGH";
    status = "CRITICAL RISK - ACCESS QUARANTINED";
  } else if (totalScore >= 35) {
    level = "MEDIUM";
    status = "ELEVATED RISK - STEP-UP MFA REQUIRED";
  }

  return {
    score: totalScore,
    level,
    status,
    confidence: 0.95 - (totalScore > 50 ? 0.08 : 0.01),
    factors: {
      timeAnomaly,
      locationAnomaly,
      deviceHealthRisk,
      requestVelocity,
      behaviorEntropy
    },
    location: sim.geoDrift ? {
      city: "Frankfurt (VPN / Proxy Node)",
      country: "Germany",
      ip: "185.220.101.44",
      trustedSubnet: false
    } : {
      city: "Pune",
      country: "India",
      ip: "103.112.54.21",
      trustedSubnet: !sim.untrustedNetwork
    },
    model: "Isolation Forest + Autoencoder (ONNX)",
    anomalyFlags
  };
}

async function runContinuousEvaluation() {
  const data = await chrome.storage.local.get(["ztna_state"]);
  if (!data.ztna_state) return;
  const state = data.ztna_state;

  // Recompute risk
  const updatedRisk = computeRisk(state.simulation, state.posture);
  state.risk = updatedRisk;

  // Add heartbeat audit log if risk changed significantly
  if (state.logs.length > 50) {
    state.logs = state.logs.slice(state.logs.length - 40);
  }

  await chrome.storage.local.set({ ztna_state: state });

  // Update extension badge color & text
  updateBadge(updatedRisk);
}

function updateBadge(risk) {
  let badgeColor = "#00E5FF";
  let badgeText = risk.score.toString();

  if (risk.level === "HIGH") {
    badgeColor = "#FF1744"; // Red
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    chrome.action.setBadgeText({ text: "!" + badgeText });
  } else if (risk.level === "MEDIUM") {
    badgeColor = "#FF9100"; // Orange
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    chrome.action.setBadgeText({ text: badgeText });
  } else {
    badgeColor = "#00E676"; // Green
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    chrome.action.setBadgeText({ text: badgeText });
  }
}

// Intercept Navigation to Protected Resources for Zero Trust Micro-Segmentation
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only intercept main frame navigation
  if (details.frameId !== 0) return;
  const url = details.url;

  // Check if target is a sensitive/protected resource
  const isProtectedResource = 
    url.includes("internal-portal.corp") ||
    url.includes("prod-database.corp") ||
    url.includes("hr-portal.corp") ||
    url.includes("mock_resources/prod_database.html") ||
    url.includes("mock_resources/internal_portal.html") ||
    url.includes("mock_resources/hr_portal.html");

  if (!isProtectedResource) return;

  const data = await chrome.storage.local.get(["ztna_state"]);
  if (!data.ztna_state || !data.ztna_state.config.enforcementActive) return;

  const state = data.ztna_state;
  const risk = state.risk;

  // Check Policy Engine rules (OPA logic simulation):
  // 1. High Risk (>= 70) -> Deny & Block
  // 2. Medium Risk (>= 35) -> Step-up MFA challenge
  // 3. Low Risk (< 35) -> Grant Access

  let targetName = "Corporate Resource";
  if (url.includes("database")) targetName = "Production Core Database (PostgreSQL Cluster)";
  else if (url.includes("hr")) targetName = "HR & Payroll Confidential System";
  else if (url.includes("internal")) targetName = "Internal Developer Gateway";

  if (risk.level === "HIGH") {
    // Quarantine & Redirect to Blocked page
    const blockedUrl = chrome.runtime.getURL("pages/blocked.html") + 
      `?resource=${encodeURIComponent(targetName)}&risk=${risk.score}&flags=${encodeURIComponent(risk.anomalyFlags.join("; "))}`;
    
    // Add audit log
    state.logs.push({
      id: "log-" + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      event: "ACCESS_DENIED_ANOMALY",
      actor: state.user.email,
      resource: targetName,
      decision: "BLOCKED",
      riskScore: risk.score,
      detail: `Blocked by ZTNA Policy. AI Anomaly Flags: ${risk.anomalyFlags.join(", ") || "Critical risk threshold exceeded"}`
    });
    await chrome.storage.local.set({ ztna_state: state });

    chrome.tabs.update(details.tabId, { url: blockedUrl });
  } else if (risk.level === "MEDIUM" && (!state.user.mfaVerified || Date.now() > state.user.mfaExpiresAt)) {
    // Step-up authentication needed
    const mfaUrl = chrome.runtime.getURL("pages/mfa_challenge.html") +
      `?target=${encodeURIComponent(url)}&resource=${encodeURIComponent(targetName)}&risk=${risk.score}`;
    
    state.logs.push({
      id: "log-" + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      event: "STEP_UP_CHALLENGE",
      actor: state.user.email,
      resource: targetName,
      decision: "STEP_UP_REQUIRED",
      riskScore: risk.score,
      detail: `Elevated risk (${risk.score}) triggered secondary FIDO2/TOTP challenge.`
    });
    await chrome.storage.local.set({ ztna_state: state });

    chrome.tabs.update(details.tabId, { url: mfaUrl });
  } else {
    // Access Granted
    state.logs.push({
      id: "log-" + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      event: "ACCESS_GRANTED",
      actor: state.user.email,
      resource: targetName,
      decision: "GRANTED",
      riskScore: risk.score,
      detail: `Access authorized. Posture compliant, Risk score (${risk.score}) within safe bounds.`
    });
    await chrome.storage.local.set({ ztna_state: state });
  }
});

// Message listener for popup & dashboard UI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    const data = await chrome.storage.local.get(["ztna_state"]);
    let state = data.ztna_state || JSON.parse(JSON.stringify(DEFAULT_STATE));

    if (message.action === "GET_STATE") {
      sendResponse({ status: "success", state });
      return;
    }

    if (message.action === "SET_SIMULATION_FLAG") {
      const { flag, value } = message;
      state.simulation[flag] = value;
      state.risk = computeRisk(state.simulation, state.posture);
      
      state.logs.push({
        id: "log-" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        event: "SIMULATION_UPDATE",
        actor: "Demo Engine",
        resource: "Context Feature Store",
        decision: value ? "ANOMALY_INJECTED" : "NORMALIZED",
        riskScore: state.risk.score,
        detail: `Feature '${flag}' toggled to ${value}. New composite risk score: ${state.risk.score}`
      });

      await chrome.storage.local.set({ ztna_state: state });
      updateBadge(state.risk);
      sendResponse({ status: "success", state });
      return;
    }

    if (message.action === "RUN_POSTURE_SCAN") {
      // Simulate real posture scan
      const isCompromised = state.simulation.compromisedDevice;
      state.posture = {
        os: "Windows 11 Enterprise (Build 22631.4317)",
        browser: "Chrome v128+ (Strict Sandbox Active)",
        screenLock: true,
        diskEncryption: !isCompromised,
        antivirus: !isCompromised,
        firewall: true,
        mTLSCert: isCompromised ? "REVOKED / UNTRUSTED" : "ICEM-ZTNA-CLIENT-CERT-RSA2048 [VALID]",
        complianceScore: isCompromised ? 42 : 98,
        lastScanned: new Date().toLocaleTimeString(),
        status: isCompromised ? "NON-COMPLIANT" : "COMPLIANT"
      };

      state.risk = computeRisk(state.simulation, state.posture);
      state.logs.push({
        id: "log-" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        event: "POSTURE_SCAN_COMPLETED",
        actor: "Device Engine",
        resource: "Client Posture Agent",
        decision: state.posture.status,
        riskScore: state.risk.score,
        detail: `Hardware & software health evaluation finished. Compliance: ${state.posture.complianceScore}%`
      });

      await chrome.storage.local.set({ ztna_state: state });
      updateBadge(state.risk);
      sendResponse({ status: "success", state });
      return;
    }

    if (message.action === "SOLVE_MFA") {
      state.user.mfaVerified = true;
      state.user.mfaExpiresAt = Date.now() + 1800000; // 30 mins
      state.logs.push({
        id: "log-" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        event: "STEP_UP_VERIFIED",
        actor: state.user.email,
        resource: "MFA Gateway",
        decision: "CHALLENGE_PASSED",
        riskScore: state.risk.score,
        detail: "Biometric / TOTP challenge successfully verified by user."
      });
      await chrome.storage.local.set({ ztna_state: state });
      sendResponse({ status: "success", state });
      return;
    }

    if (message.action === "SET_USER_ROLE") {
      state.user.role = message.role;
      state.logs.push({
        id: "log-" + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        event: "ROLE_CHANGE",
        actor: state.user.email,
        resource: "Keycloak RBAC",
        decision: "UPDATED",
        riskScore: state.risk.score,
        detail: `User role switched to '${message.role}'.`
      });
      await chrome.storage.local.set({ ztna_state: state });
      sendResponse({ status: "success", state });
      return;
    }

    if (message.action === "RESET_ALL") {
      const resetState = JSON.parse(JSON.stringify(DEFAULT_STATE));
      resetState.user.sessionId = "ztna-sess-" + Math.random().toString(36).substring(2, 9);
      await chrome.storage.local.set({ ztna_state: resetState });
      updateBadge(resetState.risk);
      sendResponse({ status: "success", state: resetState });
      return;
    }

    if (message.action === "CLEAR_LOGS") {
      state.logs = [];
      await chrome.storage.local.set({ ztna_state: state });
      sendResponse({ status: "success", state });
      return;
    }

    sendResponse({ status: "unknown_action" });
  })();

  return true; // Keep channel open for async response
});

// Update initial badge
chrome.storage.local.get(["ztna_state"]).then(res => {
  if (res.ztna_state) {
    updateBadge(res.ztna_state.risk);
  }
});
