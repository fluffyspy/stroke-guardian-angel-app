
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.92cc6c6e2fd64266a5dffe7dc56c7f3a',
  appName: 'stroke-sense',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Using 'localhost' to ensure the app works offline, not relying on remote URL
    cleartext: true,
    hostname: 'localhost',
  },
  plugins: {
    Camera: {
      saveToGallery: true,
      quality: 90
    },
    Motion: {
      accelSamplingPeriod: 50,
      orientationSamplingPeriod: 50
    },
    Permissions: {
      aliases: {
        camera: 'android.permission.CAMERA',
        microphone: 'android.permission.RECORD_AUDIO',
        sensors: 'android.permission.BODY_SENSORS'
      }
    }
  }
};

export default config;
