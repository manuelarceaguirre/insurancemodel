export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Sample predictions for each model configuration
    const samplePredictions = {};
    
    // Define available parameter values
    const n_estimators_range = [50, 100, 200];
    const learning_rate_range = [0.01, 0.05, 0.1];
    const max_depth_range = [2, 3, 5];

    // Generate predictions for each configuration
    for (const n_est of n_estimators_range) {
      for (const lr of learning_rate_range) {
        for (const depth of max_depth_range) {
          const key = `${n_est}-${lr}-${depth}`;
          
          // Generate sample predictions
          const predictions = Array.from({ length: 50 }, (_, i) => ({
            index: i,
            actual: Math.random() * 50000 + 1000,
            predicted: Math.random() * 50000 + 1000
          }));

          samplePredictions[key] = {
            predictions: predictions,
            metrics: {
              rmse: 4294.46,
              mae: 2473.41,
              r2: 0.8812
            }
          };
        }
      }
    }

    const bestConfig = {
      n_estimators: 100,
      learning_rate: 0.05,
      max_depth: 3,
      metrics: {
        rmse: 4294.46,
        mae: 2473.41,
        r2: 0.8812
      }
    };

    return res.status(200).json({
      predictions: samplePredictions,
      bestConfig: bestConfig
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}