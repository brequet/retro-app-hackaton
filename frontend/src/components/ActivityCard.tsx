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
  const cardWidth = isCompact ? Math.min(170, (width - 56) / 2) : undefined;

  if (isList) {
    return (
      <TouchableOpacity style={listStyles.card} onPress={handlePress} activeOpacity={0.7}>
        {/* Colored left accent */}
        <View
          style={[
            listStyles.accent,
            { backgroundColor: activity.type === 'retro' ? Colors.retro : Colors.icebreaker },
          ]}
        />

        <View style={listStyles.body}>
          <View style={listStyles.topRow}>
            {/* Badge */}
            <View
              style={[
                listStyles.badge,
                { backgroundColor: activity.type === 'retro' ? Colors.primaryLight : '#e6f7f3' },
              ]}
            >
              <Text
                style={[
                  listStyles.badgeText,
                  { color: activity.type === 'retro' ? Colors.retro : Colors.icebreaker },
                ]}
              >
                {activity.type === 'retro' ? 'Retro' : 'Icebreaker'}
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
                  color={isFavorite ? '#e74c3c' : Colors.inactive}
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
        isCompact ? { width: cardWidth } : styles.fullCard,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Colored top bar */}
      <View
        style={[
          styles.topBar,
          { backgroundColor: activity.type === 'retro' ? Colors.retro : Colors.icebreaker },
        ]}
      />

      <View style={styles.content}>
        {/* Type badge */}
        <View style={[styles.badge, { backgroundColor: activity.type === 'retro' ? Colors.primaryLight : '#e6f7f3' }]}>
          <Text
            style={[
              styles.badgeText,
              { color: activity.type === 'retro' ? Colors.retro : Colors.icebreaker },
            ]}
          >
            {activity.type === 'retro' ? 'Retro' : 'Icebreaker'}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={isCompact ? 2 : 1}>
          {activity.title}
        </Text>

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
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
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
            color={isFavorite ? '#e74c3c' : Colors.inactive}
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
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
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
    borderWidth: 1,
    borderColor: Colors.border,
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
    ...Shadows.sm,
    position: 'relative',
  },
  fullCard: {
    width: '100%',
  },
  topBar: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: Spacing.md,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
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
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
  },
  favoriteBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 1,
  },
});
