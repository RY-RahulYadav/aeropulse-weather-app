import dayjs from 'dayjs';
import { BarChart3, CalendarRange, Compass, Gauge } from 'lucide-react';
import { useMemo, useState } from 'react';
import ChartPanel from '../components/ChartPanel';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MetricCard from '../components/MetricCard';
import { useHistoricalWeather } from '../hooks/useWeatherData';
import { clampDateRange, formatDateInput, formatIstTime } from '../utils/formatters';

export default function HistoricalPage({ location }) {
  const today = formatDateInput(new Date());
  const [startDate, setStartDate] = useState(formatDateInput(dayjs().subtract(90, 'day')));
  const [endDate, setEndDate] = useState(today);
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');

  const validation = clampDateRange(startDate, endDate, 730);

  const { data, loading, error } = useHistoricalWeather({
    location,
    startDate,
    endDate,
    temperatureUnit,
    enabled: validation.isValid,
  });

  const symbol = temperatureUnit === 'celsius' ? '°C' : '°F';

  const chartData = useMemo(() => {
    if (!data) {
      return null;
    }

    const labels = data.weather.daily.time;

    const temperatureSeries = labels.map((day, index) => ({
      label: dayjs(day).format('DD MMM'),
      mean: data.weather.daily.temperature_2m_mean[index],
      max: data.weather.daily.temperature_2m_max[index],
      min: data.weather.daily.temperature_2m_min[index],
    }));

    const sunSeries = labels.map((day, index) => {
      const sunrise = dayjs(data.weather.daily.sunrise[index]).tz('Asia/Kolkata');
      const sunset = dayjs(data.weather.daily.sunset[index]).tz('Asia/Kolkata');

      return {
        label: dayjs(day).format('DD MMM'),
        sunrise: sunrise.hour() + sunrise.minute() / 60,
        sunset: sunset.hour() + sunset.minute() / 60,
      };
    });

    const precipitationSeries = labels.map((day, index) => ({
      label: dayjs(day).format('DD MMM'),
      precipitation: data.weather.daily.precipitation_sum[index],
    }));

    const windSeries = labels.map((day, index) => ({
      label: dayjs(day).format('DD MMM'),
      speed: data.weather.daily.wind_speed_10m_max[index],
      direction: data.weather.daily.wind_direction_10m_dominant[index],
    }));

    const airSeries = data.pm10Daily.map((entry, index) => ({
      label: dayjs(entry.date).format('DD MMM'),
      pm10: entry.value,
      pm25: data.pm25Daily[index]?.value ?? 0,
    }));

    return {
      temperatureSeries,
      sunSeries,
      precipitationSeries,
      windSeries,
      airSeries,
    };
  }, [data]);

  if (!location) {
    return <p className="rounded-2xl bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">Waiting for location...</p>;
  }

  if (!validation.isValid) {
    return <p className="rounded-2xl bg-rose-100 p-3 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">{validation.message}</p>;
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <p className="rounded-2xl bg-rose-100 p-3 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">{error}</p>;
  }

  if (!data || !chartData) {
    return null;
  }

  const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;

  return (
    <section className="space-y-4">
      <div className="glass flex flex-wrap items-end gap-3 rounded-3xl p-4">
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Start date
          <input
            type="date"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            max={endDate}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          End date
          <input
            type="date"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            min={startDate}
            max={today}
          />
        </label>

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

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={CalendarRange} title="Selected Range" value={`${totalDays}`} unit="days" tone="info" />
        <MetricCard icon={Gauge} title="First Sunrise (IST)" value={formatIstTime(data.weather.daily.sunrise[0])} trend="down" tone="warm" />
        <MetricCard
          icon={Compass}
          title="Latest Wind Direction"
          value={data.dominantDirectionLabels[data.dominantDirectionLabels.length - 1]}
          trend="down"
          tone="neutral"
        />
        <MetricCard icon={BarChart3} title="Data Density" value={`${data.weather.daily.time.length}`} unit="days" tone="cool" />
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <ChartPanel
          title="Temperature Trends"
          subtitle="Mean, max and min over the selected range"
          data={chartData.temperatureSeries}
          points={chartData.temperatureSeries.length}
          yAxisLabel={symbol}
          series={[
            { key: 'mean', name: 'Mean', color: '#06b6d4' },
            { key: 'max', name: 'Max', color: '#f97316' },
            { key: 'min', name: 'Min', color: '#6366f1' },
          ]}
        />

        <ChartPanel
          title="Sunrise & Sunset (IST)"
          subtitle="Displayed as hour of day in IST"
          data={chartData.sunSeries}
          points={chartData.sunSeries.length}
          yAxisLabel="Hour"
          series={[
            { key: 'sunrise', name: 'Sunrise', color: '#fb923c' },
            { key: 'sunset', name: 'Sunset', color: '#f43f5e' },
          ]}
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <ChartPanel
          title="Precipitation Totals"
          subtitle="Daily precipitation values"
          type="bar"
          data={chartData.precipitationSeries}
          points={chartData.precipitationSeries.length}
          yAxisLabel="mm"
          series={[{ key: 'precipitation', name: 'Precipitation', color: '#0ea5e9' }]}
        />

        <ChartPanel
          title="Wind Speed & Direction"
          subtitle="Daily max speed and dominant direction"
          data={chartData.windSeries}
          points={chartData.windSeries.length}
          yAxisLabel="km/h & deg"
          series={[
            { key: 'speed', name: 'Wind Speed', color: '#10b981' },
            { key: 'direction', name: 'Direction', color: '#8b5cf6' },
          ]}
        />
      </section>

      <ChartPanel
        title="PM10 vs PM2.5"
        subtitle="Air quality trend across the selected date range"
        data={chartData.airSeries}
        points={chartData.airSeries.length}
        yAxisLabel="µg/m³"
        series={[
          { key: 'pm10', name: 'PM10', color: '#0ea5e9' },
          { key: 'pm25', name: 'PM2.5', color: '#f97316' },
        ]}
      />
    </section>
  );
}
