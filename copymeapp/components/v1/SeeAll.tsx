/** @format */

import { ArrowRight } from 'lucide-react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';
import color from '@/app/theme/color';

const SeeAll = ({ text, cta='See All' }: { text: string, cta?: string }) => {
	return (
		<ThemedView style={styles.container}>
			<ThemedText type='defaultSemiBold' style={styles.text}>
				{text}
			</ThemedText>
			<ThemedView style={styles.seeAllContainer}>
				<ThemedText type='primary' style={styles.text}>
					{cta}
				</ThemedText>
				<ArrowRight color={color.colors.primary} />
			</ThemedView>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
	text: {
    fontSize: 16,
    fontWeight: '600',
  },
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export default SeeAll;
