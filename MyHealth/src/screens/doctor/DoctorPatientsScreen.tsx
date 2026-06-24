// ─────────────────────────────────────────────────────────────
//  MyHealth — DoctorPatientsScreen
//  Liste des patients du médecin avec dossiers
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import GradientHeader from '../../components/ui/GradientHeader';
import Avatar from '../../components/ui/Avatar';
import { Card, EmptyState, Badge } from '../../components/ui/index';
import { Skeleton } from '../../components/ui/Loading';

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
  age?: number;
  blood_group?: string;
  last_consultation?: string;
  last_motif?: string;
  chronic_conditions?: string[];
  allergies?: string[];
  consultations_count?: number;
}

const MOCK_PATIENTS: Patient[] = [
  { id: 1, first_name: 'Marie', last_name: 'Dupont', age: 34, blood_group: 'A+', last_consultation: 'Il y a 2 jours', last_motif: 'Hypertension', chronic_conditions: ['Hypertension'], allergies: ['Pénicilline'], consultations_count: 8 },
  { id: 2, first_name: 'Jean', last_name: 'Mballa', age: 52, blood_group: 'O+', last_consultation: 'Hier', last_motif: 'Diabète type 2', chronic_conditions: ['Diabète type 2'], allergies: [], consultations_count: 15 },
  { id: 3, first_name: 'Sophie', last_name: 'Ngo', age: 28, blood_group: 'B+', last_consultation: 'Il y a 5 jours', last_motif: 'Fièvre', chronic_conditions: [], allergies: ['Aspirine'], consultations_count: 3 },
  { id: 4, first_name: 'Paul', last_name: 'Essomba', age: 45, blood_group: 'AB+', last_consultation: 'Il y a 1 semaine', last_motif: 'Douleurs cardiaques', chronic_conditions: ['Angine'], allergies: [], consultations_count: 12 },
  { id: 5, first_name: 'Carine', last_name: 'Biya', age: 31, blood_group: 'A-', last_consultation: 'Il y a 10 jours', last_motif: 'Suivi grossesse', chronic_conditions: [], allergies: [], consultations_count: 6 },
];

const SORT_OPTIONS = ['Récents', 'Alphabétique', 'Plus suivis'];

export default function DoctorPatientsScreen() {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('Récents');

  const filtered = MOCK_PATIENTS.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const renderPatient = ({ item: p }: { item: Patient }) => (
    <TouchableOpacity
      style={styles.patientCard}
      onPress={() => navigation.navigate('PatientDossier', { patient_id: p.id })}
      activeOpacity={0.88}
    >
      {/* Ligne principale */}
      <View style={styles.cardTop}>
        <Avatar firstName={p.first_name} lastName={p.last_name} uri={p.avatar} size={52} />
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{p.first_name} {p.last_name}</Text>
          <View style={styles.metaRow}>
            {p.age && <Text style={styles.meta}>{p.age} ans</Text>}
            {p.blood_group && (
              <View style={styles.bloodBadge}>
                <Text style={styles.bloodText}>🩸 {p.blood_group}</Text>
              </View>
            )}
          </View>
          <Text style={styles.lastConsult}>
            🕐 {p.last_consultation} · {p.last_motif}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.consultCount}>{p.consultations_count}</Text>
          <Text style={styles.consultLabel}>visites</Text>
        </View>
      </View>

      {/* Tags */}
      {(p.chronic_conditions?.length > 0 || p.allergies?.length > 0) && (
        <View style={styles.tagsRow}>
          {p.chronic_conditions?.map(c => (
            <View key={c} style={[styles.tag, styles.tagCondition]}>
              <Text style={[styles.tagText, { color: Colors.secondary }]}>{c}</Text>
            </View>
          ))}
          {p.allergies?.map(a => (
            <View key={a} style={[styles.tag, styles.tagAllergy]}>
              <Text style={[styles.tagText, { color: Colors.danger }]}>⚠ {a}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions rapides */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('PatientDossier', { patient_id: p.id })}
        >
          <Text style={styles.actionBtnText}>📋 Dossier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={async () => {
            const res = await fetch(`http://localhost:5000/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ doctor_id: p.id }),
            });
          }}
        >
          <Text style={styles.actionBtnText}>💬 Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnPrimary]}
          onPress={() => navigation.navigate('CreatePrescription', { patient_id: p.id, appointment_id: 0 })}
        >
          <Text style={[styles.actionBtnText, { color: Colors.white }]}>💊 Ordonnance</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <GradientHeader
        mode="page"
        title="Mes patients"
        subtitle={`${filtered.length} patient${filtered.length > 1 ? 's' : ''}`}
        onBack={() => navigation.goBack()}
      >
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un patient..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </GradientHeader>

      {/* Tri */}
      <View style={styles.sortBar}>
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.sortChip, sortBy === opt && styles.sortChipActive]}
            onPress={() => setSortBy(opt)}
          >
            <Text style={[styles.sortText, sortBy === opt && styles.sortTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="👥" title="Aucun patient" subtitle="Vos patients apparaîtront ici après leurs consultations" />
        }
        renderItem={renderPatient}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBg },

  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.full, paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm, gap: Spacing.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', height: 44,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: Colors.white, fontSize: Typography.sm },

  sortBar: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.base, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sortChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.lightBg, borderWidth: 1.5, borderColor: Colors.border },
  sortChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sortText: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: '500' },
  sortTextActive: { color: Colors.white, fontWeight: '700' },

  list: { padding: Spacing.base, paddingBottom: Spacing.xxxl },

  patientCard: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.md,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  patientInfo: { flex: 1 },
  patientName: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 3 },
  meta: { fontSize: Typography.xs, color: Colors.textSecondary },
  bloodBadge: { backgroundColor: '#FFEBEE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full },
  bloodText: { fontSize: 10, color: Colors.danger, fontWeight: '700' },
  lastConsult: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 4 },
  cardRight: { alignItems: 'center' },
  consultCount: { fontSize: Typography.xl, fontWeight: '800', color: Colors.primary },
  consultLabel: { fontSize: 10, color: Colors.textLight },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.sm },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  tagCondition: { backgroundColor: Colors.secondaryOverlay },
  tagAllergy: { backgroundColor: '#FFEBEE' },
  tagText: { fontSize: 11, fontWeight: '600' },

  cardActions: {
    flexDirection: 'row', gap: Spacing.sm,
    marginTop: Spacing.md, paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  actionBtn: {
    flex: 1, paddingVertical: 8, borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center',
  },
  actionBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  actionBtnText: { fontSize: Typography.xs, fontWeight: '600', color: Colors.textSecondary },
});
