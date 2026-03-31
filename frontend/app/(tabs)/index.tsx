import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { ActivityCard } from '../../src/components/ActivityCard';
import { ActivityCardSkeleton } from '../../src/components/Skeleton';
import { Button } from '../../src/components/Button';
import { fetchActivities, fetchRecentlyViewed, fetchFavorites } from '../../src/api/queries';
import { useAuthStore } from '../../src/stores/authStore';
import { Activity } from '../../src/types';

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon as any} size={22} color={Colors.text} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function HorizontalSkeletonList() {
  return (
    <View style={[styles.horizontalList, { flexDirection: 'row' }]}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.compactCardWrapper}>
          <ActivityCardSkeleton compact />
        </View>
      ))}
    </View>
  );
}

function HorizontalActivityList({ activities, isLoading }: { activities: Activity[]; isLoading?: boolean }) {
  if (isLoading) return <HorizontalSkeletonList />;
  if (!activities.length) return null;

  return (
    <FlatList
      data={activities}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalList}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.compactCardWrapper}>
          <ActivityCard activity={item} variant="compact" />
        </View>
      )}
    />
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const {
    data: activities,
    isLoading: loadingActivities,
    refetch: refetchActivities,
  } = useQuery({
    queryKey: ['activities'],
    queryFn: () => fetchActivities(),
  });

  const {
    data: recentlyViewed,
    refetch: refetchRecent,
  } = useQuery({
    queryKey: ['recentlyViewed'],
    queryFn: fetchRecentlyViewed,
  });

  const {
    data: favorites,
    refetch: refetchFavorites,
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchActivities(), refetchRecent(), refetchFavorites()]);
    setRefreshing(false);
  }, [refetchActivities, refetchRecent, refetchFavorites]);

  const recentActivities = activities?.slice(0, 6) || [];
  const viewedActivities = recentlyViewed?.slice(0, 6) || [];
  const favoriteActivities = favorites?.slice(0, 6) || [];

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { maxWidth: 1200, alignSelf: 'center', width: '100%' }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.greeting}>Bonjour,</Text>
              <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="log-out-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => router.push('/quiz')}
          activeOpacity={0.85}
        >
          <View style={styles.ctaContent}>
            <Ionicons name="flash" size={28} color={Colors.white} />
            <View style={styles.ctaTextWrap}>
              <Text style={styles.ctaTitle}>Trouve ton booster !</Text>
              <Text style={styles.ctaSubtitle}>
                Reponds a quelques questions pour trouver l'activite ideale
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Recently Added */}
        <SectionHeader icon="add-circle-outline" title="Ajoutees recemment" />
        <HorizontalActivityList activities={recentActivities} isLoading={loadingActivities} />

        {/* Recently Viewed */}
        {(loadingActivities || viewedActivities.length > 0) && (
          <>
            <SectionHeader icon="eye-outline" title="Consultes recemment" />
            <HorizontalActivityList activities={viewedActivities} isLoading={loadingActivities} />
          </>
        )}

        {/* Favorites */}
        {favoriteActivities.length > 0 && (
          <>
            <SectionHeader icon="heart-outline" title="Mes favoris" />
            <HorizontalActivityList activities={favoriteActivities} />
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Floating Action Button - Create Activity */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/activity/create')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  ctaCard: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.md,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  ctaTextWrap: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  ctaSubtitle: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  horizontalList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  compactCardWrapper: {
    marginRight: Spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    zIndex: 10,
  },
});
