import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import { useBLE } from '../context/BleContext';

export default function SliderGroup() {
  const { liveState, updateLiveState } = useBLE();

  const handleChange = (val: number, index: number) => {
    const newSliders = [...liveState.sliders];
    newSliders[index] = val;
    updateLiveState({ sliders: newSliders });
  };

  return (
    <View style={styles.container}>
      <View style={styles.sliders}>
        {liveState.sliders.map((val, i) => (
          <View key={i} style={styles.sliderWrapper}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={180}
              value={val}
              onValueChange={v => handleChange(v, i)}
              minimumTrackTintColor="#4e89c8"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#4e89c8"
            />

            <Text style={[styles.label, { top: 115 }]}>{Math.round(val)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          onPress={() => updateLiveState({ sliders: [0, 0, 0, 0, 0] })}
        >
          <Image
            source={require('../assets/arrow-down-bold-box.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => updateLiveState({ sliders: [50, 50, 50, 50, 50] })}
        >
          <Image
            source={require('../assets/arrow-up-bold-box.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sliders: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40, // more padding decreases gap
  },
  sliderWrapper: { alignItems: 'center', flex: 1, position: 'relative' },
  label: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  slider: { width: 200, height: 40, transform: [{ rotate: '-90deg' }] },
  buttons: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    gap: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 40,
    opacity: 0.8,
  },
  buttonImage: { width: 30, height: 30, resizeMode: 'contain' },
});
