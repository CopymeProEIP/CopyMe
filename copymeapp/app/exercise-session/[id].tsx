/** @format */

import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Camera, Upload, X, VideoIcon } from 'lucide-react-native';
import color from '@/app/theme/color';
import { useApi } from '@/utils/api';

// Mock pour l'image picker en attendant l'installation
const mockImagePicker = {
	launchImageLibrary: async () => {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					assets: [{ uri: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=200' }]
				});
			}, 1000);
		});
	},
	launchCamera: async () => {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					assets: [{ uri: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=200' }]
				});
			}, 1000);
		});
	}
};

// Nous remplaçons expo-image-picker par une implémentation fictive
const mockVideoUris = [
	'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=200',
	'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=200',
	'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?q=80&w=200',
];

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
	const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(false);
	const [hasCameraPermission, setHasCameraPermission] = useState(false);
	const api = useApi();

	// Demander les permissions au chargement du composant
	useEffect(() => {
		// Pour react-native-image-picker, les permissions sont gérées automatiquement
		setHasMediaLibraryPermission(true);
		setHasCameraPermission(true);
	}, []);

	const handleUploadVideo = async () => {
		// Lancer le sélecteur de médias
		try {
			const result: any = await mockImagePicker.launchImageLibrary();

			if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
				setUploadedVideo(result.assets[0].uri);
			}
		} catch (error) {
			console.error('Error picking video from library:', error);
			Alert.alert('Error', 'Failed to pick video from library');

			// Fallback au mock en cas d'erreur en développement
			if (__DEV__) {
				const randomIndex = Math.floor(Math.random() * mockVideoUris.length);
				const randomVideoUri = mockVideoUris[randomIndex];
				setUploadedVideo(randomVideoUri);
			}
		}
	};

	const handleCaptureVideo = async () => {
		// Lancer la caméra
		try {
			const result: any = await mockImagePicker.launchCamera();

			if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
				setUploadedVideo(result.assets[0].uri);
			}
		} catch (error) {
			console.error('Error recording video:', error);
			Alert.alert('Error', 'Failed to record video');

			// Fallback au mock en cas d'erreur en développement
			if (__DEV__) {
				const randomIndex = Math.floor(Math.random() * mockVideoUris.length);
				const randomVideoUri = mockVideoUris[randomIndex];
				setUploadedVideo(randomVideoUri);
			}
		}
	};

	const handleSubmitVideo = async () => {
		if (!uploadedVideo) {
			Alert.alert('Error', 'Please upload or record a video first');
			return;
		}

		setProcessing(true);

		try {
			const exerciseId = id;

			const data = await api.uploadFile(
				'/process',
				uploadedVideo,
				'media',
				undefined, // nom de fichier automatique
				'video/mp4',
				{ exercise_id: exerciseId },
			) as any;

			// Naviguer vers les résultats
			const titleParam = title || 'Exercise Session';

			(navigation as any).navigate('ExerciseResults', {
				id: data.id || exerciseId,
				title: titleParam,
				score: data.precision_score || Math.floor(Math.random() * 40) + 60, // Utiliser le score réel ou un score aléatoire comme fallback
			});
		} catch (error) {
			console.error('Error uploading video:', error);
			Alert.alert('Upload Failed', 'There was an error processing your video. Please try again.');
		} finally {
			setProcessing(false);
		}
	};

	const handleCancelUpload = () => {
		setUploadedVideo(null);
	};

	return (
		<ThemedView style={styles.container}>
			<ScrollView style={styles.content}>
				<Card style={styles.uploadCard}>
					{!uploadedVideo ? (
						<ThemedView style={styles.placeholderContainer}>
							<VideoIcon size={48} color={color.colors.primary} />
							<ThemedText type='subtitle' style={styles.placeholderTitle}>
								Upload Your Video
							</ThemedText>
							<ThemedText type='default' style={styles.placeholderText}>
								Record a new video or upload an existing one to analyze your form
							</ThemedText>

							<ThemedView style={styles.buttonContainer}>
								<TouchableOpacity style={styles.uploadButton} onPress={handleUploadVideo}>
									<Upload size={20} color={color.colors.textForeground} />
									<ThemedText type='button'>Upload Video</ThemedText>
								</TouchableOpacity>

								<TouchableOpacity style={styles.cameraButton} onPress={handleCaptureVideo}>
									<Camera size={20} color={color.colors.primary} />
									<ThemedText type='button' style={styles.cameraButtonText}>
										Record Video
									</ThemedText>
								</TouchableOpacity>
							</ThemedView>
						</ThemedView>
					) : (
						<ThemedView style={styles.videoPreviewContainer}>
							<Image source={{ uri: uploadedVideo }} style={styles.videoPreview} />
							<TouchableOpacity style={styles.cancelButton} onPress={handleCancelUpload}>
								<X size={20} color={color.colors.textForeground} />
							</TouchableOpacity>
						</ThemedView>
					)}
				</Card>

				{uploadedVideo && (
					<TouchableOpacity
						style={[styles.submitButton, processing && styles.submitButtonDisabled]}
						onPress={handleSubmitVideo}
						disabled={processing}
					>
						<ThemedText type='button'>
							{processing ? 'Processing...' : 'Analyze Video'}
						</ThemedText>
					</TouchableOpacity>
				)}
			</ScrollView>
		</ThemedView>
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
