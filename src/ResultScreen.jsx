import { useMemo } from 'react'
import { WeatherLoadingState, WeatherErrorState } from './WeatherState'
import iconRunner from './assets/icon-runner.svg'
import LocationPill from './LocationPill'
import iconRun from './assets/icon-run.svg'
import iconBike from './assets/icon-bike.svg'
import iconParty from './assets/icon-party.svg'
import iconCanoe from './assets/icon-canoe.svg'
import scoreCircle from './assets/score-circle.svg'
import iconStatTemp from './assets/icon-stat-temp.svg'
import iconStatPrecip from './assets/icon-stat-precip.svg'
import iconStatWind from './assets/icon-stat-wind.svg'
import iconStatHumidity from './assets/icon-stat-humidity.svg'
import iconStatUV from './assets/icon-stat-uv.svg'

const STAT_ICONS = {
  Temperature: iconStatTemp,
  Precipitation: iconStatPrecip,
  Wind: iconStatWind,
  Humidity: iconStatHumidity,
  'UV Index': iconStatUV,
}
import { scoreQuery } from './weather'
import './ResultScreen.css'

const ACTIVITY_ICON = {
  run:   iconRunner,
  bike:  iconBike,
  party: iconParty,
  canoe: iconCanoe,
  other: iconRun,
}

const FALLBACK = {
  answer: 'Go for it!',
  tier: 'high',
  score: 8.5,
  description: 'Cooler temps and low humidity make for ideal running conditions.',
  stats: [
    { label: 'Temperature',   value: '10°C',   rating: 'Ideal' },
    { label: 'Precipitation', value: '0%',     rating: 'Great' },
    { label: 'Wind',          value: '6 mph',  rating: 'Good'  },
    { label: 'Humidity',      value: '48%',    rating: 'Good'  },
    { label: 'UV Index',      value: '2',      rating: 'Low'   },
  ],
}

export default function ResultScreen({ query, weather, weatherLoading, weatherError, location, onForecast, onChangeLocation, onRetry, onBack }) {
  const displayQuery = query || 'Is today a good day for a run?'
  const locationName = location?.display || 'Toronto, ON'
  const result = useMemo(
    () => weather ? scoreQuery(displayQuery, weather) : null,
    [weather, displayQuery]
  )

  if (weatherLoading) {
    return (
      <main className="res-page" aria-label="Weather results">
        <WeatherLoadingState query={displayQuery} />
      </main>
    )
  }

  if (weatherError) {
    return (
      <main className="res-page" aria-label="Weather results">
        <WeatherErrorState onRetry={onRetry} />
      </main>
    )
  }

  const { answer, tier, score, description, stats, activity } = result ?? { ...FALLBACK, activity: 'run' }
  const activityIcon = ACTIVITY_ICON[activity] ?? iconRunner

  const pill = (
    <LocationPill
      display={locationName}
      onChangeLocation={onChangeLocation}
      className="res-pill"
    />
  )

  const scoreBlock = (
    <div className="res-score-wrap">
      <img src={scoreCircle} alt="score ring" className="res-score-ring" />
      <div className="res-score-text">
        <span className="res-score-num">{score}</span>
        <span className="res-score-denom">/10</span>
      </div>
    </div>
  )

  const statsBlock = (
    <div className="res-stats">
      {stats.map(stat => (
        <div className="res-stat" key={stat.label}>
          <img src={STAT_ICONS[stat.label]} alt="" aria-hidden="true" className="res-stat-icon" />
          <span className="res-stat-label">{stat.label}</span>
          <span className="res-stat-value">{stat.value}</span>
          <span className="res-stat-rating">{stat.rating}</span>
        </div>
      ))}
    </div>
  )

  const cta = (cls = '') => (
    <button type="button" className={`res-cta ${cls}`} onClick={onForecast}>
      <span>See full forecast</span>
      <svg viewBox="0 0 17 14.73" fill="none" className="res-cta-arrow" aria-hidden="true">
        <path d="M16.707 8.071a1 1 0 0 0 0-1.414L10.343.293a1 1 0 1 0-1.414 1.414L14.586 7.364 8.929 13.021a1 1 0 1 0 1.414 1.414l6.364-6.364ZM0 7.364v2h16v-2H0Z" fill="currentColor"/>
      </svg>
    </button>
  )

  const bubble = (
    <button className="res-bubble" onClick={onBack} aria-label="Edit question">
      <p>{displayQuery}</p>
      <svg className="res-bubble-edit" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M11.5 1.5 14.5 4.5 5 14H2v-3L11.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )

  const layout = (
    <>
      {pill}
      {bubble}
      <p className="res-short-label">Short answer</p>
      <div className="res-answer-row">
        <span className="res-yes" data-tier={tier}>{answer}</span>
        <img src={activityIcon} alt="" aria-hidden="true" className="res-runner" />
      </div>
      <p className="res-description">{description}</p>
      {scoreBlock}
      {statsBlock}
      {cta()}
    </>
  )

  const desktopLayout = (
    <>
      {pill}
      <div className="res-d-grid">
        <div className="res-d-left">
          {bubble}
          <p className="res-short-label">Short answer</p>
          <div className="res-answer-row">
            <span className="res-yes" data-tier={tier}>{answer}</span>
            <img src={activityIcon} alt="" aria-hidden="true" className="res-runner" />
          </div>
          <p className="res-description">{description}</p>
        </div>
        <div className="res-d-right">
          {scoreBlock}
          {statsBlock}
        </div>
      </div>
      {cta('res-d-cta')}
    </>
  )

  return (
    <main className="res-page" aria-label="Weather results">
      <div className="res-mobile">{layout}</div>
      <div className="res-desktop">{desktopLayout}</div>
    </main>
  )
}
