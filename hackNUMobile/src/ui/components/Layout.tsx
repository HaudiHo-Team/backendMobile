import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Header } from './Header';
import { Footer } from './Footer';
import { LanguageSwitcher } from './LanguageSwitcher';
import { COLORS } from '../../constants';

interface LayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  headerRightComponent?: React.ReactNode;
  footerItems?: Array<{
    id: string;
    label: string;
    icon?: string;
    onPress: () => void;
    isActive?: boolean;
  }>;
  showFooter?: boolean;
  scrollable?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  headerTitle,
  showBackButton = false,
  onBackPress,
  headerRightComponent,
  footerItems = [],
  showFooter = false,
  scrollable = true,
}) => {
  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps = scrollable
    ? {
        style: styles.scrollContent,
        contentContainerStyle: styles.scrollContentContainer,
        showsVerticalScrollIndicator: false,
      }
    : { style: styles.content };

  const rightComponent = headerRightComponent || <LanguageSwitcher />;

  return (
    <View style={styles.container}>
      {headerTitle && (
        <Header
          title={headerTitle}
          showBackButton={showBackButton}
          onBackPress={onBackPress}
          rightComponent={rightComponent}
        />
      )}

      <ContentWrapper {...contentProps}>{children}</ContentWrapper>

      {showFooter && footerItems.length > 0 && <Footer items={footerItems} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
});
