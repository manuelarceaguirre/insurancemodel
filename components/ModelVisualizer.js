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
      <div className={styles.parameterControls}>
        {Object.entries(validValues).map(([param, values]) => (
          <div key={param} className={styles.parameterGroup}>
            <label>
              {param.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:{' '}
              {selectedParams[param].toFixed(param === 'learning_rate' || param === 'subsample' ? 3 : 0)}
            </label>
            <div className={styles.sliderContainer}>
              <input 
                type="range"
                min={Math.min(...values)}
                max={Math.max(...values)}
                step={param === 'learning_rate' ? 0.001 : param === 'subsample' ? 0.1 : 1}
                value={selectedParams[param]}
                onChange={(e) => handleParamChange(param, Number(e.target.value))}
                className={styles.slider}
                onMouseDown={(e) => e.preventDefault()}
                draggable="false"
              />
              <div className={styles.tickmarks}>
                {values.map(value => (
                  <div key={value} className={styles.tickmark}>
                    <span className={styles.tickValue}>
                      {(param === 'learning_rate' || param === 'subsample') ? value.toFixed(3) : value}
                    </span>
                    <div className={styles.tickLine}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartContainer}>
        {currentPredictions.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart 
              data={currentPredictions}
              margin={{ top: 20, right: 30, left: 60, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="index"
                label={{ value: 'Sample Index', position: 'bottom', offset: 20 }}
              />
              <YAxis 
                domain={yDomain}
                tickFormatter={(value) => value.toLocaleString()}
                label={{ value: 'Insurance Charges ($)', angle: -90, position: 'left', offset: 40 }}
              />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend verticalAlign="top" height={36} />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#8884d8" 
                name="Actual Charges" 
                dot={false}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#82ca9d" 
                name="Predicted Charges" 
                dot={false}
                isAnimationActive={false}
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