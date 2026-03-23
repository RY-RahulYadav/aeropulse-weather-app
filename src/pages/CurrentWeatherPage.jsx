import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import {
  CloudSun,
  Droplets,
  Gauge,
  Thermometer,
  Wind,
  Waves,
  Radiation,
  Atom,
  LocateFixed,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import ChartPanel from '../components/ChartPanel';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MetricCard from '../components/MetricCard';
import SunCycleTimeline from '../components/SunCycleTimeline';
import { useWeatherForDate } from '../hooks/useWeatherData';
import { formatDateInput, formatValue } from '../utils/formatters';

function getCondition(snapshot) {
  if (snapshot.precipitation > 1.5) {
    return 'Rain likely';
  }

  if (snapshot.humidity > 78) {
    return 'Humid';
  }

  if (snapshot.uvIndex > 7) {
    return 'High UV';
  }

  return 'Partly Cloudy';
}

function getAlerts(snapshot) {
  const alerts = [];

  if (snapshot.uvIndex >= 8) {
    alerts.push('High UV exposure expected.');
  }

  if (snapshot.precipitationProbabilityMax >= 70) {
    alerts.push('High chance of rainfall in this cycle.');
  }

  if (snapshot.temperatureMax >= 35) {
    alerts.push('Heat alert: temperature can feel intense.');
  }

  return alerts;
}

export default function CurrentWeatherPage({ location }) {
  const [selectedDate, setSelectedDate] = useState(formatDateInput(new Date()));
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');

  const { data, loading, error } = useWeatherForDate({
    location,
    selectedDate,
    temperatureUnit,
  });

  const symbol = temperatureUnit === 'celsius' ? '°C' : '°F';

  if (!location) {
    return <p className="rounded-2xl bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">Detecting your GPS location...</p>;
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <p className="rounded-2xl bg-rose-100 p-3 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">{error}</p>;
  }

  if (!data) {
    return null;
  }

  const condition = getCondition(data.snapshot);
  const alerts = getAlerts(data.snapshot);

  const hourlyData = data.weather.hourly.time.map((value, index) => ({
    label: dayjs(value).format('HH:mm'),
    temperature: data.weather.hourly.temperature_2m[index],
    rainProbability: data.weather.hourly.precipitation_probability[index],
  }));

  const weeklyData = (data.weekly.time ?? []).map((value, index) => ({
    label: dayjs(value).format('ddd'),
    max: data.weekly.temperature_2m_max[index],
    min: data.weekly.temperature_2m_min[index],
  }));

  const metricItems = [
    {
      icon: Thermometer,
      title: 'Temperature Min/Max',
      value: `${formatValue(data.snapshot.temperatureMin)} / ${formatValue(data.snapshot.temperatureMax)}`,
      unit: symbol,
      tone: 'warm',
    },
    {
      icon: Droplets,
      title: 'Humidity',
      value: formatValue(data.snapshot.humidity),
      unit: '%',
      tone: 'cool',
    },
    {
      icon: Radiation,
      title: 'UV Index',
      value: formatValue(data.snapshot.uvIndex),
      note: data.snapshot.uvIndex > 7 ? 'Strong sunlight' : 'Normal range',
      tone: 'warm',
    },
    {
      icon: Wind,
      title: 'Wind Speed Max',
      value: formatValue(data.snapshot.windSpeedMax),
      unit: 'km/h',
      tone: 'info',
    },
    {
      icon: Waves,
      title: 'Precipitation',
      value: formatValue(data.snapshot.precipitation),
      unit: 'mm',
      tone: 'cool',
    },
    {
      icon: Gauge,
      title: 'Air Quality Index',
      value: formatValue(data.snapshot.aqi),
      tone: 'neutral',
    },
    {
      icon: Atom,
      title: 'CO2',
      value: formatValue(data.snapshot.co2),
      unit: 'ppm',
      tone: 'neutral',
    },
    {
      icon: LocateFixed,
      title: 'Coordinates',
      value: `${location.latitude}, ${location.longitude}`,
      trend: 'down',
      tone: 'neutral',
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="glass inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Date</span>
          <input
            type="date"
            className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
            value={selectedDate}
            max={formatDateInput(dayjs().add(16, 'day'))}
            min={formatDateInput(dayjs().subtract(92, 'day'))}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </div>

        <div className="glass inline-flex items-center overflow-hidden rounded-2xl">
          <button
            type="button"
            onClick={() => setTemperatureUnit('celsius')}
            className={[
              'px-3 py-2 text-sm font-semibold transition',
              temperatureUnit === 'celsius' ? 'bg-cyan-600 text-white' : 'text-slate-600 dark:text-slate-300',
            ].join(' ')}
          >
            Celsius
          </button>
          <button
            type="button"
            onClick={() => setTemperatureUnit('fahrenheit')}
            className={[
              'px-3 py-2 text-sm font-semibold transition',
              temperatureUnit === 'fahrenheit' ? 'bg-cyan-600 text-white' : 'text-slate-600 dark:text-slate-300',
            ].join(' ')}
          >
            Fahrenheit
          </button>
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass overflow-hidden rounded-3xl p-5"
      >
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Current Weather</p>
              <p className="mt-2 text-5xl font-semibold text-slate-900 dark:text-white">{formatValue(data.snapshot.temperatureCurrent, '', 1)}{symbol}</p>
              <p className="mt-1 inline-flex items-center gap-2 text-base text-slate-600 dark:text-slate-300">
                <CloudSun className="h-5 w-5 text-cyan-500" />
                {condition}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Feels like {formatValue(data.snapshot.temperatureCurrent + 0.8)}{symbol}</p>
            </div>
            <div className="w-full rounded-2xl bg-white/70 p-3 text-center shadow-sm sm:w-auto sm:self-center sm:text-right dark:bg-slate-800/50">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Local Timezone</p>
              <p className="mt-1 text-lg font-semibold">{data.weather.timezone}</p>
              <p className="text-xs text-slate-500">{dayjs().format('ddd, DD MMM HH:mm')}</p>
            </div>
          </div>
        </div>
      </motion.section>

      {alerts.length > 0 ? (
        <section className="glass rounded-3xl p-3">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </p>
          <div className="grid gap-2">
            {alerts.map((item) => (
              <p key={item} className="rounded-2xl bg-amber-100/70 px-3 py-2 text-sm text-amber-900 dark:bg-amber-300/10 dark:text-amber-200">
                {item}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricItems.map((item) => (
          <MetricCard key={item.title} {...item} />
        ))}
      </section>

      <SunCycleTimeline sunrise={data.snapshot.sunrise} sunset={data.snapshot.sunset} />

      <section className="grid gap-3 xl:grid-cols-2">
        <ChartPanel
          title="Hourly Temperature"
          subtitle="Smooth hourly trend across selected day"
          yAxisLabel={symbol}
          data={hourlyData}
          points={hourlyData.length}
          series={[{ key: 'temperature', name: `Temperature (${symbol})`, color: '#0891b2' }]}
        />

        <ChartPanel
          title="Rain Probability"
          subtitle="Precipitation risk by hour"
          yAxisLabel="%"
          data={hourlyData}
          points={hourlyData.length}
          series={[{ key: 'rainProbability', name: 'Rain Probability', color: '#6366f1' }]}
        />
      </section>

      <ChartPanel
        title="Weekly Forecast"
        subtitle="Max and min temperature outlook"
        yAxisLabel={symbol}
        data={weeklyData}
        points={weeklyData.length}
        type="bar"
        series={[
          { key: 'max', name: 'Max Temp', color: '#f97316' },
          { key: 'min', name: 'Min Temp', color: '#0ea5e9' },
        ]}
      />
    </section>
  );
}
