import re
import numpy as np

class IdentityVerifier:
    """
    Validates PAN, email, phone parameters, checks cross-parameter consistency,
    detects synthetic identities, evaluates KYC fraud, and scores onboarding risk.
    """

    @staticmethod
    def verify_identity(data: dict) -> dict:
        """
        Validates the identity parameters provided.
        Returns detailed scoring and boolean indicator flags.
        """
        customer_name = data.get("customer_name", "Walk-in Client")
        pan_number = data.get("pan_number", "UNKNOWN")
        email = data.get("email_address", "")
        phone = data.get("phone_number", "")
        device_id = data.get("device_id", "dev_unknown")
        ip_address = data.get("ip_address", "127.0.0.1")

        fraud_indicators = []
        
        # 1. PAN Validation
        # Standard PAN format: 5 letters, 4 digits, 1 letter (e.g., APXPS1234F)
        pan_valid = True
        if pan_number == "UNKNOWN" or not re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]$", pan_number):
            pan_valid = False
            fraud_indicators.append("Invalid PAN Format")

        # 2. Email Reputation
        email_risk = 0.0
        if not email:
            email_risk = 50.0
            fraud_indicators.append("Missing Email Contact")
        else:
            temp_domains = ["tempmail.com", "yopmail.com", "mailinator.com", "guerrillamail.com"]
            domain = email.split("@")[-1].lower() if "@" in email else ""
            if domain in temp_domains:
                email_risk = 90.0
                fraud_indicators.append("Temporary Email Domain Detected")
            elif not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                email_risk = 80.0
                fraud_indicators.append("Malformed Email Address")
            else:
                # Normal reputation check (e.g. Gmail/Yahoo/Corporate domain)
                email_risk = 5.0

        # 3. Phone Reputation
        phone_risk = 0.0
        if not phone:
            phone_risk = 50.0
            fraud_indicators.append("Missing Phone Contact")
        else:
            # Check length and characters
            clean_phone = re.sub(r"\D", "", phone)
            if len(clean_phone) < 10:
                phone_risk = 85.0
                fraud_indicators.append("Invalid Phone Number Length")
            elif clean_phone.startswith("91000"): # Mock VOIP or fake range
                phone_risk = 75.0
                fraud_indicators.append("Virtual VOIP Provider Range Flagged")
            else:
                phone_risk = 8.0

        # 4. Identity Consistency Check
        # Checks if name correlates with PAN (mock check based on name overlap or predefined data)
        # For simulation, we check if the first letter of name matches anything or check synthetic flag
        consistency_risk = 0.0
        is_synthetic = data.get("is_synthetic", False)
        
        if is_synthetic:
            consistency_risk = 95.0
            fraud_indicators.append("PAN Owner Name Mismatch")
        else:
            # Minor random consistency deviations
            consistency_risk = 5.0

        # 5. Synthetic Identity Detection
        synthetic_risk = 0.0
        if is_synthetic or device_id == "dev_shared_mutant":
            synthetic_risk = 90.0
            if "PAN Owner Name Mismatch" not in fraud_indicators:
                fraud_indicators.append("PAN Owner Name Mismatch")
            fraud_indicators.append("Device Collusion Overlay Detected")
        else:
            synthetic_risk = 10.0

        # 6. KYC Risk Evaluation
        kyc_risk = 5.0
        if is_synthetic:
            kyc_risk = 85.0
            fraud_indicators.append("Tampered KYC Document Signature Detected")
        elif pan_number.startswith("XYZ"):
            kyc_risk = 60.0
            fraud_indicators.append("Unverified Identity Credentials")

        # 7. Device Fingerprinting Risk
        device_risk = 0.0
        if device_id == "dev_shared_mutant" or "Rooted" in data.get("device_name", "") or device_id == "dev_headless_chrome":
            device_risk = 85.0
            fraud_indicators.append("Rooted/Emulated Device Footprint")
        else:
            device_risk = 10.0

        # 8. Cumulative Onboarding Risk Assessment & Scores
        # Scores calculation
        kyc_risk_score = round(max(kyc_risk, email_risk * 0.4 + phone_risk * 0.4 + consistency_risk * 0.2), 2)
        synthetic_identity_score = round(synthetic_risk, 2)
        
        # Identity Confidence Score (100 - cumulative risk)
        base_confidence = 100.0
        deductions = 0.0
        if not pan_valid: deductions += 30
        if email_risk > 50: deductions += 20
        if phone_risk > 50: deductions += 20
        if consistency_risk > 50: deductions += 35
        if device_risk > 50: deductions += 25
        
        identity_confidence_score = round(max(5.0, base_confidence - deductions), 2)
        
        # Overall status
        if identity_confidence_score >= 80.0:
            status = "Trusted"
            risk_level = "Trusted"
        elif identity_confidence_score >= 50.0:
            status = "Suspicious"
            risk_level = "Suspicious"
        else:
            status = "High Risk"
            risk_level = "High Risk"

        return {
            "identity_confidence_score": identity_confidence_score,
            "kyc_risk_score": kyc_risk_score,
            "synthetic_identity_score": synthetic_identity_score,
            "status": status,
            "onboarding_risk_level": risk_level,
            "email_risk": email_risk,
            "phone_risk": phone_risk,
            "device_risk": device_risk,
            "fraud_indicators": fraud_indicators
        }
