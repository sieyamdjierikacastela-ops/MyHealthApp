// ─────────────────────────────────────────────────────────────
//  MyHealth — VideoCallScreen
//  Interface téléconsultation vidéo — Agora.io
//  HD jusqu'à 1080p, fallback 360p connexions lentes
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, StatusBar, Animated, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';
import Avatar from '../../components/ui/Avatar';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'VideoCall'>;

type CallStatus = 'connecting' | 'ringing' | 'active' | 'ended';

export default function VideoCallScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { appointment_id, doctor_name } = route.params;
  const { user } = useAuth();

  const [status, setStatus] = useState<CallStatus>('connecting');
  const [duration, setDuration] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [frontCam, setFrontCam] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState<'HD' | 'SD'>('HD');

  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const doctorInitials = doctor_name.replace('Dr. ', '').split(' ');

  useEffect(() => {
    StatusBar.setHidden(true);
    startConnection();
    startPulse();
    return () => {
      StatusBar.setHidden(false);
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  useEffect(() => {
    if (status === 'active') {
      const interval = setInterval(() => setDuration(d => d + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const startConnection = () => {
    // Simulation connexion Agora
    setTimeout(() => setStatus('ringing'), 1500);
    setTimeout(() => {
      setStatus('active');
      autoHideControls();
    }, 4000);
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  };

  const autoHideControls = () => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(
        () => setShowControls(false)
      );
    }, 5000);
  };

  const handleTap = () => {
    if (!showControls) {
      setShowControls(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
    autoHideControls();
  };

  const handleEndCall = () => {
    Alert.alert('Terminer la consultation ?', 'La session vidéo sera fermée.', [
      { text: 'Continuer', style: 'cancel' },
      {
        text: 'Terminer', style: 'destructive',
        onPress: () => {
          setStatus('ended');
          setTimeout(() => navigation.goBack(), 1500);
        },
      },
    ]);
  };

  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Fond vidéo simulé (remplacé par AgoraView en production) */}
      <TouchableOpacity style={styles.videoArea} onPress={handleTap} activeOpacity={1}>
        <View style={styles.remoteVideo}>
          {status !== 'active' ? (
            // En attente de connexion
            <View style={styles.connectingOverlay}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Avatar
                  firstName={doctorInitials[0]}
                  lastName={doctorInitials[1] || ''}
                  size={100}
                />
              </Animated.View>
              <Text style={styles.connectingName}>{doctor_name}</Text>
              <Text style={styles.connectingStatus}>
                {status === 'connecting' && '⚡ Connexion en cours...'}
                {status === 'ringing' && '📞 Appel en cours...'}
                {status === 'ended' && '📵 Consultation terminée'}
              </Text>
              {status !== 'ended' && (
                <View style={styles.connectingDots}>
                  {[0, 1, 2].map(i => (
                    <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.25 }]} />
                  ))}
                </View>
              )}
            </View>
          ) : (
            // Appel actif — placeholder vidéo
            <View style={styles.activeVideoPlaceholder}>
              <Text style={styles.videoPlaceholderText}>
                📹 Flux vidéo Agora.io{'\n'}(AgoraView en production)
              </Text>
            </View>
          )}
        </View>

        {/* Petite vidéo locale (coin) */}
        {status === 'active' && (
          <TouchableOpacity
            style={styles.localVideo}
            onPress={() => setFrontCam(v => !v)}
          >
            {camOn ? (
              <View style={styles.localVideoContent}>
                <Text style={styles.localVideoText}>Vous</Text>
                <Text style={styles.localVideoHint}>{frontCam ? '📷 Avant' : '📷 Arrière'}</Text>
              </View>
            ) : (
              <View style={[styles.localVideoContent, { backgroundColor: Colors.darkNavy }]}>
                <Text style={{ fontSize: 24 }}>📵</Text>
                <Text style={styles.localVideoText}>Caméra off</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* HUD en haut */}
      {showControls && status === 'active' && (
        <Animated.View style={[styles.topHud, { opacity: fadeAnim }]}>
          <View style={styles.topHudLeft}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>EN DIRECT</Text>
            </View>
            <Text style={styles.timerText}>{formatDuration(duration)}</Text>
          </View>
          <View style={[styles.qualityBadge, { backgroundColor: quality === 'HD' ? Colors.primary : Colors.warning }]}>
            <Text style={styles.qualityText}>{quality}</Text>
          </View>
        </Animated.View>
      )}

      {/* Nom médecin */}
      {status === 'active' && showControls && (
        <Animated.View style={[styles.doctorLabel, { opacity: fadeAnim }]}>
          <Text style={styles.doctorLabelText}>{doctor_name}</Text>
          <Text style={styles.doctorLabelSub}>Téléconsultation · MyHealth</Text>
        </Animated.View>
      )}

      {/* Contrôles en bas */}
      {showControls && (
        <Animated.View style={[styles.controls, { opacity: fadeAnim }]}>
          {/* Ligne 1 : contrôles secondaires */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setSpeakerOn(v => !v)}
            >
              <Text style={styles.controlIcon}>{speakerOn ? '🔊' : '🔇'}</Text>
              <Text style={styles.controlLabel}>{speakerOn ? 'Haut-parleur' : 'Muet'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setFrontCam(v => !v)}
            >
              <Text style={styles.controlIcon}>🔄</Text>
              <Text style={styles.controlLabel}>Retourner</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn}>
              <Text style={styles.controlIcon}>📋</Text>
              <Text style={styles.controlLabel}>Dossier</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn}>
              <Text style={styles.controlIcon}>💬</Text>
              <Text style={styles.controlLabel}>Chat</Text>
            </TouchableOpacity>
          </View>

          {/* Ligne 2 : contrôles principaux */}
          <View style={styles.mainControls}>
            {/* Micro */}
            <TouchableOpacity
              style={[styles.mainControlBtn, !micOn && styles.mainControlBtnOff]}
              onPress={() => setMicOn(v => !v)}
            >
              <Text style={styles.mainControlIcon}>{micOn ? '🎙️' : '🔇'}</Text>
            </TouchableOpacity>

            {/* Fin d'appel */}
            <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
              <Text style={styles.endCallIcon}>📵</Text>
            </TouchableOpacity>

            {/* Caméra */}
            <TouchableOpacity
              style={[styles.mainControlBtn, !camOn && styles.mainControlBtnOff]}
              onPress={() => setCamOn(v => !v)}
            >
              <Text style={styles.mainControlIcon}>{camOn ? '📹' : '📷'}</Text>
            </TouchableOpacity>
          </View>

          {/* Durée max */}
          <Text style={styles.durationNote}>
            Durée maximum : 60 min · {formatDuration(3600 - duration)} restantes
          </Text>
        </Animated.View>
      )}

      {/* Écran de fin */}
      {status === 'ended' && (
        <View style={styles.endedOverlay}>
          <Text style={styles.endedIcon}>✅</Text>
          <Text style={styles.endedTitle}>Consultation terminée</Text>
          <Text style={styles.endedDuration}>Durée : {formatDuration(duration)}</Text>
          <Text style={styles.endedNote}>Redirection en cours...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  // Vidéo
  videoArea: { flex: 1 },
  remoteVideo: { flex: 1, backgroundColor: '#1a1a2e' },

  connectingOverlay: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg,
  },
  connectingName: { fontSize: Typography.xl, fontWeight: '700', color: Colors.white },
  connectingStatus: { fontSize: Typography.base, color: 'rgba(255,255,255,0.7)' },
  connectingDots: { flexDirection: 'row', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },

  activeVideoPlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0d1117',
  },
  videoPlaceholderText: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontSize: Typography.sm },

  // Petite vidéo locale
  localVideo: {
    position: 'absolute', top: 80, right: Spacing.base,
    width: 100, height: 140, borderRadius: Radius.md,
    backgroundColor: '#2d2d2d', overflow: 'hidden',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    ...Shadows.lg,
  },
  localVideoContent: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a2e' },
  localVideoText: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 4 },
  localVideoHint: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },

  // HUD top
  topHud: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingTop: 52, paddingBottom: Spacing.md,
    backgroundColor: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
  },
  topHudLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.danger, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.white },
  liveText: { fontSize: 11, color: Colors.white, fontWeight: '800', letterSpacing: 1 },
  timerText: { fontSize: Typography.lg, fontWeight: '700', color: Colors.white },
  qualityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  qualityText: { fontSize: 11, color: Colors.white, fontWeight: '700' },

  // Nom médecin
  doctorLabel: {
    position: 'absolute', bottom: 200, left: Spacing.base,
  },
  doctorLabelText: { fontSize: Typography.base, fontWeight: '700', color: Colors.white, ...Shadows.lg },
  doctorLabelSub: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  // Contrôles
  controls: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(13,33,55,0.92)',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.lg,
    gap: Spacing.md, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
  },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  controlBtn: { alignItems: 'center', gap: 4 },
  controlIcon: { fontSize: 24 },
  controlLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },

  mainControls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.xl },
  mainControlBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  mainControlBtnOff: { backgroundColor: Colors.danger },
  mainControlIcon: { fontSize: 26 },
  endCallBtn: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: Colors.danger, alignItems: 'center',
    justifyContent: 'center', ...Shadows.danger,
  },
  endCallIcon: { fontSize: 30 },
  durationNote: { textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.4)' },

  // Fin d'appel
  endedOverlay: {
    position: 'absolute', inset: 0,
    backgroundColor: Colors.darkNavy,
    alignItems: 'center', justifyContent: 'center', gap: Spacing.md,
  },
  endedIcon: { fontSize: 60 },
  endedTitle: { fontSize: Typography.xl, fontWeight: '700', color: Colors.white },
  endedDuration: { fontSize: Typography.base, color: Colors.primary, fontWeight: '600' },
  endedNote: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.5)', marginTop: Spacing.lg },
});
