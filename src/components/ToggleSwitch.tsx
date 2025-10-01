import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
  ImageSourcePropType,
  Easing,
} from 'react-native';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  trackWidth?: number;
  trackHeight?: number;
  thumbOnImage?: ImageSourcePropType;
  thumbOffImage?: ImageSourcePropType;
}

export default function ToggleSwitch({
  value,
  onValueChange,
  trackWidth = 40,
  trackHeight = 20,
  thumbOnImage,
  thumbOffImage,
}: ToggleSwitchProps) {
  const [enabled, setEnabled] = useState(value);
  const thumbAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const onOpacityAnim = useRef(new Animated.Value(value ? 0.5 : 0)).current;
  const offOpacityAnim = useRef(new Animated.Value(value ? 0 : 0.5)).current;
  const thumbSize = trackHeight - 4;

  const handleToggle = () => {
    const isTurningOn = !enabled;

    Animated.parallel([
      Animated.timing(enabled ? onOpacityAnim : offOpacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(thumbAnim, {
        toValue: isTurningOn ? 1 : 0,
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Update state once movement is done
      setEnabled(isTurningOn);
      onValueChange(isTurningOn);

      // Fade in the new image
      Animated.timing(isTurningOn ? onOpacityAnim : offOpacityAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <TouchableOpacity onPress={handleToggle} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.track,
          {
            width: trackWidth,
            height: trackHeight,
            borderRadius: trackHeight / 2,
            backgroundColor: thumbAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['#aaa', '#4e89c8'],
            }),
          },
        ]}
      >
        {/* White circular thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              left: thumbAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [2, trackWidth - thumbSize - 2],
              }),
              backgroundColor: 'white',
            },
          ]}
        >
          {thumbOnImage && (
            <Animated.Image
              source={thumbOnImage}
              style={[
                styles.thumbImage,
                {
                  opacity: onOpacityAnim,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
              ]}
            />
          )}
          {thumbOffImage && (
            <Animated.Image
              source={thumbOffImage}
              style={[
                styles.thumbImage,
                {
                  opacity: offOpacityAnim,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
              ]}
            />
          )}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
    padding: 2,
  },
  thumb: {
    position: 'absolute',
    top: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
