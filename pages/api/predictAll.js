export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const allPredictions = {};
    const baseData = generateBaseData(50);

    const n_estimators_range = [50, 100, 150, 200];
    const learning_rate_range = [0.01, 0.05, 0.1];
    const max_depth_range = [2, 3, 4, 5];

    for (const n_estimators of n_estimators_range) {
      for (const learning_rate of learning_rate_range) {
        for (const max_depth of max_depth_range) {
          const key = `${n_estimators}-${learning_rate}-${max_depth}`;
          const predictions = generatePredictions(baseData, n_estimators, learning_rate, max_depth);
          const metrics = calculateMetrics(predictions);
          
          allPredictions[key] = {
            predictions,
            metrics: {
              rmse: metrics.rmse || 0,
              mae: metrics.mae || 0,
              r2: metrics.r2 || 0
            }
          };
        }
      }
    }

    return res.status(200).json({
      predictions: allPredictions,
      bestConfig: {
        n_estimators: 200,
        learning_rate: 0.1,
        max_depth: 4,
        metrics: {
          rmse: 0,
          mae: 0,
          r2: 0
        }
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

function generateBaseData(length) {
  return Array.from({ length }, (_, index) => ({
    index,
    base: 10000 + (Math.sin(index * 0.1) * 5000) + (index * 1000)
  }));
}

function generatePredictions(baseData, n_estimators, learning_rate, max_depth) {
  const factor = (n_estimators * 0.01 + learning_rate + max_depth * 0.1);
  return baseData.map(({ index, base }) => {
    const actual = base;
    const predicted = actual * (0.8 + (Math.sin(index * factor) * 0.2 + 0.2));
    return { index, actual, predicted };
  });
}

function calculateMetrics(predictions) {
  const actuals = predictions.map(p => p.actual);
  const predicteds = predictions.map(p => p.predicted);
  
  // Calculate RMSE
  const rmse = Math.sqrt(
    predicteds.reduce((sum, pred, i) => 
      sum + Math.pow(pred - actuals[i], 2), 0) / predicteds.length
  );

  // Calculate MAE
  const mae = predicteds.reduce((sum, pred, i) => 
    sum + Math.abs(pred - actuals[i]), 0) / predicteds.length;

  // Calculate R²
  const meanActual = actuals.reduce((sum, val) => sum + val, 0) / actuals.length;
  const ssTotal = actuals.reduce((sum, val) => sum + Math.pow(val - meanActual, 2), 0);
  const ssResidual = predicteds.reduce((sum, pred, i) => 
    sum + Math.pow(actuals[i] - pred, 2), 0);
  const r2 = 1 - (ssResidual / ssTotal);

  return { rmse, mae, r2 };
}