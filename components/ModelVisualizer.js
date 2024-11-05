import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../styles/ModelVisualizer.module.css';

const ModelVisualizer = () => {
  const [allPredictions, setAllPredictions] = useState({});
  const [currentPredictions, setCurrentPredictions] = useState([]);
  const [yDomain, setYDomain] = useState([0, 80000]);

  const validValues = {
    n_estimators: [50, 100, 150, 200, 250, 300],
    learning_rate: [0.001, 0.01, 0.05, 0.1, 0.15, 0.2],
    max_depth: [2, 3, 4, 5, 6, 7],
    min_samples_split: [2, 5, 10],
    subsample: [0.7, 0.8, 0.9, 1.0]
  };

  const [selectedParams, setSelectedParams] = useState({
    n_estimators: 100,
    learning_rate: 0.05,
    max_depth: 3,
    min_samples_split: 2,
    subsample: 0.8
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/predictAll');
        const data = await response.json();
        setAllPredictions(data.predictions);
        
        const initialKey = getPredictionKey(selectedParams);
        if (data.predictions[initialKey]) {
          setCurrentPredictions(data.predictions[initialKey].predictions);
        }

        // Calculate y-axis domain
        let minValue = Infinity;
        let maxValue = -Infinity;
        Object.values(data.predictions).forEach(predictionSet => {
          predictionSet.predictions.forEach(pred => {
            minValue = Math.min(minValue, pred.actual, pred.predicted);
            maxValue = Math.max(maxValue, pred.actual, pred.predicted);
          });
        });
        const padding = (maxValue - minValue) * 0.1;
        setYDomain([Math.floor(minValue - padding), Math.ceil(maxValue + padding)]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const getPredictionKey = (params) => {
    return `${params.n_estimators}-${params.learning_rate}-${params.max_depth}-${params.min_samples_split}-${params.subsample}`;
  };

  const getClosestValue = (value, validOptions) => {
    return validOptions.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  };

  const handleParamChange = useCallback((param, value) => {
    const snappedValue = getClosestValue(value, validValues[param]);
    console.log(`Parameter ${param} changed from ${value} to ${snappedValue}`);
    
    const newParams = { ...selectedParams, [param]: snappedValue };
    const key = getPredictionKey(newParams);
    
    if (allPredictions[key]) {
      console.log(`Setting new predictions for ${key}`);
      setCurrentPredictions([...allPredictions[key].predictions]);
    }

    setSelectedParams(newParams);
  }, [selectedParams, allPredictions]);

  return (
    <div className={styles.visualizerContainer}>
      <div className={styles.bestModelInfo}>
        <h2>Best Model Configuration</h2>
        <div className={styles.bestModelDetails}>
          <div>
            <h3>Parameters:</h3>
            <p>n_estimators: 50</p>
            <p>learning_rate: 0.2</p>
            <p>max_depth: 2</p>
            <p>min_samples_split: 5</p>
            <p>subsample: 0.7</p>
          </div>
          <div>
            <h3>Best Metrics:</h3>
            <p>RMSE: 4,258.15</p>
            <p>MAE: 2,440.24</p>
            <p>R² Score: 0.8832</p>
          </div>
        </div>
      </div>
      
      <div className={styles.parameterControls}>
        {/* N Estimators Slider */}
        <div className={styles.parameterGroup}>
          <label>N Estimators: {selectedParams.n_estimators}</label>
          <div className={styles.sliderContainer}>
            <input 
              type="range"
              min={50}
              max={300}
              step={50}
              value={selectedParams.n_estimators}
              onChange={(e) => handleParamChange('n_estimators', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.tickmarks}>
              {[50, 100, 150, 200, 250, 300].map(value => (
                <div key={value} className={styles.tickmark}>
                  <span className={styles.tickValue}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Learning Rate Slider */}
        <div className={styles.parameterGroup}>
          <label>Learning Rate: {selectedParams.learning_rate.toFixed(3)}</label>
          <div className={styles.sliderContainer}>
            <input 
              type="range"
              min={0.001}
              max={0.2}
              step={0.001}
              value={selectedParams.learning_rate}
              onChange={(e) => handleParamChange('learning_rate', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.tickmarks}>
              {[0.001, 0.01, 0.05, 0.1, 0.15, 0.2].map(value => (
                <div key={value} className={styles.tickmark}>
                  <span className={styles.tickValue}>{value.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Max Depth Slider */}
        <div className={styles.parameterGroup}>
          <label>Max Depth: {selectedParams.max_depth}</label>
          <div className={styles.sliderContainer}>
            <input 
              type="range"
              min={2}
              max={7}
              step={1}
              value={selectedParams.max_depth}
              onChange={(e) => handleParamChange('max_depth', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.tickmarks}>
              {[2, 3, 4, 5, 6, 7].map(value => (
                <div key={value} className={styles.tickmark}>
                  <span className={styles.tickValue}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Min Samples Split Slider */}
        <div className={styles.parameterGroup}>
          <label>Min Samples Split: {selectedParams.min_samples_split}</label>
          <div className={styles.sliderContainer}>
            <input 
              type="range"
              min={2}
              max={10}
              step={1}
              value={selectedParams.min_samples_split}
              onChange={(e) => handleParamChange('min_samples_split', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.tickmarks}>
              {[2, 5, 10].map(value => (
                <div key={value} className={styles.tickmark}>
                  <span className={styles.tickValue}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subsample Slider */}
        <div className={styles.parameterGroup}>
          <label>Subsample: {selectedParams.subsample.toFixed(1)}</label>
          <div className={styles.sliderContainer}>
            <input 
              type="range"
              min={0.7}
              max={1.0}
              step={0.1}
              value={selectedParams.subsample}
              onChange={(e) => handleParamChange('subsample', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.tickmarks}>
              {[0.7, 0.8, 0.9, 1.0].map(value => (
                <div key={value} className={styles.tickmark}>
                  <span className={styles.tickValue}>{value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        {currentPredictions.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart 
              data={currentPredictions}
              margin={{ top: 20, right: 30, left: 60, bottom: 40 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#404040"
              />
              <XAxis 
                dataKey="index"
                label={{ 
                  value: 'Sample Index', 
                  position: 'bottom', 
                  offset: 20,
                  style: { fill: '#e0e0e0' }
                }}
                tick={{ fill: '#e0e0e0' }}
                stroke="#666"
              />
              <YAxis 
                domain={yDomain}
                tickFormatter={(value) => value.toLocaleString()}
                label={{ 
                  value: 'Insurance Charges ($)', 
                  angle: -90, 
                  position: 'left', 
                  offset: 40,
                  style: { fill: '#e0e0e0' }
                }}
                tick={{ fill: '#e0e0e0' }}
                stroke="#666"
              />
              <Tooltip 
                formatter={(value) => value.toLocaleString()}
                contentStyle={{
                  backgroundColor: '#2d2d2d',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#e0e0e0',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                }}
                labelStyle={{ color: '#e0e0e0' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ color: '#e0e0e0' }}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#8884d8" 
                name="Actual Charges" 
                dot={false}
                isAnimationActive={false}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#4CAF50" 
                name="Predicted Charges" 
                dot={false}
                isAnimationActive={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};

export default ModelVisualizer;