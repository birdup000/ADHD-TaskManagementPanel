import { useEffect, useState } from 'react';
import { Task } from './TaskPanel';
import { usePredictiveAnalytics, BottleneckAnalysis } from '../hooks/usePredictiveAnalytics';

interface BottleneckForecastProps {
  historicalTasks: Task[];
  currentTasks: Task[];
}

export function BottleneckForecast({ historicalTasks, currentTasks }: BottleneckForecastProps) {
  const { analyzeBottlenecks, loading, error, analysis } = usePredictiveAnalytics();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        await analyzeBottlenecks(historicalTasks, currentTasks);
      } catch (err) {
        setLocalError('Failed to analyze bottlenecks');
      }
    };

    if (historicalTasks.length > 0 || currentTasks.length > 0) {
      runAnalysis();
    }
  }, [historicalTasks, currentTasks]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return '';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="p-4">Analyzing potential bottlenecks...</div>;
  }

  if (error || localError) {
    return <div className="p-4 text-red-500">{error || localError}</div>;
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold mb-4">Bottleneck Forecast</h2>

      {/* Potential Bottlenecks */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Potential Bottlenecks</h3>
        <div className="grid gap-4">
          {analysis.potentialBottlenecks.map((bottleneck, index) => (
            <div
              key={index}
              className="bg-primary/5 backdrop-blur-sm rounded-xl p-4 border border-border/10"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{bottleneck.type}</div>
                <span className={`${getImpactColor(bottleneck.impact)} font-medium`}>
                  {bottleneck.impact} impact
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{bottleneck.description}</p>
              <div className="text-sm">
                <div className="mb-1">
                  Predicted Delay: {bottleneck.predictedDelay} hours
                </div>
                <div className="mb-2">
                  Affected Tasks: {bottleneck.affectedTasks.join(', ')}
                </div>
                <div>
                  <div className="font-medium mb-1">Mitigation Suggestions:</div>
                  <ul className="list-disc list-inside">
                    {bottleneck.mitigationSuggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workload Forecasts */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Workload Forecasts</h3>
        <div className="grid gap-4">
          {analysis.workloadForecasts.map((forecast, index) => (
            <div
              key={index}
              className="bg-primary/5 backdrop-blur-sm rounded-xl p-4 border border-border/10"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{forecast.timeframe}</div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${getRiskColor(forecast.riskLevel)}`}
                  />
                  <span className="text-sm">
                    {forecast.bottleneckProbability.toFixed(1)}% probability
                  </span>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-sm mb-1">Predicted Utilization</div>
                <div className="w-full bg-background/30 rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{ width: `${forecast.predictedUtilization}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">Recommendations:</div>
                <ul className="list-disc list-inside">
                  {forecast.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Optimizations */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Resource Optimizations</h3>
        <div className="grid gap-4">
          {analysis.resourceOptimizations.map((optimization, index) => (
            <div
              key={index}
              className="bg-primary/5 backdrop-blur-sm rounded-xl p-4 border border-border/10"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{optimization.resource}</div>
                <span className="text-sm">
                  {optimization.currentUtilization.toFixed(1)}% utilized
                </span>
              </div>
              <div className="mb-2">
                <div className="font-medium mb-1">Predicted Bottlenecks:</div>
                <ul className="list-disc list-inside">
                  {optimization.predictedBottlenecks.map((bottleneck, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {bottleneck}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">Optimization Strategies:</div>
                <ul className="list-disc list-inside">
                  {optimization.optimizationStrategies.map((strategy, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {strategy}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}