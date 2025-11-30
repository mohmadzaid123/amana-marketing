"use client";

interface BubbleDataPoint {
  city: string;
  country: string;
  value: number;
  secondaryValue?: number;
  x: number; // longitude
  y: number; // latitude
}

interface BubbleMapProps {
  title: string;
  data: BubbleDataPoint[];
  className?: string;
  height?: number;
  primaryColor?: string;
  formatValue?: (value: number) => string;
  metric?: string;
}

export function BubbleMap({ 
  title, 
  data, 
  className = "", 
  height = 500,
  primaryColor = '#3B82F6',
  formatValue = (value) => value.toLocaleString(),
  metric = 'Revenue'
}: BubbleMapProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-96 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  
  // Calculate bubble sizes (between 10 and 60)
  const getBubbleSize = (value: number) => {
    if (maxValue === minValue) return 35;
    const normalized = (value - minValue) / (maxValue - minValue);
    return 10 + normalized * 50;
  };

  // Convert latitude/longitude to SVG coordinates
  const viewBoxWidth = 1000;
  const viewBoxHeight = height;
  
  const convertCoordinates = (x: number, y: number) => {
    // Simple mercator-like projection
    // Longitude: -180 to 180 -> 0 to 1000
    // Latitude: -90 to 90 -> 0 to height (inverted)
    const svgX = ((x + 180) / 360) * viewBoxWidth;
    const svgY = ((90 - y) / 180) * viewBoxHeight;
    return { svgX, svgY };
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      
      <div className="relative bg-gray-900 rounded-lg p-4 border border-gray-700 overflow-hidden">
        {/* Background world map image */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat opacity-30"
          style={{ 
            backgroundImage: "url('/map.png')",
            backgroundSize: '100% 100%',
            filter: 'brightness(0.7)'
          }}
        />
        
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full relative z-10"
          style={{ height: `${height}px` }}
        >
          {/* World map grid */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width={viewBoxWidth} height={viewBoxHeight} fill="transparent" />

          {/* Bubbles */}
          {data.map((point, index) => {
            const { svgX, svgY } = convertCoordinates(point.x, point.y);
            const radius = getBubbleSize(point.value);
            
            return (
              <g key={index} className="group cursor-pointer">
                {/* Outer glow */}
                <circle
                  cx={svgX}
                  cy={svgY}
                  r={radius}
                  fill={primaryColor}
                  opacity="0.2"
                  className="group-hover:opacity-30 transition-opacity"
                />
                {/* Main bubble */}
                <circle
                  cx={svgX}
                  cy={svgY}
                  r={radius * 0.7}
                  fill={primaryColor}
                  opacity="0.6"
                  className="group-hover:opacity-80 transition-opacity"
                  stroke={primaryColor}
                  strokeWidth="1"
                />
                {/* Inner highlight */}
                <circle
                  cx={svgX - radius * 0.2}
                  cy={svgY - radius * 0.2}
                  r={radius * 0.25}
                  fill="white"
                  opacity="0.4"
                />
                
                {/* Tooltip on hover */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <rect
                    x={svgX + radius + 5}
                    y={svgY - 25}
                    width="140"
                    height="50"
                    fill="#1F2937"
                    stroke="#4B5563"
                    strokeWidth="1"
                    rx="4"
                  />
                  <text
                    x={svgX + radius + 15}
                    y={svgY - 10}
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {point.city}
                  </text>
                  <text
                    x={svgX + radius + 15}
                    y={svgY + 5}
                    fill="#9CA3AF"
                    fontSize="10"
                  >
                    {point.country}
                  </text>
                  <text
                    x={svgX + radius + 15}
                    y={svgY + 20}
                    fill={primaryColor}
                    fontSize="11"
                    fontWeight="600"
                  >
                    {metric}: {formatValue(point.value)}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span>Bubble size represents {metric.toLowerCase()}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.6 }}></div>
            <span>Min: {formatValue(minValue)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.6 }}></div>
            <span>Max: {formatValue(maxValue)}</span>
          </div>
        </div>
      </div>

      {/* City list */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {data.sort((a, b) => b.value - a.value).map((point, index) => (
          <div key={index} className="bg-gray-900 rounded p-3 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-semibold text-sm">{point.city}</span>
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  backgroundColor: primaryColor, 
                  opacity: 0.8,
                  transform: `scale(${getBubbleSize(point.value) / 30})`
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mb-1">{point.country}</div>
            <div className="text-sm" style={{ color: primaryColor }}>
              {formatValue(point.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
