import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';

type CalibrationButtonProps = {
  title?: string;
  size?: number;
};

const MAX_CALIBRATION_TIME = 10000; // 10s

const CalibrationButton: React.FC<CalibrationButtonProps> = ({
  title = 'Calibrate',
  size = 150,
}) => {
  const [isCalibrating, setIsCalibrating] = useState(false);

  const isCalibratingRef = useRef(false);
  const rotationAnim = useRef(new Animated.Value(0)).current;

  const steps = 4; // 4 steps, 90° each
  const stepDurationSlow = 150;
  const stepDurationFast = 50;
  const pauseDuration = 500;

  const startSpin = () => {
    rotationAnim.setValue(0);
    let stepIndex = 0;

    const runStep = () => {
      if (!isCalibratingRef.current) return;

      Animated.sequence([
        Animated.timing(rotationAnim, {
          toValue: (stepIndex + 1) / steps - 0.05, // slow approach
          duration: stepDurationSlow,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnim, {
          toValue: (stepIndex + 1) / steps, // snap
          duration: stepDurationFast,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(pauseDuration),
      ]).start(() => {
        stepIndex = stepIndex + 1; // <-- keep increasing, no modulo
        runStep();
      });
    };

    runStep();
  };

  const stopSpin = () => {
    rotationAnim.stopAnimation();
    rotationAnim.setValue(0); // reset only when finished
  };

  const handlePress = async () => {
    if (isCalibrating) return;

    setIsCalibrating(true);
    isCalibratingRef.current = true;

    startSpin();

    try {
      await new Promise<void>(resolve =>
        setTimeout(resolve, MAX_CALIBRATION_TIME),
      );
    } finally {
      isCalibratingRef.current = false;
      setIsCalibrating(false);
      stopSpin();
    }
  };

  const spin = rotationAnim.interpolate({
    inputRange: [0, 1000],
    outputRange: ['0deg', '-360000deg'], // negative for counter-clockwise
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isCalibrating}
    >
      <View style={[styles.card, { width: size, height: size }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/cog.png')}
            style={styles.image}
            resizeMode="contain"
          />
          <Animated.View
            style={[styles.overlayContainer, { transform: [{ rotate: spin }] }]}
          >
            <Image
              source={require('../assets/sync.png')}
              style={styles.overlayImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f4f4f4ff',
    borderRadius: 12,
    alignItems: 'center',
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    color: '#363636ff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 64,
    height: 64,
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 14,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 1,
  },
  overlayImage: {
    width: 24,
    height: 24,
  },
});

export default CalibrationButton;
