import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { interpolateColor } from '../functions/interpolateColor';

const COLOR_START = { r: 227, g: 234, b: 245 }; // #e3eaf5
const COLOR_END = { r: 74, g: 134, b: 255 }; // #4a86ff

const SEGMENT_WIDTH = 30;
const SCALE_FACTOR = 0.25;

interface FingerProps {
  height: number;
  segments?: number;
  pressure?: number;
}

const Finger: React.FC<FingerProps> = ({
  height,
  segments = 3,
  pressure = 0,
}) => {
  const segmentHeight = height / segments;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const targetScale = 1 + pressure * SCALE_FACTOR;

    Animated.timing(scaleAnim, {
      toValue: targetScale,
      duration: 120, // smooth but responsive
      useNativeDriver: true,
    }).start();
  }, [pressure]);

  const getIntensity = (segmentIndex: number) => {
    if (segmentIndex === 0) return pressure;
    if (segmentIndex === 1) return pressure * 0.4;
    return 0;
  };

  return (
    <View style={styles.finger}>
      {Array.from({ length: segments }).map((_, i) => {
        const reverseIndex = segments - 1 - i;
        const intensity = getIntensity(reverseIndex);
        const bgColor = interpolateColor(intensity, COLOR_START, COLOR_END);

        const baseSegmentStyle = {
          height: segmentHeight,
          backgroundColor: bgColor,
        };

        if (reverseIndex === 0 && pressure > 0) {
          return (
            <View key={i} style={{ position: 'relative' }}>
              <View style={[styles.segment, baseSegmentStyle]} />
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.segment,
                  {
                    position: 'absolute',
                    height: segmentHeight,
                    width: SEGMENT_WIDTH,
                    borderRadius: styles.segment.borderRadius,
                    borderColor: bgColor,
                    borderWidth: 0.8,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              />
            </View>
          );
        }

        return <View key={i} style={[styles.segment, baseSegmentStyle]} />;
      })}
    </View>
  );
};

export default Finger;

const styles = StyleSheet.create({
  segment: {
    width: SEGMENT_WIDTH,
    borderRadius: 6,
  },
  finger: {
    flexDirection: 'column-reverse',
    gap: 8,
  },
});
