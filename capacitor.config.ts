import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'photo-gallery',
  webDir: 'dist',
  plugins: {
    LiveUpdates: {
      appId: '03cb2983',
      channel: 'Production',
      autoUpdateMethod: 'background',
      maxVersions: 3
    }
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
