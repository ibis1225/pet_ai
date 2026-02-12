export const colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8F65',
  primaryDark: '#E55A2B',
  secondary: '#4ECDC4',
  secondaryLight: '#7EDDD6',
  accent: '#FFE66D',

  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',

  text: '#1A1A2E',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  textOnPrimary: '#FFFFFF',

  border: '#E9ECEF',
  divider: '#F1F3F5',

  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',

  // Category colors
  veterinary: '#E74C3C',
  grooming: '#E91E63',
  nutrition: '#FF9800',
  behavior: '#9C27B0',
  training: '#3F51B5',
  hotel: '#00BCD4',
  daycare: '#4CAF50',
  insurance: '#607D8B',
  shopping: '#FF5722',
  emergency: '#F44336',
  other: '#795548',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  title: 28,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};
