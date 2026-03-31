import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { ActivityCard } from '../../src/components/ActivityCard';
import { ActivityCardSkeleton } from '../../src/components/Skeleton';
import { fetchActivities } from '../../src/api/queries';
import { Activity } from '../../src/types';
import { BREAKPOINTS } from '../../src/components/ResponsiveWrapper';

type FilterType = 'all' | 'retro' | 'icebreaker';

const FILTERS: { key: FilterType; label: string; icon: string }[] = [
  { key: 'all', label: 'Tout', icon: 'apps-outline' },
  { key: 'retro', label: 'Retro', icon: 'refresh-circle-outline' },
  { key: 'icebreaker', label: 'Icebreaker', icon: 'snow-outline' },
];

function SearchBar({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher une activite..."
        placeholderTextColor={Colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={20} color={Colors.inactive} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function FilterChips({
  selected,
  onSelect,
}: {
  selected: FilterType;
  onSelect: (f: FilterType) => void;
}) {
  return (
    <View style={styles.filterRow}>
      {FILTERS.map((f) => (
        <TouchableOpacity
          key={f.key}
          style={[styles.filterChip, selected === f.key && styles.filterChipActive]}
          onPress={() => onSelect(f.key)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={f.icon as any}
            size={16}
            color={selected === f.key ? Colors.white : Colors.textSecondary}
          />
          <Text
            style={[styles.filterChipText, selected === f.key && styles.filterChipTextActive]}
          >
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ListSkeleton() {
  return (
    <View style={styles.skeletonList}>
      {[1, 2, 3, 4].map((i) => (
        <ActivityCardSkeleton key={i} />
      ))}
    </View>
  );
}

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const { width } = useWindowDimensions();

  const numColumns = width >= BREAKPOINTS.desktop ? 3 : width >= BREAKPOINTS.tablet ? 2 : 1;
  const maxContentWidth = 1200;

  const typeParam = filterType === 'all' ? undefined : filterType;

  const {
    data: activities,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['activities', typeParam],
    queryFn: () => fetchActivities({ type: typeParam }),
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Client-side text filter (fast, no debounce needed for 12 items)
  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    if (!searchText.trim()) return activities;
    const term = searchText.trim().toLowerCase();
    return activities.filter(
      (a) =>
        a.title.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term) ||
        a.tags.some((t) => t.toLowerCase().includes(term))
    );
  }, [activities, searchText]);

  const resultCount = filteredActivities.length;

  const renderItem = useCallback(
    ({ item, index }: { item: Activity; index: number }) => (
      <View style={[
        styles.cardWrapper,
        numColumns > 1 && {
          flex: 1 / numColumns,
          paddingLeft: index % numColumns !== 0 ? Spacing.sm : 0,
        },
      ]}>
        <ActivityCard activity={item} variant="list" />
      </View>
    ),
    [numColumns]
  );

  const ListEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <Ionicons name="search-outline" size={48} color={Colors.inactive} />
        <Text style={styles.emptyTitle}>Aucun resultat</Text>
        <Text style={styles.emptySubtitle}>
          Essaie avec d'autres termes ou change de filtre
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.contentWrap, { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explorer</Text>
          <Text style={styles.headerSubtitle}>
            Decouvre toutes les activites disponibles
          </Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <SearchBar value={searchText} onChangeText={setSearchText} />
        </View>

        {/* Filter chips */}
        <FilterChips selected={filterType} onSelect={setFilterType} />

        {/* Result count */}
        {!isLoading && (
          <View style={styles.resultCountRow}>
            <Text style={styles.resultCountText}>
              {resultCount} activite{resultCount !== 1 ? 's' : ''} trouvee{resultCount !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Activity list */}
      {isLoading ? (
        <View style={[styles.skeletonWrap, { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }]}>
          <ListSkeleton />
        </View>
      ) : (
        <FlatList
          key={`cols-${numColumns}`}
          data={filteredActivities}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={[styles.listContent, { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={ListEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentWrap: {
    // container for header/search/filters - centered on desktop
  },
  skeletonWrap: {
    // container for skeleton - centered on desktop
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 48,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    height: '100%',
    outlineStyle: 'none',
  } as any,
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  resultCountRow: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  resultCountText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 24,
    gap: Spacing.md,
  },
  cardWrapper: {
    // Each card takes full width
  },
  skeletonList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    paddingTop: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxl,
  },
});
