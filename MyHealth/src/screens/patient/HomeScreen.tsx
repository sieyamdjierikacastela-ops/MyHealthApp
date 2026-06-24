// ─────────────────────────────────────────────────────────────
//  MyHealth — HomeScreen
//  Dashboard principal du patient
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { API } from '../../services/api';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import GradientHeader from '../../components/ui/GradientHeader';
import DoctorCard, { Doctor } from '../../components/ui/DoctorCard';
import AppointmentCard, { Appointment } from '../../components/ui/AppointmentCard';
import { DoctorCardSkeleton, AppointmentSkeleton } from '../../components/ui/Loading';
import { Card, EmptyState } from '../../components/ui/index';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const QUICK_MODULES = [
  { icon: '🏥', label: 'Consulter', route: 'Specialities', color: Colors.primary },
  { icon: '📅', label: 'Mes RDV', route: 'Appointments', color: Colors.secondary },
  { icon: '📋', label: 'Dossier', route: 'MedicalRecord', color: '#7C3AED' },
  { icon: '🚨', label: 'Urgences', route: 'Emergency', color: Colors.danger },
  { icon: '🗺️', label: 'Carte', route: 'MapScreen', color: '#D97706' },
  { icon: '⏰', label: 'Rappels', route: 'Reminders', color: '#059669' },
];

const HEALTH_TIPS = [
  { icon: '🥤', title: 'Hydratation', text: 'Buvez au moins 1,5 à 2 litres d\'eau par jour pour améliorer votre concentration et prévenir les maux de tête.' },
  { icon: '🚶', title: 'Activité physique', text: '30 minutes de marche par jour réduisent le risque de maladies cardiovasculaires de 35%.' },
  { icon: '😴', title: 'Sommeil', text: 'Un adulte a besoin de 7 à 9 heures de sommeil par nuit pour une bonne santé mentale et physique.' },
];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const tip = HEALTH_TIPS[new Date().getDay() % HEALTH_TIPS.length];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [apptRes, docRes] = await Promise.all([
        API.appointments.list(),
        API.doctors.list({ status: 'available' }),
      ]);
      if (apptRes.success) setAppointments(apptRes.data.appointments?.slice(0, 3) || []);
      if (docRes.success) setDoctors(docRes.data.doctors?.slice(0, 4) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAppts(false);
      setLoadingDoctors(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

  return (
    <View style={styles.container}>
      <GradientHeader
        mode="home"
        userName={fullName}
        userAvatar={user?.avatar}
        userRole={user?.role}
        onRightPress={() => navigation.navigate('Settings')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Questionnaire santé si pas complété */}
        {user && !user.questionnaire_completed && (
          <TouchableOpacity
            style={styles.questionnaireBanner}
            onPress={() => navigation.navigate('HealthQuestionnaire')}
            activeOpacity={0.9}
          >
            <Text style={styles.questionnaireIcon}>📝</Text>
            <View style={styles.questionnaireText}>
              <Text style={styles.questionnaireTitle}>Complétez votre profil santé</Text>
              <Text style={styles.questionnaireSubtitle}>Le questionnaire initial est obligatoire</Text>
            </View>
            <Text style={styles.questionnaireArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Modules rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Que voulez-vous faire ?</Text>
          <View style={styles.modulesGrid}>
            {QUICK_MODULES.map((mod) => (
              <TouchableOpacity
                key={mod.route}
                style={styles.moduleItem}
                onPress={() => navigation.navigate(mod.route as any)}
                activeOpacity={0.85}
              >
                <View style={[styles.moduleIcon, { backgroundColor: `${mod.color}18` }]}>
                  <Text style={styles.moduleEmoji}>{mod.icon}</Text>
                </View>
                <Text style={styles.moduleLabel}>{mod.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Prochain RDV */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prochain rendez-vous</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Appointments' as any)}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {loadingAppts ? (
            <AppointmentSkeleton />
          ) : appointments.length === 0 ? (
            <Card>
              <EmptyState
                icon="📅"
                title="Aucun rendez-vous"
                subtitle="Prenez votre premier rendez-vous"
                actionLabel="Consulter un médecin"
                onAction={() => navigation.navigate('Specialities')}
              />
            </Card>
          ) : (
            <AppointmentCard
              appointment={appointments[0]}
              onPress={() => {}}
              onJoin={() => navigation.navigate('VideoCall' as any, {
                appointment_id: appointments[0].id,
                doctor_name: `Dr. ${appointments[0].doctor_first_name}`,
              })}
              onCancel={() => {}}
            />
          )}
        </View>

        {/* Médecins disponibles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Médecins disponibles</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DoctorList', {})}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {loadingDoctors ? (
            <>{[1, 2].map(i => <DoctorCardSkeleton key={i} />)}</>
          ) : doctors.length === 0 ? (
            <EmptyState icon="👨‍⚕️" title="Aucun médecin disponible" subtitle="Réessayez plus tard" />
          ) : (
            doctors.map(doc => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                variant="horizontal"
                onPress={() => navigation.navigate('DoctorProfile', { doctor_id: doc.id })}
              />
            ))
          )}
        </View>

        {/* Conseil santé du jour */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conseil santé du jour 💡</Text>
          <Card style={styles.tipCard}>
            <Text style={styles.tipIcon}>{tip.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          </Card>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBg },
  scroll: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },

  // Bannière questionnaire
  questionnaireBanner: {
    backgroundColor: Colors.secondary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.base,
    ...Shadows.md,
  },
  questionnaireIcon: { fontSize: 28 },
  questionnaireText: { flex: 1 },
  questionnaireTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.white },
  questionnaireSubtitle: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  questionnaireArrow: { fontSize: 20, color: Colors.white },

  // Sections
  section: { marginTop: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  seeAll: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600' },

  // Modules
  modulesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  moduleItem: { width: '30%', alignItems: 'center', gap: 6 },
  moduleIcon: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', ...Shadows.sm,
  },
  moduleEmoji: { fontSize: 26 },
  moduleLabel: { fontSize: Typography.xs, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },

  // Tip
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  tipIcon: { fontSize: 32 },
  tipTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  tipText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },
});
