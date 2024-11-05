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
  const actualValues = predictions.map(p => p.actual);
  const predictedValues = predictions.map(p => p.predicted);

  const rmse = Math.sqrt(
    predictions.reduce((sum, p) => sum + Math.pow(p.actual - p.predicted, 2), 0) / predictions.length
  );

  const mae = predictions.reduce((sum, p) => sum + Math.abs(p.actual - p.predicted), 0) / predictions.length;

  const r2 = 1 - (
    predictions.reduce((sum, p) => sum + Math.pow(p.actual - p.predicted, 2), 0
  ) / (
    predictions.reduce((sum, p) => sum + Math.pow(p.actual - actualValues.mean(), 2), 0
  );

  return { rmse, mae, r2 };
}

function mean(arr) {
  return arr.reduce((sum, x) => sum + x, 0) / arr.length;
} 