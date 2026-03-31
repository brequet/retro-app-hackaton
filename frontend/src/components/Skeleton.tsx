import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Colors, BorderRadius } from '../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = BorderRadius.sm,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function ActivityCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.topBarSkeleton} />
      <View style={styles.cardContent}>
        <Skeleton width={60} height={20} borderRadius={4} />
        <Skeleton width="80%" height={18} style={{ marginTop: 8 }} />
        {!compact && <Skeleton width="100%" height={14} style={{ marginTop: 8 }} />}
        <View style={styles.metaRow}>
          <Skeleton width={70} height={14} />
          {!compact && <Skeleton width={90} height={14} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.border,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  compactCard: {
    width: 160,
  },
  topBarSkeleton: {
    height: 4,
    backgroundColor: Colors.border,
  },
  cardContent: {
    padding: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
});
