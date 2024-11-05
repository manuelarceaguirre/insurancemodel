import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import styles from '../styles/ModelVisualizer.module.css';

const ModelVisualizer = () => {
  const [allPredictions, setAllPredictions] = useState({});
  const [currentPredictions, setCurrentPredictions] = useState([]);
  const [currentMetrics, setCurrentMetrics] = useState({
    rmse: 0,
    mae: 0,
    r2: 0
  });
  const [bestModel, setBestModel] = useState({
    params: {
      n_estimators: 200,
      learning_rate: 0.1,
      max_depth: 4
    },
    metrics: {
      rmse: 0,
      mae: 0,
      r2: 0
    }
  });

  // Define valid parameter values
  const validParams = {
    n_estimators: [50, 100, 150, 200],
    learning_rate: [0.01, 0.05, 0.1],
    max_depth: [2, 3, 4, 5]
  };

  const [params, setParams] = useState({
    n_estimators: 100,
    learning_rate: 0.05,
    max_depth: 3
  });

  // Fetch predictions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/predictAll');
        const data = await response.json();
        
        if (data && data.predictions) {
          setAllPredictions(data.predictions);
          // Set initial predictions
          const firstKey = Object.keys(data.predictions)[0];
          if (firstKey) {
            const firstPrediction = data.predictions[firstKey];
            setCurrentPredictions(firstPrediction.predictions || []);
            setCurrentMetrics(firstPrediction.metrics || { rmse: 0, mae: 0, r2: 0 });
          }
        }

        if (data && data.bestConfig) {
          setBestModel({
            params: data.bestConfig,
            metrics: data.bestConfig.metrics || { rmse: 0, mae: 0, r2: 0 }
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Update predictions when params change
  useEffect(() => {
    if (!allPredictions || Object.keys(allPredictions).length === 0) return;

    const key = `${params.n_estimators}-${params.learning_rate}-${params.max_depth}`;
    const predictionData = allPredictions[key];
    
    if (predictionData) {
      setCurrentPredictions(predictionData.predictions || []);
      setCurrentMetrics(predictionData.metrics || { rmse: 0, mae: 0, r2: 0 });
    }
  }, [params, allPredictions]);

  return (
    <div className={styles.visualizerContainer}>
      <h1>Insurance Cost Predictor</h1>

      {bestModel && (
        <div className={styles.bestModelHint}>
          <span>Best model configuration:</span>
          <ul>
            <li>Number of Estimators: {bestModel.params.n_estimators}</li>
            <li>Learning Rate: {bestModel.params.learning_rate}</li>
            <li>Max Depth: {bestModel.params.max_depth}</li>
          </ul>
          <span>Try adjusting the sliders to match these values!</span>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.sliderGroup}>
          <label>Number of Estimators:</label>
          <input
            type="range"
            min={Math.min(...validParams.n_estimators)}
            max={Math.max(...validParams.n_estimators)}
            step={50}
            value={params.n_estimators}
            onChange={(e) => setParams(prev => ({
              ...prev,
              n_estimators: parseInt(e.target.value)
            }))}
          />
          <span>{params.n_estimators}</span>
        </div>
        
        <div className={styles.sliderGroup}>
          <label>Learning Rate:</label>
          <input
            type="range"
            min={Math.min(...validParams.learning_rate)}
            max={Math.max(...validParams.learning_rate)}
            step={0.01}
            value={params.learning_rate}
            onChange={(e) => setParams(prev => ({
              ...prev,
              learning_rate: parseFloat(e.target.value)
            }))}
          />
          <span>{params.learning_rate.toFixed(2)}</span>
        </div>

        <div className={styles.sliderGroup}>
          <label>Max Depth:</label>
          <input
            type="range"
            min={Math.min(...validParams.max_depth)}
            max={Math.max(...validParams.max_depth)}
            step={1}
            value={params.max_depth}
            onChange={(e) => setParams(prev => ({
              ...prev,
              max_depth: parseInt(e.target.value)
            }))}
          />
          <span>{params.max_depth}</span>
        </div>
      </div>

      <div className={styles.metricsContainer}>
        <div className={styles.metric}>
          <label>RMSE:</label>
          <span>{(currentMetrics?.rmse || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        <div className={styles.metric}>
          <label>MAE:</label>
          <span>{(currentMetrics?.mae || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        <div className={styles.metric}>
          <label>R² Score:</label>
          <span>{(currentMetrics?.r2 || 0).toLocaleString(undefined, { maximumFractionDigits: 3 })}</span>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <LineChart
          width={800}
          height={400}
          data={currentPredictions}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#404040"
          />
          <XAxis 
            dataKey="index" 
            domain={[0, 49]}
            type="number"
            ticks={[0, 6, 12, 18, 24, 30, 36, 42, 49]}
            tick={{ fill: '#e0e0e0' }}
            stroke="#404040"
          />
          <YAxis 
            domain={[0, 80000]}
            tickFormatter={(value) => value.toLocaleString()}
            tick={{ fill: '#e0e0e0' }}
            stroke="#404040"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#2d2d2d', 
              border: '1px solid #404040',
              color: '#e0e0e0' 
            }}
            itemStyle={{ color: '#e0e0e0' }}
            formatter={(value) => value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          />
          <Legend 
            wrapperStyle={{ color: '#e0e0e0' }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#ffffff"
            name="Actual"
            dot={false}
            isAnimationActive={true}
            animationDuration={300}
            animationBegin={0}
            animationEasing="ease-in-out"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#ff6b6b"
            name="Predicted"
            dot={false}
            isAnimationActive={true}
            animationDuration={300}
            animationBegin={0}
            animationEasing="ease-in-out"
            strokeWidth={2}
          />
        </LineChart>
      </div>
    </div>
  );
};

export default ModelVisualizer;