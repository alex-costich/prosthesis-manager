import Slider from '@react-native-community/slider';
import { StyleSheet, View } from 'react-native';

const sliderLength = 100;
const sliderPadding = 28;

const FINGER_NAMES = ['pinky', 'ring', 'middle', 'pointer', 'thumb'] as const;
type FingerName = (typeof FINGER_NAMES)[number];

interface SliderBlockProps {
  values: Record<FingerName, number>;
  setValues: React.Dispatch<React.SetStateAction<Record<FingerName, number>>>;
}

export default function SliderBlock({ values, setValues }: SliderBlockProps) {
  const handleChange = (finger: FingerName, newValue: number) => {
    setValues(prev => ({ ...prev, [finger]: newValue }));
  };

  return (
    <View style={styles.sliderRow}>
      {FINGER_NAMES.map(finger => (
        <View key={finger} style={styles.sliderWrapper}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={values[finger]}
            onValueChange={value => handleChange(finger, value)}
            minimumTrackTintColor="#2196F3"
            maximumTrackTintColor="#6c95ee"
            thumbTintColor="#4a86ff"
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  sliderWrapper: {
    width: sliderPadding,
    height: sliderLength,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    width: sliderLength,
    height: sliderPadding,
    transform: [{ rotate: '-90deg' }],
  },
});
