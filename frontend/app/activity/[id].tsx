import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { Skeleton } from '../../src/components/Skeleton';
import { fetchActivity, markAsViewed, addFavorite, removeFavorite } from '../../src/api/queries';
import { useFavoritesStore } from '../../src/stores/favoritesStore';

function DetailSkeleton() {
  return (
    <View style={{ paddingHorizontal: Spacing.xl, paddingTop: Spacing.md }}>
      <Skeleton width={120} height={24} borderRadius={BorderRadius.sm} />
      <Skeleton width="70%" height={34} style={{ marginTop: Spacing.md }} />
      <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg }}>
        <Skeleton width={110} height={36} borderRadius={BorderRadius.full} />
        <Skeleton width={110} height={36} borderRadius={BorderRadius.full} />
      </View>
      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }}>
        <Skeleton width={80} height={28} borderRadius={BorderRadius.full} />
        <Skeleton width={90} height={28} borderRadius={BorderRadius.full} />
        <Skeleton width={70} height={28} borderRadius={BorderRadius.full} />
      </View>
      <Skeleton width="100%" height={16} style={{ marginTop: Spacing.xxl }} />
      <Skeleton width="100%" height={16} style={{ marginTop: Spacing.sm }} />
      <Skeleton width="80%" height={16} style={{ marginTop: Spacing.sm }} />
      <Skeleton width="100%" height={16} style={{ marginTop: Spacing.xxl }} />
      <Skeleton width="100%" height={16} style={{ marginTop: Spacing.sm }} />
      <Skeleton width="60%" height={16} style={{ marginTop: Spacing.sm }} />
    </View>
  );
}

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isFavorite = useFavoritesStore((s) => s.favoriteIds.has(id));
  const heartScale = useRef(new Animated.Value(1)).current;

  const { data: activity, isLoading } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => fetchActivity(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (id) {
      markAsViewed(id).catch(() => {});
    }
  }, [id]);

  const handleToggleFavorite = async () => {
    // Animate the heart
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      if (isFavorite) {
        await removeFavorite(id);
      } else {
        await addFavorite(id);
      }
    } catch {}
  };

  if (isLoading || !activity) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerBtn} />
        </View>
        <DetailSkeleton />
      </SafeAreaView>
    );
  }

  const typeColor = activity.type === 'retro' ? Colors.retro : Colors.icebreaker;
  const typeBg = activity.type === 'retro' ? Colors.primaryLight : '#e6f7f3';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerBtn}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#e74c3c' : Colors.text}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Type badge */}
        <View style={[styles.badge, { backgroundColor: typeBg }]}>
          <Text style={[styles.badgeText, { color: typeColor }]}>
            {activity.type === 'retro' ? 'Retrospective' : 'Icebreaker'}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{activity.title}</Text>

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{activity.duration}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="people-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{activity.team_size}</Text>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {activity.tags.map((tag) => (
            <View key={tag} style={[styles.tag, { borderColor: typeColor }]}>
              <Text style={[styles.tagText, { color: typeColor }]}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionText}>{activity.description}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {activity.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionRow}>
              <View style={[styles.instructionNumber, { backgroundColor: typeColor }]}>
                <Text style={styles.instructionNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        {/* Materials */}
        {activity.materials.length > 0 && (
          <View style={styles.section}>
            <View style={styles.materialHeader}>
              <Ionicons name="cube-outline" size={20} color={Colors.text} />
              <Text style={styles.sectionTitle}>Materiel necessaire</Text>
            </View>
            {activity.materials.map((material, index) => (
              <View key={index} style={styles.materialRow}>
                <View style={[styles.materialDot, { backgroundColor: typeColor }]} />
                <Text style={styles.materialText}>{material}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  badgeText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
  },
  metaText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  tagText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  sectionText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  instructionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  instructionNumberText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  materialDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  materialText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
