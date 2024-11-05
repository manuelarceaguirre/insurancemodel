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
          // Set initial predictions
          const firstKey = Object.keys(data.predictions)[0];
          if (firstKey) {
            setCurrentPredictions(data.predictions[firstKey].predictions || []);
            setCurrentMetrics(data.predictions[firstKey].metrics || currentMetrics);
          }
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

  // Add handler for parameter changes
  const handleParamChange = (param, value) => {
    const newParams = { ...selectedParams, [param]: value };
    setSelectedParams(newParams);
    
    // Create the key to look up predictions
    const key = `${newParams.n_estimators}-${newParams.learning_rate}-${newParams.max_depth}`;
    
    if (allPredictions[key]) {
      setCurrentPredictions(allPredictions[key].predictions);
      setCurrentMetrics(allPredictions[key].metrics);
    }
  };

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

      {/* Add Parameter Controls */}
      <div className={styles.parameterControls}>
        <div className={styles.parameterGroup}>
          <label>Number of Estimators:</label>
          <select 
            value={selectedParams.n_estimators}
            onChange={(e) => handleParamChange('n_estimators', Number(e.target.value))}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>

        <div className={styles.parameterGroup}>
          <label>Learning Rate:</label>
          <select 
            value={selectedParams.learning_rate}
            onChange={(e) => handleParamChange('learning_rate', Number(e.target.value))}
          >
            <option value={0.01}>0.01</option>
            <option value={0.05}>0.05</option>
            <option value={0.1}>0.10</option>
          </select>
        </div>

        <div className={styles.parameterGroup}>
          <label>Max Depth:</label>
          <select 
            value={selectedParams.max_depth}
            onChange={(e) => handleParamChange('max_depth', Number(e.target.value))}
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ModelVisualizer;