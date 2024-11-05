import { useState, useEffect } from 'react';

export default function ModelParameters({ onParametersChange }) {
  const [ranges, setRanges] = useState(null);
  const [parameters, setParameters] = useState({
    n_estimators: 100,
    learning_rate: 0.05,
    max_depth: 3
  });

  useEffect(() => {
    fetch('/api/parameter-ranges')
      .then(res => res.json())
      .then(data => setRanges(data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newParameters = {
      ...parameters,
      [name]: parseFloat(value)
    };
    setParameters(newParameters);
    onParametersChange(newParameters);
  };

  if (!ranges) return <div>Loading...</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Model Parameters</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Number of Estimators
          </label>
          <input
            type="range"
            name="n_estimators"
            min={Math.min(...ranges.n_estimators)}
            max={Math.max(...ranges.n_estimators)}
            value={parameters.n_estimators}
            onChange={handleChange}
            className="w-full"
          />
          <span>{parameters.n_estimators}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Learning Rate
          </label>
          <input
            type="range"
            name="learning_rate"
            min={Math.min(...ranges.learning_rates)}
            max={Math.max(...ranges.learning_rates)}
            step="0.01"
            value={parameters.learning_rate}
            onChange={handleChange}
            className="w-full"
          />
          <span>{parameters.learning_rate}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Max Depth
          </label>
          <input
            type="range"
            name="max_depth"
            min={Math.min(...ranges.max_depths)}
            max={Math.max(...ranges.max_depths)}
            value={parameters.max_depth}
            onChange={handleChange}
            className="w-full"
          />
          <span>{parameters.max_depth}</span>
        </div>
      </div>
    </div>
  );
} 