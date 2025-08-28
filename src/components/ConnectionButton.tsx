// ConnectionButton.tsx
import React, { useRef } from 'react';
import { TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';
import { connectToDevices, ConnectionResult } from '../functions/bleConnection';
import { useBLE } from '../context/BleContext';

type Props = {
  onError: (message: string) => void;
  onSuccess: () => void;
  onRetry?: () => void;
  setIsConnecting?: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
  simulateConnection?: boolean;
};

const plugInitialPosition = [15, 27];
const plugFinalPosition = [22, 37];
const socketInitialPosition = [18, 25];
const socketFinalPosition = [24.65, 30];

const ConnectionButton: React.FC<Props> = ({
  onError,
  onSuccess,
  onRetry,
  setIsConnecting,
  disabled,
  simulateConnection,
}) => {
  const { addData } = useBLE(); // 🔹 context live data

  const plugX = useRef(new Animated.Value(plugInitialPosition[1])).current;
  const plugY = useRef(new Animated.Value(plugInitialPosition[0])).current;
  const socketX = useRef(new Animated.Value(socketInitialPosition[1])).current;
  const socketY = useRef(new Animated.Value(socketInitialPosition[0])).current;

  const animateForward = () => {
    Animated.parallel([
      Animated.timing(plugX, {
        toValue: plugFinalPosition[1],
        duration: 700,
        easing: Easing.in(Easing.exp),
        useNativeDriver: false,
      }),
      Animated.timing(plugY, {
        toValue: plugFinalPosition[0],
        duration: 700,
        easing: Easing.in(Easing.exp),
        useNativeDriver: false,
      }),
      Animated.timing(socketX, {
        toValue: socketFinalPosition[1],
        duration: 700,
        easing: Easing.in(Easing.exp),
        useNativeDriver: false,
      }),
      Animated.timing(socketY, {
        toValue: socketFinalPosition[0],
        duration: 700,
        easing: Easing.in(Easing.exp),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const animateBack = () => {
    Animated.parallel([
      Animated.timing(plugX, {
        toValue: plugInitialPosition[1],
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }),
      Animated.timing(plugY, {
        toValue: plugInitialPosition[0],
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }),
      Animated.timing(socketX, {
        toValue: socketInitialPosition[1],
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }),
      Animated.timing(socketY, {
        toValue: socketInitialPosition[0],
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePress = () => {
    onRetry?.();
    animateForward();
    setIsConnecting?.(true);

    if (simulateConnection) {
      setTimeout(() => {
        animateBack();
        setIsConnecting?.(false);
        onSuccess();
      }, 2500);
      return;
    }

    (async () => {
      const result: ConnectionResult = await connectToDevices(addData); // 🔹 pass context setter

      setIsConnecting?.(false);

      if (!result.success) {
        onError(result.error || 'Unknown error occurred.');
        animateBack();
      } else {
        onSuccess();
      }
    })();
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      disabled={disabled}
    >
      <Animated.Image
        source={require('../assets/plug.png')}
        style={[styles.plugImage, { bottom: plugY, left: plugX }]}
      />
      <Animated.Image
        source={require('../assets/socket.png')}
        style={[styles.socketImage, { top: socketY, right: socketX }]}
      />
    </TouchableOpacity>
  );
};

export default ConnectionButton;

const styles = StyleSheet.create({
  button: {
    width: 120,
    height: 120,
    backgroundColor: '#e0e0e0ff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plugImage: { position: 'absolute', transform: [{ rotate: '45deg' }] },
  socketImage: { position: 'absolute', transform: [{ rotate: '-135deg' }] },
});
