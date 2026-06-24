// ─────────────────────────────────────────────────────────────
//  MyHealth — ChatListScreen
//  Liste de toutes les conversations médecin-patient
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { API } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import GradientHeader from '../../components/ui/GradientHeader';
import Avatar from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/index';
import { Skeleton } from '../../components/ui/Loading';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Chat {
  id: number;
  doctor_id: number;
  patient_id: number;
  doctor_first_name: string;
  doctor_last_name: string;
  doctor_avatar?: string;
  doctor_speciality?: string;
  patient_first_name: string;
  patient_last_name: string;
  last_message: string;
  last_activity: string;
  unread_count?: number;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const MOCK_CHATS: Chat[] = [
  { id: 1, doctor_id: 1, patient_id: 1, doctor_first_name: 'Kamga', doctor_last_name: 'Nkou', doctor_speciality: 'Cardiologie', patient_first_name: 'Marie', patient_last_name: 'Dupont', last_message: 'Prenez le médicament matin et soir pendant 7 jours.', last_activity: new Date().toISOString(), unread_count: 2 },
  { id: 2, doctor_id: 2, patient_id: 1, doctor_first_name: 'Essomba', doctor_last_name: 'Marie', doctor_speciality: 'Gynécologie', patient_first_name: 'Marie', patient_last_name: 'Dupont', last_message: 'Votre prochain RDV est confirmé pour le 1er juillet.', last_activity: new Date(Date.now() - 86400000).toISOString(), unread_count: 0 },
  { id: 3, doctor_id: 3, patient_id: 1, doctor_first_name: 'Mbida', doctor_last_name: 'Paul', doctor_speciality: 'Médecine générale', patient_first_name: 'Marie', patient_last_name: 'Dupont', last_message: 'Les résultats d\'analyses sont normaux.', last_activity: new Date(Date.now() - 172800000).toISOString(), unread_count: 0 },
];

export default function ChatListScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [filtered, setFiltered] = useState<Chat[]>(MOCK_CHATS);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchChats(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(chats); return; }
    const q = search.toLowerCase();
    setFiltered(chats.filter(c =>
      `${c.doctor_first_name} ${c.doctor_last_name}`.toLowerCase().includes(q) ||
      c.last_message.toLowerCase().includes(q)
    ));
  }, [search, chats]);

  const fetchChats = async () => {
    try {
      const res = await API.chat.list();
      if (res.success && res.data.chats?.length > 0) setChats(res.data.chats);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChats();
    setRefreshing(false);
  };

  const totalUnread = chats.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  const renderChat = ({ item: chat }: { item: Chat }) => {
    const isDoctor = user?.role === 'doctor';
    const name = isDoctor
      ? `${chat.patient_first_name} ${chat.patient_last_name}`
      : `Dr. ${chat.doctor_first_name} ${chat.doctor_last_name}`;
    const subtitle = isDoctor ? 'Patient' : chat.doctor_speciality || 'Médecin';
    const hasUnread = (chat.unread_count || 0) > 0;

    return (
      <TouchableOpacity
        style={[styles.chatItem, hasUnread && styles.chatItemUnread]}
        onPress={() => {
          navigation.navigate('ChatRoom', {
            chat_id: chat.id,
            doctor_name: `Dr. ${chat.doctor_first_name} ${chat.doctor_last_name}`,
            doctor_avatar: chat.doctor_avatar,
          });
        }}
        activeOpacity={0.85}
      >
        <View style={styles.avatarWrapper}>
          <Avatar
            firstName={isDoctor ? chat.patient_first_name : chat.doctor_first_name}
            lastName={isDoctor ? chat.patient_last_name : chat.doctor_last_name}
            uri={chat.doctor_avatar}
            size={52}
            online={Math.random() > 0.5}
          />
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatTop}>
            <Text style={[styles.chatName, hasUnread && styles.chatNameBold]} numberOfLines={1}>
              {name}
            </Text>
            <Text style={[styles.chatTime, hasUnread && styles.chatTimeBold]}>
              {formatTime(chat.last_activity)}
            </Text>
          </View>
          <View style={styles.chatBottom}>
            <Text style={[styles.chatSubtitle, hasUnread && styles.chatSubtitleBold]} numberOfLines={1}>
              {chat.last_message}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{chat.unread_count}</Text>
              </View>
            )}
          </View>
          <Text style={styles.speciality}>{subtitle}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        mode="page"
        title="Messages"
        subtitle={totalUnread > 0 ? `${totalUnread} non lu${totalUnread > 1 ? 's' : ''}` : `${chats.length} conversation${chats.length > 1 ? 's' : ''}`}
      >
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une conversation..."
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

      {/* Chiffrement E2EE */}
      <View style={styles.e2eeBanner}>
        <Text style={styles.e2eeIcon}>🔒</Text>
        <Text style={styles.e2eeText}>Messages chiffrés de bout en bout</Text>
      </View>

      {loading ? (
        <View style={styles.list}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.skeletonItem}>
              <Skeleton width={52} height={52} borderRadius={26} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton width="60%" height={13} />
                <Skeleton width="85%" height={11} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <EmptyState
              icon="💬"
              title="Aucun message"
              subtitle="Consultez un médecin pour démarrer une conversation"
              actionLabel="Trouver un médecin"
              onAction={() => navigation.navigate('Specialities')}
            />
          }
          renderItem={renderChat}
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
  clearBtn: { fontSize: 16, color: 'rgba(255,255,255,0.6)', padding: 4 },

  e2eeBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, backgroundColor: Colors.primaryOverlay,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  e2eeIcon: { fontSize: 14 },
  e2eeText: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '600' },

  list: { paddingBottom: Spacing.xxxl, backgroundColor: Colors.white },

  chatItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
  },
  chatItemUnread: { backgroundColor: `${Colors.primary}06` },
  avatarWrapper: { marginRight: Spacing.md },
  chatContent: { flex: 1 },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  chatName: { flex: 1, fontSize: Typography.base, color: Colors.textPrimary, fontWeight: '500', marginRight: Spacing.sm },
  chatNameBold: { fontWeight: '700' },
  chatTime: { fontSize: Typography.xs, color: Colors.textLight },
  chatTimeBold: { color: Colors.primary, fontWeight: '600' },
  chatBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chatSubtitle: { flex: 1, fontSize: Typography.sm, color: Colors.textSecondary, marginRight: Spacing.sm },
  chatSubtitleBold: { color: Colors.textPrimary, fontWeight: '600' },
  speciality: { fontSize: Typography.xs, color: Colors.textLight, marginTop: 2 },
  unreadBadge: {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.primary, alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 5,
  },
  unreadText: { fontSize: 11, color: Colors.white, fontWeight: '700' },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 52 + Spacing.base * 2 },

  skeletonItem: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.md, padding: Spacing.base,
  },
});
