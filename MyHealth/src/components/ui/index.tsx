// ─────────────────────────────────────────────────────────────
//  MyHealth — Composants de base réutilisables
//  Charte graphique pixel-perfect selon CDC v1.1.0
// ─────────────────────────────────────────────────────────────

import React, { ReactNode } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  StyleSheet, ViewStyle, TextStyle, TextInputProps,
  SafeAreaView, ScrollView, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

// ════════════════════════════════════════════════════════════
//  BUTTON
// ════════════════════════════════════════════════════════════
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  icon?: string;
}

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading, disabled, fullWidth = true, style, icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyles: ViewStyle[] = [
    styles.btn,
    styles[`btn_${variant}`],
    styles[`btn_${size}`],
    fullWidth && styles.btn_fullWidth,
    isDisabled && styles.btn_disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.btnText,
    styles[`btnText_${variant}`],
    styles[`btnText_${size}`],
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white}
          size="small"
        />
      ) : (
        <View style={styles.btnInner}>
          {icon && <Text style={styles.btnIcon}>{icon}</Text>}
          <Text style={textStyles}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ════════════════════════════════════════════════════════════
//  INPUT
// ════════════════════════════════════════════════════════════
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export function Input({
  label, error, hint, leftIcon, rightIcon, onRightIconPress,
  containerStyle, ...props
}: InputProps) {
  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
        {leftIcon && <Text style={styles.inputIcon}>{leftIcon}</Text>}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeft, rightIcon && styles.inputWithRight]}
          placeholderTextColor={Colors.textLight}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.inputRightIcon}>
            <Text style={styles.inputIcon}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.inputError}>⚠ {error}</Text>}
      {hint && !error && <Text style={styles.inputHint}>{hint}</Text>}
    </View>
  );
}

// ════════════════════════════════════════════════════════════
//  CARD
// ════════════════════════════════════════════════════════════
interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: number;
}

export function Card({ children, style, onPress, padding = Spacing.base }: CardProps) {
  const content = (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

// ════════════════════════════════════════════════════════════
//  SCREEN WRAPPER
// ════════════════════════════════════════════════════════════
interface ScreenProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  scrollable?: boolean;
  darkHeader?: boolean;
  rightAction?: { icon: string; onPress: () => void };
  style?: ViewStyle;
  noPadding?: boolean;
}

export function Screen({
  children, title, subtitle, onBack, scrollable = false,
  darkHeader = false, rightAction, style, noPadding = false,
}: ScreenProps) {
  const content = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[!noPadding && styles.scrollContent]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.screenBody, !noPadding && styles.screenPadding, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.screen, darkHeader && styles.screenDark]}
    >
      <StatusBar
        barStyle={darkHeader ? 'light-content' : 'dark-content'}
        backgroundColor={darkHeader ? Colors.darkNavy : Colors.lightBg}
      />
      {(title || onBack) && (
        <View style={[styles.header, darkHeader && styles.headerDark]}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Text style={[styles.backIcon, darkHeader && styles.backIconLight]}>←</Text>
            </TouchableOpacity>
          )}
          <View style={styles.headerCenter}>
            {title && (
              <Text style={[styles.headerTitle, darkHeader && styles.headerTitleLight]}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[styles.headerSubtitle, darkHeader && styles.headerSubtitleLight]}>
                {subtitle}
              </Text>
            )}
          </View>
          {rightAction && (
            <TouchableOpacity onPress={rightAction.onPress} style={styles.backBtn}>
              <Text style={[styles.backIcon, darkHeader && styles.backIconLight]}>
                {rightAction.icon}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ════════════════════════════════════════════════════════════
//  BADGE
// ════════════════════════════════════════════════════════════
interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
}

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  const colors = {
    primary: { bg: Colors.primaryOverlay, text: Colors.primary },
    secondary: { bg: Colors.secondaryOverlay, text: Colors.secondary },
    success: { bg: Colors.primaryOverlay, text: Colors.success },
    warning: { bg: '#FFF3E0', text: Colors.warning },
    danger: { bg: '#FFEBEE', text: Colors.danger },
    neutral: { bg: Colors.lightBg, text: Colors.textSecondary },
  };
  const c = colors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{label}</Text>
    </View>
  );
}

// ════════════════════════════════════════════════════════════
//  DIVIDER
// ════════════════════════════════════════════════════════════
export function Divider({ label }: { label?: string }) {
  if (label) {
    return (
      <View style={styles.dividerWithLabel}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>{label}</Text>
        <View style={styles.dividerLine} />
      </View>
    );
  }
  return <View style={styles.divider} />;
}

// ════════════════════════════════════════════════════════════
//  EMPTY STATE
// ════════════════════════════════════════════════════════════
export function EmptyState({
  icon, title, subtitle, actionLabel, onAction,
}: {
  icon: string; title: string; subtitle?: string;
  actionLabel?: string; onAction?: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} size="sm" fullWidth={false} style={styles.emptyBtn} />
      )}
    </View>
  );
}

// ════════════════════════════════════════════════════════════
//  STYLES
// ════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  flex: { flex: 1 },

  // ── Screen ──
  screen: { flex: 1, backgroundColor: Colors.lightBg },
  screenDark: { backgroundColor: Colors.darkNavy },
  screenBody: { flex: 1 },
  screenPadding: { paddingHorizontal: Spacing.base },
  scrollContent: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },

  // ── Header ──
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.lightBg,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerDark: { backgroundColor: Colors.darkNavy, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  backIconLight: { color: Colors.white },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: Typography.md, fontWeight: '700', color: Colors.textPrimary },
  headerTitleLight: { color: Colors.white },
  headerSubtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 2 },
  headerSubtitleLight: { color: 'rgba(255,255,255,0.7)' },

  // ── Button ──
  btn: {
    borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  btn_primary: { backgroundColor: Colors.primary, ...Shadows.primary },
  btn_secondary: { backgroundColor: Colors.secondary },
  btn_outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
  btn_ghost: { backgroundColor: 'transparent' },
  btn_danger: { backgroundColor: Colors.danger, ...Shadows.danger },
  btn_sm: { paddingVertical: 10, paddingHorizontal: Spacing.lg },
  btn_md: { paddingVertical: 14, paddingHorizontal: Spacing.xl },
  btn_lg: { paddingVertical: 18, paddingHorizontal: Spacing.xxl },
  btn_fullWidth: { width: '100%' },
  btn_disabled: { opacity: 0.5 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { fontWeight: '700', letterSpacing: 0.3 },
  btnText_primary: { color: Colors.white },
  btnText_secondary: { color: Colors.white },
  btnText_outline: { color: Colors.primary },
  btnText_ghost: { color: Colors.primary },
  btnText_danger: { color: Colors.white },
  btnText_sm: { fontSize: Typography.sm },
  btnText_md: { fontSize: Typography.base },
  btnText_lg: { fontSize: Typography.md },
  btnIcon: { fontSize: Typography.base },

  // ── Input ──
  inputContainer: { marginBottom: Spacing.md },
  inputLabel: {
    fontSize: Typography.sm, fontWeight: '600',
    color: Colors.textPrimary, marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    ...Shadows.sm,
  },
  inputWrapperError: { borderColor: Colors.danger },
  input: {
    flex: 1, fontSize: Typography.base, color: Colors.textPrimary,
    paddingVertical: 14, paddingHorizontal: Spacing.base,
    minHeight: 52,
  },
  inputWithLeft: { paddingLeft: 8 },
  inputWithRight: { paddingRight: 8 },
  inputIcon: { fontSize: 18, paddingHorizontal: Spacing.md, color: Colors.textSecondary },
  inputRightIcon: { padding: Spacing.md },
  inputError: { fontSize: Typography.xs, color: Colors.danger, marginTop: 4 },
  inputHint: { fontSize: Typography.xs, color: Colors.textLight, marginTop: 4 },

  // ── Card ──
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.md,
    marginBottom: Spacing.md, ...Shadows.md,
  },

  // ── Badge ──
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeText: { fontSize: Typography.xs, fontWeight: '600' },

  // ── Divider ──
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  dividerWithLabel: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerLabel: {
    marginHorizontal: Spacing.md, fontSize: Typography.sm,
    color: Colors.textLight, fontWeight: '500',
  },

  // ── Empty State ──
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  emptyIcon: { fontSize: 56, marginBottom: Spacing.lg },
  emptyTitle: {
    fontSize: Typography.lg, fontWeight: '700',
    color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.base, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  emptyBtn: { marginTop: Spacing.xl },
});
