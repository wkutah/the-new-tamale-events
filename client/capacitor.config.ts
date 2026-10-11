import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alsharememedia.tamaleevents',
  appName: 'The New Tamale Events',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // Native plugins configuration if needed
  }
};

export default config;
