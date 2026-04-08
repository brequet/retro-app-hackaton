import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { createActivity, updateActivity, fetchActivity, generateRetroFromTheme } from '../../src/api/queries';
import { useToastStore } from '../../src/stores/toastStore';
import { CreateActivityInput } from '../../src/types';

const DURATION_OPTIONS = [
  { label: '10-15 min', value: '10-15 min', min: 10, max: 15 },
  { label: '15-20 min', value: '15-20 min', min: 15, max: 20 },
  { label: '20-30 min', value: '20-30 min', min: 20, max: 30 },
  { label: '30-45 min', value: '30-45 min', min: 30, max: 45 },
  { label: '40-60 min', value: '40-60 min', min: 40, max: 60 },
];

const TEAM_SIZE_OPTIONS = [
  { label: '3-5 personnes', value: '3-5 personnes', min: 3, max: 5 },
  { label: '3-10 personnes', value: '3-10 personnes', min: 3, max: 10 },
  { label: '3-15 personnes', value: '3-15 personnes', min: 3, max: 15 },
  { label: '5-12 personnes', value: '5-12 personnes', min: 5, max: 12 },
  { label: '5-15 personnes', value: '5-15 personnes', min: 5, max: 15 },
  { label: '8-30 personnes', value: '8-30 personnes', min: 8, max: 30 },
  { label: '10-50 personnes', value: '10-50 personnes', min: 10, max: 50 },
];

const COMMON_TAGS = [
  'Fun', 'Amusant', 'Creatif', 'Rapide', 'Reflexion', 'Structure',
  'Apprentissage', 'Communication', 'Metaphore', 'Equipe', 'Sprint',
  'Emotions', 'Energie', 'Interaction', 'Decouverte', 'Connexion',
];

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

export default function CreateActivityScreen() {
  const params = useLocalSearchParams<{ editId?: string }>();
  const isEdit = !!params.editId;
  const showToast = useToastStore((s) => s.show);

  // Load existing activity if editing
  const { data: existingActivity, isLoading: isLoadingExisting } = useQuery({
    queryKey: ['activity', params.editId],
    queryFn: () => fetchActivity(params.editId!),
    enabled: isEdit,
  });

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'retro' | 'icebreaker'>('retro');
  const [duration, setDuration] = useState(DURATION_OPTIONS[2]); // 20-30 min default
  const [teamSize, setTeamSize] = useState(TEAM_SIZE_OPTIONS[1]); // 3-10 default
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [materials, setMaterials] = useState<string[]>(['']);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // AI generation state
  const [aiTheme, setAiTheme] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [showAiSection, setShowAiSection] = useState(false);

  // Populate form when editing and data arrives
  React.useEffect(() => {
    if (isEdit && existingActivity && !initialized) {
      setTitle(existingActivity.title);
      setType(existingActivity.type);
      setDescription(existingActivity.description);
      setInstructions(existingActivity.instructions.length > 0 ? existingActivity.instructions : ['']);
      setMaterials(existingActivity.materials.length > 0 ? existingActivity.materials : ['']);
      setSelectedTags(existingActivity.tags);

      // Find matching duration option
      const dOpt = DURATION_OPTIONS.find(
        (d) => d.min === existingActivity.duration_min && d.max === existingActivity.duration_max
      );
      if (dOpt) setDuration(dOpt);

      // Find matching team size option
      const tOpt = TEAM_SIZE_OPTIONS.find(
        (t) => t.min === existingActivity.team_size_min && t.max === existingActivity.team_size_max
      );
      if (tOpt) setTeamSize(tOpt);

      setInitialized(true);
    }
  }, [isEdit, existingActivity, initialized]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
      setCustomTag('');
    }
  };

  const addInstruction = () => setInstructions((prev) => [...prev, '']);
  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions((prev) => prev.filter((_, i) => i !== index));
    }
  };
  const updateInstruction = (index: number, text: string) => {
    setInstructions((prev) => prev.map((item, i) => (i === index ? text : item)));
  };

  const addMaterial = () => setMaterials((prev) => [...prev, '']);
  const removeMaterial = (index: number) => {
    if (materials.length > 1) {
      setMaterials((prev) => prev.filter((_, i) => i !== index));
    }
  };
  const updateMaterial = (index: number, text: string) => {
    setMaterials((prev) => prev.map((item, i) => (i === index ? text : item)));
  };

  // AI Generation handler
  const handleAiGenerate = async () => {
    if (!aiTheme.trim()) {
      showToast('Entre un theme pour generer la retrospective', 'error');
      return;
    }

    setAiLoading(true);
    try {
      const result = await generateRetroFromTheme(aiTheme.trim());

      // Pre-fill the form with AI-generated content
      setTitle(result.title);
      setDescription(result.description);
      setInstructions(result.instructions.length > 0 ? result.instructions : ['']);
      setMaterials(result.materials.length > 0 ? result.materials : ['']);
      setSelectedTags(result.tags.length > 0 ? result.tags : []);
      setAiGenerated(true);

      showToast('Retrospective generee ! Tu peux modifier le contenu avant de sauvegarder.', 'success');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur lors de la generation';
      showToast(message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const validate = (): string | null => {
    if (!title.trim()) return 'Le titre est requis';
    if (!description.trim()) return 'La description est requise';
    if (selectedTags.length === 0) return 'Ajoute au moins un tag';
    const validInstructions = instructions.filter((i) => i.trim());
    if (validInstructions.length === 0) return 'Ajoute au moins une instruction';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      showToast(error, 'error');
      return;
    }

    setLoading(true);
    try {
      const data: CreateActivityInput = {
        title: title.trim(),
        type,
        duration: duration.value,
        duration_min: duration.min,
        duration_max: duration.max,
        team_size: teamSize.value,
        team_size_min: teamSize.min,
        team_size_max: teamSize.max,
        tags: selectedTags,
        description: description.trim(),
        instructions: instructions.filter((i) => i.trim()),
        materials: materials.filter((m) => m.trim()),
      };

      if (isEdit && params.editId) {
        await updateActivity(params.editId, data);
        showToast('Activite mise a jour !', 'success');
      } else {
        const created = await createActivity(data);
        showToast('Activite creee avec succes !', 'success');
        router.replace(`/activity/${created.id}`);
        return;
      }
      router.back();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Une erreur est survenue';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while fetching existing activity for edit mode
  if (isEdit && isLoadingExisting) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier l'activite</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEdit ? 'Modifier l\'activite' : 'Nouvelle activite'}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <SectionLabel label="Titre *" />
          <TextInput
            style={styles.textInput}
            placeholder="Nom de l'activite"
            placeholderTextColor={Colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          {/* Type */}
          <SectionLabel label="Type *" />
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'retro' && styles.typeBtnActive]}
              onPress={() => setType('retro')}
            >
              <Ionicons
                name="refresh-circle-outline"
                size={22}
                color={type === 'retro' ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.typeBtnText, type === 'retro' && styles.typeBtnTextActive]}>
                Retrospective
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'icebreaker' && styles.typeBtnActiveIce]}
              onPress={() => setType('icebreaker')}
            >
              <Ionicons
                name="snow-outline"
                size={22}
                color={type === 'icebreaker' ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.typeBtnText, type === 'icebreaker' && styles.typeBtnTextActive]}>
                Icebreaker
              </Text>
            </TouchableOpacity>
          </View>

          {/* AI Generation Section - Only for Retro type and not in edit mode */}
          {type === 'retro' && !isEdit && (
            <View style={styles.aiSection}>
              {!showAiSection ? (
                <TouchableOpacity
                  style={styles.aiToggleBtn}
                  onPress={() => setShowAiSection(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.aiToggleContent}>
                    <View style={styles.aiIconBadge}>
                      <Ionicons name="sparkles" size={18} color={Colors.white} />
                    </View>
                    <View style={styles.aiToggleTextWrap}>
                      <Text style={styles.aiToggleTitle}>Generer avec l'IA</Text>
                      <Text style={styles.aiToggleSubtitle}>
                        Cree une retro a partir d'un theme
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
                </TouchableOpacity>
              ) : (
                <View style={styles.aiCard}>
                  <View style={styles.aiCardHeader}>
                    <View style={styles.aiIconBadge}>
                      <Ionicons name="sparkles" size={18} color={Colors.white} />
                    </View>
                    <Text style={styles.aiCardTitle}>Generer avec l'IA</Text>
                    <TouchableOpacity
                      onPress={() => setShowAiSection(false)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close" size={22} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.aiCardDescription}>
                    Entre un theme et l'IA generera un format de retrospective original avec titre, description, instructions et materiel.
                  </Text>

                  <View style={styles.aiInputRow}>
                    <TextInput
                      style={[styles.textInput, styles.aiInput]}
                      placeholder='Ex: "Communication d\'equipe", "Paques et chocolat"...'
                      placeholderTextColor={Colors.textTertiary}
                      value={aiTheme}
                      onChangeText={setAiTheme}
                      onSubmitEditing={handleAiGenerate}
                      returnKeyType="go"
                      editable={!aiLoading}
                    />
                  </View>

                  {aiLoading ? (
                    <View style={styles.aiLoadingContainer}>
                      <ActivityIndicator size="small" color={Colors.primary} />
                      <Text style={styles.aiLoadingText}>
                        Generation en cours...
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.aiButtonsRow}>
                      <TouchableOpacity
                        style={styles.aiGenerateBtn}
                        onPress={handleAiGenerate}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="sparkles" size={18} color={Colors.white} />
                        <Text style={styles.aiGenerateBtnText}>
                          {aiGenerated ? 'Regenerer' : 'Generer'}
                        </Text>
                      </TouchableOpacity>
                      {aiGenerated && (
                        <Text style={styles.aiHint}>
                          Le formulaire a ete pre-rempli. Tu peux le modifier librement.
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Duration */}
          <SectionLabel label="Duree" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <View style={styles.chipRow}>
              {DURATION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, duration.value === opt.value && styles.chipActive]}
                  onPress={() => setDuration(opt)}
                >
                  <Text style={[styles.chipText, duration.value === opt.value && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Team Size */}
          <SectionLabel label="Taille d'equipe" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <View style={styles.chipRow}>
              {TEAM_SIZE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, teamSize.value === opt.value && styles.chipActive]}
                  onPress={() => setTeamSize(opt)}
                >
                  <Text style={[styles.chipText, teamSize.value === opt.value && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Description */}
          <SectionLabel label="Description *" />
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Decris l'activite en detail..."
            placeholderTextColor={Colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Tags */}
          <SectionLabel label="Tags *" />
          <View style={styles.tagsGrid}>
            {COMMON_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipActive]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagChipText, selectedTags.includes(tag) && styles.tagChipTextActive]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
            {/* Custom tags that are not in COMMON_TAGS */}
            {selectedTags
              .filter((t) => !COMMON_TAGS.includes(t))
              .map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagChip, styles.tagChipActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={styles.tagChipTextActive}>{tag}</Text>
                  <Ionicons name="close" size={14} color={Colors.white} />
                </TouchableOpacity>
              ))}
          </View>
          <View style={styles.customTagRow}>
            <TextInput
              style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
              placeholder="Ajouter un tag personnalise..."
              placeholderTextColor={Colors.textTertiary}
              value={customTag}
              onChangeText={setCustomTag}
              onSubmitEditing={addCustomTag}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={addCustomTag}>
              <Ionicons name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <SectionLabel label="Instructions *" />
          {instructions.map((instruction, index) => (
            <View key={index} style={styles.listItemRow}>
              <View style={styles.listItemNumber}>
                <Text style={styles.listItemNumberText}>{index + 1}</Text>
              </View>
              <TextInput
                style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                placeholder={`Etape ${index + 1}...`}
                placeholderTextColor={Colors.textTertiary}
                value={instruction}
                onChangeText={(text) => updateInstruction(index, text)}
                multiline
              />
              {instructions.length > 1 && (
                <TouchableOpacity onPress={() => removeInstruction(index)} style={styles.removeBtn}>
                  <Ionicons name="close-circle" size={22} color={Colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addRowBtn} onPress={addInstruction}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.addRowBtnText}>Ajouter une etape</Text>
          </TouchableOpacity>

          {/* Materials */}
          <SectionLabel label="Materiel" />
          {materials.map((material, index) => (
            <View key={index} style={styles.listItemRow}>
              <View style={[styles.listItemDot, { backgroundColor: type === 'retro' ? Colors.retro : Colors.icebreaker }]} />
              <TextInput
                style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                placeholder="Materiel necessaire..."
                placeholderTextColor={Colors.textTertiary}
                value={material}
                onChangeText={(text) => updateMaterial(index, text)}
              />
              {materials.length > 1 && (
                <TouchableOpacity onPress={() => removeMaterial(index)} style={styles.removeBtn}>
                  <Ionicons name="close-circle" size={22} color={Colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addRowBtn} onPress={addMaterial}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.addRowBtnText}>Ajouter du materiel</Text>
          </TouchableOpacity>

          {/* Submit */}
          <View style={styles.submitRow}>
            <Button
              title={isEdit ? 'Enregistrer les modifications' : 'Creer l\'activite'}
              onPress={handleSubmit}
              loading={loading}
              fullWidth
              size="lg"
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  typeBtnActive: {
    backgroundColor: Colors.retro,
    borderColor: Colors.retro,
  },
  typeBtnActiveIce: {
    backgroundColor: Colors.icebreaker,
    borderColor: Colors.icebreaker,
  },
  typeBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeBtnTextActive: {
    color: Colors.white,
  },

  // AI Generation styles
  aiSection: {
    marginTop: Spacing.lg,
  },
  aiToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  aiToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  aiIconBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiToggleTextWrap: {
    flex: 1,
  },
  aiToggleTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  aiToggleSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  aiCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    ...Shadows.sm,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  aiCardTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  aiCardDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  aiInputRow: {
    marginBottom: Spacing.md,
  },
  aiInput: {
    marginBottom: 0,
    borderColor: Colors.primary,
  },
  aiLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  aiLoadingText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  aiButtonsRow: {
    gap: Spacing.sm,
  },
  aiGenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  aiGenerateBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.white,
  },
  aiHint: {
    fontSize: FontSize.xs,
    color: Colors.success,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: Spacing.xs,
  },

  chipScroll: {
    marginBottom: Spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagChipText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  tagChipTextActive: {
    color: Colors.white,
  },
  customTagRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  addTagBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  listItemNumber: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemNumberText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  listItemDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  removeBtn: {
    padding: 4,
  },
  addRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  addRowBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  submitRow: {
    marginTop: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
