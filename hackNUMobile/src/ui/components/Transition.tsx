import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../../constants';

interface TransitionProps {
  children: React.ReactNode;
  visible: boolean;
  duration?: number;
  animationType?: 'fade' | 'slide' | 'scale';
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const Transition: React.FC<TransitionProps> = ({
  children,
  visible,
  duration = 300,
  animationType = 'fade',
}) => {
  const animatedValue = React.useRef(new Animated.Value(visible ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: visible ? 1 : 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [visible, duration, animatedValue]);

  const getAnimatedStyle = () => {
    switch (animationType) {
      case 'fade':
        return {
          opacity: animatedValue,
        };
      case 'slide':
        return {
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [screenWidth, 0],
              }),
            },
          ],
        };
      case 'scale':
        return {
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
          opacity: animatedValue,
        };
      default:
        return {
          opacity: animatedValue,
        };
    }
  };

  if (!visible && animatedValue._value === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, getAnimatedStyle()]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
