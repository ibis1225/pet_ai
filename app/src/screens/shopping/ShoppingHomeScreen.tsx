import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../lib/theme';
import SearchBar from '../../components/ui/SearchBar';
import Card from '../../components/ui/Card';

const PRODUCT_CATEGORIES = [
  { key: 'food', label: '사료', icon: 'restaurant', color: '#FF9800' },
  { key: 'treats', label: '간식', icon: 'ice-cream', color: '#E91E63' },
  { key: 'clothing', label: '옷', icon: 'shirt', color: '#9C27B0' },
  { key: 'accessories', label: '악세서리', icon: 'diamond', color: '#00BCD4' },
  { key: 'toys', label: '장난감', icon: 'game-controller', color: '#4CAF50' },
  { key: 'health', label: '건강', icon: 'fitness', color: '#F44336' },
  { key: 'grooming', label: '미용', icon: 'sparkles', color: '#E91E63' },
  { key: 'housing', label: '하우스', icon: 'home', color: '#795548' },
] as const;

const SAMPLE_PRODUCTS = [
  { id: '1', name: '프리미엄 유기농 사료', price: 45000, category: 'food' },
  { id: '2', name: '닭가슴살 간식', price: 12000, category: 'treats' },
  { id: '3', name: '강아지 겨울 패딩', price: 38000, category: 'clothing' },
  { id: '4', name: '노즈워크 장난감', price: 15000, category: 'toys' },
  { id: '5', name: '관절 영양제', price: 28000, category: 'health' },
  { id: '6', name: '원목 하우스', price: 89000, category: 'housing' },
];

export default function ShoppingHomeScreen({ navigation }: any) {
  const [searchText, setSearchText] = useState('');

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
    >
      <View style={styles.productImage}>
        <Ionicons name="image-outline" size={36} color={colors.textLight} />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price.toLocaleString()}원</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar value={searchText} onChangeText={setSearchText} placeholder="상품 검색" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.categoriesGrid}>
          {PRODUCT_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={styles.categoryItem}
              onPress={() => navigation.navigate('ProductList', { category: cat.key })}
            >
              <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                <Ionicons name={cat.icon as any} size={22} color={cat.color} />
              </View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Banner */}
        <Card style={styles.promoBanner}>
          <Text style={styles.promoTitle}>신규 가입 혜택</Text>
          <Text style={styles.promoDesc}>첫 주문 10% 할인 쿠폰 지급!</Text>
        </Card>

        {/* Product Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>인기 상품</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>전체보기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productGrid}>
          {SAMPLE_PRODUCTS.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetail', { id: product.id })}
            >
              <View style={styles.productImage}>
                <Ionicons name="image-outline" size={36} color={colors.textLight} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.productPrice}>{product.price.toLocaleString()}원</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Cart FAB */}
      <TouchableOpacity
        style={styles.cartFab}
        onPress={() => navigation.navigate('Cart')}
      >
        <Ionicons name="cart" size={24} color={colors.textOnPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    backgroundColor: colors.background,
    marginBottom: spacing.sm,
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  promoBanner: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.primary,
  },
  promoTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textOnPrimary,
  },
  promoDesc: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  seeAll: {
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  productCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  productImage: {
    height: 130,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: spacing.sm,
    gap: spacing.xs,
  },
  productName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  productPrice: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  cartFab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
});
