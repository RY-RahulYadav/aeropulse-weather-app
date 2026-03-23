import { useCallback, useEffect, useState } from 'react';

const FALLBACK_LOCATION = {
  latitude: 28.6139,
  longitude: 77.209,
  label: 'New Delhi (Fallback)',
};

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [permissionState, setPermissionState] = useState('prompt');

  const setFallback = useCallback((message) => {
    setLocation(FALLBACK_LOCATION);
    setError(message);
    setLoading(false);
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setFallback('Geolocation is unavailable in this browser. Using fallback location.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: Number(position.coords.latitude.toFixed(4)),
          longitude: Number(position.coords.longitude.toFixed(4)),
          label: 'Detected GPS Location',
        });
        setPermissionState('granted');
        setLoading(false);
      },
      (geoError) => {
        if (geoError.code === 1) {
          setPermissionState('denied');
          setFallback('Location permission denied. Enable location for this site and tap Retry GPS.');
          return;
        }

        setPermissionState('prompt');
        setFallback('Unable to read GPS coordinates. Showing fallback weather data.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60 * 1000,
      },
    );
  }, [setFallback]);

  useEffect(() => {
    if (!navigator.geolocation) {
      queueMicrotask(() => {
        setFallback('Geolocation is unavailable in this browser. Using fallback location.');
      });
      return;
    }

    if (!navigator.permissions) {
      requestLocation();
      return;
    }

    let permissionStatus;

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        permissionStatus = status;
        setPermissionState(status.state);

        if (status.state === 'denied') {
          setFallback('Location permission denied. Enable location for this site and tap Retry GPS.');
          return;
        }

        requestLocation();

        permissionStatus.onchange = () => {
          setPermissionState(permissionStatus.state);

          if (permissionStatus.state === 'granted') {
            requestLocation();
          }
        };
      })
      .catch(() => {
        requestLocation();
      });

    return () => {
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, [requestLocation, setFallback]);

  return { location, loading, error, permissionState, requestLocation };
}
