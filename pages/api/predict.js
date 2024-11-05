export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { n_estimators, learning_rate, max_depth } = req.body;
    const baseData = generateBaseData(50);
    const predictions = generatePredictions(baseData, n_estimators, learning_rate, max_depth);
    const metrics = calculateMetrics(predictions);

    return res.status(200).json({ predictions, metrics });
  } catch (error) {
    console.error('Error:', error);
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
  
  const rmse = Math.sqrt(
    predicteds.reduce((sum, pred, i) => 
      sum + Math.pow(pred - actuals[i], 2), 0) / predicteds.length
  );

  const mae = predicteds.reduce((sum, pred, i) => 
    sum + Math.abs(pred - actuals[i]), 0) / predicteds.length;

  const meanActual = actuals.reduce((sum, val) => sum + val, 0) / actuals.length;
  const ssTotal = actuals.reduce((sum, val) => sum + Math.pow(val - meanActual, 2), 0);
  const ssResidual = predicteds.reduce((sum, pred, i) => 
    sum + Math.pow(actuals[i] - pred, 2), 0);
  const r2 = 1 - (ssResidual / ssTotal);

  return { rmse, mae, r2 };
} 