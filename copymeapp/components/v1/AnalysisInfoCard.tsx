/** @format */

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { Info } from 'lucide-react-native';
import color from '@/app/theme/color';

type AnalysisInfoCardProps = {
  analysisData: any;
  onHeaderPress?: () => void;
};

const AnalysisInfoCard = ({
  analysisData,
  onHeaderPress,
}: AnalysisInfoCardProps) => {
  return (
    <Card style={styles.dataInfoCard}>
      <TouchableOpacity style={styles.dataInfoHeader} onPress={onHeaderPress}>
        <ThemedView style={styles.headerView}>
          <Info color={color.colors.primary} />
          <ThemedText type="subtitle">Informations d'analyse</ThemedText>
        </ThemedView>
      </TouchableOpacity>

      <ThemedView style={styles.dataInfoContent}>
        {analysisData ? (
          <>
            <ThemedView style={styles.dataInfoItem}>
              <ThemedText type="defaultSemiBold" style={styles.dataInfoLabel}>
                Score technique:
              </ThemedText>
              <ThemedText type="default" style={styles.dataInfoValue}>
                {analysisData.analysis_summary.summary.average_technical_score
                  ? Number(
                      analysisData.analysis_summary.summary
                        .average_technical_score,
                    ).toFixed(1)
                  : 'N/A'}
                /100
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.dataInfoItem}>
              <ThemedText type="defaultSemiBold" style={styles.dataInfoLabel}>
                Évaluation:
              </ThemedText>
              <ThemedText type="default" style={styles.dataInfoValue}>
                {analysisData.analysis_summary.performance_rating || 'N/A'}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.dataInfoItem}>
              <ThemedText type="defaultSemiBold" style={styles.dataInfoLabel}>
                Frames analysées:
              </ThemedText>
              <ThemedText type="default" style={styles.dataInfoValue}>
                {analysisData.analysis_summary.summary.total_frames_analyzed ||
                  'N/A'}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.dataInfoItem}>
              <ThemedText type="defaultSemiBold" style={styles.dataInfoLabel}>
                Feedback global:
              </ThemedText>
              <ThemedText type="default" style={styles.dataInfoValue}>
                {analysisData.global_feedback || 'N/A'}
              </ThemedText>
            </ThemedView>
          </>
        ) : (
          <ThemedText type="default">
            Aucune analyse avancée disponible pour cette vidéo.
          </ThemedText>
        )}
      </ThemedView>
    </Card>
  );
};

const styles = StyleSheet.create({
  dataInfoCard: {
    padding: 16,
    marginBottom: 16,
  },
  dataInfoHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.colors.border,
    paddingBottom: 8,
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dataInfoContent: {
    gap: 8,
  },
  dataInfoItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  dataInfoLabel: {
    minWidth: 120,
    color: color.colors.primary,
  },
  dataInfoValue: {
    flex: 1,
  },
});

export default AnalysisInfoCard;
