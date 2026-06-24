// ─────────────────────────────────────────────────────────────
//  MyHealth — SpecialitiesScreen
//  Grille des 87 spécialités médicales
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput,
  StyleSheet, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { API } from '../../services/api';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import GradientHeader from '../../components/ui/GradientHeader';
import SpecialityCard, { Speciality } from '../../components/ui/SpecialityCard';
import { Skeleton } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/index';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES = ['Toutes', 'Générale', 'Chirurgie', 'Spécialités', 'Pédiatrie', 'Dentaire'];

export default function SpecialitiesScreen() {
  const navigation = useNavigation<Nav>();
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [filtered, setFiltered] = useState<Speciality[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Toutes');

  useEffect(() => { fetchSpecialities(); }, []);

  useEffect(() => { applyFilter(); }, [search, activeCategory, specialities]);

  const fetchSpecialities = async () => {
    try {
      const res = await API.doctors.specialities();
      if (res.success) {
        setSpecialities(res.data.specialities || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let result = [...specialities];
    if (search.trim()) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (activeCategory !== 'Toutes') {
      result = result.filter(s => s.category === activeCategory);
    }
    setFiltered(result);
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonGrid}>
      {[...Array(12)].map((_, i) => (
        <View key={i} style={styles.skeletonItem}>
          <Skeleton width={48} height={48} borderRadius={14} style={{ marginBottom: 8 }} />
          <Skeleton width="80%" height={11} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <GradientHeader
        mode="page"
        title="Spécialités médicales"
        subtitle={`${specialities.length} spécialités disponibles`}
        onBack={() => navigation.goBack()}
      >
        {/* Barre de recherche dans le header */}
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une spécialité..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </GradientHeader>

      {/* Filtres par catégorie */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryChip, activeCategory === item && styles.categoryChipActive]}
              onPress={() => setActiveCategory(item)}
            >
              <Text style={[styles.categoryText, activeCategory === item && styles.categoryTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Grille spécialités */}
      {loading ? renderSkeleton() : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="🔍"
              title="Aucune spécialité trouvée"
              subtitle={`Aucun résultat pour "${search}"`}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <SpecialityCard
                speciality={item}
                variant="grid"
                onPress={() => navigation.navigate('DoctorList', {
                  speciality_id: item.id,
                  speciality_name: item.name,
                })}
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

  // Recherche
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.full, paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm, gap: Spacing.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    height: 44,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, color: Colors.white, fontSize: Typography.sm },
  clearBtn: { fontSize: 16, color: 'rgba(255,255,255,0.6)', padding: 4 },

  // Catégories
  categoriesWrapper: { backgroundColor: Colors.white, ...Shadows.sm },
  categories: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, gap: Spacing.sm },
  categoryChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.full, backgroundColor: Colors.lightBg,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: '500' },
  categoryTextActive: { color: Colors.white, fontWeight: '700' },

  // Grille
  grid: { padding: Spacing.sm, paddingBottom: Spacing.xxxl },
  gridItem: { flex: 1, maxWidth: '33.33%' },

  // Skeleton
  skeletonGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: Spacing.sm,
  },
  skeletonItem: {
    width: '33.33%', padding: Spacing.xs,
    alignItems: 'center', paddingVertical: Spacing.md,
  },
});
