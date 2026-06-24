// ─────────────────────────────────────────────────────────────
//  MyHealth — ChatRoomScreen
//  Messagerie chiffrée E2EE médecin-patient
//  Connectée au Socket.io de Sindze (port 5000)
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import io, { Socket } from 'socket.io-client';
import { RootStackParamList } from '../../navigation/types';
import { API, BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import Avatar from '../../components/ui/Avatar';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ChatRoom'>;

interface Message {
  id: number;
  sender_id: number;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice';
  sent_at: string;
  read_at?: string;
}

function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({ msg, isMe, showTime }: {
  msg: Message; isMe: boolean; showTime: boolean;
}) {
  return (
    <View style={[styles.bubbleWrapper, isMe && styles.bubbleWrapperMe]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        {msg.type === 'text' && (
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
            {msg.content}
          </Text>
        )}
        {msg.type === 'file' && (
          <View style={styles.fileMsg}>
            <Text style={styles.fileIcon}>📎</Text>
            <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{msg.content}</Text>
          </View>
        )}
        <View style={styles.bubbleMeta}>
          <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
            {formatMessageTime(msg.sent_at)}
          </Text>
          {isMe && (
            <Text style={styles.readStatus}>
              {msg.read_at ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const MOCK_MESSAGES: Message[] = [
  { id: 1, sender_id: 2, content: 'Bonjour ! Comment vous sentez-vous aujourd\'hui ?', type: 'text', sent_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, sender_id: 1, content: 'Bonjour Docteur. J\'ai encore des maux de tête depuis hier soir.', type: 'text', sent_at: new Date(Date.now() - 3540000).toISOString() },
  { id: 3, sender_id: 2, content: 'D\'accord. Avez-vous pris le paracétamol que j\'ai prescrit ?', type: 'text', sent_at: new Date(Date.now() - 3500000).toISOString() },
  { id: 4, sender_id: 1, content: 'Oui, ce matin vers 8h. La douleur a diminué mais n\'est pas totalement partie.', type: 'text', sent_at: new Date(Date.now() - 3480000).toISOString() },
  { id: 5, sender_id: 2, content: 'Voici votre ordonnance mise à jour.', type: 'file', sent_at: new Date(Date.now() - 600000).toISOString(), read_at: new Date().toISOString() },
  { id: 6, sender_id: 2, content: 'Prenez le médicament matin et soir pendant 7 jours.', type: 'text', sent_at: new Date(Date.now() - 580000).toISOString(), read_at: new Date().toISOString() },
];

export default function ChatRoomScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { chat_id, doctor_name, doctor_avatar } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
    connectSocket();
    return () => { socketRef.current?.disconnect(); };
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await API.chat.messages(chat_id);
      if (res.success && res.data.messages?.length > 0) {
        setMessages(res.data.messages);
      }
      await API.chat.markRead(chat_id);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const connectSocket = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const socket = io(BASE_URL.replace('/api', ''), {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('connect', () => setConnected(true));
      socket.on('disconnect', () => setConnected(false));

      socket.on('new_message', (msg: Message) => {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      });

      socket.on('typing', ({ sender_id }: { sender_id: number }) => {
        if (sender_id !== user?.id) {
          setTyping(true);
          setTimeout(() => setTyping(false), 3000);
        }
      });

      socket.emit('join_chat', { chat_id });
      socketRef.current = socket;
    } catch (e) { console.error(e); }
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);

    // Message optimiste
    const tempMsg: Message = {
      id: Date.now(), sender_id: user?.id || 0,
      content, type: 'text', sent_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();

    try {
      const res = await API.chat.send(chat_id, content);
      if (res.success) {
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.data.message : m));
      }
    } catch (e) {
      Alert.alert('Erreur', 'Message non envoyé. Vérifiez votre connexion.');
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setText(content);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (value: string) => {
    setText(value);
    socketRef.current?.emit('typing', { chat_id, sender_id: user?.id });
  };

  const scrollToBottom = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const doctorInitials = doctor_name.replace('Dr. ', '').split(' ');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Avatar
            uri={doctor_avatar}
            firstName={doctorInitials[0]}
            lastName={doctorInitials[1] || ''}
            size={40}
            online={connected}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerName} numberOfLines={1}>{doctor_name}</Text>
            <Text style={styles.headerStatus}>
              {typing ? '✍️ En train d\'écrire...' : connected ? '🟢 En ligne' : '⚪ Hors ligne'}
            </Text>
          </View>
        </View>

        {/* Bouton appel vidéo */}
        <TouchableOpacity
          style={styles.videoBtn}
          onPress={() => navigation.navigate('VideoCall' as any, {
            appointment_id: chat_id,
            doctor_name,
          })}
        >
          <Text style={styles.videoBtnIcon}>📹</Text>
        </TouchableOpacity>
      </View>

      {/* Badge E2EE */}
      <View style={styles.e2eeBadge}>
        <Text style={styles.e2eeText}>🔒 Messages chiffrés de bout en bout</Text>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View style={styles.loadingMessages}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
            renderItem={({ item, index }) => (
              <MessageBubble
                msg={item}
                isMe={item.sender_id === user?.id}
                showTime={index === messages.length - 1}
              />
            )}
            ListFooterComponent={
              typing ? (
                <View style={styles.typingBubble}>
                  <View style={styles.typingDot} />
                  <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
                  <View style={[styles.typingDot, { animationDelay: '0.4s' }]} />
                </View>
              ) : null
            }
          />
        )}

        {/* Zone de saisie */}
        <View style={styles.inputBar}>
          {/* Bouton pièce jointe */}
          <TouchableOpacity style={styles.attachBtn}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Votre message..."
              placeholderTextColor={Colors.textLight}
              value={text}
              onChangeText={handleTyping}
              multiline
              maxLength={1000}
              returnKeyType="default"
            />
          </View>

          {/* Bouton envoi */}
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.darkNavy,
    paddingHorizontal: Spacing.base,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 20, color: Colors.white },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerText: { flex: 1 },
  headerName: { fontSize: Typography.base, fontWeight: '700', color: Colors.white },
  headerStatus: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  videoBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary, alignItems: 'center',
    justifyContent: 'center',
  },
  videoBtnIcon: { fontSize: 18 },

  // E2EE
  e2eeBadge: {
    backgroundColor: Colors.primaryOverlay,
    alignItems: 'center', paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  e2eeText: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '600' },

  // Messages
  loadingMessages: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messagesList: { padding: Spacing.base, paddingBottom: Spacing.md },

  // Bubbles
  bubbleWrapper: {
    flexDirection: 'row', marginBottom: Spacing.sm,
    justifyContent: 'flex-start',
  },
  bubbleWrapperMe: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '78%', borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    ...Shadows.sm,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: Typography.base, color: Colors.textPrimary, lineHeight: 22 },
  bubbleTextMe: { color: Colors.white },
  fileMsg: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  fileIcon: { fontSize: 20 },
  bubbleMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 },
  bubbleTime: { fontSize: 11, color: Colors.textLight },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.7)' },
  readStatus: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },

  // Typing
  typingBubble: {
    flexDirection: 'row', gap: 4, alignItems: 'center',
    backgroundColor: Colors.white, alignSelf: 'flex-start',
    borderRadius: Radius.lg, padding: Spacing.md,
    marginBottom: Spacing.sm, ...Shadows.sm,
  },
  typingDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.textLight,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: Colors.white, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, gap: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 28 : Spacing.sm,
  },
  attachBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.lightBg, alignItems: 'center',
    justifyContent: 'center',
  },
  attachIcon: { fontSize: 20 },
  inputWrapper: {
    flex: 1, backgroundColor: Colors.lightBg,
    borderRadius: Radius.xl, paddingHorizontal: Spacing.md,
    paddingVertical: 10, minHeight: 44, maxHeight: 120,
    justifyContent: 'center',
  },
  input: { fontSize: Typography.base, color: Colors.textPrimary, maxHeight: 100 },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary, alignItems: 'center',
    justifyContent: 'center', ...Shadows.primary,
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
  sendIcon: { fontSize: 18, color: Colors.white, marginLeft: 2 },
});
