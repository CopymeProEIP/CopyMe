/** @format */

import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import color from '@/app/theme/color';
import { ThemedView } from '@/components/ThemedView';
import { LineChart } from 'react-native-chart-kit';
import { TrendingUp } from 'lucide-react-native';

// Données du graphique
const chartData = [
	{ month: 'January', desktop: 55 },
	{ month: 'February', desktop: 40 },
	{ month: 'March', desktop: 34 },
	{ month: 'April', desktop: 50 },
	{ month: 'May', desktop: 68 },
	{ month: 'June', desktop: 80 },
];

// Configuration des couleurs du graphique
const chartConfig = {
	backgroundColor: color.colors.card,
	backgroundGradientFrom: color.colors.card,
	backgroundGradientTo: color.colors.card,
	decimalPlaces: 0,
	color: (opacity = 1) => {
		// Convertir la couleur primaire en format avec alpha personnalisé
		const primaryColor = color.colors.primary;
		// Si la couleur est au format hexadécimal (#RRGGBB)
		if (primaryColor.startsWith('#') && primaryColor.length >= 7) {
			const r = parseInt(primaryColor.slice(1, 3), 16);
			const g = parseInt(primaryColor.slice(3, 5), 16);
			const b = parseInt(primaryColor.slice(5, 7), 16);
			return `rgba(${r}, ${g}, ${b}, ${opacity * 0.8})`;
		}
		// Sinon, utiliser la couleur telle quelle avec l'opacité
		return `${primaryColor}${Math.floor(opacity * 204).toString(16).padStart(2, '0')}`;
	},
	labelColor: (opacity = 1) => color.colors.textPrimary,
	style: {
		borderRadius: 16,
	},
	propsForDots: {
		r: '6',
		strokeWidth: '2',
		stroke: color.colors.accent,
	},
};

// Adapter les données pour react-native-chart-kit
const data = {
	labels: chartData.map((item) => item.month.slice(0, 3)),
	datasets: [
		{
			data: chartData.map((item) => item.desktop),
			color: (opacity = 1) => {
				// Utiliser la même approche que dans chartConfig pour la cohérence
				const primaryColor = color.colors.primary;
				if (primaryColor.startsWith('#') && primaryColor.length >= 7) {
					const r = parseInt(primaryColor.slice(1, 3), 16);
					const g = parseInt(primaryColor.slice(3, 5), 16);
					const b = parseInt(primaryColor.slice(5, 7), 16);
					return `rgba(${r}, ${g}, ${b}, ${opacity * 0.8})`;
				}
				return `${primaryColor}${Math.floor(opacity * 204).toString(16).padStart(2, '0')}`;
			},
			strokeWidth: 2,
		},
	],
	legend: ['Score d\'alignement'],
};

const OverallStats = () => {
	const screenWidth = Dimensions.get('window').width - 32; // Largeur de l'écran moins la marge

	return (
		<Card style={styles.card}>
			<ThemedView style={styles.cardHeader}>
				<ThemedText type='subtitle' style={styles.cardTitle}>
					Shooting alignement
				</ThemedText>
				<ThemedText type='description' style={styles.cardDescription}>
					Analyse de l'alignement du tir sur les 6 derniers mois
				</ThemedText>
			</ThemedView>

			<ThemedView style={styles.cardContent}>
				<LineChart
					data={data}
					width={screenWidth}
					height={220}
					chartConfig={chartConfig}
					bezier
					style={styles.chart}
				/>
			</ThemedView>

			<ThemedView style={styles.cardFooter}>
				<ThemedView style={styles.footerContent}>
					<ThemedView style={styles.trendingContainer}>
						<ThemedText type='defaultSemiBold' style={styles.trendingText}>
							Trending up by 5.2% this month
						</ThemedText>
						<TrendingUp size={16} color={color.colors.textPrimary} />
					</ThemedView>
					<ThemedText type='small' style={styles.dateRange}>
						January - June 2024
					</ThemedText>
				</ThemedView>
			</ThemedView>
		</Card>
	);
};

const styles = StyleSheet.create({
	card: {
		padding: 0,
		overflow: 'hidden',
		borderRadius: 8,
		backgroundColor: color.colors.card,
		borderWidth: 1,
		borderColor: color.colors.border,
	},
	cardHeader: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: color.colors.border,
	},
	cardTitle: {
		marginBottom: 4,
	},
	cardDescription: {
		opacity: 0.7,
	},
	cardContent: {
		padding: 16,
		alignItems: 'center',
	},
	chart: {
		marginVertical: 8,
		borderRadius: 8,
	},
	cardFooter: {
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: color.colors.border,
	},
	footerContent: {
		width: '100%',
	},
	trendingContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 4,
	},
	trendingText: {
		fontSize: 14,
	},
	dateRange: {
		opacity: 0.7,
	},
});

export default OverallStats;
