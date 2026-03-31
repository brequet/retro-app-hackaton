import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../src/constants/theme';
import { Button } from '../src/components/Button';
import { QuizStep, QuizAnswers, Activity } from '../src/types';
import { fetchRecommendation } from '../src/api/queries';

const STEPS: QuizStep[] = ['type', 'teamSize', 'duration', 'mood', 'result'];

function ProgressBar({ step }: { step: number }) {
  const progress = step / 4;
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>{step}/4</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

function StepType({ selected, onSelect }: { selected?: string; onSelect: (v: string) => void }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.questionText}>Que cherches-tu aujourd'hui ?</Text>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, selected === 'retro' && styles.tabActive]}
          onPress={() => onSelect('retro')}
        >
          <Ionicons name="refresh-circle-outline" size={28} color={selected === 'retro' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, selected === 'retro' && styles.tabTextActive]}>Retrospectives</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selected === 'icebreaker' && styles.tabActive]}
          onPress={() => onSelect('icebreaker')}
        >
          <Ionicons name="snow-outline" size={28} color={selected === 'icebreaker' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, selected === 'icebreaker' && styles.tabTextActive]}>Icebreakers</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StepTeamSize({ selected, onSelect }: { selected?: string; onSelect: (v: string) => void }) {
  const options = [
    { value: '3-5', label: '3-5', icon: 'people-outline' },
    { value: '6-10', label: '6-10', icon: 'people' },
    { value: '11-99', label: '11+', icon: 'people-circle-outline' },
  ];
  return (
    <View style={styles.stepContent}>
      <Text style={styles.questionText}>Quelle est ta team aujourd'hui ?</Text>
      <View style={styles.optionGrid}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.circleOption, selected === opt.value && styles.circleOptionActive]}
            onPress={() => onSelect(opt.value)}
          >
            <Ionicons name={opt.icon as any} size={32} color={selected === opt.value ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.circleOptionText, selected === opt.value && styles.circleOptionTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function StepDuration({ selected, onSelect }: { selected?: string; onSelect: (v: string) => void }) {
  const options = [
    { value: '10-15', label: '10-15 minutes', icon: 'timer-outline' },
    { value: '20-30', label: '20-30 minutes', icon: 'time-outline' },
    { value: '30-45', label: '30-45 minutes', icon: 'hourglass-outline' },
  ];
  return (
    <View style={styles.stepContent}>
      <Text style={styles.questionText}>Combien de temps as-tu ?</Text>
      <View style={styles.optionList}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.listOption, selected === opt.value && styles.listOptionActive]}
            onPress={() => onSelect(opt.value)}
          >
            <Ionicons name={opt.icon as any} size={24} color={selected === opt.value ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.listOptionText, selected === opt.value && styles.listOptionTextActive]}>{opt.label}</Text>
            {selected === opt.value && <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function StepMood({ selected, onSelect }: { selected?: string; onSelect: (v: string) => void }) {
  const options = [
    { value: 'fun', label: 'Fun et leger', emoji: '🎉' },
    { value: 'serious', label: 'Serieux et structure', emoji: '📋' },
    { value: 'creative', label: 'Creatif et innovant', emoji: '💡' },
  ];
  return (
    <View style={styles.stepContent}>
      <Text style={styles.questionText}>Quelle ambiance recherches-tu ?</Text>
      <View style={styles.optionList}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.moodOption, selected === opt.value && styles.moodOptionActive]}
            onPress={() => onSelect(opt.value)}
          >
            <Text style={styles.moodEmoji}>{opt.emoji}</Text>
            <Text style={[styles.moodOptionText, selected === opt.value && styles.moodOptionTextActive]}>{opt.label}</Text>
            {selected === opt.value && <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function StepResult({ activity, onRestart }: { activity: Activity | null; onRestart: () => void }) {
  if (!activity) {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.questionText}>Aucune activite trouvee</Text>
        <Text style={styles.resultSubtext}>Essaie avec d'autres criteres !</Text>
        <Button title="Recommencer" onPress={onRestart} variant="outline" fullWidth />
      </View>
    );
  }
  return (
    <View style={styles.stepContent}>
      <Text style={styles.resultLabel}>Nous te recommandons :</Text>
      <View style={styles.resultCard}>
        <View style={[styles.resultBadge, { backgroundColor: activity.type === 'retro' ? Colors.primaryLight : '#e6f7f3' }]}>
          <Text style={{ color: activity.type === 'retro' ? Colors.retro : Colors.icebreaker, fontSize: FontSize.xs, fontWeight: '600' }}>
            {activity.type === 'retro' ? 'Retrospective' : 'Icebreaker'}
          </Text>
        </View>
        <Text style={styles.resultTitle}>{activity.title}</Text>
        <Text style={styles.resultDescription} numberOfLines={3}>{activity.description}</Text>
        <View style={styles.resultMeta}>
          <View style={styles.resultMetaItem}>
            <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.resultMetaText}>{activity.duration}</Text>
          </View>
          <View style={styles.resultMetaItem}>
            <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.resultMetaText}>{activity.team_size}</Text>
          </View>
        </View>
        <View style={styles.resultTags}>
          {activity.tags.map((tag) => (
            <View key={tag} style={styles.resultTag}>
              <Text style={styles.resultTagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.resultActions}>
        <Button title="Voir les details" onPress={() => router.push(`/activity/${activity.id}`)} fullWidth size="lg" />
        <Button title="Recommencer" onPress={onRestart} variant="outline" fullWidth size="lg" />
      </View>
    </View>
  );
}

export default function QuizScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [result, setResult] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const step = STEPS[currentStep];

  const animateStepTransition = (direction: 'forward' | 'backward', callback: () => void) => {
    const slideOut = direction === 'forward' ? -30 : 30;
    const slideIn = direction === 'forward' ? 30 : -30;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: slideOut, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      callback();
      slideAnim.setValue(slideIn);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 'type': return !!answers.type;
      case 'teamSize': return !!answers.teamSize;
      case 'duration': return !!answers.duration;
      case 'mood': return !!answers.mood;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      animateStepTransition('forward', () => setCurrentStep((prev) => prev + 1));
    } else if (currentStep === 3) {
      setLoading(true);
      try {
        const activity = await fetchRecommendation(answers);
        animateStepTransition('forward', () => { setResult(activity); setCurrentStep(4); });
      } catch {
        animateStepTransition('forward', () => { setResult(null); setCurrentStep(4); });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      animateStepTransition('backward', () => setCurrentStep((prev) => prev - 1));
    } else {
      router.back();
    }
  };

  const handleRestart = () => {
    animateStepTransition('forward', () => { setCurrentStep(0); setAnswers({}); setResult(null); });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{step === 'result' ? 'Resultat' : 'Trouve ton booster'}</Text>
          <View style={styles.backBtn} />
        </View>

        {step !== 'result' && <ProgressBar step={currentStep + 1} />}

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
          {step === 'type' && <StepType selected={answers.type} onSelect={(v) => handleAnswer('type', v)} />}
          {step === 'teamSize' && <StepTeamSize selected={answers.teamSize} onSelect={(v) => handleAnswer('teamSize', v)} />}
          {step === 'duration' && <StepDuration selected={answers.duration} onSelect={(v) => handleAnswer('duration', v)} />}
          {step === 'mood' && <StepMood selected={answers.mood} onSelect={(v) => handleAnswer('mood', v)} />}
          {step === 'result' && <StepResult activity={result} onRestart={handleRestart} />}
        </Animated.View>

        {step !== 'result' && (
          <View style={styles.footer}>
            <Button
              title={currentStep === 3 ? 'Voir ma recommandation' : 'Continuer'}
              onPress={handleNext}
              disabled={!canProceed()}
              loading={loading}
              fullWidth
              size="lg"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  progressContainer: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  progressText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600', marginBottom: Spacing.xs, textAlign: 'right' },
  progressTrack: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  stepContent: { paddingHorizontal: Spacing.xl, flex: 1 },
  questionText: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xxl, textAlign: 'center' },
  tabRow: { flexDirection: 'row', gap: Spacing.md },
  tab: { flex: 1, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, borderWidth: 2, borderColor: Colors.border, ...Shadows.sm },
  tabActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  tabText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },
  optionGrid: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg },
  circleOption: { width: 100, height: 100, borderRadius: BorderRadius.full, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.border, ...Shadows.sm },
  circleOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  circleOptionText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textSecondary, marginTop: Spacing.xs },
  circleOptionTextActive: { color: Colors.primary },
  optionList: { gap: Spacing.md },
  listOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md, borderWidth: 2, borderColor: Colors.border, ...Shadows.sm },
  listOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  listOptionText: { flex: 1, fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
  listOptionTextActive: { color: Colors.primary },
  moodOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md, borderWidth: 2, borderColor: Colors.border, ...Shadows.sm },
  moodOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  moodEmoji: { fontSize: 28 },
  moodOptionText: { flex: 1, fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
  moodOptionTextActive: { color: Colors.primary },
  resultLabel: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg, fontWeight: '500' },
  resultCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.xl, borderWidth: 2, borderColor: Colors.primary, ...Shadows.md },
  resultBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm, alignSelf: 'flex-start', marginBottom: Spacing.md },
  resultTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  resultDescription: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
  resultMeta: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.md },
  resultMetaItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  resultMetaText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  resultTags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  resultTag: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primary },
  resultTagText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '500' },
  resultSubtext: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  resultActions: { marginTop: Spacing.xl, gap: Spacing.md },
  footer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxl, marginTop: 'auto' },
});
