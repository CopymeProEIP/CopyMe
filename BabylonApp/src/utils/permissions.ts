import { Platform } from 'react-native';
import { 
  PERMISSIONS, 
  RESULTS, 
  check,
  request,
  requestMultiple,
  Permission,
  PermissionStatus
} from 'react-native-permissions';

export const requestCameraPermission = async () => {
  try {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
      default: PERMISSIONS.IOS.CAMERA, // Valeur par défaut pour typescript
    });

    if (!permission) {
      console.error('Permission non disponible pour cette plateforme');
      return false;
    }

    console.log('Demande de permission:', permission);
    const result = await request(permission);
    console.log('Résultat de la permission:', result);
    
    return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
  } catch (error) {
    console.error('Erreur lors de la demande de permission caméra:', error);
    return false;
  }
};

export const checkCameraPermission = async () => {
  try {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
      default: PERMISSIONS.IOS.CAMERA, // Valeur par défaut pour typescript
    });

    if (!permission) {
      console.error('Permission non disponible pour cette plateforme');
      return false;
    }

    console.log('Vérification de permission:', permission);
    const result = await check(permission);
    console.log('État actuel de la permission:', result);
    
    return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
  } catch (error) {
    console.error('Erreur lors de la vérification de permission caméra:', error);
    return false;
  }
};

export const requestRequiredPermissions = async () => {
  try {
    // Définir les permissions nécessaires selon la plateforme
    const permissions = Platform.select({
      ios: [
        PERMISSIONS.IOS.CAMERA,
      ],
      android: [
        PERMISSIONS.ANDROID.CAMERA,
      ],
      default: [PERMISSIONS.IOS.CAMERA], // Valeur par défaut pour typescript
    }) as Permission[];

    if (!permissions || permissions.length === 0) {
      console.error('Aucune permission définie pour cette plateforme');
      return false;
    }

    console.log('Demande de permissions multiples:', permissions);
    const results = await requestMultiple(permissions);
    console.log('Résultats des permissions:', results);
    
    // Vérifier si toutes les permissions sont accordées
    let allGranted = true;
    
    // Vérifier chaque permission individuellement
    permissions.forEach(permission => {
      const result = results[permission];
      if (result !== RESULTS.GRANTED && result !== RESULTS.LIMITED) {
        console.warn(`Permission ${permission} non accordée: ${result}`);
        allGranted = false;
      }
    });
    
    return allGranted;
  } catch (error) {
    console.error('Erreur lors de la demande de permissions:', error);
    return false;
  }
}; 