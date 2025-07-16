/** @format */

import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { WebView } from 'react-native-webview';
import Video from 'react-native-video';
import { useRoute } from '@react-navigation/native';
import { Lightbulb } from 'lucide-react-native';
import color from '@/app/theme/color';
import { useProcessedData } from '@/hooks/useProcessedData';
import AnalysisInfoCard from '@/components/v1/AnalysisInfoCard';
import FrameNavigator from '@/components/v1/FrameNavigator';
import VideoControls from '@/components/v1/VideoControls';

type RouteParams = {
  id: string;
  title?: string;
  exerciseName?: string;
  originalVideoUrl?: string;
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
  const { id, originalVideoUrl } = route.params as RouteParams;
  const frameNavigatorRef = React.useRef<any>(null);
  const [frame, setFrame] = useState(0);
  const [tipsExpanded, setTipsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useNativeVideo, setUseNativeVideo] = useState(
    Platform.OS === 'ios' && originalVideoUrl?.startsWith('file://'),
  );
  const webViewRef = React.useRef<WebView>(null);

  // Référence à la vidéo native pour contrôler la lecture
  const videoRef = React.useRef<any>(null);

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

  // Utilisation du hook useProcessedData
  const { data: processedData, loading, error, refresh } = useProcessedData(id);

  const generateVideoHTML = (videoUrl: string) => {
    // Correction pour les URLs de fichiers locaux
    let formattedUrl = videoUrl;

    // Vérifier si c'est une URL de fichier local (commence par "file://")
    if (videoUrl.startsWith('file://')) {
      // Sur iOS, les URL file:// ne fonctionnent pas directement dans les WebViews
      console.log("Utilisation d'une URL de fichier local:", videoUrl);

      // Si c'est iOS, nous utiliserons le composant Video natif à la place
      if (Platform.OS === 'ios') {
        setUseNativeVideo(true);
      }
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: transparent;
            overflow: hidden;
          }
          .video-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          video {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          .error-message {
            color: red;
            text-align: center;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div class="video-container">
          <video id="videoPlayer" controls playsinline webkit-playsinline>
            <source src="${formattedUrl}" type="video/mp4">
            <div class="error-message">
              Votre navigateur ne supporte pas la lecture de vidéos ou l'URL est invalide.
            </div>
          </video>
        </div>
        <script>
          const video = document.getElementById('videoPlayer');
          
          video.addEventListener('play', function() {
            window.ReactNativeWebView.postMessage('play');
          });
          
          video.addEventListener('pause', function() {
            window.ReactNativeWebView.postMessage('pause');
          });
          
          video.addEventListener('ended', function() {
            window.ReactNativeWebView.postMessage('ended');
          });
          
          // Ajouter la gestion des erreurs
          video.addEventListener('error', function(e) {
            console.error('Erreur de chargement vidéo:', e);
            window.ReactNativeWebView.postMessage('video-error:' + e.target.error.code);
          });
        </script>
      </body>
      </html>
    `;
  };

  const togglePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);

    if (useNativeVideo && videoRef.current) {
      // Si on utilise le composant Video natif
      if (newPlayingState) {
        videoRef.current.resume && videoRef.current.resume();
      } else {
        videoRef.current.pause && videoRef.current.pause();
      }
    } else if (webViewRef.current) {
      // Si on utilise WebView, injecter du JavaScript pour contrôler la vidéo
      const script = newPlayingState
        ? 'document.getElementById("videoPlayer").play(); true;'
        : 'document.getElementById("videoPlayer").pause(); true;';
      webViewRef.current.injectJavaScript(script);
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
          <ThemedView style={styles.videoContainer}>
            {originalVideoUrl || processedData.url ? (
              useNativeVideo ? (
                // Utiliser un composant Video natif pour les fichiers locaux sur iOS
                <Video
                  ref={videoRef}
                  source={{ uri: originalVideoUrl || '' }}
                  style={styles.video}
                  controls={true}
                  resizeMode="contain"
                  paused={!isPlaying}
                  onLoad={() => console.log('Video loaded')}
                  onError={videoErr => {
                    console.error('Video error:', videoErr);
                    // Si le Video natif échoue, essayons WebView
                    setUseNativeVideo(false);
                  }}
                />
              ) : (
                <WebView
                  ref={webViewRef}
                  source={{
                    html: generateVideoHTML(
                      originalVideoUrl || processedData.url || '',
                    ),
                  }}
                  style={styles.video}
                  allowsFullscreenVideo={true}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  mediaPlaybackRequiresUserAction={false}
                  originWhitelist={['*']}
                  startInLoadingState={true}
                  onMessage={event => {
                    const { data } = event.nativeEvent;
                    if (data === 'play') {
                      setIsPlaying(true);
                    } else if (data === 'pause' || data === 'ended') {
                      setIsPlaying(false);
                    } else if (data.startsWith('video-error:')) {
                      console.error(
                        'WebView video error code:',
                        data.split(':')[1],
                      );
                    }
                  }}
                  onError={syntheticEvent => {
                    const { nativeEvent } = syntheticEvent;
                    console.error('WebView error:', nativeEvent);
                  }}
                />
              )
            ) : (
              <Image
                source={require('@/assets/images/placeholder.png')}
                style={styles.video}
                resizeMode="contain"
              />
            )}
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
  videoContainer: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: color.colors.border,
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
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  navButton: {
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
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
