#!/usr/bin/env python3
"""
AI-POWERED ZERO TRUST NETWORK ACCESS (ZTNA) - BACKEND BRIDGE
Indira College of Engineering & Management, Parandwadi, Pune
BE Project Stage - I (A.Y. 2026-27) | Team ID: 8
Members: Juhi Singh, Honey Singh, Harsh Dhangekar, Abhishek Pawar
Guide: Prof. Minal Patil

This lightweight server provides real-time REST API endpoints simulating:
1. AI Risk Engine (Isolation Forest / Anomaly Scorer)
2. Policy Engine (OPA Dynamic Rego Evaluation)
3. Telemetry Ingestion (Kafka / Redis Streams bridge)
"""

import json
from http.server import HTTPServer, BaseHTTPRequestHandler
import sys

PORT = 8000

class ZTNAHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-mTLS-Cert')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        if self.path == '/health' or self.path == '/api/v1/health':
            self._set_headers(200)
            payload = {
                "status": "HEALTHY",
                "service": "AI-Powered ZTNA Control Plane",
                "project_id": 8,
                "team": ["Juhi Singh", "Honey Singh", "Harsh Dhangekar", "Abhishek Pawar"],
                "components": {
                    "identity_provider": "Keycloak 24.0 (OAuth2/OIDC)",
                    "ai_risk_engine": "Python 3.12 (Isolation Forest + Autoencoder)",
                    "policy_engine": "Open Policy Agent (OPA v0.62)",
                    "feature_store": "Redis 7.2",
                    "data_plane": "Envoy Micro-segmentation Proxy"
                }
            }
            self.wfile.write(json.dumps(payload, indent=2).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            body = json.loads(post_data.decode('utf-8')) if post_data else {}
        except Exception:
            body = {}

        if self.path == '/api/v1/telemetry' or self.path == '/api/v1/risk/evaluate':
            # Extract features for AI Model
            time_anomaly = body.get('off_hours', False)
            geo_drift = body.get('geo_drift', False)
            posture_pass = body.get('posture_compliant', True)
            req_velocity = body.get('velocity_burst', False)

            # AI Risk Scoring Heuristic (Simulating Isolation Forest Decision Function)
            score = 12
            anomaly_flags = []

            if time_anomaly:
                score += 35
                anomaly_flags.append("Temporal Anomaly: Login outside baseline operational window")
            if geo_drift:
                score += 40
                anomaly_flags.append("Impossible Travel: Geolocation drift detected")
            if not posture_pass:
                score += 38
                anomaly_flags.append("Posture Violation: Antivirus / BitLocker degraded")
            if req_velocity:
                score += 30
                anomaly_flags.append("Velocity Anomaly: Request burst rate threshold exceeded")

            score = min(100, score)

            level = "LOW"
            decision = "GRANT"
            if score >= 70:
                level = "HIGH"
                decision = "DENY"
            elif score >= 35:
                level = "MEDIUM"
                decision = "STEP_UP_MFA"

            self._set_headers(200)
            response = {
                "risk_score": score,
                "risk_level": level,
                "policy_decision": decision,
                "confidence": 0.942,
                "model_version": "isolation_forest_v1.4_onnx",
                "anomaly_flags": anomaly_flags,
                "gateway_action": "ENFORCE"
            }
            self.wfile.write(json.dumps(response, indent=2).encode('utf-8'))
            return

        elif self.path == '/api/v1/policy/evaluate':
            # Simulates OPA Policy Evaluation
            user_role = body.get('role', 'Developer')
            target_resource = body.get('resource', 'internal-portal')
            risk_score = body.get('risk_score', 14)

            allow = True
            reason = "Access authorized by default developer policy"

            if target_resource == 'prod-database' and risk_score >= 35:
                allow = False
                reason = "OPA Rule: prod_db requires risk < 35"
            elif target_resource == 'hr-portal' and user_role not in ['Employee', 'Security Admin']:
                allow = False
                reason = "OPA Rule: HR portal restricted to Employee / Admin"

            self._set_headers(200)
            self.wfile.write(json.dumps({
                "result": {
                    "allow": allow,
                    "reason": reason,
                    "evaluated_at": "control_plane_opa_worker_1"
                }
            }, indent=2).encode('utf-8'))
            return

        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

def run_server():
    server = HTTPServer(('127.0.0.1', PORT), ZTNAHandler)
    print(f"============================================================")
    print(f"  AI-POWERED ZTNA CONTROL PLANE & AI ENGINE BRIDGE")
    print(f"  Project ID: 8 | Indira College of Engineering & Management")
    print(f"============================================================")
    print(f"Server running at http://127.0.0.1:{PORT}")
    print(f"Endpoints available:")
    print(f"  - GET  /health")
    print(f"  - POST /api/v1/telemetry")
    print(f"  - POST /api/v1/policy/evaluate")
    print(f"Ready for Chrome Extension requests. Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping ZTNA server.")
        server.server_close()

if __name__ == '__main__':
    run_server()
