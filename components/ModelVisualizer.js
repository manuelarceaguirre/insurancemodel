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

  // Available parameter values from your model
  const validParams = {
    n_estimators: [50, 100, 200],
    learning_rate: [0.01, 0.05, 0.1],
    max_depth: [2, 3, 5]
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/predictAll');
        const data = await response.json();
        console.log("Full data structure:", JSON.stringify(data, null, 2));
        
        if (data.predictions) {
          setAllPredictions(data.predictions);
          // Set initial predictions using the default parameters
          const initialKey = `${selectedParams.n_estimators}-${selectedParams.learning_rate}-${selectedParams.max_depth}`;
          console.log("Available keys:", Object.keys(data.predictions));
          console.log("Looking for initial key:", initialKey);
          if (data.predictions[initialKey]) {
            console.log("Sample of predictions:", data.predictions[initialKey].predictions.slice(0, 5));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleParamChange = (param, value) => {
    const newParams = { ...selectedParams };
    
    // Find the closest valid value for each parameter
    if (param === 'n_estimators') {
      const closest = validParams.n_estimators.reduce((prev, curr) => 
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      newParams[param] = closest;
    } else {
      newParams[param] = value;
    }

    const key = `${newParams.n_estimators}-${newParams.learning_rate}-${newParams.max_depth}`;
    console.log("Looking for key:", key);
    
    if (allPredictions[key]) {
      console.log("Found predictions for key:", key);
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
          <select 
            value={selectedParams.n_estimators}
            onChange={(e) => handleParamChange('n_estimators', Number(e.target.value))}
            className={styles.select}
          >
            {validParams.n_estimators.map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>

        <div className={styles.parameterGroup}>
          <label>Learning Rate: {selectedParams.learning_rate}</label>
          <select 
            value={selectedParams.learning_rate}
            onChange={(e) => handleParamChange('learning_rate', Number(e.target.value))}
            className={styles.select}
          >
            {validParams.learning_rate.map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>

        <div className={styles.parameterGroup}>
          <label>Max Depth: {selectedParams.max_depth}</label>
          <select 
            value={selectedParams.max_depth}
            onChange={(e) => handleParamChange('max_depth', Number(e.target.value))}
            className={styles.select}
          >
            {validParams.max_depth.map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
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
            data={currentPredictions || []}
            margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey="index"
              interval={20}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[0, 'auto']}
              tickFormatter={(value) => `$${Math.round(value/1000)}k`}
            />
            <Tooltip 
              formatter={(value) => `$${Math.round(value).toLocaleString()}`}
              labelFormatter={(index) => `Sample ${index}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#8884d8"
              name="Actual"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#82ca9d"
              name="Predicted"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ModelVisualizer;