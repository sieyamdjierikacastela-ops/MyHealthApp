// ─────────────────────────────────────────────────────────────
//  MyHealth — Auth Context
//  Gère l'état global de connexion + token JWT
//  Synchronisé avec le backend de Sindze
// ─────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types (synchronisés avec la réponse backend) ─────────────
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor' | 'admin';
  gender?: string;
  dob?: string;
  blood_group?: string;
  avatar?: string;
  questionnaire_completed?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

// ── Context ──────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Restaurer la session au démarrage
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user'),
      ]);

      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        setState({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Appelé après login réussi (réponse backend Sindze)
  // data.data.accessToken + data.data.user
  const login = async (token: string, user: User) => {
    await Promise.all([
      AsyncStorage.setItem('token', token),
      AsyncStorage.setItem('user', JSON.stringify(user)),
    ]);
    setState({ user, token, isAuthenticated: true, isLoading: false });
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem('token'),
      AsyncStorage.removeItem('user'),
    ]);
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!state.user) return;
    const updatedUser = { ...state.user, ...updates };
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    setState(prev => ({ ...prev, user: updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
}
