import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../lib/theme';
import Button from '../../components/ui/Button';

export default function ProductDetailScreen({ route }: any) {
  const { id } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageArea}>
          <Ionicons name="image-outline" size={64} color={colors.textLight} />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.category}>카테고리</Text>
          <Text style={styles.name}>상품 정보 로딩중...</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>0원</Text>
          </View>

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons key={i} name="star" size={16} color={colors.accent} />
            ))}
            <Text style={styles.ratingText}>0.0 (0개 리뷰)</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.descSection}>
          <Text style={styles.descTitle}>상품 설명</Text>
          <Text style={styles.descText}>상품 상세 정보가 여기에 표시됩니다.</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button title="장바구니 담기" onPress={() => {}} variant="outline" style={styles.cartBtn} />
        <Button title="바로 구매" onPress={() => {}} style={styles.buyBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  imageArea: {
    height: 300,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  category: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  price: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  divider: {
    height: 8,
    backgroundColor: colors.surface,
  },
  descSection: {
    padding: spacing.lg,
  },
  descTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  descText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  cartBtn: {
    flex: 1,
  },
  buyBtn: {
    flex: 1,
  },
});
