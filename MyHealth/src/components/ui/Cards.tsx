// ─────────────────────────────────────────────────────────────
//  MyHealth — StatCard & VitalCard
//  Cartes statistiques dashboard + constantes vitales
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';

// ════════════════════════════════════════════════════════════
//  STAT CARD — Pour le dashboard médecin & admin
// ════════════════════════════════════════════════════════════
interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  trend?: { value: number; label: string };   // ex: +12% ce mois
  onPress?: () => void;
}

export function StatCard({ label, value, icon, color = Colors.primary, trend, onPress }: StatCardProps) {
  const isPositive = trend && trend.value >= 0;

  const content = (
    <View style={styles.statCard}>
      <View style={[styles.statIconBox, { backgroundColor: `${color}18` }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {trend && (
        <View style={[styles.trendBadge, { backgroundColor: isPositive ? Colors.primaryOverlay : '#FFEBEE' }]}>
          <Text style={[styles.trendText, { color: isPositive ? Colors.primary : Colors.danger }]}>
            {isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </Text>
        </View>
      )}
      <View style={[styles.statAccent, { backgroundColor: color }]} />
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.88}>{content}</TouchableOpacity>;
  }
  return content;
}

// ════════════════════════════════════════════════════════════
//  VITAL CARD — Constantes vitales du dossier médical
// ════════════════════════════════════════════════════════════
interface VitalCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  status?: 'normal' | 'warning' | 'danger' | 'unknown';
  normalRange?: string;
  onPress?: () => void;
}

const VITAL_STATUS_COLORS = {
  normal: Colors.primary,
  warning: Colors.warning,
  danger: Colors.danger,
  unknown: Colors.textLight,
};

export function VitalCard({ label, value, unit, icon, status = 'unknown', normalRange, onPress }: VitalCardProps) {
  const color = VITAL_STATUS_COLORS[status];
  const statusLabels = {
    normal: 'Normal', warning: 'Attention', danger: 'Critique', unknown: '—',
  };

  const content = (
    <View style={styles.vitalCard}>
      <View style={styles.vitalHeader}>
        <Text style={styles.vitalIcon}>{icon}</Text>
        <View style={[styles.vitalStatus, { backgroundColor: `${color}18` }]}>
          <View style={[styles.vitalDot, { backgroundColor: color }]} />
          <Text style={[styles.vitalStatusText, { color }]}>{statusLabels[status]}</Text>
        </View>
      </View>
      <View style={styles.vitalValueRow}>
        <Text style={[styles.vitalValue, { color }]}>{value}</Text>
        {unit && <Text style={styles.vitalUnit}>{unit}</Text>}
      </View>
      <Text style={styles.vitalLabel}>{label}</Text>
      {normalRange && (
        <Text style={styles.normalRange}>Norme : {normalRange}</Text>
      )}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.88}>{content}</TouchableOpacity>;
  }
  return content;
}

// ════════════════════════════════════════════════════════════
//  INFO ROW — Ligne d'information simple (profil, dossier)
// ════════════════════════════════════════════════════════════
interface InfoRowProps {
  label: string;
  value: string;
  icon?: string;
  onPress?: () => void;
  showArrow?: boolean;
}

export function InfoRow({ label, value, icon, onPress, showArrow }: InfoRowProps) {
  const content = (
    <View style={styles.infoRow}>
      {icon && <Text style={styles.infoIcon}>{icon}</Text>}
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      {showArrow && <Text style={styles.infoArrow}>›</Text>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

// ════════════════════════════════════════════════════════════
//  NOTIFICATION ITEM
// ════════════════════════════════════════════════════════════
interface NotificationItemProps {
  title: string;
  body: string;
  time: string;
  type?: 'appointment' | 'message' | 'reminder' | 'emergency' | 'system';
  read?: boolean;
  onPress?: () => void;
}

const NOTIF_ICONS: Record<string, string> = {
  appointment: '📅', message: '💬', reminder: '⏰',
  emergency: '🚨', system: 'ℹ️',
};
const NOTIF_COLORS: Record<string, string> = {
  appointment: Colors.secondary, message: Colors.primary,
  reminder: Colors.warning, emergency: Colors.danger, system: Colors.textLight,
};

export function NotificationItem({ title, body, time, type = 'system', read, onPress }: NotificationItemProps) {
  const icon = NOTIF_ICONS[type];
  const color = NOTIF_COLORS[type];

  return (
    <TouchableOpacity
      style={[styles.notifItem, !read && styles.notifUnread]}
      onPress={onPress} activeOpacity={0.85}
    >
      <View style={[styles.notifIcon, { backgroundColor: `${color}18` }]}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={styles.notifTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.notifTime}>{time}</Text>
        </View>
        <Text style={styles.notifBody} numberOfLines={2}>{body}</Text>
      </View>
      {!read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ── Stat Card ──
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.base,
    flex: 1,
    alignItems: 'flex-start',
    overflow: 'hidden',
    ...Shadows.md,
  },
  statIconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statIcon: { fontSize: 22 },
  statValue: {
    fontSize: Typography.xxl, fontWeight: '800',
    color: Colors.textPrimary, marginBottom: 2,
  },
  statLabel: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: '500' },
  trendBadge: {
    marginTop: 6, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full,
  },
  trendText: { fontSize: 11, fontWeight: '600' },
  statAccent: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
  },

  // ── Vital Card ──
  vitalCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flex: 1,
    ...Shadows.sm,
  },
  vitalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.sm,
  },
  vitalIcon: { fontSize: 22 },
  vitalStatus: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full,
  },
  vitalDot: { width: 6, height: 6, borderRadius: 3 },
  vitalStatusText: { fontSize: 10, fontWeight: '700' },
  vitalValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  vitalValue: { fontSize: Typography.xxl, fontWeight: '800' },
  vitalUnit: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: '600' },
  vitalLabel: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  normalRange: { fontSize: 10, color: Colors.textLight, marginTop: 4 },

  // ── Info Row ──
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.md, gap: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  infoIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: Typography.xs, color: Colors.textLight },
  infoValue: { fontSize: Typography.base, color: Colors.textPrimary, fontWeight: '500', marginTop: 1 },
  infoArrow: { fontSize: 20, color: Colors.textLight },

  // ── Notification ──
  notifItem: {
    backgroundColor: Colors.white,
    flexDirection: 'row', alignItems: 'flex-start',
    padding: Spacing.md, gap: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  notifUnread: { backgroundColor: `${Colors.primary}08` },
  notifIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  notifTitle: { flex: 1, fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary },
  notifTime: { fontSize: Typography.xs, color: Colors.textLight },
  notifBody: { fontSize: Typography.xs, color: Colors.textSecondary, lineHeight: 18 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary, marginTop: 4,
  },
});
