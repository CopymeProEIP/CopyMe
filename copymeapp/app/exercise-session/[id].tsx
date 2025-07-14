/** @format */

import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedSafeAreaView, ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Camera, Upload, X, VideoIcon } from 'lucide-react-native';
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

      // Étape 2: Déclencher l'analyse avec l'endpoint analyze
      setProcessingStep('Analyze movement');
      console.log('Starting video analysis...');
      const analysisResult = await api.analyzeVideo(
        'idriss.said@epitech.eu', // TODO: Récupérer l'email de l'utilisateur connecté
        data._id,
        '685d70063c2a10a5fd8a07ea', // TODO: Utiliser l'ID d'une vraie vidéo de référence
      );
      console.log('Analysis completed:', analysisResult);

      // Navigation vers l'écran d'analyse
      (navigation as any).navigate('Analyze', {
        id: data._id,
        title: title || 'Exercise Analysis',
        exerciseName: title || 'Exercise Analysis',
      });
    } catch (error) {
      console.error('Error uploading/analyzing video:', error);
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
              <Image
                source={{ uri: uploadedVideo }}
                style={styles.videoPreview}
              />
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
              {processing ? processingStep || 'Processing...' : 'Analyze Video'}
            </ThemedText>
          </TouchableOpacity>
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
});
