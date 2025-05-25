
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.92cc6c6e2fd64266a5dffe7dc56c7f3a',
  appName: 'stroke-sense',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Configured to run completely offline without any remote URLs
    cleartext: true,
    hostname: 'localhost',
  },
  plugins: {
    Camera: {
      saveToGallery: true,
      quality: 90,
      permissions: ['camera', 'photos']
    },
    Motion: {
      accelSamplingPeriod: 50,
      orientationSamplingPeriod: 50,
      permissions: ['motion', 'gyroscope', 'accelerometer']
    },
    Microphone: {
      permissions: ['microphone']
    },
    Storage: {
      permissions: ['storage']
    },
    Geolocation: {
      permissions: ['location']
    },
    Permissions: {
      aliases: {
        camera: 'android.permission.CAMERA',
        microphone: 'android.permission.RECORD_AUDIO',
        storage: [
          'android.permission.READ_EXTERNAL_STORAGE',
          'android.permission.WRITE_EXTERNAL_STORAGE'
        ],
        location: [
          'android.permission.ACCESS_FINE_LOCATION',
          'android.permission.ACCESS_COARSE_LOCATION'
        ],
        sensors: [
          'android.permission.BODY_SENSORS',
          'android.permission.HIGH_SAMPLING_RATE_SENSORS'
        ],
        motion: [
          'android.permission.BODY_SENSORS',
          'android.permission.HIGH_SAMPLING_RATE_SENSORS'
        ]
      }
    }
  },
  android: {
    permissions: [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.BODY_SENSORS',
      'android.permission.HIGH_SAMPLING_RATE_SENSORS',
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.WAKE_LOCK',
      'android.permission.VIBRATE'
    ]
  },
  ios: {
    permissions: [
      'NSCameraUsageDescription',
      'NSMicrophoneUsageDescription',
      'NSLocationWhenInUseUsageDescription',
      'NSMotionUsageDescription',
      'NSPhotoLibraryUsageDescription'
    ]
  }
};

export default config;
