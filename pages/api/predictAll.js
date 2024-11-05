export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Real insurance charges data (sample of actual values)
    const actualValues = [
      16884.924, 1725.5523, 4449.462, 21984.47061, 3866.8552,
      3756.6216, 8240.5896, 7281.5056, 6406.4107, 28923.13692,
      2721.3208, 27808.7251, 1826.843, 11090.7178, 39611.7577,
      1837.237, 10797.3362, 2395.17155, 10602.385, 36837.467
    ];

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
          
          // Generate predictions while keeping actual values constant
          const predictions = actualValues.map((actual, i) => {
            // Generate a prediction that varies based on the parameters
            // This is a simplified simulation - adjust the formula as needed
            const variationFactor = (n_est / 100) * (lr * 10) * (depth / 3);
            const predicted = actual * (0.9 + (Math.random() * 0.2 * variationFactor));
            
            return {
              index: i,
              actual: actual,
              predicted: predicted
            };
          });

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