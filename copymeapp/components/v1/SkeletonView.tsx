/** @format */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import color from '@/app/theme/color';
import { ThemedText } from '@/components/ThemedText';

// Définition des connexions entre les keypoints pour dessiner le squelette
const SKELETON_CONNECTIONS = [
  // Tête et cou
  [0, 1], // nez à œil gauche
  [0, 2], // nez à œil droit
  [1, 3], // œil gauche à oreille gauche
  [2, 4], // œil droit à oreille droite

  // Torse
  [5, 6], // épaule gauche à épaule droite
  [5, 11], // épaule gauche à hanche gauche
  [6, 12], // épaule droite à hanche droite
  [11, 12], // hanche gauche à hanche droite

  // Bras gauche
  [5, 7], // épaule gauche à coude gauche
  [7, 9], // coude gauche à poignet gauche

  // Bras droit
  [6, 8], // épaule droite à coude droit
  [8, 10], // coude droit à poignet droit

  // Jambe gauche
  [11, 13], // hanche gauche à genou gauche
  [13, 15], // genou gauche à cheville gauche

  // Jambe droite
  [12, 14], // hanche droite à genou droit
  [14, 16], // genou droit à cheville droite
];

type SkeletonViewProps = {
  frame: any;
  isPlaying: boolean;
  width?: number;
  height?: number;
};

const SkeletonView = ({
  frame,
  isPlaying,
  width = Dimensions.get('window').width - 40,
  height = 220,
}: SkeletonViewProps) => {
  const opacityValue = useRef(new Animated.Value(1)).current;
  // Initialiser normalizedKeypoints comme variable state
  const [normalizedKeypoints, setNormalizedKeypoints] = useState<number[][]>(
    [],
  );

  // Fonction pour normaliser les coordonnées des keypoints
  const normalizeKeypoints = useCallback(
    (keypoints: any[]): number[][] => {
      try {
        if (!Array.isArray(keypoints) || keypoints.length === 0) {
          return [];
        }

        // Filtrer les points avec des coordonnées valides
        const validPoints = keypoints.filter(
          point =>
            Array.isArray(point) &&
            point.length >= 2 &&
            typeof point[0] === 'number' &&
            typeof point[1] === 'number' &&
            (point[0] !== 0 || point[1] !== 0),
        );

        if (validPoints.length === 0) {
          return Array(keypoints.length).fill([0, 0]);
        }

        // Calculer les valeurs min/max pour normalisation
        const xValues = validPoints.map(p => p[0]);
        const yValues = validPoints.map(p => p[1]);

        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);

        // Ajouter une marge pour éviter que les points soient sur les bords
        const margin = 30; // Augmenté pour plus d'espace
        const availableWidth = width - margin * 2;
        const availableHeight = height - margin * 2;

        // Calculer les dimensions du squelette
        const skeletonWidth = maxX - minX || 1;
        const skeletonHeight = maxY - minY || 1;

        // Calculer les échelles possibles
        const scaleWidth = availableWidth / skeletonWidth;
        const scaleHeight = availableHeight / skeletonHeight;

        // Utiliser l'échelle la plus petite pour conserver les proportions
        const scale = Math.min(scaleWidth, scaleHeight);

        // Calculer les offsets pour centrer le squelette
        const offsetX = (width - skeletonWidth * scale) / 2;
        const offsetY = (height - skeletonHeight * scale) / 2;

        // Normaliser tous les points
        return keypoints.map(point => {
          if (
            !Array.isArray(point) ||
            point.length < 2 ||
            typeof point[0] !== 'number' ||
            typeof point[1] !== 'number' ||
            (point[0] === 0 && point[1] === 0)
          ) {
            return [0, 0];
          }

          const x = (point[0] - minX) * scale + offsetX;
          const y = (point[1] - minY) * scale + offsetY;

          return [x, y];
        });
      } catch (error) {
        console.error('Erreur dans normalizeKeypoints:', error);
        return Array(keypoints.length).fill([0, 0]);
      }
    },
    [width, height],
  );

  // Fonction de rendu sécurisée pour les lignes
  const renderLines = () => {
    return SKELETON_CONNECTIONS.map((connection, index) => {
      try {
        if (!connection || connection.length !== 2) return null;

        const [p1Index, p2Index] = connection;

        if (
          p1Index === undefined ||
          p2Index === undefined ||
          !normalizedKeypoints[p1Index] ||
          !normalizedKeypoints[p2Index]
        ) {
          return null;
        }

        const p1 = normalizedKeypoints[p1Index];
        const p2 = normalizedKeypoints[p2Index];

        if (
          !p1 ||
          !p2 ||
          p1.length !== 2 ||
          p2.length !== 2 ||
          (p1[0] === 0 && p1[1] === 0) ||
          (p2[0] === 0 && p2[1] === 0)
        ) {
          return null;
        }

        // Attribuer des couleurs différentes selon les parties du corps
        let strokeColor = color.colors.primary;
        let strokeWidth = 2;

        // Définir des couleurs pour différentes parties du corps
        if (index < 4) {
          // Tête et cou
          strokeColor = '#FF6347'; // tomato
          strokeWidth = 1.5;
        } else if (index < 8) {
          // Torse
          strokeColor = '#4169E1'; // royal blue
          strokeWidth = 2.5;
        } else if (index < 12) {
          // Bras
          strokeColor = '#32CD32'; // lime green
          strokeWidth = 2;
        } else {
          // Jambes
          strokeColor = '#9370DB'; // medium purple
          strokeWidth = 2;
        }

        return (
          <Line
            key={`line-${index}`}
            x1={p1[0]}
            y1={p1[1]}
            x2={p2[0]}
            y2={p2[1]}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      } catch (error) {
        console.error(`Erreur de rendu de ligne ${index}:`, error);
        return null;
      }
    });
  };

  // Fonction de rendu sécurisée pour les points
  const renderPoints = () => {
    return normalizedKeypoints.map((point: number[], index: number) => {
      try {
        if (
          !point ||
          point.length !== 2 ||
          (point[0] === 0 && point[1] === 0)
        ) {
          return null;
        }

        // Personnaliser l'apparence des points selon leur emplacement sur le corps
        let pointColor = color.colors.primary;
        let pointSize = 4;

        // Attribuer des couleurs et tailles différentes selon les parties du corps
        if (index === 0) {
          // Nez
          pointColor = '#FF0000'; // rouge
          pointSize = 5;
        } else if (index <= 4) {
          // Yeux et oreilles
          pointColor = '#FF6347'; // tomato
          pointSize = 3;
        } else if (index === 5 || index === 6) {
          // Épaules
          pointColor = '#4169E1'; // royal blue
          pointSize = 5;
        } else if (index === 7 || index === 8) {
          // Coudes
          pointColor = '#32CD32'; // lime green
          pointSize = 4;
        } else if (index === 9 || index === 10) {
          // Poignets
          pointColor = '#32CD32'; // lime green
          pointSize = 3;
        } else if (index === 11 || index === 12) {
          // Hanches
          pointColor = '#4169E1'; // royal blue
          pointSize = 5;
        } else if (index === 13 || index === 14) {
          // Genoux
          pointColor = '#9370DB'; // medium purple
          pointSize = 4;
        } else if (index === 15 || index === 16) {
          // Chevilles
          pointColor = '#9370DB'; // medium purple
          pointSize = 3;
        }

        return (
          <Circle
            key={`circle-${index}`}
            cx={point[0]}
            cy={point[1]}
            r={pointSize}
            fill={pointColor}
          />
        );
      } catch (error) {
        console.error(`Erreur de rendu de point ${index}:`, error);
        return null;
      }
    });
  };

  // Mettre à jour les points normalisés quand la frame change
  useEffect(() => {
    if (
      frame &&
      frame.keypoints_positions &&
      Array.isArray(frame.keypoints_positions)
    ) {
      setNormalizedKeypoints(normalizeKeypoints(frame.keypoints_positions));
    } else {
      setNormalizedKeypoints([]);
    }
  }, [frame, normalizeKeypoints]);

  // Effet pour animer le squelette lorsque le frame change
  useEffect(() => {
    // Réinitialiser l'opacité à 1 quand un nouveau frame arrive
    opacityValue.setValue(1);

    // Animation de fondu uniquement si en mode lecture
    if (isPlaying) {
      // Séquence d'animation plus élaborée pour un effet plus fluide
      Animated.sequence([
        // D'abord, un léger flash
        Animated.timing(opacityValue, {
          toValue: 0.9,
          duration: 50,
          useNativeDriver: true,
        }),
        // Puis stabilisation à une opacité plus basse
        Animated.timing(opacityValue, {
          toValue: 0.7,
          duration: 450,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      // Nettoyage si nécessaire
    };
  }, [frame, isPlaying, opacityValue]);

  // Vérifier si la frame est valide et a des keypoints
  if (
    !frame ||
    !frame.keypoints_positions ||
    !Array.isArray(frame.keypoints_positions)
  ) {
    console.log('Frame invalide ou sans keypoints:', frame);
    return (
      <View style={[styles.container, { width, height }]}>
        <ActivityIndicator size="large" color={color.colors.primary} />
        <ThemedText style={styles.emptyText}>
          En attente des données...
        </ThemedText>
      </View>
    );
  }

  // Si les keypoints sont vides ou tous à zéro
  if (
    !frame.keypoints_positions.length ||
    frame.keypoints_positions.every(
      (point: any[]) =>
        !Array.isArray(point) || (point[0] === 0 && point[1] === 0),
    )
  ) {
    return (
      <View style={[styles.container, { width, height }]}>
        <ThemedText style={styles.emptyText}>
          Aucune donnée de posture disponible pour cette frame
        </ThemedText>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          height,
          opacity: opacityValue,
        },
      ]}
    >
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <G>
          {renderLines()}
          {renderPoints()}
        </G>
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.7,
    paddingHorizontal: 20,
  },
});

export default SkeletonView;
