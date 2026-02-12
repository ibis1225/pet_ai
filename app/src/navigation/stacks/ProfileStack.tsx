import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { colors, fontWeight } from '../../lib/theme';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import PetListScreen from '../../screens/pet/PetListScreen';
import PetDetailScreen from '../../screens/pet/PetDetailScreen';
import SettingsScreen from '../../screens/profile/SettingsScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: fontWeight.bold },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: '내 프로필' }}
      />
      <Stack.Screen
        name="PetList"
        component={PetListScreen}
        options={{ title: '반려동물 관리' }}
      />
      <Stack.Screen
        name="PetDetail"
        component={PetDetailScreen}
        options={{ title: '반려동물 정보' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: '설정' }}
      />
    </Stack.Navigator>
  );
}
