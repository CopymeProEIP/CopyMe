/** @format */

import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  View,
  Dimensions,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import Video from 'react-native-video';
import { useRoute } from '@react-navigation/native';
import { Lightbulb } from 'lucide-react-native';
import color from '@/app/theme/color';
import { useProcessedData } from '@/hooks/useProcessedData';
import AnalysisInfoCard from '@/components/v1/AnalysisInfoCard';
import FrameNavigator from '@/components/v1/FrameNavigator';
import VideoControls from '@/components/v1/VideoControls';
import SkeletonView from '@/components/v1/SkeletonView';
import { API_URL } from '@env';

type RouteParams = {
  id: string;
  title?: string;
  exerciseName?: string;
};

function Feedback({ feedbacks }: { feedbacks: string[] }) {
  return feedbacks.map((feedback, index) => (
    <ThemedView key={index} style={styles.tipItem}>
      <ThemedText type="defaultSemiBold" style={styles.tipBullet}>
        •
      </ThemedText>
      <ThemedText type="description" style={styles.tipText}>
        {feedback}
      </ThemedText>
    </ThemedView>
  ));
}

export default function AnalysisDetailScreen() {
  const route = useRoute();
  const { id } = route.params as RouteParams;
  const frameNavigatorRef = React.useRef<any>(null);
  const [frame, setFrame] = useState(0);
  const [tipsExpanded, setTipsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [alternativeVideoUrl, setAlternativeVideoUrl] = useState<string | null>(
    null,
  );
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  // Référence à la vidéo native pour contrôler la lecture
  const videoRef = React.useRef<any>(null);

  // Utilisation du hook useProcessedData
  const { data: processedData, loading, error, refresh } = useProcessedData(id);

  // Effet pour utiliser l'URL de la vidéo du backend
  React.useEffect(() => {
    if (processedData) {
      console.log('Données processées reçues:', processedData);

      // Créer une URL complète vers le fichier vidéo
      const apiBaseUrl = API_URL || 'http://localhost:3000';

      // Obtenir la vidéo complète depuis l'API
      const timestamp = new Date().getTime();
      const videoUrl = `${apiBaseUrl}/api/process/${id}/video?t=${timestamp}`;
      console.log('URL vidéo à utiliser:', videoUrl);

      // Réinitialiser l'état de chargement
      setIsVideoLoading(true);

      // Mettre à jour l'URL de la vidéo
      setAlternativeVideoUrl(videoUrl);
    }
  }, [id]);

  // Fonction pour faire défiler jusqu'au frame sélectionné
  const scrollToSelected = (index: number) => {
    if (
      frameNavigatorRef.current &&
      frameNavigatorRef.current.scrollToSelected
    ) {
      frameNavigatorRef.current.scrollToSelected(index);
    }
  };

  // Fonction pour mettre à jour le frame courant et déclencher le défilement
  const updateFrame = (newFrame: number): void => {
    setFrame(newFrame);
    setTimeout(() => scrollToSelected(newFrame), 100);
  };

  const togglePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);

    if (videoRef.current) {
      // Contrôle de la lecture de la vidéo
      if (newPlayingState) {
        videoRef.current.resume && videoRef.current.resume();
      } else {
        videoRef.current.pause && videoRef.current.pause();
      }
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Loading analysis...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !processedData) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">
          Error: {error ? error.message : 'No data available'}
        </ThemedText>
        <TouchableOpacity style={styles.playButton} onPress={refresh}>
          <ThemedText type="button">Réessayer</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const feedbacks = processedData.frames?.[frame]?.persons?.[0]?.feedback || [];
  const framesArray = processedData.frames || [];
  const tipCount = feedbacks.length;

  // Fonction pour valider une frame avant de l'utiliser
  const getValidatedFrame = (indexFrame: number) => {
    const currentFrame = framesArray[indexFrame];
    if (!currentFrame) return {};

    // Vérifions si les keypoints sont au format objet (avec nose_x, nose_y, etc.)
    if (
      currentFrame.keypoints_positions &&
      typeof currentFrame.keypoints_positions === 'object' &&
      !Array.isArray(currentFrame.keypoints_positions)
    ) {
      // Conversion du format objet vers format tableau
      const keypoints = [];
      const kp = currentFrame.keypoints_positions;

      // Créons les paires dans l'ordre approprié
      keypoints.push([kp.nose_x || 0, kp.nose_y || 0]); // 0: nez
      keypoints.push([kp.left_eye_x || 0, kp.left_eye_y || 0]); // 1: œil gauche
      keypoints.push([kp.right_eye_x || 0, kp.right_eye_y || 0]); // 2: œil droit
      keypoints.push([kp.left_ear_x || 0, kp.left_ear_y || 0]); // 3: oreille gauche
      keypoints.push([kp.right_ear_x || 0, kp.right_ear_y || 0]); // 4: oreille droite
      keypoints.push([kp.left_shoulder_x || 0, kp.left_shoulder_y || 0]); // 5: épaule gauche
      keypoints.push([kp.right_shoulder_x || 0, kp.right_shoulder_y || 0]); // 6: épaule droite
      keypoints.push([kp.left_elbow_x || 0, kp.left_elbow_y || 0]); // 7: coude gauche
      keypoints.push([kp.right_elbow_x || 0, kp.right_elbow_y || 0]); // 8: coude droit
      keypoints.push([kp.left_wrist_x || 0, kp.left_wrist_y || 0]); // 9: poignet gauche
      keypoints.push([kp.right_wrist_x || 0, kp.right_wrist_y || 0]); // 10: poignet droit
      keypoints.push([kp.left_hip_x || 0, kp.left_hip_y || 0]); // 11: hanche gauche
      keypoints.push([kp.right_hip_x || 0, kp.right_hip_y || 0]); // 12: hanche droite
      keypoints.push([kp.left_knee_x || 0, kp.left_knee_y || 0]); // 13: genou gauche
      keypoints.push([kp.right_knee_x || 0, kp.right_knee_y || 0]); // 14: genou droit
      keypoints.push([kp.left_ankle_x || 0, kp.left_ankle_y || 0]); // 15: cheville gauche
      keypoints.push([kp.right_ankle_x || 0, kp.right_ankle_y || 0]); // 16: cheville droite

      return { ...currentFrame, keypoints_positions: keypoints };
    }

    // Vérification du format tableau habituel
    if (
      !currentFrame.keypoints_positions ||
      !Array.isArray(currentFrame.keypoints_positions)
    ) {
      console.log(
        'Frame invalide ou keypoints_positions manquants:',
        currentFrame,
      );
      return { ...currentFrame, keypoints_positions: [] };
    }

    return currentFrame;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Card style={styles.tipsCard}>
          <TouchableOpacity
            style={styles.tipsHeader}
            disabled={tipCount === 0}
            onPress={() => setTipsExpanded(!tipsExpanded)}
          >
            <ThemedView style={styles.headerView}>
              <Lightbulb color={color.colors.primary} />
              <ThemedText type="subtitle">Improvement</ThemedText>
            </ThemedView>

            <TouchableOpacity
              style={styles.seeMoreButton}
              disabled={tipCount === 0}
              onPress={() => setTipsExpanded(!tipsExpanded)}
            >
              <ThemedText style={styles.seeMoreText}>
                {!tipsExpanded ? 'See more' : 'Collapse'}
              </ThemedText>
            </TouchableOpacity>
          </TouchableOpacity>

          {tipsExpanded && (
            <ThemedView style={styles.tipsContainer}>
              <Feedback feedbacks={feedbacks} />
            </ThemedView>
          )}
        </Card>
        <ThemedView>
          {/* Conteneur vidéo avec titre */}
          <ThemedView style={styles.sectionContainer}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Vidéo
            </ThemedText>
            <ThemedView style={styles.videoContainer}>
              {alternativeVideoUrl ? (
                // Utiliser uniquement le composant Video natif pour la lecture
                <View style={styles.videoWrapper}>
                  <Video
                    ref={videoRef}
                    source={{
                      uri: alternativeVideoUrl,
                    }}
                    style={styles.video}
                    controls={true}
                    resizeMode="contain"
                    paused={!isPlaying}
                    repeat={false}
                    playInBackground={false}
                    playWhenInactive={false}
                    ignoreSilentSwitch="ignore"
                    progressUpdateInterval={250}
                    // Configuration de buffer optimisée pour un téléchargement complet
                    bufferConfig={{
                      minBufferMs: 15000,
                      maxBufferMs: 60000,
                      bufferForPlaybackMs: 2500,
                      bufferForPlaybackAfterRebufferMs: 5000,
                    }}
                    poster={require('@/assets/images/placeholder.png')}
                    onLoadStart={() => {
                      console.log('Video load started');
                      setIsVideoLoading(true);
                    }}
                    onLoad={() => {
                      console.log('Video loaded successfully');
                      setIsVideoLoading(false);
                      // Force le démarrage de la lecture après chargement pour tester
                      if (videoRef.current) {
                        videoRef.current.seek(0);
                      }
                    }}
                    onReadyForDisplay={() => {
                      console.log('Video ready for display');
                      setIsVideoLoading(false);
                    }}
                    onProgress={data => {
                      // Calcul du frame correspondant à la position actuelle de la vidéo
                      if (isPlaying && framesArray.length > 0) {
                        const videoPositionSeconds = data.currentTime;
                        const totalDuration = data.seekableDuration || 30;
                        const estimatedFrame = Math.min(
                          Math.floor(
                            (videoPositionSeconds / totalDuration) *
                              framesArray.length,
                          ),
                          framesArray.length - 1,
                        );
                        if (estimatedFrame !== frame) {
                          setFrame(estimatedFrame);
                          scrollToSelected(estimatedFrame);
                        }
                      }
                    }}
                    onError={videoErr => {
                      console.error('Video error:', JSON.stringify(videoErr));
                      setIsVideoLoading(false);

                      // Message d'erreur détaillé
                      const errorCode = videoErr?.error?.code || 'inconnu';
                      const errorDesc =
                        videoErr?.error?.localizedDescription ||
                        'Erreur inconnue';
                      const errorReason =
                        videoErr?.error?.localizedFailureReason || '';
                      const errorDomain = videoErr?.error?.domain || '';

                      console.log(
                        `Erreur de lecture: Code ${errorCode} - ${errorDesc} - ${errorReason} - Domaine: ${errorDomain}`,
                      );
                      console.log(
                        `URL qui a causé l'erreur: ${alternativeVideoUrl}`,
                      );

                      // Essayer une URL alternative directement vers le fichier uploads
                      const apiBaseUrl = API_URL || 'http://localhost:3000';

                      // Extraire le nom du fichier de l'URL originale ou de l'ID
                      let fileName;
                      if (processedData && processedData.original_path) {
                        // Récupérer le nom du fichier en extrayant la dernière partie du chemin
                        const pathParts =
                          processedData.original_path.split('/');
                        fileName = pathParts[pathParts.length - 1];
                      } else {
                        fileName = `media-${id.split('-').pop()}.mp4`;
                      }

                      const timestamp = new Date().getTime();
                      // Essayer directement l'URL du fichier statique
                      const altUrl = `${apiBaseUrl}/uploads/${fileName}?t=${timestamp}`;
                      console.log(`Tentative avec URL directe: ${altUrl}`);
                      setAlternativeVideoUrl(altUrl);
                    }}
                  />

                  {/* Indicateur de chargement superposé à la vidéo */}
                  {isVideoLoading && (
                    <View style={styles.loadingOverlay}>
                      <ThemedText type="defaultSemiBold">
                        Chargement de la vidéo...
                      </ThemedText>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.videoWrapper}>
                  <Image
                    source={require('@/assets/images/placeholder.png')}
                    style={styles.video}
                    resizeMode="contain"
                  />
                </View>
              )}
            </ThemedView>
          </ThemedView>

          {/* Conteneur squelette avec titre */}
          <ThemedView style={styles.sectionContainer}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Analyse posturale
            </ThemedText>
            <ThemedView style={styles.skeletonContainer}>
              {framesArray[frame] && (
                <SkeletonView
                  frame={getValidatedFrame(frame)}
                  isPlaying={isPlaying}
                  width={Dimensions.get('window').width - 32}
                  height={200}
                />
              )}
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Navigation des frames */}
        <FrameNavigator
          ref={frameNavigatorRef}
          frames={framesArray}
          currentFrame={frame}
          onFrameChange={newFrame => {
            setFrame(newFrame);
            setTimeout(() => scrollToSelected(newFrame), 100);
          }}
        />

        <VideoControls
          currentFrame={frame}
          totalFrames={framesArray.length}
          frames={framesArray}
          isPlaying={isPlaying}
          onPreviousFrame={() => {
            const newFrame = Math.max(0, frame - 1);
            updateFrame(newFrame);
          }}
          onNextFrame={() => {
            const newFrame = Math.min(framesArray.length - 1, frame + 1);
            updateFrame(newFrame);
          }}
          onResetFrame={() => {
            updateFrame(0);
          }}
          onPlayPauseToggle={togglePlayPause}
          onJumpToFrame={updateFrame}
        />

        {/* Section d'informations sur les données */}
        <AnalysisInfoCard
          analysisData={processedData.analysis_id}
          onHeaderPress={() => {}}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 24,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  videoContainer: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: color.colors.border,
  },
  skeletonContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: color.colors.border,
    backgroundColor: '#F8F8F8', // Léger gris pour un meilleur contraste
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  // Navigation buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  // Tips card
  tipsCard: {
    gap: 8,
    padding: 16,
    marginBottom: 16,
    maxHeight: 170,
  },
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seeMoreButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: color.colors.primaryForeground,
    borderRadius: 12,
  },
  seeMoreText: {
    color: color.colors.primary,
    fontWeight: '600',
  },
  tipsContainer: {
    gap: 12,
    paddingTop: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    marginRight: 8,
    color: color.colors.primary,
    fontSize: 18,
  },
  tipText: {
    flex: 1,
  },
  // Data Info Card
  dataInfoCard: {
    padding: 16,
    marginBottom: 16,
  },
  dataInfoHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.colors.border,
    paddingBottom: 8,
  },
  dataInfoContent: {
    gap: 8,
  },
  dataInfoItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  dataInfoLabel: {
    minWidth: 120,
    color: color.colors.primary,
  },
  dataInfoValue: {
    flex: 1,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: color.colors.primaryForeground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  videoExpandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomColor: color.colors.border,
    marginBottom: 8,
  },
  collapsedVideoPlaceholder: {
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.colors.border,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  stepText: {
    borderBottomWidth: 1,
    borderBottomColor: color.colors.border,
    width: '90%',
    textAlign: 'center',
  },
});
