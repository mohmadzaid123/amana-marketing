"use client";

interface LineChartDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  title: string;
  data: LineChartDataPoint[];
  className?: string;
  height?: number;
  color?: string;
  showDots?: boolean;
  formatValue?: (value: number) => string;
  lineLabel?: string;
}

export function LineChart({ 
  title, 
  data, 
  className = "", 
  height = 300,
  color = '#3B82F6',
  showDots = true,
  formatValue = (value) => value.toLocaleString(),
  lineLabel = ''
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const valueRange = maxValue - minValue || 1;
  const chartHeight = height - 80;
  const chartWidth = 100; // percentage

  // Calculate points for the line
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((item.value - minValue) / valueRange) * chartHeight;
    return { x, y, ...item };
  });

  // Create SVG path
  const pathD = points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${point.x} ${point.y}`;
    })
    .join(' ');

  // Create area path (filled under the line)
  const areaPathD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={chartHeight * (1 - ratio)}
              x2={chartWidth}
              y2={chartHeight * (1 - ratio)}
              stroke="#374151"
              strokeWidth="0.2"
              strokeDasharray="1,1"
            />
          ))}

          {/* Area under the line */}
          <path
            d={areaPathD}
            fill={color}
            fillOpacity="0.1"
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots */}
          {showDots && points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="0.8"
                fill={color}
                className="hover:r-1.5 transition-all cursor-pointer"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="0.4"
                fill="white"
              />
            </g>
          ))}
        </svg>

        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 mt-2">
          {data.map((item, index) => (
            <div 
              key={index} 
              className="text-center"
              style={{ width: `${100 / data.length}%` }}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Value indicators on hover */}
        <div className="absolute top-0 left-0 right-0 flex justify-between">
          {points.map((point, index) => (
            <div
              key={index}
              className="group relative"
              style={{ 
                left: `${point.x}%`,
                top: `${point.y}px`,
                position: 'absolute'
              }}
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded py-1 px-2 absolute bottom-full mb-2 -translate-x-1/2 whitespace-nowrap border border-gray-600">
                {formatValue(point.value)}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      {lineLabel && (
        <div className="flex items-center justify-center mt-4 gap-2">
          <div className="w-8 h-0.5" style={{ backgroundColor: color }}></div>
          <span className="text-sm text-gray-400">{lineLabel}</span>
        </div>
      )}
    </div>
  );
}
