// ─────────────────────────────────────────────────────────────
//  MyHealth — Charte graphique officielle
//  Synchronisée avec le CDC v1.1.0
// ─────────────────────────────────────────────────────────────

export const Colors = {
  // Couleurs principales
  primary: '#00C896',        // Teal/Vert médical — boutons, accents, icônes actives
  secondary: '#0077B6',      // Bleu confiance — en-têtes, liens, statuts
  danger: '#E53935',         // Rouge alertes — SOS, erreurs, urgences

  // Fonds
  darkNavy: '#0d2137',       // Mode sombre, sidebar
  lightBg: '#f0f6f4',        // Mode clair, fond général
  white: '#FFFFFF',
  card: '#FFFFFF',

  // Textes
  textPrimary: '#0d2137',
  textSecondary: '#5A7184',
  textLight: '#A0B3C1',
  textWhite: '#FFFFFF',

  // Borders & séparateurs
  border: '#E8F0F2',
  borderLight: '#F0F6F4',

  // États
  success: '#00C896',
  warning: '#FF8C00',
  info: '#0077B6',

  // Statuts médecin
  available: '#00C896',
  busy: '#FF8C00',
  unavailable: '#E53935',

  // Overlay
  overlay: 'rgba(13, 33, 55, 0.6)',
  primaryOverlay: 'rgba(0, 200, 150, 0.1)',
  secondaryOverlay: 'rgba(0, 119, 182, 0.1)',
};

export const Typography = {
  // Familles de polices
  fontRegular: 'System',
  fontMedium: 'System',
  fontBold: 'System',

  // Tailles
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 22,
  xxl: 26,
  xxxl: 32,
  display: 40,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,      // cartes
  lg: 16,
  xl: 20,      // modals
  xxl: 28,
  full: 999,   // boutons pill, avatars
};

export const Shadows = {
  sm: {
    shadowColor: '#0d2137',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#0d2137',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0d2137',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  primary: {
    shadowColor: '#00C896',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  danger: {
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};
