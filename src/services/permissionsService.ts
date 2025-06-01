
import { Permissions } from '@capacitor/permissions';
import { Capacitor } from '@capacitor/core';

export interface PermissionStatus {
  camera: boolean;
  microphone: boolean;
  storage: boolean;
  motion: boolean;
}

class PermissionsService {
  async checkPermissions(): Promise<PermissionStatus> {
    try {
      if (!Capacitor.isNativePlatform()) {
        // On web, assume permissions are granted
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
      if (!Capacitor.isNativePlatform()) {
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
      if (!Capacitor.isNativePlatform()) return true;
      
      const result = await Permissions.requestPermissions({ permissions: ['camera'] });
      return result.camera === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) return true;
      
      const result = await Permissions.requestPermissions({ permissions: ['microphone'] });
      return result.microphone === 'granted';
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  }
}

export const permissionsService = new PermissionsService();
