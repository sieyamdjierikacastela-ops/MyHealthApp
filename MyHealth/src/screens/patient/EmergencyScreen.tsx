// ─────────────────────────────────────────────────────────────
//  MyHealth — EmergencyScreen
//  Écran SOS actif — position live + contacts d'urgence
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Animated, Vibration,
} from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { API } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import SOSButton from '../../components/ui/SOSButton';
import { Card, Button } from '../../components/ui/index';

interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

const MOCK_CONTACTS: EmergencyContact[] = [
  { name: 'Jean Dupont', phone: '+237 699 000 001', relation: 'Époux' },
  { name: 'Dr. Kamga', phone: '+237 699 000 002', relation: 'Médecin traitant' },
];

const NEARBY_SERVICES = [
  { name: 'SAMU Cameroun', phone: '15', icon: '🚑', color: Colors.danger },
  { name: 'Pompiers', phone: '18', icon: '🚒', color: '#FF6B00' },
  { name: 'Police', phone: '17', icon: '👮', color: Colors.secondary },
  { name: 'CHU Yaoundé', phone: '222 23 40 01', icon: '🏥', color: Colors.primary },
];

export default function EmergencyScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [sosActive, setSosActive] = useState(false);
  const [alertId, setAlertId] = useState<number | null>(null);
  const [location, setLocation] = useState<string>('Localisation en cours...');
  const [elapsed, setElapsed] = useState(0);
  const [contacts] = useState<EmergencyContact[]>(MOCK_CONTACTS);

  useEffect(() => {
    startPulse();
    getLocation();
  }, []);

  useEffect(() => {
    if (sosActive) {
      const interval = setInterval(() => setElapsed(e => e + 1), 1000);
      Vibration.vibrate([500, 500, 500]);
      return () => clearInterval(interval);
    }
  }, [sosActive]);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };

  const getLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync(loc.coords);
      if (address[0]) {
        setLocation(`${address[0].street || ''} ${address[0].name || ''}, ${address[0].city || 'Yaoundé'}`);
      }
    } catch {
      setLocation('Position GPS non disponible');
    }
  };

  const handleSOS = async () => {
    if (sosActive) {
      Alert.alert('Annuler le SOS ?', 'Les secours seront informés de l\'annulation.', [
        { text: 'Non', style: 'cancel' },
        { text: 'Annuler le SOS', style: 'destructive', onPress: cancelSOS },
      ]);
      return;
    }
    activateSOS();
  };

  const activateSOS = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      const res = await API.emergency.sos(loc.coords.latitude, loc.coords.longitude);
      if (res.success) {
        setSosActive(true);
        setAlertId(res.data.alert?.id || 1);
        Vibration.vibrate(1000);
      }
    } catch {
      setSosActive(true);
    }
  };

  const cancelSOS = async () => {
    if (alertId) await API.emergency.cancelSOS(alertId);
    setSosActive(false);
    setAlertId(null);
    setElapsed(0);
    Vibration.cancel();
  };

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header urgences */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🚨 Urgences</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Bouton SOS central */}
        <View style={styles.sosSection}>
          {sosActive && (
            <Animated.View style={[styles.sosActiveLabel, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.sosActiveLabelText}>🚨 ALERTE EN COURS</Text>
              <Text style={styles.sosActiveTimer}>{formatElapsed(elapsed)}</Text>
            </Animated.View>
          )}
          <View style={styles.sosCenter}>
            <SOSButton onPress={handleSOS} size={110} active={sosActive} />
          </View>
          <Text style={styles.sosHint}>
            {sosActive
              ? 'Appuyez pour annuler l\'alerte'
              : 'Appuyez pour déclencher une alerte SOS'}
          </Text>
        </View>

        {/* Ma position */}
        <Card style={styles.locationCard}>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Ma position actuelle</Text>
              <Text style={styles.locationText}>{location}</Text>
            </View>
            <TouchableOpacity onPress={getLocation} style={styles.refreshBtn}>
              <Text style={styles.refreshIcon}>🔄</Text>
            </TouchableOpacity>
          </View>
          {sosActive && (
            <Text style={styles.locationUpdate}>📡 Position mise à jour toutes les 30s</Text>
          )}
        </Card>

        {/* Infos médicales envoyées */}
        {sosActive && (
          <Card style={styles.medInfoCard}>
            <Text style={styles.medInfoTitle}>✅ Informations envoyées aux secours</Text>
            <View style={styles.medInfoRow}>
              <Text style={styles.medInfoLabel}>Groupe sanguin :</Text>
              <Text style={styles.medInfoValue}>{user?.blood_group || '?'}</Text>
            </View>
            <View style={styles.medInfoRow}>
              <Text style={styles.medInfoLabel}>Nom :</Text>
              <Text style={styles.medInfoValue}>{user?.first_name} {user?.last_name}</Text>
            </View>
            <View style={styles.medInfoRow}>
              <Text style={styles.medInfoLabel}>Téléphone :</Text>
              <Text style={styles.medInfoValue}>{user?.phone}</Text>
            </View>
          </Card>
        )}

        {/* Services d'urgence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services d'urgence</Text>
          <View style={styles.servicesGrid}>
            {NEARBY_SERVICES.map(service => (
              <TouchableOpacity
                key={service.name}
                style={[styles.serviceCard, { borderColor: `${service.color}40` }]}
                activeOpacity={0.85}
              >
                <Text style={styles.serviceIcon}>{service.icon}</Text>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={[styles.servicePhone, { color: service.color }]}>{service.phone}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contacts d'urgence */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes contacts d'urgence</Text>
            <TouchableOpacity>
              <Text style={styles.editBtn}>✏️ Modifier</Text>
            </TouchableOpacity>
          </View>

          {contacts.length === 0 ? (
            <Card>
              <Text style={styles.noContactText}>Aucun contact d'urgence défini</Text>
              <Button label="Ajouter un contact" onPress={() => {}} size="sm" variant="outline" style={{ marginTop: Spacing.md }} />
            </Card>
          ) : (
            contacts.map((contact, i) => (
              <Card key={i} style={styles.contactCard}>
                <View style={styles.contactRow}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactAvatarText}>{contact.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelation}>{contact.relation}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                  <TouchableOpacity style={styles.callContactBtn}>
                    <Text style={styles.callContactIcon}>📞</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Bouton carte */}
        <Button
          label="Voir les hôpitaux et ambulances proches"
          onPress={() => navigation.navigate('MapScreen', { mode: 'hospitals' })}
          variant="outline"
          icon="🗺️"
          style={styles.mapBtn}
        />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.darkNavy, paddingHorizontal: Spacing.base,
    paddingTop: 56, paddingBottom: Spacing.md,
  },
  backBtn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: Colors.white },
  headerTitle: { fontSize: Typography.lg, fontWeight: '800', color: Colors.white },

  scroll: { padding: Spacing.base, paddingBottom: Spacing.xxxl },

  sosSection: { alignItems: 'center', paddingVertical: Spacing.xl },
  sosActiveLabel: {
    backgroundColor: Colors.danger, borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
    alignItems: 'center', marginBottom: Spacing.lg, ...Shadows.danger,
  },
  sosActiveLabelText: { fontSize: Typography.base, fontWeight: '900', color: Colors.white, letterSpacing: 2 },
  sosActiveTimer: { fontSize: Typography.xxl, fontWeight: '800', color: Colors.white, marginTop: 4 },
  sosCenter: { marginVertical: Spacing.md },
  sosHint: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: Spacing.md, textAlign: 'center' },

  locationCard: { marginBottom: Spacing.xl },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  locationIcon: { fontSize: 24 },
  locationInfo: { flex: 1 },
  locationLabel: { fontSize: Typography.xs, color: Colors.textLight, fontWeight: '600' },
  locationText: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: '500', marginTop: 2 },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.lightBg, alignItems: 'center', justifyContent: 'center' },
  refreshIcon: { fontSize: 18 },
  locationUpdate: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '600', marginTop: Spacing.sm },

  medInfoCard: { backgroundColor: Colors.primaryOverlay, marginBottom: Spacing.xl },
  medInfoTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.primary, marginBottom: Spacing.sm },
  medInfoRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: 4 },
  medInfoLabel: { fontSize: Typography.xs, color: Colors.textSecondary, width: 100 },
  medInfoValue: { fontSize: Typography.xs, fontWeight: '700', color: Colors.textPrimary },

  section: { marginBottom: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  editBtn: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600' },

  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  serviceCard: {
    width: '47%', backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: Spacing.md, alignItems: 'center', gap: 4,
    borderWidth: 1.5, ...Shadows.sm,
  },
  serviceIcon: { fontSize: 28 },
  serviceName: { fontSize: Typography.xs, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  servicePhone: { fontSize: Typography.base, fontWeight: '800' },

  contactCard: { marginBottom: Spacing.sm },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' },
  contactAvatarText: { fontSize: Typography.lg, fontWeight: '700', color: Colors.white },
  contactInfo: { flex: 1 },
  contactName: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  contactRelation: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 1 },
  contactPhone: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  callContactBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryOverlay, alignItems: 'center', justifyContent: 'center' },
  callContactIcon: { fontSize: 20 },
  noContactText: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center' },

  mapBtn: { marginBottom: Spacing.xl },
});
