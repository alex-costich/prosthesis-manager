import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const emgData = [
  677, 670, 676, 671, 671, 673, 677, 673, 674, 673, 671, 674, 678, 674, 671,
  671, 672, 678, 673, 674, 672, 672, 675, 679, 679, 671, 673, 673, 677, 676,
  670, 674, 676, 679, 671, 673, 676, 680, 675, 670, 669, 671, 675, 679, 672,
  675, 681, 682, 673,
];

const EmgChart = () => {
  // Create simple numeric labels for the x-axis (time points)
  const labels = emgData.map((_, index) =>
    index % 10 === 0 ? index.toString() : '',
  );

  return (
    <View style={styles.chartContainer}>
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data: emgData,
              color: () => '#218ef3ff',
            },
          ],
        }}
        width={screenWidth - 60} // screenWidth - padding
        height={160}
        chartConfig={{
          backgroundColor: '#e3eaf5',
          backgroundGradientFrom: '#e3eaf5',
          backgroundGradientTo: '#e3eaf5',
          decimalPlaces: 0,
          color: () => '#b3cbffff',
          labelColor: () => '#6c95ee',
          propsForDots: {
            r: '1',
            strokeWidth: '1',
            stroke: '#2196F3',
          },
        }}
        style={{ marginTop: 10, borderRadius: 4 }}
        bezier
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#e3eaf5',
    padding: 20,
    paddingLeft: 0,
    borderRadius: 16,
  },
});

export default EmgChart;
