import numpy as np

class TrustScoreEngine:
    """
    Evaluates customer transaction telemetry, behavioral biometrics,
    and identity parameters to calculate the composite Identity Trust Score (0-100).
    """

    @staticmethod
    def calculate_scores(data: dict) -> dict:
        """
        Calculates scores based on 10 dimensions:
        - device_trust_score (0-100) -> Device Reputation (10%)
        - failed_login_count (int) -> Login Consistency (10%)
        - distance_from_home (float) -> Geolocation consistency (10%)
        - amount (float) -> Transaction volume anomaly (10%)
        - behavioral_biometrics -> Jitter, Speed (20%)
        - identity_confidence_score (0-100) -> Identity Verification Score (15%)
        - recovery_risk_score (0-100) -> Account Recovery Status (10%)
        - insider_risk_score (0-100) -> Insider threat status (5%)
        - session_risk_score (0-100) -> Active Session Risk (5%)
        - failed_auth_count / history -> Authentication History (5%)
        """
        # 1. Device Reputation (10%)
        device_score = float(data.get("device_trust_score", 90.0))
        device_weight = 0.10
        
        # 2. Login Consistency (10%)
        failed_logins = int(data.get("failed_login_count", 0))
        login_score = max(0.0, 100.0 - (failed_logins * 20.0))
        login_weight = 0.10
        
        # 3. Geolocation Consistency (10%)
        distance = float(data.get("distance_from_home", 10.0))
        geo_score = max(0.0, 100.0 - (np.log(distance + 1) * 12.0))
        geo_weight = 0.10
        
        # 4. Transaction Volume Anomaly (10%)
        amount = float(data.get("amount", 50.0))
        avg_amount = float(data.get("avg_amount", 100.0))
        ratio = amount / max(1.0, avg_amount)
        if ratio <= 1.2:
            vol_score = 100.0
        else:
            vol_score = max(0.0, 100.0 - (ratio - 1.2) * 20.0)
        vol_weight = 0.10
        
        # 5. Behavioral Biometrics (20%)
        typing_speed = float(data.get("typing_speed", 120.0))
        mouse_jitter = float(data.get("mouse_jitter", 1.5))
        click_speed = float(data.get("click_speed", 0.25))
        
        biometric_penalties = 0.0
        if typing_speed > 300.0: # Too fast (bot)
            biometric_penalties += 40.0
        elif typing_speed < 40.0: # Too slow
            biometric_penalties += 15.0
            
        if mouse_jitter < 0.1: # Robotic straight mouse moves
            biometric_penalties += 40.0
        elif mouse_jitter > 8.0: # Stress jitter
            biometric_penalties += 20.0
            
        if click_speed < 0.05: # Automated fast clicks
            biometric_penalties += 40.0
            
        bio_score = max(0.0, 100.0 - biometric_penalties)
        bio_weight = 0.20
        
        # 6. Identity Verification Score (15%)
        id_score = float(data.get("identity_confidence_score", 95.0))
        id_weight = 0.15

        # 7. Recovery Risk Score (10%)
        recovery_risk = float(data.get("recovery_risk_score", 5.0))
        recovery_score = max(0.0, 100.0 - recovery_risk)
        recovery_weight = 0.10

        # 8. Insider Risk Score (5%)
        insider_risk = float(data.get("insider_risk_score", 0.0))
        insider_score = max(0.0, 100.0 - insider_risk)
        insider_weight = 0.05

        # 9. Active Session Risk (5%)
        session_risk = float(data.get("session_risk_score", 0.0))
        session_score = max(0.0, 100.0 - session_risk)
        session_weight = 0.05

        # 10. Authentication History (5%)
        # Deduct score if there were authentication issues in history
        auth_penalty = float(data.get("auth_penalty", 0.0))
        auth_score = max(0.0, 100.0 - auth_penalty)
        auth_weight = 0.05

        # Composite Identity Trust Score Calculation
        trust_score = (
            (device_score * device_weight) +
            (login_score * login_weight) +
            (geo_score * geo_weight) +
            (vol_score * vol_weight) +
            (bio_score * bio_weight) +
            (id_score * id_weight) +
            (recovery_score * recovery_weight) +
            (insider_score * insider_weight) +
            (session_score * session_weight) +
            (auth_score * auth_weight)
        )
        
        trust_score = float(np.clip(trust_score, 0.0, 100.0))
        risk_score = float(100.0 - trust_score)
        
        # Identity categories:
        # 90-100 -> Trusted
        # 70-89 -> Low Risk
        # 50-69 -> Medium Risk
        # 0-49 -> High Risk
        if trust_score >= 90.0:
            category = "Trusted"
        elif trust_score >= 70.0:
            category = "Low Risk"
        elif trust_score >= 50.0:
            category = "Medium Risk"
        else:
            category = "High Risk"
            
        return {
            "trust_score": round(trust_score, 2),
            "risk_score": round(risk_score, 2),
            "category": category,
            "breakdown": {
                "device_reputation": round(device_score, 2),
                "login_consistency": round(login_score, 2),
                "geolocation_score": round(geo_score, 2),
                "volume_score": round(vol_score, 2),
                "biometric_score": round(bio_score, 2),
                "identity_verification_score": round(id_score, 2),
                "recovery_reputation_score": round(recovery_score, 2),
                "insider_reputation_score": round(insider_score, 2),
                "session_trust_score": round(session_score, 2),
                "auth_history_score": round(auth_score, 2)
            }
        }
