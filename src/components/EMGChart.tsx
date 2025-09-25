import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';

interface SmoothEMGChartProps {
  height?: number;
  windowTimeSec?: number;
  sampleIntervalMs?: number;
  minY?: number;
  maxY?: number;
  verticalGridCount?: number; // number of vertical grid lines
  horizontalGridCount?: number; // number of horizontal grid lines
}

const screenWidth = Dimensions.get('window').width;

export default function SmoothEMGChartWithGrid({
  height = 200,
  windowTimeSec = 5,
  sampleIntervalMs = 20,
  minY = 600,
  maxY = 700,
  verticalGridCount = 10,
  horizontalGridCount = 4,
}: SmoothEMGChartProps) {
  const samplesPerWindow = Math.floor(
    (windowTimeSec * 1000) / sampleIntervalMs,
  );
  const chartWidth = screenWidth - 100; // leave space for Y-axis labels

  const [data, setData] = useState<number[]>(
    Array(samplesPerWindow).fill((minY + maxY) / 2),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const nextVal = Math.floor(Math.random() * (maxY - minY)) + minY; // replace with BLE
      setData(prev => [...prev.slice(1), nextVal]);
    }, sampleIntervalMs);

    return () => clearInterval(interval);
  }, [sampleIntervalMs, minY, maxY]);

  // Build waveform path
  const path = data
    .map((val, i) => {
      const x = (i / (samplesPerWindow - 1)) * chartWidth;
      const y = height - ((val - minY) / (maxY - minY)) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Y-axis labels
  const yLabels = [maxY, (maxY + minY) / 2, minY];

  return (
    <View style={{ flexDirection: 'row', paddingLeft: 40 }}>
      {/* Y-axis labels */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height,
          justifyContent: 'space-between',
        }}
      >
        {yLabels.map((v, i) => (
          <Text key={i} style={{ color: '#555', fontSize: 12 }}>
            {v}
          </Text>
        ))}
      </View>

      {/* Chart */}
      <View>
        <Svg width={chartWidth} height={height}>
          {/* Horizontal grid lines */}
          {Array.from({ length: horizontalGridCount + 1 }).map((_, i) => (
            <Line
              key={`h-${i}`}
              x1={0}
              y1={(i / horizontalGridCount) * height}
              x2={chartWidth}
              y2={(i / horizontalGridCount) * height}
              stroke="#dfdedeff"
              strokeWidth={1}
            />
          ))}

          {/* Vertical grid lines */}
          {Array.from({ length: verticalGridCount + 1 }).map((_, i) => (
            <Line
              key={`v-${i}`}
              x1={(i / verticalGridCount) * chartWidth}
              y1={0}
              x2={(i / verticalGridCount) * chartWidth}
              y2={height}
              stroke="#dfdedeff"
              strokeWidth={1}
            />
          ))}

          {/* EMG waveform */}
          <Path d={path} stroke="#4e89c8ff" strokeWidth={2} fill="none" />
        </Svg>
      </View>
    </View>
  );
}
