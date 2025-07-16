/** @format */

import { ProcessedData } from '@/constants/processedData';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import color from '@/app/theme/color';

const ReviewItem = ({ item }: { item: Partial<ProcessedData> }) => {
  if (!item || item.is_reference) {
    return null;
  }
  const formattedDate = item.created_at
    ? new Date(item.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : item.updated_at
      ? new Date(item.updated_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A';

  return (
    <ThemedView style={styles.container}>
      <ThemedView>
        <ThemedText type="defaultSemiBold">
          {item?.exercise_id ? item?.exercise_id.name : 'No name'}
        </ThemedText>
        <ThemedText type="small">{formattedDate}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.scoreContainer}>
        <ThemedText type="subtitle" style={styles.scoresText}>
          {item.analysis_id?.analysis_summary?.summary?.average_pose_quality
            ?.symmetry
            ? Number(
                item.analysis_id.analysis_summary.summary.average_pose_quality
                  .symmetry,
              ).toFixed(1)
            : 'NAN'}
          %
        </ThemedText>
        <ThemedText>Symmetry</ThemedText>
      </ThemedView>
      <ThemedView style={styles.scoreContainer}>
        <ThemedText type="subtitle" style={styles.scoresText}>
          {item.analysis_id?.analysis_summary?.summary?.average_technical_score
            ? Number(
                item.analysis_id.analysis_summary.summary
                  .average_technical_score,
              ).toFixed(1)
            : 'NAN'}
          %
        </ThemedText>
        <ThemedText>Technical</ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: color.colors.card,
    borderColor: color.colors.border,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoresText: {
    color: color.colors.success,
  },
  scoreContainer: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
});

export default ReviewItem;
