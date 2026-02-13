import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../lib/theme';
import { useLocation } from '../../hooks/useLocation';
import { searchNearbyPlaces, NearbyPlace } from '../../lib/places';
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

export default function BusinessListScreen({ navigation }: any) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();

  const loadPlaces = useCallback(async (category: string) => {
    if (!location.latitude || !location.longitude) return;
    setIsSearching(true);
    try {
      const results = await searchNearbyPlaces(
        location.latitude,
        location.longitude,
        category,
      );
      setPlaces(results);
    } catch (error) {
      console.error('Failed to load places:', error);
    } finally {
      setIsSearching(false);
    }
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      loadPlaces(selectedCategory);
    }
  }, [location.latitude, location.longitude, selectedCategory, loadPlaces]);

  const filteredPlaces = searchText
    ? places.filter((p) =>
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.address.toLowerCase().includes(searchText.toLowerCase())
      )
    : places;

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

  const renderBusiness = ({ item }: { item: NearbyPlace }) => (
    <TouchableOpacity
      style={styles.businessCard}
      onPress={() => navigation.navigate('BusinessDetail', {
        placeId: item.place_id,
        name: item.name,
        latitude: location.latitude,
        longitude: location.longitude,
      })}
    >
      {item.photo_url ? (
        <Image source={{ uri: item.photo_url }} style={styles.businessImage} />
      ) : (
        <View style={[styles.businessImage, styles.businessImagePlaceholder]}>
          <Ionicons name="business-outline" size={28} color={colors.textLight} />
        </View>
      )}
      <View style={styles.businessInfo}>
        <Text style={styles.businessName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.businessAddress} numberOfLines={1}>{item.address}</Text>
        <View style={styles.metaRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.accent} />
            <Text style={styles.ratingText}>{item.rating > 0 ? item.rating.toFixed(1) : '-'}</Text>
            {item.rating_count > 0 && (
              <Text style={styles.reviewCount}>({item.rating_count})</Text>
            )}
          </View>
          <View style={styles.distanceBadge}>
            <Ionicons name="navigate-outline" size={12} color={colors.primary} />
            <Text style={styles.distanceText}>{item.distance_text}</Text>
          </View>
        </View>
        {item.is_open !== null && (
          <Text style={[styles.openStatus, item.is_open ? styles.open : styles.closed]}>
            {item.is_open ? '영업중' : '영업 종료'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search + View Toggle */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchBarWrapper}>
            <SearchBar value={searchText} onChangeText={setSearchText} placeholder="업체명, 지역 검색" />
          </View>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          >
            <Ionicons
              name={viewMode === 'list' ? 'map-outline' : 'list-outline'}
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Location Status */}
        {location.loading && (
          <View style={styles.locationStatus}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.locationStatusText}>위치를 가져오는 중...</Text>
          </View>
        )}
        {location.error && (
          <View style={styles.locationStatus}>
            <Ionicons name="warning-outline" size={16} color={colors.warning} />
            <Text style={styles.locationStatusText}>{location.error}</Text>
          </View>
        )}
        {location.latitude && !isSearching && (
          <View style={styles.locationStatus}>
            <Ionicons name="location" size={14} color={colors.success} />
            <Text style={styles.locationStatusText}>
              내 주변 {filteredPlaces.length}개 업체
            </Text>
          </View>
        )}
      </View>

      {/* Categories */}
      <FlatList
        data={CATEGORIES as any}
        renderItem={renderCategory}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />

      {/* Content */}
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>주변 업체를 검색하고 있습니다...</Text>
        </View>
      ) : viewMode === 'list' ? (
        <FlatList
          data={filteredPlaces}
          renderItem={renderBusiness}
          keyExtractor={(item) => item.place_id}
          contentContainerStyle={styles.businessList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>
                {location.latitude
                  ? '주변에 검색된 업체가 없습니다'
                  : '위치 권한을 허용해주세요'}
              </Text>
            </View>
          }
        />
      ) : location.latitude && location.longitude ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
          showsMyLocationButton
        >
          {filteredPlaces.map((place) => (
            <Marker
              key={place.place_id}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              title={place.name}
              description={`${place.distance_text} · ${place.rating > 0 ? `★${place.rating}` : ''}`}
            >
              <View style={styles.markerContainer}>
                <View style={styles.marker}>
                  <Ionicons name="paw" size={14} color={colors.textOnPrimary} />
                </View>
              </View>
              <Callout
                onPress={() => navigation.navigate('BusinessDetail', {
                  placeId: place.place_id,
                  name: place.name,
                  latitude: location.latitude,
                  longitude: location.longitude,
                })}
              >
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{place.name}</Text>
                  <Text style={styles.calloutDistance}>{place.distance_text}</Text>
                  {place.rating > 0 && (
                    <Text style={styles.calloutRating}>★ {place.rating} ({place.rating_count})</Text>
                  )}
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      ) : null}
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBarWrapper: {
    flex: 1,
  },
  viewToggle: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingLeft: spacing.xs,
  },
  locationStatusText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
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
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  businessImage: {
    width: 100,
    height: 110,
  },
  businessImagePlaceholder: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessInfo: {
    flex: 1,
    padding: spacing.sm + 2,
    gap: spacing.xs,
  },
  businessName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  businessAddress: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary + '12',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  distanceText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  openStatus: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  open: {
    color: colors.success,
  },
  closed: {
    color: colors.textLight,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.textOnPrimary,
  },
  callout: {
    width: 180,
    padding: spacing.xs,
  },
  calloutTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  calloutDistance: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginTop: 2,
  },
  calloutRating: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
