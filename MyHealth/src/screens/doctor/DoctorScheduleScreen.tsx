// ─────────────────────────────────────────────────────────────
//  MyHealth — DoctorScheduleScreen
//  Agenda du médecin — vue semaine avec créneaux
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API } from '../../services/api';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import GradientHeader from '../../components/ui/GradientHeader';
import AppointmentCard, { Appointment } from '../../components/ui/AppointmentCard';
import { AppointmentSkeleton } from '../../components/ui/Loading';
import { Card, EmptyState, Badge } from '../../components/ui/index';

// Génère 14 jours à partir d'aujourd'hui
function getWeekDays(count = 14) {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString('fr-FR', { month: 'short' }),
      isToday: i === 0,
    });
  }
  return days;
}

// Créneaux horaires du médecin
const TIME_SLOTS = [
  '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00',
  '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30',
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1, doctor_first_name: 'Kamga', doctor_last_name: 'Nkou',
    doctor_speciality: 'Cardiologie', date: new Date().toISOString().split('T')[0],
    time: '09:00', type: 'teleconsult', status: 'confirmed',
    motif: 'Suivi tension artérielle', amount: 15000,
  },
  {
    id: 2, doctor_first_name: 'Kamga', doctor_last_name: 'Nkou',
    doctor_speciality: 'Cardiologie', date: new Date().toISOString().split('T')[0],
    time: '10:30', type: 'physical', status: 'pending',
    motif: 'Douleurs thoraciques', amount: 20000,
  },
  {
    id: 3, doctor_first_name: 'Kamga', doctor_last_name: 'Nkou',
    doctor_speciality: 'Cardiologie', date: new Date().toISOString().split('T')[0],
    time: '14:00', type: 'teleconsult', status: 'confirmed',
    motif: 'Résultats ECG', amount: 15000,
  },
];

export default function DoctorScheduleScreen() {
  const navigation = useNavigation<any>();
  const days = getWeekDays();

  const [selectedDate, setSelectedDate] = useState(days[0].date);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'timeline'>('list');

  const dayAppointments = appointments.filter(a => a.date === selectedDate);
  const selectedDay = days.find(d => d.date === selectedDate)!;

  const getSlotAppointment = (time: string) =>
    dayAppointments.find(a => a.time === time);

  const totalRevenue = dayAppointments
    .filter(a => a.status === 'confirmed' || a.status === 'completed')
    .reduce((sum, a) => sum + (a.amount || 0), 0);

  return (
    <View style={styles.container}>
      <GradientHeader
        mode="page"
        title="Mon agenda"
        subtitle={`${dayAppointments.length} consultation${dayAppointments.length > 1 ? 's' : ''} · ${totalRevenue.toLocaleString()} FCFA`}
        onBack={() => navigation.goBack()}
        rightIcon={view === 'list' ? '⏱' : '☰'}
        onRightPress={() => setView(v => v === 'list' ? 'timeline' : 'list')}
      />

      {/* Sélecteur de jours */}
      <View style={styles.calendarWrapper}>
        <FlatList
          horizontal
          data={days}
          keyExtractor={d => d.date}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysList}
          renderItem={({ item: day }) => {
            const count = appointments.filter(a => a.date === day.date).length;
            const isSelected = selectedDate === day.date;
            return (
              <TouchableOpacity
                style={[styles.dayItem, isSelected && styles.dayItemActive, day.isToday && !isSelected && styles.dayItemToday]}
                onPress={() => setSelectedDate(day.date)}
              >
                <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>{day.dayName}</Text>
                <Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>{day.dayNum}</Text>
                {count > 0 && (
                  <View style={[styles.dayBadge, isSelected && styles.dayBadgeActive]}>
                    <Text style={[styles.dayBadgeText, isSelected && styles.dayBadgeTextActive]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
        <Text style={styles.selectedDateLabel}>
          {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Vue liste */}
      {view === 'list' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {loading ? (
            <>{[1,2].map(i => <AppointmentSkeleton key={i} />)}</>
          ) : dayAppointments.length === 0 ? (
            <Card>
              <EmptyState icon="📅" title="Aucune consultation" subtitle="Aucun rendez-vous pour cette date" />
            </Card>
          ) : (
            dayAppointments.map(appt => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onPress={() => navigation.navigate('PatientDossier', { patient_id: appt.id })}
                onJoin={() => navigation.navigate('VideoCall', { appointment_id: appt.id, doctor_name: 'Dr.' })}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* Vue timeline */}
      {view === 'timeline' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {TIME_SLOTS.map(slot => {
            const appt = getSlotAppointment(slot);
            return (
              <View key={slot} style={styles.timeSlotRow}>
                <Text style={styles.timeSlotLabel}>{slot}</Text>
                {appt ? (
                  <TouchableOpacity
                    style={[styles.timeSlotCard, appt.status === 'confirmed' ? styles.slotConfirmed : styles.slotPending]}
                    onPress={() => navigation.navigate('PatientDossier', { patient_id: appt.id })}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.slotPatient} numberOfLines={1}>
                      {appt.type === 'teleconsult' ? '📹' : '🏥'} Patient #{appt.id}
                    </Text>
                    <Text style={styles.slotMotif} numberOfLines={1}>{appt.motif}</Text>
                    <Badge label={appt.status === 'confirmed' ? 'Confirmé' : 'En attente'} variant={appt.status === 'confirmed' ? 'success' : 'warning'} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.timeSlotEmpty} onPress={() => {}}>
                    <Text style={styles.timeSlotEmptyText}>Libre</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBg },

  calendarWrapper: { backgroundColor: Colors.white, ...Shadows.sm, paddingBottom: Spacing.sm },
  daysList: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, gap: Spacing.sm },
  dayItem: {
    width: 52, paddingVertical: Spacing.sm, borderRadius: Radius.md,
    alignItems: 'center', gap: 3, backgroundColor: Colors.lightBg,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  dayItemActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayItemToday: { borderColor: Colors.primary },
  dayName: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', textTransform: 'uppercase' },
  dayNameActive: { color: 'rgba(255,255,255,0.8)' },
  dayNum: { fontSize: Typography.lg, fontWeight: '800', color: Colors.textPrimary },
  dayNumActive: { color: Colors.white },
  dayBadge: { width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  dayBadgeActive: { backgroundColor: Colors.white },
  dayBadgeText: { fontSize: 10, color: Colors.white, fontWeight: '700' },
  dayBadgeTextActive: { color: Colors.primary },
  selectedDateLabel: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: '500', paddingHorizontal: Spacing.base, paddingBottom: 4 },

  scroll: { padding: Spacing.base, paddingBottom: Spacing.xxxl },

  // Timeline
  timeSlotRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.sm },
  timeSlotLabel: { width: 44, fontSize: Typography.xs, color: Colors.textLight, fontWeight: '600', paddingTop: 12 },
  timeSlotCard: {
    flex: 1, padding: Spacing.md, borderRadius: Radius.md,
    borderLeftWidth: 4, gap: 4,
  },
  slotConfirmed: { backgroundColor: Colors.primaryOverlay, borderLeftColor: Colors.primary },
  slotPending: { backgroundColor: '#FFF3E0', borderLeftColor: Colors.warning },
  slotPatient: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary },
  slotMotif: { fontSize: Typography.xs, color: Colors.textSecondary },
  timeSlotEmpty: {
    flex: 1, borderRadius: Radius.md, borderWidth: 1,
    borderColor: Colors.border, borderStyle: 'dashed',
    padding: Spacing.md, alignItems: 'center',
  },
  timeSlotEmptyText: { fontSize: Typography.xs, color: Colors.textLight },
});
