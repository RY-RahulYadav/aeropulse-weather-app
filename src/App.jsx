import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useMemo, useState } from 'react';
import Layout from './components/Layout';
import { useGeolocation } from './hooks/useGeolocation';
import CurrentWeatherPage from './pages/CurrentWeatherPage';
import HistoricalPage from './pages/HistoricalPage';

function App() {
  const { location, loading, error, permissionState, requestLocation } = useGeolocation();
  const [manualLocation, setManualLocation] = useState(null);

  const activeLocation = useMemo(() => manualLocation ?? location, [manualLocation, location]);

  function handleLocationSelect(nextLocation) {
    setManualLocation({
      latitude: Number(nextLocation.latitude),
      longitude: Number(nextLocation.longitude),
      label: nextLocation.label,
    });
  }

  function handleRetryGps() {
    setManualLocation(null);
    requestLocation();
  }

  return (
    <BrowserRouter>
      <Layout
        location={activeLocation}
        locationError={error}
        permissionState={permissionState}
        onRetryLocation={handleRetryGps}
        onLocationSelect={handleLocationSelect}
        isGpsLoading={loading && !location}
      >
        <Routes>
          <Route path="/" element={<CurrentWeatherPage location={activeLocation} />} />
          <Route path="/historical" element={<HistoricalPage location={activeLocation} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
