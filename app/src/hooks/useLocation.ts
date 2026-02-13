import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) {
            setLocation({
              latitude: null,
              longitude: null,
              loading: false,
              error: '위치 권한이 필요합니다',
            });
          }
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (isMounted) {
          setLocation({
            latitude: null,
            longitude: null,
            loading: false,
            error: '위치를 가져올 수 없습니다',
          });
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return location;
}
