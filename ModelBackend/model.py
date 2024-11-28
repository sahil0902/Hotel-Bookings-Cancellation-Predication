import pickle
import shap
import pandas as pd
import matplotlib.pyplot as plt

# Load the model from the pickle file
with open('./ModelBackend/hotel_booking_model.pkl', 'rb') as file:
    model = pickle.load(file)

# Verify the model type
print(f"Loaded model type: {type(model)}")  # Should output DecisionTreeClassifier

# Define your input data for prediction
X_input = pd.DataFrame({
    'previous_cancellations': [0],
    'previous_bookings_not_canceled': [1],
    'country_AGO': [0],
    'country_ARE': [0],
    'country_DEU': [1],
    'country_HKG': [0],
    'country_SAU': [0],
    'distribution_channel_Direct': [1],
    'deposit_type_Non Refund': [0]
})

# Create a SHAP explainer
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_input)

# Visualize the SHAP values for the prediction
shap.initjs()
shap.force_plot(explainer.expected_value[1], shap_values[1], X_input)