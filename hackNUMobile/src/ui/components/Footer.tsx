import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

interface FooterItem {
  id: string;
  label: string;
  icon?: string;
  onPress: () => void;
  isActive?: boolean;
}

interface FooterProps {
  items: FooterItem[];
  backgroundColor?: string;
  activeColor?: string;
  inactiveColor?: string;
}

export const Footer: React.FC<FooterProps> = ({
  items,
  backgroundColor = COLORS.surface,
  activeColor = COLORS.primary,
  inactiveColor = COLORS.textSecondary,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.content}>
        {items.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            {item.icon && (
              <Text
                style={[
                  styles.icon,
                  { color: item.isActive ? activeColor : inactiveColor },
                ]}
              >
                {item.icon}
              </Text>
            )}
            <Text
              style={[
                styles.label,
                { color: item.isActive ? activeColor : inactiveColor },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  icon: {
    fontSize: FONT_SIZES.lg,
    marginRight: 10,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
});
