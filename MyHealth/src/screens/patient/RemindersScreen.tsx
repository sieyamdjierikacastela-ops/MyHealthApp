// ─────────────────────────────────────────────────────────────
//  MyHealth — RemindersScreen
//  Rappels médicaments et rendez-vous
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import GradientHeader from '../../components/ui/GradientHeader';
import { Card, Button, EmptyState } from '../../components/ui/index';

const MOCK_REMINDERS = [
  { id: 1, type: 'medication', name: 'Paracétamol 500mg', dose: '1 comprimé', time: '08:00', frequency: 'Tous les jours', active: true, icon: '💊', color: Colors.primary },
  { id: 2, type: 'medication', name: 'Metformine 850mg', dose: '1 comprimé', time: '12:00', frequency: 'Tous les jours', active: true, icon: '💊', color: Colors.secondary },
  { id: 3, type: 'medication', name: 'Vitamine D3', dose: '1 gélule', time: '20:00', frequency: '3x par semaine', active: false, icon: '💊', color: '#D97706' },
  { id: 4, type: 'appointment', name: 'Dr. Kamga — Cardiologie', dose: '', time: '10:00', frequency: 'Lun. 1 juil.', active: true, icon: '📅', color: '#7C3AED' },
];

const QUICK_ACTIONS = [
  { icon: '💊', label: 'Médicament', color: Colors.primary },
  { icon: '📅', label: 'Rendez-vous', color: '#7C3AED' },
  { icon: '🤰', label: 'Prénatal', color: '#DB2777' },
  { icon: '🌸', label: 'Cycle', color: '#E53935' },
];

export default function RemindersScreen() {
  const navigation = useNavigation();
  const [reminders, setReminders] = useState(MOCK_REMINDERS);

  const toggleReminder = (id: number) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const activeCount = reminders.filter(r => r.active).length;

  return (
    <View style={styles.container}>
      <GradientHeader mode="page" title="Rappels & Alarmes" subtitle={`${activeCount} rappels actifs`} onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ajouter un rappel</Text>
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity key={action.label} style={styles.quickBtn} activeOpacity={0.85}>
                <View style={[styles.quickIcon, { backgroundColor: `${action.color}18` }]}>
                  <Text style={{ fontSize: 24 }}>{action.icon}</Text>
                </View>
                <Text style={styles.quickLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Liste rappels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes rappels</Text>
          {reminders.length === 0 ? (
            <EmptyState icon="⏰" title="Aucun rappel" subtitle="Ajoutez vos médicaments pour ne plus les oublier" />
          ) : (
            reminders.map(reminder => (
              <Card key={reminder.id} style={[styles.reminderCard, !reminder.active && styles.reminderInactive]}>
                <View style={styles.reminderRow}>
                  <View style={[styles.reminderIcon, { backgroundColor: `${reminder.color}18` }]}>
                    <Text style={{ fontSize: 22 }}>{reminder.icon}</Text>
                  </View>
                  <View style={styles.reminderInfo}>
                    <Text style={[styles.reminderName, !reminder.active && styles.textMuted]} numberOfLines={1}>
                      {reminder.name}
                    </Text>
                    {reminder.dose ? (
                      <Text style={styles.reminderDose}>{reminder.dose}</Text>
                    ) : null}
                    <View style={styles.reminderMeta}>
                      <Text style={[styles.reminderTime, { color: reminder.color }]}>🕐 {reminder.time}</Text>
                      <Text style={styles.reminderFreq}>· {reminder.frequency}</Text>
                    </View>
                  </View>
                  <Switch
                    value={reminder.active}
                    onValueChange={() => toggleReminder(reminder.id)}
                    trackColor={{ false: Colors.border, true: `${reminder.color}60` }}
                    thumbColor={reminder.active ? reminder.color : Colors.textLight}
                  />
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Info snooze */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Alarmes intelligentes</Text>
            <Text style={styles.infoText}>Les alarmes fonctionnent même sans connexion internet. Snooze disponible : 5, 10 ou 30 minutes.</Text>
          </View>
        </Card>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBg },
  scroll: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },

  quickActions: { flexDirection: 'row', gap: Spacing.sm },
  quickBtn: { flex: 1, alignItems: 'center', gap: 6 },
  quickIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  quickLabel: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: '600' },

  reminderCard: { marginBottom: Spacing.sm },
  reminderInactive: { opacity: 0.6 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  reminderIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  reminderInfo: { flex: 1 },
  reminderName: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  reminderDose: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 1 },
  reminderMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  reminderTime: { fontSize: Typography.xs, fontWeight: '700' },
  reminderFreq: { fontSize: Typography.xs, color: Colors.textLight },
  textMuted: { color: Colors.textLight },

  infoCard: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  infoIcon: { fontSize: 22 },
  infoTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 },
  infoText: { fontSize: Typography.xs, color: Colors.textSecondary, lineHeight: 18 },
});
