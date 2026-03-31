import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useToastStore, ToastType } from '../stores/toastStore';

const iconMap: Record<ToastType, { name: string; color: string; bg: string }> = {
  success: { name: 'checkmark-circle', color: '#28a745', bg: '#e6f9ee' },
  error: { name: 'alert-circle', color: '#dc3545', bg: '#fde8ea' },
  info: { name: 'information-circle', color: Colors.primary, bg: Colors.primaryLight },
};

export function Toast() {
  const { visible, message, type, hide } = useToastStore();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const config = iconMap[type];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: config.bg, transform: [{ translateY }], opacity },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Ionicons name={config.name as any} size={22} color={config.color} />
      <Text style={[styles.message, { color: config.color }]} numberOfLines={2}>
        {message}
      </Text>
      <TouchableOpacity onPress={hide} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="close" size={18} color={config.color} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    zIndex: 9999,
    ...Shadows.md,
  },
  message: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
