import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export const LoadingSpinner: React.FC<{ size?: 'small' | 'large' }> = ({
  size = 'large',
}) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={size} color={COLORS.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
