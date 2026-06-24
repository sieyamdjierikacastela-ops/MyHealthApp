// ─────────────────────────────────────────────────────────────
//  MyHealth — DoctorDashboardScreen
//  Tableau de bord principal du médecin
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { API } from '../../services/api';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import GradientHeader from '../../components/ui/GradientHeader';
import Avatar from '../../components/ui/Avatar';
import AppointmentCard, { Appointment } from '../../components/ui/AppointmentCard';
import { StatCard } from '../../components/ui/Cards';
import { AppointmentSkeleton } from '../../components/ui/Loading';
import { Card, EmptyState, Badge } from '../../components/ui/index';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_OPTIONS = [
  { value: 'available', label: 'Disponible', color: Colors.available },
  { value: 'busy', label: 'Occupé', color: Colors.warning },
  { value: 'unavailable', label: 'Indisponible', color: Colors.danger },
];

export default function DoctorDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<'available' | 'busy' | 'unavailable'>('available');
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const stats = {
    today: appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    revenue: appointments.filter(a => a.status === 'completed').length * 15000,
    rating: 4.8,
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await API.appointments.list();
      if (res.success) setAppointments(res.data.appointments || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleStatusChange = async (newStatus: typeof status) => {
    setStatus(newStatus);
    setShowStatusPicker(false);
    try { await API.doctors.list(); } catch (e) {}
  };

  const fullName = `Dr. ${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  const currentStatus = STATUS_OPTIONS.find(s => s.value === status)!;
  const todayAppointments = appointments.filter(
    a => a.status === 'pending' || a.status === 'confirmed'
  ).slice(0, 3);

  return (
    <View style={styles.container}>
      {/* Header avec statut */}
      <View style={styles.header}>
        <View style={styles.circle1} /><View style={styles.circle2} />
        <View style={styles.headerTop}>
          <View style={styles.greetingBlock}>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.doctorName}>{fullName} 👋</Text>
            <Text style={styles.specialty}>{user?.role === 'doctor' ? '🩺 Médecin' : ''}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Avatar uri={user?.avatar} firstName={user?.first_name} lastName={user?.last_name} size={52} verified />
          </TouchableOpacity>
        </View>

        {/* Sélecteur de statut */}
        <TouchableOpacity
          style={[styles.statusSelector, { borderColor: currentStatus.color }]}
          onPress={() => setShowStatusPicker(v => !v)}
        >
          <View style={[styles.statusDot, { backgroundColor: currentStatus.color }]} />
          <Text style={[styles.statusLabel, { color: currentStatus.color }]}>{currentStatus.label}</Text>
          <Text style={styles.statusArrow}>▼</Text>
        </TouchableOpacity>

        {showStatusPicker && (
          <View style={styles.statusPicker}>
            {STATUS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.statusOption, status === opt.value && styles.statusOptionActive]}
                onPress={() => handleStatusChange(opt.value as typeof status)}
              >
                <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
                <Text style={[styles.statusOptionText, { color: opt.color }]}>{opt.label}</Text>
                {status === opt.value && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Stats du jour */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aujourd'hui</Text>
          <View style={styles.statsGrid}>
            <StatCard label="Consultations" value={stats.today} icon="📅" color={Colors.primary} />
            <StatCard label="Terminées" value={stats.completed} icon="✅" color={Colors.secondary} />
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              label="Revenus du jour"
              value={`${(stats.revenue).toLocaleString()} F`}
              icon="💰"
              color="#D97706"
              trend={{ value: 12, label: 'ce mois' }}
            />
            <StatCard label="Note moyenne" value={stats.rating} icon="⭐" color="#F59E0B" />
          </View>
        </View>

        {/* Consultations du jour */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Consultations du jour</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DoctorSchedule' as any)}>
              <Text style={styles.seeAll}>Agenda complet</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <>{[1,2].map(i => <AppointmentSkeleton key={i} />)}</>
          ) : todayAppointments.length === 0 ? (
            <Card>
              <EmptyState icon="📅" title="Aucune consultation aujourd'hui" subtitle="Votre journée est libre" />
            </Card>
          ) : (
            todayAppointments.map(appt => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onPress={() => navigation.navigate('PatientDossier' as any, { patient_id: appt.id })}
                onJoin={() => navigation.navigate('VideoCall' as any, {
                  appointment_id: appt.id,
                  doctor_name: fullName,
                })}
              />
            ))
          )}
        </View>

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            {[
              { icon: '👥', label: 'Mes patients', route: 'DoctorPatients', color: Colors.primary },
              { icon: '📋', label: 'Ordonnances', route: 'CreatePrescription', color: Colors.secondary },
              { icon: '💬', label: 'Messages', route: 'ChatList', color: '#7C3AED' },
              { icon: '💰', label: 'Revenus', route: 'DoctorRevenues', color: '#D97706' },
            ].map(action => (
              <TouchableOpacity
                key={action.label}
                style={styles.quickBtn}
                onPress={() => navigation.navigate(action.route as any)}
                activeOpacity={0.85}
              >
                <View style={[styles.quickIcon, { backgroundColor: `${action.color}18` }]}>
                  <Text style={{ fontSize: 26 }}>{action.icon}</Text>
                </View>
                <Text style={styles.quickLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Derniers patients */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Derniers patients</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DoctorPatients' as any)}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <Card padding={0}>
            {[
              { name: 'Marie Dupont', age: 34, motif: 'Hypertension', time: 'Il y a 1h', initials: 'MD' },
              { name: 'Jean Mballa', age: 52, motif: 'Diabète type 2', time: 'Hier', initials: 'JM' },
              { name: 'Sophie Ngo', age: 28, motif: 'Fièvre persistante', time: 'Il y a 2j', initials: 'SN' },
            ].map((p, i) => (
              <TouchableOpacity key={i} style={[styles.patientRow, i < 2 && styles.patientRowBorder]}>
                <Avatar firstName={p.initials[0]} lastName={p.initials[1]} size={44} />
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{p.name}</Text>
                  <Text style={styles.patientMotif}>{p.motif} · {p.age} ans</Text>
                </View>
                <Text style={styles.patientTime}>{p.time}</Text>
              </TouchableOpacity>
            ))}
          </Card>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBg },

  header: {
    backgroundColor: Colors.darkNavy,
    paddingHorizontal: Spacing.base,
    paddingTop: 56, paddingBottom: Spacing.xl,
    overflow: 'hidden',
  },
  circle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(0,200,150,0.1)', top: -50, right: -40 },
  circle2: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(0,119,182,0.08)', top: 20, right: 90 },

  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  greetingBlock: { flex: 1 },
  greeting: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.6)' },
  doctorName: { fontSize: Typography.xxl, fontWeight: '800', color: Colors.white, marginTop: 2 },
  specialty: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '600', marginTop: 4 },

  // Statut
  statusSelector: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.full, paddingHorizontal: Spacing.md,
    paddingVertical: 10, borderWidth: 1.5, alignSelf: 'flex-start',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: Typography.sm, fontWeight: '700' },
  statusArrow: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginLeft: 4 },

  statusPicker: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    marginTop: Spacing.sm, ...Shadows.lg, overflow: 'hidden',
  },
  statusOption: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  statusOptionActive: { backgroundColor: Colors.lightBg },
  statusOptionText: { flex: 1, fontSize: Typography.base, fontWeight: '600' },
  checkmark: { fontSize: 16, color: Colors.primary },

  scroll: { padding: Spacing.base, paddingBottom: Spacing.xxxl },

  section: { marginBottom: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  seeAll: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600' },

  statsGrid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },

  quickActions: { flexDirection: 'row', gap: Spacing.sm },
  quickBtn: { flex: 1, alignItems: 'center', gap: 6 },
  quickIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  quickLabel: { fontSize: Typography.xs, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },

  patientRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  patientRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  patientInfo: { flex: 1 },
  patientName: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  patientMotif: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  patientTime: { fontSize: Typography.xs, color: Colors.textLight },
});
