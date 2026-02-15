'use client';
import { useState, useEffect } from 'react';

export function useLocation() {
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null; loading: boolean; error: string | null }>({
    latitude: null, longitude: null, loading: true, error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ latitude: null, longitude: null, loading: false, error: '위치 서비스를 지원하지 않습니다' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, loading: false, error: null }),
      () => setLocation({ latitude: null, longitude: null, loading: false, error: '위치 권한이 필요합니다' }),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  return location;
}
