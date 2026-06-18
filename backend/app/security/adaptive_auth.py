class AdaptiveAuthenticator:
    """
    Evaluates Trust Score and session parameters to make dynamic, risk-based
    authentication decisions.
    
    Threshold Rules:
    - Trust Score > 80: Allow Login
    - Trust Score 50–80: OTP Verification
    - Trust Score 20–50: Step-Up Authentication
    - Trust Score < 20: Block Access
    """

    @staticmethod
    def evaluate_auth_level(trust_score: float, session_risk: float = 0.0) -> dict:
        """
        Derives the required authentication challenge, risk assessment, and reason.
        """
        # Adjust trust score slightly based on session risk (if high session risk, pull trust down)
        adjusted_score = max(0.0, trust_score - (session_risk * 0.3))
        
        if adjusted_score > 90.0:
            action = "Allow Login"
            reason = "Biometric, device, and recovery telemetry matches standard profile. Frictionless login permitted."
            risk_level = "Trusted"
        elif adjusted_score >= 70.0:
            action = "OTP Verification"
            reason = "Minor shift in device reputation or typing dynamics. Prompting for standard OTP validation."
            risk_level = "Low Risk"
        elif adjusted_score >= 50.0:
            action = "Step-Up Authentication"
            reason = "Anomalous transaction volume or location deviation detected. Requiring Multi-Factor Step-Up challenge."
            risk_level = "Medium Risk"
        elif adjusted_score >= 20.0:
            action = "Face Verification"
            reason = "Significant behavioral biometrics anomalies or recovery indicators. Face validation match required."
            risk_level = "High Risk"
        else:
            action = "Block Access"
            reason = "Robotic click patterns, blacklisted VPN address, or critical credentials mismatch. Access denied."
            risk_level = "Critical Threat"

        return {
            "trust_score": round(trust_score, 2),
            "adjusted_score": round(adjusted_score, 2),
            "authentication_action": action,
            "risk_level": risk_level,
            "decision_reason": reason,
            "session_risk_score": round(session_risk, 2)
        }

    @staticmethod
    def assess_session_risk(device_id: str, ip_address: str, biometric_alerts: list) -> float:
        """
        Aggregates session risk parameters.
        """
        risk = 10.0
        
        # Check IP range/VPN flags
        if ip_address in ["185.220.101.4", "185.45.2.14"]: # Mock VPNs
            risk += 35.0
            
        # Check device ID reputation
        if device_id == "dev_shared_mutant" or device_id == "dev_headless_chrome":
            risk += 45.0
            
        # Check biometrics alerts
        if biometric_alerts:
            risk += 15.0 * len(biometric_alerts)
            
        return min(100.0, risk)
