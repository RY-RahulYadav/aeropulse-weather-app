# Weather Dashboard - ReactJS + Open-Meteo

Responsive weather dashboard built for the frontend selection test.

## Live Features

1. Browser GPS-based location detection on landing.
2. Current weather and hourly visualizations for the selected date.
3. Historical weather exploration with a date range up to 2 years.
4. Mobile-friendly layout and chart readability.
5. Interactive charts with horizontal scrolling, pan, and zoom.

## Tech Stack

1. React + Vite
2. React Router
3. Open-Meteo APIs
4. Chart.js + react-chartjs-2 + chartjs-plugin-zoom
5. Day.js (date formatting and IST conversion)

## API Endpoints Used

1. Forecast and near history: https://api.open-meteo.com/v1/forecast
2. Historical archive: https://archive-api.open-meteo.com/v1/archive
3. Air quality: https://air-quality-api.open-meteo.com/v1/air-quality

## Functional Coverage

### Page 1 - Current Weather & Hourly Forecast

1. Daily cards include:
	 - Temperature: min, max, current
	 - Atmospheric: precipitation, relative humidity, UV index
	 - Sun cycle: sunrise and sunset
	 - Wind & rain probability: max wind speed, precipitation probability max
	 - Air quality: AQI, PM10, PM2.5, CO, NO2, SO2
2. Hourly charts:
	 - Temperature (C/F toggle)
	 - Relative humidity
	 - Precipitation
	 - Visibility
	 - Wind speed 10m
	 - PM10 + PM2.5 (combined)

CO2 is fetched directly from Open-Meteo Air Quality API as carbon_dioxide (ppm).

### Page 2 - Historical Date Range

1. Supports custom date ranges up to 730 days.
2. Charts include:
	 - Temperature mean, max, min
	 - Sunrise and sunset trends in IST
	 - Precipitation totals (bar chart)
	 - Wind max speed and dominant direction
	 - PM10 and PM2.5 trends

## Performance Considerations

1. Parallel API requests via Promise.all.
2. In-memory response caching for repeated date/range queries.
3. Chart animations disabled to improve first paint and responsiveness.
4. Vite production build generated successfully.

## Run Locally

```bash
npm install
npm run dev
```

Build production bundle:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Project Structure

```txt
src/
	api/openMeteo.js
	components/
		ChartPanel.jsx
		Layout.jsx
		MetricCard.jsx
	hooks/
		useGeolocation.js
		useWeatherData.js
	pages/
		CurrentWeatherPage.jsx
		HistoricalPage.jsx
	utils/formatters.js
```

## Deployment

This project can be deployed easily on Netlify, Vercel, or GitHub Pages (Vite static output).
