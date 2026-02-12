import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../lib/theme';
import EmptyState from '../../components/ui/EmptyState';

export default function CartScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <EmptyState
        icon="cart-outline"
        title="장바구니가 비어있습니다"
        description="마음에 드는 상품을 담아보세요"
        actionText="쇼핑하러 가기"
        onAction={() => navigation.goBack()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
