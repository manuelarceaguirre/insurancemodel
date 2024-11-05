import { useState } from 'react'

function ModelParameters({ onParametersChange }) {
  const [parameters, setParameters] = useState({
    n_estimators: 100,
    learning_rate: 0.05,
    max_depth: 3
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    const newParameters = {
      ...parameters,
      [name]: parseFloat(value)
    }
    setParameters(newParameters)
    onParametersChange(newParameters)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Model Parameters</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Number of Estimators: {parameters.n_estimators}
          </label>
          <input
            type="range"
            name="n_estimators"
            min={50}
            max={200}
            value={parameters.n_estimators}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Learning Rate: {parameters.learning_rate}
          </label>
          <input
            type="range"
            name="learning_rate"
            min={0.01}
            max={0.1}
            step="0.01"
            value={parameters.learning_rate}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Max Depth: {parameters.max_depth}
          </label>
          <input
            type="range"
            name="max_depth"
            min={2}
            max={5}
            value={parameters.max_depth}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}

export default ModelParameters 