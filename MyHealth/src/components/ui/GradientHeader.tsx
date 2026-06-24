// ─────────────────────────────────────────────────────────────
//  MyHealth — GradientHeader
//  En-tête avec fond dégradé teal/navy pour les écrans principaux
//  (Sans expo-linear-gradient pour compatibilité maximale)
// ─────────────────────────────────────────────────────────────

import React, { ReactNode } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Platform, StatusBar,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import Avatar from './Avatar';

interface GradientHeaderProps {
  // Mode "home" — salutation utilisateur
  mode?: 'home' | 'page' | 'profile';
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  // Pour le mode home
  userName?: string;
  userAvatar?: string;
  userRole?: 'patient' | 'doctor';
  children?: ReactNode;   // contenu additionnel dans le header
}

export default function GradientHeader({
  mode = 'page', title, subtitle, onBack, rightIcon, onRightPress,
  userName, userAvatar, userRole, children,
}: GradientHeaderProps) {

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;

  // ── Mode Home — salutation + avatar ──────────────────────
  if (mode === 'home') {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
    const emoji = hour < 12 ? '🌤️' : hour < 18 ? '☀️' : '🌙';

    return (
      <View style={[styles.container, { paddingTop: statusBarHeight + Spacing.md }]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.darkNavy} />

        {/* Cercles décoratifs */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.homeContent}>
          <View style={styles.homeTop}>
            <View style={styles.greetingBlock}>
              <Text style={styles.greeting}>{emoji} {greeting},</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {userName || 'Utilisateur'} 👋
              </Text>
              {userRole && (
                <Text style={styles.userRole}>
                  {userRole === 'doctor' ? '🩺 Médecin' : '👤 Patient'}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onRightPress}>
              <Avatar
                uri={userAvatar}
                firstName={userName?.split(' ')[0]}
                lastName={userName?.split(' ')[1]}
                size={52}
              />
            </TouchableOpacity>
          </View>

          {/* Barre de recherche décorative */}
          <TouchableOpacity style={styles.searchBar} onPress={onRightPress} activeOpacity={0.85}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Rechercher un médecin, une spécialité...</Text>
          </TouchableOpacity>

          {children}
        </View>
      </View>
    );
  }

  // ── Mode Page — titre + bouton retour ────────────────────
  return (
    <View style={[styles.pageContainer, { paddingTop: statusBarHeight + Spacing.sm }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkNavy} />
      <View style={styles.circle1} />

      <View style={styles.pageContent}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.pageTitles}>
          {title && <Text style={styles.pageTitle}>{title}</Text>}
          {subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
        </View>
        {rightIcon ? (
          <TouchableOpacity style={styles.backBtn} onPress={onRightPress}>
            <Text style={styles.backIcon}>{rightIcon}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkNavy,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    overflow: 'hidden',
  },
  pageContainer: {
    backgroundColor: Colors.darkNavy,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
    overflow: 'hidden',
  },

  // ── Cercles décoratifs ──
  circle1: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 100, backgroundColor: `${Colors.primary}18`,
    top: -60, right: -40,
  },
  circle2: {
    position: 'absolute', width: 150, height: 150,
    borderRadius: 75, backgroundColor: `${Colors.secondary}15`,
    top: 20, right: 80,
  },

  // ── Home ──
  homeContent: { gap: Spacing.md },
  homeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greetingBlock: { flex: 1, paddingRight: Spacing.md },
  greeting: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.7)' },
  userName: { fontSize: Typography.xxl, fontWeight: '800', color: Colors.white, marginTop: 2 },
  userRole: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '600', marginTop: 4 },

  // ── Search bar ──
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 13,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  searchIcon: { fontSize: 16 },
  searchPlaceholder: { color: 'rgba(255,255,255,0.5)', fontSize: Typography.sm },

  // ── Page ──
  pageContent: {
    flexDirection: 'row', alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.full,
  },
  backIcon: { fontSize: 20, color: Colors.white },
  pageTitles: { flex: 1, alignItems: 'center' },
  pageTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.white },
  pageSubtitle: { fontSize: Typography.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
});
