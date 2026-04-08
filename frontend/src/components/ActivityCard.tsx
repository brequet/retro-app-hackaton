import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, Spacing, Shadows } from '../constants/theme';
import { Activity } from '../types';
import { useFavoritesStore } from '../stores/favoritesStore';
import { addFavorite, removeFavorite } from '../api/queries';
import { router } from 'expo-router';

interface ActivityCardProps {
  activity: Activity;
  variant?: 'compact' | 'full' | 'list';
}

export function ActivityCard({ activity, variant = 'compact' }: ActivityCardProps) {
  const { width } = useWindowDimensions();
  const isFavorite = useFavoritesStore((s) => s.favoriteIds.has(activity.id));
  const heartScale = useRef(new Animated.Value(1)).current;

  const isRetro = activity.type === 'retro';
  const typeColor = isRetro ? Colors.retro : Colors.icebreaker;
  const typeBg = isRetro ? Colors.primaryLight : Colors.accentLight;

  const handleToggleFavorite = async () => {
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.4,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      if (isFavorite) {
        await removeFavorite(activity.id);
      } else {
        await addFavorite(activity.id);
      }
    } catch (e) {
      // silently fail, optimistic update already reverted
    }
  };

  const handlePress = () => {
    router.push(`/activity/${activity.id}`);
  };

  const isCompact = variant === 'compact';
  const isList = variant === 'list';
  // Responsive card width: desktop gets wider cards (300px max), mobile adapts
  const cardWidth = isCompact ? Math.min(300, Math.max(240, width * 0.7)) : undefined;

  if (isList) {
    return (
      <TouchableOpacity style={listStyles.card} onPress={handlePress} activeOpacity={0.7}>
        {/* Colored left accent */}
        <View style={[listStyles.accent, { backgroundColor: typeColor }]} />

        <View style={listStyles.body}>
          <View style={listStyles.topRow}>
            {/* Badge */}
            <View style={[listStyles.badge, { backgroundColor: typeBg }]}>
              <Text style={[listStyles.badgeText, { color: typeColor }]}>
                {isRetro ? 'Retro' : 'Icebreaker'}
              </Text>
            </View>

            {/* Favorite button */}
            <TouchableOpacity
              onPress={handleToggleFavorite}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorite ? Colors.error : Colors.inactive}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <Text style={listStyles.title} numberOfLines={1}>
            {activity.title}
          </Text>

          <Text style={listStyles.description} numberOfLines={2}>
            {activity.description}
          </Text>

          {/* Meta row */}
          <View style={listStyles.metaRow}>
            <View style={listStyles.metaItem}>
              <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
              <Text style={listStyles.metaText}>{activity.duration}</Text>
            </View>
            <View style={listStyles.metaItem}>
              <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
              <Text style={listStyles.metaText}>{activity.team_size}</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={listStyles.tagsRow}>
            {activity.tags.slice(0, 4).map((tag) => (
              <View key={tag} style={listStyles.tag}>
                <Text style={listStyles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isCompact ? { width: cardWidth, height: 140 } : styles.fullCard,
        { borderLeftColor: typeColor },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View>
          {/* Type badge */}
          <View style={[styles.badge, { backgroundColor: typeBg }]}>
            <Text style={[styles.badgeText, { color: typeColor }]}>
              {isRetro ? 'Retro' : 'Icebreaker'}
            </Text>
          </View>

          <Text style={styles.title} numberOfLines={isCompact ? 1 : 1}>
            {activity.title}
          </Text>
        </View>

        {!isCompact && (
          <Text style={styles.description} numberOfLines={2}>
            {activity.description}
          </Text>
        )}

        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{activity.duration}</Text>
          </View>
          {!isCompact && (
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{activity.team_size}</Text>
            </View>
          )}
        </View>

        {/* Tags */}
        {!isCompact && (
          <View style={styles.tagsRow}>
            {activity.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={[styles.tag, { borderColor: typeColor }]}>
                <Text style={[styles.tagText, { color: typeColor }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Favorite button */}
      <TouchableOpacity
        style={styles.favoriteBtn}
        onPress={handleToggleFavorite}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? '#ef4444' : Colors.inactive}
          />
        </Animated.View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// --- List variant styles ---
const listStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    ...Shadows.sm,
  },
  accent: {
    width: 5,
  },
  body: {
    flex: 1,
    padding: Spacing.md,
    paddingLeft: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
  },
  tagText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

// --- Compact/Full variant styles ---
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    ...Shadows.sm,
    position: 'relative',
  },
  fullCard: {
    width: '100%',
  },
  content: {
    padding: Spacing.md,
    flex: 1,
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  favoriteBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 1,
  },
});
