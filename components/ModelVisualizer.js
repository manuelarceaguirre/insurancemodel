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

  // Valid values from the available keys
  const validValues = {
    n_estimators: [50, 100, 200],
    learning_rate: [0.01, 0.05, 0.1],
    max_depth: [2, 3, 5]
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/predictAll');
        const data = await response.json();
        console.log("Initial data load:", {
          availableKeys: Object.keys(data.predictions),
          samplePrediction: data.predictions['100-0.05-3']?.predictions?.slice(0, 5)
        });
        setAllPredictions(data.predictions);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleParamChange = (param, value) => {
    const getClosestValue = (value, validOptions) => {
      return validOptions.reduce((prev, curr) => 
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
    };

    const newParams = { ...selectedParams };
    newParams[param] = value;

    // Create the key for lookup
    const key = `${newParams.n_estimators}-${newParams.learning_rate}-${newParams.max_depth}`;
    
    if (allPredictions[key]) {
      // Force a new array reference to trigger re-render
      setCurrentPredictions([...allPredictions[key].predictions]);
      console.log("Updating predictions with new data:", allPredictions[key].predictions.slice(0, 5));
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
            step="1"
            value={selectedParams.n_estimators}
            onChange={(e) => handleParamChange('n_estimators', Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.tickmarks}>
            <span>50</span>
            <span>100</span>
            <span>200</span>
          </div>
        </div>

        <div className={styles.parameterGroup}>
          <label>Learning Rate: {selectedParams.learning_rate.toFixed(2)}</label>
          <input 
            type="range"
            min="0.01"
            max="0.1"
            step="0.001"
            value={selectedParams.learning_rate}
            onChange={(e) => handleParamChange('learning_rate', Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.tickmarks}>
            <span>0.01</span>
            <span>0.05</span>
            <span>0.1</span>
          </div>
        </div>

        <div className={styles.parameterGroup}>
          <label>Max Depth: {selectedParams.max_depth}</label>
          <input 
            type="range"
            min="2"
            max="5"
            step="1"
            value={selectedParams.max_depth}
            onChange={(e) => handleParamChange('max_depth', Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.tickmarks}>
            <span>2</span>
            <span>3</span>
            <span>5</span>
          </div>
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
              interval={20}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={['auto', 'auto']}
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
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#82ca9d"
              name="Predicted"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ModelVisualizer;