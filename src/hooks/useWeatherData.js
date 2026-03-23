import { useEffect, useState } from 'react';
import { getHistoricalRange, getWeatherForDate } from '../api/openMeteo';

export function useWeatherForDate({ location, selectedDate, temperatureUnit }) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: '',
  });

  useEffect(() => {
    let isActive = true;

    if (!location || !selectedDate) {
      return undefined;
    }

    queueMicrotask(() => {
      if (isActive) {
        setState((current) => ({ ...current, loading: true, error: '' }));
      }
    });

    getWeatherForDate({
      latitude: location.latitude,
      longitude: location.longitude,
      selectedDate,
      temperatureUnit,
    })
      .then((data) => {
        if (isActive) {
          setState({ data, loading: false, error: '' });
        }
      })
      .catch((error) => {
        if (isActive) {
          setState({ data: null, loading: false, error: error.message });
        }
      });

    return () => {
      isActive = false;
    };
  }, [location, selectedDate, temperatureUnit]);

  return state;
}

export function useHistoricalWeather({ location, startDate, endDate, temperatureUnit, enabled }) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: '',
  });

  useEffect(() => {
    let isActive = true;

    if (!location || !startDate || !endDate || !enabled) {
      return undefined;
    }

    queueMicrotask(() => {
      if (isActive) {
        setState((current) => ({ ...current, loading: true, error: '' }));
      }
    });

    getHistoricalRange({
      latitude: location.latitude,
      longitude: location.longitude,
      startDate,
      endDate,
      temperatureUnit,
    })
      .then((data) => {
        if (isActive) {
          setState({ data, loading: false, error: '' });
        }
      })
      .catch((error) => {
        if (isActive) {
          setState({ data: null, loading: false, error: error.message });
        }
      });

    return () => {
      isActive = false;
    };
  }, [location, startDate, endDate, temperatureUnit, enabled]);

  return state;
}
