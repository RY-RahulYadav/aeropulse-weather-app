import dayjs from 'dayjs';

const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_BASE = 'https://archive-api.open-meteo.com/v1/archive';
const AIR_QUALITY_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search';

const FORECAST_DAY_RANGE = {
  past: 92,
  future: 16,
};

const weatherCache = new Map();
const historyCache = new Map();

export async function searchLocations(query) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const payload = await fetchJson(
    buildUrl(GEOCODING_BASE, {
      name: query.trim(),
      count: 6,
      language: 'en',
      format: 'json',
    }),
  );

  return (payload.results ?? []).map((result) => ({
    id: `${result.latitude}|${result.longitude}|${result.name}`,
    name: result.name,
    country: result.country,
    admin1: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
    label: [result.name, result.admin1, result.country].filter(Boolean).join(', '),
  }));
}

function buildUrl(base, params) {
  const url = new URL(base);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      url.searchParams.set(key, value.join(','));
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Open-Meteo request failed (${response.status}): ${body}`);
  }

  return response.json();
}

function isForecastRange(date) {
  const today = dayjs().startOf('day');
  const target = dayjs(date).startOf('day');
  const dayDiff = target.diff(today, 'day');

  return dayDiff >= -FORECAST_DAY_RANGE.past && dayDiff <= FORECAST_DAY_RANGE.future;
}

function findClosestHourIndex(timeSeries, targetTime) {
  if (!Array.isArray(timeSeries) || timeSeries.length === 0) {
    return 0;
  }

  const target = dayjs(targetTime);
  let bestIdx = 0;
  let bestDelta = Number.POSITIVE_INFINITY;

  timeSeries.forEach((value, idx) => {
    const delta = Math.abs(dayjs(value).diff(target));

    if (delta < bestDelta) {
      bestDelta = delta;
      bestIdx = idx;
    }
  });

  return bestIdx;
}

function aggregateDailyAverage(hourly, valueKey) {
  const buckets = new Map();

  hourly.time.forEach((isoTime, idx) => {
    const key = isoTime.slice(0, 10);
    const value = hourly[valueKey][idx];

    if (value === null || value === undefined) {
      return;
    }

    const entry = buckets.get(key) ?? { sum: 0, count: 0 };
    entry.sum += value;
    entry.count += 1;
    buckets.set(key, entry);
  });

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, entry]) => ({
      date,
      value: Number((entry.sum / entry.count).toFixed(2)),
    }));
}

function getWindDirectionLabel(degrees) {
  if (degrees === null || degrees === undefined) {
    return 'N/A';
  }

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export async function getWeatherForDate({ latitude, longitude, selectedDate, temperatureUnit }) {
  const cacheKey = `${latitude}|${longitude}|${selectedDate}|${temperatureUnit}`;

  if (weatherCache.has(cacheKey)) {
    return weatherCache.get(cacheKey);
  }

  const date = dayjs(selectedDate).format('YYYY-MM-DD');
  const endpoint = isForecastRange(date) ? FORECAST_BASE : ARCHIVE_BASE;

  const weatherParams = {
    latitude,
    longitude,
    timezone: 'auto',
    start_date: date,
    end_date: date,
    temperature_unit: temperatureUnit,
    wind_speed_unit: 'kmh',
    current: ['temperature_2m', 'relative_humidity_2m', 'precipitation', 'wind_speed_10m', 'uv_index'],
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation',
      'visibility',
      'wind_speed_10m',
      'uv_index',
      'precipitation_probability',
    ],
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'wind_speed_10m_max',
      'precipitation_probability_max',
      'uv_index_max',
    ],
  };

  const airQualityParams = {
    latitude,
    longitude,
    timezone: 'auto',
    start_date: date,
    end_date: date,
    hourly: ['us_aqi', 'pm10', 'pm2_5', 'carbon_monoxide', 'carbon_dioxide', 'nitrogen_dioxide', 'sulphur_dioxide'],
    current: ['us_aqi', 'pm10', 'pm2_5', 'carbon_monoxide', 'carbon_dioxide', 'nitrogen_dioxide', 'sulphur_dioxide'],
  };

  const weeklyParams = {
    latitude,
    longitude,
    timezone: 'auto',
    temperature_unit: temperatureUnit,
    forecast_days: 7,
    daily: ['temperature_2m_max', 'temperature_2m_min', 'precipitation_probability_max'],
  };

  const [weather, airQuality, weeklyWeather] = await Promise.all([
    fetchJson(buildUrl(endpoint, weatherParams)),
    fetchJson(buildUrl(AIR_QUALITY_BASE, airQualityParams)),
    fetchJson(buildUrl(FORECAST_BASE, weeklyParams)),
  ]);

  const referenceTime = dayjs(date).isSame(dayjs(), 'day')
    ? weather.current?.time ?? `${date}T12:00`
    : `${date}T12:00`;

  const weatherHourIndex = findClosestHourIndex(weather.hourly.time, referenceTime);
  const airHourIndex = findClosestHourIndex(airQuality.hourly.time, referenceTime);

  const payload = {
    weather,
    airQuality,
    weekly: weeklyWeather.daily,
    selectedDate: date,
    snapshot: {
      temperatureCurrent: weather.current?.temperature_2m ?? weather.hourly.temperature_2m[weatherHourIndex],
      temperatureMin: weather.daily.temperature_2m_min[0],
      temperatureMax: weather.daily.temperature_2m_max[0],
      precipitation: weather.current?.precipitation ?? weather.hourly.precipitation[weatherHourIndex],
      humidity: weather.current?.relative_humidity_2m ?? weather.hourly.relative_humidity_2m[weatherHourIndex],
      uvIndex: weather.current?.uv_index ?? weather.hourly.uv_index[weatherHourIndex],
      sunrise: weather.daily.sunrise[0],
      sunset: weather.daily.sunset[0],
      windSpeedMax: weather.daily.wind_speed_10m_max[0],
      precipitationProbabilityMax: weather.daily.precipitation_probability_max[0],
      aqi: airQuality.current?.us_aqi ?? airQuality.hourly.us_aqi[airHourIndex],
      pm10: airQuality.current?.pm10 ?? airQuality.hourly.pm10[airHourIndex],
      pm2_5: airQuality.current?.pm2_5 ?? airQuality.hourly.pm2_5[airHourIndex],
      co: airQuality.current?.carbon_monoxide ?? airQuality.hourly.carbon_monoxide[airHourIndex],
      co2: airQuality.current?.carbon_dioxide ?? airQuality.hourly.carbon_dioxide[airHourIndex],
      no2: airQuality.current?.nitrogen_dioxide ?? airQuality.hourly.nitrogen_dioxide[airHourIndex],
      so2: airQuality.current?.sulphur_dioxide ?? airQuality.hourly.sulphur_dioxide[airHourIndex],
    },
  };

  weatherCache.set(cacheKey, payload);
  return payload;
}

export async function getHistoricalRange({ latitude, longitude, startDate, endDate, temperatureUnit }) {
  const cacheKey = `${latitude}|${longitude}|${startDate}|${endDate}|${temperatureUnit}`;

  if (historyCache.has(cacheKey)) {
    return historyCache.get(cacheKey);
  }

  const weatherParams = {
    latitude,
    longitude,
    timezone: 'auto',
    start_date: startDate,
    end_date: endDate,
    temperature_unit: temperatureUnit,
    wind_speed_unit: 'kmh',
    daily: [
      'temperature_2m_mean',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'precipitation_sum',
      'wind_speed_10m_max',
      'wind_direction_10m_dominant',
    ],
  };

  const airQualityParams = {
    latitude,
    longitude,
    timezone: 'auto',
    start_date: startDate,
    end_date: endDate,
    hourly: ['pm10', 'pm2_5'],
  };

  const [weather, airQuality] = await Promise.all([
    fetchJson(buildUrl(ARCHIVE_BASE, weatherParams)),
    fetchJson(buildUrl(AIR_QUALITY_BASE, airQualityParams)),
  ]);

  const pm10Daily = aggregateDailyAverage(airQuality.hourly, 'pm10');
  const pm25Daily = aggregateDailyAverage(airQuality.hourly, 'pm2_5');

  const payload = {
    weather,
    airQuality,
    pm10Daily,
    pm25Daily,
    dominantDirectionLabels: weather.daily.wind_direction_10m_dominant.map(getWindDirectionLabel),
  };

  historyCache.set(cacheKey, payload);
  return payload;
}
