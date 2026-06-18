import numpy as np

class InsiderThreatMonitor:
    """
    Monitors enterprise employee/insider behavior for:
    - Anomalous off-hour database logins
    - Large data exports/downloads
    - Access escalation attempts
    - Privileged DB resource query spikes
    """

    @staticmethod
    def evaluate_insider_activity(activity: dict) -> dict:
        """
        Calculates risk rankings and privileged access scores.
        """
        action = activity.get("action", "Login")
        resource = activity.get("resource", "")
        hour = int(activity.get("hour_of_day", 12)) # 0-23
        download_size_mb = float(activity.get("download_size_mb", 0.0))
        escalation_attempt = bool(activity.get("escalation_attempt", False))
        failed_admin_auth = int(activity.get("failed_admin_auth", 0))

        risk_score = 0.0
        privileged_access_risk = 0.0
        alerts = []

        # 1. Unusual Working Hours (Out of standard business hours 8am-7pm)
        if hour < 7 or hour > 19:
            risk_score += 15.0
            alerts.append(f"Anomalous action hour: activity performed at {hour:02d}:00")

        # 2. Large Data Exports / Downloads
        if download_size_mb > 1000.0:
            risk_score += 40.0
            alerts.append(f"Critical data download: {download_size_mb:,.1f} MB exported")
        elif download_size_mb > 100.0:
            risk_score += 15.0
            alerts.append(f"Significant data export: {download_size_mb:.1f} MB downloaded")

        # 3. Access Escalation Attempt
        if escalation_attempt:
            risk_score += 45.0
            privileged_access_risk += 50.0
            alerts.append("Unauthorized access escalation attempt on restricted security keys")

        # 4. Privileged Access Usage
        if resource in ["customer_PII_vault", "private_keys_db", "bank_ledger_master"]:
            privileged_access_risk += 35.0
            if hour < 7 or hour > 19:
                privileged_access_risk += 25.0
                alerts.append("Privileged DB resource query performed outside business hours")
        
        # 5. Admin Authentication Failures
        if failed_admin_auth >= 3:
            risk_score += 35.0
            privileged_access_risk += 30.0
            alerts.append(f"Repeated privilege authentication blocks ({failed_admin_auth} fails)")

        # Cap risks
        risk_score = float(np.clip(risk_score, 0.0, 100.0))
        privileged_access_risk = float(np.clip(privileged_access_risk, 0.0, 100.0))

        # Overall level
        combined_risk = max(risk_score, privileged_access_risk)
        if combined_risk > 70:
            threat_category = "High Risk"
        elif combined_risk > 35:
            threat_category = "Medium Risk"
        else:
            threat_category = "Low Risk"

        return {
            "insider_risk_score": round(risk_score, 2),
            "privileged_access_risk_score": round(privileged_access_risk, 2),
            "combined_risk": round(combined_risk, 2),
            "threat_category": threat_category,
            "alerts": alerts
        }
