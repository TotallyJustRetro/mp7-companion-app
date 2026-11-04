import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.communityharbor.mp7companion',
  appName: 'MP7 Companion',
  webDir: 'dist',
  server: {
    // Keep this unset for production builds. Use `npx cap run` for device testing.
  },
};

export default config;
