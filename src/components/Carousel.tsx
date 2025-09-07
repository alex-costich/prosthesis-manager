import React, { useRef, useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface CarouselProps {
  slides: React.ReactNode[];
  height: number;
}

export default function Carousel({ slides, height }: CarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const animatedValues = useRef(
    slides.map(() => new Animated.Value(0)),
  ).current;

  const onScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentIndex(index);
  };

  const handleDotPress = (index: number) => {
    scrollRef.current?.scrollTo({ x: screenWidth * index, animated: true });
  };

  // Animate colors whenever currentIndex changes
  useEffect(() => {
    animatedValues.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === currentIndex ? 1 : 0,
        duration: 200, // fade duration
        useNativeDriver: false,
      }).start();
    });
  }, [currentIndex]);

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
        {slides.map((_, i) => {
          const backgroundColor = animatedValues[i].interpolate({
            inputRange: [0, 1],
            outputRange: ['#aaa', '#333'], // gray → dark gray
          });
          return (
            <TouchableOpacity
              key={i}
              onPress={() => handleDotPress(i)}
              activeOpacity={1}
            >
              <Animated.View style={[styles.dot, { backgroundColor }]} />
            </TouchableOpacity>
          );
        })}
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
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
});
