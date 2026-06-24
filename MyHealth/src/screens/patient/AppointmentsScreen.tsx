// ─────────────────────────────────────────────────────────────
//  MyHealth — AppointmentsScreen
//  Liste de tous les rendez-vous du patient
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { API } from '../../services/api';
import { Colors, Spacing, Typography, Radius } from '../../theme';
import GradientHeader from '../../components/ui/GradientHeader';
import AppointmentCard, { Appointment } from '../../components/ui/AppointmentCard';
import { AppointmentSkeleton } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/index';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS = ['À venir', 'Passés', 'Annulés'];

export default function AppointmentsScreen() {
  const navigation = useNavigation<Nav>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.appointments.list();
      if (res.success) setAppointments(res.data.appointments || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = appointments.filter(a => {
    if (activeTab === 0) return a.status === 'pending' || a.status === 'confirmed';
    if (activeTab === 1) return a.status === 'completed';
    return a.status === 'cancelled';
  });

  return (
    <View style={styles.container}>
      <GradientHeader mode="page" title="Mes rendez-vous" subtitle={`${filtered.length} rendez-vous`} />

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab, i) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === i && styles.tabActive]} onPress={() => setActiveTab(i)}>
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.list}>{[1,2,3].map(i => <AppointmentSkeleton key={i} />)}</View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState icon="📅" title="Aucun rendez-vous" subtitle="Consultez un médecin pour prendre votre premier rendez-vous" actionLabel="Consulter" onAction={() => navigation.navigate('Specialities')} />
          }
          renderItem={({ item }) => (
            <AppointmentCard
              appointment={item}
              onPress={() => {}}
              onJoin={() => navigation.navigate('VideoCall' as any, { appointment_id: item.id, doctor_name: `Dr. ${item.doctor_first_name}` })}
              onCancel={async () => { await API.appointments.cancel(item.id); fetchAppointments(); }}
            />
          )}
        />
      )}

      {/* Bouton nouveau RDV */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Specialities')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBg },
  tabs: { flexDirection: 'row', backgroundColor: Colors.white, paddingHorizontal: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  list: { padding: Spacing.base, paddingBottom: 100 },
  fab: { position: 'absolute', bottom: Spacing.xl, right: Spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  fabText: { fontSize: 28, color: Colors.white, fontWeight: '300' },
});
