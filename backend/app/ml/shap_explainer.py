import numpy as np
import pandas as pd
import json

class ShapExplainer:
    """
    Computes SHAP values and generates compliance-ready natural language explanations
    for transaction fraud risks using the global federated model coefficients.
    """
    def __init__(self, global_weights: dict):
        self.weights = global_weights
        self.feature_cols = [
            "amount", 
            "distance_from_home", 
            "device_trust_score", 
            "location_deviation", 
            "is_synthetic"
        ]
        
        # Hardcode realistic dataset means and standard deviations for scaling
        # (Derived from data_generator.py baselines)
        self.means = {
            "amount": 120.0,
            "distance_from_home": 35.0,
            "device_trust_score": 82.0,
            "location_deviation": 0.8,
            "is_synthetic": 0.05
        }
        self.stds = {
            "amount": 150.0,
            "distance_from_home": 120.0,
            "device_trust_score": 25.0,
            "location_deviation": 1.1,
            "is_synthetic": 0.22
        }

    def compute_shap_values(self, transaction_data: dict) -> dict:
        """
        Calculates the SHAP values using the linear SHAP formula:
        SHAP_i = w_i * (x_i - mean_i) / std_i
        This shows the additive contribution of each feature to the logit/fraud score.
        """
        coef = self.weights.get("coef", [1.8, 1.5, -2.8, 2.2, 3.0])
        intercept = self.weights.get("intercept", -1.5)
        
        shap_vals = {}
        total_sum = intercept
        
        for idx, col in enumerate(self.feature_cols):
            val = float(transaction_data[col])
            # Scale feature
            scaled_val = (val - self.means[col]) / self.stds[col]
            # SHAP value = coefficient * scaled_value
            shap_val = coef[idx] * scaled_val
            shap_vals[col] = float(shap_val)
            total_sum += shap_val

        # Sigmoid of total sum yields predicted probability
        probability = 1 / (1 + np.exp(-total_sum))
        base_probability = 1 / (1 + np.exp(-intercept)) # Probability with average features
        
        # Normalize/Scale SHAP values so they sum up to the probability difference
        # for clean visual graphing (Probability Scale SHAP)
        prob_diff = probability - base_probability
        sum_shap = sum(abs(v) for v in shap_vals.values())
        
        prob_shap_vals = {}
        if sum_shap > 0:
            for col, val in shap_vals.items():
                # Distribute the probability difference proportionally
                prob_shap_vals[col] = float(prob_diff * (val / sum_shap))
        else:
            for col in self.feature_cols:
                prob_shap_vals[col] = 0.0
                
        return {
            "shap_values": prob_shap_vals,
            "base_value": float(base_probability),
            "prediction_probability": float(probability)
        }

    def generate_explanation(self, transaction_data: dict, shap_results: dict) -> str:
        """
        Generates a compliance-friendly text explanation outlining the key fraud triggers.
        """
        shap_vals = shap_results["shap_values"]
        prob = shap_results["prediction_probability"]
        
        # Sort features by absolute contribution to fraud risk
        sorted_triggers = sorted(
            [(col, val) for col, val in shap_vals.items()],
            key=lambda x: abs(x[1]),
            reverse=True
        )
        
        explanation_parts = []
        is_fraud = prob > 0.55
        
        if is_fraud:
            explanation_parts.append(
                f"This transaction was flagged as HIGH RISK (Fraud Probability: {prob*100:.1f}%) due to several anomalous features. "
            )
            
            reasons = []
            for col, val in sorted_triggers:
                val_raw = transaction_data[col]
                
                # Create explanations based on feature value and its contribution direction
                if col == "amount" and val > 0:
                    reasons.append(f"the transaction amount of ${val_raw:,.2f} is significantly higher than the historical average")
                elif col == "distance_from_home" and val > 0:
                    reasons.append(f"it was initiated {val_raw:,.1f} miles away from the customer's billing address")
                elif col == "device_trust_score" and val > 0:
                    # Remember: a lower device trust score increases risk (which gives positive SHAP)
                    reasons.append(f"the device trust score is low ({val_raw}/100), suggesting a new or compromised device")
                elif col == "location_deviation" and val > 0:
                    reasons.append(f"the location deviation is high ({val_raw:.2f}), which suggests a fast/impossible travel velocity")
                elif col == "is_synthetic" and val_raw is True:
                    reasons.append("the account exhibits signs of Synthetic Identity Fraud (SSN mismatch or recently modified profile)")
                    
            explanation_parts.append("Specifically, " + ", ".join(reasons[:3]) + ".")
        else:
            explanation_parts.append(
                f"This transaction is classified as LEGITIMATE (Fraud Probability: {prob*100:.1f}%). "
            )
            supporting = []
            for col, val in sorted_triggers:
                val_raw = transaction_data[col]
                if col == "device_trust_score" and val <= 0:
                    supporting.append(f"device trust is high ({val_raw}/100)")
                elif col == "distance_from_home" and val <= 0:
                    supporting.append(f"it occurred close to home ({val_raw:.1f} miles)")
                elif col == "amount" and val <= 0:
                    supporting.append(f"amount of ${val_raw:.2f} is within normal limits")
                    
            if supporting:
                explanation_parts.append("Risk levels are suppressed because " + " and ".join(supporting[:2]) + ".")
            else:
                explanation_parts.append("All features are within standard deviation parameters.")

        return " ".join(explanation_parts)
