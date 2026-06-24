// ─────────────────────────────────────────────────────────────
//  MyHealth — DoctorProfileScreen
//  Profil complet d'un médecin
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { API } from '../../services/api';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import Avatar from '../../components/ui/Avatar';
import { Button, Badge, Card } from '../../components/ui/index';
import { LoadingScreen } from '../../components/ui/Loading';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'DoctorProfile'>;

interface DoctorDetail {
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
  bio?: string;
  languages?: string[];
  education?: string[];
}

export default function DoctorProfileScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { user } = useAuth();
  const { doctor_id } = route.params;

  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDoctor(); }, []);

  const fetchDoctor = async () => {
    try {
      const res = await API.doctors.getById(doctor_id);
      if (res.success) setDoctor(res.data.doctor);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return <LoadingScreen message="Chargement du profil..." />;
  if (!doctor) return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Médecin introuvable</Text>
      <Button label="Retour" onPress={() => navigation.goBack()} fullWidth={false} />
    </View>
  );

  const statusConfig = {
    available: { label: 'Disponible', color: Colors.available, bg: Colors.primaryOverlay },
    busy: { label: 'Occupé', color: Colors.warning, bg: '#FFF3E0' },
    unavailable: { label: 'Indisponible', color: Colors.danger, bg: '#FFEBEE' },
  };
  const status = statusConfig[doctor.status || 'unavailable'];

  return (
    <View style={styles.container}>
      {/* Header dark avec infos principales */}
      <View style={styles.header}>
        <View style={styles.circle1} /><View style={styles.circle2} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.profileBlock}>
          <Avatar
            uri={doctor.avatar}
            firstName={doctor.first_name}
            lastName={doctor.last_name}
            size={88}
            verified
          />
          <Text style={styles.doctorName}>Dr. {doctor.first_name} {doctor.last_name}</Text>
          <Text style={[styles.speciality, { color: doctor.speciality_color || Colors.primary }]}>
            {doctor.speciality || 'Médecine générale'}
          </Text>
          {doctor.hospital && (
            <Text style={styles.hospital}>🏥 {doctor.hospital}</Text>
          )}

          {/* Étoiles */}
          <View style={styles.starsRow}>
            {[1,2,3,4,5].map(i => (
              <Text key={i} style={{ fontSize: 16, color: i <= Math.round(doctor.rating || 0) ? '#F59E0B' : 'rgba(255,255,255,0.2)' }}>★</Text>
            ))}
            <Text style={styles.ratingText}>{doctor.rating?.toFixed(1)} ({doctor.review_count} avis)</Text>
          </View>

          {/* Statut */}
          <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Stats rapides */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctor.experience_years || 0}</Text>
            <Text style={styles.statLabel}>Ans exp.</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctor.review_count || 0}</Text>
            <Text style={styles.statLabel}>Avis</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doctor.consultation_fee?.toLocaleString() || '—'}</Text>
            <Text style={styles.statLabel}>FCFA</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Téléconsultation disponible */}
        {doctor.teleconsult && (
          <View style={styles.teleconsultBanner}>
            <Text style={styles.teleconsultText}>📹 Téléconsultation disponible</Text>
            <Badge label="En ligne" variant="primary" />
          </View>
        )}

        {/* Biographie */}
        {doctor.bio && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.bioText}>{doctor.bio}</Text>
          </Card>
        )}

        {/* Langues */}
        {doctor.languages && doctor.languages.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Langues parlées</Text>
            <View style={styles.tagsRow}>
              {doctor.languages.map(lang => (
                <View key={lang} style={styles.tag}>
                  <Text style={styles.tagText}>{lang}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Formation */}
        {doctor.education && doctor.education.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Formation</Text>
            {doctor.education.map((edu, i) => (
              <View key={i} style={styles.eduItem}>
                <View style={styles.eduDot} />
                <Text style={styles.eduText}>{edu}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Espace boutons */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Boutons d'action en bas */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={async () => {
            const res = await API.chat.create(doctor.id);
            if (res.success) {
              navigation.navigate('ChatRoom', {
                chat_id: res.data.chat.id,
                doctor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
                doctor_avatar: doctor.avatar,
              });
            }
          }}
        >
          <Text style={styles.chatBtnText}>💬</Text>
        </TouchableOpacity>

        <Button
          label="Prendre rendez-vous"
          onPress={() => navigation.navigate('BookAppointment', { doctor_id: doctor.id })}
          style={styles.rdvBtn}
          icon="📅"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBg },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { fontSize: Typography.lg, color: Colors.textSecondary },

  // Header
  header: { backgroundColor: Colors.darkNavy, paddingBottom: Spacing.base, overflow: 'hidden' },
  circle1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(0,200,150,0.1)', top: -40, right: -30 },
  circle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(0,119,182,0.08)', top: 20, right: 80 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', margin: Spacing.md, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.full },
  backIcon: { fontSize: 20, color: Colors.white },

  profileBlock: { alignItems: 'center', paddingHorizontal: Spacing.base, gap: 6 },
  doctorName: { fontSize: Typography.xl, fontWeight: '800', color: Colors.white, textAlign: 'center' },
  speciality: { fontSize: Typography.base, fontWeight: '700' },
  hospital: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.7)' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.7)', marginLeft: 6 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full, marginTop: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusLabel: { fontSize: Typography.xs, fontWeight: '700' },

  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 0, marginTop: Spacing.lg, paddingHorizontal: Spacing.xxl },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: Typography.xl, fontWeight: '800', color: Colors.white },
  statLabel: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 4 },

  scroll: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base },

  teleconsultBanner: {
    backgroundColor: Colors.primaryOverlay,
    borderRadius: Radius.md, padding: Spacing.md,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  teleconsultText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600' },

  section: { marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  bioText: { fontSize: Typography.base, color: Colors.textSecondary, lineHeight: 24 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: { backgroundColor: Colors.lightBg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  tagText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: '500' },

  eduItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.sm },
  eduDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 6 },
  eduText: { flex: 1, fontSize: Typography.base, color: Colors.textSecondary },

  // Boutons bas
  bottomActions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: Spacing.md,
    padding: Spacing.base, paddingBottom: Spacing.xl,
    backgroundColor: Colors.white, ...Shadows.lg,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
  },
  chatBtn: {
    width: 52, height: 52, borderRadius: Radius.full,
    backgroundColor: Colors.lightBg, borderWidth: 1.5,
    borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  chatBtnText: { fontSize: 22 },
  rdvBtn: { flex: 1 },
});
