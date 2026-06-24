// ─────────────────────────────────────────────────────────────
//  MyHealth — PatientDossierScreen
//  Dossier complet d'un patient — vu par le médecin
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API } from '../../services/api';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import GradientHeader from '../../components/ui/GradientHeader';
import Avatar from '../../components/ui/Avatar';
import { VitalCard, InfoRow } from '../../components/ui/Cards';
import { Card, Button, Badge } from '../../components/ui/index';
import { LoadingScreen } from '../../components/ui/Loading';

const TABS = ['Constantes', 'Antécédents', 'Ordonnances', 'Consultations'];

// Données mock (remplacées par API quand Sindze livre)
const MOCK_RECORD = {
  patient: { id: 1, first_name: 'Marie', last_name: 'Dupont', dob: '1990-05-12', blood_group: 'A+', gender: 'Femme', phone: '+237 699 000 000' },
  vitals: { heart_rate: 72, blood_pressure: '145/90', temperature: 36.7, spo2: 97, weight: 65, height: 168 },
  antecedents: [
    { type: 'Médical', description: 'Hypertension artérielle depuis 2019', severity: 'moderate' },
    { type: 'Allergie', description: 'Pénicilline — réaction cutanée', severity: 'high' },
    { type: 'Familial', description: 'Diabète type 2 (mère)', severity: 'low' },
  ],
  prescriptions: [
    { id: 1, date: '2026-06-20', medications: [{ name: 'Amlodipine 5mg', frequency: '1x/jour', duration: '1 mois' }], doctor: 'Dr. Kamga Nkou' },
    { id: 2, date: '2026-05-10', medications: [{ name: 'Paracétamol 500mg', frequency: '3x/jour', duration: '5 jours' }], doctor: 'Dr. Kamga Nkou' },
  ],
  consultations: [
    { id: 1, date: '2026-06-20', type: 'teleconsult', motif: 'Suivi tension', diagnosis: 'HTA stade 1 stable', doctor: 'Dr. Kamga Nkou' },
    { id: 2, date: '2026-05-10', type: 'physical', motif: 'Fièvre', diagnosis: 'Grippe saisonnière', doctor: 'Dr. Kamga Nkou' },
  ],
};

export default function PatientDossierScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { patient_id } = route.params;

  const [record] = useState(MOCK_RECORD);
  const [activeTab, setActiveTab] = useState(0);

  const { patient, vitals, antecedents, prescriptions, consultations } = record;
  const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();
  const bmi = (vitals.weight / ((vitals.height / 100) ** 2)).toFixed(1);

  return (
    <View style={styles.container}>
      {/* Header patient */}
      <View style={styles.header}>
        <View style={styles.circle1} /><View style={styles.circle2} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.patientBlock}>
          <Avatar firstName={patient.first_name} lastName={patient.last_name} size={72} />
          <Text style={styles.patientName}>{patient.first_name} {patient.last_name}</Text>
          <View style={styles.metaRow}>
            <Badge label={`${age} ans`} variant="neutral" />
            <Badge label={patient.gender} variant="neutral" />
            <Badge label={`🩸 ${patient.blood_group}`} variant="danger" />
          </View>
          <Text style={styles.patientId}>Dossier #MHP-{patient_id.toString().padStart(5, '0')}</Text>
        </View>

        {/* Actions rapides */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('CreatePrescription', { patient_id, appointment_id: 0 })}>
            <Text style={styles.quickBtnText}>💊 Ordonnance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn}>
            <Text style={styles.quickBtnText}>💬 Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickBtn, styles.quickBtnPrimary]}>
            <Text style={[styles.quickBtnText, { color: Colors.white }]}>📹 Appel vidéo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Onglets */}
      <View style={styles.tabs}>
        {TABS.map((tab, i) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === i && styles.tabActive]} onPress={() => setActiveTab(i)}>
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Constantes vitales */}
        {activeTab === 0 && (
          <View>
            <View style={styles.vitalsGrid}>
              <VitalCard label="Fréquence cardiaque" value={vitals.heart_rate} unit="bpm" icon="❤️" status={vitals.heart_rate >= 60 && vitals.heart_rate <= 100 ? 'normal' : 'warning'} normalRange="60–100 bpm" />
              <VitalCard label="SpO2" value={vitals.spo2} unit="%" icon="🫁" status={vitals.spo2 >= 95 ? 'normal' : 'danger'} normalRange="95–100%" />
            </View>
            <View style={styles.vitalsGrid}>
              <VitalCard label="Température" value={vitals.temperature} unit="°C" icon="🌡️" status={vitals.temperature <= 37.2 ? 'normal' : 'warning'} normalRange="36.1–37.2°C" />
              <VitalCard label="Tension" value={vitals.blood_pressure} icon="💉" status="warning" normalRange="90–130 mmHg" />
            </View>
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Morphologie</Text>
              <View style={styles.morphRow}>
                <View style={styles.morphItem}>
                  <Text style={styles.morphValue}>{vitals.weight} kg</Text>
                  <Text style={styles.morphLabel}>Poids</Text>
                </View>
                <View style={styles.morphDivider} />
                <View style={styles.morphItem}>
                  <Text style={styles.morphValue}>{vitals.height} cm</Text>
                  <Text style={styles.morphLabel}>Taille</Text>
                </View>
                <View style={styles.morphDivider} />
                <View style={styles.morphItem}>
                  <Text style={[styles.morphValue, { color: parseFloat(bmi) > 25 ? Colors.warning : Colors.primary }]}>{bmi}</Text>
                  <Text style={styles.morphLabel}>IMC</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Antécédents */}
        {activeTab === 1 && (
          <View>
            {antecedents.map((ant, i) => (
              <Card key={i} style={[styles.antCard, { borderLeftColor: ant.severity === 'high' ? Colors.danger : ant.severity === 'moderate' ? Colors.warning : Colors.primary }]}>
                <View style={styles.antHeader}>
                  <Badge label={ant.type} variant={ant.severity === 'high' ? 'danger' : ant.severity === 'moderate' ? 'warning' : 'primary'} />
                  {ant.severity === 'high' && <Text style={styles.alertIcon}>⚠️</Text>}
                </View>
                <Text style={styles.antDescription}>{ant.description}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* Ordonnances */}
        {activeTab === 2 && (
          <View>
            {prescriptions.map(presc => (
              <Card key={presc.id} style={styles.prescCard}>
                <View style={styles.prescHeader}>
                  <Text style={styles.rxSymbol}>℞</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.prescDate}>{new Date(presc.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                    <Text style={styles.prescDoctor}>{presc.doctor}</Text>
                  </View>
                </View>
                {presc.medications.map((med, i) => (
                  <View key={i} style={styles.medRow}>
                    <Text style={styles.medDot}>•</Text>
                    <Text style={styles.medText}>{med.name} — {med.frequency} · {med.duration}</Text>
                  </View>
                ))}
              </Card>
            ))}
          </View>
        )}

        {/* Consultations */}
        {activeTab === 3 && (
          <View>
            {consultations.map(consult => (
              <Card key={consult.id} style={styles.consultCard}>
                <View style={styles.consultHeader}>
                  <Text style={styles.consultDate}>{new Date(consult.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                  <Badge label={consult.type === 'teleconsult' ? '📹 Téléconsult' : '🏥 Cabinet'} variant="secondary" />
                </View>
                <Text style={styles.consultMotif}>Motif : {consult.motif}</Text>
                <View style={styles.diagBox}>
                  <Text style={styles.diagLabel}>Diagnostic</Text>
                  <Text style={styles.diagText}>{consult.diagnosis}</Text>
                </View>
                <Text style={styles.consultDoctor}>{consult.doctor}</Text>
              </Card>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBg },

  header: { backgroundColor: Colors.darkNavy, paddingBottom: Spacing.base, overflow: 'hidden' },
  circle1: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(0,200,150,0.1)', top: -30, right: -20 },
  circle2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,119,182,0.08)', top: 10, right: 70 },
  backBtn: { width: 40, height: 40, margin: Spacing.md, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: Colors.white },
  patientBlock: { alignItems: 'center', gap: 6, paddingHorizontal: Spacing.base },
  patientName: { fontSize: Typography.xl, fontWeight: '800', color: Colors.white },
  metaRow: { flexDirection: 'row', gap: Spacing.sm },
  patientId: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },

  quickActions: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, marginTop: Spacing.md },
  quickBtn: { flex: 1, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center' },
  quickBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  quickBtnText: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  tabs: { flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },

  scroll: { padding: Spacing.base, paddingBottom: Spacing.xxxl },

  vitalsGrid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  section: { marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },

  morphRow: { flexDirection: 'row', justifyContent: 'space-around' },
  morphItem: { alignItems: 'center' },
  morphValue: { fontSize: Typography.xl, fontWeight: '800', color: Colors.textPrimary },
  morphLabel: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  morphDivider: { width: 1, backgroundColor: Colors.border },

  antCard: { marginBottom: Spacing.md, borderLeftWidth: 4 },
  antHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  alertIcon: { fontSize: 18 },
  antDescription: { fontSize: Typography.base, color: Colors.textSecondary },

  prescCard: { marginBottom: Spacing.md },
  prescHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  rxSymbol: { fontSize: 28, color: Colors.primary },
  prescDate: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary },
  prescDoctor: { fontSize: Typography.xs, color: Colors.textSecondary },
  medRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: 4 },
  medDot: { color: Colors.primary, fontSize: Typography.base },
  medText: { flex: 1, fontSize: Typography.sm, color: Colors.textSecondary },

  consultCard: { marginBottom: Spacing.md },
  consultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  consultDate: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary },
  consultMotif: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  diagBox: { backgroundColor: Colors.lightBg, borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  diagLabel: { fontSize: Typography.xs, color: Colors.textLight, marginBottom: 2 },
  diagText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textPrimary },
  consultDoctor: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '600' },
});
