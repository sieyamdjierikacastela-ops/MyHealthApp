// ─────────────────────────────────────────────────────────────
//  MyHealth — BookAppointmentScreen
//  Prise de rendez-vous : date, créneau, type
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
import { Screen, Button, Card } from '../../components/ui/index';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'BookAppointment'>;

const CONSULTATION_TYPES = [
  { id: 'teleconsult', label: 'Téléconsultation', icon: '📹', desc: 'Consultation vidéo en ligne' },
  { id: 'physical', label: 'En cabinet', icon: '🏥', desc: 'Visite physique chez le médecin' },
];

// Génère les 7 prochains jours
function getNextDays(count = 7) {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toISOString().split('T')[0],
      label: i === 0 ? "Auj." : i === 1 ? "Dem." : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      dayNum: d.getDate(),
    });
  }
  return days;
}

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
];

export default function BookAppointmentScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { doctor_id } = route.params;

  const days = getNextDays();

  const [selectedDate, setSelectedDate] = useState(days[0].date);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedType, setSelectedType] = useState<'teleconsult' | 'physical'>('teleconsult');
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!selectedTime) { Alert.alert('Erreur', 'Veuillez choisir un créneau horaire'); return; }
    if (!motif.trim()) { Alert.alert('Erreur', 'Veuillez indiquer le motif de la consultation'); return; }

    setLoading(true);
    try {
      const res = await API.appointments.create({
        doctor_id,
        date: selectedDate,
        time: selectedTime,
        type: selectedType,
        motif: motif.trim(),
        amount: 15000,
      });

      if (res.success) {
        navigation.navigate('Payment', {
          appointment_id: res.data.appointment.id,
          amount: 15000,
          doctor_name: 'Dr.',
        });
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
    <Screen title="Prendre rendez-vous" onBack={() => navigation.goBack()} scrollable>

      {/* Type de consultation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Type de consultation</Text>
        <View style={styles.typeRow}>
          {CONSULTATION_TYPES.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[styles.typeCard, selectedType === type.id && styles.typeCardActive]}
              onPress={() => setSelectedType(type.id as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text style={[styles.typeLabel, selectedType === type.id && styles.typeLabelActive]}>
                {type.label}
              </Text>
              <Text style={[styles.typeDesc, selectedType === type.id && styles.typeDescActive]}>
                {type.desc}
              </Text>
              {selectedType === type.id && (
                <View style={styles.typeCheck}><Text style={styles.typeCheckText}>✓</Text></View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sélection de la date */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choisissez une date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
          {days.map(day => (
            <TouchableOpacity
              key={day.date}
              style={[styles.dayItem, selectedDate === day.date && styles.dayItemActive]}
              onPress={() => { setSelectedDate(day.date); setSelectedTime(''); }}
            >
              <Text style={[styles.dayLabel, selectedDate === day.date && styles.dayLabelActive]}>
                {day.label}
              </Text>
              <Text style={[styles.dayNum, selectedDate === day.date && styles.dayNumActive]}>
                {day.dayNum}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Créneaux horaires */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choisissez un créneau</Text>
        <View style={styles.slotsGrid}>
          {TIME_SLOTS.map(slot => (
            <TouchableOpacity
              key={slot}
              style={[styles.slot, selectedTime === slot && styles.slotActive]}
              onPress={() => setSelectedTime(slot)}
            >
              <Text style={[styles.slotText, selectedTime === slot && styles.slotTextActive]}>
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Motif */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Motif de la consultation</Text>
        <View style={styles.motifWrapper}>
          <TextInput
            style={styles.motifInput}
            placeholder="Décrivez brièvement vos symptômes ou la raison de votre visite..."
            placeholderTextColor={Colors.textLight}
            value={motif}
            onChangeText={setMotif}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={300}
          />
          <Text style={styles.charCount}>{motif.length}/300</Text>
        </View>
      </View>

      {/* Récapitulatif */}
      {selectedTime && (
        <Card style={styles.recap}>
          <Text style={styles.recapTitle}>Récapitulatif</Text>
          <View style={styles.recapRow}>
            <Text style={styles.recapLabel}>Date</Text>
            <Text style={styles.recapValue}>{new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
          <View style={styles.recapRow}>
            <Text style={styles.recapLabel}>Heure</Text>
            <Text style={styles.recapValue}>{selectedTime}</Text>
          </View>
          <View style={styles.recapRow}>
            <Text style={styles.recapLabel}>Type</Text>
            <Text style={styles.recapValue}>
              {selectedType === 'teleconsult' ? '📹 Téléconsultation' : '🏥 En cabinet'}
            </Text>
          </View>
          <View style={[styles.recapRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.recapLabel}>Montant</Text>
            <Text style={[styles.recapValue, { color: Colors.primary, fontWeight: '700' }]}>15 000 FCFA</Text>
          </View>
        </Card>
      )}

      <Button
        label="Confirmer et payer"
        onPress={handleBook}
        loading={loading}
        disabled={!selectedTime || !motif.trim()}
        icon="💳"
        style={styles.confirmBtn}
      />

    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },

  // Types
  typeRow: { flexDirection: 'row', gap: Spacing.md },
  typeCard: {
    flex: 1, padding: Spacing.md, borderRadius: Radius.md,
    backgroundColor: Colors.white, borderWidth: 2,
    borderColor: Colors.border, alignItems: 'center', gap: 4,
    ...Shadows.sm, position: 'relative',
  },
  typeCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryOverlay },
  typeIcon: { fontSize: 28 },
  typeLabel: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary },
  typeLabelActive: { color: Colors.primary },
  typeDesc: { fontSize: Typography.xs, color: Colors.textLight, textAlign: 'center' },
  typeDescActive: { color: Colors.primary },
  typeCheck: {
    position: 'absolute', top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  typeCheckText: { color: Colors.white, fontSize: 11, fontWeight: '700' },

  // Jours
  daysRow: { gap: Spacing.sm, paddingRight: Spacing.base },
  dayItem: {
    width: 56, paddingVertical: Spacing.md,
    borderRadius: Radius.md, backgroundColor: Colors.white,
    alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border,
  },
  dayItemActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayLabel: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: '500' },
  dayLabelActive: { color: 'rgba(255,255,255,0.8)' },
  dayNum: { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  dayNumActive: { color: Colors.white },

  // Créneaux
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  slot: {
    paddingVertical: 10, paddingHorizontal: Spacing.md,
    borderRadius: Radius.md, backgroundColor: Colors.white,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  slotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: '500' },
  slotTextActive: { color: Colors.white, fontWeight: '700' },

  // Motif
  motifWrapper: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, ...Shadows.sm,
  },
  motifInput: { padding: Spacing.md, fontSize: Typography.base, color: Colors.textPrimary, minHeight: 100 },
  charCount: { fontSize: Typography.xs, color: Colors.textLight, textAlign: 'right', padding: Spacing.sm },

  // Récap
  recap: { marginBottom: Spacing.xl },
  recapTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  recapRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  recapLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  recapValue: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary },

  confirmBtn: { marginBottom: Spacing.xxxl },
});
