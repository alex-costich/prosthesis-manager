import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Carousel from '../components/Carousel';
import EMGChart from '../components/EMGChart';
import BatteryCard from '../components/BatteryCard';
import SliderGroup from '../components/SliderGroup';
import Audiogram from '../components/Audiogram';
import { useBLE } from '../context/BleContext';
import Hand from '../components/Hand';
import { RootStackParamList } from '../../types';

export default function Dashboard() {
  const { connectToDevices } = useBLE();

  // Typed navigation
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    connectToDevices().then(success => {
      if (!success) console.warn('ESP32 connection failed');
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Top row: logo left, battery right */}
      <View style={styles.topThirdContainer}>
        <Pressable onPress={() => navigation.navigate('About')}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Pressable>
        <BatteryCard />
      </View>

      {/* Hand visualization */}
      <Hand />

      {/* Carousel with charts and sliders */}
      <Carousel
        height={300}
        slides={[
          <EMGChart key="chart1" />,
          <SliderGroup key="sliders" />,
          <Audiogram key="mic" width={300} height={200} />,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#f4f4f4ff',
    justifyContent: 'space-between',
    paddingBottom: 60,
  },
  topThirdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // logo left, battery right
    alignItems: 'center',
    paddingRight: 20,
    paddingLeft: 45,
  },
  logo: {
    width: 200, // desired width
    height: undefined, // height scales automatically
    aspectRatio: 2, // maintain PNG aspect ratio
    opacity: 0.8,
  },
});
