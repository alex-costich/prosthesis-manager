import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Carousel from '../components/Carousel';
import EMGChart from '../components/EMGChart';
import BatteryCard from '../components/BatteryCard';
import SliderGroup from '../components/SliderGroup';
import Audiogram from '../components/Audiogram';
import { useBLE } from '../context/BleContext';

export default function Dashboard() {
  const { connectToESP32 } = useBLE();

  useEffect(() => {
    connectToESP32().then(success => {
      if (!success) console.warn('ESP32 connection failed');
    });
  }, []);

  return (
    <View style={styles.container}>
      <BatteryCard />
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
  container: { flex: 1, paddingTop: 40, backgroundColor: '#f4f4f4ff' },
});
