import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius } from '../../src/constants/theme';
import { ActivityCard } from '../../src/components/ActivityCard';
import { ActivityCardSkeleton } from '../../src/components/Skeleton';
import { fetchFavorites } from '../../src/api/queries';

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={80} color={Colors.border} />
      <Text style={styles.emptyTitle}>Aucun favori pour le moment</Text>
      <Text style={styles.emptySubtext}>
        Ajoute des activites a tes favoris depuis la recherche !
      </Text>
    </View>
  );
}

function LoadingState() {
  return (
    <View style={styles.loadingList}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.cardWrapper}>
          <ActivityCardSkeleton />
        </View>
      ))}
    </View>
  );
}

export default function FavoritesScreen() {
  const {
    data: favorites,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Ionicons name="heart" size={24} color={Colors.primary} />
        <Text style={styles.headerTitle}>Mes coups de coeur</Text>
      </View>

      <FlatList
        data={favorites || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={isLoading ? <LoadingState /> : <EmptyState />}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ActivityCard activity={item} variant="full" />
          </View>
        )}
      />
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
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 24,
    flexGrow: 1,
  },
  cardWrapper: {
    marginBottom: Spacing.md,
  },
  loadingList: {
    paddingTop: Spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.xxxl,
  },
});
