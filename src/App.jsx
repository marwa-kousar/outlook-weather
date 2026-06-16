import { useState } from 'react'
import weatherIcon from './assets/outlook-logo.png'
import desktopScene from './assets/outlook-bg-desktop.png'
import LocationSearch from './LocationSearch'
import AskScreen from './AskScreen'
import ResultScreen from './ResultScreen'
import ForecastScreen from './ForecastScreen'
import FullForecastScreen from './FullForecastScreen'
import { fetchWeather, parseWeather } from './weather'
import './App.css'

function App() {
  const [screen, setScreen] = useState('landing')
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState(null)
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState(null)

  async function loadWeather(loc) {
    setWeather(null)
    setWeatherLoading(true)
    setWeatherError(null)
    try {
      const raw = await fetchWeather(loc.lat, loc.lon)
      setWeather(parseWeather(raw))
    } catch {
      setWeatherError('Unable to load weather data.')
    } finally {
      setWeatherLoading(false)
    }
  }

  async function handleLocation(loc) {
    setLocation(loc)
    setScreen('ask')
    loadWeather(loc)
  }

  async function handleChangeLocation(loc) {
    setLocation(loc)
    loadWeather(loc)
  }

  function handleRetry() {
    if (location) loadWeather(location)
  }

  if (screen === 'location') {
    return <LocationSearch onNext={handleLocation} />
  }

  if (screen === 'ask') {
    return <AskScreen onResult={(q) => { setQuery(q); setScreen('result') }} location={location} onChangeLocation={handleChangeLocation} initialQuery={query} />
  }

  if (screen === 'result') {
    return (
      <ResultScreen
        query={query}
        weather={weather}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        location={location}
        onForecast={() => setScreen('forecast')}
        onChangeLocation={handleChangeLocation}
        onRetry={handleRetry}
        onBack={() => setScreen('ask')}
      />
    )
  }

  if (screen === 'forecast') {
    return (
      <ForecastScreen
        weather={weather}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        location={location}
        onBack={() => setScreen('result')}
        onAskAgain={(q) => { setQuery(q); setScreen('result') }}
        onChangeLocation={handleChangeLocation}
        onFullForecast={() => setScreen('fullforecast')}
        onRetry={handleRetry}
      />
    )
  }

  if (screen === 'fullforecast') {
    return (
      <FullForecastScreen
        weather={weather}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        location={location}
        onBack={() => setScreen('forecast')}
        onChangeLocation={handleChangeLocation}
        onRetry={handleRetry}
      />
    )
  }

  return (
    <main className="landing" aria-label="Outlook weather landing page">
      <img
        className="desktop-scene"
        src={desktopScene}
        alt=""
        aria-hidden="true"
      />

      <section className="desktop-layout">
        <header className="desktop-brand">
          <img src={weatherIcon} alt="Outlook weather icon" />
          <p>Outlook</p>
        </header>

        <h1>
          Smart outdoor
          <br />
          recommendations,
          <br />
          <span>made simple.</span>
        </h1>

        <p className="desktop-subtitle">
          Ask anything about the weather
          <br />
          or your outdoor plans and get
          <br />
          clear, personalized recommendations.
        </p>

        <button type="button" className="cta" onClick={() => setScreen('location')}>
          Get Started
        </button>
      </section>

      <section className="mobile-layout">
        <img src={weatherIcon} alt="Outlook weather icon" className="mobile-hero" />
        <h2>Outlook</h2>
        <p className="mobile-subtitle">Smart outdoor recommendations, made simple.</p>
        <button type="button" className="cta" onClick={() => setScreen('location')}>
          Get Started
        </button>
      </section>
    </main>
  )
}

export default App
