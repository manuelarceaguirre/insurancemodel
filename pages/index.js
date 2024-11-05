import { useState } from 'react';
import ModelParameters from '../components/ModelParameters';
import PerformanceMetrics from '../components/PerformanceMetrics';

export default function Home() {
  const [metrics, setMetrics] = useState(null);

  const handleParametersChange = async (parameters) => {
    const queryParams = new URLSearchParams(parameters);
    const response = await fetch(`/api/model-performance?${queryParams}`);
    const data = await response.json();
    if (data.length > 0) {
      setMetrics(data[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="space-y-4">
          <ModelParameters onParametersChange={handleParametersChange} />
          <PerformanceMetrics metrics={metrics} />
        </div>
      </div>
    </div>
  );
} 