// ─────────────────────────────────────────────────────────────
//  MyHealth — AppointmentCard
//  Carte rendez-vous avec statut coloré, type, actions
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import Avatar from './Avatar';

export interface Appointment {
  id: number;
  doctor_first_name: string;
  doctor_last_name: string;
  doctor_avatar?: string;
  doctor_speciality?: string;
  date: string;
  time: string;
  type: 'teleconsult' | 'physical';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  motif?: string;
  amount?: number;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: () => void;
  onCancel?: () => void;
  onJoin?: () => void;   // Pour téléconsultation
  variant?: 'default' | 'compact';
}

const STATUS_CONFIG = {
  pending: {
    label: 'En attente', color: Colors.warning,
    bg: '#FFF3E0', icon: '⏳',
  },
  confirmed: {
    label: 'Confirmé', color: Colors.primary,
    bg: Colors.primaryOverlay, icon: '✅',
  },
  completed: {
    label: 'Terminé', color: Colors.textSecondary,
    bg: Colors.lightBg, icon: '✓',
  },
  cancelled: {
    label: 'Annulé', color: Colors.danger,
    bg: '#FFEBEE', icon: '✕',
  },
};

const TYPE_CONFIG = {
  teleconsult: { label: 'Téléconsultation', icon: '📹', color: Colors.secondary },
  physical: { label: 'En cabinet', icon: '🏥', color: Colors.primary },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'long',
  });
}

export default function AppointmentCard({
  appointment, onPress, onCancel, onJoin, variant = 'default',
}: AppointmentCardProps) {
  const status = STATUS_CONFIG[appointment.status];
  const type = TYPE_CONFIG[appointment.type];
  const doctorName = `Dr. ${appointment.doctor_first_name} ${appointment.doctor_last_name}`;
  const canJoin = appointment.status === 'confirmed' && appointment.type === 'teleconsult';
  const canCancel = appointment.status === 'pending' || appointment.status === 'confirmed';

  // ── Compact ───────────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.88}>
        <View style={[styles.compactAccent, { backgroundColor: status.color }]} />
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>{doctorName}</Text>
          <Text style={styles.compactDate}>{formatDate(appointment.date)} · {appointment.time}</Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusChipText, { color: status.color }]}>{status.label}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Default ───────────────────────────────────────────────
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Bande colorée selon statut */}
      <View style={[styles.statusBand, { backgroundColor: status.color }]} />

      <View style={styles.cardBody}>
        {/* Médecin */}
        <View style={styles.doctorRow}>
          <Avatar
            uri={appointment.doctor_avatar}
            firstName={appointment.doctor_first_name}
            lastName={appointment.doctor_last_name}
            size={52}
          />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName} numberOfLines={1}>{doctorName}</Text>
            <Text style={styles.speciality}>
              {appointment.doctor_speciality || 'Médecine générale'}
            </Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
            <Text style={styles.statusIcon}>{status.icon}</Text>
            <Text style={[styles.statusChipText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Séparateur */}
        <View style={styles.divider} />

        {/* Détails RDV */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📅</Text>
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(appointment.date)}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🕐</Text>
            <View>
              <Text style={styles.detailLabel}>Heure</Text>
              <Text style={styles.detailValue}>{appointment.time}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>{type.icon}</Text>
            <View>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={[styles.detailValue, { color: type.color }]}>{type.label}</Text>
            </View>
          </View>
        </View>

        {/* Motif */}
        {appointment.motif && (
          <View style={styles.motifBox}>
            <Text style={styles.motifLabel}>Motif : </Text>
            <Text style={styles.motifText} numberOfLines={2}>{appointment.motif}</Text>
          </View>
        )}

        {/* Montant */}
        {appointment.amount && (
          <Text style={styles.amount}>
            💳 {appointment.amount.toLocaleString()} FCFA
          </Text>
        )}

        {/* Actions */}
        {(canJoin || canCancel) && (
          <View style={styles.actions}>
            {canJoin && onJoin && (
              <TouchableOpacity style={styles.joinBtn} onPress={onJoin}>
                <Text style={styles.joinBtnText}>📹 Rejoindre</Text>
              </TouchableOpacity>
            )}
            {canCancel && onCancel && (
              <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    flexDirection: 'row',
    ...Shadows.md,
  },
  statusBand: { width: 5 },
  cardBody: { flex: 1, padding: Spacing.base },

  // ── Médecin ──
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  speciality: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '600', marginTop: 2 },

  // ── Statut ──
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full,
  },
  statusIcon: { fontSize: 11 },
  statusChipText: { fontSize: Typography.xs, fontWeight: '700' },

  // ── Détails ──
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailIcon: { fontSize: 16 },
  detailLabel: { fontSize: Typography.xs, color: Colors.textLight },
  detailValue: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary, marginTop: 1 },

  // ── Motif ──
  motifBox: {
    flexDirection: 'row', marginTop: Spacing.sm,
    backgroundColor: Colors.lightBg, borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  motifLabel: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: '600' },
  motifText: { flex: 1, fontSize: Typography.xs, color: Colors.textSecondary },

  // ── Montant ──
  amount: {
    fontSize: Typography.sm, color: Colors.textSecondary,
    fontWeight: '600', marginTop: Spacing.sm,
  },

  // ── Actions ──
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  joinBtn: {
    flex: 1, backgroundColor: Colors.primary,
    borderRadius: Radius.full, paddingVertical: 10,
    alignItems: 'center',
  },
  joinBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.sm },
  cancelBtn: {
    paddingVertical: 10, paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full, borderWidth: 1.5,
    borderColor: Colors.border, alignItems: 'center',
  },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600', fontSize: Typography.sm },

  // ── Compact ──
  compactCard: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    flexDirection: 'row', alignItems: 'center',
    overflow: 'hidden', marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  compactAccent: { width: 4, alignSelf: 'stretch' },
  compactContent: { flex: 1, padding: Spacing.md },
  compactName: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary },
  compactDate: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
});
