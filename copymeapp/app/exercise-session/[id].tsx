/** @format */

import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedSafeAreaView, ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useRoute, useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import {
  Camera,
  Upload,
  X,
  VideoIcon,
  FileUp,
  Database,
  MessageSquare,
} from 'lucide-react-native';
import color from '@/app/theme/color';
import { useApi } from '@/utils/api';
import {
  launchImageLibrary,
  launchCamera,
  MediaType,
} from 'react-native-image-picker';

type RouteParams = {
  id: string;
  title?: string;
};

export default function ExerciseSessionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id, title } = route.params as RouteParams;
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [videoError, setVideoError] = useState(false);
  const api = useApi();

  const handleUploadVideo = async () => {
    const options = {
      mediaType: 'video' as MediaType,
      videoQuality: 'medium' as const,
      durationLimit: 60,
    };

    launchImageLibrary(options, response => {
      if (
        response.assets &&
        response.assets.length > 0 &&
        response.assets[0].uri
      ) {
        setUploadedVideo(response.assets[0].uri);
      } else if (response.errorMessage) {
        console.error(
          'Error picking video from library:',
          response.errorMessage,
        );
        Alert.alert('Error', 'Failed to pick video from library');
      }
    });
  };

  const handleCaptureVideo = async () => {
    const options = {
      mediaType: 'video' as MediaType,
      videoQuality: 'medium' as const,
      durationLimit: 60,
    };

    launchCamera(options, response => {
      if (
        response.assets &&
        response.assets.length > 0 &&
        response.assets[0].uri
      ) {
        setUploadedVideo(response.assets[0].uri);
      } else if (response.errorMessage) {
        console.error('Error recording video:', response.errorMessage);
        Alert.alert('Error', 'Failed to record video');
      }
    });
  };

  const handleSubmitVideo = async () => {
    if (!uploadedVideo) {
      Alert.alert('Error', 'Please upload or record a video first');
      return;
    }

    setProcessing(true);

    try {
      // Étape 1: Upload de la vidéo
      setProcessingStep('Get data from video');
      const data = (await api.uploadFile('/process', uploadedVideo, id)) as any;
      console.log('Video processed successfully:', data);

      // Étape 2: Déclencher l'analyse avec l'endpoint analyze et attendre la réponse
      console.log('Starting video analysis...');
      setProcessingStep('Analysing video');

      try {
        // Attendre que l'analyse soit terminée avant de continuer
        await api.analyzeVideo(
          'idriss.said@epitech.eu',
          data._id,
          '685d70063c2a10a5fd8a07ea',
        );
        console.log('Video analysis initiated successfully');
      } catch (error) {
        console.error('Analysis error:', error);
        // Continuer malgré l'erreur d'analyse, car nous avons déjà les données de base
      }

      // Navigation vers l'écran d'analyse après le démarrage de l'analyse
      (navigation as any).navigate('ExerciseResults', {
        id: data._id,
        title: title || 'Exercise Results',
        exerciseName: title || 'Exercise Results',
        backgroundAnalysis: true,
        originalVideoUrl: uploadedVideo, // Passer l'URL de la vidéo originale
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert(
        'Upload Failed',
        'There was an error processing your video. Please try again.',
      );
    } finally {
      setProcessing(false);
      setProcessingStep('');
    }
  };

  const handleCancelUpload = () => {
    setUploadedVideo(null);
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Banderole avec les étapes du processus */}
        <Card style={styles.stepsCard}>
          <ThemedView style={styles.stepsContainer}>
            <ThemedView
              style={[
                styles.stepItem,
                !uploadedVideo ? styles.activeStep : styles.completedStep,
              ]}
            >
              <ThemedView
                style={[
                  styles.stepCircle,
                  !uploadedVideo
                    ? styles.activeStepCircle
                    : styles.completedStepCircle,
                ]}
              >
                <FileUp
                  size={22}
                  color={!uploadedVideo ? color.colors.primary : 'white'}
                />
              </ThemedView>
              <ThemedText
                type="small"
                style={[
                  styles.stepText,
                  !uploadedVideo
                    ? styles.activeStepText
                    : styles.completedStepText,
                ]}
              >
                Upload
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.stepConnector} />

            <ThemedView
              style={[
                styles.stepItem,
                uploadedVideo &&
                processing &&
                processingStep === 'Get data from video'
                  ? styles.activeStep
                  : processingStep === 'Analysing video' ||
                      (uploadedVideo && !processing)
                    ? styles.completedStep
                    : styles.inactiveStep,
              ]}
            >
              <ThemedView
                style={[
                  styles.stepCircle,
                  uploadedVideo &&
                  processing &&
                  processingStep === 'Get data from video'
                    ? styles.activeStepCircle
                    : processingStep === 'Analysing video' ||
                        (uploadedVideo && !processing)
                      ? styles.completedStepCircle
                      : styles.inactiveStepCircle,
                ]}
              >
                <Database
                  size={22}
                  color={
                    uploadedVideo &&
                    processing &&
                    processingStep === 'Get data from video'
                      ? color.colors.primary
                      : processingStep === 'Analysing video' ||
                          (uploadedVideo && !processing)
                        ? 'white'
                        : '#aaa'
                  }
                />
              </ThemedView>
              <ThemedText
                type="small"
                style={[
                  styles.stepText,
                  uploadedVideo &&
                  processing &&
                  processingStep === 'Get data from video'
                    ? styles.activeStepText
                    : processingStep === 'Analysing video' ||
                        (uploadedVideo && !processing)
                      ? styles.completedStepText
                      : styles.inactiveStepText,
                ]}
              >
                Traitement
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.stepConnector} />

            <ThemedView
              style={[
                styles.stepItem,
                processingStep === 'Analysing video'
                  ? styles.activeStep
                  : styles.inactiveStep,
              ]}
            >
              <ThemedView
                style={[
                  styles.stepCircle,
                  processingStep === 'Analysing video'
                    ? styles.activeStepCircle
                    : styles.inactiveStepCircle,
                ]}
              >
                <MessageSquare
                  size={22}
                  color={
                    processingStep === 'Analysing video'
                      ? color.colors.primary
                      : '#aaa'
                  }
                />
              </ThemedView>
              <ThemedText
                type="small"
                style={[
                  styles.stepText,
                  processingStep === 'Analysing video'
                    ? styles.activeStepText
                    : styles.inactiveStepText,
                ]}
              >
                Analyse
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        <Card style={styles.uploadCard}>
          {!uploadedVideo ? (
            <ThemedView style={styles.placeholderContainer}>
              <VideoIcon size={48} color={color.colors.primary} />
              <ThemedText type="subtitle" style={styles.placeholderTitle}>
                Upload Your Video
              </ThemedText>
              <ThemedText type="default" style={styles.placeholderText}>
                Record a new video or upload an existing one to analyze your
                form
              </ThemedText>

              <ThemedView style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleUploadVideo}
                >
                  <Upload size={20} color={color.colors.textForeground} />
                  <ThemedText type="button">Upload Video</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={handleCaptureVideo}
                >
                  <Camera size={20} color={color.colors.primary} />
                  <ThemedText type="button" style={styles.cameraButtonText}>
                    Record Video
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          ) : (
            <ThemedView style={styles.videoPreviewContainer}>
              {!videoError ? (
                <Video
                  source={{ uri: uploadedVideo }}
                  style={styles.videoPreview}
                  resizeMode="cover"
                  paused={true}
                  muted={true}
                  controls={true}
                  onError={e => {
                    console.error('Erreur de prévisualisation vidéo:', e);
                    setVideoError(true);
                  }}
                />
              ) : (
                <ThemedView
                  style={[styles.videoPreview, styles.errorContainer]}
                >
                  <VideoIcon size={48} color={color.colors.primary} />
                  <ThemedText style={styles.errorText}>
                    Prévisualisation non disponible
                  </ThemedText>
                </ThemedView>
              )}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelUpload}
              >
                <X size={20} color={color.colors.textForeground} />
              </TouchableOpacity>
            </ThemedView>
          )}
        </Card>

        {uploadedVideo && (
          <TouchableOpacity
            style={[
              styles.submitButton,
              processing && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitVideo}
            disabled={processing}
          >
            <ThemedText type="button">
              {processing
                ? `${processingStep || 'Traitement en cours'}...`
                : 'Analyser la vidéo'}
            </ThemedText>
          </TouchableOpacity>
        )}

        {processing && (
          <Card style={styles.processingCard}>
            <ThemedText type="defaultSemiBold" style={styles.processingTitle}>
              Traitement en cours
            </ThemedText>
            <ThemedText type="default" style={styles.processingText}>
              {processingStep === 'Get data from video' &&
                'Téléchargement et traitement initial de la vidéo...'}
              {processingStep === 'Analysing video' &&
                'Analyse du mouvement et détection des phases...'}
              {!processingStep && "Préparation de l'analyse..."}
            </ThemedText>
            <ThemedText type="small" style={styles.processingNote}>
              Cette opération peut prendre jusqu'à 30 secondes selon la longueur
              de votre vidéo
            </ThemedText>
          </Card>
        )}
      </ScrollView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  uploadCard: {
    marginBottom: 24,
    padding: 24,
    overflow: 'hidden',
  },
  placeholderContainer: {
    padding: 24,
    alignItems: 'center',
  },
  placeholderTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  uploadButton: {
    backgroundColor: color.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  cameraButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: color.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  cameraButtonText: {
    color: color.colors.primary,
  },
  videoPreviewContainer: {
    position: 'relative',
  },
  videoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  cancelButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: color.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  processingCard: {
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
  },
  processingTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  processingText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  processingNote: {
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  // Styles pour la banderole des étapes
  stepsCard: {
    marginBottom: 24,
    padding: 16,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
  },
  activeStepCircle: {
    borderColor: color.colors.primary,
    backgroundColor: 'white',
  },
  completedStepCircle: {
    borderColor: color.colors.primary,
    backgroundColor: color.colors.primary,
  },
  inactiveStepCircle: {
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  stepText: {
    textAlign: 'center',
    fontSize: 12,
  },
  stepConnector: {
    height: 2,
    backgroundColor: '#e0e0e0',
    flex: 0.5,
  },
  activeStep: {
    opacity: 1,
  },
  completedStep: {
    opacity: 1,
  },
  inactiveStep: {
    opacity: 0.5,
  },
  activeStepText: {
    color: color.colors.primary,
    fontWeight: '600',
  },
  completedStepText: {
    color: color.colors.primary,
    fontWeight: '600',
  },
  inactiveStepText: {
    color: '#aaa',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    marginTop: 12,
    color: color.colors.primary,
    textAlign: 'center',
  },
});
