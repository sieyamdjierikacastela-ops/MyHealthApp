// ─────────────────────────────────────────────────────────────
//  MyHealth — Types de navigation
//  Typage strict de tous les écrans et leurs paramètres
// ─────────────────────────────────────────────────────────────

export type RootStackParamList = {
  // ── Auth Stack ──────────────────────────────────────────
  Splash: undefined;
  Onboarding: undefined;
  RoleSelect: undefined;
  Register: { role: 'patient' | 'doctor' };
  Login: undefined;
  OTPVerification: { phone: string; mode: 'register' | '2fa' };
  ForgotPassword: undefined;
  ResetPassword: { token: string };

  // ── App Stack (après login) ──────────────────────────────
  MainTabs: undefined;

  // ── Patient Screens ─────────────────────────────────────
  HealthQuestionnaire: undefined;
  Specialities: undefined;
  DoctorList: { speciality_id?: number; speciality_name?: string };
  DoctorProfile: { doctor_id: number };
  BookAppointment: { doctor_id: number };
  Payment: { appointment_id: number; amount: number; doctor_name: string };
  PaymentSuccess: { reference: string };

  // ── Dossier médical ─────────────────────────────────────
  MedicalRecord: { patient_id: number };
  Vitals: { patient_id: number };
  Antecedents: { patient_id: number };
  Prescriptions: { patient_id: number };

  // ── Chat & Téléconsultation ──────────────────────────────
  ChatList: undefined;
  ChatRoom: { chat_id: number; doctor_name: string; doctor_avatar?: string };
  VideoCall: { appointment_id: number; doctor_name: string };

  // ── Localisation ────────────────────────────────────────
  MapScreen: { mode?: 'hospitals' | 'pharmacies' | 'all' };
  NearbyList: { type: 'hospital' | 'pharmacy' };

  // ── Urgences ────────────────────────────────────────────
  Emergency: undefined;
  SOSActive: { alert_id: number };
  EmergencyContacts: undefined;

  // ── Rappels ─────────────────────────────────────────────
  Reminders: undefined;
  AddReminder: undefined;
  PrenatalTracking: undefined;
  MenstrualCalendar: undefined;

  // ── Paramètres ──────────────────────────────────────────
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  LanguageSelect: undefined;
  NotificationSettings: undefined;
  SecuritySettings: undefined;
  DataExport: undefined;

  // ── Médecin Screens ─────────────────────────────────────
  DoctorDashboard: undefined;
  DoctorSchedule: undefined;
  DoctorPatients: undefined;
  PatientDossier: { patient_id: number };
  CreatePrescription: { patient_id: number; appointment_id: number };
  DoctorRevenues: undefined;
  DoctorProfile_Edit: undefined;
};

export type BottomTabParamList = {
  // Patient tabs
  Home: undefined;
  Appointments: undefined;
  Medical: undefined;
  Map: undefined;
  Profile: undefined;

  // Doctor tabs
  DoctorHome: undefined;
  DoctorAppointments: undefined;
  DoctorPatientsTab: undefined;
  DoctorChatTab: undefined;
  DoctorProfileTab: undefined;
};
