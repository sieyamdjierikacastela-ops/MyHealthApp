// ─────────────────────────────────────────────────────────────
//  MyHealth — HealthQuestionnaireScreen
//  Questionnaire de santé initial — 10 questions OBLIGATOIRES
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Alert, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { API } from '../../services/api';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import { Button } from '../../components/ui/index';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Question {
  id: string;
  question: string;
  type: 'choice' | 'text' | 'scale';
  options?: string[];
  icon: string;
}

const QUESTIONS: Question[] = [
  { id: 'q1', icon: '🏥', type: 'choice', question: 'Avez-vous des antécédents de maladies chroniques ?', options: ['Non', 'Diabète', 'Hypertension', 'Asthme', 'Autre'] },
  { id: 'q2', icon: '💊', type: 'text', question: 'Prenez-vous actuellement des médicaments réguliers ?', options: [] },
  { id: 'q3', icon: '⚠️', type: 'text', question: 'Avez-vous des allergies connues (médicaments, aliments, environnement) ?', options: [] },
  { id: 'q4', icon: '🏃', type: 'choice', question: 'Quel est votre niveau d\'activité physique quotidien ?', options: ['Sédentaire', 'Légère', 'Modérée', 'Intense'] },
  { id: 'q5', icon: '🔪', type: 'choice', question: 'Avez-vous déjà subi une intervention chirurgicale ?', options: ['Non', 'Oui, mineure', 'Oui, majeure'] },
  { id: 'q6', icon: '🚬', type: 'choice', question: 'Quel est votre statut tabagique ?', options: ['Non-fumeur', 'Ex-fumeur', 'Fumeur occasionnel', 'Fumeur régulier'] },
  { id: 'q7', icon: '🍷', type: 'choice', question: 'Consommez-vous de l\'alcool ?', options: ['Jamais', 'Rarement', 'Modérément', 'Régulièrement'] },
  { id: 'q8', icon: '👨‍👩‍👧', type: 'choice', question: 'Avez-vous des antécédents familiaux importants ?', options: ['Non', 'Maladies cardiaques', 'Diabète', 'Cancer', 'Hypertension'] },
  { id: 'q9', icon: '🧠', type: 'scale', question: 'Comment évaluez-vous votre santé mentale actuelle ?', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
  { id: 'q10', icon: '👨‍⚕️', type: 'choice', question: 'Avez-vous un médecin traitant habituel ?', options: ['Oui', 'Non', 'Je cherche un médecin'] },
];

export default function HealthQuestionnaireScreen() {
  const navigation = useNavigation<Nav>();
  const { updateUser } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [textAnswer, setTextAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const currentQ = QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;
  const isLast = currentIndex === QUESTIONS.length - 1;
  const currentAnswer = answers[currentQ.id] || '';

  const selectAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: answer }));
  };

  const goNext = () => {
    const answer = currentQ.type === 'text' ? textAnswer : currentAnswer;
    if (!answer.trim() && currentQ.type !== 'text') {
      Alert.alert('Répondez à la question', 'Veuillez sélectionner une réponse avant de continuer.');
      return;
    }
    const finalAnswers = { ...answers, [currentQ.id]: answer };
    setAnswers(finalAnswers);

    if (isLast) { submitQuestionnaire(finalAnswers); return; }
    setCurrentIndex(i => i + 1);
    setTextAnswer('');
  };

  const goBack = () => {
    if (currentIndex === 0) return;
    setCurrentIndex(i => i - 1);
    setTextAnswer(answers[QUESTIONS[currentIndex - 1].id] || '');
  };

  const submitQuestionnaire = async (finalAnswers: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await API.medical.saveQuestionnaire(finalAnswers);
      if (res.success) {
        await updateUser({ questionnaire_completed: true });
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      } else {
        Alert.alert('Erreur', res.message || 'Une erreur est survenue');
      }
    } catch {
      Alert.alert('Erreur', 'Vérifiez votre connexion internet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Barre de progression */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.stepText}>{currentIndex + 1} / {QUESTIONS.length}</Text>
        <Text style={styles.headerTitle}>Questionnaire santé</Text>
        <Text style={styles.headerSubtitle}>Ces informations aident vos médecins à mieux vous soigner</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.questionIcon}>{currentQ.icon}</Text>
          <Text style={styles.questionText}>{currentQ.question}</Text>
        </View>

        {/* Choix multiples */}
        {currentQ.type === 'choice' && currentQ.options && (
          <View style={styles.options}>
            {currentQ.options.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.option, currentAnswer === opt && styles.optionActive]}
                onPress={() => selectAnswer(opt)}
                activeOpacity={0.85}
              >
                <View style={[styles.optionRadio, currentAnswer === opt && styles.optionRadioActive]}>
                  {currentAnswer === opt && <View style={styles.optionRadioDot} />}
                </View>
                <Text style={[styles.optionText, currentAnswer === opt && styles.optionTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Échelle 1-10 */}
        {currentQ.type === 'scale' && (
          <View style={styles.scaleWrapper}>
            <View style={styles.scaleRow}>
              {currentQ.options?.map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.scaleBtn, currentAnswer === n && styles.scaleBtnActive]}
                  onPress={() => selectAnswer(n)}
                >
                  <Text style={[styles.scaleNum, currentAnswer === n && styles.scaleNumActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabel}>Mauvaise</Text>
              <Text style={styles.scaleLabel}>Excellente</Text>
            </View>
          </View>
        )}

        {/* Texte libre */}
        {currentQ.type === 'text' && (
          <View style={styles.textWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Votre réponse (ou 'Non' si aucun)..."
              placeholderTextColor={Colors.textLight}
              value={textAnswer}
              onChangeText={setTextAnswer}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.nav}>
        {currentIndex > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Text style={styles.backBtnText}>← Précédent</Text>
          </TouchableOpacity>
        )}
        <Button
          label={isLast ? 'Terminer ✓' : 'Suivant →'}
          onPress={goNext}
          loading={loading}
          style={styles.nextBtn}
          fullWidth={currentIndex === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBg },

  progressBar: { height: 4, backgroundColor: Colors.border },
  progressFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },

  header: { backgroundColor: Colors.darkNavy, padding: Spacing.xl, alignItems: 'center', gap: 4 },
  stepText: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '700' },
  headerTitle: { fontSize: Typography.xl, fontWeight: '800', color: Colors.white },
  headerSubtitle: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },

  scroll: { padding: Spacing.base, paddingBottom: Spacing.xxxl },

  questionCard: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: Spacing.xl, alignItems: 'center', gap: Spacing.md,
    marginBottom: Spacing.xl, ...Shadows.md,
  },
  questionIcon: { fontSize: 48 },
  questionText: { fontSize: Typography.lg, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center', lineHeight: 28 },

  // Choix
  options: { gap: Spacing.sm },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 2, borderColor: Colors.border, ...Shadows.sm,
  },
  optionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryOverlay },
  optionRadio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  optionRadioActive: { borderColor: Colors.primary },
  optionRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  optionText: { fontSize: Typography.base, color: Colors.textSecondary, fontWeight: '500' },
  optionTextActive: { color: Colors.primary, fontWeight: '700' },

  // Échelle
  scaleWrapper: { gap: Spacing.md },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleBtn: {
    width: 32, height: 40, borderRadius: Radius.sm,
    backgroundColor: Colors.white, borderWidth: 1.5,
    borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  scaleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  scaleNum: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textSecondary },
  scaleNumActive: { color: Colors.white },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleLabel: { fontSize: Typography.xs, color: Colors.textLight },

  // Texte
  textWrapper: { backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, ...Shadows.sm },
  textInput: { padding: Spacing.md, fontSize: Typography.base, color: Colors.textPrimary, minHeight: 100 },

  // Navigation
  nav: {
    flexDirection: 'row', gap: Spacing.md,
    padding: Spacing.base, paddingBottom: Spacing.xl,
    backgroundColor: Colors.white, ...Shadows.lg,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
  },
  backBtn: { paddingVertical: 14, paddingHorizontal: Spacing.lg, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border },
  backBtnText: { fontSize: Typography.base, color: Colors.textSecondary, fontWeight: '600' },
  nextBtn: { flex: 1 },
});
