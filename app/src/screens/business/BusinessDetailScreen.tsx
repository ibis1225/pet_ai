import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../lib/theme';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function BusinessDetailScreen({ route }: any) {
  const { id } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Image Placeholder */}
      <View style={styles.heroImage}>
        <Ionicons name="business" size={64} color={colors.textLight} />
      </View>

      {/* Basic Info */}
      <View style={styles.infoSection}>
        <Text style={styles.name}>업체 정보 로딩중...</Text>
        <Text style={styles.category}>카테고리</Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={18} color={colors.accent} />
          <Text style={styles.rating}>0.0</Text>
          <Text style={styles.reviewCount}>(0개의 리뷰)</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.infoText}>주소 정보</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.infoText}>전화번호</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.infoText}>영업시간</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button title="전화하기" onPress={() => {}} variant="outline" style={styles.actionBtn} />
        <Button title="예약하기" onPress={() => {}} style={styles.actionBtn} />
      </View>

      {/* Description */}
      <Card style={styles.descCard}>
        <Text style={styles.descTitle}>업체 소개</Text>
        <Text style={styles.descText}>업체 상세 정보가 여기에 표시됩니다.</Text>
      </Card>

      {/* Reviews */}
      <Text style={styles.sectionTitle}>리뷰</Text>
      <Card>
        <View style={styles.emptyReviews}>
          <Ionicons name="chatbubble-outline" size={32} color={colors.textLight} />
          <Text style={styles.emptyText}>아직 리뷰가 없습니다</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  heroImage: {
    height: 200,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  category: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rating: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  reviewCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
  descCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
  },
  descTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  descText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
