// ─────────────────────────────────────────────────────────────
//  MyHealth — Écrans placeholder
//  Ces écrans seront développés étape par étape
//  Pour l'instant ils permettent à la navigation de compiler
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

function Placeholder({ name, icon }: { name: string; icon: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.hint}>À développer — Étape suivante</Text>
    </View>
  );
}

// ── Auth ──────────────────────────────────────────────────────
export const SplashScreen = () => <Placeholder name="Splash" icon="💚" />;
export const OnboardingScreen = () => <Placeholder name="Onboarding" icon="👋" />;
export const RoleSelectScreen = () => <Placeholder name="Choix du rôle" icon="🧑‍⚕️" />;
export const RegisterScreen = () => <Placeholder name="Inscription" icon="📝" />;
export const LoginScreen = () => <Placeholder name="Connexion" icon="🔑" />;
export const OTPVerificationScreen = () => <Placeholder name="Vérification OTP" icon="📱" />;
export const ForgotPasswordScreen = () => <Placeholder name="Mot de passe oublié" icon="🔓" />;

// ── Patient tabs ──────────────────────────────────────────────
export const HomeScreen = () => <Placeholder name="Accueil" icon="🏠" />;
export const AppointmentsScreen = () => <Placeholder name="Rendez-vous" icon="📅" />;
export const MedicalScreen = () => <Placeholder name="Dossier médical" icon="📋" />;
export const MapScreen = () => <Placeholder name="Carte" icon="🗺️" />;
export const ProfileScreen = () => <Placeholder name="Profil" icon="👤" />;

// ── Patient screens ───────────────────────────────────────────
export const HealthQuestionnaireScreen = () => <Placeholder name="Questionnaire santé" icon="❓" />;
export const SpecialitiesScreen = () => <Placeholder name="Spécialités" icon="🏥" />;
export const DoctorListScreen = () => <Placeholder name="Liste médecins" icon="👨‍⚕️" />;
export const DoctorProfileScreen = () => <Placeholder name="Profil médecin" icon="🩺" />;
export const BookAppointmentScreen = () => <Placeholder name="Prendre RDV" icon="📆" />;
export const PaymentScreen = () => <Placeholder name="Paiement" icon="💳" />;
export const MedicalRecordScreen = () => <Placeholder name="Dossier" icon="📋" />;
export const EmergencyScreen = () => <Placeholder name="Urgences SOS" icon="🚨" />;
export const RemindersScreen = () => <Placeholder name="Rappels" icon="⏰" />;
export const SettingsScreen = () => <Placeholder name="Paramètres" icon="⚙️" />;

// ── Chat ──────────────────────────────────────────────────────
export const ChatListScreen = () => <Placeholder name="Messages" icon="💬" />;
export const ChatRoomScreen = () => <Placeholder name="Chat" icon="💬" />;

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.lightBg,
    alignItems: 'center', justifyContent: 'center',
    padding: Spacing.xxl,
  },
  icon: { fontSize: 60, marginBottom: Spacing.lg },
  name: {
    fontSize: Typography.xl, fontWeight: '700',
    color: Colors.textPrimary, marginBottom: Spacing.sm,
  },
  hint: { fontSize: Typography.sm, color: Colors.textLight },
});
