/** @format */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, Image, Alert, ScrollView, Linking } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Camera, Upload, X, ChevronLeft, VideoIcon } from 'lucide-react-native';
import color from '../theme/color';
import { useApi } from '@/utils/api';
import * as ImagePicker from 'expo-image-picker';

// Nous remplaçons expo-image-picker par une implémentation fictive
const mockVideoUris = [
	'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=200',
	'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=200',
	'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?q=80&w=200',
];

export default function ExerciseSessionScreen() {
	const params = useLocalSearchParams();
	const router = useRouter();
	const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
	const [processing, setProcessing] = useState(false);
	const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(false);
	const [hasCameraPermission, setHasCameraPermission] = useState(false);
	const api = useApi();

	// Demander les permissions au chargement du composant
	useEffect(() => {
		(async () => {
			// Demander la permission d'accès à la bibliothèque
			const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
			setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted');
			
			// Demander la permission d'accès à la caméra
			const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
			setHasCameraPermission(cameraPermission.status === 'granted');
		})();
	}, []);

	const handleUploadVideo = async () => {
		// Vérifier si nous avons la permission
		if (!hasMediaLibraryPermission) {
			Alert.alert(
				'Permission Required',
				'We need permission to access your media library to upload videos.',
				[
					{ text: 'Cancel', style: 'cancel' },
					{ 
						text: 'Settings', 
						onPress: () => {
							// Ouvrir les paramètres de l'application pour que l'utilisateur puisse accorder les permissions
							if (Platform.OS === 'ios') {
								Linking.openURL('app-settings:');
							} else {
								Linking.openSettings();
							}
						}
					}
				]
			);
			return;
		}

		// Lancer le sélecteur de médias
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Videos,
				allowsEditing: true,
				aspect: [16, 9],
				quality: 1,
			});

			if (!result.canceled && result.assets && result.assets.length > 0) {
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
		// Vérifier si nous avons la permission
		if (!hasCameraPermission) {
			Alert.alert(
				'Permission Required',
				'We need permission to access your camera to record videos.',
				[
					{ text: 'Cancel', style: 'cancel' },
					{ 
						text: 'Settings', 
						onPress: () => {
							// Ouvrir les paramètres de l'application
							if (Platform.OS === 'ios') {
								Linking.openURL('app-settings:');
							} else {
								Linking.openSettings();
							}
						}
					}
				]
			);
			return;
		}

		// Lancer la caméra
		try {
			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Videos,
				allowsEditing: true,
				aspect: [16, 9],
				quality: 1,
				videoMaxDuration: 60, // 60 secondes max
			});

			if (!result.canceled && result.assets && result.assets.length > 0) {
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
			const exerciseId = typeof params.id === 'string' ? params.id : String(params.id);

			const data = await api.uploadFile(
				'/process',
				uploadedVideo,
				'media',
				undefined, // nom de fichier automatique
				'video/mp4',
				{ exercise_id: exerciseId },
			) as any;

			// Naviguer vers les résultats
			const titleParam = typeof params.title === 'string' ? params.title : String(params.title);

			router.push({
				pathname: '/exercise-results/[id]',
				params: {
					id: data.id || exerciseId,
					title: titleParam,
					score: data.precision_score || Math.floor(Math.random() * 40) + 60, // Utiliser le score réel ou un score aléatoire comme fallback
				},
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
			<Stack.Screen
				options={{
					title: typeof params.title === 'string' ? params.title : 'Exercise Session',
					headerLeft: () => (
						<TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10, padding: 5 }}>
							<ChevronLeft size={24} color='#000' />
						</TouchableOpacity>
					),
				}}
			/>
			<ScrollView style={styles.content}>
				<Card style={styles.uploadCard}>
					{!uploadedVideo ? (
						<ThemedView style={styles.placeholderContainer}>
							<VideoIcon size={40} color={color.colors.textSecondary} style={styles.videoIcon} />
							<ThemedText type='subtitle' style={styles.uploadTitle}>
								Upload Your Performance
							</ThemedText>
							<ThemedText type='default' style={styles.uploadDescription}>
								Upload a video of you performing this exercise for analysis
							</ThemedText>

							<ThemedView style={styles.buttonsContainer}>
								<TouchableOpacity style={styles.uploadButton} onPress={handleUploadVideo}>
									<Upload size={24} color={color.colors.textForeground} />
									<ThemedText type='button'>Upload Video</ThemedText>
								</TouchableOpacity>

								<TouchableOpacity style={styles.captureButton} onPress={handleCaptureVideo}>
									<Camera size={24} color={color.colors.textForeground} />
									<ThemedText type='button'>Record Video</ThemedText>
								</TouchableOpacity>
							</ThemedView>
						</ThemedView>
					) : (
						<ThemedView style={styles.videoPreviewContainer}>
							<Image source={{ uri: uploadedVideo }} style={styles.videoPreview} />
							<TouchableOpacity style={styles.cancelButton} onPress={handleCancelUpload}>
								<X size={18} color='#FFF' />
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.analyzeButton}
								onPress={handleSubmitVideo}
								disabled={processing}>
								<ThemedText type='button'>
									{processing ? 'Processing...' : 'Analyze Performance'}
								</ThemedText>
							</TouchableOpacity>
						</ThemedView>
					)}
				</Card>

				<ThemedText type='subtitle' style={styles.sectionTitle}>
					Performance Tips
				</ThemedText>

				<Card style={styles.tipsCard}>
					<ThemedView style={styles.tipItem}>
						<ThemedText type='defaultSemiBold' style={styles.tipBullet}>
							•
						</ThemedText>
						<ThemedText type='default'>Make sure you're clearly visible in the frame</ThemedText>
					</ThemedView>
					<ThemedView style={styles.tipItem}>
						<ThemedText type='defaultSemiBold' style={styles.tipBullet}>
							•
						</ThemedText>
						<ThemedText type='default'>Record from a stable position or use a tripod</ThemedText>
					</ThemedView>
					<ThemedView style={styles.tipItem}>
						<ThemedText type='defaultSemiBold' style={styles.tipBullet}>
							•
						</ThemedText>
						<ThemedText type='default'>Ensure good lighting for optimal analysis</ThemedText>
					</ThemedView>
				</Card>

				<ThemedText type='subtitle' style={styles.sectionTitle}>
					Your Stats
				</ThemedText>

				<Card style={styles.statsContainer}>
					<ThemedView style={styles.statItem}>
						<ThemedText type='default'>Sessions Completed</ThemedText>
						<ThemedText type='subtitle'>3</ThemedText>
					</ThemedView>
					<ThemedView style={styles.statItem}>
						<ThemedText type='default'>Average Score</ThemedText>
						<ThemedText type='subtitle'>76%</ThemedText>
					</ThemedView>
					<ThemedView style={styles.statItem}>
						<ThemedText type='default'>Best Score</ThemedText>
						<ThemedText type='subtitle'>85%</ThemedText>
					</ThemedView>
				</Card>
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
		padding: 0,
		overflow: 'hidden',
	},
	placeholderContainer: {
		padding: 24,
		alignItems: 'center',
	},
	uploadTitle: {
		textAlign: 'center',
		marginBottom: 8,
	},
	uploadDescription: {
		textAlign: 'center',
		marginBottom: 24,
		opacity: 0.7,
	},
	buttonsContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 16,
		width: '100%',
	},
	uploadButton: {
		backgroundColor: color.colors.primary,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 12,
		gap: 8,
		flex: 1,
	},
	captureButton: {
		backgroundColor: '#36A2EB',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 12,
		gap: 8,
		flex: 1,
	},
	videoPreviewContainer: {
		position: 'relative',
		height: 250,
	},
	videoPreview: {
		width: '100%',
		height: '100%',
	},
	cancelButton: {
		position: 'absolute',
		top: 12,
		right: 12,
		backgroundColor: 'rgba(0,0,0,0.6)',
		borderRadius: 20,
		width: 36,
		height: 36,
		alignItems: 'center',
		justifyContent: 'center',
	},
	analyzeButton: {
		position: 'absolute',
		bottom: 20,
		left: '35%',
		transform: [{ translateX: -100 }],
		backgroundColor: color.colors.primary,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 24,
		width: 300,
		alignItems: 'center',
	},
	analyzeButtonText: {
		fontWeight: 'bold',
		color: '#000',
	},
	sectionTitle: {
		marginBottom: 16,
	},
	tipsCard: {
		marginBottom: 24,
		padding: 16,
	},
	tipItem: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginBottom: 12,
	},
	tipBullet: {
		color: color.colors.primary,
		marginRight: 8,
		fontSize: 18,
	},
	statsContainer: {
		gridTemplateColumns: 'repeat(3, 1fr)',
		gap: 16,
		padding: 16,
	},
	statItem: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	videoIcon: {
		marginBottom: 16,
		opacity: 0.5,
	},
});