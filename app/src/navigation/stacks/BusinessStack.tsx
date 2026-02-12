import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BusinessStackParamList } from '../../types';
import { colors, fontWeight } from '../../lib/theme';
import BusinessListScreen from '../../screens/business/BusinessListScreen';
import BusinessDetailScreen from '../../screens/business/BusinessDetailScreen';

const Stack = createNativeStackNavigator<BusinessStackParamList>();

export default function BusinessStack() {
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
        name="BusinessList"
        component={BusinessListScreen}
        options={{ title: '업체 찾기' }}
      />
      <Stack.Screen
        name="BusinessDetail"
        component={BusinessDetailScreen}
        options={{ title: '업체 상세' }}
      />
    </Stack.Navigator>
  );
}
