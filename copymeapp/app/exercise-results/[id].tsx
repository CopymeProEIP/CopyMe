/** @format */

import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Share2, Home, Award, LineChart } from 'lucide-react-native';

export default function ExerciseResultsScreen() {
	const params = useLocalSearchParams();
	const router = useRouter();
	const score = Number(params.score) || 75;

	const getScoreMessage = (score: number) => {
		if (score >= 90) return 'Excellent!';
		if (score >= 80) return 'Great job!';
		if (score >= 70) return 'Good effort!';
		if (score >= 60) return 'Keep practicing!';
		return 'Needs improvement';
	};

	const getFeedback = (score: number) => {
		if (score >= 80) {
			return [
				'Your form is very good',
				'You have mastered the core technique',
				'Keep refining for perfection',
			];
		} else if (score >= 60) {
			return [
				'Your basic form is solid',
				'Work on your follow-through',
				'Focus on consistency in execution',
			];
		} else {
			return [
				'Review the fundamental technique',
				'Practice with slower, deliberate movements',
				'Consider getting guidance from a coach',
			];
		}
	};

	const handleGoHome = () => {
		router.replace('/(tabs)');
	};

	const handleRetry = () => {
		router.back();
	};

	const handleViewAnalysis = () => {
		const id = Array.isArray(params.id) ? params.id[0] : params.id;
		router.push({
			pathname: '/analysis/[id]',
			params: {
				id,
				title: `${params.title} Analysis`,
			},
		});
	};

	const handleShare = () => {
		alert('Sharing functionality would go here!');
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<ThemedView style={styles.container}>
				<ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
					<ThemedView style={styles.content}>
						<ThemedView style={styles.scoreContainer}>
							<Award size={40} color='gold' style={styles.awardIcon} />
							<ThemedText type='title' style={styles.scoreValue} adjustsFontSizeToFit={true} numberOfLines={1}>
								{score}/100
							</ThemedText>
							<ThemedText type='subtitle' style={styles.scoreMessage}>
								{getScoreMessage(score)}
							</ThemedText>
						</ThemedView>

						<Card style={styles.statsCard}>
							<ThemedView style={styles.statsGrid}>
								<ThemedView style={styles.statItem}>
									<ThemedText type='defaultSemiBold'>Form</ThemedText>
									<ThemedView style={styles.miniProgressContainer}>
										<ThemedView style={styles.miniProgressBarContainer}>
											<View
												style={[
													styles.miniProgressBar,
													{ width: `${score - 5}%`, backgroundColor: 'gold' },
												]}
											/>
										</ThemedView>
										<ThemedText type='small'>{score - 5}%</ThemedText>
									</ThemedView>
								</ThemedView>
								<ThemedView style={styles.statItem}>
									<ThemedText type='defaultSemiBold'>Execution</ThemedText>
									<ThemedView style={styles.miniProgressContainer}>
										<ThemedView style={styles.miniProgressBarContainer}>
											<View
												style={[
													styles.miniProgressBar,
													{ width: `${score + 5}%`, backgroundColor: 'gold' },
												]}
											/>
										</ThemedView>
										<ThemedText type='small'>{score + 5 > 100 ? 100 : score + 5}%</ThemedText>
									</ThemedView>
								</ThemedView>
								<ThemedView style={styles.statItem}>
									<ThemedText type='defaultSemiBold'>Consistency</ThemedText>
									<ThemedView style={styles.miniProgressContainer}>
										<ThemedView style={styles.miniProgressBarContainer}>
											<View
												style={[
													styles.miniProgressBar,
													{ width: `${score - 10}%`, backgroundColor: 'gold' },
												]}
											/>
										</ThemedView>
										<ThemedText type='small'>{score - 10}%</ThemedText>
									</ThemedView>
								</ThemedView>
								<ThemedView style={styles.statItem}>
									<ThemedText type='defaultSemiBold'>Mechanics</ThemedText>
									<ThemedView style={styles.miniProgressContainer}>
										<ThemedView style={styles.miniProgressBarContainer}>
											<View
												style={[
													styles.miniProgressBar,
													{ width: `${score + 2}%`, backgroundColor: 'gold' },
												]}
											/>
										</ThemedView>
										<ThemedText type='small'>{score + 2 > 100 ? 100 : score + 2}%</ThemedText>
									</ThemedView>
								</ThemedView>
							</ThemedView>
						</Card>

						<ThemedText type='subtitle' style={styles.sectionTitle}>
							Feedback
						</ThemedText>

						<Card style={styles.feedbackCard}>
							<ThemedView style={styles.feedbackList}>
								{getFeedback(score).map((item, index) => (
									<ThemedView key={index} style={styles.feedbackItem}>
										<ThemedText type='defaultSemiBold' style={styles.bulletPoint}>
											•
										</ThemedText>
										<ThemedText type='default'>{item}</ThemedText>
									</ThemedView>
								))}
							</ThemedView>
						</Card>

						<TouchableOpacity style={styles.analysisButton} onPress={handleViewAnalysis}>
							<LineChart size={20} color='#000' />
							<ThemedText style={styles.buttonText}>View Detailed Analysis</ThemedText>
						</TouchableOpacity>

						<TouchableOpacity style={styles.tryAgainButton} onPress={handleRetry}>
							<ArrowLeft size={20} color='#000' />
							<ThemedText style={styles.tryAgainText}>Try Again</ThemedText>
						</TouchableOpacity>
					</ThemedView>
				</ScrollView>
			</ThemedView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: 'white',
	},
	container: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(0,0,0,0.1)',
	},
	scrollContent: {
		flex: 1,
	},
	backButton: {
		padding: 8,
	},
	shareButton: {
		padding: 8,
	},
	content: {
		padding: 16,
	},
	scoreContainer: {
		alignItems: 'center',
		marginVertical: 24,
	},
	awardIcon: {
		marginBottom: 8,
	},
	scoreValue: {
		fontSize: 48,
		fontWeight: 'bold',
		color: 'gold',
		textAlign: 'center',
		includeFontPadding: false,
		width: '100%',
	},
	scoreMessage: {
		marginTop: 8,
	},
	statsCard: {
		marginBottom: 24,
	},
	statsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	statItem: {
		width: '50%',
		padding: 12,
	},
	miniProgressContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
		gap: 8,
	},
	miniProgressBarContainer: {
		flex: 1,
		height: 6,
		backgroundColor: 'rgba(0,0,0,0.05)',
		borderRadius: 3,
		overflow: 'hidden',
	},
	miniProgressBar: {
		height: '100%',
		borderRadius: 3,
	},
	sectionTitle: {
		marginBottom: 16,
	},
	feedbackCard: {
		marginBottom: 24,
	},
	feedbackList: {
		padding: 12,
	},
	feedbackItem: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginBottom: 12,
	},
	bulletPoint: {
		color: 'gold',
		marginRight: 8,
	},
	analysisButton: {
		backgroundColor: '#36A2EB',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 16,
		borderRadius: 12,
		marginBottom: 16,
	},
	buttonText: {
		marginLeft: 8,
		fontSize: 16,
		fontWeight: 'bold',
		color: '#000',
	},
	tryAgainButton: {
		backgroundColor: 'gold',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 16,
		borderRadius: 12,
		marginBottom: 24,
	},
	tryAgainText: {
		marginLeft: 8,
		fontSize: 16,
		fontWeight: 'bold',
		color: '#000',
	},
	headerTitle: {
		flex: 1,
		marginHorizontal: 10,
		textAlign: 'center',
	},
});
