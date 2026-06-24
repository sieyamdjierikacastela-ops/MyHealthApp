// ─────────────────────────────────────────────────────────────
//  MyHealth — Service API
//  Connecté au backend Node.js de Sindze (port 5000)
//  Copie conforme de la documentation backend v1.0
// ─────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';

// En développement : IP locale de la machine de Sindze
// En production : remplacer par l'URL du serveur déployé
export const BASE_URL = 'http://localhost:5000/api';

// ── Utilitaire authentifié ────────────────────────────────────
const authFetch = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    const data = await response.json();

    // Token expiré → rediriger vers Login
    if (response.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // L'AuthContext détectera le token manquant au prochain render
    }

    return data;
  } catch (error) {
    console.error(`[API] Erreur réseau sur ${endpoint}:`, error);
    throw new Error('Vérifiez votre connexion internet');
  }
};

// ── API Object (synchronisé avec routes backend Sindze) ──────
export const API = {

  // ── AUTH (/api/auth) ───────────────────────────────────────
  auth: {
    register: (data: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      password: string;
      role: 'patient' | 'doctor';
    }) =>
      fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),

    login: (email: string, password: string) =>
      fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }).then(r => r.json()),

    me: () => authFetch('/auth/me'),

    verifyOTP: (phone: string, otp: string) =>
      fetch(`${BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      }).then(r => r.json()),

    forgotPassword: (email: string) =>
      fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).then(r => r.json()),

    logout: () => authFetch('/auth/logout', { method: 'POST' }),
  },

  // ── MÉDECINS (/api/doctors) ────────────────────────────────
  doctors: {
    list: (filters?: { speciality_id?: number; status?: string; city?: string }) =>
      authFetch(`/doctors?${new URLSearchParams(filters as any)}`),

    getById: (id: number) => authFetch(`/doctors/${id}`),

    specialities: () => authFetch('/doctors/specialities'),
  },

  // ── RENDEZ-VOUS (/api/appointments) ───────────────────────
  appointments: {
    create: (data: {
      doctor_id: number;
      date: string;
      time: string;
      type: 'teleconsult' | 'physical';
      motif: string;
      amount: number;
    }) => authFetch('/appointments', { method: 'POST', body: JSON.stringify(data) }),

    list: () => authFetch('/appointments'),

    confirm: (id: number) =>
      authFetch(`/appointments/${id}/confirm`, { method: 'PUT' }),

    complete: (id: number) =>
      authFetch(`/appointments/${id}/complete`, { method: 'PUT' }),

    cancel: (id: number) =>
      authFetch(`/appointments/${id}`, { method: 'DELETE' }),
  },

  // ── DOSSIER MÉDICAL (/api/medical) ─────────────────────────
  medical: {
    get: (patientId: number) => authFetch(`/medical/${patientId}`),

    update: (patientId: number, data: any) =>
      authFetch(`/medical/${patientId}`, { method: 'PUT', body: JSON.stringify(data) }),

    addAntecedent: (patientId: number, data: any) =>
      authFetch(`/medical/${patientId}/antecedents`, {
        method: 'POST', body: JSON.stringify(data),
      }),

    saveQuestionnaire: (answers: Record<string, string>) =>
      authFetch('/medical/questionnaire/save', {
        method: 'POST', body: JSON.stringify({ answers }),
      }),

    createPrescription: (data: any) =>
      authFetch('/medical/prescriptions/create', {
        method: 'POST', body: JSON.stringify(data),
      }),
  },

  // ── CHAT (/api/chat) ───────────────────────────────────────
  chat: {
    list: () => authFetch('/chat'),

    create: (doctorId: number) =>
      authFetch('/chat', { method: 'POST', body: JSON.stringify({ doctor_id: doctorId }) }),

    messages: (chatId: number) => authFetch(`/chat/${chatId}/messages`),

    send: (chatId: number, content: string, type = 'text') =>
      authFetch(`/chat/${chatId}/messages`, {
        method: 'POST', body: JSON.stringify({ content, type }),
      }),

    markRead: (chatId: number) =>
      authFetch(`/chat/${chatId}/read`, { method: 'PUT' }),
  },

  // ── URGENCES (/api/emergency) ──────────────────────────────
  emergency: {
    sos: (lat: number, lng: number) =>
      authFetch('/emergency/sos', {
        method: 'POST', body: JSON.stringify({ lat, lng }),
      }),

    cancelSOS: (alertId: number) =>
      authFetch(`/emergency/sos/${alertId}/cancel`, { method: 'PUT' }),

    contacts: () => authFetch('/emergency/contacts'),

    updateContacts: (data: any) =>
      authFetch('/emergency/contacts', { method: 'PUT', body: JSON.stringify(data) }),

    nearby: (lat: number, lng: number) =>
      authFetch(`/emergency/nearby?lat=${lat}&lng=${lng}`),
  },

  // ── PAIEMENTS (/api/payments) ──────────────────────────────
  payments: {
    initiate: (data: {
      appointment_id: number;
      amount: number;
      method: 'mtn_money' | 'orange_money';
    }) =>
      authFetch('/payments/initiate', { method: 'POST', body: JSON.stringify(data) }),

    history: () => authFetch('/payments/history'),

    status: (reference: string) => authFetch(`/payments/status/${reference}`),
  },

  // ── NOTIFICATIONS (/api/notifications) ────────────────────
  notifications: {
    list: () => authFetch('/notifications'),

    registerToken: (fcmToken: string) =>
      authFetch('/notifications/register-token', {
        method: 'POST', body: JSON.stringify({ fcm_token: fcmToken }),
      }),

    markRead: (id: number) =>
      authFetch(`/notifications/${id}/read`, { method: 'PUT' }),
  },

  // ── LOCALISATION (/api/location) ───────────────────────────
  location: {
    pharmaciesNearby: (lat: number, lng: number, radius = 5000) =>
      authFetch(`/location/pharmacies/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),

    hospitalsNearby: (lat: number, lng: number) =>
      authFetch(`/location/hospitals/nearby?lat=${lat}&lng=${lng}`),
  },

  // ── PROFIL UTILISATEUR (/api/users) ────────────────────────
  users: {
    updateProfile: (data: any) =>
      authFetch('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),

    changePassword: (current: string, newPass: string) =>
      authFetch('/users/profile/password', {
        method: 'PUT',
        body: JSON.stringify({ current_password: current, new_password: newPass }),
      }),

    deleteAccount: () => authFetch('/users/account', { method: 'DELETE' }),
  },
};
