import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Hand from './components/Hand';
import EMGChart from './components/EMGChart';
import SliderBlock from './components/SliderBlock';
import ConnectionHandler from './components/ConnectionHandler';

type FingerName = 'pinky' | 'ring' | 'middle' | 'pointer' | 'thumb';

const App = () => {
  const [fingerInputValues, setFingerInputValues] = useState<
    Record<FingerName, number>
  >({
    pinky: 0,
    ring: 0,
    middle: 0,
    pointer: 0,
    thumb: 0,
  });

  // console.log(fingerInputValues);

  return (
    <SafeAreaView style={styles.container}>
      <ConnectionHandler />
      <Hand inputData={fingerInputValues} />
      <SliderBlock
        values={fingerInputValues}
        setValues={setFingerInputValues}
      />
      <EMGChart />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    padding: 20,
  },
});

export default App;
