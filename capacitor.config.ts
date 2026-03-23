import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.firetracker.app',
  appName: 'FIRE Tracker',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Preferences: {},
  },
}

export default config
