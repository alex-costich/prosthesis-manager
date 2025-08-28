import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Slider from '@react-native-community/slider';

export default function SliderGroup() {
  const [values, setValues] = useState([0, 0, 0, 0, 0]);

  const handleChange = (val: number, index: number) => {
    const updated = [...values];
    updated[index] = val;
    setValues(updated);
  };

  return (
    <View style={styles.container}>
      {values.map((val, i) => (
        <View key={i} style={styles.sliderWrapper}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={val}
            onValueChange={v => handleChange(v, i)}
            minimumTrackTintColor="#4e89c8"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#4e89c8"
          />
          <Text style={[styles.label, { top: 115 }]}>{val.toFixed(1)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // arrange sliders side by side
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
  },
  sliderWrapper: {
    alignItems: 'center',
    flex: 1,
    position: 'relative', // ✅ needed for absolute positioning of label
  },
  label: {
    position: 'absolute', // ✅ absolute positioning
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  slider: {
    width: 200, // becomes the height because of rotation
    height: 40,
    transform: [{ rotate: '-90deg' }], // make it vertical
  },
});
