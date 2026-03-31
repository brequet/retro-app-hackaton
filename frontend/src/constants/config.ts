import { Platform } from 'react-native';

// Use 10.0.2.2 for Android emulator, localhost for iOS/web
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

export const API_URL = getBaseUrl();
