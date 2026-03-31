import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, FontSize, Spacing } from '../src/constants/theme';
import { Button } from '../src/components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Ionicons name="compass-outline" size={80} color={Colors.border} />
        <Text style={styles.title}>Page introuvable</Text>
        <Text style={styles.subtitle}>
          Cette page n'existe pas ou a ete deplacee.
        </Text>
        <Button
          title="Retour a l'accueil"
          onPress={() => router.replace('/(tabs)')}
          style={{ marginTop: Spacing.xl }}
        />
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
