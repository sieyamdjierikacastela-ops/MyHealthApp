// ─────────────────────────────────────────────────────────────
//  MyHealth — MapScreen
//  Carte interactive — hôpitaux, pharmacies, ambulances
//  Google Maps API + géolocalisation temps réel
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Platform, Alert, ActivityIndicator, FlatList,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { API } from '../../services/api';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import SOSButton from '../../components/ui/SOSButton';
import { useAuth } from '../../context/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type FilterType = 'all' | 'hospitals' | 'pharmacies' | 'ambulances';

interface NearbyPlace {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  type: 'hospital' | 'pharmacy' | 'ambulance';
  is_open_24h?: boolean;
  delivery_available?: boolean;
  ambulances_free?: number;
  distance?: number;
}

const FILTER_CONFIG = {
  all: { label: 'Tout', icon: '🗺️', color: Colors.primary },
  hospitals: { label: 'Hôpitaux', icon: '🏥', color: Colors.danger },
  pharmacies: { label: 'Pharmacies', icon: '💊', color: Colors.secondary },
  ambulances: { label: 'Ambulances', icon: '🚑', color: Colors.warning },
};

const MARKER_COLORS = {
  hospital: Colors.danger,
  pharmacy: Colors.secondary,
  ambulance: Colors.warning,
};

// Données mock — remplacées par API quand Sindze livre
const MOCK_PLACES: NearbyPlace[] = [
  { id: 1, name: 'CHU de Yaoundé', address: 'Av. Henri Dunant, Yaoundé', lat: 3.8667, lng: 11.5167, phone: '222 23 40 01', type: 'hospital', is_open_24h: true, ambulances_free: 3, distance: 1.2 },
  { id: 2, name: 'Hôpital Central', address: 'Rue Henri Dunant, Yaoundé', lat: 3.8612, lng: 11.5143, phone: '222 22 11 11', type: 'hospital', is_open_24h: true, ambulances_free: 1, distance: 1.8 },
  { id: 3, name: 'Pharmacie du Marché', address: 'Marché central, Yaoundé', lat: 3.8688, lng: 11.5231, phone: '699 111 222', type: 'pharmacy', is_open_24h: false, delivery_available: true, distance: 0.6 },
  { id: 4, name: 'Pharmacie de Garde Mvog-Ada', address: 'Mvog-Ada, Yaoundé', lat: 3.8550, lng: 11.5300, phone: '699 333 444', type: 'pharmacy', is_open_24h: true, delivery_available: false, distance: 2.1 },
  { id: 5, name: 'Clinique Hilac', address: 'Bastos, Yaoundé', lat: 3.8800, lng: 11.5050, phone: '222 20 15 15', type: 'hospital', is_open_24h: false, ambulances_free: 0, distance: 3.4 },
];

export default function MapScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>(MOCK_PLACES);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [sosActive, setSosActive] = useState(false);
  const [showList, setShowList] = useState(false);

  useEffect(() => { requestLocation(); }, []);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La géolocalisation est nécessaire pour trouver les établissements proches.');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      fetchNearby(loc.coords.latitude, loc.coords.longitude);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchNearby = async (lat: number, lng: number) => {
    try {
      const [hospitalsRes, pharmaciesRes] = await Promise.all([
        API.location.hospitalsNearby(lat, lng),
        API.location.pharmaciesNearby(lat, lng),
      ]);
      const allPlaces: NearbyPlace[] = [
        ...(hospitalsRes.success ? hospitalsRes.data.hospitals : []),
        ...(pharmaciesRes.success ? pharmaciesRes.data.pharmacies : []),
      ];
      if (allPlaces.length > 0) setPlaces(allPlaces);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSOS = async () => {
    if (!location) {
      Alert.alert('Localisation introuvable', 'Activez votre GPS pour déclencher l\'alerte SOS.');
      return;
    }
    if (sosActive) {
      setSosActive(false);
      Alert.alert('SOS annulé', 'L\'alerte d\'urgence a été annulée.');
      return;
    }
    Alert.alert(
      '🚨 ALERTE SOS',
      'Votre position GPS et vos informations médicales vont être envoyées aux secours. Confirmer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'ENVOYER SOS', style: 'destructive',
          onPress: async () => {
            setSosActive(true);
            await API.emergency.sos(location.latitude, location.longitude);
            navigation.navigate('Emergency');
          },
        },
      ]
    );
  };

  const filteredPlaces = places.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'hospitals') return p.type === 'hospital';
    if (filter === 'pharmacies') return p.type === 'pharmacy';
    if (filter === 'ambulances') return p.type === 'hospital' && (p.ambulances_free || 0) > 0;
    return true;
  });

  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        ...location, latitudeDelta: 0.02, longitudeDelta: 0.02,
      }, 800);
    }
  };

  const initialRegion = location
    ? { ...location, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : { latitude: 3.8667, longitude: 11.5167, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  return (
    <View style={styles.container}>
      {/* Carte */}
      {loading ? (
        <View style={styles.loadingMap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Localisation en cours...</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton={false}
          customMapStyle={mapStyle}
        >
          {/* Rayon autour de l'utilisateur */}
          {location && (
            <Circle
              center={location}
              radius={3000}
              fillColor="rgba(0,200,150,0.05)"
              strokeColor="rgba(0,200,150,0.3)"
              strokeWidth={1}
            />
          )}

          {/* Markers */}
          {filteredPlaces.map(place => (
            <Marker
              key={`${place.type}-${place.id}`}
              coordinate={{ latitude: place.lat, longitude: place.lng }}
              onPress={() => setSelectedPlace(place)}
            >
              <View style={[styles.markerPin, { backgroundColor: MARKER_COLORS[place.type] }]}>
                <Text style={styles.markerIcon}>
                  {place.type === 'hospital' ? '🏥' : '💊'}
                </Text>
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      {/* Filtres en haut */}
      <View style={styles.filtersOverlay}>
        {(Object.keys(FILTER_CONFIG) as FilterType[]).map(key => {
          const cfg = FILTER_CONFIG[key];
          return (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, filter === key && { backgroundColor: cfg.color }]}
              onPress={() => setFilter(key)}
            >
              <Text style={styles.filterIcon}>{cfg.icon}</Text>
              <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>{cfg.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bouton centrer sur moi */}
      <TouchableOpacity style={styles.myLocationBtn} onPress={centerOnUser}>
        <Text style={styles.myLocationIcon}>📍</Text>
      </TouchableOpacity>

      {/* Bouton liste */}
      <TouchableOpacity style={styles.listBtn} onPress={() => setShowList(v => !v)}>
        <Text style={styles.listBtnText}>{showList ? '🗺️ Carte' : '☰ Liste'}</Text>
      </TouchableOpacity>

      {/* Fiche établissement sélectionné */}
      {selectedPlace && !showList && (
        <View style={styles.placeCard}>
          <View style={styles.placeCardHeader}>
            <Text style={styles.placeIcon}>
              {selectedPlace.type === 'hospital' ? '🏥' : '💊'}
            </Text>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName} numberOfLines={1}>{selectedPlace.name}</Text>
              <Text style={styles.placeAddress} numberOfLines={1}>{selectedPlace.address}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedPlace(null)}>
              <Text style={styles.closePlaceBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.placeDetails}>
            {selectedPlace.distance && (
              <View style={styles.placeDetail}>
                <Text style={styles.placeDetailIcon}>📏</Text>
                <Text style={styles.placeDetailText}>{selectedPlace.distance} km</Text>
              </View>
            )}
            {selectedPlace.is_open_24h !== undefined && (
              <View style={styles.placeDetail}>
                <Text style={styles.placeDetailIcon}>🕐</Text>
                <Text style={[styles.placeDetailText, { color: selectedPlace.is_open_24h ? Colors.primary : Colors.danger }]}>
                  {selectedPlace.is_open_24h ? 'Ouvert 24h/24' : 'Horaires limités'}
                </Text>
              </View>
            )}
            {selectedPlace.type === 'hospital' && selectedPlace.ambulances_free !== undefined && (
              <View style={styles.placeDetail}>
                <Text style={styles.placeDetailIcon}>🚑</Text>
                <Text style={[styles.placeDetailText, { color: selectedPlace.ambulances_free > 0 ? Colors.primary : Colors.danger }]}>
                  {selectedPlace.ambulances_free} ambulance{selectedPlace.ambulances_free > 1 ? 's' : ''} libre{selectedPlace.ambulances_free > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
          {selectedPlace.phone && (
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callBtnText}>📞 Appeler {selectedPlace.phone}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Vue liste */}
      {showList && (
        <View style={styles.listOverlay}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{filteredPlaces.length} établissements proches</Text>
            <TouchableOpacity onPress={() => setShowList(false)}>
              <Text style={styles.listClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredPlaces}
            keyExtractor={item => `${item.type}-${item.id}`}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setSelectedPlace(item);
                  setShowList(false);
                  mapRef.current?.animateToRegion({ latitude: item.lat, longitude: item.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 800);
                }}
              >
                <View style={[styles.listItemIcon, { backgroundColor: `${MARKER_COLORS[item.type]}18` }]}>
                  <Text style={{ fontSize: 22 }}>{item.type === 'hospital' ? '🏥' : '💊'}</Text>
                </View>
                <View style={styles.listItemInfo}>
                  <Text style={styles.listItemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.listItemAddress} numberOfLines={1}>{item.address}</Text>
                  <View style={styles.listItemMeta}>
                    {item.distance && <Text style={styles.listItemDist}>📏 {item.distance} km</Text>}
                    {item.is_open_24h && <Text style={styles.listItemOpen}>🟢 24h/24</Text>}
                    {item.type === 'hospital' && item.ambulances_free !== undefined && (
                      <Text style={[styles.listItemAmb, { color: item.ambulances_free > 0 ? Colors.primary : Colors.danger }]}>
                        🚑 {item.ambulances_free} libre{item.ambulances_free > 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={styles.listItemArrow}>›</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Bouton SOS */}
      <View style={styles.sosWrapper}>
        <SOSButton onPress={handleSOS} size={80} active={sosActive} />
      </View>
    </View>
  );
}

// Style Google Maps personnalisé (tons sombres MyHealth)
const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9d8e8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5f0e5' }] },
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingMap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.lightBg, gap: Spacing.md },
  loadingText: { fontSize: Typography.base, color: Colors.textSecondary },

  // Filtres
  filtersOverlay: {
    position: 'absolute', top: 56, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center',
    gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingTop: Spacing.md,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.white, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    ...Shadows.md,
  },
  filterIcon: { fontSize: 14 },
  filterText: { fontSize: Typography.xs, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },

  // Boutons flottants
  myLocationBtn: {
    position: 'absolute', top: 120, right: Spacing.base,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.white, alignItems: 'center',
    justifyContent: 'center', ...Shadows.md,
  },
  myLocationIcon: { fontSize: 22 },
  listBtn: {
    position: 'absolute', top: 120, left: Spacing.base,
    backgroundColor: Colors.white, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 10, ...Shadows.md,
  },
  listBtnText: { fontSize: Typography.sm, fontWeight: '700', color: Colors.textPrimary },

  // Marker
  markerPin: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: Colors.white, ...Shadows.md,
  },
  markerIcon: { fontSize: 20 },

  // Fiche établissement
  placeCard: {
    position: 'absolute', bottom: 120, left: Spacing.base, right: Spacing.base,
    backgroundColor: Colors.white, borderRadius: Radius.md,
    padding: Spacing.md, ...Shadows.lg,
  },
  placeCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  placeIcon: { fontSize: 28 },
  placeInfo: { flex: 1 },
  placeName: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  placeAddress: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  closePlaceBtn: { fontSize: 18, color: Colors.textLight, padding: 4 },
  placeDetails: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md, flexWrap: 'wrap' },
  placeDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  placeDetailIcon: { fontSize: 14 },
  placeDetailText: { fontSize: Typography.xs, fontWeight: '600', color: Colors.textSecondary },
  callBtn: { backgroundColor: Colors.primaryOverlay, borderRadius: Radius.full, padding: Spacing.sm, alignItems: 'center' },
  callBtnText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '700' },

  // Liste
  listOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl, maxHeight: '60%', ...Shadows.lg,
  },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border },
  listTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  listClose: { fontSize: 20, color: Colors.textLight },
  listContent: { padding: Spacing.base },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  listItemIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  listItemInfo: { flex: 1 },
  listItemName: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  listItemAddress: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 1 },
  listItemMeta: { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  listItemDist: { fontSize: 11, color: Colors.textLight },
  listItemOpen: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  listItemAmb: { fontSize: 11, fontWeight: '600' },
  listItemArrow: { fontSize: 20, color: Colors.textLight },

  // SOS
  sosWrapper: {
    position: 'absolute', bottom: Spacing.xl,
    right: Spacing.base,
  },
});
