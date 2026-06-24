// ─────────────────────────────────────────────────────────────
//  MyHealth — Loading & Skeleton
//  Écran de chargement + squelettes animés
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import {
  View, Text, Animated, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../theme';

// ════════════════════════════════════════════════════════════
//  SKELETON — Placeholder animé pendant le chargement
// ════════════════════════════════════════════════════════════
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = Radius.sm, style }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: Colors.border, opacity },
        style,
      ]}
    />
  );
}

// ── Skeleton DoctorCard ───────────────────────────────────────
export function DoctorCardSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonRow}>
        <Skeleton width={64} height={64} borderRadius={32} />
        <View style={styles.skeletonContent}>
          <Skeleton width="70%" height={14} style={styles.mb8} />
          <Skeleton width="50%" height={11} style={styles.mb8} />
          <Skeleton width="40%" height={10} />
        </View>
      </View>
    </View>
  );
}

// ── Skeleton Appointment ──────────────────────────────────────
export function AppointmentSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonRow}>
        <Skeleton width={52} height={52} borderRadius={26} />
        <View style={styles.skeletonContent}>
          <Skeleton width="60%" height={14} style={styles.mb8} />
          <Skeleton width="45%" height={11} style={styles.mb8} />
          <Skeleton width="80%" height={10} />
        </View>
      </View>
      <View style={[styles.skeletonRow, { marginTop: Spacing.md }]}>
        <Skeleton width="30%" height={36} borderRadius={Radius.full} />
        <Skeleton width="25%" height={36} borderRadius={Radius.full} />
      </View>
    </View>
  );
}

// ════════════════════════════════════════════════════════════
//  LOADING SCREEN — Écran de chargement plein écran
// ════════════════════════════════════════════════════════════
interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Chargement...' }: LoadingScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.loadingScreen}>
      <Animated.View style={[styles.loadingContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.loadingLogo}>
          <Text style={styles.loadingLogoText}>💚</Text>
        </View>
        <Text style={styles.loadingBrand}>MyHealth</Text>
        <ActivityIndicator color={Colors.primary} size="small" style={styles.loadingSpinner} />
        <Text style={styles.loadingMessage}>{message}</Text>
      </Animated.View>
    </View>
  );
}

// ════════════════════════════════════════════════════════════
//  INLINE LOADER — Petit loader dans une section
// ════════════════════════════════════════════════════════════
export function InlineLoader({ message }: { message?: string }) {
  return (
    <View style={styles.inlineLoader}>
      <ActivityIndicator color={Colors.primary} size="small" />
      {message && <Text style={styles.inlineMessage}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Skeleton ──
  skeletonCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  skeletonRow: { flexDirection: 'row', gap: Spacing.md },
  skeletonContent: { flex: 1, gap: 0 },
  mb8: { marginBottom: 8 },

  // ── Loading Screen ──
  loadingScreen: {
    flex: 1, backgroundColor: Colors.lightBg,
    alignItems: 'center', justifyContent: 'center',
  },
  loadingContent: { alignItems: 'center' },
  loadingLogo: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  loadingLogoText: { fontSize: 40 },
  loadingBrand: {
    fontSize: Typography.xxl, fontWeight: '800',
    color: Colors.textPrimary, marginBottom: Spacing.xl,
  },
  loadingSpinner: { marginBottom: Spacing.md },
  loadingMessage: { fontSize: Typography.sm, color: Colors.textSecondary },

  // ── Inline Loader ──
  inlineLoader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: Spacing.sm,
    padding: Spacing.xl,
  },
  inlineMessage: { fontSize: Typography.sm, color: Colors.textSecondary },
});
