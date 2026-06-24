// ─────────────────────────────────────────────────────────────
//  MyHealth — CreatePrescriptionScreen
//  Création d'ordonnance électronique par le médecin
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { API } from '../../services/api';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import { Screen, Card, Button, Badge } from '../../components/ui/index';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CreatePrescription'>;

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

const FREQUENCY_OPTIONS = ['1x/jour', '2x/jour', '3x/jour', 'Matin & soir', 'Au besoin'];
const DURATION_OPTIONS = ['3 jours', '5 jours', '7 jours', '10 jours', '14 jours', '1 mois', '3 mois'];

const COMMON_MEDICATIONS = [
  'Paracétamol 500mg', 'Amoxicilline 500mg', 'Ibuprofène 400mg',
  'Metformine 850mg', 'Oméprazole 20mg', 'Amlodipine 5mg',
  'Metronidazole 500mg', 'Cotrimoxazole', 'Salbutamol inhalateur',
];

function MedicationForm({ med, index, onUpdate, onRemove }: {
  med: Medication; index: number;
  onUpdate: (id: string, field: keyof Medication, value: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <Card style={styles.medCard}>
      <View style={styles.medHeader}>
        <View style={styles.medIndex}>
          <Text style={styles.medIndexText}>{index + 1}</Text>
        </View>
        <Text style={styles.medTitle}>Médicament {index + 1}</Text>
        <TouchableOpacity onPress={() => onRemove(med.id)} style={styles.removeBtn}>
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Nom du médicament */}
      <Text style={styles.fieldLabel}>Nom & dosage</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Ex: Paracétamol 500mg"
        placeholderTextColor={Colors.textLight}
        value={med.name}
        onChangeText={v => onUpdate(med.id, 'name', v)}
      />

      {/* Suggestions */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestions}>
        {COMMON_MEDICATIONS.filter(m => med.name === '' || m.toLowerCase().includes(med.name.toLowerCase())).slice(0, 5).map(m => (
          <TouchableOpacity key={m} style={styles.suggestion} onPress={() => onUpdate(med.id, 'name', m)}>
            <Text style={styles.suggestionText}>{m}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Fréquence */}
      <Text style={styles.fieldLabel}>Fréquence</Text>
      <View style={styles.optionsRow}>
        {FREQUENCY_OPTIONS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.optionChip, med.frequency === f && styles.optionChipActive]}
            onPress={() => onUpdate(med.id, 'frequency', f)}
          >
            <Text style={[styles.optionChipText, med.frequency === f && styles.optionChipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Durée */}
      <Text style={styles.fieldLabel}>Durée du traitement</Text>
      <View style={styles.optionsRow}>
        {DURATION_OPTIONS.map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.optionChip, med.duration === d && styles.optionChipActive]}
            onPress={() => onUpdate(med.id, 'duration', d)}
          >
            <Text style={[styles.optionChipText, med.duration === d && styles.optionChipTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Instructions */}
      <Text style={styles.fieldLabel}>Instructions spéciales (optionnel)</Text>
      <TextInput
        style={[styles.textInput, styles.textInputMulti]}
        placeholder="Ex: À prendre pendant les repas, éviter l'alcool..."
        placeholderTextColor={Colors.textLight}
        value={med.instructions}
        onChangeText={v => onUpdate(med.id, 'instructions', v)}
        multiline
        numberOfLines={2}
        textAlignVertical="top"
      />
    </Card>
  );
}

export default function CreatePrescriptionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { patient_id, appointment_id } = route.params;

  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('1 mois');
  const [loading, setLoading] = useState(false);

  const addMedication = () => {
    setMedications(prev => [...prev, {
      id: Date.now().toString(), name: '', dosage: '',
      frequency: '', duration: '', instructions: '',
    }]);
  };

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMedication = (id: string) => {
    if (medications.length === 1) {
      Alert.alert('Attention', 'L\'ordonnance doit contenir au moins un médicament');
      return;
    }
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = async () => {
    const incomplete = medications.filter(m => !m.name.trim() || !m.frequency || !m.duration);
    if (incomplete.length > 0) {
      Alert.alert('Champs manquants', 'Veuillez remplir le nom, la fréquence et la durée de chaque médicament.');
      return;
    }
    if (!diagnosis.trim()) {
      Alert.alert('Diagnostic requis', 'Veuillez indiquer le diagnostic.');
      return;
    }

    setLoading(true);
    try {
      const res = await API.medical.createPrescription({
        patient_id, appointment_id,
        medications, diagnosis, notes,
        valid_until: validUntil,
      });
      if (res.success) {
        Alert.alert('Ordonnance créée ✅', 'L\'ordonnance a été envoyée au patient et ajoutée à son dossier.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
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
    <Screen title="Nouvelle ordonnance" onBack={() => navigation.goBack()} scrollable>

      {/* En-tête ordonnance */}
      <Card style={styles.prescriptionHeader}>
        <View style={styles.rxRow}>
          <Text style={styles.rxSymbol}>℞</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.rxTitle}>Ordonnance médicale</Text>
            <Text style={styles.rxDate}>
              {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <Badge label={`Patient #${patient_id}`} variant="secondary" />
        </View>
      </Card>

      {/* Diagnostic */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diagnostic *</Text>
        <TextInput
          style={[styles.textInput, styles.textInputMulti]}
          placeholder="Ex: Hypertension artérielle stade 1, Grippe saisonnière..."
          placeholderTextColor={Colors.textLight}
          value={diagnosis}
          onChangeText={setDiagnosis}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />
      </View>

      {/* Médicaments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Médicaments prescrits *</Text>
        {medications.map((med, i) => (
          <MedicationForm
            key={med.id}
            med={med}
            index={i}
            onUpdate={updateMedication}
            onRemove={removeMedication}
          />
        ))}
        <TouchableOpacity style={styles.addMedBtn} onPress={addMedication}>
          <Text style={styles.addMedBtnText}>+ Ajouter un médicament</Text>
        </TouchableOpacity>
      </View>

      {/* Validité */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Validité de l'ordonnance</Text>
        <View style={styles.optionsRow}>
          {['1 semaine', '1 mois', '3 mois', '6 mois'].map(v => (
            <TouchableOpacity
              key={v}
              style={[styles.optionChip, validUntil === v && styles.optionChipActive]}
              onPress={() => setValidUntil(v)}
            >
              <Text style={[styles.optionChipText, validUntil === v && styles.optionChipTextActive]}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes pour le patient (optionnel)</Text>
        <TextInput
          style={[styles.textInput, styles.textInputMulti]}
          placeholder="Conseils, mode de vie, suivi à prévoir..."
          placeholderTextColor={Colors.textLight}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Info envoi */}
      <Card style={styles.infoCard}>
        <Text style={{ fontSize: 20 }}>📱</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Envoi automatique</Text>
          <Text style={styles.infoText}>L'ordonnance sera envoyée par notification au patient et ajoutée à son dossier médical.</Text>
        </View>
      </Card>

      <Button
        label="Envoyer l'ordonnance"
        onPress={handleSubmit}
        loading={loading}
        icon="📤"
        style={styles.submitBtn}
      />

    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },

  prescriptionHeader: { marginBottom: Spacing.xl },
  rxRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rxSymbol: { fontSize: 40, color: Colors.primary, fontWeight: '300', width: 44 },
  rxTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary },
  rxDate: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },

  textInput: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    padding: Spacing.md, fontSize: Typography.base,
    color: Colors.textPrimary, ...Shadows.sm,
  },
  textInputMulti: { minHeight: 80, textAlignVertical: 'top' },

  // Médicament
  medCard: { marginBottom: Spacing.md },
  medHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  medIndex: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  medIndexText: { fontSize: Typography.sm, fontWeight: '700', color: Colors.white },
  medTitle: { flex: 1, fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  removeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { fontSize: 12, color: Colors.danger, fontWeight: '700' },

  suggestions: { gap: Spacing.sm, paddingVertical: Spacing.sm },
  suggestion: { backgroundColor: Colors.primaryOverlay, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  suggestionText: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '600' },

  fieldLabel: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textSecondary, marginTop: Spacing.md, marginBottom: 6 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  optionChip: { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.lightBg, borderWidth: 1.5, borderColor: Colors.border },
  optionChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionChipText: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: '500' },
  optionChipTextActive: { color: Colors.white, fontWeight: '700' },

  addMedBtn: {
    borderRadius: Radius.md, borderWidth: 2, borderColor: Colors.primary,
    borderStyle: 'dashed', padding: Spacing.md, alignItems: 'center',
    marginTop: Spacing.sm,
  },
  addMedBtnText: { fontSize: Typography.base, color: Colors.primary, fontWeight: '700' },

  infoCard: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', marginBottom: Spacing.xl },
  infoTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 },
  infoText: { fontSize: Typography.xs, color: Colors.textSecondary, lineHeight: 18 },

  submitBtn: { marginBottom: Spacing.xxxl },
});
