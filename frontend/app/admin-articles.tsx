import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../src/constants/theme';
import { Button } from '../src/components/Button';
import { createArticle, updateArticle, fetchArticle, deleteArticle, fetchArticles } from '../src/api/queries';
import { useToastStore } from '../src/stores/toastStore';
import { useAuthStore } from '../src/stores/authStore';
import { Article } from '../src/types';

export default function AdminArticlesScreen() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const showToast = useToastStore((s) => s.show);
  const params = useLocalSearchParams<{ editId?: string }>();
  const isEdit = !!params.editId;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showList, setShowList] = useState(!isEdit);

  const { data: articles, refetch: refetchArticles } = useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles,
  });

  const { data: existingArticle } = useQuery({
    queryKey: ['article', params.editId],
    queryFn: () => fetchArticle(params.editId!),
    enabled: isEdit,
  });

  React.useEffect(() => {
    if (isEdit && existingArticle && !initialized) {
      setTitle(existingArticle.title);
      setContent(existingArticle.content);
      setInitialized(true);
      setShowList(false);
    }
  }, [isEdit, existingArticle, initialized]);

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Acces refuse</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>Seuls les administrateurs peuvent gerer les articles.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast('Le titre est requis', 'error');
      return;
    }
    if (!content.trim()) {
      showToast('Le contenu est requis', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isEdit && params.editId) {
        await updateArticle(params.editId, { title: title.trim(), content: content.trim() });
        showToast('Article mis a jour !', 'success');
      } else {
        await createArticle({ title: title.trim(), content: content.trim() });
        showToast('Article publie !', 'success');
      }
      setTitle('');
      setContent('');
      setShowList(true);
      refetchArticles();
    } catch {
      showToast('Erreur lors de la publication', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = (articleId: string) => {
    const doDelete = async () => {
      try {
        await deleteArticle(articleId);
        showToast('Article supprime', 'success');
        refetchArticles();
      } catch {
        showToast('Impossible de supprimer', 'error');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Supprimer cet article ?')) doDelete();
    } else {
      Alert.alert('Supprimer', 'Supprimer cet article ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const handleEditArticle = (article: Article) => {
    setTitle(article.title);
    setContent(article.content);
    setShowList(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gerer les articles</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.headerBtn}>
            <Ionicons name="home-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form */}
          {!showList && (
            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>Titre *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Titre de l'article"
                placeholderTextColor={Colors.textTertiary}
                value={title}
                onChangeText={setTitle}
              />
              <Text style={styles.sectionLabel}>Contenu *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Ecrivez votre article..."
                placeholderTextColor={Colors.textTertiary}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
              <View style={styles.formActions}>
                <Button title="Publier" onPress={handleSubmit} loading={loading} fullWidth size="lg" />
                <Button
                  title="Annuler"
                  onPress={() => { setShowList(true); setTitle(''); setContent(''); }}
                  variant="outline"
                  fullWidth
                />
              </View>
            </View>
          )}

          {/* Article list + new button */}
          {showList && (
            <>
              <TouchableOpacity
                style={styles.newArticleBtn}
                onPress={() => setShowList(false)}
              >
                <Ionicons name="add-circle" size={24} color={Colors.white} />
                <Text style={styles.newArticleBtnText}>Nouvel article</Text>
              </TouchableOpacity>

              {articles?.map((article) => (
                <View key={article.id} style={styles.articleCard}>
                  <View style={styles.articleCardHeader}>
                    <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
                    <View style={styles.articleActions}>
                      <TouchableOpacity onPress={() => handleEditArticle(article)}>
                        <Ionicons name="pencil" size={18} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteArticle(article.id)}>
                        <Ionicons name="trash" size={18} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.articleContent} numberOfLines={3}>{article.content}</Text>
                  <Text style={styles.articleDate}>
                    {new Date(article.created_at).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              ))}

              {(!articles || articles.length === 0) && (
                <View style={styles.emptyState}>
                  <Ionicons name="newspaper-outline" size={40} color={Colors.textTertiary} />
                  <Text style={styles.emptyText}>Aucun article pour le moment</Text>
                </View>
              )}
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  headerBtn: {
    width: 44, height: 44, borderRadius: BorderRadius.full,
    backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center',
    ...Shadows.sm,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md,
    maxWidth: 800, alignSelf: 'center', width: '100%',
  },
  sectionLabel: {
    fontSize: FontSize.sm, fontWeight: '700', color: Colors.text,
    marginBottom: Spacing.sm, marginTop: Spacing.lg,
  },
  textInput: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: FontSize.md, color: Colors.text,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm,
  },
  textArea: { minHeight: 200, textAlignVertical: 'top' },
  formSection: { marginBottom: Spacing.xl },
  formActions: { gap: Spacing.md, marginTop: Spacing.lg },
  newArticleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg, paddingVertical: Spacing.lg,
    marginBottom: Spacing.xl, ...Shadows.md,
  },
  newArticleBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  articleCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.sm,
  },
  articleCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  articleTitle: {
    fontSize: FontSize.md, fontWeight: '700', color: Colors.text,
    flex: 1, marginRight: Spacing.md,
  },
  articleActions: { flexDirection: 'row', gap: Spacing.md },
  articleContent: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    marginTop: Spacing.sm, lineHeight: 20,
  },
  articleDate: {
    fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center', paddingVertical: Spacing.xxxl, gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.md, color: Colors.textTertiary, textAlign: 'center',
  },
});
