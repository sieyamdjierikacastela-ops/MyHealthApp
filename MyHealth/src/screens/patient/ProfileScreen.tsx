// ─────────────────────────────────────────────────────────────
//  MyHealth — ProfileScreen
//  Profil du patient + paramètres rapides
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import Avatar from '../../components/ui/Avatar';
import { Card } from '../../components/ui/index';
import { InfoRow } from '../../components/ui/Cards';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MENU_SECTIONS = [
  {
    title: 'Mon dossier',
    items: [
      { icon: '📋', label: 'Dossier médical', route: 'MedicalRecord' },
      { icon: '📝', label: 'Questionnaire santé', route: 'HealthQuestionnaire' },
      { icon: '💊', label: 'Mes ordonnances', route: 'MedicalRecord' },
    ],
  },
  {
    title: 'Paramètres',
    items: [
      { icon: '👤', label: 'Modifier mon profil', route: 'Settings' },
      { icon: '🔔', label: 'Notifications', route: 'Settings' },
      { icon: '🌐', label: 'Langue', route: 'Settings' },
      { icon: '🔒', label: 'Sécurité & 2FA', route: 'Settings' },
    ],
  },
  {
    title: 'Aide',
    items: [
      { icon: '❓', label: 'Centre d\'aide', route: null },
      { icon: '📞', label: 'Contacter le support', route: null },
      { icon: '📄', label: 'Conditions d\'utilisation', route: null },
    ],
  },
];

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: logout },
    ]);
  };

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header profil */}
      <View style={styles.header}>
        <View style={styles.circle1} /><View style={styles.circle2} />
        <View style={styles.profileBlock}>
          <Avatar
            uri={user?.avatar}
            firstName={user?.first_name}
            lastName={user?.last_name}
            size={80}
          />
          <Text style={styles.name}>{fullName || 'Utilisateur'}</Text>
          <Text style={styles.email}>{user?.email || user?.phone}</Text>
          <View style={styles.bloodGroupBadge}>
            <Text style={styles.bloodGroupText}>🩸 Groupe {user?.blood_group || '?'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Consultations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Médecins</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Ordonnances</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {MENU_SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card padding={0}>
              {section.items.map((item, i) => (
                <InfoRow
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value=""
                  showArrow
                  onPress={() => item.route && navigation.navigate(item.route as any)}
                />
              ))}
            </Card>
          </View>
        ))}

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>MyHealth v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBg },
  header: { backgroundColor: Colors.darkNavy, paddingBottom: Spacing.xl, overflow: 'hidden' },
  circle1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(0,200,150,0.1)', top: -40, right: -30 },
  circle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(0,119,182,0.08)', bottom: 0, left: -30 },
  profileBlock: { alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.base, gap: 6 },
  name: { fontSize: Typography.xl, fontWeight: '800', color: Colors.white },
  email: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.6)' },
  bloodGroupBadge: { backgroundColor: 'rgba(229,57,53,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  bloodGroupText: { fontSize: Typography.xs, color: Colors.danger, fontWeight: '700' },

  statsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl, paddingHorizontal: Spacing.xxl },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: Typography.xl, fontWeight: '800', color: Colors.white },
  statLabel: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 4 },

  content: { padding: Spacing.base },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.base, backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.danger, marginBottom: Spacing.md },
  logoutIcon: { fontSize: 20 },
  logoutText: { fontSize: Typography.base, color: Colors.danger, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: Typography.xs, color: Colors.textLight, marginBottom: Spacing.xxxl },
});
