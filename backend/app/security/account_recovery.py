import numpy as np

class AccountRecoveryEngine:
    """
    Evaluates account recovery requests for suspicious signals such as:
    - New Device Recovery
    - New Location Recovery
    - Multiple Recovery Attempts
    - SIM Swap Indicators
    - Credential Stuffing Patterns
    """

    @staticmethod
    def assess_recovery_attempt(attempt_data: dict) -> dict:
        """
        Calculates recovery risk and confidence scores.
        """
        is_new_device = bool(attempt_data.get("is_new_device", False))
        is_new_location = bool(attempt_data.get("is_new_location", False))
        attempts_count = int(attempt_data.get("attempts_count", 1))
        sim_swap_days = int(attempt_data.get("sim_swap_days", 30))
        failed_login_window = int(attempt_data.get("failed_login_window", 0))

        risk_score = 10.0
        alerts = []

        # 1. New Device Recovery
        if is_new_device:
            risk_score += 25.0
            alerts.append("Recovery initiated from unrecognized device fingerprint")

        # 2. Location Deviation
        if is_new_location:
            risk_score += 20.0
            alerts.append("Recovery request location deviates from primary geolocation history")

        # 3. Excessive Recovery Attempts
        if attempts_count > 3:
            risk_score += 30.0
            alerts.append(f"High-frequency recovery requests ({attempts_count} requests in 10 mins)")
        elif attempts_count > 1:
            risk_score += 10.0

        # 4. SIM Swap Indicators
        # SIM swaps in the last 2-3 days are extremely suspicious for account hijacking
        if sim_swap_days <= 3:
            risk_score += 45.0
            alerts.append("Telecom telemetry indicates recent SIM swap in last 72 hours")
        elif sim_swap_days <= 7:
            risk_score += 25.0
            alerts.append("SIM swap detected in the last 7 days")

        # 5. Credential Stuffing Indicators
        if failed_login_window >= 5:
            risk_score += 25.0
            alerts.append("Pre-recovery activity matches credential stuffing pattern (multiple failed login trials)")

        # Cap risks
        risk_score = float(np.clip(risk_score, 0.0, 100.0))
        confidence_score = float(np.clip(100.0 - (risk_score * 0.7), 10.0, 98.0))

        # Verdict
        if risk_score > 65.0:
            verdict = "Blocked"
        elif risk_score > 35.0:
            verdict = "Step-Up Challenge Required"
        else:
            verdict = "Approved"

        return {
            "recovery_risk_score": round(risk_score, 2),
            "recovery_confidence_score": round(confidence_score, 2),
            "verdict": verdict,
            "alerts": alerts
        }
