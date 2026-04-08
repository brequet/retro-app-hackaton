import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get API URL from environment or use defaults
const getBaseUrl = () => {
  // Use environment variable if set (for production web builds)
  const envApiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  // Development defaults
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

export const API_URL = getBaseUrl();
