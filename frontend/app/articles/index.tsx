import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { Skeleton } from '../../src/components/Skeleton';
import { fetchArticles } from '../../src/api/queries';
import { Article } from '../../src/types';

function ArticleCardSkeleton() {
  return (
    <View style={styles.articleCard}>
      <Skeleton width="70%" height={20} style={{ marginBottom: Spacing.sm }} />
      <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
      <Skeleton width="90%" height={14} style={{ marginBottom: 4 }} />
      <Skeleton width="60%" height={14} style={{ marginBottom: Spacing.sm }} />
      <Skeleton width={100} height={12} />
    </View>
  );
}

export default function ArticlesListScreen() {
  const {
    data: articles,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles,
    refetchInterval: 60000,
    staleTime: 10000,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderArticle = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => router.push(`/articles/${item.id}`)}
      activeOpacity={0.7}
    >
      <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.articleContent} numberOfLines={3}>{item.content}</Text>
      <View style={styles.articleMeta}>
        <Text style={styles.articleAuthor}>{item.author_name}</Text>
        <Text style={styles.articleDate}>
          {new Date(item.created_at).toLocaleDateString('fr-FR')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tous les articles</Text>
        <View style={{ width: 44 }} />
      </View>

      {isLoading ? (
        <View style={styles.listContent}>
          {[1, 2, 3, 4].map((i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </View>
      ) : !articles || articles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="newspaper-outline" size={64} color={Colors.inactive} />
          <Text style={styles.emptyText}>Aucun article pour le moment</Text>
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={renderArticle}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  articleCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    ...Shadows.sm,
  },
  articleTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  articleContent: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleAuthor: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  articleDate: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
