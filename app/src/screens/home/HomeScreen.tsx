import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../lib/theme';
import Card from '../../components/ui/Card';
import SectionHeader from '../../components/ui/SectionHeader';

const QUICK_MENU = [
  { icon: 'chatbubbles', label: 'AI 상담', color: colors.primary, route: 'Chat' },
  { icon: 'medkit', label: '수의 상담', color: colors.veterinary, route: 'ConsultationTab' },
  { icon: 'cut', label: '미용실', color: colors.grooming, route: 'BusinessTab' },
  { icon: 'cart', label: '쇼핑', color: colors.shopping, route: 'ShoppingTab' },
] as const;

const SERVICE_CATEGORIES = [
  { icon: 'medical', label: '동물병원', color: '#E74C3C', category: 'veterinary' },
  { icon: 'cut', label: '미용실', color: '#E91E63', category: 'grooming' },
  { icon: 'school', label: '훈련소', color: '#3F51B5', category: 'training' },
  { icon: 'bed', label: '호텔', color: '#00BCD4', category: 'hotel' },
  { icon: 'happy', label: '유치원', color: '#4CAF50', category: 'daycare' },
  { icon: 'cafe', label: '카페', color: '#795548', category: 'cafe' },
  { icon: 'shield-checkmark', label: '보험', color: '#607D8B', category: 'insurance' },
  { icon: 'storefront', label: '펫샵', color: '#FF5722', category: 'pet_shop' },
] as const;

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>안녕하세요!</Text>
            <Text style={styles.headerTitle}>PetAI</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <Card style={styles.banner}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>AI 반려동물 상담</Text>
              <Text style={styles.bannerDescription}>
                건강, 영양, 행동 등{'\n'}무엇이든 물어보세요
              </Text>
              <TouchableOpacity
                style={styles.bannerButton}
                onPress={() => navigation.navigate('Chat')}
              >
                <Text style={styles.bannerButtonText}>상담 시작</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.textOnPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.bannerIcon}>
              <Ionicons name="paw" size={72} color="rgba(255,255,255,0.3)" />
            </View>
          </View>
        </Card>

        {/* Quick Menu */}
        <View style={styles.quickMenu}>
          {QUICK_MENU.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.quickMenuItem}
              onPress={() => {
                if (item.route === 'Chat') {
                  navigation.navigate('Chat');
                } else {
                  navigation.navigate(item.route);
                }
              }}
            >
              <View style={[styles.quickMenuIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={styles.quickMenuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Service Categories */}
        <SectionHeader title="서비스 찾기" actionText="전체보기" onAction={() => navigation.navigate('BusinessTab')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {SERVICE_CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item.category}
              style={styles.categoryItem}
              onPress={() => navigation.navigate('BusinessTab', {
                screen: 'BusinessSearch',
                params: { category: item.category },
              })}
            >
              <View style={[styles.categoryIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Consultations */}
        <SectionHeader title="최근 상담" actionText="더보기" onAction={() => navigation.navigate('ConsultationTab')} />
        <Card style={styles.recentCard}>
          <View style={styles.emptyRecent}>
            <Ionicons name="chatbubble-ellipses-outline" size={40} color={colors.textLight} />
            <Text style={styles.emptyRecentText}>아직 상담 내역이 없습니다</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
              <Text style={styles.emptyRecentLink}>AI 상담 시작하기</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Popular Products */}
        <SectionHeader title="인기 상품" actionText="더보기" onAction={() => navigation.navigate('ShoppingTab')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
          {['사료', '간식', '장난감', '옷'].map((name, i) => (
            <Card key={i} style={styles.productCard} onPress={() => navigation.navigate('ShoppingTab')}>
              <View style={styles.productImage}>
                <Ionicons name="image-outline" size={32} color={colors.textLight} />
              </View>
              <Text style={styles.productName}>{name} 상품</Text>
              <Text style={styles.productPrice}>준비중</Text>
            </Card>
          ))}
        </ScrollView>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textOnPrimary,
    marginBottom: spacing.xs,
  },
  bannerDescription: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  bannerButtonText: {
    color: colors.textOnPrimary,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },
  bannerIcon: {
    marginLeft: spacing.md,
  },
  quickMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  quickMenuItem: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickMenuIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickMenuLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    width: 70,
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
  recentCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  emptyRecent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  emptyRecentText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  emptyRecentLink: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  productsScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  productCard: {
    width: 140,
    padding: spacing.sm,
  },
  productImage: {
    height: 100,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  productName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  productPrice: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
