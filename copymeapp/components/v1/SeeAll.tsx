/** @format */

import { ArrowRight } from 'lucide-react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, TouchableOpacity } from 'react-native';
import color from '@/app/theme/color';
import { useNavigation } from '@react-navigation/native';
const SeeAll = ({ text, cta='See All', goTo }: { text: string, cta?: string, goTo: string }) => {
	const navigation = useNavigation();
	return (
		<ThemedView style={styles.container}>
			<ThemedText type='defaultSemiBold' style={styles.text}>
				{text}
			</ThemedText>
			<TouchableOpacity style={styles.seeAllContainer} onPress={() => (goTo ? navigation.navigate(goTo as never) : null)}>
				<ThemedText type='primary' style={styles.text}>
					{cta}
				</ThemedText>
				<ArrowRight color={color.colors.primary} />
			</TouchableOpacity>
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
