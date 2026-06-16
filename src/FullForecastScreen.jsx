import { getWeatherIcon } from './weatherIcons'
import LocationPill from './LocationPill'
import useCurrentTime from './useCurrentTime'
import { WeatherLoadingState, WeatherErrorState } from './WeatherState'
import './FullForecastScreen.css'

export default function FullForecastScreen({ weather, weatherLoading, weatherError, location, onBack, onChangeLocation, onRetry }) {
  const locationName = location?.display || 'Your location'
  const currentTime = useCurrentTime()

  if (weatherLoading) {
    return (
      <main className="ff-page" aria-label="Full weather forecast">
        <WeatherLoadingState />
      </main>
    )
  }

  if (weatherError) {
    return (
      <main className="ff-page" aria-label="Full weather forecast">
        <WeatherErrorState onRetry={onRetry} />
      </main>
    )
  }

  const hourlyFull = weather?.hourlyFull ?? []
  const dailyForecast = weather?.dailyForecast ?? []

  const hourlySection = (
    <>
      <p className="ff-heading">Hourly forecast</p>
      <div className="ff-hourly-scroll">
        {hourlyFull.map(h => (
          <div key={h.time} className="ff-hourly-item">
            <span className="ff-hourly-time">{h.time}</span>
            <img src={getWeatherIcon(h.code, h.isDay)} alt="" aria-hidden="true" className="ff-hourly-icon" />
            <span className="ff-hourly-temp">{h.temp}°</span>
          </div>
        ))}
      </div>
    </>
  )

  const dailySection = (
    <>
      <p className="ff-heading">7-day forecast</p>
      <div className="ff-daily-list">
        {dailyForecast.map(d => (
          <div key={d.date} className="ff-daily-row">
            <span className="ff-day-name">{d.dayName}</span>
            <img src={getWeatherIcon(d.code, true)} alt={d.condition} className="ff-daily-icon" />
            <span className="ff-daily-condition">{d.condition}</span>
            <div className="ff-daily-temps">
              <span className="ff-temp-max">{d.tempMax}°</span>
              <span className="ff-temp-sep">/</span>
              <span className="ff-temp-min">{d.tempMin}°</span>
            </div>
            <div className="ff-daily-precip">
              <svg viewBox="0 0 10 13" fill="none" className="ff-drop-icon" aria-hidden="true">
                <path d="M5 0L9.33 6.5a4.33 4.33 0 1 1-8.66 0L5 0Z" fill="#42ADE2"/>
              </svg>
              <span>{d.precipProb}%</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )

  return (
    <main className="ff-page" aria-label="Full weather forecast">

      {/* Mobile */}
      <div className="ff-mobile">
        <div className="ff-top-bar">
          <div className="ff-top-left">
            <LocationPill display={locationName} onChangeLocation={onChangeLocation} className="ff-pill" />
            <p className="ff-datetime">{currentTime}</p>
          </div>
          <button className="ff-back-btn" onClick={onBack} aria-label="Go back">
            <svg viewBox="0 0 17 14.73" fill="none" className="ff-back-arrow" aria-hidden="true">
              <path d="M0.293 8.071a1 1 0 0 1 0-1.414L6.657.293a1 1 0 1 1 1.414 1.414L2.778 7.364l5.293 5.657a1 1 0 1 1-1.414 1.414L.293 8.071ZM17 7.364v2H1v-2h16Z" fill="currentColor"/>
            </svg>
            Back
          </button>
        </div>
        {hourlySection}
        {dailySection}
      </div>

      {/* Desktop */}
      <div className="ff-desktop">
        <div className="ff-d-top">
          <div className="ff-top-left">
            <LocationPill display={locationName} onChangeLocation={onChangeLocation} className="ff-pill" />
            <p className="ff-datetime">{currentTime}</p>
          </div>
          <button className="ff-back-btn" onClick={onBack} aria-label="Go back">
            <svg viewBox="0 0 17 14.73" fill="none" className="ff-back-arrow" aria-hidden="true">
              <path d="M0.293 8.071a1 1 0 0 1 0-1.414L6.657.293a1 1 0 1 1 1.414 1.414L2.778 7.364l5.293 5.657a1 1 0 1 1-1.414 1.414L.293 8.071ZM17 7.364v2H1v-2h16Z" fill="currentColor"/>
            </svg>
            Back
          </button>
        </div>
        <div className="ff-d-grid">
          <div className="ff-d-col">
            {hourlySection}
          </div>
          <div className="ff-d-col ff-d-col-right">
            {dailySection}
          </div>
        </div>
      </div>

    </main>
  )
}
