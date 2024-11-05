export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Best configuration from our trained model
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

    // Sample of actual predictions (using first 50 points for visualization)
    const samplePredictions = {
      "100-0.05-3": {
        predictions: [
          { index: 0, actual: 9095.07, predicted: 12123.85 },
          { index: 1, actual: 5272.18, predicted: 10296.39 },
          { index: 2, actual: 29330.98, predicted: 16380.24 },
          { index: 3, actual: 9301.89, predicted: 12123.85 },
          { index: 4, actual: 33750.29, predicted: 24513.06 },
          { index: 5, actual: 4536.26, predicted: 10296.39 },
          { index: 6, actual: 2117.34, predicted: 10296.39 },
          { index: 7, actual: 14210.54, predicted: 13066.60 },
          { index: 8, actual: 3732.63, predicted: 10296.39 },
          { index: 9, actual: 10264.44, predicted: 13017.71 },
          { index: 10, actual: 18259.22, predicted: 16380.24 },
          { index: 11, actual: 7256.72, predicted: 10296.39 },
          { index: 12, actual: 3947.41, predicted: 10296.39 },
          { index: 13, actual: 46151.12, predicted: 24513.06 },
          { index: 14, actual: 48673.56, predicted: 24513.06 },
          { index: 15, actual: 44202.65, predicted: 24513.06 }
          // Add more predictions as needed
        ],
        metrics: bestConfig.metrics
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