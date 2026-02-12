import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ConsultationStackParamList } from '../../types';
import { colors, fontWeight } from '../../lib/theme';
import ConsultationListScreen from '../../screens/consultation/ConsultationListScreen';
import ConsultationDetailScreen from '../../screens/consultation/ConsultationDetailScreen';

const Stack = createNativeStackNavigator<ConsultationStackParamList>();

export default function ConsultationStack() {
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
        name="ConsultationList"
        component={ConsultationListScreen}
        options={{ title: '상담 내역' }}
      />
      <Stack.Screen
        name="ConsultationDetail"
        component={ConsultationDetailScreen}
        options={{ title: '상담 상세' }}
      />
    </Stack.Navigator>
  );
}
