/** @format */

import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Award, LineChart, AlertCircle } from 'lucide-react-native';
import color from '@/app/theme/color';
import { useProcessedData } from '@/hooks/useProcessedData';

type RouteParams = {
  id: string;
  title?: string;
  score?: number;
  originalVideoUrl?: string;
  exerciseName?: string;
  backgroundAnalysis?: boolean;
};

export default function ExerciseResultsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const {
    id,
    title,
    score: routeScore,
    originalVideoUrl,
    exerciseName,
  } = route.params as RouteParams;

  // Utilise le hook pour récupérer les données d'analyse
  const {
    data: processedData,
    error,
    refresh,
  } = useProcessedData(
    id, // Utilise l'ID fourni ou l'ID par défaut
  );

  // Utilise le score de l'analyse si disponible, sinon utilise le score par défaut
  const score =
    processedData?.analysis_id?.analysis_summary?.summary
      ?.average_technical_score ||
    routeScore ||
    75;

  const getScoreMessage = (scoreValue: number) => {
    if (scoreValue >= 90) return 'Excellent!';
    if (scoreValue >= 80) return 'Great job!';
    if (scoreValue >= 70) return 'Good effort!';
    if (scoreValue >= 60) return 'Keep practicing!';
    return 'Needs improvement';
  };

  const getFeedback = (scoreValue: number): string[] => {
    // Si nous avons des recommandations de l'API, les utiliser
    const recommendations =
      processedData?.analysis_id?.analysis_summary?.recommendations;
    if (recommendations && recommendations.length > 0) {
      return recommendations.slice(0, 3);
    }

    // Sinon, utiliser les recommandations par défaut basées sur le score
    if (scoreValue >= 80) {
      return [
        'Your form is very good',
        'You have mastered the core technique',
        'Keep refining for perfection',
      ];
    } else if (scoreValue >= 60) {
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

  const handleRetry = () => {
    (navigation as any).goBack();
  };

  const handleViewAnalysis = () => {
    console.log('Navigating to analysis with ID:', id);
    (navigation as any).navigate('Analyze', {
      id,
      title: `${title} Analysis`,
      originalVideoUrl, // Passer l'URL de la vidéo originale à l'écran d'analyse
      exerciseName,
    });
  };

  // Affiche un message d'erreur si le chargement a échoué
  if (error && !processedData) {
    return (
      <ThemedView style={[styles.content, styles.centerContent]}>
        <AlertCircle size={40} color="red" />
        <ThemedText style={styles.errorText}>
          Erreur lors du chargement de l'analyse
        </ThemedText>
        <ThemedText style={styles.errorText}>
          Impossible de récupérer les données d'analyse pour le moment
        </ThemedText>
        <TouchableOpacity style={styles.tryAgainButton} onPress={refresh}>
          <ThemedText type="button">Réessayer</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={styles.content}>
        <ThemedView style={styles.scoreContainer}>
          <Award
            size={40}
            color={color.colors.primary}
            style={styles.awardIcon}
          />
          <ThemedText
            type="title"
            style={styles.scoreValue}
            adjustsFontSizeToFit={true}
            numberOfLines={1}
          >
            {Math.round(score)}/100
          </ThemedText>
          <ThemedText type="subtitle" style={styles.scoreMessage}>
            {getScoreMessage(score)}
          </ThemedText>

          {processedData?.analysis_id?.analysis_summary?.performance_rating && (
            <ThemedText type="subtitle" style={styles.performanceRating}>
              Performance:{' '}
              {processedData.analysis_id.analysis_summary.performance_rating}
            </ThemedText>
          )}
        </ThemedView>

        <Card style={styles.statsCard}>
          <ThemedView style={styles.statsGrid}>
            {processedData?.analysis_id?.analysis_summary?.summary
              ?.average_pose_quality ? (
              <>
                <ThemedView style={styles.statItem}>
                  <ThemedText type="defaultSemiBold">Équilibre</ThemedText>
                  <ThemedView style={styles.miniProgressContainer}>
                    <ThemedView style={styles.miniProgressBarContainer}>
                      <View
                        style={[
                          styles.miniProgressBar,
                          {
                            width: `${processedData.analysis_id.analysis_summary.summary.average_pose_quality.balance * 100}%`,
                            backgroundColor: color.colors.primary,
                          },
                        ]}
                      />
                    </ThemedView>
                    <ThemedText type="small">
                      {Math.round(
                        processedData.analysis_id.analysis_summary.summary
                          .average_pose_quality.balance * 100,
                      )}
                      %
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView style={styles.statItem}>
                  <ThemedText type="defaultSemiBold">Symétrie</ThemedText>
                  <ThemedView style={styles.miniProgressContainer}>
                    <ThemedView style={styles.miniProgressBarContainer}>
                      <View
                        style={[
                          styles.miniProgressBar,
                          {
                            width: `${processedData.analysis_id.analysis_summary.summary.average_pose_quality.symmetry * 100}%`,
                            backgroundColor: color.colors.primary,
                          },
                        ]}
                      />
                    </ThemedView>
                    <ThemedText type="small">
                      {Math.round(
                        processedData.analysis_id.analysis_summary.summary
                          .average_pose_quality.symmetry * 100,
                      )}
                      %
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView style={styles.statItem}>
                  <ThemedText type="defaultSemiBold">Stabilité</ThemedText>
                  <ThemedView style={styles.miniProgressContainer}>
                    <ThemedView style={styles.miniProgressBarContainer}>
                      <View
                        style={[
                          styles.miniProgressBar,
                          {
                            width: `${processedData.analysis_id.analysis_summary.summary.average_pose_quality.stability * 100}%`,
                            backgroundColor: color.colors.primary,
                          },
                        ]}
                      />
                    </ThemedView>
                    <ThemedText type="small">
                      {Math.round(
                        processedData.analysis_id.analysis_summary.summary
                          .average_pose_quality.stability * 100,
                      )}
                      %
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              </>
            ) : (
              <>
                <ThemedView style={styles.statItem}>
                  <ThemedText type="defaultSemiBold">Form</ThemedText>
                  <ThemedView style={styles.miniProgressContainer}>
                    <ThemedView style={styles.miniProgressBarContainer}>
                      <View
                        style={[
                          styles.miniProgressBar,
                          {
                            width: `${score - 5}%`,
                            backgroundColor: color.colors.primary,
                          },
                        ]}
                      />
                    </ThemedView>
                    <ThemedText type="small">
                      {Math.round(score - 5)}%
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView style={styles.statItem}>
                  <ThemedText type="defaultSemiBold">Execution</ThemedText>
                  <ThemedView style={styles.miniProgressContainer}>
                    <ThemedView style={styles.miniProgressBarContainer}>
                      <View
                        style={[
                          styles.miniProgressBar,
                          {
                            width: `${score + 5}%`,
                            backgroundColor: color.colors.primary,
                          },
                        ]}
                      />
                    </ThemedView>
                    <ThemedText type="small">
                      {Math.round(score + 5 > 100 ? 100 : score + 5)}%
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView style={styles.statItem}>
                  <ThemedText type="defaultSemiBold">Consistency</ThemedText>
                  <ThemedView style={styles.miniProgressContainer}>
                    <ThemedView style={styles.miniProgressBarContainer}>
                      <View
                        style={[
                          styles.miniProgressBar,
                          {
                            width: `${score - 10}%`,
                            backgroundColor: color.colors.primary,
                          },
                        ]}
                      />
                    </ThemedView>
                    <ThemedText type="small">
                      {Math.round(score - 10)}%
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <ThemedView style={styles.statItem}>
                  <ThemedText type="defaultSemiBold">Mechanics</ThemedText>
                  <ThemedView style={styles.miniProgressContainer}>
                    <ThemedView style={styles.miniProgressBarContainer}>
                      <View
                        style={[
                          styles.miniProgressBar,
                          {
                            width: `${score + 2}%`,
                            backgroundColor: color.colors.primary,
                          },
                        ]}
                      />
                    </ThemedView>
                    <ThemedText type="small">
                      {Math.round(score + 2 > 100 ? 100 : score + 2)}%
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              </>
            )}
          </ThemedView>
        </Card>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Feedback
        </ThemedText>

        <Card style={styles.feedbackCard}>
          <ThemedView style={styles.feedbackList}>
            {getFeedback(score).map((item: string, index: number) => (
              <ThemedView key={index} style={styles.feedbackItem}>
                <ThemedText type="defaultSemiBold" style={styles.bulletPoint}>
                  •
                </ThemedText>
                <ThemedText type="default">{item}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </Card>

        {processedData?.analysis_id?.global_feedback && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Feedback Global
            </ThemedText>
            <Card style={styles.feedbackCard}>
              <ThemedView style={styles.feedbackList}>
                <ThemedText type="default">
                  {processedData.analysis_id.global_feedback}
                </ThemedText>
              </ThemedView>
            </Card>
          </>
        )}

        {processedData?.analysis_id?.analysis_summary?.summary
          ?.improvement_breakdown && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Zones à améliorer
            </ThemedText>
            <Card style={styles.statsCard}>
              <ThemedView style={styles.statsGrid}>
                {Object.entries(
                  processedData.analysis_id.analysis_summary.summary
                    .improvement_breakdown,
                ).map(([key, value], index) => (
                  <ThemedView key={index} style={styles.statItem}>
                    <ThemedText type="defaultSemiBold">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </ThemedText>
                    <ThemedView style={styles.miniProgressContainer}>
                      <ThemedView style={styles.miniProgressBarContainer}>
                        <View
                          style={[
                            styles.miniProgressBar,
                            {
                              width: `${Math.min((value / (processedData?.analysis_id?.analysis_summary?.summary?.total_improvements_suggested || 100)) * 100, 100)}%`,
                              backgroundColor: '#FF6384',
                            },
                          ]}
                        />
                      </ThemedView>
                      <ThemedText type="small">{value}</ThemedText>
                    </ThemedView>
                  </ThemedView>
                ))}
              </ThemedView>
            </Card>
          </>
        )}

        {processedData?.analysis_id?.analysis_summary?.summary
          ?.total_frames_analyzed && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Statistiques d'analyse
            </ThemedText>
            <Card style={styles.feedbackCard}>
              <ThemedView style={styles.feedbackList}>
                <ThemedView style={styles.feedbackItem}>
                  <ThemedText type="defaultSemiBold" style={styles.bulletPoint}>
                    •
                  </ThemedText>
                  <ThemedText type="default">
                    Frames analysées:{' '}
                    {
                      processedData.analysis_id.analysis_summary.summary
                        .total_frames_analyzed
                    }
                  </ThemedText>
                </ThemedView>
                {processedData.analysis_id.analysis_summary.summary
                  .total_improvements_suggested && (
                  <ThemedView style={styles.feedbackItem}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.bulletPoint}
                    >
                      •
                    </ThemedText>
                    <ThemedText type="default">
                      Améliorations suggérées:{' '}
                      {
                        processedData.analysis_id.analysis_summary.summary
                          .total_improvements_suggested
                      }
                    </ThemedText>
                  </ThemedView>
                )}
                {processedData.analysis_id.metadata?.analysis_timestamp && (
                  <ThemedView style={styles.feedbackItem}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.bulletPoint}
                    >
                      •
                    </ThemedText>
                    <ThemedText type="default">
                      Temps d'analyse:{' '}
                      {Math.round(
                        processedData.analysis_id.metadata.analysis_timestamp /
                          1000,
                      )}{' '}
                      secondes
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
            </Card>
          </>
        )}

        {processedData?.analysis_id?.metadata?.phases_detected &&
          processedData.analysis_id.metadata.phases_detected.length > 0 && (
            <>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Phases détectées
              </ThemedText>
              <Card style={styles.phasesCard}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <ThemedView style={styles.phasesContainer}>
                    {processedData.analysis_id.metadata.phases_detected.map(
                      (phase, index) => {
                        // Obtenir le nom de la phase sans les underscores et la première lettre en majuscule
                        const phaseName = phase
                          .split('_')
                          .map(
                            word =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(' ');

                        return (
                          <ThemedView key={index} style={styles.phaseItem}>
                            <ThemedText style={styles.phaseText}>
                              {phaseName}
                            </ThemedText>
                          </ThemedView>
                        );
                      },
                    )}
                  </ThemedView>
                </ScrollView>
              </Card>
            </>
          )}

        <TouchableOpacity
          style={styles.analysisButton}
          onPress={handleViewAnalysis}
        >
          <LineChart size={20} color={color.colors.textForeground} />
          <ThemedText type="button">Analyse Détaillée</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tryAgainButton} onPress={handleRetry}>
          <ArrowLeft size={20} color={color.colors.textForeground} />
          <ThemedText type="button">Refaire l'exercice</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
          <ThemedText type="button">Rafraîchir l'analyse</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    marginBottom: 16,
    color: 'red',
    textAlign: 'center',
  },
  performanceRating: {
    marginTop: 8,
    color: color.colors.primary,
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
    color: color.colors.primary,
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
    color: color.colors.primary,
    marginRight: 8,
  },
  phasesCard: {
    marginBottom: 24,
    paddingVertical: 12,
  },
  phasesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  phaseItem: {
    backgroundColor: color.colors.primary + '20', // 20% d'opacité
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  phaseText: {
    color: color.colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  analysisButton: {
    backgroundColor: '#36A2EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  tryAgainButton: {
    backgroundColor: color.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  refreshButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: color.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 10,
    textAlign: 'center',
  },
  updateBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  updateBadgeText: {
    fontSize: 10,
    color: '#888',
  },
  autoRefreshDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.colors.primary,
    marginLeft: 8,
    opacity: 0.7,
  },
});
