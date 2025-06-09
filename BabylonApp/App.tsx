/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

import { useEngine, EngineView } from '@babylonjs/react-native';
import {
  ArcRotateCamera,
  Camera,
  Scene,
  SceneLoader,
  Color4,
  AnimationGroup,
  Nullable,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  AbstractMesh,
  TransformNode,
  BoundingInfo,
  Mesh,
  Tools,
  AssetContainer,
  Engine
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

import { requestRequiredPermissions } from './src/utils/permissions';

function App(): React.JSX.Element {
  // URL du modèle GLTF
  const basicGLTFURL = 'https://raw.githubusercontent.com/thechaudharysab/babylonjspoc/main/src/assets/Client.gltf';
  
  // URL alternative si la première ne fonctionne pas
  const fallbackGLTFURL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF/Duck.gltf';
  
  // URL alternative simple pour tests
  const boxURL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF/Box.gltf';

  const engine = useEngine();
  const [scene, setScene] = useState<Scene | undefined>();
  const [camera, setCamera] = useState<Camera | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('Initialisation...');
  const [animations, setAnimations] = useState<AnimationGroup[]>([]);
  const [currentAnimation, setCurrentAnimation] = useState<Nullable<AnimationGroup>>(null);
  const [urlToLoad, setUrlToLoad] = useState<string>(boxURL); // Commencer avec le modèle le plus simple
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [forceStart, setForceStart] = useState<boolean>(false);
  const [engineInitialized, setEngineInitialized] = useState<boolean>(false);
  
  // Référence pour suivre le temps d'attente
  const engineWaitTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Vérifier si le moteur est initialisé
  useEffect(() => {
    if (engine) {
      setEngineInitialized(true);
      setDebugInfo('Engine disponible et initialisé');
      console.log('Engine disponible et initialisé');
    } else {
      console.log('Engine non disponible');
      setDebugInfo('Engine non disponible');
    }
  }, [engine]);
  
  // Vérifier et demander les permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        setLoadingStatus('Vérification des permissions...');
        setDebugInfo('Vérification des permissions caméra');
        console.log('Vérification des permissions...');
        const granted = await requestRequiredPermissions();
        setPermissionsGranted(granted);
        console.log('Permissions accordées:', granted);
        setDebugInfo('Permissions caméra: ' + (granted ? 'ACCORDÉES' : 'REFUSÉES'));
        
        if (granted) {
          setLoadingStatus('Permissions accordées, initialisation du moteur 3D...');
        } else {
          setError('Permissions caméra requises pour utiliser cette application');
        }
      } catch (err) {
        console.error('Erreur de permission:', err);
        setDebugInfo('Erreur permissions: ' + err);
        setError('Erreur lors de la vérification des permissions');
      }
    };
    
    checkPermissions();
  }, []);

  // Créer la scène lorsque le moteur est prêt et les permissions accordées, ou si forceStart est true
  useEffect(() => {
    if (!permissionsGranted) {
      return;
    }
    
    // Si le moteur n'est pas prêt et qu'on ne force pas le démarrage
    if (!engine && !forceStart) {
      console.log('Moteur non disponible, attente...');
      setDebugInfo('Attente du moteur BabylonJS...');
      setLoadingStatus('Initialisation du moteur 3D...');
      
      // Définir un timer pour afficher un message après un certain temps
      if (!engineWaitTimerRef.current) {
        engineWaitTimerRef.current = setTimeout(() => {
          console.log('Timeout atteint pour l\'initialisation du moteur');
          setDebugInfo('TIMEOUT: Moteur BabylonJS non initialisé après 15 secondes');
          setLoadingStatus('Le moteur 3D prend trop de temps à s\'initialiser');
        }, 15000); // 15 secondes
      }
      
      return;
    }
    
    // Annuler le timer si on arrive ici
    if (engineWaitTimerRef.current) {
      clearTimeout(engineWaitTimerRef.current);
      engineWaitTimerRef.current = null;
    }
    
    console.log('Moteur ou force start activé, création de la scène');
    setDebugInfo(`Création scène - Engine: ${engine ? 'OUI' : 'NON'}, Force: ${forceStart ? 'OUI' : 'NON'}`);
    createScene();
    
    return () => {
      if (scene) {
        scene.dispose();
      }
      
      // Arrêter l'animation en cours
      if (currentAnimation) {
        currentAnimation.stop();
      }
    };
  }, [engine, permissionsGranted, forceStart]);

  // Créer la scène même sans moteur si forceStart est true
  const createScene = async () => {
    if (!engine && !forceStart) {
      setDebugInfo('Impossible de créer la scène: moteur non disponible et force start désactivé');
      return;
    }
    
    try {
      setLoadingStatus('Création de la scène...');
      setDebugInfo('Début création scène');
      
      // Activer les logs complets
      Tools.Log = console.log;
      Tools.Warn = console.warn;
      Tools.Error = console.error;
      
      // Si on force le démarrage sans moteur, créer un cube statique comme fallback
      if (!engine && forceStart) {
        console.log('Force start activé mais pas de moteur, affichage statique');
        setDebugInfo('Mode secours: pas de moteur 3D, affichage statique');
        setLoadingStatus('Mode secours activé: moteur 3D non disponible');
        setModelLoaded(true);
        setLoading(false);
        return;
      }
      
      // Créer une nouvelle scène comme dans l'exemple Playground
      const newScene = new Scene(engine!);
      newScene.clearColor = new Color4(0.8, 0.9, 1.0, 1.0);
      
      // Créer une caméra comme dans l'exemple
      const newCamera = new ArcRotateCamera(
        "camera1", 
        Math.PI / 2, 
        Math.PI / 2.5, 
        10, 
        Vector3.Zero(),
        newScene
      );
      newCamera.attachControl(true);
      
      // Créer une lumière comme dans l'exemple
      const light = new HemisphericLight(
        "light", 
        new Vector3(0, 1, 0), 
        newScene
      );
      light.intensity = 0.7;
      
      // Mettre à jour les états
      setScene(newScene);
      setCamera(newCamera);
      setDebugInfo('Scène créée, caméra et lumière configurées');
      
      // Charger le modèle exactement comme dans l'exemple Playground
      await loadGLTFModel(newScene, newCamera);
    } catch (err) {
      console.error('Erreur lors de la création de la scène:', err);
      setDebugInfo(`Erreur création scène: ${err}`);
      setError(`Erreur lors de la création de la scène 3D: ${err}`);
      setLoading(false);
    }
  };
  
  // Fonction pour charger le modèle GLTF exactement comme dans l'exemple Playground
  const loadGLTFModel = async (newScene: Scene, newCamera: Camera) => {
    try {
      setLoadingStatus(`Chargement du modèle 3D: ${urlToLoad}`);
      setDebugInfo(`Tentative de chargement: ${urlToLoad}`);
      console.log("Chargement du modèle GLTF:", urlToLoad);
      
      // Définir un timeout pour détecter si le chargement est bloqué
      const loadingTimeout = setTimeout(() => {
        console.warn('Timeout de chargement, tentative avec URL alternative');
        setDebugInfo('Timeout atteint - chargement bloqué');
        
        if (urlToLoad === basicGLTFURL) {
          setUrlToLoad(fallbackGLTFURL);
        } else if (urlToLoad === fallbackGLTFURL) {
          setUrlToLoad(boxURL);
        } else {
          setError('Impossible de charger le modèle 3D après plusieurs tentatives');
          setLoading(false);
        }
      }, 15000); // 15 secondes de timeout
      
      try {
        // Code simplifié exactement comme dans l'exemple Playground
        console.log('Début LoadAssetContainerAsync');
        setDebugInfo('Appel à LoadAssetContainerAsync...');
        
        // Sans callback de progression pour simplifier
        const container = await SceneLoader.LoadAssetContainerAsync("", urlToLoad, newScene);
        console.log('Chargement réussi, ajout à la scène');
        setDebugInfo('Modèle chargé avec succès');
        
        // Ajouter tous les éléments à la scène
        container.addAllToScene();
        console.log('Éléments ajoutés à la scène');
        
        // Annuler le timeout
        clearTimeout(loadingTimeout);
        
        // Centrer la caméra sur le premier mesh
        if (container.meshes.length > 0) {
          console.log(`${container.meshes.length} meshes trouvés`);
          setDebugInfo(`${container.meshes.length} meshes trouvés`);
          
          const rootMesh = container.meshes[0];
          if (newCamera instanceof ArcRotateCamera) {
            newCamera.setTarget(rootMesh.position);
          }
        } else {
          console.log('Aucun mesh trouvé');
          setDebugInfo('Aucun mesh trouvé');
        }
        
        // Récupérer les animations disponibles
        if (container.animationGroups && container.animationGroups.length > 0) {
          console.log(`${container.animationGroups.length} animations trouvées`);
          setAnimations(container.animationGroups);
          
          // Démarrer la première animation
          if (container.animationGroups[0]) {
            container.animationGroups[0].start(true);
            setCurrentAnimation(container.animationGroups[0]);
          }
        }
        
        console.log("Modèle GLTF chargé avec succès !");
        setLoadingStatus('Chargement terminé!');
        setModelLoaded(true);
        setLoading(false);
      } catch (loadError) {
        console.error("Erreur lors du chargement avec LoadAssetContainerAsync:", loadError);
        setDebugInfo(`Erreur LoadAssetContainer: ${loadError}`);
        clearTimeout(loadingTimeout);
        
        // Si l'URL principale échoue, essayer l'URL de secours
        if (urlToLoad === basicGLTFURL) {
          console.log('Tentative avec l\'URL de secours (canard)');
          setUrlToLoad(fallbackGLTFURL);
        } else if (urlToLoad === fallbackGLTFURL) {
          console.log('Tentative avec l\'URL de secours (boîte)');
          setUrlToLoad(boxURL);
        } else {
          setError(`Erreur lors du chargement du modèle 3D: ${loadError}`);
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Erreur générale lors du chargement du modèle GLTF:', err);
      setDebugInfo(`Erreur générale: ${err}`);
      setError(`Erreur lors du chargement du modèle 3D: ${err}`);
      setLoading(false);
    }
  };
  
  // Fonction pour jouer une animation spécifique
  const playAnimation = (index: number) => {
    if (animations && animations.length > 0 && index < animations.length) {
      // Arrêter l'animation actuelle
      if (currentAnimation) {
        currentAnimation.stop();
      }
      
      // Démarrer la nouvelle animation
      animations[index].start(true);
      setCurrentAnimation(animations[index]);
    }
  };
  
  // Réinitialiser et recharger si l'URL change
  useEffect(() => {
    if ((engine || forceStart) && permissionsGranted && scene && camera && urlToLoad) {
      // Réinitialiser l'état
      setModelLoaded(false);
      setAnimations([]);
      setCurrentAnimation(null);
      
      // Recharger le modèle avec la nouvelle URL
      loadGLTFModel(scene, camera);
    }
  }, [urlToLoad]);

  // Gérer la demande de permissions
  const handleRequestPermissions = async () => {
    const granted = await requestRequiredPermissions();
    setPermissionsGranted(granted);
    
    if (!granted) {
      Alert.alert(
        'Permissions requises',
        'Veuillez autoriser l\'accès à la caméra dans les paramètres de votre appareil pour utiliser cette application.'
      );
    }
  };
  
  // Forcer le rechargement avec différentes URLs
  const handleChangeModel = (url: string) => {
    setUrlToLoad(url);
  };
  
  // Forcer le démarrage sans attendre le moteur
  const handleForceStart = () => {
    setForceStart(true);
  };

  // Afficher un écran d'erreur si les permissions ne sont pas accordées
  if (!permissionsGranted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            L'accès à la caméra est nécessaire pour utiliser BabylonJS.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={handleRequestPermissions}
          >
            <Text style={styles.permissionButtonText}>
              Autoriser l'accès
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Afficher un écran d'erreur s'il y a une erreur
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.debugText}>{debugInfo}</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              setUrlToLoad(boxURL); // Essayer avec le modèle le plus simple
            }}
          >
            <Text style={styles.permissionButtonText}>
              Réessayer avec modèle simple
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Afficher un écran de chargement
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{loadingStatus}</Text>
          <ActivityIndicator size="large" color="#0066cc" style={styles.loadingIndicator} />
          <Text style={styles.debugText}>{debugInfo}</Text>
          
          <View style={styles.loadingDetailsContainer}>
            <Text style={styles.loadingDetailsText}>
              Engine: {engineInitialized ? 'Initialisé' : 'Non initialisé'}
            </Text>
            <Text style={styles.loadingDetailsText}>
              URL du modèle: {urlToLoad}
            </Text>
            
            {!engine && !forceStart && (
              <TouchableOpacity
                style={styles.forceStartButton}
                onPress={handleForceStart}
              >
                <Text style={styles.buttonText}>
                  Forcer le démarrage (sans attendre le moteur)
                </Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.modelButton}
                onPress={() => handleChangeModel(basicGLTFURL)}
              >
                <Text style={styles.buttonText}>
                  Client
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modelButton}
                onPress={() => handleChangeModel(fallbackGLTFURL)}
              >
                <Text style={styles.buttonText}>
                  Canard
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modelButton}
                onPress={() => handleChangeModel(boxURL)}
              >
                <Text style={styles.buttonText}>
                  Boîte
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Si forceStart est true mais pas de moteur, afficher un écran statique
  if (forceStart && !engine && modelLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackTitle}>Mode de secours activé</Text>
          <Text style={styles.fallbackText}>
            Le moteur 3D n'a pas pu être initialisé. Voici une vue statique.
          </Text>
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>Cube 3D</Text>
          </View>
          <Text style={styles.debugText}>{debugInfo}</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => {
              setForceStart(false);
              setLoading(true);
            }}
          >
            <Text style={styles.permissionButtonText}>
              Réessayer avec le moteur 3D
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Afficher la scène BabylonJS
  return (
    <View style={styles.container}>
      <EngineView style={styles.engineView} camera={camera} />
      
      {/* Afficher les contrôles d'animation si le modèle a des animations */}
      {modelLoaded && animations.length > 0 && (
        <View style={styles.animationControls}>
          <Text style={styles.animationTitle}>Animations:</Text>
          <View style={styles.animationButtons}>
            {animations.map((anim, index) => (
              <TouchableOpacity
                key={`anim-${index}`}
                style={[
                  styles.animationButton,
                  currentAnimation === anim && styles.animationButtonActive
                ]}
                onPress={() => playAnimation(index)}
              >
                <Text 
                  style={[
                    styles.animationButtonText,
                    currentAnimation === anim && styles.animationButtonTextActive
                  ]}
                >
                  {anim.name || `Animation ${index + 1}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      {/* Barre de contrôle des modèles */}
      <View style={styles.modelControls}>
        <TouchableOpacity
          style={styles.modelButton}
          onPress={() => handleChangeModel(basicGLTFURL)}
        >
          <Text style={styles.buttonText}>Client</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.modelButton}
          onPress={() => handleChangeModel(fallbackGLTFURL)}
        >
          <Text style={styles.buttonText}>Canard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.modelButton}
          onPress={() => handleChangeModel(boxURL)}
        >
          <Text style={styles.buttonText}>Boîte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  engineView: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e6f7ff',
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  permissionButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff0f0',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#d32f2f',
  },
  debugText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontFamily: 'monospace',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  loadingDetailsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
    width: '100%',
  },
  loadingDetailsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  modelButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    margin: 5,
  },
  forceStartButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    margin: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  fallbackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#555',
  },
  fallbackText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  placeholderBox: {
    width: 200,
    height: 200,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 30,
    transform: [{ rotateX: '45deg' }, { rotateZ: '45deg' }],
  },
  placeholderText: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'bold',
  },
  animationControls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
  },
  modelControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  animationTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  animationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  animationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 5,
  },
  animationButtonActive: {
    backgroundColor: '#0066cc',
  },
  animationButtonText: {
    color: 'white',
    fontSize: 14,
  },
  animationButtonTextActive: {
    fontWeight: 'bold',
  },
});

export default App;
