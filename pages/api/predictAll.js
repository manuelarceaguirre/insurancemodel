import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read JSON files
    const performancePath = path.join(process.cwd(), 'data', 'model_performance_data.json');
    const predictionsPath = path.join(process.cwd(), 'data', 'model_predictions.json');
    
    const modelPerformance = JSON.parse(fs.readFileSync(performancePath, 'utf8'));
    const modelPredictions = JSON.parse(fs.readFileSync(predictionsPath, 'utf8'));

    // Find the best configuration based on R² score
    const bestConfig = modelPerformance.reduce((best, current) => {
      return current.r2 > best.r2 ? current : best;
    });

    // Return the predictions and best configuration
    return res.status(200).json({
      predictions: modelPredictions.predictions,
      bestConfig: {
        n_estimators: bestConfig.n_estimators,
        learning_rate: bestConfig.learning_rate,
        max_depth: bestConfig.max_depth,
        metrics: {
          rmse: bestConfig.rmse,
          mae: bestConfig.mae,
          r2: bestConfig.r2
        }
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}