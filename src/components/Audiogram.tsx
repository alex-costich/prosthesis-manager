import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Polygon } from 'react-native-svg';

interface MicVisualizerProps {
  width?: number;
  height?: number;
}

export default function Audiogram({
  width = 300,
  height = 100,
}: MicVisualizerProps) {
  const [data, setData] = useState<number[]>(Array(width).fill(0));
  const frameRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);

  // Function to generate speech-like waveform
  const generateSpeechWave = (): number[] => {
    const wave: number[] = [];
    for (let i = 0; i < 1000; i++) {
      const t = i / 1000;
      const value =
        Math.sin(t * Math.PI * 10) * 0.5 + Math.sin(t * Math.PI * 3) * 0.3;
      const noise = (Math.random() - 0.5) * 0.1;
      wave.push(value + noise);
    }
    const min = Math.min(...wave);
    const max = Math.max(...wave);
    return wave.map(v => ((v - min) / (max - min)) * (height / 2));
  };

  const speechWave = useRef<number[]>(generateSpeechWave());

  const animate = () => {
    const newData = data.map((v, i) => {
      const idx = (offsetRef.current + i) % speechWave.current.length;
      const target = speechWave.current[idx];
      return v * 0.9 + target * 0.1;
    });
    setData(newData);
    offsetRef.current = (offsetRef.current + 2) % speechWave.current.length;
    frameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [width, height]);

  const centerY = height / 2;

  // Construct polygon points
  const topPoints = data.map((v, i) => `${i},${centerY - v}`).join(' ');
  const bottomPoints = data
    .map((v, i) => `${i},${centerY + v}`)
    .reverse()
    .join(' ');

  const polygonPoints = `${topPoints} ${bottomPoints}`;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Polygon
          points={polygonPoints}
          fill="#4e89c8" // filled color
          stroke="#2e5a9e"
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e0e0e0ff',
    borderRadius: 6,
    overflow: 'hidden',
  },
});
