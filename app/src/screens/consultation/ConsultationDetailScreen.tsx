import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../lib/theme';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function ConsultationDetailScreen({ route }: any) {
  const { id } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.label}>상담 번호</Text>
          <Text style={styles.value}>-</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>상태</Text>
          <Badge label="대기중" color={colors.warning + '20'} textColor={colors.warning} />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>보호자 정보</Text>
      <Card>
        <View style={styles.infoRow}>
          <Text style={styles.label}>이름</Text>
          <Text style={styles.value}>-</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>연락처</Text>
          <Text style={styles.value}>-</Text>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>반려동물 정보</Text>
      <Card>
        <View style={styles.infoRow}>
          <Text style={styles.label}>이름</Text>
          <Text style={styles.value}>-</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>종류</Text>
          <Text style={styles.value}>-</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>나이</Text>
          <Text style={styles.value}>-</Text>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>상담 내용</Text>
      <Card>
        <View style={styles.infoRow}>
          <Text style={styles.label}>분류</Text>
          <Text style={styles.value}>-</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>긴급도</Text>
          <Text style={styles.value}>-</Text>
        </View>
        <View style={styles.descriptionRow}>
          <Text style={styles.label}>상세 설명</Text>
          <Text style={styles.description}>상담 상세 내용을 불러오는 중입니다...</Text>
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
    padding: spacing.md,
    gap: spacing.md,
  },
  statusCard: {
    padding: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  descriptionRow: {
    paddingVertical: spacing.sm,
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
  description: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
});
