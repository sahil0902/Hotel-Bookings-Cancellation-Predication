import pandas as pd
import numpy as np
import joblib
import sys
import json
import logging
from typing import Dict, Any
import shap
import matplotlib.pyplot as plt

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load model and feature names only once when the script starts
try:
    logging.info("Loading the Decision Tree model from hotel_booking_model.pkl")
    MODEL = joblib.load("hotel_booking_model.pkl")
    logging.info("Model loaded successfully.")

    logging.info("Loading feature names from feature_names.pkl")
    FEATURE_NAMES = joblib.load("feature_names.pkl")
    logging.info("Feature names loaded successfully.")

    # Initialize SHAP TreeExplainer
    logging.info("Initializing SHAP TreeExplainer.")
    explainer = shap.TreeExplainer(MODEL)
    logging.info("SHAP Explainer initialized.")

except Exception as e:
    logging.error(f"Failed to load model or feature names: {e}")
    sys.exit(json.dumps({"error": "Model loading error", "message": str(e)}))

def preprocess_input(data: Dict[str, Any]) -> pd.DataFrame:
    # Initialize DataFrame with input data
    df = pd.DataFrame([data])
    
    # Add missing numerical features if not present
    numerical_features = [
        'lead_time', 'stays_in_weekend_nights', 'stays_in_week_nights',
        'adults', 'children', 'babies', 'adr', 
        'previous_cancellations', 'previous_bookings_not_canceled'
    ]
    
    for feature in numerical_features:
        if feature not in df.columns:
            df[feature] = 0
    
    # List of categorical features to be one-hot encoded
    categorical_features = ['country', 'distribution_channel', 'deposit_type']
    
    # Perform one-hot encoding on categorical variables
    df_encoded = pd.get_dummies(df, columns=categorical_features, prefix=categorical_features)
    
    # Identify missing one-hot encoded columns based on FEATURE_NAMES
    # and add them with default value 0
    for feature in FEATURE_NAMES:
        if feature not in df_encoded.columns:
            df_encoded[feature] = 0
    
    # Ensure correct column order
    df_final = df_encoded[FEATURE_NAMES]
    
    return df_final

def get_shap_values(df: pd.DataFrame, original_input: Dict[str, Any]) -> Dict[str, float]:
    """Get SHAP values for the input data and aggregate them to original features,
    excluding features with zero input values."""
    shap_values = explainer.shap_values(df)
    shap_values_dict = dict(zip(FEATURE_NAMES, shap_values[1][0]))
    
    # Define categorical features and their one-hot encoded columns
    categorical_features = {
        'country': [col for col in FEATURE_NAMES if col.startswith('country_')],
        'distribution_channel': [col for col in FEATURE_NAMES if col.startswith('distribution_channel_')],
        'deposit_type': [col for col in FEATURE_NAMES if col.startswith('deposit_type_')]
    }

    # Aggregate SHAP values
    aggregated_shap_values = {}

    # For numerical features, include only if input value is non-zero
    numerical_features_list = ['lead_time', 'stays_in_weekend_nights', 'stays_in_week_nights',
                               'adults', 'children', 'babies', 'adr',
                               'previous_cancellations', 'previous_bookings_not_canceled']
    for feature in numerical_features_list:
        input_value = original_input.get(feature, 0)
        if input_value != 0:
            shap_value = shap_values_dict.get(feature, 0)
            aggregated_shap_values[feature] = shap_value

    # For categorical features, always include them
    for feature, columns in categorical_features.items():
        shap_sum = sum([shap_values_dict.get(col, 0) for col in columns])
        aggregated_shap_values[feature] = shap_sum

    # Optionally, filter out features with zero SHAP values
    filtered_shap_values = {k: v for k, v in aggregated_shap_values.items() if v != 0}

    return filtered_shap_values
    """Get SHAP values for the input data and aggregate them to original features."""
    shap_values = explainer.shap_values(df)
    shap_values_dict = dict(zip(FEATURE_NAMES, shap_values[1][0]))
    
    # Define your categorical features and their one-hot encoded columns
    categorical_features = {
        'country': [col for col in FEATURE_NAMES if col.startswith('country_')],
        'distribution_channel': [col for col in FEATURE_NAMES if col.startswith('distribution_channel_')],
        'deposit_type': [col for col in FEATURE_NAMES if col.startswith('deposit_type_')]
    }

    # Aggregate SHAP values
    aggregated_shap_values = {}

    # For numerical features, directly assign their SHAP values
    numerical_features_list = ['lead_time', 'stays_in_weekend_nights', 'stays_in_week_nights',
                               'adults', 'children', 'babies', 'adr',
                               'previous_cancellations', 'previous_bookings_not_canceled']
    for feature in numerical_features_list:
        aggregated_shap_values[feature] = shap_values_dict.get(feature, 0)

    # For categorical features, sum the SHAP values of their one-hot encoded columns
    for feature, columns in categorical_features.items():
        shap_sum = sum([shap_values_dict.get(col, 0) for col in columns])
        aggregated_shap_values[feature] = shap_sum

    # Optionally, filter out features with zero SHAP values
    filtered_shap_values = {k: v for k, v in aggregated_shap_values.items() if v != 0}

    return filtered_shap_values
def predict(input_data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        # Store the original input data
        original_input = input_data.copy()

        logging.info("Starting data preprocessing.")
        df = preprocess_input(input_data)
        logging.info(f"Input data converted to DataFrame:\n{df}")

        logging.info("Making prediction.")
        prediction = bool(MODEL.predict(df)[0])
        probabilities = MODEL.predict_proba(df)[0]

        # Get class probabilities
        cancel_probability = float(probabilities[1])
        not_cancel_probability = float(probabilities[0])

        # Get SHAP feature importance
        feature_importance = get_shap_values(df, original_input)

        # Prepare detailed response
        result = {
            "prediction": prediction,
            "cancel_probability": cancel_probability,
            "not_cancel_probability": not_cancel_probability,
            "feature_importance": feature_importance,
            "input_features": {
                "numerical": {k: float(v) for k, v in original_input.items() if isinstance(v, (int, float))},
                "categorical": {k: v for k, v in original_input.items() if isinstance(v, str)}
            }
        }

        logging.info(f"Prediction result: {result}")
        return result

    except Exception as e:
        logging.error(f"Prediction error: {e}")
        return {"error": "Prediction error", "message": str(e)}
    try:
        # Store the original input data
        original_input = input_data.copy()
        logging.info("Starting data preprocessing.")
        df = preprocess_input(input_data)
        logging.info(f"Input data converted to DataFrame:\n{df}")

        logging.info("Making prediction.")
        prediction = bool(MODEL.predict(df)[0])
        probabilities = MODEL.predict_proba(df)[0]
        
        # Get class probabilities
        cancel_probability = float(probabilities[1])
        not_cancel_probability = float(probabilities[0])
        
        # Get SHAP feature importance
        shap_values_dict = get_shap_values(df, original_input)
        
        # Prepare detailed response
        result = {
            "prediction": prediction,
            "cancel_probability": cancel_probability,
            "not_cancel_probability": not_cancel_probability,
            "feature_importance": shap_values_dict,
            "input_features": {
                "numerical": {k: float(v) for k, v in original_input.items() if isinstance(v, (int, float))},
                "categorical": {k: v for k, v in original_input.items() if isinstance(v, str)}
            }
        }

        logging.info(f"Prediction result: {prediction} with cancel probability {cancel_probability}")
        return result

    except Exception as e:
        logging.error(f"Prediction error: {e}")
        return {"error": "Prediction error", "message": str(e)}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        logging.error("Invalid input. Expected JSON string as argument.")
        sys.exit(json.dumps({"error": "Invalid input", "message": "Expected JSON string as argument."}))

    input_json = sys.argv[1]
    try:
        input_data = json.loads(input_json)
        result = predict(input_data)
        print(json.dumps(result))
    except json.JSONDecodeError as e:
        logging.error(f"JSON decode error: {e}")
        sys.exit(json.dumps({"error": "Invalid JSON", "message": str(e)}))