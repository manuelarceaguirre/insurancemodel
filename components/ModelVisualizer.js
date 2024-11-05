import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import styles from '../styles/ModelVisualizer.module.css';

const ModelVisualizer = () => {
  const [allPredictions, setAllPredictions] = useState({});
  const [currentPredictions, setCurrentPredictions] = useState([]);
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bestModel, setBestModel] = useState(null);
  const [isOptimal, setIsOptimal] = useState(false);

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

  // Load all predictions at once when component mounts
  useEffect(() => {
    const loadAllPredictions = async () => {
      try {
        const response = await fetch('/api/predictAll');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load predictions');
        }

        setAllPredictions(data.predictions);
        // Set initial predictions
        const key = `${params.n_estimators}-${params.learning_rate}-${params.max_depth}`;
        setCurrentPredictions(data.predictions[key] || []);
        setInitialLoading(false);
      } catch (error) {
        console.error('Error loading predictions:', error);
        setError(error.message);
        setInitialLoading(false);
      }
    };

    loadAllPredictions();
  }, []);

  // Find nearest valid parameter value
  const findNearestValue = (value, validValues) => {
    return validValues.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
  };

  // Update predictions and metrics when params change
  useEffect(() => {
    const nearestN = findNearestValue(params.n_estimators, validParams.n_estimators);
    const nearestLR = findNearestValue(params.learning_rate, validParams.learning_rate);
    const nearestMD = findNearestValue(params.max_depth, validParams.max_depth);

    const key = `${nearestN}-${nearestLR}-${nearestMD}`;
    if (allPredictions[key]) {
      setCurrentPredictions(allPredictions[key].predictions);
      setCurrentMetrics(allPredictions[key].metrics);
    }
  }, [params, allPredictions]);

  // Function to find the best model when data is loaded
  const findBestModel = (predictions) => {
    let best = {
      params: null,
      metrics: null,
      score: -Infinity
    };

    Object.entries(predictions).forEach(([key, data]) => {
      // Calculate overall score (you can adjust weights based on importance)
      const score = data.metrics.r2 * 0.6 - (data.metrics.rmse / 10000) * 0.4;
      
      if (score > best.score) {
        const [n_est, lr, md] = key.split('-').map(Number);
        best = {
          params: {
            n_estimators: n_est,
            learning_rate: lr,
            max_depth: md
          },
          metrics: data.metrics,
          score
        };
      }
    });

    return best;
  };

  // Update best model when data is loaded
  useEffect(() => {
    if (Object.keys(allPredictions).length > 0) {
      setBestModel(findBestModel(allPredictions));
    }
  }, [allPredictions]);

  // Check if current params are optimal
  useEffect(() => {
    if (bestModel) {
      const isClose = 
        params.n_estimators === bestModel.params.n_estimators &&
        Math.abs(params.learning_rate - bestModel.params.learning_rate) < 0.01 &&
        params.max_depth === bestModel.params.max_depth;
      setIsOptimal(isClose);
    }
  }, [params, bestModel]);

  return (
    <div className={styles.visualizerContainer}>
      <h1 className={styles.title}>Insurance Cost Predictor</h1>
      
      {bestModel && (
        <div className={`${styles.optimalMessage} ${isOptimal ? styles.optimal : ''}`}>
          {isOptimal ? (
            <div className={styles.optimalBadge}>
              <span>✨ Current configuration is optimal! ✨</span>
            </div>
          ) : (
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

      {currentMetrics && (
        <div className={styles.metricsContainer}>
          <div className={`${styles.metric} ${isOptimal ? styles.optimalMetric : ''}`}>
            <label>RMSE:</label>
            <span>{currentMetrics.rmse.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className={`${styles.metric} ${isOptimal ? styles.optimalMetric : ''}`}>
            <label>MAE:</label>
            <span>{currentMetrics.mae.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className={`${styles.metric} ${isOptimal ? styles.optimalMetric : ''}`}>
            <label>R² Score:</label>
            <span>{currentMetrics.r2.toLocaleString(undefined, { maximumFractionDigits: 3 })}</span>
          </div>
        </div>
      )}

      <div className={styles.chartContainer}>
        {initialLoading ? (
          <div className={styles.loading}>Loading predictions...</div>
        ) : currentPredictions.length > 0 ? (
          <LineChart
            width={800}
            height={400}
            data={currentPredictions}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            style={{ background: '#2d2d2d' }}
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
        ) : (
          <div className={styles.noData}>No data available for these parameters</div>
        )}
      </div>
    </div>
  );
};

export default ModelVisualizer;