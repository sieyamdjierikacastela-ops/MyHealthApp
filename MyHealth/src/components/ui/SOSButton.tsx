// ─────────────────────────────────────────────────────────────
//  MyHealth — SOSButton
//  Bouton d'urgence animé — composant critique
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Animated, StyleSheet,
} from 'react-native';
import { Colors, Typography, Shadows } from '../../theme';

interface SOSButtonProps {
  onPress: () => void;
  size?: number;
  active?: boolean;   // true = alerte en cours
}

export default function SOSButton({ onPress, size = 120, active = false }: SOSButtonProps) {
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.stagger(400, [
          Animated.sequence([
            Animated.timing(pulse1, { toValue: 1.8, duration: 1000, useNativeDriver: true }),
            Animated.timing(pulse1, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(pulse2, { toValue: 2.2, duration: 1200, useNativeDriver: true }),
            Animated.timing(pulse2, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(pulse3, { toValue: 2.6, duration: 1400, useNativeDriver: true }),
            Animated.timing(pulse3, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();
    };
    animate();
  }, []);

  const half = size / 2;

  return (
    <View style={[styles.container, { width: size * 3, height: size * 3 }]}>
      {/* Anneaux de pulsation */}
      {[pulse1, pulse2, pulse3].map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            {
              width: size, height: size, borderRadius: half,
              top: size, left: size,
              opacity: anim.interpolate({ inputRange: [1, 2.6], outputRange: [0.4, 0] }),
              transform: [{ scale: anim }],
              backgroundColor: active ? Colors.danger : Colors.danger,
            },
          ]}
        />
      ))}

      {/* Bouton principal */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: size, height: size, borderRadius: half,
            top: size, left: size,
          },
          active && styles.buttonActive,
        ]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={[styles.sosText, { fontSize: size * 0.28 }]}>SOS</Text>
        <Text style={[styles.sosSubtext, { fontSize: size * 0.12 }]}>
          {active ? 'ANNULER' : 'URGENCE'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-start', justifyContent: 'flex-start' },
  ring: {
    position: 'absolute',
    backgroundColor: Colors.danger,
  },
  button: {
    position: 'absolute',
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    ...Shadows.danger,
  },
  buttonActive: {
    backgroundColor: '#B71C1C',
  },
  sosText: {
    color: Colors.white,
    fontWeight: '900',
    letterSpacing: 2,
  },
  sosSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
});
