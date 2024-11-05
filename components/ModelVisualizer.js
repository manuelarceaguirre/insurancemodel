import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../styles/ModelVisualizer.module.css';

const ModelVisualizer = () => {
  const [allPredictions, setAllPredictions] = useState({});
  const [currentPredictions, setCurrentPredictions] = useState([]);
  const [selectedParams, setSelectedParams] = useState({
    n_estimators: 100,
    learning_rate: 0.05,
    max_depth: 3
  });

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
    console.log(`Parameter ${param} changed to ${value}`);
    
    const newParams = { ...selectedParams };
    newParams[param] = value;
    
    const key = `${newParams.n_estimators}-${newParams.learning_rate}-${newParams.max_depth}`;
    console.log("Looking for predictions with key:", key);
    
    if (allPredictions[key]) {
      console.log("Found new predictions:", {
        oldPredictions: currentPredictions.slice(0, 2),
        newPredictions: allPredictions[key].predictions.slice(0, 2)
      });
      setCurrentPredictions(allPredictions[key].predictions);
    } else {
      console.log("No predictions found for key:", key);
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
            step={75}  // Changed to match the valid values better
            value={selectedParams.n_estimators}
            onChange={(e) => handleParamChange('n_estimators', Number(e.target.value))}
            className={styles.slider}
          />
        </div>

        <div className={styles.parameterGroup}>
          <label>Learning Rate: {selectedParams.learning_rate}</label>
          <input 
            type="range"
            min={0.01}
            max={0.1}
            step={0.045}  // Changed to match the valid values better
            value={selectedParams.learning_rate}
            onChange={(e) => handleParamChange('learning_rate', Number(e.target.value))}
            className={styles.slider}
          />
        </div>

        <div className={styles.parameterGroup}>
          <label>Max Depth: {selectedParams.max_depth}</label>
          <input 
            type="range"
            min={2}
            max={5}
            step={1.5}  // Changed to match the valid values better
            value={selectedParams.max_depth}
            onChange={(e) => handleParamChange('max_depth', Number(e.target.value))}
            className={styles.slider}
          />
        </div>
      </div>

      <div className={styles.chartContainer}>
        {currentPredictions.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={currentPredictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" />
              <YAxis />
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
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};

export default ModelVisualizer;