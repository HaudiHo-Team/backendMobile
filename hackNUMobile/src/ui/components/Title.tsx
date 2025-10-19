import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

export const Title: React.FC<{
  children: React.ReactNode;
  level?: 1 | 2 | 3;
}> = ({ children, level = 1 }) => {
  const titleStyle = [styles.title, styles[`title_${level}`]];

  return <Text style={titleStyle}>{children}</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  title_1: {
    fontSize: FONT_SIZES.xxxl,
  },
  title_2: {
    fontSize: FONT_SIZES.xxl,
  },
  title_3: {
    fontSize: FONT_SIZES.xl,
  },
});
