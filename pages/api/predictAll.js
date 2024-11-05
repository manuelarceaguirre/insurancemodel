export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate predictions for different parameter combinations
    const allPredictions = {};
    const baseData = generateBaseData(50);

    // Define parameter ranges
    const n_estimators_range = [50, 100, 150, 200];
    const learning_rate_range = [0.01, 0.05, 0.1];
    const max_depth_range = [2, 3, 4, 5];

    // Generate predictions
    for (const n_estimators of n_estimators_range) {
      for (const learning_rate of learning_rate_range) {
        for (const max_depth of max_depth_range) {
          const key = `${n_estimators}-${learning_rate}-${max_depth}`;
          allPredictions[key] = generatePredictions(baseData, n_estimators, learning_rate, max_depth);
        }
      }
    }

    return res.status(200).json({
      predictions: allPredictions,
      bestConfig: {
        n_estimators: 200,
        learning_rate: 0.1,
        max_depth: 4
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