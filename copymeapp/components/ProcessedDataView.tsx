/** @format */

import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  StyleSheet,
} from 'react-native';
import { useProcessedData } from '../hooks/useProcessedData';

interface ProcessDataViewProps {
  processId: string;
}

export const ProcessedDataView: React.FC<ProcessDataViewProps> = ({
  processId,
}) => {
  // Utilisation du hook avec un rafraîchissement automatique toutes les 5 secondes
  const { data, loading, error, refresh } = useProcessedData(processId, 5000);

  if (loading && !data) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erreur: {error.message}</Text>
        <Button title="Réessayer" onPress={refresh} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <Text>Aucune donnée disponible</Text>
        <Button title="Charger les données" onPress={refresh} />
      </View>
    );
  }

  // Exemple d'affichage des données
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Données traitées</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>ID:</Text>
        <Text style={styles.value}>{data.id}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Statut:</Text>
        <Text style={styles.value}>{data.status}</Text>
      </View>

      {data.video_id && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Vidéo ID:</Text>
          <Text style={styles.value}>{data.video_id}</Text>
        </View>
      )}

      {data.reference_id && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Référence ID:</Text>
          <Text style={styles.value}>{data.reference_id}</Text>
        </View>
      )}

      {data.created_at && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Créé le:</Text>
          <Text style={styles.value}>
            {new Date(data.created_at).toLocaleString()}
          </Text>
        </View>
      )}

      {data.results && (
        <View style={styles.resultSection}>
          <Text style={styles.subTitle}>Résultats:</Text>
          <Text style={styles.jsonText}>
            {JSON.stringify(data.results, null, 2)}
          </Text>
        </View>
      )}

      <Button title="Rafraîchir" onPress={refresh} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    width: 100,
  },
  value: {
    flex: 1,
  },
  resultSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  jsonText: {
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  loadingText: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
});
