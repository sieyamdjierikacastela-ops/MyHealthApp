// ─────────────────────────────────────────────────────────────
//  MyHealth — Avatar
//  Photo de profil avec initiales en fallback
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Typography } from '../../theme';

interface AvatarProps {
  uri?: string | null;
  firstName?: string;
  lastName?: string;
  size?: number;
  style?: ViewStyle;
  online?: boolean;       // point vert "en ligne"
  verified?: boolean;     // badge vérifié médecin
}

export default function Avatar({
  uri, firstName = '', lastName = '', size = 48,
  style, online, verified,
}: AvatarProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const fontSize = size * 0.36;

  // Couleur de fond déterministe selon les initiales
  const bgColors = [
    Colors.primary, Colors.secondary, '#7C3AED', '#DB2777',
    '#D97706', '#059669', '#DC2626', '#2563EB',
  ];
  const colorIndex = (firstName.charCodeAt(0) || 0) % bgColors.length;
  const bgColor = bgColors[colorIndex];

  return (
    <View style={[{ width: size, height: size }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View style={[
          styles.fallback,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
        ]}>
          <Text style={[styles.initials, { fontSize }]}>{initials || '?'}</Text>
        </View>
      )}

      {/* Point "en ligne" */}
      {online !== undefined && (
        <View style={[
          styles.onlineDot,
          {
            width: size * 0.28, height: size * 0.28,
            borderRadius: size * 0.14,
            bottom: 0, right: 0,
            backgroundColor: online ? Colors.available : Colors.textLight,
          },
        ]} />
      )}

      {/* Badge vérifié médecin */}
      {verified && (
        <View style={[
          styles.verifiedBadge,
          { width: size * 0.32, height: size * 0.32, borderRadius: size * 0.16, bottom: 0, right: 0 },
        ]}>
          <Text style={{ fontSize: size * 0.18, color: Colors.white }}>✓</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { resizeMode: 'cover' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: Colors.white, fontWeight: '700' },
  onlineDot: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  verifiedBadge: {
    position: 'absolute',
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
});
