import React, { useState, useRef, useEffect } from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import ConnectionButton from '../components/ConnectionButton';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Connect: undefined;
  Dashboard: undefined;
};

// Toggle local simulation (UI still calls the real connect API but in simulate mode)
const SIMULATE_CONNECTION = true;

const FLICKER_COUNT = 2;
const FLICKER_DURATION = 150;
const FADE_DURATION = 200;
const SPINNER_DELAY = 1000;

const Connect = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const errorOpacity = useRef(new Animated.Value(0)).current;
  const spinnerOpacity = useRef(new Animated.Value(0)).current;

  // Error flicker
  useEffect(() => {
    if (errorMessage) {
      const seq: Animated.CompositeAnimation[] = [];
      for (let i = 0; i < FLICKER_COUNT; i++) {
        seq.push(
          Animated.timing(errorOpacity, {
            toValue: 0.3,
            duration: FLICKER_DURATION / (FLICKER_COUNT * 4),
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.timing(errorOpacity, {
            toValue: 1,
            duration: FLICKER_DURATION / (FLICKER_COUNT * 4),
            useNativeDriver: true,
            easing: Easing.linear,
          }),
        );
      }
      seq.push(
        Animated.timing(errorOpacity, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
      );

      Animated.timing(spinnerOpacity, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();

      Animated.sequence(seq).start();
    } else {
      Animated.timing(errorOpacity, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }, [errorMessage]);

  // Spinner fade
  useEffect(() => {
    let timeout: number | undefined;
    if (isConnecting && !errorMessage) {
      timeout = setTimeout(() => {
        Animated.timing(spinnerOpacity, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }).start();
      }, SPINNER_DELAY);
    } else {
      Animated.timing(spinnerOpacity, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isConnecting, errorMessage]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Connection button */}
      <ConnectionButton
        setIsConnecting={setIsConnecting}
        onError={msg => setErrorMessage(msg)}
        onRetry={() => setErrorMessage(null)}
        disabled={isConnecting}
        simulateConnection={SIMULATE_CONNECTION}
        onSuccess={() => navigation.replace('Dashboard')}
      />

      {/* Error overlay */}
      <Animated.View
        style={[styles.statusContainer, { opacity: errorOpacity, zIndex: 10 }]}
        pointerEvents="none"
      >
        {errorMessage && (
          <>
            <View style={styles.error_title_container}>
              <Image
                source={require('../assets/cancel.png')}
                style={styles.error_icon}
              />
              <Text style={styles.error_title}>Connection failed</Text>
            </View>
            <Text style={styles.error_subtitle}>{errorMessage}</Text>
          </>
        )}
      </Animated.View>

      {/* Spinner overlay */}
      <Animated.View
        style={[
          styles.statusContainer,
          { opacity: spinnerOpacity, zIndex: 10 },
        ]}
        pointerEvents="none"
      >
        {isConnecting && !errorMessage && (
          <ActivityIndicator size="large" color="#333" />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

export default Connect;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusContainer: {
    position: 'absolute',
    top: '33%',
    alignItems: 'center',
    gap: 4,
  },
  error_title_container: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  error_icon: { width: 16, height: 16 },
  error_title: { fontSize: 18 },
  error_subtitle: {
    fontSize: 13,
    textAlign: 'center',
    width: '55%',
    opacity: 0.6,
  },
});
