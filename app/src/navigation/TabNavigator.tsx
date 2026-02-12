import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, fontWeight } from '../lib/theme';
import { RootTabParamList } from '../types';

import HomeStack from './stacks/HomeStack';
import ConsultationStack from './stacks/ConsultationStack';
import BusinessStack from './stacks/BusinessStack';
import ShoppingStack from './stacks/ShoppingStack';
import ProfileStack from './stacks/ProfileStack';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, { focused: keyof typeof Ionicons.glyphMap; default: keyof typeof Ionicons.glyphMap }> = {
  HomeTab: { focused: 'home', default: 'home-outline' },
  ConsultationTab: { focused: 'chatbubbles', default: 'chatbubbles-outline' },
  BusinessTab: { focused: 'business', default: 'business-outline' },
  ShoppingTab: { focused: 'cart', default: 'cart-outline' },
  ProfileTab: { focused: 'person', default: 'person-outline' },
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.default;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: fontWeight.medium,
        },
        tabBarStyle: {
          borderTopColor: colors.border,
          height: 85,
          paddingBottom: 25,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: '홈' }} />
      <Tab.Screen name="ConsultationTab" component={ConsultationStack} options={{ tabBarLabel: '상담' }} />
      <Tab.Screen name="BusinessTab" component={BusinessStack} options={{ tabBarLabel: '업체' }} />
      <Tab.Screen name="ShoppingTab" component={ShoppingStack} options={{ tabBarLabel: '쇼핑' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: '프로필' }} />
    </Tab.Navigator>
  );
}
