import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useBLE } from '../context/BleContext';
import { interpolateColor, RGB } from '../functions/interpolateColor';

export default function Hand() {
  const { liveState } = useBLE();
  const sliders = liveState.sliders; // [index, middle, ring, pinky, thumb]

  const baseColor: RGB = { r: 224, g: 224, b: 224 }; // #e0e0e0
  const endColor: RGB = { r: 78, g: 137, b: 200 }; // #4e89c8
  const normalize = (val: number) => val / 180;

  const fingerData = [
    { height: 100, segments: 2 }, // Thumb
    { height: 120, segments: 3 }, // Index
    { height: 160, segments: 3 }, // Middle
    { height: 160, segments: 3 }, // Ring
    { height: 140, segments: 3 }, // Pinky
  ];

  const gap = 6;

  const renderFinger = (
    totalHeight: number,
    segments: number,
    sliderValue: number,
    key: number,
  ) => {
    const segmentHeight = (totalHeight - gap * (segments - 1)) / segments;

    return (
      <View
        key={key}
        style={{
          flexDirection: 'column',
          gap: gap,
          justifyContent: 'flex-end',
        }}
      >
        {Array.from({ length: segments }).map((_, i) => (
          <View
            key={i}
            style={{
              height: segmentHeight,
              width: 26.5,
              borderRadius: 4,
              backgroundColor: interpolateColor(
                normalize(sliderValue),
                baseColor,
                endColor,
              ),
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.palmAndFingersContainer}>
        <View style={styles.fingersContainer}>
          {fingerData
            .slice(1) // index → pinky
            .map((f, i) =>
              renderFinger(f.height, f.segments, sliders[i] || 0, i),
            )}
        </View>

        <View
          style={[
            styles.palm,
            {
              backgroundColor: `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`,
            },
          ]}
        />
      </View>

      {/* Thumb uses the last slider */}
      <View style={{ marginBottom: 50 }}>
        {renderFinger(
          fingerData[0].height,
          fingerData[0].segments,
          sliders[sliders.length - 1] || 0,
          5,
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 20,
  },
  palmAndFingersContainer: { gap: 20 },
  fingersContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 18,
  },
  palm: {
    width: 160,
    height: 120,
    borderRadius: 4,
  },
});
