import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import SGDClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import pickle
import os

class LocalBankModel:
    """
    Wrapper for local bank identity trust model.
    Trains a Random Forest for predictions, and an SGDClassifier (Logistic Regression) 
    for federated coefficient aggregation.
    """
    def __init__(self, bank_name: str):
        self.bank_name = bank_name
        self.rf_model = RandomForestClassifier(n_estimators=50, max_depth=6, random_state=42)
        # SGDClassifier with log_loss enables logistic regression via gradient descent (ideal for federated weight updates)
        self.linear_model = SGDClassifier(loss="log_loss", penalty="l2", max_iter=20, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
        # Features: [amount, distance_from_home, device_trust_score, location_deviation, is_synthetic]
        self.feature_cols = [
            "amount", 
            "distance_from_home", 
            "device_trust_score", 
            "location_deviation", 
            "is_synthetic"
        ]

    def _prepare_data(self, df: pd.DataFrame):
        X = df[self.feature_cols].copy()
        X["is_synthetic"] = X["is_synthetic"].astype(float)
        y = df["prediction"].values # Predict the generated fraud indicator
        return X, y

    def train(self, df: pd.DataFrame):
        """
        Trains both models on local bank data.
        """
        if df.empty:
            raise ValueError(f"No data available to train for {self.bank_name}")

        X, y = self._prepare_data(df)
        
        # Scale features
        self.scaler.fit(X)
        X_scaled = self.scaler.transform(X)
        
        # Fit Random Forest (for highly accurate predictions)
        self.rf_model.fit(X, y)
        
        # Fit SGDClassifier (for federated parameter weights)
        # We perform partial fit or standard fit
        self.linear_model.fit(X_scaled, y)
        
        self.is_trained = True
        
        # Calculate training metrics
        y_pred = self.rf_model.predict(X)
        accuracy = accuracy_score(y, y_pred)
        precision = precision_score(y, y_pred, zero_division=0)
        recall = recall_score(y, y_pred, zero_division=0)
        f1 = f1_score(y, y_pred, zero_division=0)
        cm = confusion_matrix(y, y_pred).tolist()
        
        # Get coefficients for federated sharing
        # coef_ shape: (1, n_features), intercept_ shape: (1,)
        weights = {
            "coef": self.linear_model.coef_[0].tolist(),
            "intercept": self.linear_model.intercept_[0].item()
        }
        
        return {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "confusion_matrix": cm,
            "weights": weights,
            "sample_count": len(df)
        }

    def predict(self, X_df: pd.DataFrame):
        """
        Inference using Random Forest.
        """
        if not self.is_trained:
            raise ValueError(f"Model for {self.bank_name} is not trained.")
            
        X = X_df[self.feature_cols].copy()
        X["is_synthetic"] = X["is_synthetic"].astype(float)
        
        preds = self.rf_model.predict(X)
        probs = self.rf_model.predict_proba(X)[:, 1] # Probability of fraud
        
        return preds, probs

    def get_weights(self):
        """
        Extract weights coefficients for Federated Learning.
        """
        if not self.is_trained:
            return None
        return {
            "coef": self.linear_model.coef_[0].tolist(),
            "intercept": float(self.linear_model.intercept_[0])
        }

    def set_weights(self, weights: dict):
        """
        Update the model's weights from the central aggregator.
        """
        self.linear_model.coef_ = np.array([weights["coef"]], dtype=np.float64)
        self.linear_model.intercept_ = np.array([weights["intercept"]], dtype=np.float64)
        self.is_trained = True

    def save_model(self, path: str):
        """
        Saves the local model state.
        """
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            pickle.dump({
                "rf_model": self.rf_model,
                "linear_model": self.linear_model,
                "scaler": self.scaler,
                "is_trained": self.is_trained
            }, f)

    def load_model(self, path: str):
        """
        Loads the local model state.
        """
        if os.path.exists(path):
            with open(path, "rb") as f:
                state = pickle.load(f)
                self.rf_model = state["rf_model"]
                self.linear_model = state["linear_model"]
                self.scaler = state["scaler"]
                self.is_trained = state["is_trained"]
            return True
        return False
