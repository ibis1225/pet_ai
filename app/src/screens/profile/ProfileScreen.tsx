import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../lib/theme';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';

const MENU_ITEMS = [
  { icon: 'paw', label: '반려동물 관리', route: 'PetList', color: colors.primary },
  { icon: 'calendar', label: '예약 내역', route: 'BookingHistory', color: colors.secondary },
  { icon: 'receipt', label: '주문 내역', route: 'OrderHistory', color: colors.info },
  { icon: 'heart', label: '찜 목록', route: null, color: colors.error },
  { icon: 'chatbubbles', label: '상담 내역', route: null, color: colors.warning },
  { icon: 'settings', label: '설정', route: 'Settings', color: colors.textSecondary },
] as const;

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={colors.textOnPrimary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || '사용자'}</Text>
            <Text style={styles.email}>{user?.email || 'user@email.com'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="create-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Pet Quick View */}
      <Card style={styles.petCard} onPress={() => navigation.navigate('PetList')}>
        <View style={styles.petCardContent}>
          <View style={styles.petIconCircle}>
            <Ionicons name="paw" size={24} color={colors.primary} />
          </View>
          <View style={styles.petInfo}>
            <Text style={styles.petTitle}>내 반려동물</Text>
            <Text style={styles.petSubtitle}>반려동물을 등록해주세요</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </View>
      </Card>

      {/* Menu */}
      <View style={styles.menuSection}>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.menuItem,
              index < MENU_ITEMS.length - 1 && styles.menuItemBorder,
            ]}
            onPress={() => {
              if (item.route) navigation.navigate(item.route);
            }}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  profileCard: {
    margin: spacing.md,
    padding: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  email: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  petCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  petCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  petIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petInfo: {
    flex: 1,
  },
  petTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  petSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  menuSection: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  logoutBtn: {
    alignItems: 'center',
    padding: spacing.lg,
    margin: spacing.md,
  },
  logoutText: {
    fontSize: fontSize.md,
    color: colors.error,
    fontWeight: fontWeight.medium,
  },
});
