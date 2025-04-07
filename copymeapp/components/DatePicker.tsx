/** @format */

import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { CalendarIcon } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { Card } from './Card';

interface DatePickerProps {
	value: Date;
	onChange: (date: Date) => void;
	label?: string;
}

// Mois de l'année
const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

export function DatePicker({ value, onChange, label = 'Select date' }: DatePickerProps) {
	const [showPicker, setShowPicker] = useState(false);
	const [tempDate, setTempDate] = useState<Date>(value);
	const { colors } = useTheme();

	// Année courante et suivante pour le sélecteur
	const currentYear = new Date().getFullYear();
	const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

	// Format the date to display
	const formattedDate = value.toLocaleDateString();

	const handleSave = () => {
		onChange(tempDate);
		setShowPicker(false);
	};

	const handleDaySelect = (day: number) => {
		const newDate = new Date(tempDate);
		newDate.setDate(day);
		setTempDate(newDate);
	};

	const handleMonthSelect = (monthIndex: number) => {
		const newDate = new Date(tempDate);
		newDate.setMonth(monthIndex);
		setTempDate(newDate);
	};

	const handleYearSelect = (year: number) => {
		const newDate = new Date(tempDate);
		newDate.setFullYear(year);
		setTempDate(newDate);
	};

	// Générer les jours du mois actuel
	const getDaysInMonth = (year: number, month: number) => {
		return new Date(year, month + 1, 0).getDate();
	};

	const daysInMonth = getDaysInMonth(tempDate.getFullYear(), tempDate.getMonth());
	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

	return (
		<ThemedView style={styles.container}>
			{label && <ThemedText style={styles.label}>{label}</ThemedText>}

			<TouchableOpacity
				style={[styles.dateButton, { borderColor: colors.border }]}
				onPress={() => setShowPicker(true)}>
				<ThemedText>{formattedDate}</ThemedText>
				<CalendarIcon size={20} color={colors.text} />
			</TouchableOpacity>

			<Modal
				transparent={true}
				animationType='slide'
				visible={showPicker}
				onRequestClose={() => setShowPicker(false)}>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setShowPicker(false)}>
					<View style={[styles.modalContent, { backgroundColor: colors.background }]}>
						<Card style={styles.pickerCard}>
							<View style={styles.modalHeader}>
								<TouchableOpacity onPress={() => setShowPicker(false)}>
									<ThemedText style={styles.modalButton}>Cancel</ThemedText>
								</TouchableOpacity>
								<ThemedText style={styles.modalTitle}>
									{MONTHS[tempDate.getMonth()]} {tempDate.getFullYear()}
								</ThemedText>
								<TouchableOpacity onPress={handleSave}>
									<ThemedText style={[styles.modalButton, { color: 'gold' }]}>Done</ThemedText>
								</TouchableOpacity>
							</View>

							{/* Sélecteur de mois */}
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.monthsContainer}>
								{MONTHS.map((month, index) => (
									<TouchableOpacity
										key={month}
										style={[
											styles.monthItem,
											tempDate.getMonth() === index && { backgroundColor: 'gold' },
										]}
										onPress={() => handleMonthSelect(index)}>
										<ThemedText
											style={tempDate.getMonth() === index ? styles.selectedItemText : {}}>
											{month.substring(0, 3)}
										</ThemedText>
									</TouchableOpacity>
								))}
							</ScrollView>

							{/* Sélecteur d'année */}
							<View style={styles.yearSelector}>
								{years.map((year) => (
									<TouchableOpacity
										key={year}
										style={[
											styles.yearItem,
											tempDate.getFullYear() === year && { backgroundColor: 'gold' },
										]}
										onPress={() => handleYearSelect(year)}>
										<ThemedText
											style={tempDate.getFullYear() === year ? styles.selectedItemText : {}}>
											{year}
										</ThemedText>
									</TouchableOpacity>
								))}
							</View>

							{/* Sélecteur de jour */}
							<View style={styles.daysContainer}>
								{days.map((day) => (
									<TouchableOpacity
										key={day}
										style={[
											styles.dayItem,
											tempDate.getDate() === day && { backgroundColor: 'gold' },
										]}
										onPress={() => handleDaySelect(day)}>
										<ThemedText style={tempDate.getDate() === day ? styles.selectedItemText : {}}>
											{day}
										</ThemedText>
									</TouchableOpacity>
								))}
							</View>
						</Card>
					</View>
				</TouchableOpacity>
			</Modal>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 16,
	},
	label: {
		marginBottom: 8,
	},
	dateButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 12,
		borderWidth: 1,
		borderRadius: 8,
	},
	modalOverlay: {
		flex: 1,
		justifyContent: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		padding: 20,
	},
	modalContent: {
		borderRadius: 16,
		padding: 8,
	},
	pickerCard: {
		padding: 16,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	modalButton: {
		fontSize: 16,
		fontWeight: '600',
	},
	modalTitle: {
		fontSize: 16,
		fontWeight: '600',
	},
	monthsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		paddingVertical: 10,
		marginBottom: 10,
	},
	monthItem: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
		marginHorizontal: 4,
	},
	yearSelector: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		paddingVertical: 10,
		marginBottom: 20,
	},
	yearItem: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
	},
	daysContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
	},
	dayItem: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 20,
		margin: 4,
	},
	selectedItemText: {
		color: '#000',
		fontWeight: '600',
	},
});
