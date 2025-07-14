/** @format */

import { useAuthFetch } from './auth';
import { API_URL } from '@env';

// Base API URL
const API_BASE_URL = API_URL; // Adjust as needed

export function useApi() {
  const authFetch = useAuthFetch();

  // Generic GET request with authentication
  const get = async <T,>(endpoint: string, headers?: any): Promise<T> => {
    const response = await authFetch(`${API_BASE_URL}${endpoint}`, {
      headers: headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  };

  // Generic POST request with authentication
  const post = async <T,>(endpoint: string, data: any): Promise<T> => {
    const response = await authFetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  };

  // Generic PUT request with authentication
  const put = async <T,>(endpoint: string, data: any): Promise<T> => {
    const response = await authFetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  };

  // Generic DELETE request with authentication
  const del = async <T,>(endpoint: string): Promise<T> => {
    const response = await authFetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  };

  // Analyze video with reference
  const analyzeVideo = async <T,>(
    email: string,
    videoId: string,
    referenceId: string,
  ): Promise<T> => {
    const data = {
      email,
      video_id: videoId,
      reference_id: referenceId,
    };

    console.log('Analyzing video:', {
      endpoint: `${API_BASE_URL}/process/analyze`,
      data,
    });

    const response = await authFetch(`${API_BASE_URL}/process/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Analysis failed');
    }

    return response.json();
  };

  // Upload file with authentication
  const uploadFile = async <T,>(
    endpoint: string,
    fileUri: string,
    exerciseId: string,
  ): Promise<T> => {
    // Créer le FormData
    const formData = new FormData();

    // Ajouter le fichier avec le nom "media" (pour multer)
    formData.append('media', {
      uri: fileUri,
      name: 'video.mp4',
      type: 'video/mp4',
    } as any);

    // Ajouter l'exercise_id
    formData.append('exercise_id', exerciseId);

    console.log('Uploading file:', {
      endpoint: `${API_BASE_URL}${endpoint}`,
      fileUri,
      exerciseId,
      formDataFields: {
        media: 'video file',
        exercise_id: exerciseId,
      },
    });

    try {
      const response = await authFetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Upload failed response:', {
          status: response.status,
          statusText: response.statusText,
          responseText: responseText,
        });

        // Essayer de parser la réponse JSON pour obtenir le message d'erreur
        let errorMessage = `Upload failed with status ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
          console.error('Parsed error data:', errorData);
        } catch (parseError) {
          console.error('Could not parse error response as JSON:', parseError);
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Upload successful:', result);

      // Retourner les données avec l'ID du processedData créé
      return result.data || result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  return {
    get,
    post,
    put,
    delete: del,
    uploadFile,
    analyzeVideo,
  };
}
