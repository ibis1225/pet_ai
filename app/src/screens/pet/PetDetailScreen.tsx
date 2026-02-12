import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../lib/theme';
import Card from '../../components/ui/Card';

export default function PetDetailScreen({ route }: any) {
  const { id } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Pet Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="paw" size={48} color={colors.primary} />
        </View>
        <Text style={styles.petName}>반려동물 정보</Text>
        <Text style={styles.petType}>로딩중...</Text>
      </View>

      {/* Info Cards */}
      <Card style={styles.infoCard}>
        <Text style={styles.cardTitle}>기본 정보</Text>
        {[
          { label: '이름', value: '-' },
          { label: '종류', value: '-' },
          { label: '품종', value: '-' },
          { label: '성별', value: '-' },
          { label: '생년월일', value: '-' },
          { label: '체중', value: '-' },
          { label: '중성화', value: '-' },
        ].map((item, index) => (
          <View key={item.label} style={[styles.infoRow, index > 0 && styles.infoRowBorder]}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.infoCard}>
        <Text style={styles.cardTitle}>메모</Text>
        <Text style={styles.notes}>특이사항이 없습니다.</Text>
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
    padding: spacing.md,
    gap: spacing.md,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  petName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  petType: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  infoCard: {
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  value: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  notes: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
