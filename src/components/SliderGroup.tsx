import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useBLE } from '../context/BleContext';
import ToggleSwitch from './ToggleSwitch'; // import your custom switch

export default function SliderGroup() {
  const { liveState, updateLiveState } = useBLE();
  const [slidersEnabled, setSlidersEnabled] = useState(true);

  // Animated value for opacity
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Animate opacity when slidersEnabled changes
  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: slidersEnabled ? 1 : 0.5,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [slidersEnabled]);

  const handleChange = (val: number, index: number) => {
    if (!slidersEnabled) return;
    const newSliders = [...liveState.sliders];
    newSliders[index] = val;
    updateLiveState({ sliders: newSliders });
  };

  return (
    <View style={styles.container}>
      {/* Sliders */}
      <View style={styles.sliders}>
        {liveState.sliders.map((val, i) => (
          <View key={i} style={styles.sliderWrapper}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={180}
              value={val}
              onValueChange={v => handleChange(v, i)}
              minimumTrackTintColor={slidersEnabled ? '#4e89c8' : '#aaa'}
              maximumTrackTintColor={slidersEnabled ? '#ccc' : '#ddd'}
              thumbTintColor={slidersEnabled ? '#4e89c8' : '#aaa'}
              disabled={!slidersEnabled}
            />
            <Animated.Text
              style={[styles.label, { top: 115, opacity: opacityAnim }]}
            >
              {Math.round(val)}
            </Animated.Text>
          </View>
        ))}
      </View>

      {/* Buttons + Toggle row */}
      <View style={styles.buttonsContainer}>
        {/* Switch group */}
        <View style={styles.switchWrapper}>
          <ToggleSwitch
            value={slidersEnabled}
            onValueChange={setSlidersEnabled}
            thumbOnImage={require('../assets/power-on.png')}
            thumbOffImage={require('../assets/power-off.png')}
          />
        </View>

        {/* Arrow buttons group */}
        <View style={styles.arrowsGroup}>
          <TouchableOpacity
            onPress={() =>
              slidersEnabled && updateLiveState({ sliders: [0, 0, 0, 0, 0] })
            }
            activeOpacity={0.7}
            disabled={!slidersEnabled}
          >
            <Animated.Image
              source={require('../assets/arrow-down-bold-box.png')}
              style={[styles.buttonImage, { opacity: opacityAnim }]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              slidersEnabled &&
              updateLiveState({ sliders: [50, 50, 50, 50, 50] })
            }
            activeOpacity={0.7}
            disabled={!slidersEnabled}
          >
            <Animated.Image
              source={require('../assets/arrow-up-bold-box.png')}
              style={[styles.buttonImage, { opacity: opacityAnim }]}
            />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 40,
  },
  sliderWrapper: { alignItems: 'center', flex: 1, position: 'relative' },
  label: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  slider: { width: 200, height: 40, transform: [{ rotate: '-90deg' }] },
  buttonsContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 60,
    opacity: 0.9,
  },
  arrowsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  buttonImage: { width: 30, height: 30, resizeMode: 'contain' },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  switchImage: {
    width: 20,
    height: 20,
    opacity: 0.5,
    resizeMode: 'contain',
  },
});
