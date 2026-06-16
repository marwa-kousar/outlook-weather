import './WeatherState.css'

export function WeatherLoadingState({ query }) {
  return (
    <div className="wstate">
      {query && <p className="wstate-query">&ldquo;{query}&rdquo;</p>}
      <div className="wstate-spinner" aria-label="Loading weather" role="status" />
      <p className="wstate-label">Checking the weather&hellip;</p>
    </div>
  )
}

export function WeatherErrorState({ onRetry }) {
  return (
    <div className="wstate">
      <svg className="wstate-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
        <path d="M12 7v5M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <p className="wstate-error">Couldn&apos;t load weather data.</p>
      <p className="wstate-hint">Check your connection and try again.</p>
      {onRetry && (
        <button className="wstate-retry" onClick={onRetry}>Try again</button>
      )}
    </div>
  )
}
