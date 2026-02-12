import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../lib/theme';
import SearchBar from '../../components/ui/SearchBar';

const CATEGORIES = [
  { key: 'all', label: '전체', icon: 'grid' },
  { key: 'veterinary', label: '병원', icon: 'medical' },
  { key: 'grooming', label: '미용', icon: 'cut' },
  { key: 'training', label: '훈련', icon: 'school' },
  { key: 'hotel', label: '호텔', icon: 'bed' },
  { key: 'daycare', label: '유치원', icon: 'happy' },
  { key: 'cafe', label: '카페', icon: 'cafe' },
  { key: 'pet_shop', label: '펫샵', icon: 'storefront' },
  { key: 'insurance', label: '보험', icon: 'shield-checkmark' },
] as const;

// Placeholder data
const SAMPLE_BUSINESSES = [
  { id: '1', name: 'ABC 동물병원', category: 'veterinary', address: '서울시 강남구', rating: 4.8, review_count: 128 },
  { id: '2', name: '멍멍 미용실', category: 'grooming', address: '서울시 서초구', rating: 4.6, review_count: 89 },
  { id: '3', name: '펫 트레이닝 센터', category: 'training', address: '서울시 송파구', rating: 4.9, review_count: 56 },
];

export default function BusinessListScreen({ navigation }: any) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const renderCategory = ({ item }: { item: typeof CATEGORIES[number] }) => (
    <TouchableOpacity
      style={[styles.categoryChip, selectedCategory === item.key && styles.categoryChipActive]}
      onPress={() => setSelectedCategory(item.key)}
    >
      <Ionicons
        name={item.icon as any}
        size={16}
        color={selectedCategory === item.key ? colors.textOnPrimary : colors.textSecondary}
      />
      <Text style={[styles.categoryChipText, selectedCategory === item.key && styles.categoryChipTextActive]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderBusiness = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.businessCard}
      onPress={() => navigation.navigate('BusinessDetail', { id: item.id })}
    >
      <View style={styles.businessImage}>
        <Ionicons name="business-outline" size={32} color={colors.textLight} />
      </View>
      <View style={styles.businessInfo}>
        <Text style={styles.businessName}>{item.name}</Text>
        <Text style={styles.businessAddress}>{item.address}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={colors.accent} />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewCount}>({item.review_count})</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar value={searchText} onChangeText={setSearchText} placeholder="업체명, 지역 검색" />
      </View>

      <FlatList
        data={CATEGORIES as any}
        renderItem={renderCategory}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />

      <FlatList
        data={SAMPLE_BUSINESSES}
        renderItem={renderBusiness}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.businessList}
        showsVerticalScrollIndicator={false}
      />
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
  categoryList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  categoryChipTextActive: {
    color: colors.textOnPrimary,
  },
  businessList: {
    padding: spacing.md,
    gap: spacing.md,
  },
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  businessImage: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  businessInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  businessName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  businessAddress: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  reviewCount: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
});
