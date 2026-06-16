import { useState } from 'react'
import { getWeatherIcon } from './weatherIcons'
import LocationPill from './LocationPill'
import useCurrentTime from './useCurrentTime'
import { WeatherLoadingState, WeatherErrorState } from './WeatherState'
import './ForecastScreen.css'

const FALLBACK_WEATHER = {
  current: {
    temp: 10, feelsLike: 12, condition: 'Sunny',
    windSpeed: 6, humidity: 48, precipProb: 0, uvIndex: 2,
  },
  hourly: [
    { time: 'Now',   temp: 10 },
    { time: '11 AM', temp: 10 },
    { time: '12 PM', temp: 10 },
    { time: '1 PM',  temp: 10 },
    { time: '2 PM',  temp: 10 },
  ],
}

export default function ForecastScreen({ weather, weatherLoading, weatherError, location, onAskAgain, onChangeLocation, onFullForecast, onRetry, onBack }) {
  const [askQuery, setAskQuery] = useState('')
  const currentTime = useCurrentTime()

  const locationName = location?.display || 'Toronto, ON'

  if (weatherLoading) {
    return (
      <main className="fc-page" aria-label="Full weather forecast">
        <WeatherLoadingState />
      </main>
    )
  }

  if (weatherError) {
    return (
      <main className="fc-page" aria-label="Full weather forecast">
        <WeatherErrorState onRetry={onRetry} />
      </main>
    )
  }

  const w = weather ?? FALLBACK_WEATHER
  const { temp, feelsLike, condition, weatherCode, windSpeed, humidity, precipProb, uvIndex, isDay } = w.current
  const currentIcon = getWeatherIcon(weatherCode ?? 0, isDay ?? true)

  function handleAsk() {
    if (!askQuery.trim()) return
    onAskAgain?.(askQuery.trim())
    setAskQuery('')
  }

  const backBtn = (
    <button className="fc-back-btn" onClick={onBack} aria-label="Go back">
      <svg viewBox="0 0 17 14.73" fill="none" className="fc-back-arrow" aria-hidden="true">
        <path d="M0.293 8.071a1 1 0 0 1 0-1.414L6.657.293a1 1 0 1 1 1.414 1.414L2.778 7.364l5.293 5.657a1 1 0 1 1-1.414 1.414L.293 8.071ZM17 7.364v2H1v-2h16Z" fill="currentColor"/>
      </svg>
      Back
    </button>
  )

  const pill = (
    <div className="fc-top-bar">
      <div className="fc-top-left">
        <LocationPill
          display={locationName}
          onChangeLocation={onChangeLocation}
          className="fc-pill"
        />
        <p className="fc-datetime">{currentTime}</p>
      </div>
      {backBtn}
    </div>
  )

  const card = (
    <div className="fc-card">
      <img src={currentIcon} alt={condition} className="fc-sun-large" />
      <div className="fc-card-main">
        <p className="fc-temp">{temp}°C</p>
        <p className="fc-feels-like">Feels like {feelsLike}°C</p>
        <p className="fc-condition">{condition}</p>
      </div>
      <div className="fc-card-divider" />
      <div className="fc-card-stats">
        <div className="fc-card-stat"><span className="fc-stat-val">{precipProb}%</span><span className="fc-stat-label">Precip.</span></div>
        <div className="fc-card-stat"><span className="fc-stat-val">{windSpeed} mph</span><span className="fc-stat-label">Wind</span></div>
        <div className="fc-card-stat"><span className="fc-stat-val">{humidity}%</span><span className="fc-stat-label">Humidity</span></div>
        <div className="fc-card-stat"><span className="fc-stat-val">{uvIndex}</span><span className="fc-stat-label">UV Index</span></div>
      </div>
    </div>
  )

  const seeForecast = (
    <button className="fc-see-forecast" onClick={() => onFullForecast?.()} aria-label="See full forecast">
      <span>See full forecast</span>
      <svg viewBox="0 0 17 14.73" fill="none" className="fc-see-arrow" aria-hidden="true">
        <path d="M16.707 8.071a1 1 0 0 0 0-1.414L10.343.293a1 1 0 1 0-1.414 1.414L14.586 7.364 8.929 13.021a1 1 0 1 0 1.414 1.414l6.364-6.364ZM0 7.364v2h16v-2H0Z" fill="currentColor"/>
      </svg>
    </button>
  )

  const askBar = (
    <div className="fc-ask-bar">
      <input
        className="fc-ask-input"
        type="text"
        placeholder="Ask another question..."
        aria-label="Ask another question"
        value={askQuery}
        onChange={e => setAskQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAsk()}
      />
      <button type="button" className="fc-ask-send" aria-label="Send" onClick={handleAsk}>
        <svg viewBox="0 0 17 14.73" fill="none" className="fc-ask-arrow" aria-hidden="true">
          <path d="M16.707 8.071a1 1 0 0 0 0-1.414L10.343.293a1 1 0 1 0-1.414 1.414L14.586 7.364 8.929 13.021a1 1 0 1 0 1.414 1.414l6.364-6.364ZM0 7.364v2h16v-2H0Z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  )

  const layout = (
    <>
      {pill}
      <p className="fc-section-heading fc-today">Today</p>
      {card}
      <p className="fc-section-heading fc-hourly-heading">Hourly forecast</p>
      <div className="fc-hourly-list">
        {w.hourly.map(h => (
          <div key={h.time} className="fc-hourly-item">
            <span className="fc-hourly-time">{h.time}</span>
            <img src={getWeatherIcon(h.code, h.isDay ?? true)} alt="" aria-hidden="true" className="fc-sun-small" />
            <span className="fc-hourly-temp">{h.temp}°</span>
          </div>
        ))}
      </div>
      <p className="fc-section-heading fc-upcoming-heading">Upcoming forecast</p>
      {seeForecast}
      {askBar}
    </>
  )

  const desktopLayout = (
    <>
      {pill}
      <div className="fc-d-grid">
        <div className="fc-d-left">
          <p className="fc-section-heading">Today</p>
          {card}
        </div>
        <div className="fc-d-right">
          <p className="fc-section-heading">Hourly forecast</p>
          <div className="fc-d-hourly">
            {w.hourly.map(h => (
              <div key={h.time} className="fc-d-hourly-item">
                <img src={getWeatherIcon(h.code, h.isDay ?? true)} alt="" aria-hidden="true" className="fc-sun-small" />
                <span className="fc-hourly-time">{h.time}</span>
                <span className="fc-hourly-temp">{h.temp}°</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="fc-d-footer">
        <div className="fc-d-upcoming">
          <p className="fc-section-heading">Upcoming forecast</p>
          {seeForecast}
        </div>
        {askBar}
      </div>
    </>
  )

  return (
    <main className="fc-page" aria-label="Full weather forecast">
      <div className="fc-mobile">{layout}</div>
      <div className="fc-desktop">{desktopLayout}</div>
    </main>
  )
}
