// ─────────────────────────────────────────────────────────────
//  MyHealth — PaymentScreen
//  Paiement MTN Money / Orange Money
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { API } from '../../services/api';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import { Screen, Card, Button } from '../../components/ui/index';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Payment'>;

const PAYMENT_METHODS = [
  { id: 'mtn_money', label: 'MTN Mobile Money', icon: '🟡', color: '#FFC107', desc: 'Paiement via *126#' },
  { id: 'orange_money', label: 'Orange Money', icon: '🟠', color: '#FF6B00', desc: 'Paiement via #150#' },
];

export default function PaymentScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { appointment_id, amount, doctor_name } = route.params;

  const [method, setMethod] = useState<'mtn_money' | 'orange_money'>('mtn_money');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await API.payments.initiate({ appointment_id, amount, method });
      if (res.success) {
        Alert.alert(
          'Paiement initié',
          `${res.data.instructions}\n\nRéférence : ${res.data.reference}`,
          [{ text: 'OK', onPress: () => navigation.navigate('MainTabs') }]
        );
      } else {
        Alert.alert('Erreur', res.message || 'Paiement échoué');
      }
    } catch {
      Alert.alert('Erreur', 'Vérifiez votre connexion internet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Paiement" onBack={() => navigation.goBack()}>
      <View style={styles.container}>

        {/* Récap montant */}
        <Card style={styles.amountCard}>
          <Text style={styles.amountLabel}>Montant à payer</Text>
          <Text style={styles.amount}>{amount.toLocaleString()} FCFA</Text>
          <Text style={styles.amountFor}>Consultation — {doctor_name}</Text>
        </Card>

        {/* Méthodes de paiement */}
        <Text style={styles.sectionTitle}>Choisissez votre méthode</Text>
        {PAYMENT_METHODS.map(m => (
          <TouchableOpacity
            key={m.id}
            style={[styles.methodCard, method === m.id && styles.methodCardActive]}
            onPress={() => setMethod(m.id as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.methodIcon}>{m.icon}</Text>
            <View style={styles.methodInfo}>
              <Text style={styles.methodLabel}>{m.label}</Text>
              <Text style={styles.methodDesc}>{m.desc}</Text>
            </View>
            <View style={[styles.radio, method === m.id && styles.radioActive]}>
              {method === m.id && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Sécurité */}
        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>Paiement sécurisé. Vos données bancaires ne sont jamais partagées.</Text>
        </View>

        <Button label={loading ? 'Traitement...' : `Payer ${amount.toLocaleString()} FCFA`} onPress={handlePay} loading={loading} icon="💳" style={styles.payBtn} />
      </View>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
//  MyHealth — MedicalScreen (tab)
//  Résumé dossier médical dans l'onglet
// ─────────────────────────────────────────────────────────────

export function MedicalScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles2.container}>
      <GradientHeaderLocal title="Mon dossier médical" />
      <View style={styles2.content}>
        <Text style={styles2.comingSoon}>📋</Text>
        <Text style={styles2.comingSoonText}>Dossier médical</Text>
        <Text style={styles2.comingSoonSub}>Consultez vos constantes, antécédents et ordonnances</Text>
        <Button label="Voir mon dossier" onPress={() => {}} fullWidth={false} style={styles2.btn} />
      </View>
    </View>
  );
}

function GradientHeaderLocal({ title }: { title: string }) {
  return (
    <View style={{ backgroundColor: Colors.darkNavy, padding: Spacing.xl, paddingTop: 60 }}>
      <Text style={{ fontSize: Typography.xl, fontWeight: '800', color: Colors.white }}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.base },
  amountCard: { alignItems: 'center', marginBottom: Spacing.xl, backgroundColor: Colors.darkNavy },
  amountLabel: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.7)' },
  amount: { fontSize: 40, fontWeight: '900', color: Colors.primary, marginVertical: 4 },
  amountFor: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.6)' },
  sectionTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 2, borderColor: Colors.border,
    marginBottom: Spacing.md, ...Shadows.sm,
  },
  methodCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryOverlay },
  methodIcon: { fontSize: 32 },
  methodInfo: { flex: 1 },
  methodLabel: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  methodDesc: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  securityNote: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', backgroundColor: Colors.lightBg, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.xl },
  securityIcon: { fontSize: 20 },
  securityText: { flex: 1, fontSize: Typography.xs, color: Colors.textSecondary },
  payBtn: {},
});

const styles2 = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  comingSoon: { fontSize: 60, marginBottom: Spacing.lg },
  comingSoonText: { fontSize: Typography.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  comingSoonSub: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  btn: {},
});
