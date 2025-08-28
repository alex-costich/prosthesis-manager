import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Carousel from '../components/Carousel';
import EMGChart from '../components/EMGChart';
import BatteryCard from '../components/BatteryCard';
import SliderGroup from '../components/SliderGroup'; // ✅ import the slider group

export default function Dashboard() {
  return (
    <View style={styles.container}>
      <BatteryCard />
      <Carousel
        height={300}
        slides={[
          // ✅ keep EMG chart first
          <EMGChart key="chart1" />,

          // ✅ slider group as second slide
          <SliderGroup key="sliders" />,

          // ✅ your other placeholder slides
          <Text key="slide2" style={{ fontSize: 24 }}>
            Slide 3
          </Text>,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#f4f4f4ff',
  },
});
