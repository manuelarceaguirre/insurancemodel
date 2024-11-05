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
  const [bestModel, setBestModel] = useState({
    params: {
      n_estimators: 100,
      learning_rate: 0.05,
      max_depth: 3
    },
    metrics: {
      rmse: 4294.46,
      mae: 2473.41,
      r2: 0.8812
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParams, setSelectedParams] = useState({
    n_estimators: 100,
    learning_rate: 0.05,
    max_depth: 3
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/predictAll');
        const data = await response.json();
        
        if (data?.predictions) {
          setAllPredictions(data.predictions);
          updatePredictions(data.predictions, selectedParams);
        }

        if (data?.bestConfig) {
          setBestModel({
            params: {
              n_estimators: data.bestConfig.n_estimators,
              learning_rate: data.bestConfig.learning_rate,
              max_depth: data.bestConfig.max_depth
            },
            metrics: data.bestConfig.metrics
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load model predictions');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const updatePredictions = (predictions, params) => {
    const key = `${params.n_estimators}-${params.learning_rate}-${params.max_depth}`;
    if (predictions[key]) {
      setCurrentPredictions(predictions[key].predictions);
      setCurrentMetrics(predictions[key].metrics);
    }
  };

  const handleParamChange = (param, value) => {
    const newParams = { ...selectedParams };
    
    // Round the values to match available options
    if (param === 'n_estimators') {
      const values = [50, 100, 200];
      newParams[param] = values.reduce((prev, curr) => 
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
    } else if (param === 'learning_rate') {
      const values = [0.01, 0.05, 0.1];
      newParams[param] = values.reduce((prev, curr) => 
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
    } else if (param === 'max_depth') {
      const values = [2, 3, 5];
      newParams[param] = values.reduce((prev, curr) => 
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
    }

    // Create the exact key format that matches our data
    const key = `${newParams.n_estimators}-${newParams.learning_rate}-${newParams.max_depth}`;
    console.log('Looking for predictions with key:', key);
    console.log('Available keys:', Object.keys(allPredictions));

    if (allPredictions[key]) {
      console.log('Found predictions for:', key);
      setCurrentPredictions(allPredictions[key].predictions);
      setCurrentMetrics(allPredictions[key].metrics);
    } else {
      console.log('No predictions found for:', key);
    }

    setSelectedParams(newParams);
  };

  // Add this useEffect to monitor state changes
  useEffect(() => {
    console.log('Current Predictions:', currentPredictions);
    console.log('Current Metrics:', currentMetrics);
  }, [currentPredictions, currentMetrics]);

  if (isLoading) return <div className={styles.loading}>Loading model predictions...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className={styles.visualizerContainer}>
      <h2>Insurance Cost Prediction Model</h2>
      
      <div className={styles.metricsContainer}>
        <div className={styles.metric}>
          <label>RMSE:</label>
          <span>{formatCurrency(currentMetrics?.rmse || 0)}</span>
        </div>
        <div className={styles.metric}>
          <label>MAE:</label>
          <span>{formatCurrency(currentMetrics?.mae || 0)}</span>
        </div>
        <div className={styles.metric}>
          <label>R² Score:</label>
          <span>{(currentMetrics?.r2 || 0).toFixed(4)}</span>
        </div>
      </div>

      <div className={styles.bestModelInfo}>
        <h3>Best Model Configuration</h3>
        <div className={styles.bestModelParams}>
          <div>Number of Estimators: {bestModel.params.n_estimators}</div>
          <div>Learning Rate: {bestModel.params.learning_rate}</div>
          <div>Max Depth: {bestModel.params.max_depth}</div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={currentPredictions}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="index"
              label={{ value: 'Sample Index', position: 'bottom', offset: 0 }}
            />
            <YAxis 
              label={{ value: 'Insurance Charges (USD)', angle: -90, position: 'insideLeft' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value) => formatCurrency(value)}
              labelFormatter={(index) => `Sample ${index}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#8884d8" 
              name="Actual Cost"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#82ca9d" 
              name="Predicted Cost"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.parameterControls}>
        <div className={styles.parameterGroup}>
          <label>Number of Estimators: {selectedParams.n_estimators}</label>
          <input 
            type="range"
            min="50"
            max="200"
            step="50"
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
            step="0.01"
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
            step="1"
            value={selectedParams.max_depth}
            onChange={(e) => handleParamChange('max_depth', Number(e.target.value))}
            className={styles.slider}
          />
        </div>
      </div>
    </div>
  );
};

export default ModelVisualizer;