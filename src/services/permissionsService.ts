
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
        // On web, check browser permissions API when available
        return await this.checkWebPermissions();
      }

      // For native platforms, assume permissions are available
      // They will be requested when we try to access the actual features
      return {
        camera: true,
        microphone: true,
        storage: true,
        motion: true
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

  private async checkWebPermissions(): Promise<PermissionStatus> {
    const permissions: PermissionStatus = {
      camera: true,
      microphone: true,
      storage: true,
      motion: true
    };

    if ('permissions' in navigator) {
      try {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        permissions.camera = cameraPermission.state === 'granted';

        const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        permissions.microphone = micPermission.state === 'granted';
      } catch (error) {
        console.warn('Browser permissions API not fully supported:', error);
      }
    }

    return permissions;
  }

  async requestAllPermissions(): Promise<PermissionStatus> {
    try {
      if (!Capacitor.isNativePlatform()) {
        // On web, permissions are requested when accessing media
        return {
          camera: true,
          microphone: true,
          storage: true,
          motion: true
        };
      }

      // For native platforms, return true - permissions will be requested by the actual features
      return {
        camera: true,
        microphone: true,
        storage: true,
        motion: true
      };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      throw error;
    }
  }

  async requestCameraPermission(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        // On web, test camera access
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          return true;
        } catch {
          return false;
        }
      }
      
      // On native, assume permission will be requested by the camera component
      return true;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        // On web, test microphone access
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          return true;
        } catch {
          return false;
        }
      }
      
      // On native, assume permission will be requested by the microphone component
      return true;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  }
}

export const permissionsService = new PermissionsService();
