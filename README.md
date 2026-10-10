# 🛡️ AI-Powered Zero Trust Network Access (ZTNA) — Chrome Extension

### **Secure • Adaptive • Intelligent**
**Indira College of Engineering & Management, Parandwadi, Pune**  
*(Autonomous Institute Affiliated to Savitribai Phule Pune University - SPPU)*  
**Department of Computer Engineering | BE Project Stage - I (A.Y. 2026-27)**  
- **Project ID:** 8
- **Project Guide:** Prof. Minal Patil
- **Team Members:**
  1. Juhi Singh
  2. Honey Singh
  3. Harsh Dhangekar
  4. Abhishek Pawar

---

## 📌 1. Overview & System Role
In the **AI-Powered ZTNA Architecture** (NIST SP 800-207 compliant), this Chrome Extension operates as the **Client Endpoint Agent (User Agent + mTLS)**.

Traditional network security models rely on one-time login credentials at the perimeter, which fail against insider threats, stolen session tokens, and lateral movement. This ZTNA Endpoint Extension enforces:
1. **Continuous Verification:** Telemetry and posture evaluation at request time and continuously during active sessions.
2. **Device Posture Collection:** OS integrity, BitLocker encryption status, Windows Defender EDR health, and mTLS client certificates.
3. **AI Risk Assessment:** Edge heuristic and real-time AI scoring (simulating Isolation Forest & Autoencoder models) calculating an adaptive risk score ($0 - 100$).
4. **Adaptive Access Control:** 
   - **Low Risk ($0 - 34$):** Access Granted.
   - **Medium Risk ($35 - 69$):** Step-Up MFA Challenge (FIDO2 / Biometric / TOTP).
   - **High Risk ($70 - 100$):** Access Denied & Session Quarantined.
5. **Micro-Segmentation Enforcement:** Intercepts sensitive internal resources (`prod-database`, `internal-portal`, `hr-portal`) and validates against Open Policy Agent (OPA) rules.
6. **Continuous Audit Stream:** Real-time telemetry logging with export capabilities for compliance and stage-1 project reports.

---

## 🚀 2. How to Install in Google Chrome

1. Open **Google Chrome**.
2. In the URL address bar, enter:
   ```
   chrome://extensions
   ```
3. In the top-right corner of the Extensions page, turn **ON** the **Developer mode** toggle.
4. Click the **Load unpacked** button in the top-left corner.
5. In the file picker dialog, select the extension folder:
   ```
   C:\Users\Abhishek Pawar\.gemini\antigravity\scratch\ztna-chrome-extension
   ```
6. Click **Select Folder**. The **AI-Powered ZTNA Agent** extension is now installed!
7. Click the **Extensions puzzle icon** in Chrome's top toolbar and click the **Pin** icon next to *AI-Powered ZTNA Agent* so it stays visible.

---

## 🎯 3. Live Demonstration Guide for Stage-I Viva & Evaluation

Use these 4 demonstration flows during project presentation to examiners and your project guide:

### **Scenario A: Normal Baseline Access (Green / Low Risk)**
1. Click the ZTNA extension icon in your Chrome toolbar.
2. Observe the **AI Risk Gauge** showing **14 / 100 (LOW RISK • ACCESS GRANTED)**.
3. Review the **Device Posture Check** card showing all 4 checks passed (OS, BitLocker, EDR, mTLS Cert).
4. Click **"Dev Portal"** under *Test ZTNA Resource*.
5. The resource loads immediately with a green security banner: *"ZTNA Authenticated — Access Authorized"*.

---

### **Scenario B: Adaptive Step-Up MFA Challenge (Amber / Medium Risk)**
1. Open the ZTNA extension popup.
2. In the **Demo Anomaly Injection** section, toggle **"Off-Hours Access Shift"** or **"Geo-Drift / Foreign Proxy"**.
3. Watch the Risk Score dynamically jump to **46 / 100 (ELEVATED RISK)**. The gauge turns amber.
4. Now click **"Prod DB (Strict)"** to simulate access to the production PostgreSQL cluster.
5. Instead of an immediate grant, the ZTNA engine intercepts the navigation and triggers the **Step-Up Authentication Challenge** (`pages/mfa_challenge.html`).
6. Click **"Verify Authenticator TOTP Code"** or **"Use Biometric / FIDO2 Passkey"**.
7. Once verified, you are redirected into the database console with elevated verification recorded in audit logs!

---

### **Scenario C: Critical Anomaly & Zero-Trust Quarantine (Red / High Risk)**
1. In the popup, click **"Security Dashboard"** (or click the extension options).
2. The full **ZTNA Security Command Center** opens in a dedicated tab.
3. Click the red button: **"🔥 Run Automated Attack Demo"**.
4. Watch the 3-step automated attack execution:
   - Step 1: Off-hours login injected.
   - Step 2: Geolocation drift to Frankfurt VPN node.
   - Step 3: High request burst + compromised device posture.
5. The Risk Gauge jumps to **88 / 100 (CRITICAL RISK — ACCESS QUARANTINED)**.
6. Try accessing any protected resource (or click **"Access Database"**).
7. The ZTNA Gateway immediately blocks the connection and displays the **Access Denied / Zero-Trust Quarantine Page** (`pages/blocked.html`) with incident ID and root-cause anomaly breakdown!

---

### **Scenario D: Audit Logs & Evidence Export**
1. Scroll down in the **Security Command Center**.
2. Observe the **Real-Time ZTNA Audit Log Stream** capturing every identity check, posture scan, anomaly injection, and OPA policy decision.
3. Use the filter search box to filter by `"BLOCKED"` or `"STEP_UP"`.
4. Click **"📥 Export Audit Report (JSON)"** to download the audit log file for your BE project report attachment.
5. Click **"🔄 Reset to Clean Baseline"** to reset all state back to 14 (trusted).

---

## 🔌 4. Optional: Running the Python Backend Bridge
If you want to demonstrate a live Python REST API communicating with the extension:
1. Open terminal or command prompt in:
   ```powershell
   cd "C:\Users\Abhishek Pawar\.gemini\antigravity\scratch\ztna-chrome-extension\backend_bridge"
   ```
2. Run the mock ZTNA control plane server:
   ```powershell
   python mock_ztna_server.py
   ```
3. The server starts at `http://127.0.0.1:8000` with endpoints for `/health`, `/api/v1/telemetry`, and `/api/v1/policy/evaluate`.

---

## 📁 5. Directory Structure
```
ztna-chrome-extension/
├── manifest.json              # Manifest V3 specification
├── README.md                  # Documentation and Stage-I presentation guide
├── icons/                     # Crisp cybersecurity icons (16, 32, 48, 128)
│   ├── generate_icons.py      # Python icon generation script
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── popup/                     # Toolbar popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── dashboard/                 # Fullscreen ZTNA Security Command Center
│   ├── dashboard.html
│   ├── dashboard.css
│   └── dashboard.js
├── background/                # Background service worker
│   └── background.js          # Posture, AI risk engine, alarms, webNavigation proxy
├── content/                   # Floating in-page security pill
│   ├── content.js
│   └── content.css
├── pages/                     # Enforcement policy interception pages
│   ├── blocked.html           # Zero-Trust Quarantine & Access Denied
│   └── mfa_challenge.html     # Step-Up MFA Challenge
├── mock_resources/            # Simulated protected corporate applications
│   ├── prod_database.html     # Production PostgreSQL cluster
│   ├── internal_portal.html   # Engineering microservices hub
│   └── hr_portal.html         # Confidential HR/payroll portal
└── backend_bridge/            # Python backend server
    └── mock_ztna_server.py
```

---

## 🎓 6. Alignment with BE Project Stage - I Poster
- **Workflow Steps (1 to 6):** Fully mirrored in the interactive stepper header in `dashboard.html`.
- **NIST SP 800-207 Principles:** Continuous verification, explicit validation, dynamic policy enforcement.
- **Technologies:** Python AI risk scoring heuristic, OPA Rego policy mapping, Keycloak SSO session context, mTLS device cert validation.
