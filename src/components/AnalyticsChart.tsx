import React from 'react';

type ChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
};

type ChartOptions = {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      position?: 'top' | 'bottom' | 'left' | 'right';
      display?: boolean;
    };
    title?: {
      display?: boolean;
      text?: string;
    };
  };
  scales?: {
    y?: {
      beginAtZero?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    x?: {
      title?: {
        display?: boolean;
        text?: string;
      };
    };
  };
};

type AnalyticsChartProps = {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: ChartData;
  options?: ChartOptions;
  height?: number;
  width?: number;
};

// This is a mock chart component since we're not installing Chart.js
// In a real implementation, you would use Chart.js or a similar library
const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  type,
  data,
  options = {},
  height = 300,
  width = 500
}) => {
  // Default options
  const defaultOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Function to generate a mock chart visualization
  const renderMockChart = () => {
    if (type === 'pie' || type === 'doughnut') {
      return (
        <div className="flex items-center justify-center">
          <div className="relative" style={{ width: '200px', height: '200px' }}>
            {data.datasets[0].data.map((value, index) => {
              const backgroundColor = Array.isArray(data.datasets[0].backgroundColor)
                ? data.datasets[0].backgroundColor[index % data.datasets[0].backgroundColor.length]
                : data.datasets[0].backgroundColor || `hsl(${index * 30}, 70%, 60%)`;
              
              const percentage = value / data.datasets[0].data.reduce((a, b) => a + b, 0) * 100;
              const rotate = index > 0 
                ? data.datasets[0].data
                    .slice(0, index)
                    .reduce((a, b) => a + b, 0) / data.datasets[0].data.reduce((a, b) => a + b, 0) * 360
                : 0;
              
              return (
                <div 
                  key={index}
                  className="absolute inset-0"
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(Math.PI * 2 * percentage / 100)}% ${50 - 50 * Math.sin(Math.PI * 2 * percentage / 100)}%, 50% 50%)`,
                    backgroundColor,
                    transform: `rotate(${rotate}deg)`,
                    transformOrigin: 'center',
                    borderRadius: type === 'doughnut' ? '50%' : '0%',
                  }}
                />
              );
            })}
            {type === 'doughnut' && (
              <div 
                className="absolute bg-white rounded-full"
                style={{
                  width: '100px',
                  height: '100px',
                  top: '50px',
                  left: '50px',
                }}
              />
            )}
          </div>
        </div>
      );
    }
    
    if (type === 'line') {
      const maxValue = Math.max(...data.datasets[0].data);
      
      return (
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 relative">
            <div className="absolute inset-0 flex items-end">
              {data.labels.map((label, index) => {
                const value = data.datasets[0].data[index];
                const height = (value / maxValue) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full relative" 
                      style={{ height: `${height}%` }}
                    >
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-2 w-2 rounded-full bg-blue-500"
                        style={{ 
                          left: '50%', 
                          transform: 'translateX(-50%)',
                          backgroundColor: data.datasets[0].borderColor as string || 'rgb(59, 130, 246)'
                        }}
                      />
                      {index > 0 && (
                        <div 
                          className="absolute bottom-0 right-1/2 h-0.5 w-full bg-blue-500 origin-right"
                          style={{ 
                            transform: `translateY(1px) rotate(${Math.atan2(
                              (data.datasets[0].data[index] - data.datasets[0].data[index - 1]) / maxValue * 100,
                              100 / data.labels.length
                            ) * (180 / Math.PI)}deg)`,
                            backgroundColor: data.datasets[0].borderColor as string || 'rgb(59, 130, 246)'
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="h-6 flex">
            {data.labels.map((label, index) => (
              <div key={index} className="flex-1 text-xs text-center truncate">
                {label}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Bar chart
    const maxValue = Math.max(...data.datasets[0].data);
    
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-end">
            {data.labels.map((label, index) => {
              const value = data.datasets[0].data[index];
              const height = (value / maxValue) * 100;
              const backgroundColor = Array.isArray(data.datasets[0].backgroundColor)
                ? data.datasets[0].backgroundColor[index % data.datasets[0].backgroundColor.length]
                : data.datasets[0].backgroundColor || 'rgb(59, 130, 246)';
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center px-1">
                  <div 
                    className="w-full rounded-t-sm" 
                    style={{ 
                      height: `${height}%`,
                      backgroundColor
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="h-6 flex">
          {data.labels.map((label, index) => (
            <div key={index} className="flex-1 text-xs text-center truncate">
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div 
      className="relative bg-white p-4 rounded-lg border border-gray-200"
      style={{ height: `${height}px`, width: '100%' }}
    >
      {mergedOptions.plugins?.title?.display && (
        <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">
          {mergedOptions.plugins.title.text}
        </h3>
      )}
      
      <div className="w-full h-full">
        {renderMockChart()}
      </div>
      
      {mergedOptions.plugins?.legend?.display !== false && (
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {data.datasets.map((dataset, datasetIndex) => (
            <div key={datasetIndex} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-sm mr-1"
                style={{ 
                  backgroundColor: Array.isArray(dataset.backgroundColor) 
                    ? dataset.backgroundColor[0] 
                    : (dataset.backgroundColor || dataset.borderColor || 'rgb(59, 130, 246)')
                }}
              />
              <span className="text-xs text-gray-600">{dataset.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart; 