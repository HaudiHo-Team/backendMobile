import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

const TestScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Приложение работает!</Text>
      <Text style={styles.subtitle}>
        Аудио утилиты настроены и готовы к использованию
      </Text>
      <View style={styles.features}>
        <Text style={styles.feature}>✅ Разрешения настроены</Text>
        <Text style={styles.feature}>✅ Аудио утилиты созданы</Text>
        <Text style={styles.feature}>✅ Хуки готовы</Text>
        <Text style={styles.feature}>✅ VoiceRecorder компонент</Text>
        <Text style={styles.feature}>✅ Красивый чат</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  features: {
    alignItems: 'flex-start',
  },
  feature: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
});

export default TestScreen;
