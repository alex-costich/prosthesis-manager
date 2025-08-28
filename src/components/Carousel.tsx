import React, { useRef, useState } from 'react';
import { ScrollView, View, Dimensions, StyleSheet } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface CarouselProps {
  slides: React.ReactNode[];
  height: number;
}

export default function Carousel({ slides, height }: CarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentIndex(index);
  };

  return (
    <View style={[styles.container, { height }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { width: screenWidth * slides.length },
        ]}
      >
        {slides.map((slide, i) => (
          <View key={i} style={[styles.slide, { height }]}>
            {slide}
          </View>
        ))}
      </ScrollView>

      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { opacity: i === currentIndex ? 1 : 0.3 }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    backgroundColor: '#f4f4f4ff',
    bottom: 0,
  },
  scrollContent: {
    flexDirection: 'row',
  },
  slide: {
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 3,
  },
});
