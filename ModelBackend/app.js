const express = require('express');
const { PythonShell } = require('python-shell');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
// Configure CORS
const corsOptions = {
  origin: 'https://hotel-bookings-cancellation-predication-1.onrender.com',
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization',
};
app.use(cors(corsOptions));


// Pre-load the Python interpreter and model
const pythonExecutable = 'python3';
const scriptPath = path.resolve(__dirname);

// Configure PythonShell options once
const pythonOptions = {
  mode: 'json',
  pythonOptions: ['-u'],
  pythonPath: pythonExecutable,
  scriptPath: scriptPath,
};

// Prediction endpoint 
app.post('/predict', async (req, res) => {
  const startTime = process.hrtime();
  
  try {
    const inputData = req.body;
    
    const pyshell = new PythonShell('predict.py', {
      ...pythonOptions,
      args: [JSON.stringify(inputData)],
    });

    // const timeout = setTimeout(() => {
    //   pyshell.terminate();
    //   res.status(408).json({ error: 'Prediction timeout', message: 'The prediction process took too long and was terminated.' });
    // }, 5000);

    pyshell.on('message', (message) => {
      clearTimeout(timeout);
      
      const elapsedTime = process.hrtime(startTime);
      const duration = (elapsedTime[0] * 1e9 + elapsedTime[1]) / 1e6;
      
      console.log(`Prediction completed in ${duration.toFixed(2)}ms`);
      console.log('Prediction result:', message,duration.toFixed(2));
      res.json({
        status: 'success',
        duration: `${duration.toFixed(2)}ms`,
        result: message,
      });
    });

    pyshell.on('error', (err) => {
      clearTimeout(timeout);
      console.error('Prediction error:', err);
      res.status(500).json({ error: 'Prediction failed', message: err.message });
    });

    pyshell.end((err) => {
      if (err) {
        console.error('Process end error:', err);
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});