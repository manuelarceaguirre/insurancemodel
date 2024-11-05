function PerformanceMetrics({ metrics }) {
  if (!metrics) return null

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
      
      <div className="grid grid-cols-3 gap-6">
        <MetricCard 
          title="RMSE" 
          value={metrics.rmse.toFixed(2)} 
          description="Root Mean Square Error"
        />
        <MetricCard 
          title="MAE" 
          value={metrics.mae.toFixed(2)} 
          description="Mean Absolute Error"
        />
        <MetricCard 
          title="R² Score" 
          value={metrics.r2.toFixed(3)} 
          description="Coefficient of Determination"
        />
      </div>
    </div>
  )
}

function MetricCard({ title, value, description }) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  )
}

export default PerformanceMetrics 