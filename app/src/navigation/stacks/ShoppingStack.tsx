import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ShoppingStackParamList } from '../../types';
import { colors, fontWeight } from '../../lib/theme';
import ShoppingHomeScreen from '../../screens/shopping/ShoppingHomeScreen';
import ProductDetailScreen from '../../screens/shopping/ProductDetailScreen';
import CartScreen from '../../screens/shopping/CartScreen';

const Stack = createNativeStackNavigator<ShoppingStackParamList>();

export default function ShoppingStack() {
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
        name="ShoppingHome"
        component={ShoppingHomeScreen}
        options={{ title: '쇼핑' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: '상품 상세' }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: '장바구니' }}
      />
    </Stack.Navigator>
  );
}
