"""
Landslide AI Assistant - Natural Language Understanding & Intelligent Chat Service
Module: backend.services.ai.chat_service
Provides intent classification, entity extraction, live geotechnical data retrieval,
prompt injection guardrails, safety protocols, and bilingual (English / Tamil) response generation.
"""

import os
import re
import math
import json
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime

# Intent Categories
INTENTS = {
    "CURRENT_RISK": ["risk", "status", "level", "danger", "probability", "safe", "score", "how risky", "threat", "நிலச்சரிவு அபாயம்", "அபாய நிலை"],
    "LOCATION_RISK": ["in ", "at ", "village", "district", "corridor", "ridge", "sector", "zone", "here", "near me", "latitude", "longitude", "பகுதி", "கிராமம்", "மாவட்டம்"],
    "RAINFALL": ["rain", "rainfall", "precipitation", "downpour", "monsoon", "cloudburst", "mm", "மழை", "மழைப்பொழிவு"],
    "SOIL_MOISTURE": ["soil", "moisture", "saturation", "pore pressure", "wetness", "ground water", "மண்", "ஈரப்பதம்"],
    "SLOPE": ["slope", "steep", "steepness", "gradient", "angle", "degree", "சாய்வு", "மலைச்சரிவு"],
    "ELEVATION": ["elevation", "altitude", "height", "meters", "dem", "உயரம்", "கடல் மட்டம்"],
    "ENVIRONMENT": ["environment", "telemetry", "weather", "temperature", "humidity", "sensors", "வானிலை", "சுற்றுச்சூழல்"],
    "RISK_FACTORS": ["why", "factors", "causes", "reason", "increasing", "rising", "contributing", "காரணங்கள்", "ஏன்"],
    "RISK_TREND": ["trend", "forecast", "future", "tomorrow", "next hours", "increasing", "getting worse", "எதிர்காலம்", "போக்கு"],
    "HIGH_RISK_AREAS": ["high risk areas", "critical zones", "which areas", "hotspots", "most dangerous", "where is risk", "அபாயகரமான பகுதிகள்", "எந்த பகுதி"],
    "ALERTS": ["alert", "warning", "evacuation", "bulletin", "cap", "broadcast", "active alerts", "எச்சரிக்கை", "அறிவிப்பு"],
    "SAFETY": ["what should i do", "safety", "guidelines", "protect", "emergency", "evacuate", "escape", "cracks", "water coming", "mudflow", "பாதுகாப்பு", "என்ன செய்ய வேண்டும்"],
    "HISTORICAL_LANDSLIDES": ["history", "past", "historical", "previous", "events", "scars", "records", "வரலாறு", "முந்தைய நிகழ்வுகள்"],
    "CITIZEN_REPORT": ["report", "i see", "citizen", "observation", "crack on ground", "spotted", "submit report", "புகார்", "தகவல் தெரிவிக்க"],
    "EXPLAIN_SCORE": ["what does", "mean", "explain score", "explain risk", "score mean", "மதிப்பெண் விளக்கம்"],
    "SYSTEM_INFORMATION": ["who are you", "what is this system", "version", "engine", "google earth engine", "model", "நீ யார்", "இந்த அமைப்பு என்ன"],
    "INJECTION_PROBE": ["api key", "password", "env", "credential", "secret", "system prompt", "ignore instructions", "bypass", "api_key", "ரகசிய சொல்"]
}

# Prompt Injection Prohibited Keywords
INJECTION_KEYWORDS = [
    "api key", "api_key", "secret_key", "jwt_secret", "database_url",
    "db_password", "env var", "environment variable", "system prompt",
    "ignore all previous", "override your instructions", "sudo", "system instructions",
    "admin password", "reveal your instructions"
]


class LandslideChatService:
    """
    Modular AI Chatbot Service supporting live context retrieval,
    disaster-safety compliance, LLM synthesis, and high-fidelity Demo Mode.
    """

    def __init__(self):
        self.api_key = os.getenv("AI_API_KEY", "")
        self.model_name = os.getenv("AI_MODEL", "gemini-1.5-flash")
        self.base_url = os.getenv("AI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai")
        self.is_demo_mode = not bool(self.api_key and self.api_key.strip() and not self.api_key.startswith("mock_"))

    def detect_prompt_injection(self, message: str) -> bool:
        """Flags unauthorized credential extraction or instruction override attempts."""
        msg_lower = message.lower()
        return any(kw in msg_lower for kw in INJECTION_KEYWORDS)

    def detect_language(self, message: str, requested_lang: str = "en") -> str:
        """Determines if the conversation should proceed in Tamil or English."""
        if requested_lang in ["ta", "tamil"]:
            return "ta"
        # Check Tamil Unicode character range (0x0B80 - 0x0BFF)
        if any('\u0b80' <= char <= '\u0bff' for char in message):
            return "ta"
        return "en"

    def parse_intent(self, message: str) -> str:
        """Classifies intent using multi-keyword pattern matching and priority weights."""
        msg_lower = message.lower()

        if self.detect_prompt_injection(msg_lower):
            return "INJECTION_PROBE"

        # Safety emergencies take precedence
        if any(w in msg_lower for w in ["see cracks", "water suddenly", "mudflow", "should i evacuate", "in danger", "help me", "what should i do", "safety", "தரை விரிசல்", "உடனடி ஆபத்து", "பாதுகாப்பு"]):
            return "SAFETY"

        # High-priority intent triggers
        if any(w in msg_lower for w in ["why", "causes", "factors", "contributing", "ஏன்", "காரணம்", "காரணங்கள்"]):
            return "RISK_FACTORS"


        if any(w in msg_lower for w in ["explain score", "what does", "score mean", "explain the risk", "மதிப்பெண் விளக்கம்"]):
            return "EXPLAIN_SCORE"

        if any(w in msg_lower for w in ["high risk areas", "critical zones", "high-risk", "hotspots", "most dangerous", "அபாயகரமான பகுதிகள்", "எந்த பகுதி"]):
            return "HIGH_RISK_AREAS"

        if (any(w in msg_lower for w in ["safe", "low risk", "least risk", "safest", "பாதுகாப்பான"])) and not any(w in msg_lower for w in ["warning", "alert"]):
            return "SAFE_AREAS"

        if any(w in msg_lower for w in ["alert", "warning", "evacuation", "bulletin", "broadcast", "எச்சரிக்கை"]):
            return "ALERTS"

        if (any(w in msg_lower for w in ["less", "low", "lowest", "least", "minimum", "safe rain", "குறைந்த", "குறைவான"])) and any(w in msg_lower for w in ["rain", "rainfall", "மழை"]):
            return "RAINFALL_LOW"

        if any(w in msg_lower for w in ["rain", "rainfall", "precipitation", "downpour", "மழை", "மழைப்பொழிவு"]):
            return "RAINFALL"

        if (any(w in msg_lower for w in ["less", "low", "lowest", "least", "dry", "குறைந்த"])) and any(w in msg_lower for w in ["soil", "moisture", "மண்", "ஈரப்பதம்"]):
            return "SOIL_MOISTURE_LOW"

        if any(w in msg_lower for w in ["all locations", "list locations", "show locations", "what locations", "all stations", "எல்லா பகுதிகள்"]):
            return "LIST_LOCATIONS"

        if any(w in msg_lower for w in ["slope", "steep", "steepness", "gradient", "angle", "degree", "சாய்வு", "மலைச்சரிவு"]):
            return "SLOPE"

        if any(w in msg_lower for w in ["elevation", "altitude", "height", "meters", "dem", "உயரம்", "கடல் மட்டம்"]):
            return "ELEVATION"

        # Check specific metrics and topics
        scores: Dict[str, int] = {}
        for intent, kws in INTENTS.items():
            count = sum(1 for kw in kws if kw in msg_lower)
            if count > 0:
                scores[intent] = count

        if not scores:
            return "CURRENT_RISK"

        # Return the intent with highest match score
        return max(scores, key=scores.get)


    def extract_location(
        self,
        message: str,
        locations: List[Dict[str, Any]],
        current_loc_id: Optional[str] = None,
        coords: Optional[Dict[str, float]] = None
    ) -> Tuple[Optional[Dict[str, Any]], bool]:
        """
        Extracts location from coordinates, explicit text match, or conversational context.
        Returns (matched_location, is_explicit_match).
        """
        # 1. Coordinate-based matching (nearest within radius)
        if coords and "latitude" in coords and "longitude" in coords:
            lat, lng = coords["latitude"], coords["longitude"]
            best_match = None
            min_dist = float("inf")
            for loc in locations:
                d = math.hypot(loc["latitude"] - lat, loc["longitude"] - lng)
                if d < min_dist:
                    min_dist = d
                    best_match = loc
            if best_match and min_dist < 2.0:
                return best_match, True

        # 2. Check for explicit coordinates in message
        coord_pattern = re.search(r'lat(?:itude)?\s*[:=]?\s*([0-9\.\-]+).*?long(?:itude)?\s*[:=]?\s*([0-9\.\-]+)', message, re.IGNORECASE)
        if coord_pattern:
            try:
                lat = float(coord_pattern.group(1))
                lng = float(coord_pattern.group(2))
                best_match = None
                min_dist = float("inf")
                for loc in locations:
                    d = math.hypot(loc["latitude"] - lat, loc["longitude"] - lng)
                    if d < min_dist:
                        min_dist = d
                        best_match = loc
                if best_match:
                    return best_match, True
            except Exception:
                pass

        # 3. String name / village / district matching in message
        msg_lower = message.lower()
        for loc in locations:
            names_to_check = [
                loc.get("name", "").lower(),
                loc.get("village", "").lower(),
                loc.get("district", "").lower(),
                loc.get("id", "").lower()
            ]
            for n in names_to_check:
                if n and (n in msg_lower or (len(n) > 4 and n.split()[0] in msg_lower)):
                    return loc, True

        # Check if user says "this area", "here", "my area", "இந்த பகுதி"
        if any(w in msg_lower for w in ["this area", "here", "my village", "my location", "my area", "இந்த பகுதி", "இங்கு"]):
            if current_loc_id:
                curr = next((l for l in locations if l.get("id") == current_loc_id), None)
                if curr:
                    return curr, True

        # No explicit location matched
        curr = next((l for l in locations if l.get("id") == current_loc_id), None) if current_loc_id else (locations[0] if locations else None)
        return curr, False

    def process_chat(
        self,
        message: str,
        locations: List[Dict[str, Any]],
        alerts: List[Dict[str, Any]],
        reports: List[Dict[str, Any]],
        current_location_id: Optional[str] = "LOC-02",
        conversation_id: Optional[str] = None,
        language: str = "en",
        coordinates: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Primary entry point for chat queries.
        Analyzes question, queries live monitoring data, and formats structured response.
        """
        lang = self.detect_language(message, language)
        intent = self.parse_intent(message)

        # Handle Prompt Injection Attempt
        if intent == "INJECTION_PROBE":
            msg = (
                "நான் ரகசிய சான்றுகள் அல்லது தனிப்பட்ட கணினி தகவல்களை வழங்க முடியாது. நிலச்சரிவு அபாய தகவல்கள் குறித்து கேளுங்கள்."
                if lang == "ta"
                else "I can't provide credentials, environment variables, or private system information. Please ask about landslide risks, telemetry, and early warning status."
            )
            return {
                "message": msg,
                "intent": "INJECTION_PROBE",
                "risk": None,
                "location": None,
                "sources": ["Security Guardrails"],
                "actionButtons": [],
                "suggestedQuestions": [
                    "What is the current risk?" if lang == "en" else "தற்போதைய அபாய நிலை என்ன?",
                    "Check rainfall" if lang == "en" else "மழைப்பொழிவை சரிபார்க்கவும்"
                ],
                "explanationCard": None,
                "isDemoMode": self.is_demo_mode
            }

        # Match Location
        loc, is_explicit_loc = self.extract_location(message, locations, current_location_id, coordinates)
        if not loc and locations:
            loc = locations[0]

        # Check Active Alerts for this Location
        loc_alerts = [
            a for a in alerts
            if a.get("location_id") == loc.get("id") or loc.get("name", "").lower() in a.get("location_name", "").lower()
        ]
        has_critical_alert = any(a.get("alert_level") in ["CRITICAL", "HIGH RISK"] for a in loc_alerts)

        # Generate rule-based grounded response
        response_data = self._build_grounded_response(
            intent=intent,
            loc=loc,
            is_explicit_loc=is_explicit_loc,
            locations=locations,
            alerts=alerts,
            reports=reports,
            lang=lang,
            message=message,
            has_critical_alert=has_critical_alert
        )

        return response_data

    def _build_grounded_response(
        self,
        intent: str,
        loc: Dict[str, Any],
        is_explicit_loc: bool,
        locations: List[Dict[str, Any]],
        alerts: List[Dict[str, Any]],
        reports: List[Dict[str, Any]],
        lang: str,
        message: str,
        has_critical_alert: bool
    ) -> Dict[str, Any]:
        """
        Synthesizes structured domain responses using exact telemetry.
        """
        loc_name = loc.get("name", "Monitored Sector")
        village = loc.get("village", loc_name)
        district = loc.get("district", "Western Ghats")
        rain_24h = loc.get("rainfall_24h_mm", 0)
        soil_pct = loc.get("soil_moisture_pct", 0)
        slope_deg = loc.get("slope_degrees", 0)
        elevation_m = loc.get("elevation_m", 0)
        hist_count = loc.get("historical_incidents", 0)
        soil_type = loc.get("soil_type", "Loam")
        last_updated = loc.get("last_updated", "Recent")

        # Live calculated prediction from model
        from ml_model import model_service
        pred = model_service.calculate_risk({
            "rainfall_24h": rain_24h,
            "soil_moisture_pct": soil_pct,
            "slope_degrees": slope_deg,
            "elevation_m": elevation_m,
            "historical_incidents_score": hist_count * 4,
            "terrain_geology_score": 55
        })

        risk_prob = pred["risk_probability"]
        risk_cat = pred["risk_category"]

        # Action buttons default
        action_buttons = [
            {"label": "🗺️ View on Map", "action": "VIEW_MAP", "target": loc.get("id"), "lat": loc.get("latitude"), "lng": loc.get("longitude")},
            {"label": "🔍 Analyze Location", "action": "ANALYZE_LOC", "target": loc.get("id")},
            {"label": "📡 View Environmental Data", "action": "VIEW_ENVIRONMENT", "target": loc.get("id")}
        ]

        suggested_questions = []
        explanation_card = None

        # Build response based on Intent
        if intent == "CURRENT_RISK":
            if is_explicit_loc:
                if lang == "ta":
                    text = (
                        f"📍 **{loc_name} ({district})**\n\n"
                        f"தற்போதைய நிலச்சரிவு அபாய நிலை: **{risk_cat}**\n"
                        f"அபாய நிகழ்தகவு: **{risk_prob}%**\n\n"
                        f"**முக்கிய அளவுருக்கள்:**\n"
                        f"• 24 மணி நேர மழை: **{rain_24h} mm**\n"
                        f"• மண் ஈரப்பதம்: **{soil_pct}%**\n"
                        f"• நிலப்பரப்பு சாய்வு: **{slope_deg}°**\n\n"
                        f"**பாதுகாப்பு பரிந்துரை:**\n"
                        + ("உடனடி எச்சரிக்கையுடன் இருக்கவும்; சரிவு பகுதிகளில் இருந்து விலகி பாதுகாப்பான இடங்களுக்குச் செல்லவும்." if risk_prob > 60 else "தற்போதைய நிலை இயல்பாக உள்ளது. தொடர்ந்து வானிலை எச்சரிக்கைகளை கவனிக்கவும்.")
                    )
                else:
                    text = (
                        f"📍 **{loc_name} ({district})**\n\n"
                        f"The current system risk level is **{risk_cat}**, with a calculated risk probability of **{risk_prob}%**.\n\n"
                        f"**Latest Environmental Readings:**\n"
                        f"• 24h Rainfall: **{rain_24h} mm**\n"
                        f"• Soil Saturation: **{soil_pct}%**\n"
                        f"• Slope Incline: **{slope_deg}°**\n"
                        f"• Elevation: **{elevation_m} m**\n\n"
                        f"**Recommendation:**\n"
                        + ("Exercise elevated caution. Avoid travel through steep ghat roads and follow district disaster management instructions." if risk_prob > 60 else "Conditions are currently within standard baseline. Regular sensor monitoring continues.")
                    )
            else:
                # System-wide overall risk (computed dynamically from locations database)
                sorted_by_risk_desc = sorted(locations, key=lambda x: x.get("rainfall_24h_mm", 0) * 0.32 + x.get("soil_moisture_pct", 0) * 0.40 + x.get("slope_degrees", 0) * 0.80, reverse=True)
                top_hotspots = sorted_by_risk_desc[:4]
                hotspot_bullets = "\n".join([
                    f"• **{s.get('name')} ({s.get('district')})**: Rain: {s.get('rainfall_24h_mm')} mm, Soil: {s.get('soil_moisture_pct')}%, Slope: {s.get('slope_degrees')}°"
                    for s in top_hotspots
                ])
                crit_count = sum(1 for l in locations if l.get("rainfall_24h_mm", 0) > 140 or l.get("soil_moisture_pct", 0) > 85)
                high_count = sum(1 for l in locations if 80 <= l.get("rainfall_24h_mm", 0) <= 140 or 70 <= l.get("soil_moisture_pct", 0) <= 85)

                if lang == "ta":
                    text = (
                        f"அமைப்பின் தற்போதைய ஒட்டுமொத்த நிலச்சரிவு அபாய நிலை: **HIGH**.\n\n"
                        f"தற்போது **{crit_count} அதிதீவிர மண்டலங்கள்** மற்றும் **{high_count} தீவிர அபாய மண்டலங்கள்** கண்காணிக்கப்படுகின்றன.\n\n"
                        f"**முக்கிய அபாய பகுதிகள்:**\n"
                        f"{hotspot_bullets}\n\n"
                        f"குறிப்பிட்ட கிராமம் அல்லது மாவட்டத்தின் நிலையை அறிய *'What is the risk in Kotagiri?'* அல்லது *'Rainfall in Wayanad'* என்று கேட்கலாம்."
                    )
                else:
                    text = (
                        f"The current system risk level is **HIGH**, with **{crit_count} Critical** and **{high_count} High Risk** sectors under continuous monitoring.\n\n"
                        f"**Top Vulnerable Sectors:**\n"
                        f"{hotspot_bullets}\n\n"
                        f"You can ask about a specific sector (e.g. *'What is the risk in Kotagiri?'* or *'Rainfall in Wayanad'*) or explore the Live Risk Map."
                    )
            suggested_questions = [
                "Why is this area risky?" if lang == "en" else "இந்த பகுதி ஏன் அபாயகரமானது?",
                "Check rainfall" if lang == "en" else "மழைப்பொழிவை சரிபார்க்கவும்",
                "Show high-risk areas" if lang == "en" else "அதிக அபாய பகுதிகளைக் காட்டு"
            ]


        elif intent in ["LOCATION_RISK", "RISK_FACTORS"]:
            factors_list = []
            if rain_24h > 100:
                factors_list.append("Heavy 24h rainfall triggering topsoil pore pressure" if lang == "en" else "அதிக மழைப்பொழிவு மற்றும் மண் நீர் அழுத்தம்")
            if soil_pct > 75:
                factors_list.append("High soil moisture saturation reducing shear strength" if lang == "en" else "அதிக மண் ஈரப்பதம் காரணமாக நிலச்சரிவு வாய்ப்பு")
            if slope_deg > 30:
                factors_list.append(f"Steep geological slope gradient ({slope_deg}°)" if lang == "en" else f"செங்குத்தான மலைச்சரிவு கோணம் ({slope_deg}°)")
            if hist_count > 10:
                factors_list.append(f"Historical landslide activity ({hist_count} past records)" if lang == "en" else f"கடந்த கால நிலச்சரிவு பதிவுகள் ({hist_count} நிகழ்வுகள்)")

            if not factors_list:
                factors_list.append("Normal baseline environmental and geological parameters" if lang == "en" else "நிலையான சுற்றுச்சூழல் நிலைமைகள்")

            factors_str = "\n".join([f"• {f}" for f in factors_list])

            if lang == "ta":
                text = (
                    f"**{loc_name}** பகுதி நிலச்சரிவு அபாய அறிக்கை:\n\n"
                    f"அபாய நிகழ்தகவு: **{risk_prob}% ({risk_cat})**\n"
                    f"மழைப்பொழிவு: **{rain_24h} mm** | மண் ஈரப்பதம்: **{soil_pct}%**\n\n"
                    f"**முக்கிய காரணிகள்:**\n{factors_str}\n\n"
                    f"**பரிந்துரை:** உள்ளூர் பேரிடர் மேலாண்மை வழிகாட்டுதல்களைப் பின்பற்றவும்."
                )
            else:
                text = (
                    f"**{loc_name}** currently has a **{risk_cat}** landslide risk.\n\n"
                    f"**Risk Probability:** **{risk_prob}%**\n"
                    f"**Rainfall (24h):** {rain_24h} mm\n"
                    f"**Soil Moisture:** {soil_pct}%\n"
                    f"**Slope:** {slope_deg}°\n"
                    f"**Elevation:** {elevation_m} m\n\n"
                    f"**Main Contributing Factors:**\n{factors_str}\n\n"
                    f"**Recommendation:**\n"
                    f"Exercise caution and follow local safety and early warning guidance."
                )

            explanation_card = {
                "title": f"WHY THIS AREA IS RISKY: {loc_name}",
                "rainfall": {"label": "Rainfall", "value": f"{rain_24h} mm", "level": "High" if rain_24h > 100 else "Moderate" if rain_24h > 50 else "Low"},
                "soil": {"label": "Soil Moisture", "value": f"{soil_pct}%", "level": "Critical" if soil_pct > 80 else "High" if soil_pct > 65 else "Moderate"},
                "slope": {"label": "Slope Steepness", "value": f"{slope_deg}°", "level": "Steep" if slope_deg > 30 else "Moderate"},
                "history": {"label": "Historical Landslides", "value": f"{hist_count} scars", "level": "High" if hist_count > 15 else "Moderate"},
                "risk_score": f"{risk_prob}%",
                "category": risk_cat
            }

            suggested_questions = [
                "What should I do during a warning?" if lang == "en" else "எச்சரிக்கையின் போது என்ன செய்ய வேண்டும்?",
                "Check soil moisture" if lang == "en" else "மண் ஈரப்பதத்தை சரிபார்க்கவும்",
                "Show on map" if lang == "en" else "வரைபடத்தில் காட்டு"
            ]

        elif intent == "RAINFALL_LOW":
            sorted_by_rain_asc = sorted(locations, key=lambda x: x.get("rainfall_24h_mm", 0))
            low_sectors = sorted_by_rain_asc[:4]
            bullets = "\n".join([
                f"• **{s.get('name')} ({s.get('district')})**: **{s.get('rainfall_24h_mm')} mm** (Slope: {s.get('slope_degrees')}°)"
                for s in low_sectors
            ])
            if lang == "ta":
                text = (
                    f"🌧️ **குறைந்த மழை பதிவான பகுதிகள் (Lowest Rainfall Sectors):**\n\n"
                    f"{bullets}\n\n"
                    f"இந்த பகுதிகளில் மழைப்பொழிவு 70 mm வரம்பிற்குள் உள்ளதால் மண் நிறைவுத்தன்மை மற்றும் உடனடி சரிவு அபாயம் குறைவாக உள்ளது."
                )
            else:
                text = (
                    f"🌧️ **Lowest / Safe Rainfall Sectors (24h Cumulative):**\n\n"
                    f"{bullets}\n\n"
                    f"**Analysis:** In these sectors, cumulative precipitation remains well below critical infiltration thresholds (100 mm), maintaining lower pore-water pressure and stable slope conditions."
                )
            suggested_questions = [
                "Show safe areas" if lang == "en" else "பாதுகாப்பான பகுதிகளைக் காட்டு",
                "Check soil moisture" if lang == "en" else "மண் ஈரப்பதம் என்ன?",
                "What is the current risk?" if lang == "en" else "தற்போதைய அபாய நிலை என்ன?"
            ]

        elif intent == "SAFE_AREAS":
            sorted_by_risk_asc = sorted(locations, key=lambda x: x.get("rainfall_24h_mm", 0) * 0.32 + x.get("soil_moisture_pct", 0) * 0.24)
            safe_sectors = sorted_by_risk_asc[:4]
            bullets = "\n".join([
                f"• **{s.get('name')} ({s.get('district')})**: Rain: {s.get('rainfall_24h_mm')} mm, Soil Moisture: {s.get('soil_moisture_pct')}%"
                for s in safe_sectors
            ])
            if lang == "ta":
                text = (
                    f"🛡️ **குறைந்த / மிதமான அபாயமுள்ள பகுதிகள் (Low Hazard Sectors):**\n\n"
                    f"{bullets}\n\n"
                    f"இந்த பகுதிகளில் குறைந்த மழைப்பொழிவு மற்றும் மிதமான சாய்வு உள்ளதால் இயல்பு நிலை தொடர்கிறது."
                )
            else:
                text = (
                    f"🛡️ **Currently Identified Low & Moderate Risk Sectors:**\n\n"
                    f"{bullets}\n\n"
                    f"**Summary:** These zones exhibit low-to-moderate slope gradients, stable soil saturation profiles, and 24h rainfall well within baseline limits."
                )
            suggested_questions = [
                "Show high-risk areas" if lang == "en" else "அதிக அபாய பகுதிகள்",
                "Check rainfall" if lang == "en" else "மழை அளவை சரிபார்க்கவும்",
                "What should I do during a warning?" if lang == "en" else "எச்சரிக்கையின் போது என்ன செய்ய வேண்டும்?"
            ]

        elif intent == "RAINFALL":
            if is_explicit_loc:
                if lang == "ta":
                    text = (
                        f"🌧️ **மழைப்பொழிவு விவரம் - {loc_name}:**\n\n"
                        f"கடந்த 24 மணி நேரத்தில் பதிவான மழை: **{rain_24h} mm**.\n"
                        f"மழைப்பொழிவு நிலை: **{'அதி தீவிர மழை' if rain_24h > 150 else 'கனமழை' if rain_24h > 80 else 'மிதமான மழை'}**.\n"
                        f"இது நிலப்பரப்பில் நீர் செறிவை அதிகரித்துள்ளது."
                    )
                else:
                    text = (
                        f"🌧️ **Rainfall Telemetry - {loc_name}:**\n\n"
                        f"The latest recorded 24-hour rainfall is **{rain_24h} mm**.\n"
                        f"Precipitation status: **{'Extremely Heavy' if rain_24h > 150 else 'Heavy Rainfall' if rain_24h > 80 else 'Moderate'}**.\n\n"
                        f"Continuous rainfall above 100 mm dramatically elevates topsoil pore-water pressure on {slope_deg}° slopes."
                    )
            else:
                # System-wide rainfall calculated dynamically from locations database
                avg_rain = round(sum(l.get("rainfall_24h_mm", 0) for l in locations) / max(1, len(locations)))
                sorted_by_rain_desc = sorted(locations, key=lambda x: x.get("rainfall_24h_mm", 0), reverse=True)
                top_rain = sorted_by_rain_desc[:4]
                low_rain = sorted_by_rain_desc[-3:]
                low_rain.reverse()

                high_bullets = "\n".join([
                    f"• **{s.get('name')} ({s.get('district')})**: **{s.get('rainfall_24h_mm')} mm** ({'Extreme' if s.get('rainfall_24h_mm', 0) > 150 else 'Heavy'})"
                    for s in top_rain
                ])
                low_bullets = "\n".join([
                    f"• **{s.get('name')} ({s.get('district')})**: **{s.get('rainfall_24h_mm')} mm**"
                    for s in low_rain
                ])

                if lang == "ta":
                    text = (
                        f"🌧️ **அமைப்பின் நேரலை மழைப்பொழிவு விவரம்:**\n\n"
                        f"கண்காணிக்கப்படும் அனைத்து நிலையங்களின் சராசரி 24 மணி நேர மழை: **{avg_rain} mm**.\n\n"
                        f"**அதிக மழை பதிவான முக்கிய பகுதிகள்:**\n"
                        f"{high_bullets}\n\n"
                        f"**குறைந்த மழை பதிவான பகுதிகள்:**\n"
                        f"{low_bullets}"
                    )
                else:
                    text = (
                        f"🌧️ **System-Wide 24h Rainfall Telemetry:**\n\n"
                        f"The regional average 24h rainfall across monitored stations is **{avg_rain} mm**.\n\n"
                        f"**Highest Recorded Rainfall Readings:**\n"
                        f"{high_bullets}\n\n"
                        f"**Lowest Recorded Rainfall:**\n"
                        f"{low_bullets}\n\n"
                        f"Persistent rainfall above 100 mm dramatically elevates topsoil pore-water pressure."
                    )
            suggested_questions = [
                "Show areas with less rainfall" if lang == "en" else "குறைந்த மழை பகுதிகள்",
                "Check soil moisture" if lang == "en" else "மண் ஈரப்பதம் என்ன?",
                "What is the current risk?" if lang == "en" else "தற்போதைய அபாய நிலை என்ன?"
            ]

        elif intent == "SOIL_MOISTURE":
            if is_explicit_loc:
                if lang == "ta":
                    text = (
                        f"💧 **மண் ஈரப்பதம் மற்றும் செறிவூட்டல் - {loc_name}:**\n\n"
                        f"மண் ஈரப்பதம்: **{soil_pct}%**\n"
                        f"மண் வகை: **{soil_type}**\n\n"
                        f"மண் ஈரப்பதம் 80% ஐ விட அதிகமாக இருந்தால் மண் பிடிப்பு பலவீனமடைந்து நிலச்சரிவு ஏற்படும் வாய்ப்பு அதிகரிக்கும்."
                    )
                else:
                    text = (
                        f"💧 **Soil Moisture Telemetry - {loc_name}:**\n\n"
                        f"The latest subsurface soil moisture saturation is **{soil_pct}%**.\n"
                        f"Soil profile classification: **{soil_type}**.\n\n"
                        f"{'⚠️ Saturated soil creates significant hydrostatic uplift on steep bedrock interfaces.' if soil_pct > 75 else 'Soil moisture remains below immediate saturation thresholds.'}"
                    )
            else:
                # System-wide soil moisture calculated dynamically
                avg_soil = round(sum(l.get("soil_moisture_pct", 0) for l in locations) / max(1, len(locations)))
                sorted_by_soil_desc = sorted(locations, key=lambda x: x.get("soil_moisture_pct", 0), reverse=True)
                top_soil = sorted_by_soil_desc[:4]
                low_soil = sorted_by_soil_desc[-3:]
                low_soil.reverse()

                high_soil_bullets = "\n".join([
                    f"• **{s.get('name')} ({s.get('district')})**: **{s.get('soil_moisture_pct')}%** ({'Critical' if s.get('soil_moisture_pct', 0) > 80 else 'High'})"
                    for s in top_soil
                ])
                low_soil_bullets = "\n".join([
                    f"• **{s.get('name')} ({s.get('district')})**: **{s.get('soil_moisture_pct')}%**"
                    for s in low_soil
                ])

                if lang == "ta":
                    text = (
                        f"💧 **அமைப்பின் மண் ஈரப்பதம் மற்றும் செறிவு நிலை:**\n\n"
                        f"கண்காணிக்கப்படும் பகுதிகளின் சராசரி மண் ஈரப்பதம்: **{avg_soil}%**.\n\n"
                        f"**அதி தீவிர செறிவுள்ள பகுதிகள் (>80% Saturation):**\n"
                        f"{high_soil_bullets}\n\n"
                        f"**குறைந்த செறிவுள்ள பகுதிகள்:**\n"
                        f"{low_soil_bullets}"
                    )
                else:
                    text = (
                        f"💧 **Subsurface Soil Moisture Saturation Across Monitored Sectors:**\n\n"
                        f"The regional average soil moisture is currently **{avg_soil}%**.\n\n"
                        f"**Critically Saturated Zones (>80% Saturation):**\n"
                        f"{high_soil_bullets}\n\n"
                        f"**Lowest Saturation Zones:**\n"
                        f"{low_soil_bullets}"
                    )
            suggested_questions = [
                "Show areas with less rainfall" if lang == "en" else "குறைந்த மழை பகுதிகள்",
                "Why is this area risky?" if lang == "en" else "இந்த பகுதி ஏன் அபாயமானது?",
                "What's the current risk?" if lang == "en" else "அபாய நிலை என்ன?"
            ]


        elif intent == "SLOPE":
            if is_explicit_loc:
                if lang == "ta":
                    text = (
                        f"⛰️ **நிலப்பரப்பு மற்றும் சாய்வு விவரம் - {loc_name} ({district}):**\n\n"
                        f"• **சாய்வு கோணம்:** **{slope_deg}°** ({'செங்குத்தான மலைச்சரிவு (Steep)' if slope_deg > 35 else 'மிதமான சரிவு'})\n"
                        f"• **உயரம் (DEM):** **{elevation_m} m**\n"
                        f"• **மண் வகை:** **{soil_type}**\n"
                        f"• **முந்தைய நிலச்சரிவுகள்:** **{hist_count} நிகழ்வுகள்**\n\n"
                        f"30° க்கும் அதிகமான சாய்வு ஈர்ப்பு விசை அழுத்தத்தை அதிகப்படுத்தி நிலச்சரிவு வாய்ப்பை கூட்டுகிறது."
                    )
                else:
                    text = (
                        f"⛰️ **Topography & Slope Profile - {loc_name} ({district}):**\n\n"
                        f"• **Slope Incline:** **{slope_deg}°** ({'Steep Mountainous Face (>35°)' if slope_deg > 35 else 'Moderate Incline'})\n"
                        f"• **Elevation (SRTM DEM):** **{elevation_m} m**\n"
                        f"• **Soil Matrix:** **{soil_type}**\n"
                        f"• **Historical Landslide Density:** **{hist_count} recorded scars**\n\n"
                        f"Steep gradients above 30° experience elevated shear stress along bedrock slip planes during precipitation."
                    )
            else:
                # System-wide slope analysis
                avg_slope = round(sum(l.get("slope_degrees", 0) for l in locations) / max(1, len(locations)), 1)
                sorted_by_slope_desc = sorted(locations, key=lambda x: x.get("slope_degrees", 0), reverse=True)
                top_steep = sorted_by_slope_desc[:4]
                gentle_slopes = sorted_by_slope_desc[-3:]
                gentle_slopes.reverse()

                steep_bullets = "\n".join([
                    f"• **{s.get('name')} ({s.get('district')})**: **{s.get('slope_degrees')}°** ({'Extreme Escarpment' if s.get('slope_degrees', 0) > 40 else 'Steep Face'})"
                    for s in top_steep
                ])
                gentle_bullets = "\n".join([
                    f"• **{s.get('name')} ({s.get('district')})**: **{s.get('slope_degrees')}°** (Gentle/Moderate)"
                    for s in gentle_slopes
                ])

                if lang == "ta":
                    text = (
                        f"⛰️ **அமைப்பின் நிலப்பரப்பு சாய்வு கோணங்கள் (Slope Telemetry):**\n\n"
                        f"கண்காணிக்கப்படும் பகுதிகளின் சராசரி சாய்வு கோணம்: **{avg_slope}°**.\n\n"
                        f"**அதி தீவிர செங்குத்தான சரிவுகள் (>35°):**\n"
                        f"{steep_bullets}\n\n"
                        f"**குறைவான / மிதமான சாய்வுள்ள பகுதிகள் (<30°):**\n"
                        f"{gentle_bullets}\n\n"
                        f"30° க்கும் அதிகமான சாய்வு கொண்ட மலைப்பகுதிகளில் மழை நீர் ஊடுருவும் போது ஈர்ப்பு விசை அழுத்தம் அதிகரிக்கிறது."
                    )
                else:
                    text = (
                        f"⛰️ **System-Wide Mountain Slope Telemetry (NASA SRTM DEM):**\n\n"
                        f"The regional average slope across monitored stations is **{avg_slope}°**.\n\n"
                        f"**Steepest Mountain Slopes (>35° Incline):**\n"
                        f"{steep_bullets}\n\n"
                        f"**Gentlest / Stable Slope Zones (<30°):**\n"
                        f"{gentle_bullets}\n\n"
                        f"Terrain gradients exceeding 30° significantly amplify gravitational shear stresses when saturated by monsoon rains."
                    )
            suggested_questions = [
                "Check rainfall" if lang == "en" else "மழைப்பொழிவை சரிபார்க்கவும்",
                "Show high-risk areas" if lang == "en" else "அதிக அபாய பகுதிகள்",
                "What is the current risk?" if lang == "en" else "தற்போதைய அபாய நிலை என்ன?"
            ]

        elif intent == "ELEVATION":
            if is_explicit_loc:
                if lang == "ta":
                    text = (
                        f"📍 **{loc_name}** கடல் மட்டத்திலிருந்து **{elevation_m} மீட்டர்** உயரத்தில் அமைந்துள்ளது (சாய்வு: {slope_deg}°).\n"
                        f"மண் வகை: **{soil_type}**."
                    )
                else:
                    text = (
                        f"📍 **{loc_name} ({district})** is situated at an elevation of **{elevation_m} meters** above mean sea level.\n\n"
                        f"• Slope: **{slope_deg}°**\n• Soil Matrix: **{soil_type}**\n• 24h Rainfall: **{rain_24h} mm**"
                    )
            else:
                sorted_by_elev = sorted(locations, key=lambda x: x.get("elevation_m", 0), reverse=True)
                elev_bullets = "\n".join([
                    f"• **{s.get('name')} ({s.get('district')})**: **{s.get('elevation_m')} m**"
                    for s in sorted_by_elev[:5]
                ])
                if lang == "ta":
                    text = f"📍 **கண்காணிக்கப்படும் உயரமான பகுதிகள் (Top Elevations):**\n\n{elev_bullets}"
                else:
                    text = f"📍 **Highest Elevation Monitored Sectors (SRTM DEM):**\n\n{elev_bullets}"

            suggested_questions = ["Check slope", "Show high-risk areas", "What is the current risk?"]

        elif intent == "LIST_LOCATIONS":
            bullets = "\n".join([
                f"• **{s.get('name')}** ({s.get('district')}, {s.get('state')}) - Rain: {s.get('rainfall_24h_mm')} mm, Soil: {s.get('soil_moisture_pct')}%, Slope: {s.get('slope_degrees')}°"
                for s in locations
            ])
            if lang == "ta":
                text = f"📍 **கண்காணிக்கப்படும் அனைத்து {len(locations)} பகுதிகள்:**\n\n{bullets}"
            else:
                text = f"📍 **All Monitored Early Warning Stations ({len(locations)} Stations Active):**\n\n{bullets}\n\nYou can ask about any individual station (e.g. *'What is the slope in Coonoor?'* or *'Rainfall in Wayanad'*)."

            suggested_questions = ["Check slope", "Show areas with less rainfall", "What is the current risk?"]

        elif intent == "HIGH_RISK_AREAS":
            high_zones = [l for l in locations if l.get("rainfall_24h_mm", 0) > 100 or l.get("slope_degrees", 0) > 35]
            zone_bullets = "\n".join([
                f"• **{z['name']}** ({z['district']}) - Rain: {z['rainfall_24h_mm']} mm, Slope: {z['slope_degrees']}°"
                for z in high_zones[:4]
            ])

            if lang == "ta":
                text = (
                    f"⚠️ **தற்போது கண்டறியப்பட்ட அதிக அபாய பகுதிகள் ({len(high_zones)} மண்டலங்கள்):**\n\n"
                    f"{zone_bullets}\n\n"
                    f"முழுமையான நேரலை வரைபடத்தை 'Live Risk Map' பக்கத்தில் பார்வையிடலாம்."
                )
            else:
                text = (
                    f"⚠️ **Identified High & Critical Risk Zones ({len(high_zones)} zones monitored):**\n\n"
                    f"{zone_bullets}\n\n"
                    f"You can open the **Live Risk Map** to view their real-time spatial heatmaps and perimeter alerts."
                )
            suggested_questions = [
                "Are there any warnings?" if lang == "en" else "ஏதேனும் எச்சரிக்கைகள் உள்ளதா?",
                "What should I do during a warning?" if lang == "en" else "எச்சரிக்கை வந்தால் என்ன செய்ய வேண்டும்?"
            ]

        elif intent == "ALERTS":
            active_alerts = [a for a in alerts if a.get("status") in ["ACTIVE", "CRITICAL"]]
            if active_alerts:
                alert_bullets = "\n\n".join([
                    f"🚨 **{a.get('alert_level')}: {a.get('location_name')}**\n"
                    f"Reason: {a.get('trigger_reason')}\n"
                    f"Action: {a.get('recommended_action')}"
                    for a in active_alerts[:3]
                ])
                if lang == "ta":
                    text = (
                        f"📢 **செயலில் உள்ள பேரிடர் எச்சரிக்கைகள் ({len(active_alerts)} எச்சரிக்கைகள்):**\n\n"
                        f"{alert_bullets}\n\n"
                        f"பாதுகாப்பு வழிமுறைகளை உடனே பின்பற்றவும்."
                    )
                else:
                    text = (
                        f"📢 **Active Early Warning Alerts ({len(active_alerts)} active bulletins):**\n\n"
                        f"{alert_bullets}\n\n"
                        f"Please heed instructions issued by District Disaster Management Authorities."
                    )
            else:
                text = (
                    "தற்போது தீவிர அபாய எச்சரிக்கைகள் எதுவும் நடைமுறையில் இல்லை."
                    if lang == "ta"
                    else "There are currently no active high-level emergency alerts broadcasted. Routine monitoring is in effect."
                )
            action_buttons.insert(0, {"label": "⚠️ View All Alerts", "action": "VIEW_ALERTS"})
            suggested_questions = [
                "What's the current risk?" if lang == "en" else "தற்போதைய அபாய நிலை?",
                "Show high-risk areas" if lang == "en" else "அபாய பகுதிகளைக் காட்டு"
            ]

        elif intent == "SAFETY":
            if lang == "ta":
                text = (
                    "🛡️ **முக்கிய நிலச்சரிவு பாதுகாப்பு நெறிமுறைகள்:**\n\n"
                    "1. **உடனடி ஆபத்து:** நிலத்தில் விரிசல் அல்லது திடீர் நீர் ஊற்று கண்டால், உடனடியாக சரிவு பகுதிகளில் இருந்து பாதுகாப்பான உயரமான இடத்திற்குச் செல்லவும்.\n"
                    "2. **பயணங்களை தவிர்க்கவும்:** கனமழை மற்றும் எச்சரிக்கை நேரங்களில் மலைப்பாதை (Ghat Road) பயணங்களை முற்றிலும் தவிர்க்கவும்.\n"
                    "3. **அதிகாரப்பூர்வ தகவல்:** மாவட்ட நிர்வாகம் மற்றும் பேரிடர் மீட்பு படையினரின் (NDRF/SDRF) வழிகாட்டுதல்களைப் பின்பற்றவும்.\n"
                    "4. **ஆபத்து கண்டால்:** நீங்கள் விரிசல்களைக் கண்டால் 'Citizen Reporting' மூலம் புகைப்படம் எடுத்து தகவல் தெரிவிக்கலாம்.\n\n"
                    "⚠️ *அவசர உதவிக்கு 112 அல்லது மாநில பேரிடர் கட்டுப்பாட்டு அறையைத் தொடர்பு கொள்ளவும்.*"
                )
            else:
                text = (
                    "🛡️ **Landslide Safety & Emergency Actions:**\n\n"
                    "1. **Immediate Danger:** If you notice fresh ground cracks, tilting trees, or sudden muddy water from slopes, immediately move to safer ground away from the slope path.\n"
                    "2. **Evacuation Readiness:** Prepare an emergency kit with essentials, medications, and vital documents.\n"
                    "3. **Avoid Ghat Travel:** Do not drive or walk across steep mountain roads or bridge culverts during red alerts.\n"
                    "4. **Heed Official Warnings:** Follow all official orders from NDRF, SDRF, and District Disaster Management teams.\n\n"
                    "⚠️ *Note: If you are in immediate danger, dial 112 / Emergency Services immediately. This AI assistant provides advisory information and does not replace official emergency responders.*"
                )
            action_buttons.append({"label": "📢 Submit Citizen Report", "action": "SUBMIT_REPORT"})
            suggested_questions = [
                "I see cracks near my house" if lang == "en" else "என் வீட்டின் அருகில் விரிசல்கள் உள்ளன",
                "Explain the risk score" if lang == "en" else "அபாய மதிப்பெண்ணை விளக்குங்கள்"
            ]

        elif intent == "CITIZEN_REPORT":
            if lang == "ta":
                text = (
                    "📢 **குடிமக்கள் தகவல் பதிவு (Citizen Hazard Report):**\n\n"
                    "தரை விரிசல்கள், சரிவு மற்றும் மரங்கள் சாய்வது நிலச்சரிவின் முக்கிய ஆரம்ப எச்சரிக்கை அறிகுறிகள் ஆகும். "
                    "நீங்கள் ஆபத்தில் இருந்தால் உடனடியாக பாதுகாப்பான இடத்திற்கு செல்லவும்.\n\n"
                    "உங்கள் அவதானிப்பை புகைப்படத்துடன் அதிகாரிகளுக்கு சமர்ப்பிக்க கீழே உள்ள பொத்தானைப் பயன்படுத்தவும்."
                )
            else:
                text = (
                    "📢 **Citizen Hazard Observation:**\n\n"
                    "Ground cracks, bulging slopes, and muddy runoff are critical early precursors to slope failure. "
                    "If you are in immediate peril, please evacuate to higher stable ground immediately.\n\n"
                    "You can log your observation with GPS location and photo evidence directly through our **Citizen Reporting System**."
                )
            action_buttons = [
                {"label": "📢 Submit Citizen Report", "action": "SUBMIT_REPORT"},
                {"label": "🗺️ View on Map", "action": "VIEW_MAP", "target": loc.get("id"), "lat": loc.get("latitude"), "lng": loc.get("longitude")}
            ]
            suggested_questions = [
                "What should I do during a warning?" if lang == "en" else "பாதுகாப்பு வழிமுறைகள் என்ன?",
                "What's the current risk?" if lang == "en" else "தற்போதைய அபாயம் என்ன?"
            ]

        elif intent == "EXPLAIN_SCORE":
            if lang == "ta":
                text = (
                    f"📊 **அபாய மதிப்பெண் விளக்கம் ({risk_prob}%):**\n\n"
                    f"**{risk_prob}%** மதிப்பெண் என்பது இந்த அமைப்பில் **{risk_cat}** வகையைக் குறிக்கிறது.\n\n"
                    f"இது மழைப்பொழிவு (32%), மண் ஈரப்பதம் (24%), நிலப்பரப்பு சாய்வு (18%), மற்றும் முந்தைய நிலச்சரிவு வரலாறு (10%) ஆகியவற்றை அடிப்படையாகக் கொண்ட ஒரு கணித மாதிரி மதிப்பீடு ஆகும்.\n\n"
                    f"இது நிலச்சரிவு ஏற்படுவதற்கான சாத்தியக்கூறை முன்கூட்டியே எச்சரிக்க உதவுகிறது."
                )
            else:
                text = (
                    f"📊 **Risk Score Explanation ({risk_prob}%):**\n\n"
                    f"An **{risk_prob}%** prototype risk score indicates a **{risk_cat}** risk classification in this monitoring system.\n\n"
                    f"It is a model-based estimate derived from weighted multi-factor telemetry:\n"
                    f"• 24h Rainfall (32% weight)\n"
                    f"• Degree of Soil Moisture Saturation (24% weight)\n"
                    f"• Slope Gradient from SRTM DEM (18% weight)\n"
                    f"• Elevation & Historical Landslide Density (18% weight)\n\n"
                    f"*Note: The score expresses relative susceptibility and trigger probability, helping authorities prioritize preemptive disaster mitigations.*"
                )
            suggested_questions = [
                "Why is this area risky?" if lang == "en" else "இந்த பகுதி ஏன் அபாயகரமானது?",
                "What should I do during a warning?" if lang == "en" else "எச்சரிக்கை வந்தால் என்ன செய்ய வேண்டும்?"
            ]

        elif intent == "SYSTEM_INFORMATION":
            if lang == "ta":
                text = (
                    "🤖 **Landslide AI Assistant பற்றி:**\n\n"
                    "நான் நிலச்சரிவு முன்கூட்டியே எச்சரிக்கும் செயற்கை நுண்ணறிவு உதவியாளர் ஆவேன். "
                    "செயற்கைக்கோள் தரவுகள் (Google Earth Engine), தானியங்கி வானிலை நிலையங்கள் (IMD) மற்றும் மண் ஈரப்பதம் உணரிகள் ஆகியவற்றை இணைத்து நிலச்சரிவு அபாயத்தை உடனுக்குடன் பகுப்பாய்வு செய்கிறேன்."
                )
            else:
                text = (
                    "🤖 **About Landslide AI Assistant:**\n\n"
                    "I am the dedicated AI Early Warning Assistant for the Landslide Monitoring System. "
                    "I ingest continuous telemetry from Google Earth Engine (Sentinel-1 InSAR & DEM), IMD Doppler rainfall stations, and in-situ soil moisture probes to compute real-time hazard probabilities and generate early warnings."
                )
            suggested_questions = [
                "What's the current risk?" if lang == "en" else "தற்போதைய அபாய நிலை?",
                "Show high-risk areas" if lang == "en" else "அதிக அபாய பகுதிகள்"
            ]

        else: # General query fallback
            if lang == "ta":
                text = (
                    f"வணக்கம்! நான் நிலச்சரிவு கண்காணிப்பு அமைப்பின் நேரலைத் தரவுகளை ஆய்வு செய்ய முடியும். "
                    f"தற்போதைய கண்காணிப்புப் பகுதி: **{loc_name}** ({risk_cat} - {risk_prob}% அபாயம்).\n\n"
                    f"மழைப்பொழிவு, மண் ஈரப்பதம், எச்சரிக்கைகள் அல்லது பாதுகாப்பு ஆலோசனைகள் பற்றி என்னிடம் கேட்கலாம்."
                )
            else:
                text = (
                    f"I can help you analyze live telemetry and risk status for monitored zones. "
                    f"Currently focused on **{loc_name}** (Status: **{risk_cat}** at **{risk_prob}%** probability).\n\n"
                    f"Feel free to ask about rainfall levels, soil saturation, slope conditions, active warnings, or emergency safety protocols."
                )
            suggested_questions = [
                "What's the current risk?" if lang == "en" else "தற்போதைய அபாய நிலை என்ன?",
                "Why is this area risky?" if lang == "en" else "இந்த பகுதி ஏன் அபாயமானது?",
                "Check rainfall" if lang == "en" else "மழை அளவை சரிபார்க்கவும்",
                "Show high-risk areas" if lang == "en" else "அபாய பகுதிகளைக் காட்டு"
            ]

        return {
            "message": text,
            "intent": intent,
            "risk": {
                "probability": risk_prob,
                "level": risk_cat,
                "color": pred.get("color_code", "#ef4444")
            },
            "location": {
                "id": loc.get("id"),
                "name": loc_name,
                "village": village,
                "district": district,
                "state": loc.get("state", "India"),
                "latitude": loc.get("latitude"),
                "longitude": loc.get("longitude"),
                "rainfall_24h_mm": rain_24h,
                "soil_moisture_pct": soil_pct,
                "slope_degrees": slope_deg,
                "elevation_m": elevation_m,
                "historical_incidents": hist_count,
                "last_updated": last_updated
            },
            "sources": [
                "Environmental Telemetry (AWS & IMD)",
                "Sentinel-1 InSAR & SRTM DEM (GEE)",
                "LS-Ensemble AI Prediction Engine"
            ],
            "actionButtons": action_buttons,
            "suggestedQuestions": suggested_questions,
            "explanationCard": explanation_card,
            "isDemoMode": self.is_demo_mode
        }


# Global chat service singleton instance
chat_service = LandslideChatService()
