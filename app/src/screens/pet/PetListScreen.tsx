import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../lib/theme';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

// Placeholder - will be loaded from API
const SAMPLE_PETS: any[] = [];

export default function PetListScreen({ navigation }: any) {
  const renderPet = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.petCard}
      onPress={() => navigation.navigate('PetDetail', { id: item.id })}
    >
      <View style={styles.petAvatar}>
        <Ionicons
          name={item.pet_type === 'cat' ? 'logo-octocat' : 'paw'}
          size={28}
          color={colors.primary}
        />
      </View>
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petBreed}>{item.breed || '품종 미등록'}</Text>
        <Text style={styles.petDetail}>
          {item.pet_type === 'dog' ? '강아지' : '고양이'} ·{' '}
          {item.gender === 'male' ? '남아' : '여아'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {SAMPLE_PETS.length === 0 ? (
        <EmptyState
          icon="paw-outline"
          title="등록된 반려동물이 없습니다"
          description="반려동물을 등록하고 맞춤 케어를 받아보세요"
          actionText="반려동물 등록"
          onAction={() => navigation.navigate('PetRegister')}
        />
      ) : (
        <FlatList
          data={SAMPLE_PETS}
          renderItem={renderPet}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      {SAMPLE_PETS.length > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('PetRegister')}
          >
            <Ionicons name="add" size={28} color={colors.textOnPrimary} />
          </TouchableOpacity>
        </View>
      )}
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
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  petAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  petName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  petBreed: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  petDetail: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
});
