/** @format */

import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../utils/api';

/**
 * Interface pour les données traitées
 * Adaptée à la structure réelle des données
 */
interface ProcessedData {
  _id: string;
  url?: string;
  exercise_id?: {
    name: string;
    description: string;
    category: string;
    difficulty: string;
    instructions: string;
    imageUrl: string;
    videoUrl: string;
    targetMuscles: string[];
    equipment: string[];
  };
  user_id?: string;
  role?: string;
  media_type?: string;
  frames?: any[];
  analysis_id?: {
    _id: string;
    success: boolean;
    video_id: string;
    analysis_summary: {
      summary: {
        total_frames_analyzed: number;
        average_technical_score: number;
        average_pose_quality: {
          balance: number;
          symmetry: number;
          stability: number;
        };
        total_improvements_suggested: number;
        improvement_breakdown: {
          [key: string]: number;
        };
      };
      performance_rating: string;
      recommendations: string[];
      average_pose_quality?: {
        balance: number;
        symmetry: number;
        stability: number;
      };
    };
    global_feedback: string;
    frame_analysis: any[];
    metadata: {
      total_frames: number;
      phases_detected: string[];
      analysis_timestamp: number;
    };
  };
}

/**
 * Hook pour récupérer les données traitées à partir d'un ID
 * @param processId ID du processus à récupérer (si non fourni, le hook ne fera pas de requête)
 */
export function useProcessedData(processId?: string) {
  const api = useApi();
  const [data, setData] = useState<ProcessedData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Fonction pour charger les données
  const fetchData = useCallback(async () => {
    if (!processId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await api.getProcessedData<ProcessedData>(processId);
      setData(result);
    } catch (err) {
      console.error('Error fetching processed data:', err);
      setError(
        err instanceof Error ? err : new Error('Une erreur est survenue'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Effet pour charger les données au montage ou quand l'ID change
  useEffect(() => {
    let isMounted = true;

    if (isMounted && processId) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Fonction pour forcer le rechargement manuel
  const refresh = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refresh,
  };
}
