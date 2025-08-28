import React from 'react';
import { View, StyleSheet } from 'react-native';
import Finger from './Finger';

const FINGER_HEIGHTS = {
  pinky: 105,
  ring: 140,
  middle: 152.5,
  pointer: 140,
  thumb: 85,
  palm: 100,
};

interface HandProps {
  inputData: {
    pinky: number;
    ring: number;
    middle: number;
    pointer: number;
    thumb: number;
  };
}

export default function Hand({ inputData }: HandProps) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <View>
        <View style={styles.fingersContainer}>
          <Finger height={FINGER_HEIGHTS.pinky} pressure={inputData.pinky} />
          <Finger height={FINGER_HEIGHTS.ring} pressure={inputData.ring} />
          <Finger height={FINGER_HEIGHTS.middle} pressure={inputData.middle} />
          <Finger
            height={FINGER_HEIGHTS.pointer}
            pressure={inputData.pointer}
          />
        </View>
        <View style={styles.palm} />
      </View>
      <View style={styles.thumb}>
        <Finger height={85} segments={2} pressure={inputData.thumb} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    width: 30,
    borderRadius: 6,
  },
  palm: {
    height: 100,
    backgroundColor: '#e3eaf5',
    borderRadius: 10,
    marginTop: 10,
  },
  fingersContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  finger: {
    flexDirection: 'column-reverse',
    gap: 8,
  },
  thumb: {
    alignSelf: 'flex-end',
    marginBottom: 40,
  },
});
