# Hotel-Bookings-Cancellation-Predication

## Project Description

This project aims to predict hotel booking cancellations using a machine learning model. The frontend is built with React and TypeScript, while the backend is built with Express.js and Python. The backend serves predictions via a REST API, and the frontend interacts with this API to provide a user-friendly interface for making predictions.

## Setup Instructions

### Frontend Setup

1. Navigate to the `HB-FrontEnd` directory:
   ```bash
   cd HB-FrontEnd
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to the `ModelBackend` directory:
   ```bash
   cd ModelBackend
   ```

2. Install the Node.js dependencies:
   ```bash
   npm install
   ```

3. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

## Usage

### Using the Prediction Feature

1. Open the frontend application in your browser (usually at `http://localhost:5173`).

2. Fill in the required fields in the booking form.

3. Click the "Predict Booking" button to get the prediction results.

### Example

1. Enter the following details in the booking form:
   - Lead Time: 50
   - Weekend Nights: 2
   - Week Nights: 5
   - Adults: 2
   - Children: 1
   - Babies: 0
   - Average Daily Rate: 100
   - Country: Germany
   - Distribution Channel: Direct
   - Deposit Type: No Deposit

2. Click "Predict Booking".

3. The prediction results will be displayed, indicating the likelihood of cancellation and key influencing factors.

## API Endpoints

### `/predict`

- **Method**: POST
- **Description**: Predicts the likelihood of a hotel booking cancellation.
- **Request Body**: JSON object containing the booking details.
- **Response**: JSON object containing the prediction result, probabilities, and feature importance.

#### Example Request

```bash
curl -X POST http://localhost:8080/predict -H "Content-Type: application/json" -d '{
  "lead_time": 50,
  "stays_in_weekend_nights": 2,
  "stays_in_week_nights": 5,
  "adults": 2,
  "children": 1,
  "babies": 0,
  "adr": 100,
  "country": "DEU",
  "distribution_channel": "Direct",
  "deposit_type": "No Deposit"
}'
```

#### Example Response

```json
{
  "status": "success",
  "duration": "123.45ms",
  "result": {
    "prediction": true,
    "cancel_probability": 0.75,
    "not_cancel_probability": 0.25,
    "feature_importance": {
      "lead_time": 0.1234,
      "stays_in_weekend_nights": 0.2345,
      "stays_in_week_nights": 0.3456,
      "adults": 0.4567,
      "children": 0.5678,
      "babies": 0.6789,
      "adr": 0.7890,
      "country": 0.8901,
      "distribution_channel": 0.9012,
      "deposit_type": 1.0123
    },
    "input_features": {
      "numerical": {
        "lead_time": 50,
        "stays_in_weekend_nights": 2,
        "stays_in_week_nights": 5,
        "adults": 2,
        "children": 1,
        "babies": 0,
        "adr": 100
      },
      "categorical": {
        "country": "DEU",
        "distribution_channel": "Direct",
        "deposit_type": "No Deposit"
      }
    }
  }
}
```
