import { useState } from 'react'
import ModelParameters from './components/ModelParameters'
import PerformanceMetrics from './components/PerformanceMetrics'

function App() {
  const [metrics, setMetrics] = useState(null)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Insurance Model Explorer
          </h1>
          <p className="mt-2 text-gray-600">
            Explore model performance with different parameters
          </p>
        </header>

        <main className="space-y-6">
          <ModelParameters 
            onParametersChange={(params) => {
              // This will be implemented when we connect to the API
              console.log('Parameters changed:', params)
              // Temporary mock data
              setMetrics({
                rmse: 4294.46,
                mae: 2500.12,
                r2: 0.881
              })
            }} 
          />
          <PerformanceMetrics metrics={metrics} />
        </main>
      </div>
    </div>
  )
}

export default App 