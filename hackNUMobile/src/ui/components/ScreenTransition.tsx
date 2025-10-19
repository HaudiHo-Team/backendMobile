import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../../constants';

interface ScreenTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  isActive,
  direction = 'right',
  duration = 300,
}) => {
  const translateX = React.useRef(new Animated.Value(isActive ? 0 : screenWidth)).current;
  const translateY = React.useRef(new Animated.Value(isActive ? 0 : screenHeight)).current;
  const opacity = React.useRef(new Animated.Value(isActive ? 1 : 0)).current;

  React.useEffect(() => {
    const animations = [];

    if (direction === 'left' || direction === 'right') {
      animations.push(
        Animated.timing(translateX, {
          toValue: isActive ? 0 : (direction === 'right' ? screenWidth : -screenWidth),
          duration,
          useNativeDriver: true,
        })
      );
    }

    if (direction === 'up' || direction === 'down') {
      animations.push(
        Animated.timing(translateY, {
          toValue: isActive ? 0 : (direction === 'down' ? screenHeight : -screenHeight),
          duration,
          useNativeDriver: true,
        })
      );
    }

    animations.push(
      Animated.timing(opacity, {
        toValue: isActive ? 1 : 0,
        duration,
        useNativeDriver: true,
      })
    );

    Animated.parallel(animations).start();
  }, [isActive, direction, duration, translateX, translateY, opacity]);

  const animatedStyle = {
    transform: [
      { translateX },
      { translateY },
    ],
    opacity,
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
