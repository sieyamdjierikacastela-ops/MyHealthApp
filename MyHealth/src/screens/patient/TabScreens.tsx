// ─────────────────────────────────────────────────────────────
//  MyHealth — MapScreen & SettingsScreen
//  Écrans pour les onglets restants (développés à l'étape 5)
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { Button } from '../../components/ui/index';

function TabPlaceholder({ icon, title, subtitle, btnLabel, onBtnPress }: {
  icon: string; title: string; subtitle: string;
  btnLabel?: string; onBtnPress?: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {btnLabel && onBtnPress && (
          <Button label={btnLabel} onPress={onBtnPress} fullWidth={false} style={styles.btn} />
        )}
      </View>
    </View>
  );
}

export function MapScreen() {
  return (
    <TabPlaceholder
      icon="🗺️"
      title="Carte & Localisation"
      subtitle="Trouvez les hôpitaux, pharmacies et ambulances près de vous"
      btnLabel="Activer la localisation"
      onBtnPress={() => {}}
    />
  );
}

export function SettingsScreen() {
  const navigation = useNavigation();
  return (
    <TabPlaceholder
      icon="⚙️"
      title="Paramètres"
      subtitle="Gérez votre profil, vos notifications et votre sécurité"
    />
  );
}

export function MedicalScreen() {
  const navigation = useNavigation<any>();
  return (
    <TabPlaceholder
      icon="📋"
      title="Dossier Médical"
      subtitle="Vos constantes vitales, antécédents, ordonnances et consultations"
      btnLabel="Voir mon dossier"
      onBtnPress={() => navigation.navigate('MedicalRecord', { patient_id: 0 })}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBg },
  headerBar: {
    backgroundColor: Colors.darkNavy,
    paddingHorizontal: Spacing.base,
    paddingTop: 60,
    paddingBottom: Spacing.xl,
  },
  headerTitle: { fontSize: Typography.xl, fontWeight: '800', color: Colors.white },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  icon: { fontSize: 64, marginBottom: Spacing.lg },
  title: { fontSize: Typography.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm, textAlign: 'center' },
  subtitle: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.xl },
  btn: {},
});
