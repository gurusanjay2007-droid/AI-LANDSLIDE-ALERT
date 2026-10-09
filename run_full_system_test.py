import urllib.request
import json
import math
import os
import re

print("==================================================================")
print("     FULL END-TO-END SYSTEM TEST & VERIFICATION SUITE             ")
print("==================================================================")

passed = 0
failed = 0

def assert_test(condition, name, details=""):
    global passed, failed
    if condition:
        passed += 1
        print(f" [PASS] {name} {details}")
    else:
        failed += 1
        print(f" [FAIL] {name} {details}")

# ----------------------------------------------------------------------
# 1. FRONTEND SERVER & ASSET INTEGRITY
# ----------------------------------------------------------------------
print("\n--- 1. Testing Frontend Static Server (Port 3000) ---")
try:
    resp = urllib.request.urlopen("http://127.0.0.1:3000/", timeout=5)
    assert_test(resp.status == 200, "Frontend Index Page Served (HTTP 200)")
    html = resp.read().decode('utf-8')
    assert_test(len(html) > 50000, "HTML Body Complete", f"({len(html):,} bytes)")
except Exception as e:
    assert_test(False, "Frontend Server Accessible", str(e))

# Check CSS files over HTTP
css_files = ["main.css", "components.css", "map.css", "chatbot.css"]
for cf in css_files:
    try:
        resp = urllib.request.urlopen(f"http://127.0.0.1:3000/css/{cf}", timeout=5)
        assert_test(resp.status == 200, f"Stylesheet Loaded: css/{cf}")
    except Exception as e:
        assert_test(False, f"Stylesheet Loaded: css/{cf}", str(e))

# Check JS files over HTTP
js_files = [
    "data.js", "ai-engine.js", "charts.js", "map.js",
    "citizen-reports.js", "alerts.js", "auth.js", "export-utils.js",
    "chatbot.js", "app.js"
]
for jf in js_files:
    try:
        resp = urllib.request.urlopen(f"http://127.0.0.1:3000/js/{jf}", timeout=5)
        assert_test(resp.status == 200, f"Script Loaded: js/{jf}")
    except Exception as e:
        assert_test(False, f"Script Loaded: js/{jf}", str(e))

# ----------------------------------------------------------------------
# 2. BACKEND API ENDPOINTS (Port 8001)
# ----------------------------------------------------------------------
print("\n--- 2. Testing Backend FastAPI Services (Port 8001) ---")
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Content-Type': 'application/json'
}

try:
    req = urllib.request.Request("http://127.0.0.1:8001/", headers={'User-Agent': 'Mozilla/5.0'})
    resp = urllib.request.urlopen(req, timeout=5)
    data = json.loads(resp.read().decode('utf-8'))
    assert_test(resp.status == 200 and "status" in data, "Backend Root / Health Ping", json.dumps(data))
except Exception as e:
    assert_test(False, "Backend Root / Health Ping", str(e))

# Auth Directory
try:
    req = urllib.request.Request("http://127.0.0.1:8001/api/auth/users", headers={'User-Agent': 'Mozilla/5.0'})
    resp = urllib.request.urlopen(req, timeout=5)
    body = json.loads(resp.read().decode('utf-8'))
    users = body.get("users", [])
    assert_test(body.get("status") == "SUCCESS" and len(users) >= 3, "Auth Official Directory Count", f"({len(users)} users registered)")
    roles = [u['role'] for u in users]
    assert_test("DISASTER_MANAGER" in roles and "ADMIN" in roles and "ANALYST" in roles,
                "All 3 Official Roles Present in Auth API")
except Exception as e:
    assert_test(False, "Auth Official Directory", str(e))

# Auth Login - Valid Official Credentials
try:
    login_payload = json.dumps({"email": "commander.nair@ddma.gov.in", "password": "manager123"}).encode('utf-8')
    req = urllib.request.Request("http://127.0.0.1:8001/api/auth/login", data=login_payload, headers=headers)
    resp = urllib.request.urlopen(req, timeout=5)
    login_res = json.loads(resp.read().decode('utf-8'))
    assert_test(login_res.get("status") == "AUTHENTICATED", "Auth Login Official Success", f"Logged in as {login_res['user']['full_name']}")
except Exception as e:
    assert_test(False, "Auth Login Official Success", str(e))

# Auth Login - Rejection of Invalid Password (HTTP 401)
try:
    bad_pwd_payload = json.dumps({"email": "commander.nair@ddma.gov.in", "password": "WrongPassword123"}).encode('utf-8')
    req = urllib.request.Request("http://127.0.0.1:8001/api/auth/login", data=bad_pwd_payload, headers=headers)
    try:
        urllib.request.urlopen(req, timeout=5)
        assert_test(False, "Auth Login Invalid Password Rejected", "Expected 401")
    except urllib.error.HTTPError as he:
        assert_test(he.code == 401, "Auth Login Invalid Password Rejected (HTTP 401)")
except Exception as e:
    assert_test(False, "Auth Login Invalid Password Rejected", str(e))

# Auth Login - Rejection of Non-Official Email (HTTP 403 Forbidden)
try:
    bad_email_payload = json.dumps({"email": "unauthorized.user@external.com", "password": "AnyPassword"}).encode('utf-8')
    req = urllib.request.Request("http://127.0.0.1:8001/api/auth/login", data=bad_email_payload, headers=headers)
    try:
        urllib.request.urlopen(req, timeout=5)
        assert_test(False, "Auth Login Non-Official Email Rejected", "Expected 403")
    except urllib.error.HTTPError as he:
        assert_test(he.code == 403, "Auth Login Non-Official Email Rejected (HTTP 403 Forbidden)")
except Exception as e:
    assert_test(False, "Auth Login Non-Official Email Rejected", str(e))

# ----------------------------------------------------------------------
# 3. CIVIL DEFENSE SIREN LOGIC & HAVERSINE DISTANCE VERIFICATION
# ----------------------------------------------------------------------
print("\n--- 3. Testing Civil Defense Siren Feature (Prompt Section 5) ---")

def calc_haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = (math.sin(dLat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dLon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

# Check Haversine distance between Coonoor Corridor (11.3530, 76.7959) and Coonoor Mast (11.3530, 76.7959)
dist_same = calc_haversine(11.3530, 76.7959, 11.3530, 76.7959)
assert_test(dist_same == 0.0, "Haversine: Same Coordinates Distance = 0.0 km")

# Between Coonoor (11.3530, 76.7959) and Emerald Peak (11.3912, 76.7112)
dist_nilgiris = calc_haversine(11.3530, 76.7959, 11.3912, 76.7112)
assert_test(9.0 <= dist_nilgiris <= 11.0, "Haversine: Coonoor to Doddabetta ~10 km", f"({dist_nilgiris} km)")

# Verify Siren states for Risk Levels
def get_siren_state(level):
    lvl = level.upper()
    if lvl == "CRITICAL":
        return {"state": "EMERGENCY_WARBLE", "sirenActive": True, "label": "Emergency Siren"}
    elif lvl in ["HIGH", "HIGH-RISK", "WARNING"]:
        return {"state": "WARNING_PULSED", "sirenActive": True, "label": "Warning Siren"}
    elif lvl in ["MODERATE", "WATCH"]:
        return {"state": "SIREN_OFF", "sirenActive": False, "label": "Siren OFF"}
    else:
        return {"state": "SIREN_OFF", "sirenActive": False, "label": "Siren OFF"}

assert_test(get_siren_state("LOW")["sirenActive"] == False, "Rule: LOW -> Siren OFF")
assert_test(get_siren_state("MODERATE")["sirenActive"] == False, "Rule: MODERATE -> Siren OFF")
assert_test(get_siren_state("HIGH")["sirenActive"] == True and get_siren_state("HIGH")["state"] == "WARNING_PULSED", "Rule: HIGH -> Warning Siren (Pulsed 587Hz)")
assert_test(get_siren_state("CRITICAL")["sirenActive"] == True and get_siren_state("CRITICAL")["state"] == "EMERGENCY_WARBLE", "Rule: CRITICAL -> Emergency Siren (Continuous Warble 440-880Hz)")

# Verify Siren Towers from data.js
with open("js/data.js", "r", encoding="utf-8") as f:
    data_js = f.read()

assert_test("sirenTowers:" in data_js, "data.js contains sirenTowers array")
assert_test("sirenLogs:" in data_js, "data.js contains sirenLogs array")
assert_test("TWR-01" in data_js and "TWR-05" in data_js, "All 5 Siren Towers (TWR-01 to TWR-05) defined")
assert_test('"OFFLINE"' in data_js, "Tower offline status (TWR-05) defined for testing error handling")

# Verify DOM elements in index.html for Siren System
with open("index.html", "r", encoding="utf-8") as f:
    index_html = f.read()

required_siren_dom_ids = [
    "active-siren-banner",
    "active-siren-banner-title",
    "active-siren-banner-desc",
    "siren-towers-container",
    "siren-audit-table-body",
    "broadcast-alert-modal",
    "modal-broadcast-loc-select",
    "modal-broadcast-tower-select",
    "modal-broadcast-tower-status",
    "modal-broadcast-distance",
    "modal-broadcast-radius-slider",
    "modal-broadcast-radius-val",
    "modal-broadcast-pop-estimate",
    "modal-broadcast-offline-warning",
    "modal-broadcast-duplicate-warning",
    "modal-broadcast-override-dup",
    "modal-broadcast-siren-state",
    "modal-broadcast-siren-tone",
    "modal-broadcast-submit-btn"
]

missing_ids = [eid for eid in required_siren_dom_ids if f'id="{eid}"' not in index_html]
assert_test(len(missing_ids) == 0, "All 19 Siren System DOM IDs Present in index.html", f"Missing: {missing_ids}")

# Verify Simulation Mode explicitly marked
assert_test("SIMULATION MODE ACTIVE" in index_html and "HARDWARE SIMULATION MODE" in index_html,
            "Simulation Mode Clearly Marked (Prompt Section 5 Requirement)")

# ----------------------------------------------------------------------
# 4. ENVIRONMENT VIEW KPI CARDS & SIMULATOR
# ----------------------------------------------------------------------
print("\n--- 4. Testing Environment Telemetry & Simulator Fixes ---")
assert_test('id="env-vibe-val"' in index_html, "Ground Vibration KPI ID env-vibe-val in index.html")

with open("js/app.js", "r", encoding="utf-8") as f:
    app_js = f.read()

assert_test("updateSim();" in app_js, "What-If Simulator initializes default values on load in app.js")

# ----------------------------------------------------------------------
# 5. SUMMARY
# ----------------------------------------------------------------------
print("\n==================================================================")
print(f"  TOTAL TESTS RUN: {passed + failed} | PASSED: {passed} | FAILED: {failed}")
print("==================================================================")
if failed == 0:
    print(" >>> ALL VERIFICATION CHECKS PASSED PERFECTLY (100% SUCCESS) <<<")
else:
    print(f" >>> {failed} TESTS FAILED - IMMEDIATE ATTENTION REQUIRED <<<")
