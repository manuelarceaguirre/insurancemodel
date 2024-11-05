import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import styles from '../styles/ModelVisualizer.module.css';

const ModelVisualizer = () => {
  const [allPredictions, setAllPredictions] = useState({});
  const [currentPredictions, setCurrentPredictions] = useState([]);
  const [yDomain, setYDomain] = useState([0, 80000]);

  // Define valid values based on the new parameter ranges
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

  // Update prediction key format to match new structure
  const getPredictionKey = (params) => {
    return `${params.n_estimators}-${params.learning_rate}-${params.max_depth}-${params.min_samples_split}-${params.subsample}`;
  };

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/predictAll');
        const data = await response.json();
        setAllPredictions(data.predictions);
        
        // Set initial predictions
        const initialKey = getPredictionKey(selectedParams);
        if (data.predictions[initialKey]) {
          setCurrentPredictions(data.predictions[initialKey].predictions);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Calculate y-axis domain on initial load
  useEffect(() => {
    if (Object.keys(allPredictions).length > 0) {
      let minValue = Infinity;
      let maxValue = -Infinity;

      // Find min and max across all predictions
      Object.values(allPredictions).forEach(predictionSet => {
        predictionSet.predictions.forEach(pred => {
          minValue = Math.min(minValue, pred.actual, pred.predicted);
          maxValue = Math.max(maxValue, pred.actual, pred.predicted);
        });
      });

      // Add some padding to the range
      const padding = (maxValue - minValue) * 0.1;
      setYDomain([Math.floor(minValue - padding), Math.ceil(maxValue + padding)]);
    }
  }, [allPredictions]);

  const handleParamChange = (param, value) => {
    // Get closest valid value from the range
    const getClosestValue = (value, validOptions) => {
      return validOptions.reduce((prev, curr) => 
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
    };

    // Snap to nearest valid value
    const snappedValue = getClosestValue(value, validValues[param]);
    console.log(`Parameter ${param} changed from ${value} to ${snappedValue}`);
    
    const newParams = { ...selectedParams, [param]: snappedValue };
    const key = getPredictionKey(newParams);
    
    if (allPredictions[key]) {
      console.log(`Setting new predictions for ${key}`);
      setCurrentPredictions([...allPredictions[key].predictions]);
    }

    setSelectedParams(newParams);
  };

  return (
    <div className={styles.visualizerContainer}>
      <div className={styles.parameterControls}>
        {/* Original parameters */}
        <div className={styles.parameterGroup}>
          <label>Number of Estimators: {selectedParams.n_estimators}</label>
          <div className={styles.sliderContainer}>
            <input 
              type="range"
              min={Math.min(...validValues.n_estimators)}
              max={Math.max(...validValues.n_estimators)}
              step={50}  // Match the steps in your data
              value={selectedParams.n_estimators}
              onChange={(e) => handleParamChange('n_estimators', Number(e.target.value))}
              className={styles.slider}
              onMouseDown={(e) => e.preventDefault()}  // Prevent text selection
              draggable="false"  // Prevent dragging issues
            />
            <div className={styles.tickmarks}>
              {validValues.n_estimators.map(value => (
                <div key={value} className={styles.tickmark}>
                  <span className={styles.tickValue}>{value}</span>
                  <div className={styles.tickLine}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.parameterGroup}>
          <label>Learning Rate: {selectedParams.learning_rate.toFixed(3)}</label>
          <input 
            type="range"
            min={Math.min(...validValues.learning_rate)}
            max={Math.max(...validValues.learning_rate)}
            step={0.001}
            value={selectedParams.learning_rate}
            onChange={(e) => handleParamChange('learning_rate', Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.tickmarks}>
            {validValues.learning_rate.map(value => (
              <span key={value}>{value.toFixed(3)}</span>
            ))}
          </div>
        </div>

        {/* New parameters */}
        <div className={styles.parameterGroup}>
          <label>Min Samples Split: {selectedParams.min_samples_split}</label>
          <input 
            type="range"
            min={Math.min(...validValues.min_samples_split)}
            max={Math.max(...validValues.min_samples_split)}
            value={selectedParams.min_samples_split}
            onChange={(e) => handleParamChange('min_samples_split', Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.tickmarks}>
            {validValues.min_samples_split.map(value => (
              <span key={value}>{value}</span>
            ))}
          </div>
        </div>

        <div className={styles.parameterGroup}>
          <label>Subsample: {selectedParams.subsample.toFixed(2)}</label>
          <div className={styles.sliderContainer}>
            <input 
              type="range"
              min={0.7}
              max={1.0}
              step={0.1}  // Match the exact steps in validValues.subsample
              value={selectedParams.subsample}
              onChange={(e) => handleParamChange('subsample', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.tickmarks}>
              {validValues.subsample.map(value => (
                <div key={value} className={styles.tickmark}>
                  <span className={styles.tickValue}>{value.toFixed(1)}</span>
                  <div className={styles.tickLine}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart section remains the same */}
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
              <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual Charges" dot={false} />
              <Line type="monotone" dataKey="predicted" stroke="#82ca9d" name="Predicted Charges" dot={false} />
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
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};

export default ModelVisualizer;