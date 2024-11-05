import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../styles/ModelVisualizer.module.css';

const ModelVisualizer = () => {
  const [allPredictions, setAllPredictions] = useState({});
  const [currentPredictions, setCurrentPredictions] = useState([]);

  // Define valid values
  const validValues = {
    n_estimators: [50, 100, 200],
    learning_rate: [0.01, 0.05, 0.1],
    max_depth: [2, 3, 5]
  };

  const [selectedParams, setSelectedParams] = useState({
    n_estimators: 100,
    learning_rate: 0.05,
    max_depth: 3
  });

  const getClosestValue = (value, validOptions) => {
    return validOptions.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  };

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/predictAll');
        const data = await response.json();
        console.log("Initial data structure:", data);
        
        if (data.predictions) {
          setAllPredictions(data.predictions);
          // Set initial predictions
          const initialKey = `${selectedParams.n_estimators}-${selectedParams.learning_rate}-${selectedParams.max_depth}`;
          if (data.predictions[initialKey]) {
            console.log("Setting initial predictions:", data.predictions[initialKey].predictions.slice(0, 5));
            setCurrentPredictions(data.predictions[initialKey].predictions);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleParamChange = (param, value) => {
    // Snap to nearest valid value
    const snappedValue = getClosestValue(value, validValues[param]);
    console.log(`Parameter ${param} changed from ${value} to ${snappedValue}`);
    
    const newParams = { ...selectedParams, [param]: snappedValue };
    const key = `${newParams.n_estimators}-${newParams.learning_rate}-${newParams.max_depth}`;
    
    if (allPredictions[key]) {
      console.log(`Updating predictions for ${key}`);
      setCurrentPredictions([...allPredictions[key].predictions]);
    }

    setSelectedParams(newParams);
  };

  return (
    <div className={styles.visualizerContainer}>
      <div className={styles.parameterControls}>
        <div className={styles.parameterGroup}>
          <label>Number of Estimators: {selectedParams.n_estimators}</label>
          <input 
            type="range"
            min={50}
            max={200}
            step={1}  // Smaller step for smoother sliding
            value={selectedParams.n_estimators}
            onChange={(e) => handleParamChange('n_estimators', Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.tickmarks}>
            {validValues.n_estimators.map(value => (
              <span key={value}>{value}</span>
            ))}
          </div>
        </div>

        <div className={styles.parameterGroup}>
          <label>Learning Rate: {selectedParams.learning_rate.toFixed(2)}</label>
          <input 
            type="range"
            min={0.01}
            max={0.1}
            step={0.001}  // Smaller step for smoother sliding
            value={selectedParams.learning_rate}
            onChange={(e) => handleParamChange('learning_rate', Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.tickmarks}>
            {validValues.learning_rate.map(value => (
              <span key={value}>{value.toFixed(2)}</span>
            ))}
          </div>
        </div>

        <div className={styles.parameterGroup}>
          <label>Max Depth: {selectedParams.max_depth}</label>
          <input 
            type="range"
            min={2}
            max={5}
            step={1}
            value={selectedParams.max_depth}
            onChange={(e) => handleParamChange('max_depth', Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.tickmarks}>
            {validValues.max_depth.map(value => (
              <span key={value}>{value}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={currentPredictions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#8884d8" 
              dot={false}
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#82ca9d" 
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ModelVisualizer;