import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenProps } from '../types';
import { COLORS, SPACING } from '../constants';
import { Title, AnimatedCard, AnimatedButton, Layout } from '../ui/components';

const SettingsScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <Layout headerTitle="Настройки">
      <View style={styles.content}>
        <Title level={1}>Настройки</Title>

        <AnimatedCard animationType="scale" delay={100}>
          <Title level={2}>Общие настройки</Title>
          <AnimatedButton
            title="Назад"
            onPress={handleGoBack}
            variant="secondary"
          />
        </AnimatedCard>

        <AnimatedCard animationType="fade" delay={200}>
          <Title level={2}>О приложении</Title>
          <Title level={3}>Версия: 1.0.0</Title>
          <Title level={3}>Разработчик: HackNU Team</Title>
        </AnimatedCard>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
  },
});

export default SettingsScreen;
