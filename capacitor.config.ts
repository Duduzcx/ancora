import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zcx.ancora',
  appName: 'Ancora',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;