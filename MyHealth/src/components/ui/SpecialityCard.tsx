// ─────────────────────────────────────────────────────────────
//  MyHealth — SpecialityCard
//  Carte spécialité médicale — grille des 87 spécialités
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';

export interface Speciality {
  id: number;
  name: string;
  category?: string;
  icon?: string;
  color?: string;
  doctor_count?: number;
}

interface SpecialityCardProps {
  speciality: Speciality;
  onPress: () => void;
  variant?: 'grid' | 'list';
}

// Couleurs par défaut si le backend n'en fournit pas
const DEFAULT_COLORS = [
  '#00C896', '#0077B6', '#7C3AED', '#DB2777',
  '#D97706', '#059669', '#DC2626', '#2563EB',
  '#0891B2', '#65A30D', '#9333EA', '#EA580C',
];

const DEFAULT_ICONS: Record<string, string> = {
  'Médecine Générale': '🩺',
  'Cardiologie': '❤️',
  'Neurologie': '🧠',
  'Pédiatrie': '👶',
  'Gynécologie': '👩‍⚕️',
  'Chirurgie': '🔪',
  'Dermatologie': '🌿',
  'Ophtalmologie': '👁️',
  'ORL': '👂',
  'Dentaire': '🦷',
  'Psychiatrie': '🧘',
  'Urgences': '🚨',
  'default': '⚕️',
};

export default function SpecialityCard({ speciality, onPress, variant = 'grid' }: SpecialityCardProps) {
  const colorIndex = speciality.id % DEFAULT_COLORS.length;
  const color = speciality.color || DEFAULT_COLORS[colorIndex];
  const icon = speciality.icon
    || DEFAULT_ICONS[speciality.name]
    || DEFAULT_ICONS['default'];

  if (variant === 'list') {
    return (
      <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.85}>
        <View style={[styles.listIcon, { backgroundColor: `${color}20` }]}>
          <Text style={styles.listIconText}>{icon}</Text>
        </View>
        <View style={styles.listContent}>
          <Text style={styles.listName} numberOfLines={1}>{speciality.name}</Text>
          {speciality.category && (
            <Text style={styles.listCategory} numberOfLines={1}>{speciality.category}</Text>
          )}
        </View>
        {speciality.doctor_count !== undefined && (
          <Text style={styles.doctorCount}>{speciality.doctor_count} médecins</Text>
        )}
        <Text style={styles.listArrow}>›</Text>
      </TouchableOpacity>
    );
  }

  // Grid variant
  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.85}>
      {/* Fond coloré léger */}
      <View style={[styles.iconWrapper, { backgroundColor: `${color}18` }]}>
        <Text style={styles.gridIcon}>{icon}</Text>
      </View>
      <Text style={styles.gridName} numberOfLines={2}>{speciality.name}</Text>
      {speciality.doctor_count !== undefined && (
        <Text style={[styles.gridCount, { color }]}>
          {speciality.doctor_count}
        </Text>
      )}
      {/* Trait coloré en bas */}
      <View style={[styles.colorAccent, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ── Grid ──
  gridCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    flex: 1,
    margin: Spacing.xs,
    minHeight: 110,
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadows.sm,
  },
  iconWrapper: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  gridIcon: { fontSize: 26 },
  gridName: {
    fontSize: Typography.xs, fontWeight: '600',
    color: Colors.textPrimary, textAlign: 'center',
    lineHeight: 16,
  },
  gridCount: {
    fontSize: Typography.xs, fontWeight: '700',
    marginTop: 4,
  },
  colorAccent: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
  },

  // ── List ──
  listCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  listIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  listIconText: { fontSize: 22 },
  listContent: { flex: 1 },
  listName: {
    fontSize: Typography.base, fontWeight: '600', color: Colors.textPrimary,
  },
  listCategory: {
    fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2,
  },
  doctorCount: {
    fontSize: Typography.xs, color: Colors.textLight, fontWeight: '500',
  },
  listArrow: { fontSize: 20, color: Colors.textLight },
});
