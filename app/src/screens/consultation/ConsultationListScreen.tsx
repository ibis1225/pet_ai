import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../lib/theme';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

const STATUS_COLORS: Record<string, string> = {
  pending: colors.warning,
  assigned: colors.info,
  in_progress: colors.primary,
  completed: colors.success,
  cancelled: colors.textLight,
};

const STATUS_LABELS: Record<string, string> = {
  pending: '대기중',
  assigned: '배정됨',
  in_progress: '진행중',
  completed: '완료',
  cancelled: '취소',
};

const CATEGORY_LABELS: Record<string, string> = {
  veterinary: '수의 상담',
  grooming: '미용 상담',
  nutrition: '영양/사료',
  behavior: '행동 문제',
  training: '훈련/교육',
  hotel: '호텔/위탁',
  daycare: '유치원',
  insurance: '보험',
  shopping: '용품 추천',
  emergency: '응급 상담',
  other: '기타',
};

// Placeholder data for UI skeleton
const SAMPLE_DATA: any[] = [];

export default function ConsultationListScreen({ navigation }: any) {
  const [consultations] = useState(SAMPLE_DATA);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ConsultationDetail', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.consultNumber}>{item.consultation_number}</Text>
        <Badge
          label={STATUS_LABELS[item.status] || item.status}
          color={STATUS_COLORS[item.status] + '20'}
          textColor={STATUS_COLORS[item.status]}
        />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="folder-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            {CATEGORY_LABELS[item.category] || '미분류'}
          </Text>
        </View>
        {item.pet_name && (
          <View style={styles.infoRow}>
            <Ionicons name="paw-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{item.pet_name}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>{item.created_at}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (consultations.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="chatbubble-ellipses-outline"
          title="상담 내역이 없습니다"
          description="AI 상담 또는 전문 상담을 시작해보세요"
          actionText="상담 시작"
          onAction={() => navigation.navigate('HomeTab', { screen: 'Chat' })}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={consultations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
  list: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  consultNumber: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  cardBody: {
    gap: spacing.xs + 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
