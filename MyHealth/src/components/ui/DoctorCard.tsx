// ─────────────────────────────────────────────────────────────
//  MyHealth — DoctorCard
//  Carte médecin : photo, nom, spécialité, note, disponibilité
// ─────────────────────────────────────────────────────────────

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import Avatar from './Avatar';

export interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
  speciality?: string;
  speciality_color?: string;
  hospital?: string;
  experience_years?: number;
  consultation_fee?: number;
  rating?: number;
  review_count?: number;
  status?: 'available' | 'busy' | 'unavailable';
  teleconsult?: boolean;
}

interface DoctorCardProps {
  doctor: Doctor;
  onPress: () => void;
  variant?: 'default' | 'compact' | 'horizontal';
}

// ── Étoiles de notation ───────────────────────────────────────
function Stars({ rating = 0 }: { rating: number }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={[styles.star, { color: i <= Math.round(rating) ? '#F59E0B' : Colors.border }]}>
          ★
        </Text>
      ))}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
}

// ── Badge statut ──────────────────────────────────────────────
function StatusBadge({ status }: { status: Doctor['status'] }) {
  const config = {
    available: { label: 'Disponible', color: Colors.available, bg: Colors.primaryOverlay },
    busy: { label: 'Occupé', color: Colors.busy, bg: '#FFF3E0' },
    unavailable: { label: 'Indisponible', color: Colors.unavailable, bg: '#FFEBEE' },
  };
  const c = config[status || 'unavailable'];
  return (
    <View style={[styles.statusBadge, { backgroundColor: c.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: c.color }]} />
      <Text style={[styles.statusText, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}

export default function DoctorCard({ doctor, onPress, variant = 'default' }: DoctorCardProps) {
  const fullName = `Dr. ${doctor.first_name} ${doctor.last_name}`;

  // ── Variante horizontale (liste) ─────────────────────────
  if (variant === 'horizontal') {
    return (
      <TouchableOpacity style={styles.hCard} onPress={onPress} activeOpacity={0.88}>
        <Avatar
          uri={doctor.avatar}
          firstName={doctor.first_name}
          lastName={doctor.last_name}
          size={64}
          online={doctor.status === 'available'}
          verified
        />
        <View style={styles.hContent}>
          <Text style={styles.doctorName} numberOfLines={1}>{fullName}</Text>
          <Text style={[styles.speciality, doctor.speciality_color ? { color: doctor.speciality_color } : {}]}>
            {doctor.speciality || 'Médecine générale'}
          </Text>
          <View style={styles.hRow}>
            <Stars rating={doctor.rating || 0} />
            {doctor.teleconsult && (
              <View style={styles.teleconsultBadge}>
                <Text style={styles.teleconsultText}>📹 Téléconsult</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.hRight}>
          <Text style={styles.fee}>
            {doctor.consultation_fee?.toLocaleString() || '—'} F
          </Text>
          <StatusBadge status={doctor.status} />
        </View>
      </TouchableOpacity>
    );
  }

  // ── Variante compact ──────────────────────────────────────
  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.88}>
        <Avatar
          uri={doctor.avatar}
          firstName={doctor.first_name}
          lastName={doctor.last_name}
          size={52}
          online={doctor.status === 'available'}
        />
        <View style={styles.compactContent}>
          <Text style={styles.doctorName} numberOfLines={1}>{fullName}</Text>
          <Text style={styles.speciality} numberOfLines={1}>
            {doctor.speciality || 'Médecine générale'}
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    );
  }

  // ── Variante default (carte verticale) ────────────────────
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* Header carte */}
      <View style={styles.cardHeader}>
        <Avatar
          uri={doctor.avatar}
          firstName={doctor.first_name}
          lastName={doctor.last_name}
          size={72}
          verified
        />
        <StatusBadge status={doctor.status} />
      </View>

      {/* Infos */}
      <Text style={styles.doctorNameLarge} numberOfLines={1}>{fullName}</Text>
      <Text style={[
        styles.specialityLarge,
        doctor.speciality_color ? { color: doctor.speciality_color } : {},
      ]}>
        {doctor.speciality || 'Médecine générale'}
      </Text>

      {doctor.hospital && (
        <Text style={styles.hospital} numberOfLines={1}>🏥 {doctor.hospital}</Text>
      )}

      <Stars rating={doctor.rating || 0} />

      {/* Footer carte */}
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.feeLabel}>Consultation</Text>
          <Text style={styles.feeLarge}>
            {doctor.consultation_fee?.toLocaleString() || '—'} FCFA
          </Text>
        </View>
        {doctor.experience_years && (
          <View style={styles.expBadge}>
            <Text style={styles.expText}>{doctor.experience_years} ans exp.</Text>
          </View>
        )}
      </View>

      {doctor.teleconsult && (
        <View style={styles.teleconsultBar}>
          <Text style={styles.teleconsultBarText}>📹 Téléconsultation disponible</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ── Default card ──
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  doctorNameLarge: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  specialityLarge: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  hospital: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  feeLabel: { fontSize: Typography.xs, color: Colors.textLight },
  feeLarge: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary },
  expBadge: {
    backgroundColor: Colors.secondaryOverlay,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  expText: { fontSize: Typography.xs, color: Colors.secondary, fontWeight: '600' },
  teleconsultBar: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primaryOverlay,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  teleconsultBarText: {
    fontSize: Typography.xs,
    color: Colors.primary,
    fontWeight: '600',
  },

  // ── Horizontal card ──
  hCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadows.sm,
  },
  hContent: { flex: 1 },
  hRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  hRight: { alignItems: 'flex-end', gap: 6 },
  fee: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary },

  // ── Compact card ──
  compactCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  compactContent: { flex: 1 },
  arrow: { fontSize: 22, color: Colors.textLight },

  // ── Shared ──
  doctorName: {
    fontSize: Typography.base,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  speciality: {
    fontSize: Typography.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  star: { fontSize: 13 },
  ratingText: { fontSize: Typography.xs, color: Colors.textSecondary, marginLeft: 4 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: Typography.xs, fontWeight: '600' },
  teleconsultBadge: {
    backgroundColor: Colors.primaryOverlay,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  teleconsultText: { fontSize: 10, color: Colors.primary, fontWeight: '600' },
});
