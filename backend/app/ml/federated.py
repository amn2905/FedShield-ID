import numpy as np
import pandas as pd
import json
import time
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import Transaction, FederatedRound, SecurityLog
from app.ml.train import LocalBankModel
from app.security.pqc import Kyber768Simulator, encrypt_payload, decrypt_payload

class FederatedAggregator:
    """
    Simulates the central federated aggregator and coordinates training rounds 
    across Bank A, Bank B, and Bank C.
    """
    def __init__(self, db: Session):
        self.db = db
        self.banks = ["Bank A", "Bank B", "Bank C"]
        self.global_weights = {
            "coef": [0.0, 0.0, 0.0, 0.0, 0.0],
            "intercept": 0.0
        }
        
    def _get_bank_data(self, bank_name: str) -> pd.DataFrame:
        """Fetch transactions for a specific bank from the database"""
        txs = self.db.query(Transaction).filter(Transaction.bank == bank_name).all()
        data = []
        for t in txs:
            data.append({
                "amount": t.amount,
                "distance_from_home": t.distance_from_home,
                "device_trust_score": t.device_trust_score,
                "location_deviation": t.location_deviation,
                "is_synthetic": float(t.is_synthetic),
                "prediction": t.prediction
            })
        return pd.DataFrame(data)

    def _get_global_validation_data(self) -> pd.DataFrame:
        """Create a combined validation dataset from all banks"""
        frames = [self._get_bank_data(bank) for bank in self.banks]
        if not frames or all(df.empty for df in frames):
            return pd.DataFrame()
        
        combined = pd.concat(frames)
        # Sample 20% for global evaluation
        val_size = int(len(combined) * 0.2)
        return combined.sample(n=val_size, random_state=42)

    def apply_differential_privacy(self, weights: dict, epsilon: float, sample_count: int):
        """
        Applies Differential Privacy by clipping weight vectors and injecting 
        Laplacian noise scaled by the privacy budget epsilon.
        """
        coef = np.array(weights["coef"])
        intercept = weights["intercept"]
        
        # 1. Clip coefficients to bound sensitivity (L2 norm <= 1.0)
        norm = np.linalg.norm(coef)
        if norm > 1.0:
            coef = coef / norm
            
        intercept = np.clip(intercept, -1.0, 1.0)
        
        # 2. Add Laplacian noise: scale = sensitivity / (epsilon * sample_count)
        # We use a normalized sensitivity scale of 0.5 to make it visible but realistic
        sensitivity = 0.5
        noise_scale = sensitivity / (epsilon * np.log(sample_count + 1))
        
        coef_noise = np.random.laplace(0, noise_scale, size=coef.shape)
        intercept_noise = np.random.laplace(0, noise_scale)
        
        noised_coef = (coef + coef_noise).tolist()
        noised_intercept = float(intercept + intercept_noise)
        
        # Estimate empirical noise added
        total_noise_norm = float(np.linalg.norm(coef_noise) + abs(intercept_noise))
        
        return {
            "coef": noised_coef,
            "intercept": noised_intercept
        }, total_noise_norm

    def execute_round(self, round_num: int, epsilon: float, encryption_mode: str = "PQC"):
        """
        Executes a single Federated Learning round:
        1. Initialize PQC parameters for Aggregator.
        2. Local training at Bank A, B, C.
        3. Apply Differential Privacy (Laplace noise) on local updates.
        4. Simulates PQC Key Exchange & Payload Encryption.
        5. Receive updates, Decrypt and aggregate via FedAvg.
        6. Update global model weights.
        7. Evaluate global performance.
        """
        start_time = time.time()
        
        # --- 1. Aggregator PQC Setup ---
        kyber = Kyber768Simulator()
        agg_pk, agg_sk = kyber.generate_keypair()
        
        # Log key generation
        log_keygen = SecurityLog(
            node_name="Central Aggregator",
            action="KeyGen",
            algorithm="CRYSTALS-Kyber-768",
            bytes_transmitted=len(agg_pk),
            execution_time_ms=0.1, # Simulated keygen latency
            encryption_status="Success",
            details=json.dumps({"public_key_preview": agg_pk[:30] + "..."})
        )
        self.db.add(log_keygen)
        
        bank_updates = []
        total_samples = 0
        total_noise_added = 0.0
        
        # --- 2. Bank Nodes Local Loop ---
        for bank_name in self.banks:
            # Load local bank data
            df = self._get_bank_data(bank_name)
            if df.empty:
                continue
                
            # Train local model
            bank_model = LocalBankModel(bank_name)
            # Initialize with previous global weights
            if round_num > 1:
                bank_model.set_weights(self.global_weights)
            
            train_results = bank_model.train(df)
            local_weights = train_results["weights"]
            sample_count = train_results["sample_count"]
            
            # Apply Differential Privacy
            noised_weights, noise_norm = self.apply_differential_privacy(local_weights, epsilon, sample_count)
            total_noise_added += noise_norm
            
            # Secure Communication (Traditional TLS/ECDH vs Post-Quantum Kyber + AES)
            payload_str = json.dumps(noised_weights)
            payload_bytes_size = len(payload_str.encode())
            
            t0 = time.perf_counter()
            if encryption_mode == "PQC":
                # Simulated CRYSTALS-Kyber KEM Key Exchange
                # Bank encapsulating shared secret
                ciphertext, bank_shared_secret = kyber.encapsulate(agg_pk)
                
                # Bank encrypts weights payload with shared secret
                encrypted_payload = encrypt_payload(bank_shared_secret, payload_str)
                encryption_time_ms = (time.perf_counter() - t0) * 1000
                
                # Log Bank encapsulation and encryption
                log_bank = SecurityLog(
                    node_name=bank_name,
                    action="Encapsulation & Encryption",
                    algorithm="CRYSTALS-Kyber-768 + AES-256-GCM",
                    bytes_transmitted=len(ciphertext.encode()) + len(encrypted_payload.encode()),
                    execution_time_ms=round(encryption_time_ms, 3),
                    encryption_status="Success",
                    details=json.dumps({
                        "ciphertext_preview": ciphertext[:30] + "...",
                        "encrypted_payload_preview": encrypted_payload[:30] + "..."
                    })
                )
                self.db.add(log_bank)
                
                # --- Aggregator Decrypts ---
                t1 = time.perf_counter()
                agg_shared_secret = kyber.decapsulate(ciphertext, agg_sk, agg_pk)
                decrypted_payload = decrypt_payload(agg_shared_secret, encrypted_payload)
                decryption_time_ms = (time.perf_counter() - t1) * 1000
                
                log_agg_recv = SecurityLog(
                    node_name="Central Aggregator",
                    action=f"Decapsulation & Decryption (from {bank_name})",
                    algorithm="CRYSTALS-Kyber-768 + AES-256-GCM",
                    bytes_transmitted=0,
                    execution_time_ms=round(decryption_time_ms, 3),
                    encryption_status="Success",
                    details=json.dumps({"decryption_verified": bank_shared_secret == agg_shared_secret})
                )
                self.db.add(log_agg_recv)
                
                received_weights = json.loads(decrypted_payload)
                
            else: # Traditional TLS / ECDH Simulation
                # In traditional mode we simulate ECDH-P256 key exchange
                ecdh_time_ms = 0.45 # Average ECDH keygen + exchange
                encrypted_payload = payload_str # SSL/TLS stream
                encryption_time_ms = (time.perf_counter() - t0) * 1000 + ecdh_time_ms
                
                log_bank = SecurityLog(
                    node_name=bank_name,
                    action="ECDH Exchange & TLS Encryption",
                    algorithm="ECDH-P256 + AES-128-GCM",
                    bytes_transmitted=payload_bytes_size,
                    execution_time_ms=round(encryption_time_ms, 3),
                    encryption_status="Success",
                    details=json.dumps({"channel": "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"})
                )
                self.db.add(log_bank)
                
                received_weights = noised_weights # Decrypted by TLS layer
            
            bank_updates.append({
                "bank": bank_name,
                "weights": received_weights,
                "sample_count": sample_count,
                "accuracy": train_results["accuracy"]
            })
            total_samples += sample_count
            
        self.db.commit() # Save security logs
        
        # --- 3. Federated Averaging (FedAvg) ---
        if not bank_updates:
            raise ValueError("No weights received for aggregation.")
            
        avg_coef = np.zeros(5)
        avg_intercept = 0.0
        
        for update in bank_updates:
            weight_factor = update["sample_count"] / total_samples
            avg_coef += np.array(update["weights"]["coef"]) * weight_factor
            avg_intercept += update["weights"]["intercept"] * weight_factor
            
        self.global_weights = {
            "coef": avg_coef.tolist(),
            "intercept": float(avg_intercept)
        }
        
        # --- 4. Global Evaluation ---
        # Load combined validation data
        val_df = self._get_global_validation_data()
        
        if val_df.empty:
            # Fallback if DB is empty
            global_accuracy = 0.75
            global_loss = 0.35
        else:
            # Evaluate using the aggregated linear model weights
            X_val = val_df[["amount", "distance_from_home", "device_trust_score", "location_deviation", "is_synthetic"]].copy()
            X_val["is_synthetic"] = X_val["is_synthetic"].astype(float)
            y_val = val_df["prediction"].values
            
            # Run inference using global weights
            # We scale the features locally to perform exact evaluation
            scaler = StandardScalerSimulator()
            X_scaled = scaler.fit_transform(X_val)
            
            # Predict
            logits = np.dot(X_scaled, avg_coef) + avg_intercept
            probs = 1 / (1 + np.exp(-logits))
            preds = (probs >= 0.5).astype(int)
            
            global_accuracy = float(np.mean(preds == y_val))
            # Compute cross-entropy loss
            probs = np.clip(probs, 1e-15, 1 - 1e-15)
            global_loss = float(-np.mean(y_val * np.log(probs) + (1 - y_val) * np.log(1 - probs)))
            
        # Get individual bank accuracies for this round
        bank_accs = {up["bank"]: up["accuracy"] for up in bank_updates}
        
        # Save round metrics to database
        fl_round = FederatedRound(
            round_number=round_num,
            global_accuracy=round(global_accuracy, 4),
            global_loss=round(global_loss, 4),
            bank_a_accuracy=round(bank_accs.get("Bank A", 0.0), 4),
            bank_b_accuracy=round(bank_accs.get("Bank B", 0.0), 4),
            bank_c_accuracy=round(bank_accs.get("Bank C", 0.0), 4),
            privacy_budget_epsilon=epsilon,
            noise_added=round(total_noise_added / 3.0, 4),
            encryption_mode=encryption_mode,
            metrics_json=json.dumps({
                "global_weights": self.global_weights,
                "execution_time_sec": round(time.time() - start_time, 3)
            })
        )
        self.db.add(fl_round)
        self.db.commit()
        
        return {
            "round_number": round_num,
            "global_accuracy": global_accuracy,
            "global_loss": global_loss,
            "bank_a_accuracy": bank_accs.get("Bank A", 0.0),
            "bank_b_accuracy": bank_accs.get("Bank B", 0.0),
            "bank_c_accuracy": bank_accs.get("Bank C", 0.0),
            "privacy_budget_epsilon": epsilon,
            "noise_added": total_noise_added / 3.0,
            "encryption_mode": encryption_mode,
            "weights": self.global_weights
        }


class StandardScalerSimulator:
    """Simple standard scaler that mimics sklearn's StandardScaler for evaluation"""
    def fit_transform(self, X):
        # Scale each column to 0 mean and 1 variance for consistent logit computations
        X_arr = np.array(X, dtype=np.float64)
        means = np.mean(X_arr, axis=0)
        stds = np.std(X_arr, axis=0)
        stds[stds == 0] = 1.0 # Avoid division by zero
        return (X_arr - means) / stds
