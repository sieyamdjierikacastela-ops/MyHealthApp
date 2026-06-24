// ─────────────────────────────────────────────────────────────
//  MyHealth — Export central de tous les composants UI
//  Importer depuis '@/components' dans n'importe quel écran
//
//  Usage :
//  import { Button, DoctorCard, Avatar, SOSButton } from '@/components';
// ─────────────────────────────────────────────────────────────

// Composants de base
export { Button, Input, Card, Screen, Badge, Divider, EmptyState } from './index';

// Avatar
export { default as Avatar } from './Avatar';

// Cartes médecins & spécialités
export { default as DoctorCard } from './DoctorCard';
export type { Doctor } from './DoctorCard';

export { default as AppointmentCard } from './AppointmentCard';
export type { Appointment } from './AppointmentCard';

export { default as SpecialityCard } from './SpecialityCard';
export type { Speciality } from './SpecialityCard';

// Cartes statistiques & médicales
export { StatCard, VitalCard, InfoRow, NotificationItem } from './Cards';

// Header
export { default as GradientHeader } from './GradientHeader';

// SOS
export { default as SOSButton } from './SOSButton';

// Loading & Skeletons
export {
  Skeleton,
  DoctorCardSkeleton,
  AppointmentSkeleton,
  LoadingScreen,
  InlineLoader,
} from './Loading';
