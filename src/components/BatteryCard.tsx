import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const BatteryCard = ({ value = 80, size = 100, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Battery</Text>
      <View style={styles.circleContainer}>
        <Svg width={size} height={size}>
          <Circle
            stroke="#bebebeff"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke="#4e89c8ff"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="butt"
          />
        </Svg>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 150,
    height: 150,
    backgroundColor: '#f4f4f4ff',
    borderRadius: 12,
    alignItems: 'center',
    padding: 10,
    alignSelf: 'flex-end',
  },
  title: {
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 8,
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 30,
    fontWeight: 400,
    color: '#393535ff',
  },
});

export default BatteryCard;
