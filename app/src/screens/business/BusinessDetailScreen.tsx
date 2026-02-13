import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../lib/theme';
import { getPlaceDetail } from '../../lib/places';
import { getDistance, formatDistance } from '../../lib/distance';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function BusinessDetailScreen({ route, navigation }: any) {
  const { placeId, name, latitude: userLat, longitude: userLng } = route.params;
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: name || '업체 상세' });
    loadDetail();
  }, [placeId]);

  const loadDetail = async () => {
    try {
      const data = await getPlaceDetail(placeId);
      setDetail(data);
    } catch (error) {
      console.error('Failed to load place detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>업체 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textLight} />
        <Text style={styles.loadingText}>업체 정보를 불러올 수 없습니다</Text>
      </View>
    );
  }

  const distance = userLat && userLng
    ? getDistance(userLat, userLng, detail.latitude, detail.longitude)
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Photo Gallery */}
      {detail.photos && detail.photos.length > 0 ? (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {detail.photos.map((url: string, i: number) => (
            <Image key={i} source={{ uri: url }} style={styles.heroImage} />
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.heroImage, styles.heroPlaceholder]}>
          <Ionicons name="business" size={64} color={colors.textLight} />
        </View>
      )}

      {/* Basic Info */}
      <View style={styles.infoSection}>
        <Text style={styles.name}>{detail.name}</Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={18} color={colors.accent} />
          <Text style={styles.rating}>
            {detail.rating > 0 ? detail.rating.toFixed(1) : '-'}
          </Text>
          <Text style={styles.reviewCount}>
            ({detail.rating_count}개의 리뷰)
          </Text>
          {distance !== null && (
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate-outline" size={14} color={colors.primary} />
              <Text style={styles.distanceText}>{formatDistance(distance)}</Text>
            </View>
          )}
        </View>

        {detail.is_open !== null && (
          <Text style={[styles.openStatus, detail.is_open ? styles.open : styles.closed]}>
            {detail.is_open ? '영업중' : '영업 종료'}
          </Text>
        )}

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.infoText}>{detail.address}</Text>
        </View>
        {detail.phone && (
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => Linking.openURL(`tel:${detail.phone}`)}
          >
            <Ionicons name="call-outline" size={18} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.primary }]}>{detail.phone}</Text>
          </TouchableOpacity>
        )}
        {detail.website && (
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => Linking.openURL(detail.website)}
          >
            <Ionicons name="globe-outline" size={18} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.primary }]} numberOfLines={1}>
              {detail.website}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {detail.phone && (
          <Button
            title="전화하기"
            onPress={() => Linking.openURL(`tel:${detail.phone}`)}
            variant="outline"
            style={styles.actionBtn}
          />
        )}
        {detail.google_maps_url && (
          <Button
            title="길찾기"
            onPress={() => Linking.openURL(detail.google_maps_url)}
            style={styles.actionBtn}
          />
        )}
      </View>

      {/* Mini Map */}
      <Card style={styles.mapCard}>
        <MapView
          style={styles.miniMap}
          initialRegion={{
            latitude: detail.latitude,
            longitude: detail.longitude,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: detail.latitude,
              longitude: detail.longitude,
            }}
            title={detail.name}
          />
        </MapView>
        <TouchableOpacity
          style={styles.mapOverlay}
          onPress={() => {
            if (detail.google_maps_url) {
              Linking.openURL(detail.google_maps_url);
            }
          }}
        >
          <Ionicons name="open-outline" size={16} color={colors.primary} />
          <Text style={styles.mapOverlayText}>Google Maps에서 보기</Text>
        </TouchableOpacity>
      </Card>

      {/* Opening Hours */}
      {detail.opening_hours && detail.opening_hours.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>영업 시간</Text>
          <Card style={styles.hoursCard}>
            {detail.opening_hours.map((line: string, i: number) => (
              <Text key={i} style={styles.hoursText}>{line}</Text>
            ))}
          </Card>
        </>
      )}

      {/* Reviews */}
      <Text style={styles.sectionTitle}>리뷰</Text>
      {detail.reviews && detail.reviews.length > 0 ? (
        detail.reviews.map((review: any, i: number) => (
          <Card key={i} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewAuthor}>{review.author}</Text>
              <View style={styles.reviewRating}>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Ionicons
                    key={idx}
                    name={idx < review.rating ? 'star' : 'star-outline'}
                    size={14}
                    color={colors.accent}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.reviewText} numberOfLines={4}>{review.text}</Text>
            <Text style={styles.reviewTime}>{review.time}</Text>
          </Card>
        ))
      ) : (
        <Card style={styles.reviewCard}>
          <View style={styles.emptyReviews}>
            <Ionicons name="chatbubble-outline" size={32} color={colors.textLight} />
            <Text style={styles.emptyText}>아직 리뷰가 없습니다</Text>
          </View>
        </Card>
      )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  heroImage: {
    width: 400,
    height: 220,
  },
  heroPlaceholder: {
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
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
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary + '12',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  distanceText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  openStatus: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  open: {
    color: colors.success,
  },
  closed: {
    color: colors.error,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
  mapCard: {
    marginHorizontal: spacing.md,
    overflow: 'hidden',
    padding: 0,
  },
  miniMap: {
    height: 180,
  },
  mapOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  mapOverlayText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  hoursCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    gap: spacing.xs + 2,
  },
  hoursText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  reviewCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewAuthor: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  reviewTime: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.sm,
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
