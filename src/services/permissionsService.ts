
import { Capacitor } from '@capacitor/core';

// Conditional import for Capacitor Permissions
let Permissions: any = null;

// Try to import Permissions, but handle gracefully if not available
try {
  if (Capacitor.isNativePlatform()) {
    import('@capacitor/permissions').then(module => {
      Permissions = module.Permissions;
    }).catch(error => {
      console.warn('Permissions plugin not available:', error);
    });
  }
} catch (error) {
  console.warn('Failed to load permissions module:', error);
}

export interface PermissionStatus {
  camera: boolean;
  microphone: boolean;
  storage: boolean;
  motion: boolean;
}

class PermissionsService {
  async checkPermissions(): Promise<PermissionStatus> {
    try {
      if (!Capacitor.isNativePlatform() || !Permissions) {
        // On web or when permissions plugin is not available, assume permissions are granted
        return {
          camera: true,
          microphone: true,
          storage: true,
          motion: true
        };
      }

      const [camera, microphone, storage] = await Promise.all([
        Permissions.checkPermissions({ permissions: ['camera'] }),
        Permissions.checkPermissions({ permissions: ['microphone'] }),
        Permissions.checkPermissions({ permissions: ['storage'] })
      ]);

      return {
        camera: camera.camera === 'granted',
        microphone: microphone.microphone === 'granted',
        storage: storage.storage === 'granted',
        motion: true // Motion permissions are usually granted by default
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return {
        camera: false,
        microphone: false,
        storage: false,
        motion: false
      };
    }
  }

  async requestAllPermissions(): Promise<PermissionStatus> {
    try {
      if (!Capacitor.isNativePlatform() || !Permissions) {
        return {
          camera: true,
          microphone: true,
          storage: true,
          motion: true
        };
      }

      const [camera, microphone, storage] = await Promise.all([
        Permissions.requestPermissions({ permissions: ['camera'] }),
        Permissions.requestPermissions({ permissions: ['microphone'] }),
        Permissions.requestPermissions({ permissions: ['storage'] })
      ]);

      return {
        camera: camera.camera === 'granted',
        microphone: microphone.microphone === 'granted',
        storage: storage.storage === 'granted',
        motion: true
      };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      throw error;
    }
  }

  async requestCameraPermission(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform() || !Permissions) return true;
      
      const result = await Permissions.requestPermissions({ permissions: ['camera'] });
      return result.camera === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform() || !Permissions) return true;
      
      const result = await Permissions.requestPermissions({ permissions: ['microphone'] });
      return result.microphone === 'granted';
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  }
}

export const permissionsService = new PermissionsService();
