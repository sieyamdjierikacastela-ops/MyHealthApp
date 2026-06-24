// ─────────────────────────────────────────────────────────────
//  MyHealth — DoctorListScreen
//  Liste des médecins avec filtres
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { API } from '../../services/api';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import GradientHeader from '../../components/ui/GradientHeader';
import DoctorCard, { Doctor } from '../../components/ui/DoctorCard';
import { DoctorCardSkeleton } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/index';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'DoctorList'>;

const STATUS_FILTERS = [
  { label: 'Tous', value: undefined },
  { label: '🟢 Disponible', value: 'available' },
  { label: '🟠 Occupé', value: 'busy' },
];

const SORT_OPTIONS = [
  { label: 'Note ↓', value: 'rating' },
  { label: 'Prix ↑', value: 'price_asc' },
  { label: 'Expérience', value: 'experience' },
];

export default function DoctorListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { speciality_id, speciality_name } = route.params || {};

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filtered, setFiltered] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => { fetchDoctors(); }, []);
  useEffect(() => { applyFilters(); }, [search, statusFilter, sortBy, doctors]);

  const fetchDoctors = async () => {
    try {
      const res = await API.doctors.list({ speciality_id, status: statusFilter });
      if (res.success) setDoctors(res.data.doctors || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const applyFilters = () => {
    let result = [...doctors];

    if (search.trim()) {
      result = result.filter(d =>
        `${d.first_name} ${d.last_name}`.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter) {
      result = result.filter(d => d.status === statusFilter);
    }
    if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sortBy === 'price_asc') result.sort((a, b) => (a.consultation_fee || 0) - (b.consultation_fee || 0));
    if (sortBy === 'experience') result.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));

    setFiltered(result);
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        mode="page"
        title={speciality_name || 'Médecins'}
        subtitle={`${filtered.length} médecin${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''}`}
        onBack={() => navigation.goBack()}
        rightIcon={viewMode === 'list' ? '⊞' : '☰'}
        onRightPress={() => setViewMode(v => v === 'list' ? 'grid' : 'list')}
      >
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un médecin..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </GradientHeader>

      {/* Filtres statut */}
      <View style={styles.filtersBar}>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={item => item.label}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, statusFilter === item.value && styles.filterChipActive]}
              onPress={() => setStatusFilter(item.value)}
            >
              <Text style={[styles.filterText, statusFilter === item.value && styles.filterTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
        {/* Tri */}
        <View style={styles.sortWrapper}>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.sortChip, sortBy === opt.value && styles.sortChipActive]}
              onPress={() => setSortBy(opt.value)}
            >
              <Text style={[styles.sortText, sortBy === opt.value && styles.sortTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Liste */}
      {loading ? (
        <View style={styles.listContent}>
          {[1, 2, 3].map(i => <DoctorCardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          ListEmptyComponent={
            <EmptyState
              icon="👨‍⚕️"
              title="Aucun médecin trouvé"
              subtitle="Essayez de modifier vos filtres"
            />
          }
          renderItem={({ item }) => (
            <View style={viewMode === 'grid' ? styles.gridItem : styles.listItem}>
              <DoctorCard
                doctor={item}
                variant={viewMode === 'grid' ? 'default' : 'horizontal'}
                onPress={() => navigation.navigate('DoctorProfile', { doctor_id: item.id })}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBg },

  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.full, paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm, gap: Spacing.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', height: 44,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: Colors.white, fontSize: Typography.sm },

  filtersBar: { backgroundColor: Colors.white, ...Shadows.sm, paddingVertical: Spacing.sm },
  filtersList: { paddingHorizontal: Spacing.base, gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.full, backgroundColor: Colors.lightBg,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: Colors.white, fontWeight: '700' },

  sortWrapper: { flexDirection: 'row', gap: Spacing.xs, paddingHorizontal: Spacing.base, marginTop: 8 },
  sortChip: {
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.sm, backgroundColor: Colors.lightBg,
  },
  sortChipActive: { backgroundColor: Colors.secondaryOverlay },
  sortText: { fontSize: 11, color: Colors.textSecondary },
  sortTextActive: { color: Colors.secondary, fontWeight: '700' },

  listContent: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  listItem: {},
  gridItem: { flex: 1, maxWidth: '50%', padding: Spacing.xs },
});
