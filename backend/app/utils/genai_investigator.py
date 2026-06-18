class GenAiIdentityTrustInvestigator:
    """
    Generates simulated compliance-ready security analyst briefings
    detailing session identity verification metrics, biometrics, and adaptive authentication advice.
    """
    @staticmethod
    def generate_report(tx: dict) -> dict:
        """
        Generates a structured identity trust validation report.
        """
        risk_score = tx.get("risk_score", 10.0)
        fraud_type = tx.get("fraud_type", "None")
        amount = tx.get("amount", 0.0)
        bank = tx.get("bank", "Bank A")
        merchant = tx.get("merchant", "Merchant")
        distance = tx.get("distance_from_home", 0.0)
        device_id = tx.get("device_id", "dev_unknown")
        ip = tx.get("ip_address", "127.0.0.1")
        pan = tx.get("pan_number", "UNKNOWN")
        name = tx.get("customer_name", "Unknown")
        failed_logins = tx.get("failed_login_count", 0)
        
        # Determine Identity Trust status level
        if risk_score >= 80.0:
            level = "CRITICAL"
            trust_status = "High Risk"
            color = "red"
        elif risk_score >= 50.0:
            level = "HIGH RISK"
            trust_status = "High Risk"
            color = "orange"
        elif risk_score >= 25.0:
            level = "SUSPICIOUS"
            trust_status = "Suspicious"
            color = "yellow"
        else:
            level = "SAFE"
            trust_status = "Trusted"
            color = "green"

        detected_issues = []
        anomalies_detected = []
        recommended_action = "Allow Session Login"
        recommended_actions = []
        
        if fraud_type == "Account Takeover" or failed_logins >= 3:
            detected_issues = ["New Device", "Location Deviation", "Behavioral Anomaly"]
            anomalies_detected = [
                f"Suspicious session activity. Sequence of {failed_logins} failed logins followed by successful auth.",
                "Behavioral biometrics indicate abnormal typing speed and click intervals, suggesting non-owner manual session hijacking."
            ]
            recommended_action = "Trigger Step-Up Authentication"
            recommended_actions = ["Trigger Step-Up Authentication", "Force full identity re-verification challenge (KYC upload or video auth)"]
            
        elif fraud_type == "Synthetic Identity Fraud" or tx.get("is_synthetic", False) or fraud_type == "KYC Fraud":
            detected_issues = ["Identity Mismatch", "Disposable Email Address", "Device Overlay"]
            anomalies_detected = [
                f"Identity mismatch alert. PAN card number {pan} is linked to a different name index than target '{name}'.",
                "Device link overlap: Multiple distinct profiles transacting from the same physical hardware ID."
            ]
            recommended_action = "Flag Profile as High-Risk Synthetic Suspect"
            recommended_actions = ["Flag customer profile as high-risk synthetic suspect", "Submit audit alert to national identity clearing bureaus"]
            
        elif fraud_type == "Bot Attack" or tx.get("typing_speed", 120.0) > 300.0:
            detected_issues = ["Mechanical Typing Inputs", "Robotic Mouse Jitter", "Headless Browser Footprint"]
            anomalies_detected = [
                "Bot signature detected. Interactive typing and click patterns show zero millisecond variances.",
                "Instant straight-line mouse navigation tracks directly to action elements, bypassing human speed limits."
            ]
            recommended_action = "Initiate Advanced Behavioral CAPTCHA challenge"
            recommended_actions = ["De-authenticate session token immediately", "Enable mandatory advanced behavioral CAPTCHA challenge"]

        elif fraud_type == "Suspicious Recovery":
            detected_issues = ["Recent SIM Swap Alert", "New Recovery Location Deviation", "High-Frequency Reset Attempts"]
            anomalies_detected = [
                "Telecom telemetry indicates recent SIM swap in last 72 hours.",
                "Recovery initiated from unrecognized location & device fingerprint."
            ]
            recommended_action = "Initiate Security Trustee Verification"
            recommended_actions = ["Suspend Recovery Request", "Initiate out-of-band verification via security trustee contacts"]

        elif fraud_type == "Insider Threat":
            detected_issues = ["Out of Hours Activity", "Mass Database Export Spikes", "Unauthorized Privilege Escalation"]
            anomalies_detected = [
                "SysAdmin privileges used to download customer PII vault tables outside standard business hours.",
                "Multiple root console access escalations logged."
            ]
            recommended_action = "Revoke Administrator Session Tokens"
            recommended_actions = ["Revoke Administrator Token", "Freeze corporate profile access rights", "Initiate insider disciplinary escalation"]

        elif fraud_type == "Device Risk":
            detected_issues = ["Rooted Device detected", "Emulator fingerprint found", "VPN/Tor IP Routing"]
            anomalies_detected = [
                "The device operating system has root/jailbreak markers active.",
                "Access initiated from blacklisted VPN/Tor node address."
            ]
            recommended_action = "Enforce Multi-Factor Authentication Challenge"
            recommended_actions = ["Force MFA Check", "Restrict dynamic session permissions"]

        elif fraud_type == "Behavioral Anomaly":
            detected_issues = ["Typing Speed Anomaly", "Linear Mouse Jitter Deviation", "Click Velocity Anomaly"]
            anomalies_detected = [
                "Significant speed deviation in alphanumeric input relative to baseline typing cadence.",
                "Mouse navigation shows linear, zero-jitter pathing indicators bypass patterns."
            ]
            recommended_action = "Trigger Face Verification Challenge"
            recommended_actions = ["Trigger Biometric Re-Verification", "Enforce mandatory face verification step-up"]

        else: # Default check
            if amount > 500.0:
                anomalies_detected.append(f"Transaction volume of ${amount:.2f} exceeds standard parameters.")
                detected_issues.append("Volume Anomaly")
            if distance > 200.0:
                anomalies_detected.append(f"Cleared from anomalous location: {distance:.1f} miles from home.")
                detected_issues.append("Location Drift")
            
            if not anomalies_detected:
                anomalies_detected.append("All features fall within standard profile deviations.")
                detected_issues.append("None")
                recommended_action = "Authorize frictionless clearing"
                recommended_actions.append("Authorize transaction clearing")
            else:
                recommended_action = "Request transaction confirmation via push notification"
                recommended_actions.append("Request transaction confirmation via mobile push notification")

        summary = f"Identity Trust Status is {trust_status} for ID #{tx.get('id', 'NEW')}. Reason: '{fraud_type}'."
        
        report = {
            "transaction_id": tx.get("id", "NEW"),
            "risk_rating": level,
            "identity_trust_status": trust_status,
            "risk_color": color,
            "summary": summary,
            "detected_risks": detected_issues, # Keep key for backwards compatibility
            "detected_issues": detected_issues,
            "anomalies_detected": anomalies_detected,
            "recommended_actions": recommended_actions, # Keep key
            "recommended_action": recommended_action,
            "analyst_notes": f"Identity Trust telemetry indicates critical alert matches for {', '.join(detected_issues)}. This briefing was compiled by the GenAI Analyst using biometric logs and verification telemetry from {bank}."
        }
        
        return report

