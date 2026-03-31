import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { Colors, Shadows } from '../constants/theme';

const MAX_MOBILE_WIDTH = 480;

export function ResponsiveWrapper({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();

  // On web with large screens, constrain to mobile-like width
  if (Platform.OS === 'web' && width > MAX_MOBILE_WIDTH) {
    return (
      <View style={styles.desktopContainer}>
        <View style={[styles.mobileFrame, { maxWidth: MAX_MOBILE_WIDTH }]}>
          {children}
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileFrame: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.background,
    ...Shadows.lg,
    overflow: 'hidden',
  },
});
