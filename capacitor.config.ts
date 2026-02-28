import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mycookflex.app',
  appName: 'My Cook Flex',
  webDir: 'dist',
  server: {
    // Replace with your production URL or use a local IP for development
    url: 'https://studio-901067780-579dd.web.app',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    }
  }
};

export default config;
