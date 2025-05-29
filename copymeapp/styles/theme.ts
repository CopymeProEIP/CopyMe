/** @format */

export const theme = {
	colors: {
		primary: 'gold',
		secondary: '#36A2EB',
		danger: '#FF6384',
		background: '#FFFFFF',
		text: '#11181C',
		border: '#E5E5E5',
		lightBackground: 'rgba(255,215,0,0.2)', // gold avec opacité
	},
	spacing: {
		xs: 4,
		sm: 8,
		md: 16,
		lg: 24,
		xl: 32,
	},
	borderRadius: {
		small: 4,
		medium: 8,
		large: 12,
		extraLarge: 16,
		pill: 20,
		circle: 50,
	},
	typography: {
		fontSize: {
			small: 12,
			default: 16,
			subtitle: 20,
			title: 32,
		},
		fontWeight: {
			regular: 'normal',
			medium: '600',
			bold: 'bold',
		},
	},
	shadows: {
		small: {
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.1,
			shadowRadius: 2,
			elevation: 2,
		},
		medium: {
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.15,
			shadowRadius: 3.84,
			elevation: 5,
		},
	},
};

export function getProgressColor(progress: number): string {
	if (progress >= 80) return theme.colors.primary;
	if (progress >= 60) return theme.colors.secondary;
	return theme.colors.danger;
}
