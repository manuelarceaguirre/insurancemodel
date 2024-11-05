import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../styles/ModelVisualizer.module.css';

const ModelVisualizer = () => {
  const [allPredictions, setAllPredictions] = useState({});
  const [currentPredictions, setCurrentPredictions] = useState([]);
  const [currentMetrics, setCurrentMetrics] = useState({
    rmse: 4294.46,
    mae: 2473.41,
    r2: 0.8812
  });
  const [selectedParams, setSelectedParams] = useState({
    n_estimators: 100,
    learning_rate: 0.05,
    max_depth: 3
  });

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await fetch('/api/predictAll');
      const data = await response.json();
      
      if (data?.predictions) {
        setAllPredictions(data.predictions);
        // Set initial predictions
        const key = `${selectedParams.n_estimators}-${selectedParams.learning_rate}-${selectedParams.max_depth}`;
        if (data.predictions[key]) {
          setCurrentPredictions(data.predictions[key].predictions);
          setCurrentMetrics(data.predictions[key].metrics);
        }
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const handleParamChange = (param, value) => {
    const newParams = { ...selectedParams };
    
    // Use exact values from your model configurations
    if (param === 'n_estimators') {
      newParams[param] = value;
    } else if (param === 'learning_rate') {
      newParams[param] = value;
    } else if (param === 'max_depth') {
      newParams[param] = value;
    }

    // Create the exact key format that matches your data
    const key = `${newParams.n_estimators}-${newParams.learning_rate}-${newParams.max_depth}`;
    
    if (allPredictions[key]) {
      setCurrentPredictions(allPredictions[key].predictions);
      setCurrentMetrics(allPredictions[key].metrics);
    }

    setSelectedParams(newParams);
  };

  return (
    <div className={styles.visualizerContainer}>
      <h2>Insurance Cost Prediction Model</h2>

      <div className={styles.parameterControls}>
        <div className={styles.parameterGroup}>
          <label>Number of Estimators: {selectedParams.n_estimators}</label>
          <input 
            type="range"
            min="50"
            max="200"
            step="75"  // To match your exact values: 50, 100, 200
            value={selectedParams.n_estimators}
            onChange={(e) => handleParamChange('n_estimators', Number(e.target.value))}
            className={styles.slider}
          />
        </div>

        <div className={styles.parameterGroup}>
          <label>Learning Rate: {selectedParams.learning_rate.toFixed(2)}</label>
          <input 
            type="range"
            min="0.01"
            max="0.1"
            step="0.045"  // To match your exact values: 0.01, 0.05, 0.1
            value={selectedParams.learning_rate}
            onChange={(e) => handleParamChange('learning_rate', Number(e.target.value))}
            className={styles.slider}
          />
        </div>

        <div className={styles.parameterGroup}>
          <label>Max Depth: {selectedParams.max_depth}</label>
          <input 
            type="range"
            min="2"
            max="5"
            step="1.5"  // To match your exact values: 2, 3, 5
            value={selectedParams.max_depth}
            onChange={(e) => handleParamChange('max_depth', Number(e.target.value))}
            className={styles.slider}
          />
        </div>
      </div>

      <div className={styles.metricsContainer}>
        <div className={styles.metric}>
          <label>RMSE:</label>
          <span>{currentMetrics.rmse.toFixed(2)}</span>
        </div>
        <div className={styles.metric}>
          <label>MAE:</label>
          <span>{currentMetrics.mae.toFixed(2)}</span>
        </div>
        <div className={styles.metric}>
          <label>R² Score:</label>
          <span>{currentMetrics.r2.toFixed(4)}</span>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={currentPredictions}
            margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey="index"
              interval={20}  // Show fewer X-axis labels
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[0, 'auto']}  // Start from 0, auto-scale top
              tickFormatter={(value) => `$${Math.round(value/1000)}k`}  // Format as $k
            />
            <Tooltip 
              formatter={(value) => `$${Math.round(value).toLocaleString()}`}
              labelFormatter={(index) => `Sample ${index}`}
            />
            <Legend />
            <Line
              type="monotone"  // Makes the line smoother
              dataKey="actual"
              stroke="#8884d8"
              name="Actual"
              dot={false}  // Remove dots
              strokeWidth={2}  // Slightly thicker line
            />
            <Line
              type="monotone"  // Makes the line smoother
              dataKey="predicted"
              stroke="#82ca9d"
              name="Predicted"
              dot={false}  // Remove dots
              strokeWidth={2}  // Slightly thicker line
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ModelVisualizer;