"use client";

import { useAnalytics } from './hooks/useAnalytics';

export default function Analytics() {
  const { analytics, tasks } = useAnalytics();

  return (
    <div className="animate-fade-in space-y-6 py-8">
      <h1 className="text-3xl font-bold">Task Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Key Metrics */}
        <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
          <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold text-accent">{analytics.completionRate.toFixed(1)}%</p>
        </div>
        
        <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
          <h3 className="text-lg font-semibold mb-2">Avg. Completion Time</h3>
          <p className="text-3xl font-bold text-accent">{analytics.avgCompletionTime.toFixed(1)}h</p>
        </div>

        <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
          <h3 className="text-lg font-semibold mb-2">Total Tasks</h3>
          <p className="text-3xl font-bold text-accent">{tasks.length}</p>
        </div>

        <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
          <h3 className="text-lg font-semibold mb-2">Active Tasks</h3>
          <p className="text-3xl font-bold text-accent">
            {tasks.filter(t => !t.completed).length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
          <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
          <div className="space-y-4">
            {Object.entries(analytics.tasksByPriority).map(([priority, count]) => (
              <div key={priority}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium capitalize">{priority}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
                <div className="w-full bg-background/30 rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{
                      width: `${(count / tasks.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
          <h3 className="text-lg font-semibold mb-4">Tasks by Category</h3>
          <div className="space-y-4">
            {Object.entries(analytics.tasksByCategory).map(([category, count]) => (
              <div key={category}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium capitalize">{category}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
                <div className="w-full bg-background/30 rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{
                      width: `${(count / tasks.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Productive Hours */}
      <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
        <h3 className="text-lg font-semibold mb-4">Most Productive Hours</h3>
        <div className="h-64">
          <div className="flex h-full items-end space-x-2">
            {analytics.productiveHours.map(({ hour, completions }) => {
              const maxCompletions = Math.max(...analytics.productiveHours.map(h => h.completions));
              const height = maxCompletions > 0 ? (completions / maxCompletions) * 100 : 0;
              
              return (
                <div key={hour} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-accent/80 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs mt-2">{hour}:00</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottleneck Analysis */}
      {analytics.bottleneckAnalysis && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Predictive Analytics</h2>
          
          {/* Potential Bottlenecks */}
          <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
            <h3 className="text-lg font-semibold mb-4">Potential Bottlenecks</h3>
            <div className="space-y-4">
              {analytics.bottleneckAnalysis.potentialBottlenecks.map((bottleneck, index) => (
                <div key={index} className="p-4 bg-background/50 rounded-lg border border-border/20">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{bottleneck.type}</span>
                    <span className={`text-sm ${
                      bottleneck.impact === 'high' ? 'text-red-500' :
                      bottleneck.impact === 'medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {bottleneck.impact} impact
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{bottleneck.description}</p>
                  <div className="text-sm">
                    Predicted Delay: {bottleneck.predictedDelay} hours
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workload Forecasts */}
          <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-border/10">
            <h3 className="text-lg font-semibold mb-4">Workload Forecasts</h3>
            <div className="space-y-4">
              {analytics.bottleneckAnalysis.workloadForecasts.map((forecast, index) => (
                <div key={index} className="p-4 bg-background/50 rounded-lg border border-border/20">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{forecast.timeframe}</span>
                    <span className={`text-sm ${
                      forecast.riskLevel === 'high' ? 'text-red-500' :
                      forecast.riskLevel === 'medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {forecast.bottleneckProbability}% risk
                    </span>
                  </div>
                  <div className="w-full bg-background/30 rounded-full h-2 mb-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${forecast.predictedUtilization}%` }}
                    />
                  </div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {forecast.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}